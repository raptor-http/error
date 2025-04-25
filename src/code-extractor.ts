export default class CodeExtractor {
  constructor(private codeLineOffset: number = 10) {}

  extract(filePath: string, highlightLine: number) {
    try {
      Deno.statSync(filePath);
    } catch {
      throw new Error(`Source file does not exist: ${filePath}`);
    }

    const data = Deno.readFileSync(filePath);
    const fileCode = new TextDecoder().decode(data).trim();
    const codeLines = fileCode.split("\n");

    if (
      typeof highlightLine !== "number" ||
      isNaN(highlightLine) ||
      highlightLine <= 0 ||
      highlightLine > codeLines.length
    ) {
      throw new Error(
        `highlightLine=${highlightLine} is invalid for file with ${codeLines.length} lines`,
      );
    }

    const zeroBasedHighlight = highlightLine - 1;
    const start = Math.max(0, zeroBasedHighlight - this.codeLineOffset);
    const end = Math.min(
      codeLines.length,
      zeroBasedHighlight + this.codeLineOffset + 1,
    );
    const snippetLines = codeLines.slice(start, end);

    if (!snippetLines.length) {
      throw new Error(`Extracted snippet is empty for ${filePath}`);
    }

    return {
      snippet: snippetLines.join("\n"),
      decorationLine: zeroBasedHighlight - start,
      snippetLines,
    };
  }
}
