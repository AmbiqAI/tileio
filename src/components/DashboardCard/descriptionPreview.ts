// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

export function descriptionPreview(markdown: string): string {
  return markdown
    .replace(/^ {0,3}#{1,6}(?:[ \t]+.*)?\r?$/gm, '')
    .split(/\r?\n\s*\r?\n/)
    .find(paragraph => paragraph.trim())?.trim() || '';
}
