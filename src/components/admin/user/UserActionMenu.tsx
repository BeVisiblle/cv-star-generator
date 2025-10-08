import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Mail, Lock, Unlock, FileText, StickyNote } from "lucide-react";
import { useState } from "react";
import { UserCVModal } from "./UserCVModal";

interface UserActionMenuProps {
  userId: string;
}

export function UserActionMenu({ userId }: UserActionMenuProps) {
  const [cvModalOpen, setCvModalOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setCvModalOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            CV ansehen
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Mail className="h-4 w-4 mr-2" />
            E-Mail senden
          </DropdownMenuItem>
          <DropdownMenuItem>
            <StickyNote className="h-4 w-4 mr-2" />
            Notiz hinzufügen
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Lock className="h-4 w-4 mr-2" />
            Account sperren
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Unlock className="h-4 w-4 mr-2" />
            Account entsperren
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserCVModal
        open={cvModalOpen}
        onOpenChange={setCvModalOpen}
        userId={userId}
      />
    </>
  );
}
