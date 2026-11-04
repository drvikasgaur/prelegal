import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { CatalogEntry, LoadedTemplate } from "./template";

// The template dataset lives at the repository root (see templates/catalog.json).
const TEMPLATES_DIR = path.join(process.cwd(), "..", "templates");

export async function loadTemplate(id: string): Promise<LoadedTemplate> {
  const catalog = JSON.parse(
    await readFile(path.join(TEMPLATES_DIR, "catalog.json"), "utf-8"),
  ) as { templates: CatalogEntry[] };

  const entry = catalog.templates.find((t) => t.id === id);
  if (!entry) {
    throw new Error(`Template "${id}" is not listed in templates/catalog.json`);
  }

  const markdown = await readFile(path.join(TEMPLATES_DIR, entry.file), "utf-8");
  return { entry, markdown };
}
