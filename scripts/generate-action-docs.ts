import fs from 'node:fs';
import path from 'node:path';

interface Option {
  key: string;
  env_name: string;
  description: string;
  data_type: string | null;
  default_value: string | null;
  optional: boolean;
  sensitive: boolean;
  conflicting_options?: string[] | null;
}

interface OutputValue {
  key: string;
  description: string;
}

interface Action {
  name: string;
  category: string;
  description: string;
  details: string;
  authors: string[];
  platforms: string[];
  options: Option[];
  output: OutputValue[];
  return_value: string;
  return_type: string;
  examples: string[];
  aliases: string[];
  is_deprecated: boolean;
  source_file: string | null;
  source_url: string | null;
}

interface PlatformGroupInfo {
  id: 'android' | 'ios' | 'dual' | 'cross' | 'mac';
  name: string;
  badgeLabel: string;
  badgeClass: string;
  targetAudience: string;
  svgIcon: string;
  statSvg: string;
}

const SVG_ICONS = {
  android: `<svg class="platform-svg-inline android-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.997-3.459a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4111 13.8533 8.0834 12 8.0834s-3.5902.3277-5.1365.8664L4.8412 5.4469a.4161.4161 0 10-.7197.4155l1.997 3.459C2.6876 11.2613.4167 15.311.4167 20h23.1666c0-4.689-2.2709-8.7387-5.7013-10.6786"/></svg>`,
  ios: `<svg class="platform-svg-inline ios-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.88c.67-.82 1.13-1.96.99-3.11-.99.04-2.16.66-2.85 1.47-.6.7-1.13 1.83-.98 2.96 1.1.09 2.19-.53 2.84-1.32"/></svg>`,
  dual: `<svg class="platform-svg-inline dual-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  cross: `<svg class="platform-svg-inline cross-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  mac: `<svg class="platform-svg-inline mac-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
};

const STAT_SVGS = {
  android: `<svg class="stat-svg-large android-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.997-3.459a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4111 13.8533 8.0834 12 8.0834s-3.5902.3277-5.1365.8664L4.8412 5.4469a.4161.4161 0 10-.7197.4155l1.997 3.459C2.6876 11.2613.4167 15.311.4167 20h23.1666c0-4.689-2.2709-8.7387-5.7013-10.6786"/></svg>`,
  ios: `<svg class="stat-svg-large ios-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.88c.67-.82 1.13-1.96.99-3.11-.99.04-2.16.66-2.85 1.47-.6.7-1.13 1.83-.98 2.96 1.1.09 2.19-.53 2.84-1.32"/></svg>`,
  dual: `<svg class="stat-svg-large dual-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  cross: `<svg class="stat-svg-large cross-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  mac: `<svg class="stat-svg-large mac-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
};

function getPlatformGroup(platforms: string[]): PlatformGroupInfo {
  const p = platforms.map(x => x.toLowerCase());
  const hasAndroid = p.includes('android');
  const hasIos = p.includes('ios');
  const hasMac = p.includes('mac');

  if (hasAndroid && !hasIos && !hasMac) {
    return {
      id: 'android',
      name: 'Android Dedicated',
      badgeLabel: 'Android Dedicated',
      badgeClass: 'chip-android',
      targetAudience: 'Native Android developers (Gradle, Google Play Store, Screengrab, Keystore)',
      svgIcon: SVG_ICONS.android,
      statSvg: STAT_SVGS.android,
    };
  }

  if (hasIos && !hasAndroid) {
    return {
      id: 'ios',
      name: 'iOS & Apple Ecosystem',
      badgeLabel: hasMac ? 'iOS & Apple' : 'iOS Only',
      badgeClass: 'chip-ios',
      targetAudience: 'Apple platform developers (iOS, iPadOS, macOS, Xcode, TestFlight, App Store Connect)',
      svgIcon: SVG_ICONS.ios,
      statSvg: STAT_SVGS.ios,
    };
  }

  if (hasAndroid && hasIos && !hasMac) {
    return {
      id: 'dual',
      name: 'Mobile Dual-Stack',
      badgeLabel: 'Android + iOS Dual-Stack',
      badgeClass: 'chip-dual',
      targetAudience: 'Mobile engineers shipping unified features to both Google Play Store and iOS App Store',
      svgIcon: SVG_ICONS.dual,
      statSvg: STAT_SVGS.dual,
    };
  }

  if (hasMac && !hasAndroid && !hasIos) {
    return {
      id: 'mac',
      name: 'macOS Desktop Dedicated',
      badgeLabel: 'macOS Desktop Only',
      badgeClass: 'chip-mac',
      targetAudience: 'macOS developers and host-specific Xcode toolchain environments',
      svgIcon: SVG_ICONS.mac,
      statSvg: STAT_SVGS.mac,
    };
  }

  return {
    id: 'cross',
    name: 'Universal / Cross-Platform',
    badgeLabel: 'Universal (Cross-Platform)',
    badgeClass: 'chip-cross',
    targetAudience: 'Universal workflows (Git, Slack, shell execution, CI/CD orchestration across Linux/macOS/Windows)',
    svgIcon: SVG_ICONS.cross,
    statSvg: STAT_SVGS.cross,
  };
}

