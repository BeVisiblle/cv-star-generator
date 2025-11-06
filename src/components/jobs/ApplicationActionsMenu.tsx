import { useState } from "react";
import { MoreVertical, CheckCircle, Calendar, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useUnlockApplication,
  useScheduleInterview,
  useRejectApplication,
  useAcceptApplication,
} from "@/hooks/useApplicationActions";

interface ApplicationActionsMenuProps {
  applicationId: string;
  status: string;
  candidateName: string;
  onViewProfile?: () => void;
}

export function ApplicationActionsMenu({
  applicationId,
  status,
  candidateName,
  onViewProfile,
}: ApplicationActionsMenuProps) {
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [interviewNote, setInterviewNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const unlockMutation = useUnlockApplication();
  const scheduleMutation = useScheduleInterview();
  const rejectMutation = useRejectApplication();
  const acceptMutation = useAcceptApplication();

  const handleUnlock = () => {
    unlockMutation.mutate(applicationId);
  };

  const handleScheduleInterview = () => {
    scheduleMutation.mutate(
      { applicationId, note: interviewNote },
      {
        onSuccess: () => {
          setInterviewDialogOpen(false);
          setInterviewNote("");
        },
      }
    );
  };

  const handleReject = () => {
    rejectMutation.mutate(
      { applicationId, reason: rejectReason },
      {
        onSuccess: () => {
          setRejectDialogOpen(false);
          setRejectReason("");
        },
      }
    );
  };

  const handleAccept = () => {
    acceptMutation.mutate(applicationId);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onViewProfile && (
            <DropdownMenuItem onClick={onViewProfile}>
              <Eye className="h-4 w-4 mr-2" />
              Profil ansehen
            </DropdownMenuItem>
          )}

          {status === "new" && (
            <DropdownMenuItem onClick={handleUnlock}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Profil freischalten
            </DropdownMenuItem>
          )}

          {(status === "unlocked" || status === "new") && (
            <DropdownMenuItem onClick={() => setInterviewDialogOpen(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              Zu Gespräch einladen
            </DropdownMenuItem>
          )}

          {status === "interview_scheduled" && (
            <DropdownMenuItem onClick={handleAccept}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Zusage erteilen
            </DropdownMenuItem>
          )}

          {status !== "rejected" && status !== "accepted" && (
            <DropdownMenuItem
              onClick={() => setRejectDialogOpen(true)}
              className="text-destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Absagen
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Interview Dialog */}
      <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zu Gespräch einladen</DialogTitle>
            <DialogDescription>
              Laden Sie {candidateName} zu einem Gespräch ein. Der Kandidat wird
              über die Statusänderung informiert.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Notiz (optional)</Label>
              <Textarea
                id="note"
                placeholder="z.B. Terminvorschläge, weitere Informationen..."
                value={interviewNote}
                onChange={(e) => setInterviewNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInterviewDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleScheduleInterview}
              disabled={scheduleMutation.isPending}
            >
              {scheduleMutation.isPending ? "Lädt..." : "Einladen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bewerbung ablehnen</DialogTitle>
            <DialogDescription>
              Möchten Sie die Bewerbung von {candidateName} wirklich ablehnen?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Grund (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Optionaler Ablehnungsgrund..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Lädt..." : "Absagen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
