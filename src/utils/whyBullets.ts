export function buildWhyBullets(expl: any): string[] {
  if (!expl || !expl.subs) return [];

  const bullets: string[] = [];
  const subs = expl.subs;

  // Skill match
  if (subs.skill_match && subs.skill_match > 0.7) {
    bullets.push(`Starke Übereinstimmung bei Fähigkeiten (${Math.round(subs.skill_match * 100)}%)`);
  }

  // Commute
  if (subs.commute && subs.commute > 0.8) {
    bullets.push(`Kurze Anfahrtszeit (${Math.round(subs.commute * 100)}% Match)`);
  }

  // Language
  if (subs.language && subs.language > 0.9) {
    bullets.push(`Sprachliche Kompatibilität`);
  }

  // Benefits
  if (subs.benefits && subs.benefits > 0.6) {
    bullets.push(`Passende Zusatzleistungen`);
  }

  // Profile quality
  if (subs.profile_quality && subs.profile_quality > 0.8) {
    bullets.push(`Hohe Profilqualität`);
  }

  // Limit to 3 bullets
  return bullets.slice(0, 3);
}
