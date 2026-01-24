/// <reference lib="deno.ns" />
// deno-lint-ignore-file

import { assertEquals, assertExists } from "@std/assert";

import StackProcessor from "./processor.ts";

Deno.test("stack processor creates instance", () => {
  const processor = new StackProcessor();

  assertExists(processor);
});

Deno.test("stack processor stores stack string", () => {
  const processor = new StackProcessor();
  const stack = "Error: Test error\n    at test.ts:1:1";

  processor.addStackData(stack);

  assertExists(processor);
});

Deno.test("stack processor returns empty array for no stack", () => {
  const processor = new StackProcessor();

  const result = processor.process();

  assertEquals(result, []);
});

Deno.test("stack processor returns empty array for undefined stack", () => {
  const processor = new StackProcessor();

  const result = processor.extractStackLines();

  assertEquals(result, []);
});

Deno.test("stack processor parses stack with method names", () => {
  const processor = new StackProcessor();

  const stack = `Error: Test error
    at myFunction (/path/to/file.ts:10:5)
    at anotherFunction (/path/to/other.ts:20:10)`;

  processor.addStackData(stack);

  const result = processor.extractStackLines();

  assertEquals(result.length, 2);
  assertEquals(result[0].method, "myFunction");
  assertEquals(result[0].file, "/path/to/file.ts");
  assertEquals(result[0].line, 10);
  assertEquals(result[0].col, 5);
  assertEquals(result[1].method, "anotherFunction");
  assertEquals(result[1].file, "/path/to/other.ts");
  assertEquals(result[1].line, 20);
  assertEquals(result[1].col, 10);
});

Deno.test("stack processor parses stack without method names", () => {
  const processor = new StackProcessor();

  const stack = `Error: Test error
    at /path/to/file.ts:10:5
    at /path/to/other.ts:20:10`;

  processor.addStackData(stack);

  const result = processor.extractStackLines();

  assertEquals(result.length, 2);
  assertEquals(result[0].method, null);
  assertEquals(result[0].file, "/path/to/file.ts");
  assertEquals(result[0].line, 10);
  assertEquals(result[0].col, 5);
  assertEquals(result[1].method, null);
  assertEquals(result[1].file, "/path/to/other.ts");
  assertEquals(result[1].line, 20);
  assertEquals(result[1].col, 10);
});

Deno.test("stack processor removes file:// protocol", () => {
  const processor = new StackProcessor();

  const stack = `Error: Test error
    at myFunction (file:///path/to/file.ts:10:5)`;

  processor.addStackData(stack);

  const result = processor.extractStackLines();

  assertEquals(result.length, 1);
  assertEquals(result[0].file, "/path/to/file.ts");
});

Deno.test("stack processor removes async prefix from method names", () => {
  const processor = new StackProcessor();

  const stack = `Error: Test error
    at async myAsyncFunction (/path/to/file.ts:10:5)`;

  processor.addStackData(stack);

  const result = processor.extractStackLines();

  assertEquals(result.length, 1);
  assertEquals(result[0].method, "myAsyncFunction");
});

Deno.test("stack processor handles mixed stack trace formats", () => {
  const processor = new StackProcessor();

  const stack = `Error: Test error
    at functionA (/path/to/file1.ts:10:5)
    at /path/to/file2.ts:20:10
    at async functionB (file:///path/to/file3.ts:30:15)`;

  processor.addStackData(stack);

  const result = processor.extractStackLines();

  assertEquals(result.length, 3);
  assertEquals(result[0].method, "functionA");
  assertEquals(result[0].file, "/path/to/file1.ts");
  assertEquals(result[1].method, null);
  assertEquals(result[1].file, "/path/to/file2.ts");
  assertEquals(result[2].method, "functionB");
  assertEquals(result[2].file, "/path/to/file3.ts");
});

Deno.test("stack processor ignores non-matching lines", () => {
  const processor = new StackProcessor();

  const stack = `Error: Test error
    at myFunction (/path/to/file.ts:10:5)
    This is not a valid stack line
    at anotherFunction (/path/to/other.ts:20:10)`;

  processor.addStackData(stack);

  const result = processor.extractStackLines();

  assertEquals(result.length, 2);
  assertEquals(result[0].method, "myFunction");
  assertEquals(result[1].method, "anotherFunction");
});

Deno.test("stack processor parses line and column numbers correctly", () => {
  const processor = new StackProcessor();

  const stack = `Error: Test error
    at myFunction (/path/to/file.ts:123:456)`;

  processor.addStackData(stack);

  const result = processor.extractStackLines();

  assertEquals(result.length, 1);
  assertEquals(result[0].line, 123);
  assertEquals(result[0].col, 456);
});

Deno.test("stack processor handles URLs in file paths", () => {
  const processor = new StackProcessor();

  const stack = `Error: Test error
    at myFunction (https://example.com/file.ts:10:5)`;

  processor.addStackData(stack);

  const result = processor.extractStackLines();

  assertEquals(result.length, 1);
  assertEquals(result[0].file, "https://example.com/file.ts");
});

Deno.test("stack processor returns same as extractStackLines", () => {
  const processor = new StackProcessor();

  const stack = `Error: Test error
    at myFunction (/path/to/file.ts:10:5)`;

  processor.addStackData(stack);

  const result1 = processor.process();

  processor.addStackData(stack);

  const result2 = processor.extractStackLines();

  assertEquals(result1.length, result2.length);
  assertEquals(result1[0].method, result2[0].method);
  assertEquals(result1[0].file, result2[0].file);
});
