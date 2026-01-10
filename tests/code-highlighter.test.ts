/// <reference lib="deno.ns" />
// deno-lint-ignore-file

import CodeHighlighter from "../src/code/highlighter.ts";
import { assertEquals, assertExists, assertRejects } from "@std/assert";

Deno.test("code highlighter creates instance", () => {
  const highlighter = new CodeHighlighter();

  assertExists(highlighter);
});

Deno.test("code highlighter throws error for empty snippet", async () => {
  const highlighter = new CodeHighlighter();

  await assertRejects(
    async () => await highlighter.highlightCode("", [], 0),
    Error,
    "Cannot highlight empty snippet",
  );
});

Deno.test("code highlighter throws error for empty snippetLines", async () => {
  const highlighter = new CodeHighlighter();

  await assertRejects(
    async () => await highlighter.highlightCode("some code", [], 0),
    Error,
    "Cannot highlight empty snippet",
  );
});

Deno.test("code highlighter throws error for negative decoration line", async () => {
  const highlighter = new CodeHighlighter();

  const snippetLines = ["line 1", "line 2", "line 3"];

  await assertRejects(
    async () =>
      await highlighter.highlightCode(
        "line 1\nline 2\nline 3",
        snippetLines,
        -1,
      ),
    Error,
    "Decoration line is out of bounds",
  );
});

Deno.test("code highlighter throws error for out of bounds decoration line", async () => {
  const highlighter = new CodeHighlighter();

  const snippetLines = ["line 1", "line 2", "line 3"];

  await assertRejects(
    async () =>
      await highlighter.highlightCode(
        "line 1\nline 2\nline 3",
        snippetLines,
        10,
      ),
    Error,
    "Decoration line is out of bounds: 10 (snippet has 3 lines)",
  );
});

Deno.test("code highlighter throws error when decoration line equals length", async () => {
  const highlighter = new CodeHighlighter();

  const snippetLines = ["line 1", "line 2", "line 3"];

  await assertRejects(
    async () =>
      await highlighter.highlightCode(
        "line 1\nline 2\nline 3",
        snippetLines,
        3,
      ),
    Error,
    "Decoration line is out of bounds",
  );
});

Deno.test("code highlighter returns HTML string for valid input", async () => {
  const highlighter = new CodeHighlighter();

  const snippet = "const x = 1;\nconst y = 2;\nconst z = 3;";

  const snippetLines = ["const x = 1;", "const y = 2;", "const z = 3;"];

  const result = await highlighter.highlightCode(snippet, snippetLines, 1);

  assertExists(result);
  assertEquals(typeof result, "string");
  assertEquals(result.includes("<"), true);
  assertEquals(result.includes(">"), true);
});

Deno.test("code highlighter handles first line decoration", async () => {
  const highlighter = new CodeHighlighter();

  const snippet = "line 1\nline 2\nline 3";

  const snippetLines = ["line 1", "line 2", "line 3"];

  const result = await highlighter.highlightCode(snippet, snippetLines, 0);

  assertExists(result);
  assertEquals(typeof result, "string");
});

Deno.test("code highlighter handles last line decoration", async () => {
  const highlighter = new CodeHighlighter();

  const snippet = "line 1\nline 2\nline 3";

  const snippetLines = ["line 1", "line 2", "line 3"];

  const result = await highlighter.highlightCode(snippet, snippetLines, 2);

  assertExists(result);
  assertEquals(typeof result, "string");
});

Deno.test("code highlighter applies highlighted-line class", async () => {
  const highlighter = new CodeHighlighter();

  const snippet = "const x = 1;\nconst y = 2;";

  const snippetLines = ["const x = 1;", "const y = 2;"];

  const result = await highlighter.highlightCode(snippet, snippetLines, 0);

  assertExists(result);
  assertEquals(result.includes("highlighted-line"), true);
});
