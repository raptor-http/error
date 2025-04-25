import vento from "jsr:@vento/vento";
import { codeToHtml } from "npm:shiki";
import type { Context, Error } from "jsr:@raptor/framework";

import StackProcessor from "./stack-processor.ts";

export default class ErrorHandler {
  /**
   * Handle the current http context and process routes.
   *
   * @param context The current http context.
   * @returns An unknown data type.
   */
  public async handle(error: Error, context: Context): Promise<Response> {
    const templating = vento();

    const stackProcessor = new StackProcessor(error.stack as string);

    const stackLines = stackProcessor.process();

    const path = stackLines[0].file;

    const data = Deno.readFileSync(path);

    const fileCode = new TextDecoder().decode(data).trim();

    const windowSize = 10;

    const highlightLine = (stackLines[0].line ?? 1) - 1;
    const codeLines = fileCode.split('\n');

    const start = Math.max(0, highlightLine - windowSize);
    const end = Math.min(codeLines.length, highlightLine + windowSize + 1);

    const snippetLines = codeLines.slice(start, end);
    const snippet = snippetLines.join('\n');

    const decorationLine = highlightLine - start;

    const decorations = [
      {
        start: { line: decorationLine, character: 0 },
        end: { line: decorationLine, character: snippetLines[decorationLine].length },
        properties: { class: 'highlighted-line' }
      }
    ];

    const code = await codeToHtml(snippet, {
      lang: "ts",
      theme: "material-theme-darker",
      decorations,
    });

    const { pathname } = new URL('../templates/development.vto', import.meta.url);
    
    const html = await Deno.readTextFile(pathname);

    const template = await templating.runString(html, {
      type: error.constructor.name,
      name: error.message,
      stack: {
        raw: error.stack,
        lines: stackLines,
      },
      code,
    });

    return new Response(template.content, {
      status: error.status ?? 500,
      headers: {
        ...context.response.headers,
        "Content-Type": "text/html"
      }
    });
  }
};
