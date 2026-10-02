import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
// Load the pure protocol modules without building or starting the application.
async function load(relative) {
  const source = await readFile(new URL(relative, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
const { readCompletion, completionUpdate, mergeSources, safeSourceUrl, citedMarkdown } = await load("../lib/chat-protocol.ts");
const { selectModeModel, supportsMode } = await load("../lib/model-selection.ts");
function sse(text, split = 7) {
  const bytes = new TextEncoder().encode(text);
  return new Response(new ReadableStream({ start(controller) {
    for (let i = 0; i < bytes.length; i += split) controller.enqueue(bytes.slice(i, i + split));
    controller.close();
  }}), { headers: { "Content-Type": "text/event-stream" } });
}
const event = (delta, finish_reason = null) => `data: ${JSON.stringify({ choices: [{ delta, finish_reason }] })}\n\n`;

test("split UTF-8, CRLF, comments, reasoning, answer and finish remain distinct", async () => {
  const result = [];
  const response = sse((": keepalive\n\n" + event({ reasoning_content: "محاسبهٔ مدل" }) + event({ content: "۲۲٫۲ متر" }) + event({}, "stop") + "data: [DONE]\n\n").replaceAll("\n", "\r\n"), 1);
  await readCompletion(response, (x) => result.push(x));
  assert.equal(result.map((x) => x.reasoning).join(""), "محاسبهٔ مدل");
  assert.equal(result.map((x) => x.content).join(""), "۲۲٫۲ متر");
  assert.equal(result.at(-1).finishReason, "stop");
});
test("multiline SSE data and terminal event without final newline", async () => {
  const result = [];
  await readCompletion(sse('data: {"choices":\ndata: [{"delta":{"content":"OK"},"finish_reason":"stop"}]}'), (x) => result.push(x));
  assert.equal(result[0].content, "OK");
});
test("JSON responses include reasoning, refusal, citations and finish reason", async () => {
  let result;
  await readCompletion(Response.json({ choices: [{ message: { content: [{ type: "text", text: "Moon" }], reasoning_content: "Checked", annotations: [{ type: "url_citation", url_citation: { url: "https://science.nasa.gov/moon/", title: "Moon", start_index: 0, end_index: 4 } }] }, finish_reason: "length" }] }), (x) => result = x);
  assert.equal(result.content, "Moon"); assert.equal(result.reasoning, "Checked");
  assert.equal(result.finishReason, "length"); assert.equal(result.sources.length, 1);
  assert.match(citedMarkdown(result.content, result.sources), /\[1\]\(<https:\/\/science.nasa.gov\/moon\/?>\)/);
  assert.equal(completionUpdate({ choices: [{ message: { refusal: "Cannot help" } }] }).content, "Cannot help");
});
test("stream truncation keeps partial answer but never reports success", async () => {
  let partial = "";
  await assert.rejects(readCompletion(sse(event({ content: "Saved part" })), (x) => partial += x.content), /before the response finished/);
  assert.equal(partial, "Saved part");
});
test("malformed events, service errors and body failure surface errors", async () => {
  await assert.rejects(readCompletion(sse("data: broken\n\n"), () => {}), /invalid stream/);
  await assert.rejects(readCompletion(sse('data: {"error":{"message":"Rate limited"}}\n\n'), () => {}), /Rate limited/);
  await assert.rejects(readCompletion(Response.json({error:"Access denied"}, {status:403}), () => {}), /Access denied/);
  const body = new ReadableStream({ start(c) { c.error(new DOMException("Aborted", "AbortError")); } });
  await assert.rejects(readCompletion(new Response(body, {headers:{"content-type":"text/event-stream"}}), () => {}), { name:"AbortError" });
});
test("citations deduplicate and disallow script, credential and relative URLs", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,a", "https://user:secret@example.com/", "/private"]) assert.equal(safeSourceUrl(url), null);
  const result = completionUpdate({ citations: ["https://nasa.gov", "javascript:alert(1)", "https://nasa.gov"], choices: [{ delta: {} }] });
  assert.equal(mergeSources([], result.sources).length, 1);
  assert.equal(citedMarkdown("Short", [{url:"https://nasa.gov/",title:"NASA", start:0,end:999}]), "Short");
});
test("modes select a real compatible model and reject impossible combinations", () => {
  const models = [
    {id:"embed",type:"embedding",capabilities:["reasoning","web_search"]},
    {id:"chat",type:"chat",capabilities:["streaming"]},
    {id:"think",type:"chat",capabilities:["reasoning","vision"]},
    {id:"search",type:"chat",capabilities:["web_search"]},
  ];
  assert.equal(selectModeModel(models,"chat",{reasoning:true}).id,"think");
  assert.equal(selectModeModel(models,"chat",{web:true}).id,"search");
  assert.equal(selectModeModel(models,"think",{web:true,reasoning:true}),undefined);
  assert.equal(supportsMode(models[0],{reasoning:true}),false);
  assert.equal(selectModeModel(models,"search",{vision:true}).id,"think");
});
