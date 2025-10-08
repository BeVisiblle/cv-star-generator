import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Snowflake, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface FrozenAccountModalProps {
  isOpen: boolean;
  reason?: string;
}

export function FrozenAccountModal({ isOpen, reason }: FrozenAccountModalProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleContact = () => {
    window.location.href = 'mailto:Todd@BeVisible.de?subject=Account%20Frozen';
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Snowflake className="h-8 w-8 text-destructive" />
            <AlertDialogTitle className="text-2xl">Account gesperrt</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-4">
            <p>Ihr Unternehmens-Account wurde eingefroren.</p>
            
            {reason && (
              <p className="font-medium text-foreground">{reason}</p>
            )}
            
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-semibold text-foreground">Bitte kontaktieren Sie:</p>
              <div className="space-y-1">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Todd Morawe</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href="tel:01726128946" className="hover:underline">01726128946</a>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:Todd@BeVisible.de" className="hover:underline">Todd@BeVisible.de</a>
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <Button onClick={handleContact} variant="outline">
            Jetzt kontaktieren
          </Button>
          <Button onClick={handleLogout} variant="destructive">
            Abmelden
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
