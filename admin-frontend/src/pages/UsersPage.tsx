import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export default function UsersPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin" });

  const { data, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await api.get("/admin/users")).data,
  });

  const create = useMutation({
    mutationFn: async () => api.post("/admin/users", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setForm({ name: "", email: "", password: "", role: "admin" });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => api.delete(`/admin/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const reset = useMutation({
    mutationFn: async ({ id, password }: { id: number; password: string }) =>
      api.post(`/admin/users/${id}/reset-password`, { password }),
  });

  if ((error as any)?.response?.status === 403) {
    return <div className="card p-6">Hanya superadmin yang bisa mengakses halaman ini.</div>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold mb-4">Manajemen User</h1>

      <div className="card p-4 mb-6 space-y-3">
        <div className="font-medium">Tambah User</div>
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Password (min 8)" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="admin">admin</option>
            <option value="super_admin">super admin</option>
          </select>
        </div>
        <button className="btn-primary" onClick={() => create.mutate()}>Simpan</button>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead><tr><th>ID</th><th>Nama</th><th>Email</th><th>Role</th><th>Aksi</th></tr></thead>
          <tbody>
            {data?.items?.map((u: any) => (
              <tr key={u.id}>
                <td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                <td className="space-x-2">
                  <button className="btn-outline" onClick={() => {
                    const pw = prompt("Password baru (min 8 karakter):");
                    if (pw) reset.mutate({ id: u.id, password: pw });
                  }}>Reset Password</button>
                  <button className="btn-outline text-brand" onClick={() => confirm("Hapus user?") && remove.mutate(u.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
