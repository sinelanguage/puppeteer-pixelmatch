# Migration Guide: CommonJS to TypeScript Quantum Framework

## Overview

This document explains the migration from the old CommonJS JavaScript implementation to the new TypeScript Quantum Framework.

## Key Changes

### 1. Architecture

**Old (CommonJS)**:
- Flat structure with test files
- Procedural style with callbacks
- Mixed concerns in test files

**New (Quantum Framework)**:
- Modular architecture with clear separation
- Object-oriented design
- Specialized components (Oracles, Resonators, Prisms, Conduits)

### 2. Module System

**Old**:
```javascript
const puppeteer = require("puppeteer");
module.exports = { ... };
```

**New**:
```typescript
import puppeteer from "puppeteer";
export class VisualResonator { ... }
```

### 3. Async Patterns

**Old**:
```javascript
const compareScreenshots = async (fileName, viewPortDir) => {
  return new Promise(async (resolve, reject) => {
    // Callback-based PNG loading
    fs.createReadStream(path).pipe(new PNG()).on("parsed", doneReading);
  });
};
```

**New**:
```typescript
private loadVisualState(statePath: string): Promise<PNG> {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(statePath).pipe(new PNG());
    stream.on("parsed", function (this: PNG) {
      resolve(this);
    });
    stream.on("error", reject);
  });
}
```

### 4. Configuration

**Old**: `constants/index.js` with mixed exports
```javascript
const TEST_DIR = "screenshots-current";
const VIEWPORTS = {
  large_desktop_screen: { width: 1920, height: 1080, isMobile: false },
};
```

**New**: `quantum/manifests/realm-config.ts` with typed interfaces
```typescript
export interface RealmBoundaries {
  anchors: { current: string; reference: string };
  dimensions: Record<string, DimensionPortal>;
}
```

### 5. Dependencies

**Replaced**:
- `node-fetch` → Native `fetch` API
- `xml2js` → `fast-xml-parser`
- `puppeteer@1.3.0` → `puppeteer@23.10.4`
- `mocha@5` → `mocha@11`
- `chai@4` → `chai@5`

### 6. File Structure

**Old**:
```
constants/
  index.js
test/
  test.js
```

**New**:
```
quantum/
  conduits/
    baseline-conduit.ts
    verification-conduit.ts
  manifests/
    realm-config.ts
  oracles/
    text-oracle.ts
    xml-oracle.ts
  prisms/
    divergence-prism.ts
  resonators/
    visual-resonator.ts
```

## Component Mapping

### Old → New

| Old Component | New Component | Purpose |
|--------------|---------------|---------|
| `readFileLineByLine()` | `TextOracle.divineUrls()` | Read URLs from text |
| `getSitemapXml()` + `readXmlFile()` | `XmlOracle.divineUrls()` | Fetch and parse XML |
| `takeScreenshot()` | `VisualResonator.captureVisualState()` | Capture screenshots |
| `compareScreenshots()` | `DivergencePrism.analyzeStates()` | Compare images |
| Mocha test "take original" | `BaselineConduit.initiateReferenceFlow()` | Baseline capture |
| Mocha test "take and compare" | `VerificationConduit.initiateVerificationFlow()` | Verify and compare |

## Script Changes

**Old**:
```bash
npm run original  # Take baseline screenshots
npm run compare   # Compare screenshots
```

**New**:
```bash
npm run snap:baseline  # Capture reference states
npm run snap:verify    # Verify current states
npm run verify         # Run tests
```

## Type Safety

All components now have full TypeScript types:

```typescript
export interface CaptureManifest {
  targetUrl: string;
  dimensionKey: string;
  outputVault: string;
  isReferenceCapture: boolean;
}

export interface DivergenceResult {
  stateIdentifier: string;
  divergentPixels: number;
  dimensionsMatch: boolean;
  errorMessage?: string;
}
```

## Error Handling

**Old**: Mixed try/catch with console.log
```javascript
try {
  // ...
} catch (error) {
  console.log(`Error: ${error}`);
}
```

**New**: Structured error handling with typed errors
```typescript
try {
  // ...
} catch (error) {
  return {
    stateIdentifier,
    divergentPixels: -1,
    dimensionsMatch: false,
    errorMessage: error instanceof Error ? error.message : String(error),
  };
}
```

## Benefits of New Architecture

1. **Type Safety**: Catch errors at compile time
2. **Modularity**: Clear separation of concerns
3. **Testability**: Each component can be tested independently
4. **Maintainability**: Easier to understand and modify
5. **Modern**: Uses latest JavaScript/TypeScript features
6. **Performance**: Newer dependencies with optimizations
7. **Unique**: Original architecture not found in other projects

## Backward Compatibility

The tool maintains the same functionality:
- ✓ Captures baseline screenshots
- ✓ Compares screenshots pixel-by-pixel
- ✓ Generates diff images
- ✓ Reports differences
- ✓ Supports multiple viewports
- ✓ Works with sitemap.xml

## Example Usage

### Capturing Baseline

**Old**:
```bash
npm run original
```

**New**:
```bash
npm run snap:baseline
```

Output:
```
🔮 Initiating reference state capture from https://example.com
📡 Discovered 154 URL portals
🌌 Capturing dimension: quantum_ultra_wide
✓ Completed quantum_ultra_wide dimension capture
✨ Reference flow completed successfully
```

### Verification

**Old**:
```bash
npm run compare
```

**New**:
```bash
npm run snap:verify
```

Output:
```
🔍 Initiating verification flow from https://example.com
📡 Discovered 154 URL portals
🌌 Processing dimension: quantum_ultra_wide
🔬 Analyzing 154 captured states...
✓ States match: url-1
⚠️  Divergence detected: 1234 pixels differ in url-2
============================================================
📊 VERIFICATION OUTCOME
============================================================
Total states analyzed: 154
✓ Matching states: 153
⚠️  Divergent states: 1
❌ Failed analyses: 0
```
