import vento from "npm:ventojs@2.2.0";

export default class TemplateRenderer {
  private templating = vento();

  async render(pathname: string, context: Record<string, unknown>) {
    let html: string;

    if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
      try {
        const response = await fetch(pathname);

        if (!response.ok) {
          throw new Error(`Template file not found: ${pathname}`);
        }

        html = await response.text();
      } catch {
        throw new Error(`Template file not found: ${pathname}`);
      }
    } else {
      try {
        await Deno.stat(pathname);
      } catch {
        throw new Error(`Template file not found: ${pathname}`);
      }

      html = await Deno.readTextFile(pathname);
    }

    if (!html.trim()) {
      throw new Error(`Template file is empty: ${pathname}`);
    }

    return await this.templating.runString(html, context);
  }
}
