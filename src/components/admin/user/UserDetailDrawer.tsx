import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserActionMenu } from "./UserActionMenu";

interface UserDetailDrawerProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailDrawer({ user, open, onOpenChange }: UserDetailDrawerProps) {
  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>
              {user.vorname} {user.nachname}
            </SheetTitle>
            <UserActionMenu userId={user.id} />
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant={user.user_type === "ausgelernt" ? "default" : "secondary"}>
              {user.user_type}
            </Badge>
            {user.profile_visibility && (
              <Badge variant="outline">{user.profile_visibility}</Badge>
            )}
          </div>
        </SheetHeader>

        <Tabs defaultValue="profile" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="cv">Lebenslauf</TabsTrigger>
            <TabsTrigger value="applications">Bewerbungen</TabsTrigger>
            <TabsTrigger value="activity">Aktivität</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">E-Mail</p>
                <p className="text-sm">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Branche</p>
                <p className="text-sm">{user.branche || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Erstellt am</p>
                <p className="text-sm">
                  {new Date(user.created_at).toLocaleDateString("de-DE")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Letzter Login</p>
                <p className="text-sm">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString("de-DE")
                    : "Nie"}
                </p>
              </div>
            </div>

            {user.bio && (
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Bio</p>
                <p className="text-sm">{user.bio}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cv" className="space-y-4 mt-4">
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Lebenslauf-Ansicht wird geladen...
              </p>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4 mt-4">
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Bewerbungen werden geladen...
              </p>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 mt-4">
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Aktivitätsprotokoll wird geladen...
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
