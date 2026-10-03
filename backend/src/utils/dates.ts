// Lenient date parsing for outage/maintenance inputs.
// Accepts ISO dates, "15 Sep 2026", "12 Sep 2026, 06:00 AM", and relative
// day words ("Today", "Tomorrow", "Yesterday") as used in seed data.
// Returns epoch ms, or null when unparseable.
export function parseWaterDate(input: unknown): number | null {
  if (typeof input !== "string") return null;
  let s = input.trim();
  if (!s) return null;
  const dayLabel = (d: Date): string =>
    `${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })} ${d.getFullYear()}`;
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  s = s
    .replace(/^tomorrow\b/i, dayLabel(tomorrow))
    .replace(/^yesterday\b/i, dayLabel(yesterday))
    .replace(/^today\b/i, dayLabel(now));
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : t;
}
