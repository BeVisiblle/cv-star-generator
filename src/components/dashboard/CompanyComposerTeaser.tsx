import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Calendar as CalendarIcon, FileText, BarChart3, Briefcase } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import CompanyNewPostComposer from '@/components/community/CompanyNewPostComposer';
import CompanyJobPostDialog from '@/components/company/jobs/CompanyJobPostDialog';
const CompanyComposerTeaser: React.FC = () => {
  const { company } = useCompany();
  const [open, setOpen] = React.useState(false);
  const [jobOpen, setJobOpen] = React.useState(false);

  const initials = company?.name ? company.name.slice(0, 2).toUpperCase() : 'C';

  return (
    <>
      <Card className="p-4 md:p-5">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={company?.logo_url || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <button
            className="flex-1 text-left text-muted-foreground hover:text-foreground transition-colors h-10 px-4 rounded-full border"
            onClick={() => setOpen(true)}
            aria-label="Was möchten Sie posten?"
          >
            Was möchten Sie posten?
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              <ImageIcon className="h-4 w-4 mr-1" /> Bild/Video
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              <CalendarIcon className="h-4 w-4 mr-1" /> Event
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              <FileText className="h-4 w-4 mr-1" /> Dokument
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
              <BarChart3 className="h-4 w-4 mr-1" /> Umfrage
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setJobOpen(true)}>
              <Briefcase className="h-4 w-4 mr-1" /> Job
            </Button>
          </div>
        </div>
      </Card>

      <CompanyNewPostComposer open={open} onOpenChange={setOpen} />
      <CompanyJobPostDialog open={jobOpen} onOpenChange={setJobOpen} />
    </>
  );
};

export default CompanyComposerTeaser;
