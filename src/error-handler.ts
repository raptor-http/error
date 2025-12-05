import type { Context, Error } from "jsr:@raptor/framework@0.7.5";

import CodeExtractor from "./code-extractor.ts";
import StackProcessor from "./stack-processor.ts";
import CodeHighlighter from "./code-highlighter.ts";
import TemplateRenderer from "./template-renderer.ts";
import type { ErrorHandlerOptions } from "./error-handler-options.ts";

export default class ErrorHandler {
  /**
   * The environment on which to handle errors.
   */
  private options: ErrorHandlerOptions;

  /**
   * The code snippet extractor.
   */
  private codeExtractor: CodeExtractor;

  /**
   * The error template renderer.
   */
  private templateRenderer: TemplateRenderer;

  /**
   * The code syntax highlighter.
   */
  private codeHighlighter: CodeHighlighter;

  /**
   * The error stack processor.
   */
  private stackProcessor: StackProcessor;

  constructor(options?: ErrorHandlerOptions) {
    this.codeExtractor = new CodeExtractor();
    this.stackProcessor = new StackProcessor();
    this.templateRenderer = new TemplateRenderer();
    this.codeHighlighter = new CodeHighlighter();
    this.options = options ?? this.initialiseDefaultOptions();
  }

  /**
   * Handle the current http context and process routes.
   *
   * @param error The error object to handle.
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

    const { snippet, decorationLine, snippetLines } = this.codeExtractor
      .extract(path, highlightLine);

    const code = await this.codeHighlighter.highlightCode(
      snippet,
      snippetLines,
      decorationLine,
    );

    const templatePath = new URL(
      `../templates/${this.options.env}.vto`,
      import.meta.url,
    );

    const template = await this.templateRenderer.render(templatePath.pathname, {
      code,
      context: {
        request: {
          headers: context.request.headers.values(),
        },
        response: {
          status: error.status,
        },
      },
      name: error.name,
      message: error.message,
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

  /**
   * Initialise the default kernel options.
   *
   * @param options Optional error handler options object.
   * @returns A new error handler options object with defaults.
   */
  private initialiseDefaultOptions(
    options?: ErrorHandlerOptions,
  ): ErrorHandlerOptions {
    return {
      env: "production",
      ...options,
    };
  }
}
