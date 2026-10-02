import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { accountOwner } from "./identity";
type Runtime = {
  DB: D1Database;
  BUCKET: R2Bucket;
  CODECRAFT_API_KEY?: string;
  CODECRAFT_BASE_URL?: string;
};
export const runtime = () => env as unknown as Runtime;
export const database = () => {
  const d = runtime().DB;
  if (!d) throw new Error("Storage is unavailable");
  return d;
};
export async function platformUser(req: Request) {
  // These identity headers are trustworthy only behind Sites dispatch.
  if (!new URL(req.url).hostname.endsWith(".chatgpt.site")) return null;
  return getChatGPTUser();
}
export async function session(req: Request) {
  const user = await platformUser(req);
  if (user) return accountOwner(user.userId);
  const id = req.headers
    .get("cookie")
    ?.match(/(?:^|;\s*)mind_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (!id) throw new Error("SESSION_REQUIRED");
  return id;
}
export function json(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}
export function mutation(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin)
    throw new Error("ORIGIN_REJECTED");
}
export async function upstream(path: string, init: RequestInit = {}) {
  const r = runtime();
  const key = r.CODECRAFT_API_KEY;
  if (!key) throw new Error("API_KEY_MISSING");
  const base = (r.CODECRAFT_BASE_URL || "https://codecraftapi.com/v1").replace(
    /\/$/,
    "",
  );
  return fetch(base + path, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, ...(init.headers || {}) },
    signal: init.signal || AbortSignal.timeout(90000),
  });
}
export async function apiError(r: Response) {
  let message = "";
  let blocked = false;
  try {
    const j = (await r.json()) as any;
    blocked =
      j?.error_code === 1010 || j?.error_name === "browser_signature_banned";
    message = String(j?.error?.message || j?.message || "").slice(0, 250);
    const secret = runtime().CODECRAFT_API_KEY;
    if (secret) message = message.replaceAll(secret, "[redacted]");
  } catch {}
  return json(
    {
      error: blocked
        ? "CodeCraft's security filter blocked this connection (403). Ask service support to allow server access."
        : r.status === 401
          ? "API key was rejected."
          : r.status === 403
            ? "CodeCraft refused this request (403). Check the key permissions or service access."
            : r.status === 429
              ? "Service limit reached. Please try again later."
              : r.status === 402
                ? "API credit is insufficient."
                : message || `AI service returned ${r.status}.`,
      code: r.status,
    },
    r.status >= 400 ? r.status : 502,
  );
}
let modelsCache: { until: number; data: any[] } | null = null;
export async function models() {
  if (modelsCache && Date.now() < modelsCache.until) return modelsCache.data;
  const r = await upstream("/models");
  if (!r.ok)
    throw Object.assign(new Error("MODEL_SERVICE_ERROR"), { response: r });
  const j = (await r.json()) as any;
  if (!Array.isArray(j.data)) throw new Error("Invalid model response");
  modelsCache = { until: Date.now() + 180000, data: j.data };
  return j.data;
}

