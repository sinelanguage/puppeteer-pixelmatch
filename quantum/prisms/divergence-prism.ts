/**
 * Divergence Prism - Detects visual differences between states
 */

import { createReadStream, createWriteStream } from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

export interface DivergenceResult {
  stateIdentifier: string;
  divergentPixels: number;
  dimensionsMatch: boolean;
  errorMessage?: string;
}

export class DivergencePrism {
  private readonly sensitivityThreshold = 0.1;

  private loadVisualState(statePath: string): Promise<PNG> {
    return new Promise((resolve, reject) => {
      const stream = createReadStream(statePath).pipe(new PNG());
      stream.on("parsed", function (this: PNG) {
        resolve(this);
      });
      stream.on("error", reject);
    });
  }

  async analyzeStates(
    referenceStatePath: string,
    currentStatePath: string,
    stateIdentifier: string,
    divergencePath: string
  ): Promise<DivergenceResult> {
    try {
      const [referenceState, currentState] = await Promise.all([
        this.loadVisualState(referenceStatePath),
        this.loadVisualState(currentStatePath),
      ]);

      if (
        referenceState.width !== currentState.width ||
        referenceState.height !== currentState.height
      ) {
        return {
          stateIdentifier,
          divergentPixels: -1,
          dimensionsMatch: false,
          errorMessage: `Dimension mismatch: ref(${referenceState.width}x${referenceState.height}) vs cur(${currentState.width}x${currentState.height})`,
        };
      }

      const divergenceMap = new PNG({
        width: referenceState.width,
        height: referenceState.height,
      });

      const divergentPixels = pixelmatch(
        referenceState.data,
        currentState.data,
        divergenceMap.data,
        referenceState.width,
        referenceState.height,
        { threshold: this.sensitivityThreshold }
      );

      if (divergentPixels > 0) {
        divergenceMap
          .pack()
          .pipe(createWriteStream(`${divergencePath}/${stateIdentifier}-diff.png`));
        
        console.log(`⚠️  Divergence detected: ${divergentPixels} pixels differ in ${stateIdentifier}`);
      } else {
        console.log(`✓ States match: ${stateIdentifier}`);
      }

      return {
        stateIdentifier,
        divergentPixels,
        dimensionsMatch: true,
      };
    } catch (error) {
      return {
        stateIdentifier,
        divergentPixels: -1,
        dimensionsMatch: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async analyzeMultipleStates(
    stateIdentifiers: string[],
    referenceVault: string,
    currentVault: string,
    dimensionKey: string
  ): Promise<DivergenceResult[]> {
    const results: DivergenceResult[] = [];

    for (const identifier of stateIdentifiers) {
      const referencePath = `${referenceVault}/${dimensionKey}/${identifier}.png`;
      const currentPath = `${currentVault}/${dimensionKey}/${identifier}.png`;
      const divergencePath = `${currentVault}/${dimensionKey}/diff`;

      const result = await this.analyzeStates(
        referencePath,
        currentPath,
        identifier,
        divergencePath
      );

      results.push(result);
    }

    return results;
  }
}
