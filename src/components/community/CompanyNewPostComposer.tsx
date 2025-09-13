import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { CreatePost } from '@/components/community/CreatePost';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompany } from '@/hooks/useCompany';

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

  const handleStateChange = React.useCallback((isSubmitting: boolean) => {
    setIsSubmitting(isSubmitting);
  }, []);

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
          <Button disabled={!canPost || isSubmitting} onClick={() => document.getElementById('createpost-submit')?.click()}>
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
