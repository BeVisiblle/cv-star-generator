import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { subscribeOpenPostComposer } from '@/lib/event-bus';
import { CreatePost } from '@/components/community/CreatePost';

export const NewPostComposer: React.FC = () => {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    return subscribeOpenPostComposer(() => setOpen(true));
  }, []);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-[92vh] p-0">
          <SheetHeader className="px-6 pt-4 pb-2">
            <SheetTitle>Neuer Beitrag</SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-y-auto px-6 pb-6">
            <CreatePost />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl p-0">
        <DialogHeader className="px-6 pt-4 pb-2">
          <DialogTitle>Neuer Beitrag</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          <CreatePost />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewPostComposer;
