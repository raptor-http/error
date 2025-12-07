import {
  type Context,
  type Error,
  ServerError,
} from "jsr:@raptor/framework@0.8.2";

import CodeExtractor from "./code-extractor.ts";
import CodeHighlighter from "./code-highlighter.ts";
import TemplateRenderer from "./template-renderer.ts";
import type { ErrorHandlerOptions } from "./error-handler-options.ts";
import StackProcessor, { type StackTraceItem } from "./stack-processor.ts";

/**
 * The error handler middleware.
 */
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
      throw new ServerError();
    }

    let extraction = null;
    let path = null;
    let highlightLine = 1;

    for (const stackLine of stackLines) {
      if (!stackLine.file) continue;

      path = stackLine.file;
      highlightLine = stackLine.line ?? 1;

      extraction = await this.codeExtractor.extract(path, highlightLine);

      if (extraction) {
        break;
      }
    }

    if (!extraction) {
      throw new ServerError();
    }

    const { snippet, decorationLine, snippetLines } = extraction;

    const code = await this.codeHighlighter.highlightCode(
      snippet,
      snippetLines,
      decorationLine,
    );

    const templatePath = new URL(
      `../templates/${this.options.env}.vto`,
      import.meta.url,
    );

    const template = await this.templateRenderer.render(
      templatePath.href,
      this.prepareResponsePayload(code, error, context, stackLines),
    );

    return new Response(template.content, {
      status: error.status ?? 500,
      headers: {
        ...context.response.headers,
        "Content-Type": "text/html",
      },
    });
  }

  /**
   * Prepare the payload for response.
   *
   * @param code The code where the error originated.
   * @param error The error object.
   * @param context The request context.
   * @param stackLines The stack lines for the error.
   * @returns A prepared response payload.
   */
  private prepareResponsePayload(
    code: string,
    error: Error,
    context: Context,
    stackLines: StackTraceItem[],
  ) {
    return {
      code,
      context: {
        request: {
          url: context.request.url,
          method: context.request.method,
          referrer: context.request.referrer,
          headers: Object.fromEntries(
            context.request.headers.entries(),
          ),
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
    };
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
