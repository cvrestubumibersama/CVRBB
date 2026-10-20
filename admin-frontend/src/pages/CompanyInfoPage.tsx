import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

const KEYS = [
  "alamat", "telepon", "email", "whatsapp_number", "jam_operasional",
  "google_maps_embed", "sejarah_singkat", "visi", "misi",
];

export default function CompanyInfoPage() {
  const { data } = useQuery({
    queryKey: ["company-info"],
    queryFn: async () => (await api.get("/admin/company-info")).data as Record<string, string>,
  });
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (data) setForm(data); }, [data]);

  const save = async () => {
    const items = KEYS.map((k) => ({ key: k, value: form[k] ?? "" }));
    await api.put("/admin/company-info", { items });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold mb-4">Info Perusahaan</h1>
      <div className="card p-6 space-y-4">
        {KEYS.map((k) => (
          <div key={k}>
            <label className="label">{k.replace(/_/g, " ")}</label>
            {["sejarah_singkat", "visi", "misi", "google_maps_embed"].includes(k) ? (
              <textarea className="input min-h-[80px]" value={form[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            ) : (
              <input className="input" value={form[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            )}
          </div>
        ))}
        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={save}>Simpan</button>
          {saved && <span className="text-sm text-green-600">Tersimpan ✓</span>}
        </div>
      </div>
    </div>
  );
}
