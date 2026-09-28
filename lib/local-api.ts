/**
 * Standalone (APK) mode: replaces the Cloudflare server with an on-device
 * implementation. Chats, profile and files live in IndexedDB; the model API
 * is called directly with the key the user enters in Settings.
 */
const DB_NAME = "mindgpt";
const KEY_STORAGE = "mindgpt-api-key";
const BASE_STORAGE = "mindgpt-base-url";
const DEFAULT_BASE = "https://codecraftapi.com/v1";

type StoredAsset = {
  id: string;
  name: string;
  mime: string;
  size: number;
  created: number;
  extracted: string;
  blob: Blob;
};

const urls = new Map<string, string>();
let dbPromise: Promise<IDBDatabase> | null = null;
let modelsCache: { until: number; data: any[] } | null = null;

export const isLocal = () =>
  typeof window !== "undefined" && !!(window as any).__MINDGPT_LOCAL__;

export function fileUrl(id?: string) {
  if (!id) return "";
  if (!isLocal()) return "/api/files/" + id;
  return urls.get(id) || "";
}

export const getApiKey = () => localStorage.getItem(KEY_STORAGE) || "";
export const getBaseUrl = () =>
  localStorage.getItem(BASE_STORAGE) || DEFAULT_BASE;
export function setApiConfig(key: string, base: string) {
  localStorage.setItem(KEY_STORAGE, key.trim());
  localStorage.setItem(BASE_STORAGE, (base.trim() || DEFAULT_BASE).replace(/\/$/, ""));
  modelsCache = null;
}

function open(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      db.createObjectStore("kv");
      db.createObjectStore("chats", { keyPath: "id" });
      db.createObjectStore("assets", { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest,
): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const r = fn(db.transaction(store, mode).objectStore(store));
    r.onsuccess = () => resolve(r.result as T);
    r.onerror = () => reject(r.error);
  });
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

function friendly(status: number, message = "") {
  return status === 401
    ? "API key was rejected. Check it in Settings."
    : status === 403
      ? "The AI service refused this request (403). Check the key."
      : status === 429
        ? "Service limit reached. Please try again later."
        : status === 402
          ? "API credit is insufficient."
          : message || `AI service returned ${status}.`;
}

