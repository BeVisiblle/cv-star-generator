import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useCompany } from "@/hooks/useCompany";
import CreatePost from "@/components/community/CreatePost";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const CompanyNewPostComposer: React.FC<Props> = ({ open, onOpenChange }) => {
  const isMobile = useIsMobile();
  const { company } = useCompany();
  const [audience, setAudience] = React.useState<'public' | 'connections'>('public');
  const [canPost, setCanPost] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleStateChange = React.useCallback((isSubmitting: boolean, canPost: boolean) => {
    setIsSubmitting(isSubmitting);
    setCanPost(canPost);
  }, []);

  // Listen for successful post creation to close modal
  React.useEffect(() => {
    const handlePostSuccess = () => {
      // Close modal after successful post creation
      setTimeout(() => {
        onOpenChange(false);
      }, 500); // Small delay to show success toast
    };
    
    window.addEventListener('post-created', handlePostSuccess);
    return () => window.removeEventListener('post-created', handlePostSuccess);
  }, [onOpenChange]);

  // FIXED: Proper post submit handler
  const handlePostSubmit = React.useCallback(() => {
    console.log('Company Posten button clicked, canPost:', canPost, 'isSubmitting:', isSubmitting);
    
    if (!canPost || isSubmitting) {
      console.log('Cannot post - canPost:', canPost, 'isSubmitting:', isSubmitting);
      return;
    }

    // Try multiple methods to trigger form submit
    const submitButton = document.getElementById('createpost-submit');
    if (submitButton) {
      console.log('Found submit button, clicking...');
      submitButton.click();
    } else {
      console.log('Submit button not found, trying form submit...');
      const form = document.querySelector('form');
      if (form) {
        console.log('Found form, submitting...');
        form.requestSubmit();
      } else {
        console.log('No form found!');
      }
    }
  }, [canPost, isSubmitting]);

  const Header = (
    <div className="px-6 pt-5 pb-3 border-b bg-background">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={company?.logo_url || undefined} />
          <AvatarFallback>{company?.name?.slice(0,2).toUpperCase() || 'C'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium leading-tight truncate">
            {company?.name || 'Unternehmen'}
          </div>
          <div className="mt-1">
            <Select value={audience} onValueChange={(v) => setAudience(v as any)}>
              <SelectTrigger className="h-8 w-[220px] text-xs">
                <SelectValue placeholder="Sichtbarkeit wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Jeder (öffentlich)</SelectItem>
                <SelectItem value="connections">Nur Community</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button disabled={!canPost || isSubmitting} onClick={handlePostSubmit}>
            {isSubmitting ? 'Wird veröffentlicht…' : 'Posten'}
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[92vh] p-0 flex flex-col">
          <SheetHeader className="px-6 pt-4 pb-2">
            <SheetTitle>Neuer Unternehmens‑Beitrag</SheetTitle>
          </SheetHeader>
          {Header}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <CreatePost container="none" hideHeader hideBottomBar onStateChange={handleStateChange} visibility={audience} context="company" companyId={company?.id} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-3xl w-full p-0 rounded-xl overflow-hidden">
        <DialogTitle className="sr-only">Neuer Unternehmens‑Beitrag</DialogTitle>
        <DialogDescription className="sr-only">Verfassen und veröffentlichen Sie einen neuen Beitrag als Unternehmen.</DialogDescription>
        {Header}
        <div className="px-6 py-5">
          <CreatePost container="none" hideHeader hideBottomBar onStateChange={handleStateChange} visibility={audience} context="company" companyId={company?.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyNewPostComposer;