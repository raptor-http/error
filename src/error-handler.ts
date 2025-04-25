import type { Context, Error } from "jsr:@raptor/framework";

import StackProcessor from "./stack-processor.ts";
import CodeHighlighter from "./code-highlighter.ts";
import TemplateRenderer from "./template-renderer.ts";
import CodeExtractor from "./code-extractor.ts";

export default class ErrorHandler {
  private codeExtractor: CodeExtractor;
  private templateRenderer: TemplateRenderer;
  private codeHighlighter: CodeHighlighter;
  private stackProcessor: StackProcessor;

  constructor() {
    this.codeExtractor = new CodeExtractor();
    this.stackProcessor = new StackProcessor();
    this.templateRenderer = new TemplateRenderer();
    this.codeHighlighter = new CodeHighlighter();
  }

  /**
   * Handle the current http context and process routes.
   *
   * @param context The current http context.
   * @returns An HTTP response object.
   */
  public async handle(error: Error, context: Context): Promise<Response> {
    this.stackProcessor.addStackData(error.stack as string);

    const stackLines = this.stackProcessor.process();

    if (!stackLines.length) {
      throw new Error("Could not parse any stack lines from error stack");
    }

    const path = stackLines[0].file;

    if (!path) {
      throw new Error("StackParser did not find a file in first stack frame");
    }

    const highlightLine = stackLines[0].line ?? 1;

    const { snippet, decorationLine, snippetLines } = this.codeExtractor.extract(path, highlightLine);

    const code = await this.codeHighlighter.highlightCode(
      snippet,
      snippetLines,
      decorationLine,
    );

    const templatePath = new URL("../templates/development.vto", import.meta.url).pathname;

    const template = await this.templateRenderer.render(templatePath, {
      code,
      type: error.constructor.name,
      name: error.message,
      stack: {
        raw: error.stack,
        lines: stackLines,
      },
    });

    return new Response(template.content, {
      status: error.status ?? 500,
      headers: {
        ...context.response.headers,
        "Content-Type": "text/html",
      },
    });
  }
}
