import vento from "npm:ventojs@2.2.0";

export default class TemplateRenderer {
  private templating = vento();

  async render(pathname: string, context: Record<string, unknown>) {
    try {
      await Deno.stat(pathname);
    } catch {
      throw new Error(`Template file not found: ${pathname}`);
    }

    const html = await Deno.readTextFile(pathname);

    if (!html.trim()) {
      throw new Error(`Template file is empty: ${pathname}`);
    }

    return await this.templating.runString(html, context);
  }
}
