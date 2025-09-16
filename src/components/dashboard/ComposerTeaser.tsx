import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Calendar, FileText, ChartBar, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { openPostComposer } from "@/lib/event-bus";
import { formatNameWithJob } from "@/utils/profileUtils";

export const ComposerTeaser: React.FC = () => {
  const { profile } = useAuth();
  const nameInfo = formatNameWithJob(profile);

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
          <div className="mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{nameInfo.name}</span>
              {nameInfo.jobTitle && nameInfo.company && (
                <span className="text-xs text-muted-foreground">
                  {nameInfo.jobTitle} @
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Navigate to company page
                    }}
                    className="text-primary hover:underline ml-1"
                  >
                    {nameInfo.company}
                  </button>
                </span>
              )}
            </div>
          </div>
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
              <ChartBar className="h-4 w-4 mr-2" /> Umfrage
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ComposerTeaser;
