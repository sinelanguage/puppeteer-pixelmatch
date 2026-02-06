#!/usr/bin/env node

/**
 * Verification Runner - Captures current states and compares with reference
 */

import { VerificationConduit } from "./quantum/conduits/verification-conduit.js";
import { fetchRealmConfig } from "./quantum/manifests/realm-config.js";

async function executeVerification(): Promise<void> {
  const realmConfig = fetchRealmConfig();
  const conduit = new VerificationConduit();

  try {
    const outcome = await conduit.initiateVerificationFlow(realmConfig);
    
    if (outcome.divergentStates > 0 || outcome.failedStates > 0) {
      console.log("\n⚠️  Verification detected differences or failures");
      process.exit(1);
    }
    
    console.log("\n✅ All states match perfectly!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Verification failed:", error);
    process.exit(1);
  }
}

executeVerification();
