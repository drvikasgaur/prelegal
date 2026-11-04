export type VariableType = "string" | "text" | "date" | "number" | "email" | "url";

export interface TemplateVariable {
  name: string;
  label: string;
  type: VariableType;
  example: string;
}

export interface CatalogEntry {
  id: string;
  title: string;
  category: string;
  description: string;
  file: string;
  variables: TemplateVariable[];
}

export interface LoadedTemplate {
  entry: CatalogEntry;
  markdown: string;
}

const PLACEHOLDER = /\{\{\s*([a-z][a-z0-9_]*)\s*\}\}/g;

// Escaping Markdown punctuation stops user input from changing the document's
// formatting (e.g. a name containing "**" or "#").
function escapeMarkdown(value: string): string {
  return value.replace(/\s*\n\s*/g, " ").replace(/[\\`*_{}[\]()#+\-.!|<>~]/g, "\\$&");
}

// Date inputs give "2027-01-01"; documents read better as "1 January 2027".
function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatValue(variable: TemplateVariable, raw: string): string {
  const value = raw.trim();
  return variable.type === "date" ? formatDate(value) : value;
}

/** Replace each {{name}} placeholder with the user's value for that variable. */
export function fillTemplate(
  markdown: string,
  variables: TemplateVariable[],
  values: Record<string, string>,
): string {
  const byName = new Map(variables.map((v) => [v.name, v]));
  return markdown.replace(PLACEHOLDER, (match, name: string) => {
    const variable = byName.get(name);
    if (!variable) return match;
    return escapeMarkdown(formatValue(variable, values[name] ?? ""));
  });
}
