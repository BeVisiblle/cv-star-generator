export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return "vor 1 Tag";
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  if (diffDays < 30) return `vor ${Math.ceil(diffDays / 7)} Wochen`;
  return `vor ${Math.ceil(diffDays / 30)} Monaten`;
}

export function formatSalary(salaryMin?: number, salaryMax?: number): string {
  if (!salaryMin && !salaryMax) return "Gehalt auf Anfrage";
  
  const formatNumber = (num: number) => num.toLocaleString('de-DE');
  
  if (salaryMin && salaryMax) {
    return `€${formatNumber(salaryMin)} – €${formatNumber(salaryMax)} / Monat (brutto)`;
  } else if (salaryMin) {
    return `ab €${formatNumber(salaryMin)} / Monat (brutto)`;
  } else if (salaryMax) {
    return `bis €${formatNumber(salaryMax)} / Monat (brutto)`;
  }
  
  return "Gehalt auf Anfrage";
}

export function formatEmploymentType(type: string): string {
  const types: Record<string, string> = {
    "Vollzeit": "Vollzeit",
    "Teilzeit": "Teilzeit", 
    "Praktikum": "Praktikum",
    "Werkstudent": "Werkstudent",
    "Ausbildung": "Ausbildung"
  };
  return types[type] || type;
}
