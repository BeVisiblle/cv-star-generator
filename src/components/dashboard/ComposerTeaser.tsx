import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Calendar, FileText, ChartBar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { openPostComposer } from "@/lib/event-bus";

export const ComposerTeaser: React.FC = () => {
  const { profile } = useAuth();

  return (
    <Card
      role="button"
      aria-label="Neuen Beitrag erstellen"
      onClick={openPostComposer}
      className="p-2 sm:p-2.5 md:p-3 hover-scale cursor-pointer"
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
          <AvatarImage src={profile?.avatar_url || undefined} alt={`${profile?.vorname ?? 'Unbekannt'} Avatar`} />
          <AvatarFallback>
            {profile?.vorname && profile?.nachname
              ? `${profile.vorname[0]}${profile.nachname[0]}`
              : "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="w-full px-4 py-2 rounded-md border bg-background text-muted-foreground text-sm">
            Was möchtest du posten?
          </div>

          {/* Quick actions */}
          <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-1 sm:gap-2">
            <Button type="button" variant="ghost" size="sm" className="h-7 sm:h-8 px-2 text-xs" onClick={openPostComposer}>
              <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Bild/Video</span><span className="sm:hidden">Bild</span>
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 sm:h-8 px-2 text-xs" onClick={openPostComposer}>
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Event
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 sm:h-8 px-2 text-xs hidden sm:flex" onClick={openPostComposer}>
              <FileText className="h-4 w-4 mr-2" /> Dokument
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 sm:h-8 px-2 text-xs hidden sm:flex" onClick={openPostComposer}>
              <ChartBar className="h-4 w-4 mr-2" /> Umfrage
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ComposerTeaser;
