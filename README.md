# Fastlane Handbook 🚀

An independent, high-density community handbook and complete API reference for [Fastlane](https://github.com/fastlane/fastlane) mobile automation.

> **Disclaimer & Legal Notice:**
> Fastlane Handbook is an independent, community-created technical handbook authored by fans and automation practitioners. It is **not** an official Fastlane project and is neither affiliated with, maintained by, nor endorsed by Fastlane or Google.
>
> Fastlane is an open-source project originally created by Felix Krause and maintained by the Fastlane Authors under the **MIT License**. This handbook respects and complies with the MIT License terms.

---

## Why Fastlane Handbook?

Fastlane is the gold standard for mobile CI/CD automation across iOS and Android. However, modern mobile engineers primarily build applications with **Flutter (Dart)**, **React Native (TypeScript)**, **Kotlin**, and **Swift**.

When developers consult the official documentation (`docs.fastlane.tools`), they often encounter significant gaps:
1. **Undocumented Parameters**: Dozens of valid parameters supported by underlying engines (`supply`, `deliver`, `gym`, `pilot`) are missing from action pages.
2. **Ruby Language Barrier**: Fastlane's Ruby syntax creates friction for mobile engineers who aren't familiar with Ruby's Symbols, closure blocks, hashes, or Bundler workflows.
3. **Missing Production Patterns**: Real-world enterprise architectures—such as white-label multi-brand matrices, zero-rebuild track promotions, encrypted keystore security guards, and locale-specific metadata mapping—are left for developers to reverse-engineer from Ruby source code.
4. **Context Sharing Obscurity**: Fastlane actions communicate via `Actions.lane_context[SharedValues::...]`, but what keys each action reads and writes is largely undocumented.

Fastlane Handbook addresses these gaps with complete introspected parameter schemas, battle-tested architectural recipes, and a dedicated **Ruby Rosetta Stone** for mobile engineers.

---

## Features

- **238+ Built-in Actions Extracted**: Every action is extracted directly from the Fastlane Ruby gem AST, detailing types, environment variable fallbacks, required flags, and shared context outputs.
- **Upstream Sync Engine**: Automated GitHub Actions watcher and Ruby extractor that detects new Fastlane releases on GitHub and regenerates documentation automatically.
- **Flight Control / High-Density Theme**: Built with Astro Starlight, strictly designed to avoid generic AI slop (zero nested cards, zero purple gradients, high-contrast typography, monospace-accented tokens).
- **Client-Side Fulltext Search**: Instant client-side search powered by Pagefind—zero server latency.
- **Production Blueprints**: Step-by-step implementation guides for multi-brand apps, zero-rebuild Play Store promotion, and App Store Connect API (`.p8`) auth.

---

## Tech Stack

- **Runtime & Package Manager**: [Bun](https://bun.sh) (v1.4+)
- **Documentation Framework**: [Astro](https://astro.build) (v5+) + [Starlight](https://starlight.astro.build)
- **Language**: TypeScript (strict mode)
- **Data Extractor**: Ruby Reflection Script (`scripts/extract-actions.rb`)
- **Hosting**: GitHub Pages via GitHub Actions

---

## Local Development

### Prerequisites
- [Bun](https://bun.sh) installed
- Ruby (>= 3.0) with the `fastlane` gem installed (for running the upstream extraction script)

### Setup & Run
```bash
# 1. Clone repository
git clone https://github.com/<your-username>/fastlane-handbook.git
cd fastlane-handbook

# 2. Install dependencies with Bun
bun install

# 3. (Optional) Run action extraction from local Fastlane gem
bun run sync:actions

# 4. Start local development server
bun run dev
```

Visit `http://localhost:4321/fastlane-handbook/` in your browser.

---

## Building for Production

```bash
# Build static site with Pagefind search index
bun run build

# Preview production build locally
bun run preview
```

---

## Project Structure

```
fastlane-handbook/
├── .github/
│   └── workflows/
│       ├── deploy.yml              # GitHub Pages deployment workflow
│       └── upstream-sync.yml       # Upstream release watcher & auto-sync
├── src/
│   ├── content/
│   │   └── docs/
│   │       ├── index.mdx           # Homepage
│   │       ├── start/              # Architecture & mental model
│   │       ├── rosetta-stone/      # Ruby for Flutter, RN, Swift, Kotlin devs
│   │       ├── recipes/            # Multi-brand, zero-rebuild, security
│   │       ├── internals/          # Lane context, Spaceship API, custom actions
│   │       └── actions/            # 238+ auto-generated action references
│   ├── data/
│   │   ├── fastlane-actions.json   # Raw extracted action schemas
│   │   └── fastlane-version.json   # Upstream version & sync timestamp
│   └── styles/
│       └── custom.css              # Impeccable flight control styling tokens
├── scripts/
│   ├── extract-actions.rb          # Ruby script to introspect Fastlane actions
│   └── generate-action-docs.ts     # TypeScript script to emit MDX pages
├── PRODUCT.md                      # Impeccable product context
├── DESIGN.md                       # Impeccable visual tokens and rules
├── astro.config.mjs
└── package.json
```

---

## License

This project is licensed under the [MIT License](LICENSE).
Fastlane is licensed under the MIT License, Copyright (c) The Fastlane Authors.
