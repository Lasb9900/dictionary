export const normalizeStatus = (value?: string | null) =>
  value ? value.toLowerCase().replace(/\s+/g, "-") : "";
