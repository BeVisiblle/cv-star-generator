import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdminRole = "SuperAdmin" | "SupportAgent" | "ContentEditor" | "CompanyAdmin";

function mapRole(dbRole: string): AdminRole | null {
  const r = dbRole.toLowerCase();
  if (r === "superadmin" || r === "admin") return "SuperAdmin";
  if (r === "support" || r === "supportagent" || r === "agent") return "SupportAgent";
  if (r === "editor" || r === "contenteditor") return "ContentEditor";
  if (r === "companyadmin" || r === "owner") return "CompanyAdmin";
  return null;
}

export function useAdminSession() {
  const [isLoading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [admin, setAdmin] = useState<ReturnType<typeof supabase.auth.getUser> extends Promise<infer T> ? T extends { data: { user: infer U } } ? U : null : null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user ?? null;
      setAdmin(user as any);
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (!mounted) return;
      if (error) {
        console.warn("useAdminSession user_roles error", error);
        setRoles([]);
        setLoading(false);
        return;
      }
      const mapped = (data as { role: string }[]).map((r) => mapRole(r.role)).filter(Boolean) as AdminRole[];
      setRoles(Array.from(new Set(mapped)));
      setLoading(false);
    }
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => { mounted = false; sub.subscription?.unsubscribe(); };
  }, []);

  const rolePriority: AdminRole[] = ["SuperAdmin", "SupportAgent", "ContentEditor", "CompanyAdmin"];
  const role = useMemo(() => roles.sort((a, b) => rolePriority.indexOf(a) - rolePriority.indexOf(b))[0] as AdminRole | undefined, [roles]);

  const signOut = async () => { await supabase.auth.signOut(); };

  return { admin, roles, role, isLoading, signOut };
}
