// Local integration fixture. Never imported by production code.
export function fixture(path: string, init: RequestInit = {}) {
  const models = [
    { id: "qa-chat", name: "QA Chat · test fixture", type: "chat", capabilities: ["streaming", "vision", "reasoning"], context_window: 128000 },
    { id: "qa-web", name: "QA Web · test fixture", type: "chat", capabilities: ["streaming", "web_search", "reasoning"] },
    { id: "qa-embedding", name: "QA Embedding", type: "embedding", capabilities: [] },
  ];
  if (path === "/models") return Response.json({ data: models });
  if (path !== "/chat/completions") return Response.json({ error: "Unknown fixture path" }, { status: 404 });
  const body = JSON.parse(String(init.body));
  const last = body.messages.at(-1)?.content;
  const text = typeof last === "string" ? last : last?.find((x: any) => x.type === "text")?.text || "";
  if (text.includes("error-test")) return Response.json({ error: { message: "Mock rate limit" } }, { status: 429 });
  const response = "این پاسخِ آزمایشی برای بررسی رابط است.\n\n**پیام دریافت شد:** " + text.slice(0, 70) + "\n\n۲۲٫۲ متر بر ثانیه.\n\n- دریافت تدریجی پاسخ\n- نگهداری گفتگو\n";
  const events: any[] = [];
  if (body.max_tokens === 16000) {
    const reasoning = "این متن آزمایشی از فیلد reasoning_content می‌آید؛ پاسخ واقعی هوش مصنوعی نیست. تبدیل واحد و محاسبه بررسی می‌شود.";
    for (const chunk of reasoning.match(/[\s\S]{1,9}/g)!) events.push({ choices: [{ delta: { reasoning_content: chunk } }] });
  }
  if (!text.includes("reasoning-only")) {
    for (const chunk of response.match(/[\s\S]{1,9}/g)!) events.push({ choices: [{ delta: { content: chunk } }] });
  }
  if (body.model === "qa-web") events.push({ choices: [{ delta: { annotations: [{ type: "url_citation", url_citation: { url: "https://science.nasa.gov/moon/", title: "Moon — NASA (test source)", start_index: 0, end_index: response.indexOf("\n\n") } }] } }] });
  if (!text.includes("interrupt-test")) events.push({ choices: [{ delta: {}, finish_reason: text.includes("reasoning-only") ? "length" : "stop" }] });
  let i = 0;
  let timer: ReturnType<typeof setInterval>;
  return new Response(new ReadableStream({
    start(controller) {
      timer = setInterval(() => {
        if (init.signal?.aborted) { clearInterval(timer); controller.close(); return; }
        if (i < events.length) controller.enqueue(new TextEncoder().encode("data: " + JSON.stringify(events[i++]) + "\r\n\r\n"));
        else {
          clearInterval(timer);
          if (!text.includes("interrupt-test")) controller.enqueue(new TextEncoder().encode("data: [DONE]\r\n\r\n"));
          controller.close();
        }
      }, text.includes("slow-test") ? 200 : 55);
    },
    cancel() { clearInterval(timer); },
  }), { headers: { "Content-Type": "text/event-stream" } });
}
