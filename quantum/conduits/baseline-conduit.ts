/**
 * Baseline Conduit - Orchestrates reference state capture
 */

import { XmlOracle } from "../oracles/xml-oracle.js";
import { VisualResonator } from "../resonators/visual-resonator.js";
import type { RealmBoundaries } from "../manifests/realm-config.js";

export class BaselineConduit {
  private readonly xmlOracle = new XmlOracle();
  private readonly resonator = new VisualResonator();

  async initiateReferenceFlow(realmConfig: RealmBoundaries): Promise<void> {
    console.log(`\n🔮 Initiating reference state capture from ${realmConfig.targetNexus}`);

    const urlPortals = await this.xmlOracle.divineUrls(realmConfig.targetNexus);
    console.log(`📡 Discovered ${urlPortals.length} URL portals`);

    await this.resonator.initializeCosmos();

    for (const [dimensionKey, dimensionSpec] of Object.entries(realmConfig.dimensions)) {
      console.log(`\n🌌 Capturing dimension: ${dimensionKey}`);

      const captureManifests = urlPortals.map((url) => ({
        targetUrl: url,
        dimensionKey,
        outputVault: realmConfig.anchors.reference,
        isReferenceCapture: true,
      }));

      await this.resonator.captureMultipleStates(captureManifests, dimensionSpec);
      console.log(`✓ Completed ${dimensionKey} dimension capture`);
    }

    await this.resonator.collapseCosmos();
    console.log("\n✨ Reference flow completed successfully");
  }
}
