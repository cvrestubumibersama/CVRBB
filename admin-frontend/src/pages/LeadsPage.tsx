import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

const STATUS = ["", "baru", "diproses", "selesai"];

export default function LeadsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const { data } = useQuery({
    queryKey: ["leads", filter],
    queryFn: async () => (await api.get(`/admin/leads${filter ? `?status=${filter}` : ""}`)).data,
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) =>
      api.patch(`/admin/leads/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Leads / Pengajuan Penawaran</h1>
        <div className="flex gap-2">
          <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
            {STATUS.map((s) => <option key={s} value={s}>{s || "Semua"}</option>)}
          </select>
          <a className="btn-outline" href="/api/admin/leads/export.csv" target="_blank" rel="noreferrer">Export CSV</a>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead><tr>
            <th>ID</th><th>Nama</th><th>Perusahaan</th><th>Telepon</th>
            <th>Jenis Proyek</th><th>Lokasi</th><th>Status</th><th>Tanggal</th>
          </tr></thead>
          <tbody>
            {data?.items?.map((l: any) => (
              <tr key={l.id}>
                <td>{l.id}</td>
                <td>{l.nama}</td>
                <td>{l.perusahaan ?? "—"}</td>
                <td>{l.telepon}</td>
                <td>{l.jenisProyek}</td>
                <td>{l.lokasiProyek}</td>
                <td>
                  <select value={l.status} onChange={(e) => update.mutate({ id: l.id, status: e.target.value })} className="input py-1">
                    {STATUS.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>{new Date(l.createdAt).toLocaleDateString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
