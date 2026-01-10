import BunFileSystemAdapter from "./adapters/bun.ts";
import DenoFileSystemAdapter from "./adapters/deno.ts";
import NodeFileSystemAdapter from "./adapters/node.ts";

import type { FileSystemAdapter } from "../interfaces/file-system-adapter.ts";

export default class Manager {
  /**
   * The runtime adapter for the filesystem.
   */
  private adapter: FileSystemAdapter;

  /**
   * Initialise the filesystem manager with appropriate runtime adapter.
   */
  constructor() {
    this.adapter = this.getFileSystemAdapter();
  }

  /**
   * Read a text file.
   *
   * @param path The path (or URL) to the file to read.
   */
  public readTextFile(path: string | URL): string | Promise<string> {
    return this.adapter.readTextFile(path);
  }

  /**
   * Read a file synchronously.
   *
   * @param path The path (or URL) to the file to read.
   * @returns The contents of a file as an array of bytes.
   */
  public readFileSync(path: string | URL): Uint8Array<ArrayBuffer> {
    return this.adapter.readFileSync(path);
  }

  /**
   * Get the appropriate filesystem adapter based on runtime.
   *
   * @returns A filesystem adapter based on runtime.
   */
  private getFileSystemAdapter(): FileSystemAdapter {
    // deno-lint-ignore no-explicit-any
    const Bun = (globalThis as any).Bun;

    // deno-lint-ignore no-explicit-any
    const Deno = (globalThis as any).Deno;

    if (typeof Deno !== "undefined") {
      return new DenoFileSystemAdapter();
    }

    if (typeof Bun !== "undefined") {
      return new BunFileSystemAdapter();
    }

    return new NodeFileSystemAdapter();
  }
}
