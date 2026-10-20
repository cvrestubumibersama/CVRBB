import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "boolean" | "date" | "file" | "select" | "file-multiple";
  required?: boolean;
}

export interface Resource {
  path: string;      // URL segment, e.g. "produk"
  apiPath: string;   // API segment, e.g. "produk"
  label: string;
  fields: FieldDef[];
  columns: string[]; // field names displayed in list table
}

export const resources: Resource[] = [
  {
    path: "layanan", apiPath: "layanan", label: "Layanan",
    columns: ["id", "judul", "urutan", "isActive"],
    fields: [
      { name: "judul", label: "Judul", required: true },
      { name: "deskripsi", label: "Deskripsi", type: "textarea", required: true },
      { name: "gambarUrl", label: "Gambar (Bisa lebih dari satu)", type: "file-multiple" },
      { name: "urutan", label: "Urutan", type: "number" },
      { name: "isActive", label: "Aktif", type: "boolean" },
    ],
  },
  {
    path: "tahapan-kerja", apiPath: "tahapan-kerja", label: "Tahapan Kerja",
    columns: ["id", "judul", "deskripsi", "urutan", "isActive"],
    fields: [
      { name: "judul", label: "Judul Tahapan (cth: Survei)", required: true },
      { name: "judul_en", label: "Judul English (cth: Survey)" },
      { name: "deskripsi", label: "Deskripsi (cth: Peninjauan lokasi...)", type: "textarea", required: true },
      { name: "deskripsi_en", label: "Deskripsi English", type: "textarea" },
      { name: "urutan", label: "Urutan", type: "number" },
      { name: "isActive", label: "Aktif", type: "boolean" },
    ],
  },
  {
    path: "produk-kategori", apiPath: "produk-kategori", label: "Kategori Produk",
    columns: ["id", "nama", "slug"],
    fields: [
      { name: "nama", label: "Nama", required: true },
    ],
  },
  {
    path: "produk", apiPath: "produk", label: "Produk",
    columns: ["id", "nama", "price", "kategoriId", "isActive"],
    fields: [
      { name: "nama", label: "Nama", required: true },
      { name: "kategoriId", label: "Kategori", type: "select", required: true },
      { name: "price", label: "Harga", type: "text" },
      { name: "deskripsi", label: "Deskripsi", type: "textarea", required: true },
      { name: "gambarUrl", label: "Gambar", type: "file" },
      { name: "isActive", label: "Aktif", type: "boolean" },
    ],
  },
  {
    path: "proyek", apiPath: "proyek", label: "Proyek",
    columns: ["id", "nama", "klien", "tahun", "isFeatured"],
    fields: [
      { name: "nama", label: "Nama Proyek", required: true },
      { name: "klien", label: "Klien" },
      { name: "lokasi", label: "Lokasi" },
      { name: "tahun", label: "Tahun", type: "number" },
      { name: "kategori", label: "Kategori", type: "select" },
      { name: "deskripsi", label: "Deskripsi", type: "textarea", required: true },
      { name: "gambarUrl", label: "Gambar Utama", type: "file" },
      { name: "isFeatured", label: "Unggulan (landing page)", type: "boolean" },
      { name: "isActive", label: "Aktif", type: "boolean" },
    ],
  },
  {
    path: "legalitas", apiPath: "legalitas", label: "Legalitas",
    columns: ["id", "jenisDokumen", "nomorDokumen", "tanggalKedaluwarsa"],
    fields: [
      { name: "jenisDokumen", label: "Jenis Dokumen (NIB/NPWP/SBU/K3)", required: true },
      { name: "nomorDokumen", label: "Nomor", required: true },
      { name: "fileUrl", label: "File (upload dari device)", type: "file", required: true },
      { name: "tanggalTerbit", label: "Tanggal Terbit", type: "date" },
      { name: "tanggalKedaluwarsa", label: "Tanggal Kedaluwarsa", type: "date" },
      { name: "isActive", label: "Aktif", type: "boolean" },
    ],
  },
  {
    path: "artikel-kategori", apiPath: "artikel-kategori", label: "Kategori Artikel",
    columns: ["id", "nama", "slug"],
    fields: [{ name: "nama", label: "Nama", required: true }],
  },
  {
    path: "artikel", apiPath: "artikel", label: "Artikel",
    columns: ["id", "judul", "status", "penulis"],
    fields: [
      { name: "judul", label: "Judul", required: true },
      { name: "kategoriId", label: "Kategori ID", type: "number", required: true },
      { name: "ringkasan", label: "Ringkasan", type: "textarea", required: true },
      { name: "konten", label: "Konten (HTML)", type: "textarea", required: true },
      { name: "gambarThumbnail", label: "Thumbnail", type: "file" },
      { name: "penulis", label: "Penulis", required: true },
      { name: "status", label: "Status (draft/published)" },
      { name: "publishedAt", label: "Tanggal Publish", type: "date" },
    ],
  },
  {
    path: "testimoni", apiPath: "testimoni", label: "Testimoni",
    columns: ["id", "namaKlien", "perusahaan", "urutan"],
    fields: [
      { name: "namaKlien", label: "Nama Klien", required: true },
      { name: "perusahaan", label: "Perusahaan" },
      { name: "isiTestimoni", label: "Isi Testimoni", type: "textarea", required: true },
      { name: "urutan", label: "Urutan", type: "number" },
      { name: "isActive", label: "Aktif", type: "boolean" },
    ],
  },
  {
    path: "klien-mitra", apiPath: "klien-mitra", label: "Klien & Mitra",
    columns: ["id", "nama", "urutan"],
    fields: [
      { name: "nama", label: "Nama", required: true },
      { name: "logoUrl", label: "Logo", type: "file" },
      { name: "urutan", label: "Urutan", type: "number" },
      { name: "isActive", label: "Aktif", type: "boolean" },
    ],
  },
  /* Statistik Landing removed per request */
  {
    path: "struktur-organisasi", apiPath: "struktur-organisasi", label: "Struktur Organisasi",
    columns: ["id", "nama", "jabatan", "urutan", "isActive"],
    fields: [
      { name: "nama", label: "Nama", required: true },
      { name: "jabatan", label: "Jabatan", required: true },
      { name: "fotoUrl", label: "Foto", type: "file" },
      { name: "urutan", label: "Urutan", type: "number" },
      { name: "isActive", label: "Aktif", type: "boolean" },
    ],
  },
];

