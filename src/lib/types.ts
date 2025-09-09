export type Job = {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  location: string;           // city or "Remote"
  remote: boolean;            // true => fully remote
  employmentType: "Vollzeit" | "Teilzeit" | "Praktikum" | "Werkstudent" | "Ausbildung";
  salaryMin?: number;         // monthly gross EUR
  salaryMax?: number;
  tags?: string[];
  postedAt: string;           // ISO
  description: string;        // HTML or markdown rendered as safe HTML
  responsibilities?: string[]; // bullets
  requirements?: string[];    // bullets
  benefits?: string[];        // bullets
  status: "Draft" | "Published";
  lastEditedAt?: string;      // ISO
  // meta you might need
  companyUserOwnerId?: string;
};

export type ViewerRole = "user" | "company";

export type JobEditorState = {
  originalRemote: boolean;
  currentRemote: boolean;
  canEditLocation: boolean;
  titleDisabled: boolean;
  locationDisabled: boolean;
  isDirty: boolean;
  hasChanges: boolean;
};
