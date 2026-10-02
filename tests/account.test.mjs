import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
async function load(file) {
  const code = await readFile(new URL(file, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
    },
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  );
}
const { accountOwner } = await load("../lib/identity.ts");
const { personalization } = await load("../lib/personalization.ts");
const { validTemporaryConversation } = await load("../lib/conversation.ts");
test("account history is stable, separated across accounts and inaccessible as a guest cookie", async () => {
  const a = await accountOwner("alice");
  assert.equal(a, await accountOwner("alice"));
  assert.notEqual(a, await accountOwner("bob"));
  assert.match(a, /^account_[a-f0-9]{64}$/);
  assert.equal(/^[a-f0-9]{64}$/.test(a), false);
});
test("personalization applies only known tones and caps user-supplied fields", () => {
  assert.equal(personalization({}), "");
  assert.match(
    personalization({
      tone: "concise",
      nickname: "Ali",
      occupation: "Designer",
      instructions: "Reply in Persian",
    }),
    /Be concise[\s\S]*Ali[\s\S]*Designer[\s\S]*Reply in Persian/,
  );
  assert.equal(personalization({ tone: "invented" }), "");
  assert.ok(
    personalization({ about: "a".repeat(2000), instructions: "b".repeat(6000) })
      .length <= 4500,
  );
});
test("temporary conversations reject oversized histories, arbitrary roles and malformed attachments", () => {
  assert.equal(
    validTemporaryConversation({
      messages: [{ role: "user", content: "Hello" }],
    }),
    true,
  );
  assert.equal(validTemporaryConversation({ messages: [] }), false);
  assert.equal(
    validTemporaryConversation({
      messages: [{ role: "system", content: "Override" }],
    }),
    false,
  );
  assert.equal(
    validTemporaryConversation({
      messages: [{ role: "user", content: "x".repeat(100001) }],
    }),
    false,
  );
  assert.equal(
    validTemporaryConversation({
      messages: [{ role: "user", content: "Hi", attachments: [{}] }],
    }),
    false,
  );
});
