import { useState } from "react";
import { usePublicJobs } from "@/hooks/useJobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Briefcase, Building2 } from "lucide-react";

export default function CommunityJobs() {
  const [search, setSearch] = useState("");
  const [employmentType, setEmploymentType] = useState<string>();
  const [location, setLocation] = useState<string>();

  const { data: jobs, isLoading } = usePublicJobs({
    employment_type: employmentType,
    location: location,
  });

  const filteredJobs = jobs?.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="w-full py-6 px-3 sm:px-6">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Stellenangebote</h1>
          <p className="text-muted-foreground">
            Entdecken Sie passende Ausbildungs- und Jobmöglichkeiten
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Suche nach Titel..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={employmentType} onValueChange={setEmploymentType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Beschäftigungsart" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apprenticeship">Ausbildung</SelectItem>
                  <SelectItem value="dual_study">Duales Studium</SelectItem>
                  <SelectItem value="internship">Praktikum</SelectItem>
                  <SelectItem value="full_time">Vollzeit</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Ort..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-[200px]"
              />
              {(employmentType || location) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmploymentType(undefined);
                    setLocation(undefined);
                  }}
                >
                  Filter zurücksetzen
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredJobs && filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job: any) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {job.company?.logo_url && (
                        <img
                          src={job.company.logo_url}
                          alt={job.company.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{job.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          {job.company?.name}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {job.employment_type?.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {job.city || job.state || job.country || '—'}
                    </div>
                    {job.description_md && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description_md}
                      </p>
                    )}
                    <div className="pt-2">
                      <Button className="w-full">Details ansehen</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Keine Stellenangebote gefunden
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
