# Fastlane Handbook 🚀

An independent, high-density community handbook and complete API reference for [Fastlane](https://github.com/fastlane/fastlane) mobile automation.

[![Live Website](https://img.shields.io/badge/Live%20Docs-fandiidnaf.github.io%2Ffastlane--handbook-e11d48?style=for-the-badge&logo=githubpages&logoColor=white)](https://fandiidnaf.github.io/fastlane-handbook/)
[![GitHub Discussions](https://img.shields.io/badge/Discussions-Join%20Chat-238636?style=for-the-badge&logo=github)](https://github.com/fandiidnaf/fastlane-handbook/discussions)
[![License: MIT](https://img.shields.io/badge/License-MIT-30363D?style=for-the-badge)](LICENSE)

> 📖 **Read the Live Documentation:** [https://fandiidnaf.github.io/fastlane-handbook/](https://fandiidnaf.github.io/fastlane-handbook/)  
> 💬 **Join the Discussion & Ask Questions:** [GitHub Discussions](https://github.com/fandiidnaf/fastlane-handbook/discussions)

> **Disclaimer & Legal Notice:**
> Fastlane Handbook is an independent, community-created technical handbook authored by fans and automation practitioners. It is **not** an official Fastlane project and is neither affiliated with, maintained by, nor endorsed by Fastlane.
>
> Fastlane is an open-source project originally created by Felix Krause and maintained by the Fastlane Authors under the **MIT License**. This handbook respects and complies with the MIT License terms.

---

## Mission & Purpose

Fastlane is the gold standard for mobile CI/CD automation across iOS and Android. Today, mobile engineering encompasses a rich multi-stack ecosystem—including **Kotlin & Java**, **Swift & Objective-C**, **Flutter (Dart)**, **React Native (TypeScript)**, as well as **Kotlin Multiplatform (KMP)**, **.NET MAUI**, **Unity**, and **Capacitor**.

Fastlane Handbook is designed as an exhaustive, production-grade technical companion that empowers mobile developers across all frameworks:

1. **Complete Introspected Reference**: Explores all 238+ built-in actions directly from the underlying Fastlane Ruby gem, presenting full parameter schemas, data types, environment variable fallbacks, default values, and return types.
2. **Ruby Rosetta Stone**: Bridges Ruby idioms (Symbols, closure blocks, Bundler gemsets) into familiar concepts for engineers coming from Kotlin, Swift, TypeScript, or Dart.
3. **Production Architecture Blueprints**: Delivers battle-tested patterns for real-world release pipelines—including multi-flavor/scheme matrix builds, zero-rebuild Play Store track promotion, encrypted keystore security guards, and App Store Connect API (`.p8`) automation.
4. **Lane Context Dataflow**: Maps how actions share state through `Actions.lane_context[SharedValues::...]`, clarifying data handoffs between test, build, and distribution stages.
5. **Framework-Agnostic Design**: Demonstrates how artifact-first automation applies cleanly whether your binaries originate from native Gradle/Xcode, cross-platform CLI toolchains, or custom game engines.

---

## Features

- **222+ Active Actions Extracted**: Every action is extracted directly from the Fastlane Ruby gem AST, detailing types, environment variable fallbacks, required flags, and shared context outputs.
- **16 Deprecated Actions Segregated**: Deprecated legacy actions are isolated into a dedicated section with clear alternatives and warnings.
- **Upstream Sync Engine**: Automated GitHub Actions watcher and Ruby extractor that detects new Fastlane releases on GitHub and regenerates documentation automatically.
- **Flight Control / High-Density Theme**: Built with Astro Starlight, strictly designed to avoid generic AI slop (zero nested cards, zero purple gradients, high-contrast typography, monospace-accented tokens).
- **Client-Side Fulltext Search**: Instant client-side search powered by Pagefind—zero server latency.
- **Production Blueprints**: Step-by-step implementation guides for single-app pipelines, product flavors & schemes, zero-rebuild Play Store promotion, and App Store Connect API (`.p8`) auth.

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
git clone https://github.com/fandiidnaf/fastlane-handbook.git
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
│   ├── workflows/
│   │   ├── deploy.yml              # GitHub Pages deployment workflow
│   │   └── upstream-sync.yml       # Upstream release watcher & auto-sync
│   ├── ISSUE_TEMPLATE/             # GitHub Issue forms (Bug & Feature)
│   ├── PULL_REQUEST_TEMPLATE.md    # Pull Request checklist
│   └── dependabot.yml              # Automated dependency security scanning
├── src/
│   ├── components/                 # Custom UI components (PlatformCard)
│   ├── content/
│   │   └── docs/
│   │       ├── index.mdx           # Homepage
│   │       ├── start/              # Roadmap & architecture
│   │       ├── platforms/          # Android, iOS, Flutter, React Native
│   │       ├── architecture/       # Single-app & flavors/schemes
│   │       ├── rosetta-stone/      # Ruby for Flutter, RN, Swift, Kotlin devs
│   │       ├── recipes/            # Zero-rebuild, security, App Store API
│   │       ├── internals/          # Lane context, Spaceship API, custom actions
│   │       ├── actions/            # 222 active action reference docs
│   │       └── deprecated-actions/ # 16 legacy deprecated action reference docs
│   ├── data/
│   │   ├── fastlane-actions.json   # Raw extracted action schemas
│   │   └── fastlane-version.json   # Upstream version & sync timestamp
│   └── styles/
│       └── custom.css              # Impeccable flight control styling tokens
├── scripts/
│   ├── extract-actions.rb          # Ruby script to introspect Fastlane actions
│   └── generate-action-docs.ts     # TypeScript script to emit MDX pages
├── CONTRIBUTING.md                 # Contribution guidelines
├── PRODUCT.md                      # Impeccable product context
├── DESIGN.md                       # Impeccable visual tokens and rules
├── astro.config.mjs
└── package.json
```

---

## License

This project is licensed under the [MIT License](LICENSE) - Copyright (c) 2026 fandiidnaf and Fastlane Handbook Contributors.
Fastlane is licensed under the MIT License, Copyright (c) The Fastlane Authors.
