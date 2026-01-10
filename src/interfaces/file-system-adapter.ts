/**
 * An interface for implementing Filesystem adapters.
 */
export interface FileSystemAdapter {
  /**
   * Read a text file.
   *
   * @param path The path (or URL) to the file to read.
   * @returns A promise resolving the text string.
   */
  readTextFile(path: string | URL): string | Promise<string>;

  /**
   * Read a file synchronously.
   *
   * @param path The path (or URL) to the file to read.
   * @returns The contents of a file as an array of bytes.
   */
  readFileSync(path: string | URL): Uint8Array<ArrayBuffer>;
}
