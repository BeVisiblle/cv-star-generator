import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Play,
  Pause,
  Archive,
  Edit,
  Trash2,
  Send,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

type JobStatus = "draft" | "published" | "paused" | "inactive";

interface JobActionsMenuProps {
  jobId: string;
  status: JobStatus;
  onPublish?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onInactivate?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function JobActionsMenu({
  jobId,
  status,
  onPublish,
  onPause,
  onResume,
  onInactivate,
  onEdit,
  onDelete,
}: JobActionsMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </DropdownMenuItem>
          )}

          {status === "draft" && onPublish && (
            <DropdownMenuItem onClick={() => setShowPublishDialog(true)}>
              <Send className="h-4 w-4 mr-2" />
              Veröffentlichen
            </DropdownMenuItem>
          )}

          {status === "published" && onPause && (
            <DropdownMenuItem onClick={onPause}>
              <Pause className="h-4 w-4 mr-2" />
              Pausieren
            </DropdownMenuItem>
          )}

          {status === "paused" && onResume && (
            <DropdownMenuItem onClick={onResume}>
              <Play className="h-4 w-4 mr-2" />
              Fortsetzen
            </DropdownMenuItem>
          )}

          {(status === "published" || status === "paused") && onInactivate && (
            <DropdownMenuItem onClick={onInactivate}>
              <Archive className="h-4 w-4 mr-2" />
              Archivieren
            </DropdownMenuItem>
          )}

          {status === "draft" && onDelete && (
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Löschen
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stellenanzeige veröffentlichen?</AlertDialogTitle>
            <AlertDialogDescription>
              Beim Veröffentlichen wird 1 Token verbraucht. Titel und Standort können
              danach nicht mehr geändert werden. Möchten Sie fortfahren?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onPublish?.();
                setShowPublishDialog(false);
              }}
            >
              Veröffentlichen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stellenanzeige löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Stellenanzeige wird
              dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete?.();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
