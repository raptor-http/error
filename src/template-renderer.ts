import vento from "npm:ventojs@2.2.0";
import { ServerError } from "jsr:@raptor/framework@0.8.2";

export default class TemplateRenderer {
  private templating = vento();

  async render(pathname: string, context: Record<string, unknown>) {
    const html = await this.loadTemplate(pathname);
    
    if (!html.trim()) {
      throw new ServerError(`Template file is empty: ${pathname}`);
    }

    return await this.templating.runString(html, context);
  }

  private async loadTemplate(pathname: string): Promise<string> {
    const isRemote = pathname.startsWith("http://") || pathname.startsWith("https://");
    
    if (isRemote) {
      return await this.fetchRemoteTemplate(pathname);
    }
    
    return await this.readLocalTemplate(pathname);
  }

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

  private async readLocalTemplate(pathname: string): Promise<string> {
    try {
      await Deno.stat(pathname);
      return await Deno.readTextFile(pathname);
    } catch {
      throw new ServerError(`Template file not found: ${pathname}`);
    }
  }
}
