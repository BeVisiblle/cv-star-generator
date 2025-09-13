
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Calendar, Globe, Lock, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreatePost } from "@/components/community/CreatePost";
import { useAuth } from "@/hooks/useAuth";

interface MarketplaceComposerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function MarketplaceComposer({ open, onOpenChange }: MarketplaceComposerProps) {
  const isMobile = useIsMobile();
  const { profile } = useAuth();
  const [audience, setAudience] = React.useState<"public" | "connections" | "private">("public");
  const [canPost, setCanPost] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const AudienceIcon = audience === "public" ? Globe : audience === "connections" ? Users : Lock;

  const handleState = (isSubmitting: boolean) => {
    setIsSubmitting(isSubmitting);
  };

  const Header = (
    <div className="px-6 pt-5 pb-3 border-b bg-background">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback>
            {profile?.vorname && profile?.nachname ? `${profile.vorname[0]}${profile.nachname[0]}` : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium leading-tight truncate">
            {profile?.vorname && profile?.nachname ? `${profile.vorname} ${profile.nachname}` : "Unbekannter Nutzer"}
          </div>
          <div className="mt-1">
            <Select value={audience} onValueChange={(v) => setAudience(v as any)}>
              <SelectTrigger className="h-8 w-[220px] text-xs">
                <SelectValue placeholder="Sichtbarkeit wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Jeder (öffentlich)</SelectItem>
                <SelectItem value="connections">Nur Verbindungen</SelectItem>
                <SelectItem value="private">Privat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Planen">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button disabled={!canPost || isSubmitting} onClick={() => document.getElementById("createpost-submit")?.click()}>
            {isSubmitting ? "Wird veröffentlicht…" : "Posten"}
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
            <SheetTitle>Neuer Beitrag</SheetTitle>
          </SheetHeader>
          {Header}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <CreatePost container="none" hideHeader hideBottomBar onStateChange={handleState} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-3xl w-full p-0 rounded-xl overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Neuer Beitrag</DialogTitle>
        </DialogHeader>
        {Header}
        <div className="px-6 py-5">
          <CreatePost container="none" hideHeader hideBottomBar onStateChange={handleState} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MarketplaceComposer;
