/**
 * Text Oracle - Extracts URLs from text files
 */

import { readFile } from "node:fs/promises";

export class TextOracle {
  async divineUrls(scrollPath: string): Promise<string[]> {
    const scrollContent = await readFile(scrollPath, "utf-8");
    return scrollContent
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);
  }
}
