# Quick Reference Guide

## Quick Start

```bash
# Install
npm install

# Build
npm run compile

# Capture baseline
npm run snap:baseline

# Verify against baseline
npm run snap:verify

# Run tests
npm run verify
```

## Architecture Quick Reference

### Component Overview

| Component | Purpose | Location |
|-----------|---------|----------|
| **Oracles** | Discover URLs | `quantum/oracles/` |
| **Resonators** | Capture screenshots | `quantum/resonators/` |
| **Prisms** | Compare images | `quantum/prisms/` |
| **Conduits** | Orchestrate flows | `quantum/conduits/` |
| **Manifests** | Store config | `quantum/manifests/` |

### Key Classes

#### XmlOracle
```typescript
const oracle = new XmlOracle();
const urls = await oracle.divineUrls("https://example.com");
```

#### VisualResonator
```typescript
const resonator = new VisualResonator();
await resonator.initializeCosmos();
await resonator.captureVisualState(manifest, dimensionSpec);
await resonator.collapseCosmos();
```

#### DivergencePrism
```typescript
const prism = new DivergencePrism();
const result = await prism.analyzeStates(refPath, curPath, identifier, diffPath);
```

#### BaselineConduit
```typescript
const conduit = new BaselineConduit();
await conduit.initiateReferenceFlow(realmConfig);
```

#### VerificationConduit
```typescript
const conduit = new VerificationConduit();
const outcome = await conduit.initiateVerificationFlow(realmConfig);
```

## Configuration

Edit `quantum/manifests/realm-config.ts`:

```typescript
const REALM_BOUNDARIES: RealmBoundaries = {
  anchors: {
    current: "screenshots-current",      // Current screenshots
    reference: "screenshots-originals",  // Baseline screenshots
  },
  dimensions: {
    quantum_ultra_wide: { width: 1920, height: 1080, isMobile: false },
    quantum_standard: { width: 1440, height: 900, isMobile: false },
  },
  targetNexus: "https://www.example.com",
};
```

## Type Definitions

### DimensionPortal
```typescript
interface DimensionPortal {
  width: number;
  height: number;
  isMobile: boolean;
}
```

### CaptureManifest
```typescript
interface CaptureManifest {
  targetUrl: string;
  dimensionKey: string;
  outputVault: string;
  isReferenceCapture: boolean;
}
```

### DivergenceResult
```typescript
interface DivergenceResult {
  stateIdentifier: string;
  divergentPixels: number;
  dimensionsMatch: boolean;
  errorMessage?: string;
}
```

### VerificationOutcome
```typescript
interface VerificationOutcome {
  totalStates: number;
  matchingStates: number;
  divergentStates: number;
  failedStates: number;
  divergenceDetails: Array<{
    identifier: string;
    divergentPixels: number;
  }>;
}
```

## Common Tasks

### Add a New Viewport

Edit `quantum/manifests/realm-config.ts`:

```typescript
dimensions: {
  my_new_viewport: { width: 1280, height: 720, isMobile: false },
}
```

### Change Target URL

Edit `quantum/manifests/realm-config.ts`:

```typescript
targetNexus: "https://new-site.com"
```

### Adjust Comparison Sensitivity

Edit `quantum/prisms/divergence-prism.ts`:

```typescript
private readonly sensitivityThreshold = 0.1; // 0.0 = exact, 1.0 = very lenient
```

## Output Locations

| Type | Location |
|------|----------|
| Reference screenshots | `screenshots-originals/{dimension}/` |
| Current screenshots | `screenshots-current/{dimension}/` |
| Diff images | `screenshots-current/{dimension}/diff/` |
| Compiled code | `build/` |

## Scripts Explained

| Script | Command | Purpose |
|--------|---------|---------|
| **compile** | `tsc` | Compile TypeScript to JavaScript |
| **clean** | `rm -rf build screenshots-*` | Remove build and screenshots |
| **snap:baseline** | `compile && node build/baseline-runner.js` | Capture baseline |
| **snap:verify** | `compile && node build/verify-runner.js` | Verify and compare |
| **verify** | `compile && mocha build/**/*.test.js` | Run test suite |

## Troubleshooting

### TypeScript Errors
```bash
npm run compile
# Fix any errors shown, then recompile
```

### Missing Screenshots
```bash
# Ensure baseline exists before verifying
npm run snap:baseline
npm run snap:verify
```

### Diff Images Not Generated
- Diff images only created when differences found
- Check `screenshots-current/{dimension}/diff/` folder

### Tests Failing
```bash
# Ensure baseline captured first
npm run snap:baseline
# Then run tests
npm run verify
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Failure (differences found or error occurred) |

## Logging

- **🔮** = Initialization
- **📡** = URL discovery
- **🌌** = Dimension processing
- **🔬** = Analysis
- **✓** = Success
- **⚠️** = Warning/differences
- **❌** = Error

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| puppeteer | 23.10.4 | Browser automation |
| pixelmatch | 7.0.0 | Image comparison |
| pngjs | 7.0.0 | PNG processing |
| fast-xml-parser | 5.3.4 | XML parsing |
| typescript | 5.7.2 | TypeScript compiler |
| mocha | 11.0.1 | Test framework |
| chai | 5.1.2 | Assertions |

## File Extensions

| Extension | Purpose |
|-----------|---------|
| `.ts` | TypeScript source |
| `.js` | Compiled JavaScript |
| `.d.ts` | Type declarations |
| `.js.map` | Source maps |
| `.png` | Screenshot images |