/** Direct fetch; if the WebView blocks it (CORS), retry through Capacitor's native HTTP. */
async function upstream(path: string, init: { method?: string; body?: any; signal?: AbortSignal } = {}) {
  const key = getApiKey();
  if (!key) throw new Error("Add your API key in Settings → Model first.");
  const url = getBaseUrl() + path;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  try {
    return await fetchOriginal(url, {
      method: init.method || "GET",
      headers,
      body: init.body ? JSON.stringify(init.body) : undefined,
      signal: init.signal,
    });
  } catch (e: any) {
    if (e?.name === "AbortError") throw e;
    const native = (window as any).Capacitor?.Plugins?.CapacitorHttp;
    if (!native) throw new Error("Could not reach the AI service. Check your internet connection.");
    const body = init.body ? { ...init.body, stream: false } : undefined;
    const r = await native.request({
      url,
      method: init.method || "GET",
      headers,
      data: body,
      readTimeout: 120000,
      connectTimeout: 20000,
    });
    const text = typeof r.data === "string" ? r.data : JSON.stringify(r.data);
    return new Response(text, {
      status: r.status,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function errorFrom(r: Response) {
  let message = "";
  try {
    const j: any = await r.json();
    message = String(j?.error?.message || j?.message || "").slice(0, 250);
  } catch {}
  return json({ error: friendly(r.status, message), code: r.status }, r.status >= 400 ? r.status : 502);
}

async function models() {
  if (modelsCache && Date.now() < modelsCache.until) return modelsCache.data;
  const r = await upstream("/models");
  if (!r.ok) throw Object.assign(new Error("MODEL_SERVICE_ERROR"), { response: r });
  const j: any = await r.json();
  if (!Array.isArray(j.data)) throw new Error("Invalid model response");
  modelsCache = { until: Date.now() + 180000, data: j.data };
  return j.data as any[];
}

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

async function handle(url: URL, init: RequestInit = {}): Promise<Response> {
  const path = url.pathname.replace(/^\/api\//, "").split("/");
  const route = path[0];
  const method = (init.method || "GET").toUpperCase();

  if (route === "bootstrap") {
    const [chats, assets, profile] = await Promise.all([
      tx<any[]>("chats", "readonly", (s) => s.getAll()),
      tx<StoredAsset[]>("assets", "readonly", (s) => s.getAll()),
      tx<any>("kv", "readonly", (s) => s.get("profile")),
    ]);
    for (const a of assets) if (!urls.has(a.id)) urls.set(a.id, URL.createObjectURL(a.blob));
    return json({
      chats: chats.sort((a, b) => (b.updated || 0) - (a.updated || 0)),
      profile: profile || {},
      assets: assets
        .sort((a, b) => b.created - a.created)
        .map(({ id, name, mime, size, created }) => ({ id, name, mime, size, created })),
    });
  }
  if (route === "models" && method === "GET") return json({ data: await models() });
  if (route === "profile" && method === "POST") {
    await tx("kv", "readwrite", (s) => s.put(JSON.parse(String(init.body)), "profile"));
    return json({ ok: true });
  }
  if (route === "chats" && method === "POST") {
    const c = JSON.parse(String(init.body));
    if (!c.id || !Array.isArray(c.messages)) return json({ error: "Invalid conversation" }, 400);
    c.updated = c.updated || Date.now();
    await tx("chats", "readwrite", (s) => s.put(c));
    return json({ ok: true });
  }
  if (route === "chats" && method === "DELETE") {
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "Missing id" }, 400);
    await tx("chats", "readwrite", (s) => s.delete(id));
    return json({ ok: true });
  }
  if (route === "upload" && method === "POST") {
    const form = init.body as FormData;
    const f = form.get("file");
    if (!(f instanceof File) || f.size > 10 * 1024 * 1024)
      return json({ error: "Choose a file smaller than 10 MB" }, 400);
    const a: StoredAsset = {
      id: crypto.randomUUID(),
      name: f.name.slice(0, 180),
      mime: f.type || "application/octet-stream",
      size: f.size,
      created: Date.now(),
      extracted: String(form.get("extracted") || "").slice(0, 80000),
      blob: f,
    };
    await tx("assets", "readwrite", (s) => s.put(a));
    urls.set(a.id, URL.createObjectURL(f));
    return json({ id: a.id, name: a.name, mime: a.mime, size: a.size, created: a.created });
  }
  if (route === "files" && path[1]) {
    const a = await tx<StoredAsset | undefined>("assets", "readonly", (s) => s.get(path[1]));
    if (!a) return json({ error: "File not found" }, 404);
    if (method === "DELETE") {
      await tx("assets", "readwrite", (s) => s.delete(a.id));
      const u = urls.get(a.id);
      if (u) URL.revokeObjectURL(u);
      urls.delete(a.id);
      return json({ ok: true });
    }
    return new Response(a.blob, { headers: { "Content-Type": a.mime } });
  }
  if (route === "generate" && method === "POST") {
    const b = JSON.parse(String(init.body));
    const all = await models();
    const model = all.find((m: any) => m.id === b.model);
    if (!model || model.type === "embedding")
      return json({ error: "Select an available chat model in Settings." }, 400);
    const caps: string[] = model.capabilities || [];
    if (b.web && !caps.includes("web_search"))
      return json({ error: "Choose a model with built-in web search." }, 400);
    const conversation = await tx<any>("chats", "readonly", (s) => s.get(b.chatId));
    if (!conversation) return json({ error: "Conversation not found" }, 404);
    const messages: any[] = [
      {
        role: "system",
        content: `You are MindGPT, an independent AI assistant. Respond in the language of the user. Format clearly using Markdown. Never claim to browse the web unless your model actually provides live search. ${b.web ? "Use your built-in web search for this answer and cite actual source URLs." : ""} ${b.reasoning ? "Work carefully and give a clear, well-checked answer. Do not reveal hidden chain of thought." : ""} ${String(b.instructions || "").slice(0, 3000)}`,
      },
    ];
    let imageBytes = 0;
    for (const m of conversation.messages.slice(-80)) {
      if (!["user", "assistant"].includes(m.role) || m.error || (!m.content && !m.attachments?.length)) continue;
      let text = String(m.content || "").slice(0, 100000);
      const images: any[] = [];
      for (const file of (m.attachments || []).slice(0, 4)) {
        const a = await tx<StoredAsset | undefined>("assets", "readonly", (s) => s.get(file.id));
        if (!a) continue;
        if (/^image\/(png|jpeg|webp|gif)$/.test(a.mime)) {
          imageBytes += a.size;
          if (imageBytes > 8 * 1024 * 1024)
            return json({ error: "Images in this conversation exceed 8 MB. Start a new chat." }, 413);
          if (!caps.includes("vision"))
            return json({ error: "This model cannot read images. Select a model with Vision." }, 400);
          images.push({ type: "image_url", image_url: { url: await toBase64(a.blob) } });
        } else if (a.extracted)
          text += `\n\n<attachment name=${JSON.stringify(a.name)}>\n${a.extracted}\n</attachment>`;
        else return json({ error: `Text could not be extracted from ${a.name}.` }, 400);
      }
      messages.push({ role: m.role, content: images.length ? [{ type: "text", text }, ...images] : text });
    }
    const stream = caps.includes("streaming");
    const r = await upstream("/chat/completions", {
      method: "POST",
      body: { model: model.id, messages, stream, max_tokens: 8192 },
      signal: init.signal || undefined,
    });
    if (!r.ok) return errorFrom(r);
    return r;
  }
  return json({ error: "Not found" }, 404);
}

let fetchOriginal: (input: any, init?: any) => Promise<Response> = (i, o) => fetch(i, o);

export function installLocalApi() {
  if (typeof window === "undefined" || (window as any).__MINDGPT_LOCAL__) return;
  (window as any).__MINDGPT_LOCAL__ = true;
  const native = window.fetch.bind(window);
  fetchOriginal = native;
  (window as any).fetch = async (input: any, init?: RequestInit) => {
    const raw: string =
      typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(raw, location.href);
    if (url.origin === location.origin && url.pathname.startsWith("/api/")) {
      try {
        return await handle(url, init);
      } catch (e: any) {
        if (e?.name === "AbortError") throw e;
        if (e?.response) return errorFrom(e.response);
        return json({ error: e?.message || "Something went wrong." }, 503);
      }
    }
    return native(input, init);
  };
}