const rootDir = process.cwd();
const actionsPath = path.join(rootDir, 'src/data/fastlane-actions.json');
const docsActionsDir = path.join(rootDir, 'src/content/docs/actions');
const docsDeprecatedDir = path.join(rootDir, 'src/content/docs/deprecated-actions');
const catalogMdxPath = path.join(rootDir, 'src/content/docs/actions-by-platform.mdx');

if (!fs.existsSync(actionsPath)) {
  console.error(`Actions file not found: ${actionsPath}`);
  process.exit(1);
}

const actions: Action[] = JSON.parse(fs.readFileSync(actionsPath, 'utf8'));

// Clean and recreate directories
if (fs.existsSync(docsActionsDir)) {
  fs.rmSync(docsActionsDir, { recursive: true, force: true });
}
fs.mkdirSync(docsActionsDir, { recursive: true });

if (fs.existsSync(docsDeprecatedDir)) {
  fs.rmSync(docsDeprecatedDir, { recursive: true, force: true });
}
fs.mkdirSync(docsDeprecatedDir, { recursive: true });

function stripDeadLinks(str: string): string {
  if (!str) return '';
  return str.replace(
    /\[([^\]]+)\]\(https?:\/\/(?:www\.)?(?:apteligent\.com|hockeyapp\.net|mint\.splunk\.com)[^\)]*\)/gi,
    '$1'
  );
}

function escapeMarkdownTable(str: string): string {
  if (!str) return '';
  const sanitized = stripDeadLinks(str);
  return sanitized
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ');
}

function cleanDetails(str: string): string {
  if (!str) return '';
  const sanitized = stripDeadLinks(str);
  return sanitized
    .replace(/```([a-z0-9_-]+)\|/gi, '```$1')
    .replace(/```\|/g, '```')
    .replace(/```no-highlight/gi, '```txt')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');
}

function cleanRubyExample(code: string): string {
  if (!code) return '';
  const clean = code.trim().replace(/^```[a-z]*\r?\n?/i, '').replace(/\r?\n?```$/i, '');
  const lines = clean.split(/\r?\n/);
  if (lines.length <= 1) return lines[0]?.trim() || '';

  let indent = 0;
  const output: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      output.push('');
      continue;
    }

    const isClosing = /^(\)|\]|\}|end\b|else\b|elsif\b|rescue\b|ensure\b)/.test(line);
    if (isClosing && indent > 0) {
      indent--;
    }

    output.push('  '.repeat(indent) + line);

    let opens = 0;
    for (const char of line) {
      if (char === '(' || char === '{' || char === '[') opens++;
      if (char === ')' || char === '}' || char === ']') opens--;
    }

    if (
      /\bdo(\s*\|[^|]*\|)?\s*$/.test(line) ||
      /^(class|module|def|begin|case|else|elsif|rescue|ensure)\b/.test(line) ||
      (/^(if|unless)\b/.test(line) && !/then\s+.*$/.test(line))
    ) {
      opens++;
    }

    if (opens > 0) {
      indent += opens;
    } else if (opens < 0 && !isClosing) {
      indent = Math.max(0, indent + opens);
    }
  }

  return output.join('\n');
}

let activeCount = 0;
let deprecatedCount = 0;

