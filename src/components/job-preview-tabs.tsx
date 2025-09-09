import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Euro, MapPin, Clock, Building2 } from 'lucide-react';
import { Job } from '@/lib/types';
import { formatSalary, formatDate } from '@/lib/format';

interface JobPreviewTabsProps {
  job: Job;
}

export function JobPreviewTabs({ job }: JobPreviewTabsProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Beschreibung</TabsTrigger>
              <TabsTrigger value="responsibilities">Aufgaben</TabsTrigger>
              <TabsTrigger value="requirements">Anforderungen</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div 
                    className="prose max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="responsibilities" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ihre Aufgaben</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.responsibilities?.map((responsibility, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span>{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requirements" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ihre Qualifikationen</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements?.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benefits" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ihre Vorteile</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.benefits?.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Salary */}
          {(job.salaryMin || job.salaryMax) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Gehalt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job-Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Ort:</span> {job.location}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Art:</span> {job.employmentType}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Veröffentlicht:</span> {formatDate(job.postedAt)}
                </span>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-2">
                <Badge variant={job.status === "Published" ? "default" : "secondary"}>
                  {job.status === "Published" ? "Veröffentlicht" : "Entwurf"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
