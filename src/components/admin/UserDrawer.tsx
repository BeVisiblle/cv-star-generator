import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminUser } from "@/hooks/useUsers";
import { useAdminSession } from "@/hooks/useAdminSession";
import { toast } from "sonner";

export function UserDrawer({ user, open, onOpenChange }: { user: AdminUser | null; open: boolean; onOpenChange: (v: boolean) => void; }) {
  const { role } = useAdminSession();
  const canSupport = role === "SuperAdmin" || role === "SupportAgent";

  if (!user) return null;

  const statusBadges = (
    <div className="flex gap-2">
      {user.profile_published ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>}
      {user.profile_complete ? <Badge>Complete</Badge> : <Badge variant="destructive">Incomplete</Badge>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{user.email ?? "Unbekannt"}</span>
            {statusBadges}
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-3">
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><strong>ID:</strong> {user.id}</li>
              <li><strong>Email:</strong> {user.email}</li>
              <li><strong>Created:</strong> {user.created_at ? new Date(user.created_at).toLocaleString() : "—"}</li>
            </ul>
          </TabsContent>
          <TabsContent value="activity" className="mt-3">
            <p className="text-sm text-muted-foreground">Recent activity coming soon.</p>
          </TabsContent>
          <TabsContent value="security" className="mt-3">
            <div className="flex flex-wrap gap-2">
              {canSupport && (
                <Button variant="default" onClick={() => toast.success("Impersonation started (stub)")}>Impersonate</Button>
              )}
              <Button variant="secondary" onClick={() => toast.message("Reset password link sent (stub)")}>Reset password</Button>
              {canSupport && (
                <Button variant="destructive" onClick={() => toast.error("User suspended (stub)")}>Suspend</Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default UserDrawer;
