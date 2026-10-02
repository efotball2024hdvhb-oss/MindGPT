// CodeCraft's OpenAI-compatible Chat Completions protocol. No fabricated events.
export type Source = {
  url: string;
  title: string;
  start?: number;
  end?: number;
};
export type CompletionUpdate = {
  content: string;
  reasoning: string;
  sources: Source[];
  finishReason?: string;
};

export function safeSourceUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password
      ? url.href : null;
  } catch { return null; }
}

function textContent(value: unknown): string {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  return value.map((part) => typeof part?.text === "string" ? part.text : "").join("");
}

export function completionUpdate(data: any): CompletionUpdate {
  if (data?.error) throw new Error(
    typeof data.error === "string" ? data.error : data.error.message || "Stream failed",
  );
  const choice = data?.choices?.[0];
  const message = choice?.delta || choice?.message || {};
  const sources: Source[] = [];
  const annotations = [
    ...(Array.isArray(message.annotations) ? message.annotations : []),
    ...(Array.isArray(data?.citations) ? data.citations : []),
    ...(Array.isArray(message.citations) ? message.citations : []),
  ];
  for (const item of annotations) {
    const citation = item?.url_citation || item;
    const url = safeSourceUrl(typeof citation === "string" ? citation : citation?.url);
    if (!url) continue;
    const title = typeof citation?.title === "string" && citation.title.trim()
      ? citation.title.slice(0, 300) : new URL(url).hostname;
    const start = citation?.start_index;
    const end = citation?.end_index;
    sources.push({ url, title, ...(Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end > start ? { start, end } : {}) });
  }
  return {
    content: textContent(message.content) || textContent(message.refusal),
    reasoning: textContent(message.reasoning_content),
    sources,
    ...(typeof choice?.finish_reason === "string" ? { finishReason: choice.finish_reason } : {}),
  };
}

export function mergeSources(current: Source[], added: Source[]): Source[] {
  const result = [...current];
  for (const source of added) {
    const index = result.findIndex((x) => x.url === source.url && x.start === source.start && x.end === source.end);
    if (index < 0 && result.length < 100) result.push(source);
    else if (index >= 0) result[index] = source;
  }
  return result;
}

export function citedMarkdown(content: string, sources: Source[] = []): string {
  const urls = [...new Set(sources.map((s) => safeSourceUrl(s.url)).filter(Boolean))];
  const citations = new Map<number, Set<string>>();
  for (const source of sources) {
    const url = safeSourceUrl(source.url);
    if (!url || source.end === undefined || source.start === undefined || source.end > content.length) continue;
    const span = content.slice(source.start, source.end);
    if (span.includes("](")) continue;
    const links = citations.get(source.end) || new Set<string>();
    links.add(` [${urls.indexOf(url) + 1}](<${url.replaceAll(">", "%3E").replaceAll("<", "%3C")}>)`);
    citations.set(source.end, links);
  }
  let result = content;
  for (const [end, links] of [...citations].sort(([a], [b]) => b - a))
    result = result.slice(0, end) + [...links].join("") + result.slice(end);
  return result;
}

export async function readCompletion(response: Response, onUpdate: (update: CompletionUpdate) => void) {
  if (!response.ok) {
    let message = `AI service returned ${response.status}.`;
    try {
      const data: any = await response.json();
      message = typeof data.error === "string" ? data.error : data.error?.message || message;
    } catch {}
    throw new Error(message);
  }
  if (!response.headers.get("content-type")?.includes("text/event-stream")) {
    onUpdate(completionUpdate(await response.json()));
    return;
  }
  if (!response.body) throw new Error("The service returned an empty response.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "", eventLines: string[] = [], doneSeen = false, finishSeen = false;
  let total = 0;
  function dispatch() {
    if (!eventLines.length) return;
    const raw = eventLines.join("\n");
    eventLines = [];
    if (raw.trim() === "[DONE]") { doneSeen = true; return; }
    if (!raw.trim()) return;
    let data: unknown;
    try { data = JSON.parse(raw); }
    catch { throw new Error("The service returned an invalid stream. Please retry."); }
    const update = completionUpdate(data);
    if (update.finishReason) finishSeen = true;
    onUpdate(update);
  }
  function line(raw: string) {
    const value = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
    if (!value) dispatch();
    else if (value.startsWith("data:")) eventLines.push(value.slice(5).replace(/^ /, ""));
  }
  try {
    while (!doneSeen) {
      const { value, done } = await reader.read();
      total += value?.byteLength || 0;
      if (total > 8 * 1024 * 1024) throw new Error("The response is too large. Ask for a shorter answer.");
      buffer += decoder.decode(value, { stream: !done });
      let end: number;
      while (!doneSeen && (end = buffer.indexOf("\n")) >= 0) {
        line(buffer.slice(0, end));
        buffer = buffer.slice(end + 1);
      }
      if (done) {
        if (!doneSeen && buffer) line(buffer);
        if (!doneSeen) dispatch();
        break;
      }
    }
    if (!doneSeen && !finishSeen) throw new Error("Connection ended before the response finished. Your partial answer has been kept.");
  } finally {
    try { await reader.cancel(); } catch {}
    reader.releaseLock();
  }
}
