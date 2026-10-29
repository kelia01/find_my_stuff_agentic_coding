export function parsePlace(search: string): string | null {
  const v = new URLSearchParams(search).get("place");
  return v && v.trim() ? v.trim() : null;
}

export function spotUrl(origin: string, spot: string): string {
  return `${origin}/?place=${encodeURIComponent(spot)}`;
}
