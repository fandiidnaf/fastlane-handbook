# Contributing to Fastlane Handbook

Thank you for your interest in contributing to **Fastlane Handbook**! This handbook is an independent, community-driven technical resource created by and for mobile automation engineers.

Our mission is to eliminate friction in Fastlane mobile automation by delivering accurate API references, practical multi-platform blueprints, and concrete architectural recipes for iOS, Android, Flutter, and React Native.

---

## Code of Conduct & Core Values

When contributing, please follow these core tenets:
- **Accuracy First**: Parameter types, environment variables, and return values should reflect Fastlane's actual Ruby implementation.
- **High Information Density**: Avoid generic fluff, filler prose, and AI slop. Provide code that developers can copy, paste, and run in CI/CD pipelines.
- **Cross-Platform Respect**: Fastlane serves native Android/iOS as well as hybrid Flutter and React Native setups. Ensure instructions account for project roots vs. platform directories (`android/` and `ios/`).
- **Constructive & Respectful**: We are all mobile developers helping each other automate tedious release tasks.

---

## Getting Started Locally

Fastlane Handbook is built with **Bun** and **Astro Starlight**.

### Prerequisites
- [Bun](https://bun.sh/) (v1.1 or higher)
- [Ruby](https://www.ruby-lang.org/) (v3.0+ with Bundler)
- [Fastlane](https://docs.fastlane.tools/) gem installed (`gem install fastlane` or `bundle install`)

### Setup Instructions

```bash
# 1. Fork and clone the repository
git clone https://github.com/<your-username>/fastlane-handbook.git
cd fastlane-handbook

# 2. Install dependencies with Bun
bun install

# 3. Start local development server
bun run dev
# The site will be available at http://localhost:4321/fastlane-handbook/
```

### Building & Verification

```bash
# Verify production build and page indexation
bun run build

# Preview production build locally
bun run preview
```

---

## How to Contribute

### 1. Improving Action References

Action pages in `src/content/docs/actions/` and `src/content/docs/deprecated-actions/` are generated from `src/data/fastlane-actions.json`.
- If an action option has missing descriptions, outdated deprecation notes, or bad links, update `scripts/extract-actions.rb` or `scripts/generate-action-docs.ts`.
- Run `bun run sync:actions` to regenerate the documentation pages.

### 2. Adding Guides & Architecture Blueprints

Guides live in `src/content/docs/`:
- `start/`: Setup roadmaps, installation, and architectural overviews.
- `platforms/`: Platform-specific execution guides (`android.mdx`, `ios.mdx`, `flutter.mdx`, `react-native.mdx`).
- `architecture/`: Single-app vs. flavor/scheme pipelines.
- `recipes/`: Production problem solvers (e.g. keystore management, App Store Connect API, zero-rebuild promotion).
- `rosetta-stone/`: Bridging Ruby concepts to Kotlin, Swift, and TypeScript developers.

When authoring a guide:
- Use standard MDX.
- Include concrete `Fastfile`, `Appfile`, or CLI invocations.
- Test that code samples have consistent 2-space indentation.
- If using diagrams, use fenced `mermaid` blocks.

---

## Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(platform)`: New platform guide or architectural recipe
- `fix(action)`: Correction to an action schema, parameter description, or code sample
- `docs(recipes)`: Add or update deployment blueprints
- `style(ui)`: UI, theme, or CSS adjustments
- `chore(deps)`: Dependency updates or workflow maintenance

---

## Submitting a Pull Request

1. **Create a topic branch**: `git checkout -b feature/my-new-recipe`
2. **Make your changes**: Write clear, well-tested documentation.
3. **Run local verification**:
   ```bash
   bun run build
   ```
   Ensure there are zero broken links, schema warnings, or compilation errors.
4. **Push and open a Pull Request**:
   - Provide a clear summary of what was added or changed.
   - Reference any relevant issues (e.g., `Fixes #12`).

---

## Questions and Support

For questions, open a discussion or file a GitHub Issue using our structured templates. Thank you for making mobile automation better for everyone!
