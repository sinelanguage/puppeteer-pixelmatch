#!/usr/bin/env node

/**
 * Baseline Runner - Captures reference visual states
 */

import { BaselineConduit } from "./quantum/conduits/baseline-conduit.js";
import { fetchRealmConfig } from "./quantum/manifests/realm-config.js";

async function executeBaselineCapture(): Promise<void> {
  const realmConfig = fetchRealmConfig();
  const conduit = new BaselineConduit();

  try {
    await conduit.initiateReferenceFlow(realmConfig);
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Baseline capture failed:", error);
    process.exit(1);
  }
}

executeBaselineCapture();
