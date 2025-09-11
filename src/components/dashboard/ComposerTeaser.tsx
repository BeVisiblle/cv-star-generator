import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import { Image as ImageIcon, Calendar, FileText, BarChart3 } from "lucide-react";
=======
import { Image as ImageIcon, Calendar, FileText, BarChart } from "lucide-react";
>>>>>>> d046ce00db74c472b3a5130b9a2c5a136a0c492b
import { useAuth } from "@/hooks/useAuth";
import { openPostComposer } from "@/lib/event-bus";

export const ComposerTeaser: React.FC = () => {
  const { profile } = useAuth();

  return (
    <Card
      role="button"
      aria-label="Neuen Beitrag erstellen"
      onClick={openPostComposer}
      className="p-4 sm:p-5 hover-scale cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 shrink-0">
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
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={openPostComposer}>
              <ImageIcon className="h-4 w-4 mr-2" /> Bild/Video
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={openPostComposer}>
              <Calendar className="h-4 w-4 mr-2" /> Event
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={openPostComposer}>
              <FileText className="h-4 w-4 mr-2" /> Dokument
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={openPostComposer}>
<<<<<<< HEAD
              <BarChart3 className="h-4 w-4 mr-2" /> Umfrage
=======
              <BarChart className="h-4 w-4 mr-2" /> Umfrage
>>>>>>> d046ce00db74c472b3a5130b9a2c5a136a0c492b
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ComposerTeaser;
