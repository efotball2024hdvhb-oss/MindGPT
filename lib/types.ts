export type Asset = {
  id: string;
  name: string;
  mime: string;
  size: number;
  created: number;
};
export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created: number;
  attachments?: Asset[];
  error?: string;
  model?: string;
  feedback?: "up" | "down";
  stopped?: boolean;
};
export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  created: number;
  updated: number;
  pinned?: boolean;
  archived?: boolean;
  project?: string;
};
export type Model = {
  id: string;
  name?: string;
  description?: string;
  type?: string;
  capabilities?: string[];
  context_window?: number;
};
export type Profile = {
  language?: "fa" | "en";
  theme?: "dark" | "light" | "system";
  model?: string;
  haptics?: boolean;
  instructions?: string;
  voiceRate?: string;
  projects?: { id: string; name: string }[];
  tasks?: { id: string; text: string; at: string }[];
};
export async function api(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<any> {
  const r = await fetch("/api/" + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const j: any = await r.json();
  if (!r.ok) throw new Error(j.error || "Request failed");
  return j;
}
export const uid = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
export const plain = (s: string) =>
  s
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*#_`>]/g, "");
