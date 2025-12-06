import vento from "npm:ventojs@2.2.0";
import { ServerError } from "jsr:@raptor/framework@0.8.2";
import type { TemplateResult } from "npm:ventojs@2.2.0/core/environment.js";

/**
 * The error template renderer.
 */
export default class TemplateRenderer {
  private templating = vento();

  /**
   * Render the template with context.
   *
   * @param pathname The path to the template.
   * @param context The request context for the template to use.
   * @returns The template result.
   */
  async render(
    pathname: string,
    context: Record<string, unknown>,
  ): Promise<TemplateResult> {
    const html = await this.loadTemplate(pathname);

    if (!html.trim()) {
      throw new ServerError(`Template file is empty: ${pathname}`);
    }

    return this.templating.runString(html, context);
  }

  /**
   * Load the template.
   *
   * @param pathname The path to the template file.
   * @returns The template file contents.
   */
  private async loadTemplate(pathname: string): Promise<string> {
    const isRemote = pathname.startsWith("http://") ||
      pathname.startsWith("https://");

    if (isRemote) {
      return await this.fetchRemoteTemplate(pathname);
    }

    return await this.readLocalTemplate(pathname);
  }

  /**
   * Fetch a remote template file.
   *
   * @param url The URL to the remote template file.
   * @returns The template file contents.
   */
  private async fetchRemoteTemplate(url: string): Promise<string> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new ServerError(`Template file not found: ${url}`);
      }

      return await response.text();
    } catch (error) {
      if (error instanceof ServerError) throw error;
      throw new ServerError(`Template file not found: ${url}`);
    }
  }

  /**
   * Read a local template file.
   *
   * @param pathname The path to the template file.
   * @returns The template file contents.
   */
  private async readLocalTemplate(pathname: string): Promise<string> {
    try {
      const url = new URL(pathname, import.meta.url);

      return await Deno.readTextFile(url);
    } catch {
      throw new ServerError(`Template file not found: ${pathname}`);
    }
  }
}
