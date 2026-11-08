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
  icon: string;
}

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
      icon: '🤖',
    };
  }

  if (hasIos && !hasAndroid) {
    return {
      id: 'ios',
      name: 'iOS & Apple Ecosystem',
      badgeLabel: hasMac ? 'iOS & Apple' : 'iOS Only',
      badgeClass: 'chip-ios',
      targetAudience: 'Apple platform developers (iOS, iPadOS, macOS, Xcode, TestFlight, App Store Connect)',
      icon: '🍏',
    };
  }

  if (hasAndroid && hasIos && !hasMac) {
    return {
      id: 'dual',
      name: 'Mobile Dual-Stack',
      badgeLabel: 'Android + iOS Dual-Stack',
      badgeClass: 'chip-dual',
      targetAudience: 'Mobile engineers shipping unified features to both Google Play Store and iOS App Store',
      icon: '📱',
    };
  }

  if (hasMac && !hasAndroid && !hasIos) {
    return {
      id: 'mac',
      name: 'macOS Desktop Dedicated',
      badgeLabel: 'macOS Desktop Only',
      badgeClass: 'chip-mac',
      targetAudience: 'macOS developers and host-specific Xcode toolchain environments',
      icon: '🖥️',
    };
  }

  return {
    id: 'cross',
    name: 'Universal / Cross-Platform',
    badgeLabel: 'Universal (Cross-Platform)',
    badgeClass: 'chip-cross',
    targetAudience: 'Universal workflows (Git, Slack, shell execution, CI/CD orchestration across Linux/macOS/Windows)',
    icon: '🌐',
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
      <span class="chip-icon">${group.icon}</span>
      <span class="chip-label">${group.badgeLabel}</span>
    </span>
    <span class="category-badge">Category: <code>${action.category}</code></span>
    ${!isDep ? `<a href="/fastlane-handbook/actions-by-platform/#${group.id}" class="catalog-link">View all ${group.name} actions &rarr;</a>` : ''}
  </div>
  <div class="audience-row">
    <strong>Target Audience:</strong> ${group.targetAudience}
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
    icon: '🤖',
  },
  {
    id: 'ios',
    name: 'iOS & Apple Ecosystem Actions',
    badgeLabel: 'iOS & Apple',
    badgeClass: 'chip-ios',
    targetAudience: 'Apple developers building Swift/Obj-C codebases with Xcode, managing TestFlight (pilot), App Store releases (deliver), code signing (match, cert, sigh), and UI screenshots (snapshot).',
    icon: '🍏',
  },
  {
    id: 'dual',
    name: 'Mobile Dual-Stack Actions',
    badgeLabel: 'Android + iOS Dual-Stack',
    badgeClass: 'chip-dual',
    targetAudience: 'Cross-platform and multi-app engineers managing Crashlytics symbols, TestFairy distributions, and push notification configuration across both major mobile OSs.',
    icon: '📱',
  },
  {
    id: 'cross',
    name: 'Universal & Cross-Platform CI Actions',
    badgeLabel: 'Universal CI Tools',
    badgeClass: 'chip-cross',
    targetAudience: 'Any CI/CD engineer orchestrating Git tags, Slack / Teams / Discord release announcements, S3 file staging, version bumping, and shell scripting on macOS, Linux, or Windows.',
    icon: '🌐',
  },
  {
    id: 'mac',
    name: 'macOS Desktop Dedicated Actions',
    badgeLabel: 'macOS Desktop',
    badgeClass: 'chip-mac',
    targetAudience: 'macOS app developers and build pipelines that configure Xcode toolchains and desktop-only build environments.',
    icon: '🖥️',
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
      <span class="stat-icon">${grp.icon}</span>
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
  catalogMarkdown += `\n<h2 id="${grp.id}">${grp.icon} ${grp.name} (${grpActions.length} Actions)</h2>\n\n`;
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
