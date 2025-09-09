import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Edit, X } from 'lucide-react';
import JobUserPreview from '../jobs/JobUserPreview';

interface JobCandidatePreviewDialogProps {
  job: any;
  company: any;
  onEdit?: () => void;
  trigger?: React.ReactNode;
}

export default function JobCandidatePreviewDialog({ 
  job, 
  company, 
  onEdit, 
  trigger 
}: JobCandidatePreviewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Kandidaten-Ansicht
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <JobUserPreview
            jobId={job.id}
            onEdit={onEdit}
            showEditButton={true}
          />
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => {
            const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
            if (dialog) {
              const closeButton = dialog.querySelector('[data-state="open"]') as HTMLElement;
              if (closeButton) closeButton.click();
            }
          }}>
            <X className="h-4 w-4 mr-2" />
            Schließen
          </Button>
          {onEdit && (
            <Button onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}