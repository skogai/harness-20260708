import { readFile, writeFile } from "fs/promises";
import { pathExists, ensureDir } from "fs-extra";
import { dirname } from "path";

const MARKER_STYLES = {
  xml: {
    begin: "<skogai_harness>",
    end: "</skogai_harness>",
  },
  markdown: {
    begin:
      '<harness:generated note="edits inside this block are overwritten by `harness sync`">',
    end: "</harness:generated>",
  },
  hash: {
    begin:
      '# <harness:generated note="edits inside this block are overwritten by `harness sync`">',
    end: "# </harness:generated>",
  },
};

export function getMarkers(style) {
  const markers = MARKER_STYLES[style];
  if (!markers) {
    throw new Error(`Unknown managed-block marker style: ${style}`);
  }
  return markers;
}

/**
 * Insert or replace the harness managed block in a file, preserving
 * all content outside the markers. Creates the file if it does not exist.
 */
export async function upsertManagedBlock(filePath, blockContent, style) {
  const { begin, end } = getMarkers(style);
  const block = `${begin}\n${blockContent.trim()}\n${end}`;

  if (!(await pathExists(filePath))) {
    await ensureDir(dirname(filePath));
    await writeFile(filePath, `${block}\n`, "utf-8");
    return filePath;
  }

  const existing = await readFile(filePath, "utf-8");
  const beginIndex = existing.indexOf(begin);
  const endIndex = existing.indexOf(end);

  let next;
  if (beginIndex !== -1 && endIndex !== -1 && endIndex > beginIndex) {
    next =
      existing.slice(0, beginIndex) +
      block +
      existing.slice(endIndex + end.length);
  } else if (beginIndex === -1 && endIndex === -1) {
    const separator = existing.endsWith("\n") ? "\n" : "\n\n";
    next = `${existing}${separator}${block}\n`;
  } else {
    throw new Error(
      `Corrupted harness markers in ${filePath}. Remove the stray marker and re-run sync.`,
    );
  }

  await writeFile(filePath, next, "utf-8");
  return filePath;
}

export async function readManagedBlock(filePath, style) {
  const { begin, end } = getMarkers(style);
  if (!(await pathExists(filePath))) {
    return null;
  }
  const existing = await readFile(filePath, "utf-8");
  const beginIndex = existing.indexOf(begin);
  const endIndex = existing.indexOf(end);
  if (beginIndex === -1 || endIndex === -1 || endIndex < beginIndex) {
    return null;
  }
  return existing.slice(beginIndex + begin.length, endIndex).trim();
}
