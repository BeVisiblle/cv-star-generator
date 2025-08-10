import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminSession } from "@/hooks/useAdminSession";
import { Navigate } from "react-router-dom";

export default function UsersPage() {
  const { role } = useAdminSession();

  if (role === "CompanyAdmin") {
    return <Navigate to="/admin" replace />;
  }

  const canEdit = role === "SuperAdmin" || role === "SupportAgent";

  const rows = [
    { name: "Max Mustermann", role: "Azubi", email: "max@example.com", signup: "2025-07-01", status: "active" },
    { name: "Erika Musterfrau", role: "Schüler", email: "erika@example.com", signup: "2025-07-03", status: "active" },
  ];

  return (
    <div className="px-3 sm:px-6 py-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Users</h1>
      <div className="rounded-2xl border bg-card shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <input placeholder="Search users" className="h-9 w-full sm:w-64 rounded-md border px-3 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]" />
          <div className="flex gap-2">
            <select className="h-9 rounded-md border px-2"><option>All roles</option></select>
            <select className="h-9 rounded-md border px-2"><option>All status</option></select>
          </div>
        </div>
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Signup</TableHead>
                <TableHead>Status</TableHead>
                {canEdit && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.email}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.role}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.signup}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  {canEdit && (
                    <TableCell>
                      <div className="flex gap-2">
                        <button className="text-primary underline">View</button>
                        <button className="text-primary underline">Impersonate</button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
