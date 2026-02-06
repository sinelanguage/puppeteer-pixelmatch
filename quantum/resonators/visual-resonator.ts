/**
 * Visual Resonator - Captures visual states using Puppeteer
 */

import puppeteer, { type Browser, type Page } from "puppeteer";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import type { DimensionPortal } from "../manifests/realm-config.js";

export interface CaptureManifest {
  targetUrl: string;
  dimensionKey: string;
  outputVault: string;
  isReferenceCapture: boolean;
}

export class VisualResonator {
  private cosmicBrowser: Browser | null = null;

  async initializeCosmos(): Promise<void> {
    this.cosmicBrowser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  async collapseCosmos(): Promise<void> {
    if (this.cosmicBrowser) {
      await this.cosmicBrowser.close();
      this.cosmicBrowser = null;
    }
  }

  private async ensureVaultExists(vaultPath: string): Promise<void> {
    if (!existsSync(vaultPath)) {
      await mkdir(vaultPath, { recursive: true });
    }
  }

  private transmutateUrlToFilename(url: string): string {
    return url.replace(/[/:]/g, "-").replace(/^-+/, "");
  }

  async captureVisualState(
    manifest: CaptureManifest,
    dimensionSpec: DimensionPortal
  ): Promise<string> {
    if (!this.cosmicBrowser) {
      throw new Error("Cosmic browser not initialized. Call initializeCosmos() first.");
    }

    const dimensionVault = `${manifest.outputVault}/${manifest.dimensionKey}`;
    await this.ensureVaultExists(dimensionVault);

    if (!manifest.isReferenceCapture) {
      const diffVault = `${dimensionVault}/diff`;
      await this.ensureVaultExists(diffVault);
    }

    const portal: Page = await this.cosmicBrowser.newPage();
    await portal.setViewport(dimensionSpec);
    await portal.goto(manifest.targetUrl, {
      timeout: 0,
      waitUntil: "domcontentloaded",
    });

    const stateFilename = this.transmutateUrlToFilename(manifest.targetUrl);
    const fullPath = `${dimensionVault}/${stateFilename}.png`;

    await portal.screenshot({
      path: fullPath,
      fullPage: true,
    });

    await portal.close();

    const captureType = manifest.isReferenceCapture ? "Reference" : "Current";
    console.log(`${captureType} state captured: ${fullPath}`);

    return stateFilename;
  }

  async captureMultipleStates(
    manifests: CaptureManifest[],
    dimensionSpec: DimensionPortal
  ): Promise<string[]> {
    const capturedStates: string[] = [];

    for (const manifest of manifests) {
      try {
        const filename = await this.captureVisualState(manifest, dimensionSpec);
        capturedStates.push(filename);
      } catch (error) {
        console.error(`Error capturing ${manifest.targetUrl}:`, error);
      }
    }

    return capturedStates;
  }
}
