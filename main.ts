/**
 * Main Entry Point - Quantum Visual Testing Framework
 */

export { BaselineConduit } from "./quantum/conduits/baseline-conduit.js";
export { VerificationConduit } from "./quantum/conduits/verification-conduit.js";
export { VisualResonator } from "./quantum/resonators/visual-resonator.js";
export { DivergencePrism } from "./quantum/prisms/divergence-prism.js";
export { XmlOracle } from "./quantum/oracles/xml-oracle.js";
export { TextOracle } from "./quantum/oracles/text-oracle.js";
export { fetchRealmConfig, extractDimensionKeys } from "./quantum/manifests/realm-config.js";

export type { RealmBoundaries, DimensionPortal } from "./quantum/manifests/realm-config.js";
export type { CaptureManifest } from "./quantum/resonators/visual-resonator.js";
export type { DivergenceResult } from "./quantum/prisms/divergence-prism.js";
export type { VerificationOutcome } from "./quantum/conduits/verification-conduit.js";
