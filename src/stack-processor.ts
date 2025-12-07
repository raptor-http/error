export type StackTraceItem = {
  method: string | null;
  file: string;
  line: number;
  col: number;
};

/**
 * The request stack processor.
 */
export default class StackProcessor {
  private stack?: string;

  /**
   * Add the stack data.
   *
   * @param stack The stack data.
   */
  public addStackData(stack: string): void {
    this.stack = stack;
  }

  /**
   * Process and extract stack lines.
   *
   * @returns The extracted lines of the stack.
   */
  public process(): StackTraceItem[] {
    return this.extractStackLines();
  }

  /**
   * Extract the stack lines.
   *
   * @returns An array of extracted stack lines.
   */
  public extractStackLines(): StackTraceItem[] {
    if (!this.stack) return [];

    const stack: StackTraceItem[] = [];

    const regex = /^\s*at\s+(?:(.*?) \((.*):(\d+):(\d+)\)|(.*):(\d+):(\d+))$/;

    const lines = this.stack.split("\n");

    for (const line of lines) {
      const match = line.match(regex);

      if (!match) continue;

      if (match[1]) {
        stack.push({
          method: match[1].replace(/^async\s+/, "").trim(),
          file: match[2].replace(/^file:\/\//, ""),
          line: parseInt(match[3], 10),
          col: parseInt(match[4], 10),
        });

        continue;
      }

      stack.push({
        method: null,
        file: match[5].replace(/^file:\/\//, ""),
        line: parseInt(match[6], 10),
        col: parseInt(match[7], 10),
      });
    }

    return stack;
  }
}