export default function ResourcePage({ resource }: { resource: Resource }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});
  const [showForm, setShowForm] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // If this resource is `produk`, load kategori list for dropdown
  const { data: kategoriData } = useQuery({
    queryKey: ["produk-kategori"],
    queryFn: async () => (await api.get("/admin/produk-kategori")).data,
    enabled: resource.apiPath === "produk",
  });

  // If this resource is `proyek`, load project categories
  const { data: projectKategoriData } = useQuery({
    queryKey: ["project-categories"],
    queryFn: async () => (await api.get("/admin/project-categories")).data,
    enabled: resource.apiPath === "proyek",
  });

  const uploadFile = async (fieldName: string, file: File, isMultiple?: boolean) => {
    setUploadingField(fieldName);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/admin/upload", fd);
      const url = data?.item?.url || "";
      if (isMultiple) {
        setForm((current: any) => ({ ...current, [fieldName]: [...(current[fieldName] || []), url] }));
      } else {
        setForm((current: any) => ({ ...current, [fieldName]: url }));
      }
    } catch (error) {
      console.error(error);
      alert("Gagal mengunggah foto. Coba lagi.");
    } finally {
      setUploadingField(null);
    }
  };

  const { data } = useQuery({
    queryKey: [resource.apiPath],
    queryFn: async () => (await api.get(`/admin/${resource.apiPath}`)).data,
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing?.id) return api.put(`/admin/${resource.apiPath}/${editing.id}`, form);
      return api.post(`/admin/${resource.apiPath}`, form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resource.apiPath] });
      setShowForm(false);
      setEditing(null);
      setForm({});
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => api.delete(`/admin/${resource.apiPath}/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource.apiPath] }),
  });

  const openCreate = () => { setEditing(null); setForm({}); setShowForm(true); };
  const openEdit = (row: any) => { setEditing(row); setForm({ ...row }); setShowForm(true); };
  const askDelete = (row: any) => {
    if (confirm(`Hapus item #${row.id}?`)) remove.mutate(row.id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{resource.label}</h1>
        <button className="btn-primary" onClick={openCreate}>+ Tambah</button>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>{resource.columns.map((c) => <th key={c}>{c}</th>)}<th>Aksi</th></tr>
          </thead>
          <tbody>
            {data?.items?.map((row: any) => (
              <tr key={row.id}>
                {resource.columns.map((c) => (
                  <td key={c}>{formatCell(row[c])}</td>
                ))}
                <td className="space-x-2">
                  <button className="btn-outline" onClick={() => openEdit(row)}>Edit</button>
                  <button className="btn-outline text-brand" onClick={() => askDelete(row)}>Hapus</button>
                </td>
              </tr>
            ))}
            {data?.items?.length === 0 && (
              <tr><td colSpan={resource.columns.length + 1} className="text-center text-slate-500 py-6">Belum ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setShowForm(false)}>
          <div className="card w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="font-semibold mb-4">
              {editing ? `Edit ${resource.label} #${editing.id}` : `Tambah ${resource.label}`}
            </div>
            <div className="space-y-3">
              {resource.fields.map((f) => (
                <div key={f.name}>
                  <label className="label">{f.label}{f.required && " *"}</label>
                  {f.type === "textarea" ? (
                    <textarea className="input min-h-[120px]" value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                  ) : f.type === "file-multiple" ? (
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="input"
                        disabled={uploadingField === f.name}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadFile(f.name, file, true);
                        }}
                      />
                      {uploadingField === f.name && (
                        <div className="text-sm text-slate-500">Mengunggah foto…</div>
                      )}
                      {Array.isArray(form[f.name]) && form[f.name].length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-2">
                          {form[f.name].map((url: string, idx: number) => (
                            <div key={idx} className="relative group">
                              <img src={url} alt="Preview" className="h-20 w-20 object-cover rounded" />
                              <button
                                type="button"
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                                onClick={() => {
                                  setForm({ ...form, [f.name]: form[f.name].filter((_: any, i: number) => i !== idx) });
                                }}
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : f.type === "file" ? (
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="input"
                        disabled={uploadingField === f.name}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadFile(f.name, file);
                        }}
                      />
                      {uploadingField === f.name ? (
                        <div className="text-sm text-slate-500">Mengunggah foto…</div>
                      ) : form[f.name] ? (
                        <div className="space-y-2">
                          <div className="text-sm text-slate-500">URL foto: {form[f.name]}</div>
                          <img src={form[f.name]} alt="Preview" className="h-28 w-28 object-cover rounded" />
                        </div>
                      ) : null}
                    </div>
                  ) : f.type === "select" ? (
                    <select
                      className="input"
                      value={form[f.name] ?? ""}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value === "" ? null : Number(e.target.value) })}
                    >
                      <option value="">— Pilih kategori —</option>
                      {((resource.apiPath === 'produk' ? kategoriData : projectKategoriData)?.items ?? (resource.apiPath === 'produk' ? kategoriData : projectKategoriData ?? [])).map((c: any) => (
                        <option key={c.id} value={c.id}>{c.label_id ?? c.nama ?? c.name ?? c.slug ?? c.label_en}</option>
                      ))}
                    </select>
                  ) : f.type === "boolean" ? (
                    <input type="checkbox" checked={!!form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })} />
                  ) : f.type === "number" ? (
                    <input type="number" className="input" value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value === "" ? null : Number(e.target.value) })} />
                  ) : f.type === "date" ? (
                    <input type="date" className="input" value={form[f.name] ? String(form[f.name]).slice(0, 10) : ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                  ) : (
                    <input
                      className="input"
                      placeholder={f.name === "price" ? "Rp100.000" : undefined}
                      value={form[f.name] ?? ""}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="btn-outline" onClick={() => setShowForm(false)}>Batal</button>
              <button className="btn-primary" onClick={() => save.mutate()} disabled={save.isPending}>
                {save.isPending ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
            {save.isError && <div className="text-brand text-sm mt-2">{(save.error as any)?.response?.data?.error ?? "Gagal simpan"}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function formatCell(v: any): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "✓" : "—";
  if (v instanceof Date || (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v))) return String(v).slice(0, 10);
  if (typeof v === "object") return JSON.stringify(v).slice(0, 50);
  return String(v);
}
