export default class CodeExtractor {
  constructor(private codeLineOffset: number = 10) {}

  async extract(filePath: string, highlightLine: number) {
    const fileCode = await this.loadFileContent(filePath);

    if (!fileCode) return null;

    const codeLines = fileCode.split("\n");

    if (!this.isValidHighlightLine(highlightLine, codeLines.length)) {
      return null;
    }

    return this.createSnippet(codeLines, highlightLine);
  }

  private async loadFileContent(filePath: string): Promise<string | null> {
    const isRemote = filePath.startsWith("http://") || filePath.startsWith("https://");
    
    if (isRemote) {
      return await this.fetchRemoteFile(filePath);
    }
    
    return this.readLocalFile(filePath);
  }

  private async fetchRemoteFile(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      
      return await response.text();
    } catch {
      return null;
    }
  }

  private readLocalFile(filePath: string): string | null {
    try {
      Deno.statSync(filePath);
      const data = Deno.readFileSync(filePath);
      return new TextDecoder().decode(data).trim();
    } catch {
      return null;
    }
  }

  private isValidHighlightLine(line: number, totalLines: number): boolean {
    return (
      typeof line === "number" &&
      !isNaN(line) &&
      line > 0 &&
      line <= totalLines
    );
  }

  private createSnippet(codeLines: string[], highlightLine: number) {
    const zeroBasedHighlight = highlightLine - 1;
    const start = Math.max(0, zeroBasedHighlight - this.codeLineOffset);
    const end = Math.min(codeLines.length, zeroBasedHighlight + this.codeLineOffset + 1);

    const snippetLines = codeLines.slice(start, end);
    
    if (!snippetLines.length) return null;

    return {
      snippet: snippetLines.join("\n"),
      decorationLine: zeroBasedHighlight - start,
      snippetLines,
    };
  }
}
