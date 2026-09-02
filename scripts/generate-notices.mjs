// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

/**
 * Generates THIRD-PARTY-NOTICES.md for the production dependency tree.
 *
 * Source of truth is `license-checker-rseidelsohn --production`, which walks the
 * installed node_modules tree for the current package-lock.json. Regenerate with
 * `npm run notices` after any dependency change and commit the result.
 *
 * The file is written to the repository root and committed. `vite.config.ts`
 * copies it into the build output (`build/`, which the Pages workflow uploads)
 * via the `thirdPartyNotices` plugin.
 */

import { init } from 'license-checker-rseidelsohn';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT_OUTPUT = path.join(ROOT, 'THIRD-PARTY-NOTICES.md');

/**
 * Licenses that are acceptable for redistribution in this project without a
 * further review. Anything outside this set is reported on stderr so that a
 * human decides before it ships.
 */
const ALLOWED_LICENSES = new Set([
  '0BSD',
  'Apache-2.0',
  'BlueOak-1.0.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'CC-BY-4.0',
  'CC0-1.0',
  'ISC',
  'MIT',
  'MIT-0',
  'Python-2.0',
  'Unlicense',
  'WTFPL',
]);

/**
 * Dual/compound license declarations that have been reviewed once and resolved.
 * Keeping them here (rather than in ALLOWED_LICENSES) keeps the decision visible.
 */
const REVIEWED_COMPOUND_LICENSES = new Map([
  ['(MIT OR GPL-3.0-or-later)', 'Used under MIT.'],
  ['(MIT AND Zlib)', 'MIT plus the zlib license; both are permissive.'],
  ['(MIT OR CC0-1.0)', 'Used under MIT.'],
  ['(MIT AND BSD-3-Clause)', 'Both permissive.'],
  ['(WTFPL OR MIT)', 'Used under MIT.'],
  ['(BSD-2-Clause OR MIT OR Apache-2.0)', 'Used under MIT.'],
  ['(MIT OR Apache-2.0)', 'Used under MIT.'],
  ['(Apache-2.0 OR MPL-1.1)', 'Used under Apache-2.0.'],
  [
    'Apache-2.0 AND MIT',
    'Both permissive. Build-time only: platform-specific SWC compiler binary, not shipped in the web bundle.',
  ],
]);

/**
 * Binary assets checked into the repository that npm cannot see. Each entry has
 * to be maintained by hand, with the origin of the file cited.
 */
