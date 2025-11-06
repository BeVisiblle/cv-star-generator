import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  MapPin, 
  Euro, 
  Calendar,
  Clock,
  Building2
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface JobOverviewTabProps {
  job: any;
  company: any;
}

export function JobOverviewTab({ job, company }: JobOverviewTabProps) {
  const [aboutOpen, setAboutOpen] = useState(true);
  const [tasksOpen, setTasksOpen] = useState(true);
  const [requirementsOpen, setRequirementsOpen] = useState(true);

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      apprenticeship: 'Ausbildung',
      dual_study: 'Duales Studium',
      internship: 'Praktikum',
      fulltime: 'Vollzeit',
      parttime: 'Teilzeit',
      contract: 'Befristet'
    };
    return labels[type] || type;
  };

  const getWorkModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      remote: "Remote",
      hybrid: "Hybrid",
      onsite: "Vor Ort"
    };
    return labels[mode] || mode;
  };

  // Parse description - try to extract sections
  const parseDescription = (desc: string) => {
    if (!desc) return { about: "", tasks: [], requirements: { must: [], nice: [] } };
    
    // Simple parsing - split by common headers
    const sections = {
      about: desc,
      tasks: [] as string[],
      requirements: { must: [] as string[], nice: [] as string[] }
    };

    // Extract tasks if present
    const tasksMatch = desc.match(/(?:Aufgaben|Deine Aufgaben|Was dich erwartet):?\s*([\s\S]*?)(?=(?:Anforderungen|Voraussetzungen|Profil|Wir bieten)|$)/i);
    if (tasksMatch) {
      const tasksList = tasksMatch[1]
        .split(/[-•*]\s+/)
        .map(t => t.trim())
        .filter(t => t.length > 10);
      sections.tasks = tasksList;
    }

    // Extract requirements
    const reqMatch = desc.match(/(?:Anforderungen|Voraussetzungen|Dein Profil):?\s*([\s\S]*?)(?=(?:Wir bieten|Benefits)|$)/i);
    if (reqMatch) {
      const reqList = reqMatch[1]
        .split(/[-•*]\s+/)
        .map(r => r.trim())
        .filter(r => r.length > 10);
      sections.requirements.must = reqList;
    }

    return sections;
  };

  const parsedContent = parseDescription(job.description);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Main Content (2 columns) */}
      <div className="lg:col-span-2 space-y-4">
        {/* Über den Job */}
        <Collapsible open={aboutOpen} onOpenChange={setAboutOpen}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-lg">Über den Job</CardTitle>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${aboutOpen ? "" : "-rotate-90"}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {parsedContent.about || job.description || "Keine Beschreibung verfügbar."}
                </p>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Aufgaben */}
        {parsedContent.tasks.length > 0 && (
          <Collapsible open={tasksOpen} onOpenChange={setTasksOpen}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <CardTitle className="text-lg">Aufgaben</CardTitle>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${tasksOpen ? "" : "-rotate-90"}`} />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {parsedContent.tasks.map((task, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-sm leading-relaxed">{task}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Anforderungen */}
        <Collapsible open={requirementsOpen} onOpenChange={setRequirementsOpen}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-lg">Anforderungen</CardTitle>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${requirementsOpen ? "" : "-rotate-90"}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                {/* Must-Have */}
                {parsedContent.requirements.must.length > 0 ? (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Must-Have</h4>
                    <ul className="space-y-2">
                      {parsedContent.requirements.must.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-sm leading-relaxed">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Must-Have</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-sm leading-relaxed">Du hast deinen Hauptschulabschluss oder stehst kurz davor.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-sm leading-relaxed">Du bist handwerklich geschickt und packst gerne mit an, hast vielleicht sogar schon mal einen Hammer in der Hand gehabt.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-sm leading-relaxed">Du bist ein echter Teamplayer und hast Lust, Neues zu lernen.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-sm leading-relaxed">Du bist schwindelfrei und fit genug, um auf Dächern zu arbeiten.</span>
                      </li>
                    </ul>
                  </div>
                )}

                {/* Nice-to-Have */}
                {parsedContent.requirements.nice.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Nice-to-Have</h4>
                    <ul className="space-y-2">
                      {parsedContent.requirements.nice.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground mt-1">•</span>
                          <span className="text-sm leading-relaxed text-muted-foreground">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Right: Info Cards */}
      <div className="space-y-4">
        {/* Job gepostet von */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job gepostet von</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={company?.logo_url} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{company?.name || "Ausbildungsbasis Test Unternehmen"}</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ansprechperson */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ansprechperson</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">Todd Morawe</p>
                <p className="text-xs text-muted-foreground">Personalleiter</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <a href="mailto:Todd@Morawe.de" className="flex items-center gap-2 text-primary hover:underline">
                <Mail className="h-4 w-4" />
                <span>Todd@Morawe.de</span>
              </a>
              <a href="tel:01726122212" className="flex items-center gap-2 text-primary hover:underline">
                <Phone className="h-4 w-4" />
                <span>01726122212</span>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {job.industry && (
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Branche</p>
                  <p className="font-medium">{job.industry}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Anstellungsart</p>
                <p className="font-medium">{getEmploymentTypeLabel(job.employment_type)}</p>
              </div>
            </div>

            {job.weekly_hours && (
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Arbeitszeit</p>
                  <p className="font-medium">{job.weekly_hours} Std./Wo.</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Standort</p>
                <p className="font-medium">{job.city || "—"}</p>
              </div>
            </div>

            {job.salary_min && job.salary_max && (
              <div className="flex items-start gap-3">
                <Euro className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Gehalt</p>
                  <p className="font-medium">
                    {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()} €
                  </p>
                </div>
              </div>
            )}

            {job.start_date && (
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Start</p>
                  <p className="font-medium">
                    {format(new Date(job.start_date), "dd.MM.yyyy", { locale: de })}
                  </p>
                </div>
              </div>
            )}

            {job.work_mode && (
              <div className="flex items-start gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Work Mode</p>
                  <p className="font-medium">{getWorkModeLabel(job.work_mode)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
