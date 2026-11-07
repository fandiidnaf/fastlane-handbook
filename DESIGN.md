# DESIGN.md - Fastlane Handbook

## Design Philosophy: Flight Control / High-Density Terminal

### Modes
- Primary: **Read** (comprehension, code legibility, parameter scanning).
- Secondary: **Operate** (copying commands, searching action flags, configuring CI environment variables).

### Palette & Tokens
- **Canvas / Background**:
  - Dark: `#090D16` (Deep aerospace carbon)
  - Dark Elevated Surface: `#111827` (Card / sidebar / panel)
  - Dark Border: `#1F2937`
  - Light Canvas: `#F8FAFC`
  - Light Surface: `#FFFFFF`
  - Light Border: `#E2E8F0`
- **Brand Accents**:
  - Rocket Crimson: `#E11D48` (Primary brand accent, interactive elements)
  - Crimson Hover: `#F43F5E`
  - Flight Amber: `#F59E0B` (Warning, deprecated tags, status indicators)
  - Emerald Green: `#10B981` (Success, required parameters, return types)
  - Cyan / Cobalt: `#06B6D4` (Environment variables, symbols)

### Typography
- **Prose & Headings**: System sans (`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`).
- **Code & Monospace**: High-legibility developer monospace (`ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace`).
- High-contrast rules: Contrast ratio minimum 7:1 for body copy against canvas.

### Anti-AI Slop Rules
1. **No nested cards within cards**: Use clean dividers, borders, and typographic rhythm rather than nesting rounded boxes inside rounded boxes.
2. **No purple-to-blue linear gradients**: Use deliberate, purposeful single-hue brand accents (`#E11D48`).
3. **No generic pill-shaped floating buttons with blurry drop shadows**: Buttons are structured, compact, with clean border radius (`4px` to `6px`).
4. **No throat-clearing prose**: Never start guides with "In this tutorial we will dive into...". Open directly with the problem statement, configuration snippet, or architectural diagram.
5. **Table-first parameter reference**: Fastlane action options must be presented in compact, sortable, scannable tables showing Key, Env Var, Type, Default, and Required status.
