import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminSession } from "@/hooks/useAdminSession";
import { Navigate } from "react-router-dom";
import { useUsers } from "@/hooks/useUsers";
import { UserDrawer } from "@/components/admin/UserDrawer";

export default function UsersPage() {
  const { role } = useAdminSession();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"all" | "published" | "incomplete">("all");
  const [region, setRegion] = React.useState("");
  const [dateStart, setDateStart] = React.useState<string | undefined>(undefined);
  const [dateEnd, setDateEnd] = React.useState<string | undefined>(undefined);
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<any | null>(null);

  const { data, isLoading, error } = useUsers({ search, status, region, dateStart, dateEnd, page, pageSize: 10 });

  if (role === "CompanyAdmin") {
    return <Navigate to="/admin" replace />;
  }

  const canEdit = role === "SuperAdmin" || role === "SupportAgent";
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="px-3 sm:px-6 py-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Users</h1>
      <div className="rounded-2xl border bg-card shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search users" className="h-9 w-full rounded-md border px-3 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]" />
          <select value={status} onChange={(e) => { setStatus(e.target.value as any); setPage(1); }} className="h-9 rounded-md border px-2">
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="incomplete">Incomplete</option>
          </select>
          <input type="text" value={region} onChange={(e) => { setRegion(e.target.value); setPage(1); }} placeholder="Region (Bundesland)" className="h-9 w-full rounded-md border px-3 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]" />
          <div className="flex gap-2">
            <input type="date" value={dateStart ?? ""} onChange={(e) => { setDateStart(e.target.value || undefined); setPage(1); }} className="h-9 rounded-md border px-2" />
            <input type="date" value={dateEnd ?? ""} onChange={(e) => { setDateEnd(e.target.value || undefined); setPage(1); }} className="h-9 rounded-md border px-2" />
          </div>
        </div>

        <div className="w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Signup</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Complete</TableHead>
                {canEdit && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={5} className="py-6 text-muted-foreground">Loading…</TableCell></TableRow>
              )}
              {!isLoading && error && (
                <TableRow><TableCell colSpan={5} className="py-6 text-muted-foreground">No permission or error loading users.</TableCell></TableRow>
              )}
              {!isLoading && !error && data && data.users.length === 0 && (
                <TableRow><TableCell colSpan={5} className="py-6 text-muted-foreground">No users found.</TableCell></TableRow>
              )}
              {!isLoading && !error && data && data.users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.email ?? "—"}</TableCell>
                  <TableCell>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>{u.profile_published ? "Yes" : "No"}</TableCell>
                  <TableCell>{u.profile_complete ? "Yes" : "No"}</TableCell>
                  {canEdit && (
                    <TableCell>
                      <div className="flex gap-2">
                        <button className="text-primary underline" onClick={() => setSelected(u)}>View</button>
                        <button className="text-primary underline">Impersonate</button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-md border disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
            <button className="px-3 py-1 rounded-md border disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        </div>
      </div>

      <UserDrawer user={selected} open={!!selected} onOpenChange={(v) => !v && setSelected(null)} />
    </div>
  );
}
