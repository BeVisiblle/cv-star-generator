// Utility functions for profile data

export function getCurrentJobInfo(profile: any): { title: string | null; company: string | null } {
  if (!profile) return { title: null, company: null };
  
  // For students
  if (profile.status === 'schueler') {
    return {
      title: 'Schüler',
      company: profile.schule || profile.schulbildung?.[0]?.institution || null
    };
  }
  
  // For apprentices and graduates
  if (profile.status === 'azubi' || profile.status === 'ausgelernt') {
    // Get current job from berufserfahrung (jobs without end date or end date in future)
    const currentJob = profile.berufserfahrung?.find((job: any) => 
      !job.bis || new Date(job.bis) > new Date()
    );
    
    if (currentJob) {
      return {
        title: currentJob.position || profile.ausbildungsberuf || profile.aktueller_beruf,
        company: currentJob.unternehmen
      };
    }
    
    // Fallback to profile-level fields
    return {
      title: profile.ausbildungsberuf || profile.aktueller_beruf,
      company: profile.ausbildungsbetrieb
    };
  }
  
  // For other statuses
  const currentJob = profile.berufserfahrung?.find((job: any) => 
    !job.bis || new Date(job.bis) > new Date()
  );
  
  if (currentJob) {
    return {
      title: currentJob.position || profile.aktueller_beruf,
      company: currentJob.unternehmen
    };
  }
  
  return {
    title: profile.aktueller_beruf,
    company: null
  };
}

export function formatNameWithJob(profile: any): { 
  name: string; 
  displayName: string; 
  jobTitle?: string; 
  company?: string;
} {
  const fullName = profile?.vorname && profile?.nachname 
    ? `${profile.vorname} ${profile.nachname}` 
    : 'Unbekannter Nutzer';
  
  const jobInfo = getCurrentJobInfo(profile);
  
  if (jobInfo.title && jobInfo.company) {
    return {
      name: fullName,
      displayName: `${fullName}`,
      jobTitle: jobInfo.title,
      company: jobInfo.company
    };
  } else if (jobInfo.title) {
    return {
      name: fullName,
      displayName: `${fullName}`,
      jobTitle: jobInfo.title,
      company: undefined
    };
  }
  
  return {
    name: fullName,
    displayName: fullName,
    jobTitle: undefined,
    company: undefined
  };
}