const VENDORED_ASSETS = [
  {
    file: 'public/assets/sql-wasm.wasm',
    name: 'sql.js',
    version: '1.8.0',
    license: 'MIT',
    repository: 'https://github.com/sql-js/sql.js',
    note:
      'Prebuilt SQLite WebAssembly binary loaded at runtime by `jeep-sqlite` for the ' +
      'browser SQLite store. The version was identified by hashing the checked-in file ' +
      'against the published sql.js release tarballs: SHA-256 ' +
      '18fc45ef410e6015296dad9fa775684c96e71e7007b99f2d87799a18a354e750 is a byte-for-byte ' +
      'match for `package/dist/sql-wasm.wasm` in sql.js 1.8.0 and no other release. ' +
      'Note that `package-lock.json` currently resolves `sql.js` to 1.10.2 for `jeep-sqlite`; ' +
      'the checked-in binary is the older 1.8.0 build and is not refreshed by npm. ' +
      'sql.js embeds SQLite itself, which is in the public domain ' +
      '(https://www.sqlite.org/copyright.html).',
    licenseText: `MIT license
===========

Copyright (c) 2017 sql.js authors (see AUTHORS)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
];

function splitNameVersion(key) {
  const at = key.lastIndexOf('@');
  return { name: key.slice(0, at), version: key.slice(at + 1) };
}

function normalizeLicense(license) {
  if (!license) return 'UNKNOWN';
  return Array.isArray(license) ? license.join(' OR ') : String(license);
}

async function readLicenseText(entry) {
  if (!entry.licenseFile) return null;
  const base = path.basename(entry.licenseFile).toLowerCase();
  // license-checker falls back to the README when there is no license file;
  // a README is not a license text, so do not reproduce it as one.
  if (base.startsWith('readme')) return null;
  try {
    const text = await fs.readFile(entry.licenseFile, 'utf8');
    return text.trim() || null;
  } catch {
    return null;
  }
}

function scanForReview(packages) {
  const flagged = [];
  for (const pkg of packages) {
    if (ALLOWED_LICENSES.has(pkg.license)) continue;
    if (REVIEWED_COMPOUND_LICENSES.has(pkg.license)) continue;
    flagged.push(pkg);
  }
  return flagged;
}

function renderMarkdown(packages) {
  const breakdown = new Map();
  for (const pkg of packages) {
    breakdown.set(pkg.license, (breakdown.get(pkg.license) ?? 0) + 1);
  }
  const sortedBreakdown = [...breakdown.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );

  const lines = [];
  lines.push('# Third-Party Notices');
  lines.push('');
  lines.push(
    'Tileio itself is licensed under the BSD 3-Clause License (see `LICENSE`). ' +
      'This file lists the third-party software distributed with, or bundled into, ' +
      'the Tileio web application, together with the license under which each ' +
      'component is used.'
  );
  lines.push('');
  lines.push(
    'This file is generated by `npm run notices` from the production dependency ' +
      'tree resolved by `package-lock.json`. Do not edit it by hand; edit ' +
      '`scripts/generate-notices.mjs` and regenerate. The output is a pure function of ' +
      'the resolved dependency tree, so regenerating without a dependency change produces ' +
      'an identical file.'
  );
  lines.push('');
  lines.push(
    `Production npm packages: ${packages.length}. Checked-in third-party assets: ${VENDORED_ASSETS.length}.`
  );
  lines.push('');
  lines.push('## License summary');
  lines.push('');
  lines.push('| License | Packages |');
  lines.push('| --- | --- |');
  for (const [license, count] of sortedBreakdown) {
    lines.push(`| ${license} | ${count} |`);
  }
  lines.push('');
  lines.push('## Checked-in third-party assets');
  lines.push('');
  for (const asset of VENDORED_ASSETS) {
    lines.push(`### ${asset.name} ${asset.version} — \`${asset.file}\``);
    lines.push('');
    lines.push(`- License: ${asset.license}`);
    lines.push(`- Repository: ${asset.repository}`);
    lines.push(`- Notes: ${asset.note}`);
    lines.push('');
    if (asset.licenseText) {
      lines.push('```text');
      lines.push(asset.licenseText);
      lines.push('```');
      lines.push('');
    }
  }
  lines.push('## npm production dependencies');
  lines.push('');
  for (const pkg of packages) {
    lines.push(`### ${pkg.name} ${pkg.version}`);
    lines.push('');
    lines.push(`- License: ${pkg.license}`);
    if (pkg.repository) lines.push(`- Repository: ${pkg.repository}`);
    if (pkg.publisher) lines.push(`- Publisher: ${pkg.publisher}`);
    const resolution = REVIEWED_COMPOUND_LICENSES.get(pkg.license);
    if (resolution) lines.push(`- Notes: ${resolution}`);
    lines.push('');
    if (pkg.licenseText) {
      lines.push('```text');
      lines.push(pkg.licenseText.replace(/```/g, "''''"));
      lines.push('```');
      lines.push('');
    } else {
      lines.push(
        '_No license text is distributed with this package; see the repository above._'
      );
      lines.push('');
    }
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

function collect() {
  return new Promise((resolve, reject) => {
    init(
      {
        start: ROOT,
        production: true,
        excludePrivatePackages: true,
      },
      (err, json) => (err ? reject(err) : resolve(json))
    );
  });
}

async function main() {
  const json = await collect();
  const selfName = JSON.parse(await fs.readFile(path.join(ROOT, 'package.json'), 'utf8')).name;

  const packages = [];
  for (const [key, entry] of Object.entries(json)) {
    const { name, version } = splitNameVersion(key);
    if (name === selfName) continue;
    packages.push({
      name,
      version,
      license: normalizeLicense(entry.licenses),
      repository: entry.repository ?? null,
      publisher: entry.publisher ?? null,
      licenseText: await readLicenseText(entry),
    });
  }
  packages.sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));

  const markdown = renderMarkdown(packages);
  await fs.writeFile(ROOT_OUTPUT, markdown, 'utf8');

  const missingText = packages.filter((p) => !p.licenseText);
  const flagged = scanForReview(packages);

  console.log(`Wrote ${path.relative(ROOT, ROOT_OUTPUT)}`);
  console.log(`Production packages: ${packages.length}`);
  if (missingText.length > 0) {
    console.log(
      `Packages without a distributed license file: ${missingText.length} ` +
        `(${missingText.map((p) => p.name).join(', ')})`
    );
  }
  if (flagged.length > 0) {
    console.error('');
    console.error('Licenses outside the reviewed allow-list — review before shipping:');
    for (const pkg of flagged) {
      console.error(`  ${pkg.name}@${pkg.version}: ${pkg.license}`);
    }
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
