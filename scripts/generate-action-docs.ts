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

const rootDir = process.cwd();
const actionsPath = path.join(rootDir, 'src/data/fastlane-actions.json');
const docsActionsDir = path.join(rootDir, 'src/content/docs/actions');
const docsDeprecatedDir = path.join(rootDir, 'src/content/docs/deprecated-actions');

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

function escapeMarkdownTable(str: string): string {
  if (!str) return '';
  return str
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
  return str
    .replace(/```([a-z0-9_-]+)\|/gi, '```$1')
    .replace(/```\|/g, '```')
    .replace(/```no-highlight/gi, '```txt')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');
}

let activeCount = 0;
let deprecatedCount = 0;

for (const action of actions) {
  const isDep = action.is_deprecated;
  const targetDir = isDep ? docsDeprecatedDir : docsActionsDir;
  const filePath = path.join(targetDir, `${action.name}.mdx`);

  if (isDep) deprecatedCount++;
  else activeCount++;

  const platformsBadge = action.platforms.length > 0
    ? action.platforms.map(p => `\`${p}\``).join(', ')
    : '`All platforms (cross-platform)`';

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
  const cleanEx = ex.trim().replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '');
  return `\`\`\`ruby\n${cleanEx}\n\`\`\``;
}).join('\n\n')}
`;
  }

  let detailsSection = '';
  if (action.details && action.details.trim().length > 0) {
    detailsSection = `## Details

${cleanDetails(action.details)}
`;
  }

  const safeDesc = action.description && action.description.trim().length > 0
    ? action.description.trim().replace(/\r?\n/g, ' ').slice(0, 200)
    : `${action.name} action documentation`;

  const deprecationNotice = isDep
    ? `:::caution[Deprecated Action]
This action is marked as **DEPRECATED** in upstream Fastlane. It may no longer be actively maintained or may be superseded by newer tools or native vendor APIs. Review the action source or consider modern alternatives.
:::\n\n`
    : '';

  const mdxContent = `---
title: ${JSON.stringify(action.name + (isDep ? ' [DEPRECATED]' : ''))}
description: ${JSON.stringify(safeDesc)}
---

${deprecationNotice}<div class="community-disclaimer">
  <strong>Community Action Reference</strong>: Inspected directly from Fastlane core ruby gem definitions.
</div>

**Category:** \`${action.category}\` | **Platforms:** ${platformsBadge}

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

console.log(`==> Extracted: ${activeCount} active actions and ${deprecatedCount} deprecated actions.`);
