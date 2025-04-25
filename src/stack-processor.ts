type StackTraceItem = {
  method: string | null;
  file: string;
  line: number;
  col: number;
};

export default class StackProcessor {
  private stack: string;

  constructor(stack: string) {
    this.stack = stack;
  }

  public process(): StackTraceItem[] {
    return this.extractStackLines();
  }

  public extractStackLines(): StackTraceItem[] {
    const stack: StackTraceItem[] = [];
    const regex = /^\s*at\s+(?:(.*?) \((.*):(\d+):(\d+)\)|(.*):(\d+):(\d+))$/;

    const lines = this.stack.split('\n');

    for (const line of lines) {
      const match = line.match(regex);

      if (!match) continue;

      if (match[1]) {
        stack.push({
          method: match[1].replace(/^async\s+/, '').trim(),
          file: match[2].replace(/^file:\/\//, ''),
          line: parseInt(match[3], 10),
          col: parseInt(match[4], 10),
        });

        continue;
      }

      stack.push({
        method: null,
        file: match[5].replace(/^file:\/\//, ''),
        line: parseInt(match[6], 10),
        col: parseInt(match[7], 10),
      });
    }

    return stack;
  }
}
