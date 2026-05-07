type FormatShortUuidOptions = {
  prefix?: string;
  length?: number;
};

export function formatShortUuid(
  value: string | number | null | undefined,
  options: FormatShortUuidOptions = {}
): string {
  const { prefix = "", length = 8 } = options;
  const normalized = String(value ?? "").replace(/-/g, "").trim();

  if (!normalized) return "-";

  const safeLength = Number.isFinite(length) ? Math.max(1, Math.floor(length)) : 8;
  const shortValue = normalized.slice(0, safeLength).toUpperCase();

  return `${prefix}${shortValue}`;
}
