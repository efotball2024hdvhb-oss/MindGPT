// Account owners occupy a separate namespace from 64-character guest cookies.
export async function accountOwner(userId: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode("MindGPT:account:" + userId),
  );
  return (
    "account_" +
    Array.from(new Uint8Array(digest), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("")
  );
}