for (const action of actions) {
  const isDep = action.is_deprecated;
  const targetDir = isDep ? docsDeprecatedDir : docsActionsDir;
  const filePath = path.join(targetDir, `${action.name}.mdx`);

  if (isDep) deprecatedCount++;
  else activeCount++;

  const group = getPlatformGroup(action.platforms);

  const platformsBadge = action.platforms.length > 0
    ? action.platforms.map(p => `\`${p}\``).join(', ')
    : '`Universal / Cross-platform`';

  let optionsSection = '';
  if (action.options && action.options.length > 0) {
    optionsSection = `## Parameters & Options

Total options available: **${action.options.length}**

| Key | Type | Env Variable | Default | Required | Description |
| :--- | :--- | :--- | :--- | :---: | :--- |
${action.options.map(opt => {
  const typeStr = opt.data_type ? `\`${opt.data_type}\`` : '`String`';
  const envStr = opt.env_name ? `\`${opt.env_name}\`` : '`-`';
  const defaultStr = opt.default_value !== null && opt.default_value !== '' ? `\`${escapeMarkdownTable(opt.default_value)}\`` : '`-`';
  const reqStr = opt.optional ? 'No' : '**Yes**';
  const descStr = escapeMarkdownTable(opt.description);
  return `| \`${opt.key}\` | ${typeStr} | ${envStr} | ${defaultStr} | ${reqStr} | ${descStr} |`;
}).join('\n')}
`;
  } else {
    optionsSection = `## Parameters & Options\n\nThis action takes no parameters or options.\n`;
  }

  let outputSection = '';
  if (action.output && action.output.length > 0) {
    outputSection = `## Lane Context Shared Values

This action writes the following values to \`Actions.lane_context[SharedValues::...]\`:

| Key | Description |
| :--- | :--- |
${action.output.map(out => `| \`SharedValues::${out.key}\` | ${escapeMarkdownTable(out.description)} |`).join('\n')}
`;
  }

  let examplesSection = '';
  if (action.examples && action.examples.length > 0) {
    examplesSection = `## Examples

${action.examples.map(ex => {
  const formatted = cleanRubyExample(ex);
  return `\`\`\`ruby\n${formatted}\n\`\`\``;
}).join('\n\n')}
`;
  }

  let detailsSection = '';
  if (action.details && action.details.trim().length > 0) {
    detailsSection = `## Details

${cleanDetails(action.details)}
`;
  }

  const safeRawDesc = stripDeadLinks(action.description || '');
  const safeDesc = safeRawDesc && safeRawDesc.trim().length > 0
    ? safeRawDesc.trim().replace(/\r?\n/g, ' ').slice(0, 200)
    : `${action.name} action documentation`;

  const deprecationNotice = isDep
    ? `:::caution[Deprecated Action]
This action is marked as **DEPRECATED** in upstream Fastlane. It may no longer be actively maintained or may be superseded by newer tools or native vendor APIs. Review the action source or consider modern alternatives.
:::\n\n`
    : '';

  const metadataCardHtml = `<div class="action-metadata-card">
  <div class="metadata-row">
    <span class="platform-chip ${group.badgeClass}">
      <span class="chip-icon">${group.svgIcon}</span>
      <span class="chip-label">${group.badgeLabel}</span>
    </span>
    <span class="category-badge">Category: <code>${action.category}</code></span>
    ${!isDep ? `<a href="/fastlane-handbook/actions-by-platform/#${group.id}" class="catalog-link">Platform Catalog &rarr;</a>` : ''}
  </div>
  <div class="audience-row">
    <span class="audience-label">Target Audience:</span>
    <span class="audience-text">${group.targetAudience}</span>
  </div>
</div>`;

  const mdxContent = `---
title: ${JSON.stringify(action.name + (isDep ? ' [DEPRECATED]' : ''))}
description: ${JSON.stringify(safeDesc)}
---

${deprecationNotice}${metadataCardHtml}

<div class="community-disclaimer">
  <strong>Community Action Reference</strong>: Inspected directly from Fastlane core ruby gem definitions.
</div>

**Supported Platforms:** ${platformsBadge}

${action.description ? `> ${cleanDetails(action.description)}\n` : ''}
${detailsSection}
${optionsSection}
${outputSection}
${examplesSection}

## Source & Upstream

