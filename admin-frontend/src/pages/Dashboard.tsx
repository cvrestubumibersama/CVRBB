import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export default function Dashboard() {
  const { data } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => (await api.get("/admin/stats")).data,
  });

  const cards = [
    { label: "Leads Baru", value: data?.leadsBaru ?? "…", highlight: true },
    { label: "Proyek", value: data?.proyek ?? "…" },
    { label: "Produk", value: data?.produk ?? "…" },
    { label: "Artikel", value: data?.artikel ?? "…" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`card p-4 ${c.highlight ? "border-brand border-2" : ""}`}>
            <div className="text-xs uppercase text-slate-500">{c.label}</div>
            <div className={`text-3xl font-bold ${c.highlight ? "text-brand" : ""}`}>{c.value}</div>
          </div>
        ))}
      </div>
      {data?.leadsPerBulan?.length > 0 && (
        <div className="card p-4 mt-6">
          <div className="font-medium mb-3">Leads per bulan (12 bulan terakhir)</div>
          <div className="flex items-end gap-2 h-40">
            {data.leadsPerBulan.map((b: any) => {
              const max = Math.max(...data.leadsPerBulan.map((x: any) => x.jumlah), 1);
              return (
                <div key={b.bulan} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-brand/80 rounded-t"
                    style={{ height: `${(b.jumlah / max) * 100}%` }}
                    title={`${b.bulan}: ${b.jumlah}`}
                  />
                  <div className="text-[10px] text-slate-500">{b.bulan.slice(-2)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
