/**
 * Verification Conduit - Orchestrates state capture and comparison
 */

import { XmlOracle } from "../oracles/xml-oracle.js";
import { VisualResonator } from "../resonators/visual-resonator.js";
import { DivergencePrism } from "../prisms/divergence-prism.js";
import type { RealmBoundaries } from "../manifests/realm-config.js";

export interface VerificationOutcome {
  totalStates: number;
  matchingStates: number;
  divergentStates: number;
  failedStates: number;
  divergenceDetails: Array<{
    identifier: string;
    divergentPixels: number;
  }>;
}

export class VerificationConduit {
  private readonly xmlOracle = new XmlOracle();
  private readonly resonator = new VisualResonator();
  private readonly prism = new DivergencePrism();

  async initiateVerificationFlow(realmConfig: RealmBoundaries): Promise<VerificationOutcome> {
    console.log(`\n🔍 Initiating verification flow from ${realmConfig.targetNexus}`);

    const urlPortals = await this.xmlOracle.divineUrls(realmConfig.targetNexus);
    console.log(`📡 Discovered ${urlPortals.length} URL portals`);

    await this.resonator.initializeCosmos();

    const outcome: VerificationOutcome = {
      totalStates: 0,
      matchingStates: 0,
      divergentStates: 0,
      failedStates: 0,
      divergenceDetails: [],
    };

    for (const [dimensionKey, dimensionSpec] of Object.entries(realmConfig.dimensions)) {
      console.log(`\n🌌 Processing dimension: ${dimensionKey}`);

      const captureManifests = urlPortals.map((url) => ({
        targetUrl: url,
        dimensionKey,
        outputVault: realmConfig.anchors.current,
        isReferenceCapture: false,
      }));

      const capturedIdentifiers = await this.resonator.captureMultipleStates(
        captureManifests,
        dimensionSpec
      );

      console.log(`\n🔬 Analyzing ${capturedIdentifiers.length} captured states...`);

      const analysisResults = await this.prism.analyzeMultipleStates(
        capturedIdentifiers,
        realmConfig.anchors.reference,
        realmConfig.anchors.current,
        dimensionKey
      );

      for (const result of analysisResults) {
        outcome.totalStates++;

        if (!result.dimensionsMatch || result.errorMessage) {
          outcome.failedStates++;
        } else if (result.divergentPixels === 0) {
          outcome.matchingStates++;
        } else {
          outcome.divergentStates++;
          outcome.divergenceDetails.push({
            identifier: result.stateIdentifier,
            divergentPixels: result.divergentPixels,
          });
        }
      }
    }

    await this.resonator.collapseCosmos();

    console.log("\n" + "=".repeat(60));
    console.log("📊 VERIFICATION OUTCOME");
    console.log("=".repeat(60));
    console.log(`Total states analyzed: ${outcome.totalStates}`);
    console.log(`✓ Matching states: ${outcome.matchingStates}`);
    console.log(`⚠️  Divergent states: ${outcome.divergentStates}`);
    console.log(`❌ Failed analyses: ${outcome.failedStates}`);

    if (outcome.divergenceDetails.length > 0) {
      console.log("\n🔍 Divergence details:");
      outcome.divergenceDetails.forEach((detail) => {
        console.log(`  - ${detail.identifier}: ${detail.divergentPixels} pixels`);
      });
    }

    return outcome;
  }
}
