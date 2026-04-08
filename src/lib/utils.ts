export function pm(s) {
  const rows = s
    .trim()
    .split("\n")
    .map((r) => r.trim());
  const w = Math.max(...rows.map((r) => r.length));
  return rows.map((r) => {
    while (r.length < w) r += ".";
    return r.substring(0, w).split("");
  });
}
