/// <reference lib="deno.ns" />
// deno-lint-ignore-file

import { stub } from "@std/testing/mock";
import { assertEquals, assertExists } from "@std/assert";

import CodeExtractor from "./extractor.ts";

Deno.test("code extractor sets default offset", () => {
  const extractor = new CodeExtractor();

  assertExists(extractor);
});

Deno.test("code extractor accepts custom offset", () => {
  const extractor = new CodeExtractor(5);

  assertExists(extractor);
});

Deno.test("code extractor returns null for non-existent local file", async () => {
  const extractor = new CodeExtractor();

  const result = await extractor.extract("/non/existent/file.ts", 1);

  assertEquals(result, null);
});

Deno.test("code extractor returns null for invalid highlight line", async () => {
  const extractor = new CodeExtractor();

  const tempFile = await Deno.makeTempFile();

  await Deno.writeTextFile(tempFile, "line 1\nline 2\nline 3");

  try {
    const result = await extractor.extract(tempFile, 100);

    assertEquals(result, null);
  } finally {
    await Deno.remove(tempFile);
  }
});

Deno.test("code extractor returns null for line 0", async () => {
  const extractor = new CodeExtractor();

  const tempFile = await Deno.makeTempFile();

  await Deno.writeTextFile(tempFile, "line 1\nline 2\nline 3");

  try {
    const result = await extractor.extract(tempFile, 0);

    assertEquals(result, null);
  } finally {
    await Deno.remove(tempFile);
  }
});

Deno.test("code extractor returns null for NaN line", async () => {
  const extractor = new CodeExtractor();

  const tempFile = await Deno.makeTempFile();

  await Deno.writeTextFile(tempFile, "line 1\nline 2\nline 3");

  try {
    const result = await extractor.extract(tempFile, NaN);

    assertEquals(result, null);
  } finally {
    await Deno.remove(tempFile);
  }
});

Deno.test("code extractor creates valid snippet from local file", async () => {
  const extractor = new CodeExtractor(2);

  const tempFile = await Deno.makeTempFile();

  const content = "line 1\nline 2\nline 3\nline 4\nline 5";

  await Deno.writeTextFile(tempFile, content);

  try {
    const result = await extractor.extract(tempFile, 3);

    assertExists(result);
    assertEquals(result.snippetLines.length, 5);
    assertEquals(result.decorationLine, 2);
    assertEquals(result.snippet.includes("line 3"), true);
  } finally {
    await Deno.remove(tempFile);
  }
});

Deno.test("code extractor handles first line", async () => {
  const extractor = new CodeExtractor(2);

  const tempFile = await Deno.makeTempFile();

  await Deno.writeTextFile(tempFile, "line 1\nline 2\nline 3");

  try {
    const result = await extractor.extract(tempFile, 1);

    assertExists(result);
    assertEquals(result.decorationLine, 0);
    assertEquals(result.snippetLines[0], "line 1");
  } finally {
    await Deno.remove(tempFile);
  }
});

Deno.test("code extractor handles last line", async () => {
  const extractor = new CodeExtractor(2);

  const tempFile = await Deno.makeTempFile();

  await Deno.writeTextFile(tempFile, "line 1\nline 2\nline 3");

  try {
    const result = await extractor.extract(tempFile, 3);

    assertExists(result);
    assertEquals(result.snippetLines[result.snippetLines.length - 1], "line 3");
  } finally {
    await Deno.remove(tempFile);
  }
});

Deno.test("code extractor handles remote file with fetch", async () => {
  const extractor = new CodeExtractor(2);

  const fetchStub = stub(
    globalThis,
    "fetch",
    () =>
      Promise.resolve(new Response("line 1\nline 2\nline 3\nline 4\nline 5")),
  );

  try {
    const result = await extractor.extract("https://example.com/file.ts", 3);

    assertExists(result);
    assertEquals(result.snippetLines.length, 5);
    assertEquals(result.decorationLine, 2);
  } finally {
    fetchStub.restore();
  }
});

Deno.test("code extractor returns null for failed remote fetch", async () => {
  const extractor = new CodeExtractor(2);

  const fetchStub = stub(
    globalThis,
    "fetch",
    () => Promise.resolve(new Response("", { status: 404 })),
  );

  try {
    const result = await extractor.extract("https://example.com/file.ts", 1);

    assertEquals(result, null);
  } finally {
    fetchStub.restore();
  }
});

Deno.test("code extractor returns null when fetch throws", async () => {
  const extractor = new CodeExtractor(2);

  const fetchStub = stub(
    globalThis,
    "fetch",
    () => Promise.reject(new Error("Network error")),
  );

  try {
    const result = await extractor.extract("https://example.com/file.ts", 1);

    assertEquals(result, null);
  } finally {
    fetchStub.restore();
  }
});

Deno.test("code extractor validates correctly", () => {
  const extractor = new CodeExtractor();

  assertEquals(extractor["isValidHighlightLine"](1, 10), true);
  assertEquals(extractor["isValidHighlightLine"](10, 10), true);
  assertEquals(extractor["isValidHighlightLine"](0, 10), false);
  assertEquals(extractor["isValidHighlightLine"](11, 10), false);
  assertEquals(extractor["isValidHighlightLine"](NaN, 10), false);
});

Deno.test("code extractor with small offset", () => {
  const extractor = new CodeExtractor(1);

  const codeLines = ["line 1", "line 2", "line 3", "line 4", "line 5"];

  const result = extractor["createSnippet"](codeLines, 3);

  assertExists(result);
  assertEquals(result.snippetLines.length, 3);
  assertEquals(result.snippetLines[0], "line 2");
  assertEquals(result.snippetLines[1], "line 3");
  assertEquals(result.snippetLines[2], "line 4");
  assertEquals(result.decorationLine, 1);
});

Deno.test("code extractor at file boundaries", () => {
  const extractor = new CodeExtractor(10);

  const codeLines = ["line 1", "line 2", "line 3"];

  const result = extractor["createSnippet"](codeLines, 2);

  assertExists(result);
  assertEquals(result.snippetLines.length, 3);
  assertEquals(result.snippet, "line 1\nline 2\nline 3");
});