- **Gem Action**: \`${action.source_file || action.name + '.rb'}\`
- **Upstream Source**: [Inspect Ruby Implementation on GitHub](${action.source_url || 'https://github.com/fastlane/fastlane'})
- **Authors**: ${action.authors.map(a => `\`${a}\``).join(', ') || 'Fastlane Team'}
`;

  fs.writeFileSync(filePath, mdxContent, 'utf8');
}

// Generate the Comprehensive Actions by Platform Catalog
const activeActions = actions.filter(a => !a.is_deprecated);
const groups: PlatformGroupInfo[] = [
  {
    id: 'android',
    name: 'Android Dedicated Actions',
    badgeLabel: 'Android Dedicated',
    badgeClass: 'chip-android',
    targetAudience: 'Native Android developers managing Gradle builds, signing keystores, Google Play Store uploads (supply), and emulator screenshots (screengrab).',
    svgIcon: SVG_ICONS.android,
    statSvg: STAT_SVGS.android,
  },
  {
    id: 'ios',
    name: 'iOS & Apple Ecosystem Actions',
    badgeLabel: 'iOS & Apple',
    badgeClass: 'chip-ios',
    targetAudience: 'Apple developers building Swift/Obj-C codebases with Xcode, managing TestFlight (pilot), App Store releases (deliver), code signing (match, cert, sigh), and UI screenshots (snapshot).',
    svgIcon: SVG_ICONS.ios,
    statSvg: STAT_SVGS.ios,
  },
  {
    id: 'dual',
    name: 'Mobile Dual-Stack Actions',
    badgeLabel: 'Android + iOS Dual-Stack',
    badgeClass: 'chip-dual',
    targetAudience: 'Cross-platform and multi-app engineers managing Crashlytics symbols, TestFairy distributions, and push notification configuration across both major mobile OSs.',
    svgIcon: SVG_ICONS.dual,
    statSvg: STAT_SVGS.dual,
  },
  {
    id: 'cross',
    name: 'Universal & Cross-Platform CI Actions',
    badgeLabel: 'Universal CI Tools',
    badgeClass: 'chip-cross',
    targetAudience: 'Any CI/CD engineer orchestrating Git tags, Slack / Teams / Discord release announcements, S3 file staging, version bumping, and shell scripting on macOS, Linux, or Windows.',
    svgIcon: SVG_ICONS.cross,
    statSvg: STAT_SVGS.cross,
  },
  {
    id: 'mac',
    name: 'macOS Desktop Dedicated Actions',
    badgeLabel: 'macOS Desktop',
    badgeClass: 'chip-mac',
    targetAudience: 'macOS app developers and build pipelines that configure Xcode toolchains and desktop-only build environments.',
    svgIcon: SVG_ICONS.mac,
    statSvg: STAT_SVGS.mac,
  },
];

let catalogMarkdown = `---
title: Fastlane Actions Catalog by Platform
description: Complete index of all 222 active Fastlane actions categorized by platform (Android, iOS & Apple, Mobile Dual-Stack, Cross-Platform, and macOS).
---

<div class="platform-catalog-header">
  <p class="catalog-intro">
    Discover and navigate all <strong>${activeActions.length} active Fastlane actions</strong> grouped by target operating system and mobile platform. Use this catalog to quickly identify the exact tools suited for your stack.
  </p>
  <div class="platform-stats-grid">
`;

for (const grp of groups) {
  const count = activeActions.filter(a => getPlatformGroup(a.platforms).id === grp.id).length;
  catalogMarkdown += `    <a href="#${grp.id}" class="stat-card ${grp.badgeClass}">
      <span class="stat-icon-wrapper">${grp.statSvg}</span>
      <span class="stat-count">${count} Actions</span>
      <span class="stat-title">${grp.name}</span>
    </a>\n`;
}

catalogMarkdown += `  </div>
</div>

---
`;

for (const grp of groups) {
  const grpActions = activeActions.filter(a => getPlatformGroup(a.platforms).id === grp.id);
  catalogMarkdown += `\n<h2 id="${grp.id}" class="platform-heading"><span class="heading-icon">${grp.svgIcon}</span> <span>${grp.name} (${grpActions.length} Actions)</span></h2>\n\n`;
  catalogMarkdown += `> **Who it's for:** ${grp.targetAudience}\n\n`;
  catalogMarkdown += `| Action | Category | Description | Parameters | Source |\n`;
  catalogMarkdown += `| :--- | :--- | :--- | :---: | :---: |\n`;

  for (const act of grpActions) {
    const rawDesc = stripDeadLinks(act.description || '');
    const cleanDesc = rawDesc ? escapeMarkdownTable(rawDesc.slice(0, 160) + (rawDesc.length > 160 ? '...' : '')) : 'Action documentation';
    const optCount = act.options ? act.options.length : 0;
    const optLabel = optCount === 0 ? '-' : `\`${optCount}\``;
    const upstreamLink = act.source_url ? `[Ruby Code](${act.source_url})` : '-';
    catalogMarkdown += `| [\`${act.name}\`](/fastlane-handbook/actions/${act.name}/) | \`${act.category}\` | ${cleanDesc} | ${optLabel} | ${upstreamLink} |\n`;
  }
}

fs.writeFileSync(catalogMdxPath, catalogMarkdown, 'utf8');

console.log(`==> Extracted: ${activeCount} active actions and ${deprecatedCount} deprecated actions.`);
console.log(`==> Generated platform catalog at ${catalogMdxPath}`);
