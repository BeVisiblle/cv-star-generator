import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminUser } from "@/hooks/useUsers";
import { useAdminSession } from "@/hooks/useAdminSession";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function UserDrawer({ user, open, onOpenChange }: { user: AdminUser | null; open: boolean; onOpenChange: (v: boolean) => void; }) {
  const { role } = useAdminSession();
  const canSupport = role === "SuperAdmin" || role === "SupportAgent";

  // Move computations before early return
  const statusBadges = user ? (
    <div className="flex gap-2">
      {user.profile_published ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>}
      {user.profile_complete ? <Badge>Complete</Badge> : <Badge variant="destructive">Incomplete</Badge>}
    </div>
  ) : null;

  if (!user) return null;

  const handleResetPassword = async () => {
    if (!user.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/auth` });
    if (error) {
      toast({ title: "Reset failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Reset link sent", description: `Email sent to ${user.email}` });
    }
  };

  const callAdminAction = async (action: "suspend" | "unsuspend" | "impersonate") => {
    const { data, error } = await supabase.functions.invoke("admin-user-actions", {
      body: { action, userId: user.id },
    });
    if (error) {
      toast({ title: `Action failed`, description: error.message, variant: "destructive" });
      return null;
    }
    return data as any;
  };

  const handleSuspend = async () => {
    const res = await callAdminAction("suspend");
    if (res) toast({ title: "User suspended" });
  };
  const handleImpersonate = async () => {
    const res = await callAdminAction("impersonate");
    if (res?.url) {
      window.location.href = res.url as string;
    } else {
      toast({ title: "Impersonation link not available", variant: "destructive" });
    }
  };

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
                <Button variant="default" onClick={handleImpersonate}>Impersonate</Button>
              )}
              <Button variant="secondary" onClick={handleResetPassword}>Reset password</Button>
              {canSupport && (
                <Button variant="destructive" onClick={handleSuspend}>Suspend</Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default UserDrawer;
