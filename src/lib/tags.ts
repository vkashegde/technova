export function normalizeTags(input: string): string[] {
  const raw = input
    .split(/[,\s]+/g)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.replace(/^#/, ""))
    .map((t) => t.toLowerCase());

  // Keep only valid names (matches constraint in SQL).
  const valid = raw.filter((t) => /^[a-z0-9][a-z0-9_-]{0,49}$/.test(t));

  return Array.from(new Set(valid)).slice(0, 10);
}


