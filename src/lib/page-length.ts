export type Variant = 'mobile' | 'a4';
import { CVContent } from '@/components/cv-renderers/CVContent';

function clamp<T>(arr: T[], max: number): T[] {
  return Array.isArray(arr) ? arr.slice(0, Math.max(0, max)) : [];
}

function truncate(text: string | undefined, maxChars: number): string | undefined {
  if (!text) return text;
  return text.length > maxChars ? text.slice(0, maxChars - 1).trimEnd() + '…' : text;
}

export function adjustContentForVariant(content: CVContent, variant: Variant): CVContent {
  const isMobile = variant === 'mobile';

  const maxSkills = isMobile ? 10 : 16;
  const maxLangs = isMobile ? 5 : 8;
  const maxAbout = isMobile ? 500 : 900;
  const maxExp = isMobile ? 4 : 8;
  const maxEdu = isMobile ? 3 : 6;

  return {
    ...content,
    about: truncate(content.about, maxAbout),
    skills: clamp(content.skills || [], maxSkills),
    languages: clamp(content.languages || [], maxLangs),
    experience: clamp(content.experience || [], maxExp),
    education: clamp(content.education || [], maxEdu),
  };
}
