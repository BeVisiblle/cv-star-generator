import { Job } from './types';

export const mockJobs: Job[] = [
  {
    id: "j-123",
    title: "Kaufmännische:r Mitarbeiter:in",
    companyName: "Muster GmbH",
    companyLogoUrl: "/logos/muster.png",
    location: "Remote",
    remote: true,
    employmentType: "Vollzeit",
    salaryMin: 2800,
    salaryMax: 3400,
    tags: ["Einsteigerfreundlich", "MS Office", "Team"],
    postedAt: "2025-08-30T09:00:00.000Z",
    description: "<p>Wir suchen eine:n engagierte:n kaufmännische:n Mitarbeiter:in für unser dynamisches Team. In dieser vielseitigen Position unterstützen Sie unsere Geschäftsprozesse und tragen zur Weiterentwicklung unseres Unternehmens bei.</p>",
    responsibilities: [
      "Bearbeitung von Kundenanfragen und -aufträgen",
      "Unterstützung bei der Rechnungsstellung und Buchhaltung",
      "Koordination von Terminen und Meetings",
      "Pflege von Kundenbeziehungen"
    ],
    requirements: [
      "Abgeschlossene kaufmännische Ausbildung oder vergleichbare Qualifikation",
      "Sichere Anwendung von MS Office (Word, Excel, Outlook)",
      "Kommunikationsstärke und Teamfähigkeit",
      "Selbstständige und strukturierte Arbeitsweise"
    ],
    benefits: [
      "Flexible Arbeitszeiten und Homeoffice-Möglichkeiten",
      "Weiterbildungsmöglichkeiten und Karrierechancen",
      "Moderne Arbeitsplätze und technische Ausstattung",
      "Betriebliche Altersvorsorge und Gesundheitsförderung"
    ],
    status: "Published",
    companyUserOwnerId: "company-1"
  },
  {
    id: "j-124",
    title: "Softwareentwickler:in (Frontend)",
    companyName: "TechStart AG",
    companyLogoUrl: "/logos/techstart.png",
    location: "Berlin",
    remote: false,
    employmentType: "Vollzeit",
    salaryMin: 4500,
    salaryMax: 6000,
    tags: ["React", "TypeScript", "Senior"],
    postedAt: "2025-09-01T10:30:00.000Z",
    description: "<p>Entwickeln Sie moderne Webanwendungen mit React und TypeScript. Sie arbeiten in einem agilen Team an spannenden Projekten für namhafte Kunden.</p>",
    responsibilities: [
      "Entwicklung von React-basierten Frontend-Anwendungen",
      "Code-Reviews und Mentoring von Junior-Entwicklern",
      "Zusammenarbeit mit Designern und Backend-Teams",
      "Optimierung von Performance und User Experience"
    ],
    requirements: [
      "Mehrjährige Erfahrung mit React und TypeScript",
      "Kenntnisse in modernen CSS-Frameworks (Tailwind, Styled Components)",
      "Erfahrung mit State Management (Redux, Zustand)",
      "Git und agile Entwicklungsmethoden"
    ],
    benefits: [
      "Competitive Gehalt und Boni",
      "Flexible Arbeitszeiten und Remote-Optionen",
      "Moderne Hardware und Software",
      "Konferenzbesuche und Weiterbildung"
    ],
    status: "Published",
    companyUserOwnerId: "company-2"
  },
  {
    id: "j-125",
    title: "Praktikant:in Marketing",
    companyName: "Digital Solutions GmbH",
    companyLogoUrl: "/logos/digital.png",
    location: "München",
    remote: false,
    employmentType: "Praktikum",
    salaryMin: 1200,
    salaryMax: 1500,
    tags: ["Marketing", "Social Media", "Praktikum"],
    postedAt: "2025-09-02T14:15:00.000Z",
    description: "<p>Lernen Sie die Grundlagen des digitalen Marketings in einem innovativen Unternehmen kennen. Unterstützen Sie unser Marketing-Team bei spannenden Projekten.</p>",
    responsibilities: [
      "Unterstützung bei Social Media Kampagnen",
      "Erstellung von Marketing-Materialien",
      "Analyse von Marketing-Kennzahlen",
      "Mitarbeit bei Events und Messen"
    ],
    requirements: [
      "Studium im Bereich Marketing, Kommunikation oder verwandten Fächern",
      "Grundkenntnisse in Social Media Marketing",
      "Kreativität und analytisches Denken",
      "Gute Kommunikationsfähigkeiten"
    ],
    benefits: [
      "Praktische Erfahrung in der Marketing-Branche",
      "Mentoring durch erfahrene Kollegen",
      "Flexible Arbeitszeiten",
      "Möglichkeit zur Übernahme nach dem Praktikum"
    ],
    status: "Draft",
    companyUserOwnerId: "company-3"
  }
];

export function getMockJob(id: string): Job | null {
  return mockJobs.find(job => job.id === id) || null;
}
