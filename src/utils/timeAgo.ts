export function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - d);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'gerade eben';
  if (m < 60) return `vor ${m} Min.`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h} Std.`;
  const dys = Math.floor(h / 24);
  if (dys < 7) return `vor ${dys} Tg.`;
  return new Date(iso).toLocaleDateString('de-DE');
}