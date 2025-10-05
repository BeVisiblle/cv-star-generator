// Placeholder utility for profile functions
export const getProfileDisplayName = (profile: any) => {
  if (!profile) return 'Unknown User';
  return `${profile.vorname || ''} ${profile.nachname || ''}`.trim() || 'Unknown User';
};

export const formatNameWithJob = (profile: any) => {
  const name = getProfileDisplayName(profile);
  const job = profile?.aktueller_beruf || profile?.ausbildungsberuf || '';
  return { name, job };
};
