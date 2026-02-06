# Quantum Visual Testing Framework

A TypeScript-based visual regression testing tool using Puppeteer and Pixelmatch with a unique "Quantum Flow" architecture.

## Architecture Overview

This framework uses an unconventional **Quantum Flow** pattern where visual states flow through specialized components:

### Components

- **Oracles** (`quantum/oracles/`): Configuration sources that divine URLs from various formats
  - `TextOracle`: Extracts URLs from text files
  - `XmlOracle`: Fetches and parses sitemap.xml files

- **Resonators** (`quantum/resonators/`): Browser instances that capture visual states
  - `VisualResonator`: Uses Puppeteer to capture full-page screenshots

- **Prisms** (`quantum/prisms/`): Image comparison engines
  - `DivergencePrism`: Analyzes differences between visual states using Pixelmatch

- **Conduits** (`quantum/conduits/`): Flow orchestrators
  - `BaselineConduit`: Manages reference state capture
  - `VerificationConduit`: Manages current state capture and comparison

- **Manifests** (`quantum/manifests/`): Configuration and state definitions
  - `RealmBoundaries`: Defines dimensions, paths, and target URLs

## Features

- ✨ Modern TypeScript with full type safety
- 🚀 ES2022+ modules with async/await
- 🎯 Latest dependencies (Puppeteer 23+, Pixelmatch 7+)
- 🔍 Visual regression testing with pixel-perfect comparisons
- 📊 Detailed reporting with diff image generation
- 🌐 Support for multiple viewports/dimensions
- 🔄 Native fetch API (no external HTTP libraries)
- ⚡ Fast XML parsing with fast-xml-parser

## Installation

```bash
npm install
```

## Usage

### 1. Capture Reference States (Baseline)

Captures the initial screenshots to compare against:

```bash
npm run snap:baseline
```

This will:
- Fetch URLs from the configured sitemap.xml
- Capture screenshots for each dimension (viewport)
- Save them to `screenshots-originals/`

### 2. Verify Current States

Captures new screenshots and compares them with the baseline:

```bash
npm run snap:verify
```

This will:
- Fetch URLs from the sitemap.xml
- Capture new screenshots
- Compare them with reference states
- Generate diff images for any differences
- Save current screenshots to `screenshots-current/`
- Save diff images to `screenshots-current/{dimension}/diff/`

### 3. Run Tests

Execute the test suite:

```bash
npm run verify
```

### 4. Clean Build and Screenshots

```bash
npm run clean
```

## Configuration

Edit `quantum/manifests/realm-config.ts` to configure:

- **Target URL**: The base URL to test
- **Dimensions**: Viewport sizes (width, height, mobile flag)
- **Output directories**: Where screenshots are saved

Example:

```typescript
const REALM_BOUNDARIES: RealmBoundaries = {
  anchors: {
    current: "screenshots-current",
    reference: "screenshots-originals",
  },
  dimensions: {
    quantum_ultra_wide: { width: 1920, height: 1080, isMobile: false },
    quantum_standard: { width: 1440, height: 900, isMobile: false },
  },
  targetNexus: "https://www.example.com",
};
```

## How It Works

1. **URL Discovery**: The `XmlOracle` fetches and parses the sitemap.xml to extract all URLs
2. **Visual Capture**: The `VisualResonator` launches Puppeteer and captures full-page screenshots for each URL and dimension
3. **State Analysis**: The `DivergencePrism` loads both reference and current screenshots and uses Pixelmatch to detect pixel differences
4. **Diff Generation**: If differences are found, a diff image is generated highlighting the changed pixels
5. **Reporting**: Results are logged with detailed statistics about matching vs. divergent states

## Technology Stack

- **TypeScript 5.7**: Latest TypeScript with strict type checking
- **Puppeteer 23+**: Headless Chrome automation
- **Pixelmatch 7**: Fast pixel-level image comparison
- **PNGjs 7**: PNG encoding/decoding
- **fast-xml-parser 4**: Fast and efficient XML parsing
- **Mocha 11 + Chai 5**: Modern testing framework
- **Node 20+**: Latest LTS Node.js

## Project Structure

```
quantum/
├── conduits/          # Flow orchestrators
│   ├── baseline-conduit.ts
│   └── verification-conduit.ts
├── manifests/         # Configuration
│   └── realm-config.ts
├── oracles/           # URL providers
│   ├── text-oracle.ts
│   └── xml-oracle.ts
├── prisms/            # Image comparison
│   └── divergence-prism.ts
└── resonators/        # Screenshot capture
    └── visual-resonator.ts
```

## Unique Features

This implementation uses a completely original architecture:

- **Quantum Flow Pattern**: Visual states flow through specialized transformers
- **Unique Terminology**: Oracles, Resonators, Prisms, Conduits instead of common patterns
- **State-based Design**: Screenshots are treated as quantum states that can diverge
- **Flow Orchestration**: Conduits manage the flow of visual states through the system

## Development

### Build

```bash
npm run compile
```

### Type Checking

TypeScript compiler runs in strict mode with:
- No unused locals/parameters
- No implicit returns
- No fallthrough cases
- Full ES2022+ support

## License

ISC

## Requirements

- Node.js >= 20.0.0
- npm >= 9.0.0
