export interface CVLanguage {
  name: string;
  level?: string;
}

export interface CVExperience {
  role?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  achievements?: string[];
}

export interface CVEducation {
  degree?: string;
  school?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface CVContact {
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface CVContent {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  headline?: string;
  avatarUrl?: string;
  about?: string;
  contact: CVContact;
  experience: CVExperience[];
  education: CVEducation[];
  skills: string[];
  languages: CVLanguage[];
  branche?: string;
  status?: string;
  driversLicenseClass?: string;
}

function pick<T = any>(obj: any, keys: string[]): T | undefined {
  for (const k of keys) {
    if (obj && obj[k] != null) return obj[k];
  }
  return undefined;
}

export function mapFormDataToContent(formData: any): CVContent {
  const firstName = pick<string>(formData, ['vorname', 'firstName', 'firstname']);
  const lastName = pick<string>(formData, ['nachname', 'lastName', 'lastname']);
  const avatarUrl = pick<string>(formData, ['avatar_url', 'profilbild', 'avatar']);
  const headline = pick<string>(formData, ['headline', 'position', 'titel']);
  const about = pick<string>(formData, ['about', 'ueber_mich', 'ueberMich', 'beschreibung', 'bio']);

  const email = pick<string>(formData, ['email']);
  const phone = pick<string>(formData, ['telefon', 'phone']);
  const location = pick<string>(formData, ['ort', 'location']);
  const website = pick<string>(formData, ['website']);
  const linkedin = pick<string>(formData, ['linkedin']);
  const github = pick<string>(formData, ['github']);
  const hasDL = pick<boolean>(formData, ['has_drivers_license']);
  const driversLicenseClass = hasDL ? pick<string>(formData, ['driver_license_class']) : undefined;

  const experience = (pick<any[]>(formData, ['experience', 'berufserfahrung', 'jobs']) || []).map((e: any) => ({
    role: pick<string>(e, ['role', 'position', 'titel']),
    company: pick<string>(e, ['company', 'firma']),
    startDate: pick<string>(e, ['startDate', 'start', 'von']),
    endDate: pick<string>(e, ['endDate', 'end', 'bis']),
    description: pick<string>(e, ['description', 'beschreibung']),
    achievements: pick<string[]>(e, ['achievements', 'aufgaben']) || [],
  }));

  const education = (pick<any[]>(formData, ['education', 'ausbildung', 'studium']) || []).map((ed: any) => ({
    degree: pick<string>(ed, ['degree', 'abschluss']),
    school: pick<string>(ed, ['school', 'schule', 'hochschule']),
    startDate: pick<string>(ed, ['startDate', 'start', 'von']),
    endDate: pick<string>(ed, ['endDate', 'end', 'bis']),
    description: pick<string>(ed, ['description', 'beschreibung']),
  }));

  const skills = pick<string[]>(formData, ['skills', 'faehigkeiten']) || [];
  const languages = (pick<any[]>(formData, ['languages', 'sprachen']) || []).map((l: any) => ({
    name: pick<string>(l, ['name', 'sprache']),
    level: pick<string>(l, ['level', 'kenntnisse']),
  }));

  return {
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(' '),
    headline,
    avatarUrl,
    about,
    contact: { email, phone, location, website, linkedin, github },
    experience,
    education,
    skills,
    languages,
    branche: pick<string>(formData, ['branche']),
    status: pick<string>(formData, ['status']),
    driversLicenseClass,
  };
}
