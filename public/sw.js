const CACHE = "mindgpt-shell-v2";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      for (const k of await caches.keys())
        if (k !== CACHE) await caches.delete(k);
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener("fetch", (event) => {
  const u = new URL(event.request.url);
  if (
    event.request.method !== "GET" ||
    u.origin !== self.location.origin ||
    u.pathname.startsWith("/api/")
  )
    return;
  if (
    u.pathname.startsWith("/fonts/") ||
    u.pathname.startsWith("/icon-") ||
    u.pathname === "/favicon.svg" ||
    u.pathname === "/favicon.png" ||
    u.pathname.startsWith("/logo-")
  )
    event.respondWith(
      caches.open(CACHE).then(async (c) => {
        const found = await c.match(event.request);
        if (found) return found;
        const r = await fetch(event.request);
        if (r.ok) c.put(event.request, r.clone());
        return r;
      }),
    );
});
