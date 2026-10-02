export function validTemporaryConversation(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const messages = (value as { messages?: unknown }).messages;
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 600)
    return false;
  if (JSON.stringify(value).length > 1500000) return false;
  return messages.every(
    (m) =>
      m &&
      typeof m === "object" &&
      ["user", "assistant"].includes(m.role) &&
      typeof m.content === "string" &&
      m.content.length <= 100000 &&
      (!m.attachments ||
        (Array.isArray(m.attachments) &&
          m.attachments.length <= 4 &&
          m.attachments.every((a: any) => typeof a?.id === "string"))),
  );
}
