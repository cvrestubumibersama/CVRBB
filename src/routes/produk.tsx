import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BackHomeBar, Button, Card, PageHero, Reveal } from "@/components/site/ui";
import { useI18n } from "@/lib/i18n";
import { pick, useProductCategories, useProducts } from "@/lib/api";
import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/produk")({
  head: () => ({
    meta: [
      { title: "Supplier Material Bangunan Madiun | CV. Restu Bumi Bersama" },
      { name: "description", content: "Katalog material bangunan di Madiun: besi, baja ringan, semen, dan material umum. Supplier tepercaya siap kirim ke Madiun & Caruban." },
      { property: "og:title", content: "Produk | CV. Restu Bumi Bersama" },
      { property: "og:description", content: "Katalog bahan bangunan lengkap dengan harga kompetitif." },
    ],
  }),
  component: ProdukPage,
});

function ProdukPage() {
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const { data: products = [] } = useProducts();
  const { data: productCategories = [] } = useProductCategories();

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = cat === "all" || p.category === cat;
      const matchQ = q.trim() === "" || p.name.toLowerCase().includes(q.toLowerCase()) || pick(p.spec, lang).toLowerCase().includes(q.toLowerCase());
      return matchCat && matchQ;
    });
  }, [q, cat, lang, products]);

  const resolveImage = (url?: string) => {
    if (!url) return "";
    if (/^https?:\/\//.test(url)) return url;
    if (url.startsWith("/")) return url;
    return `/${url.replace(/^\/+/, "")}`;
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow={t("nav.products")}
        title={t("products.title")}
        subtitle="Semen, besi, baja ringan, dan material umum stok tersedia langsung siap kirim."
        image="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1600&q=70"
      />
      <BackHomeBar label={t("nav.products")} />

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("products.search")}
              className="w-full h-11 pl-10 pr-4 rounded-md border border-border bg-white text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
            />
          </div>
          <Button
            href="/api/public/catalog-pdf"
            download="Katalog-Produk-CV-Restu-Bumi-Bersama.pdf"
            variant="outline"
          >
            <Download className="h-4 w-4" /> {t("cta.downloadCatalog")}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <FilterChip active={cat === "all"} onClick={() => setCat("all")}>{t("products.all")}</FilterChip>
          {productCategories.map((c) => (
            <FilterChip key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)}>
              {pick(c.label, lang)}{c.price ? ` • ${c.price}` : ""}
            </FilterChip>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p, i) => {
            const imgSrc = resolveImage((p as any).img || (p as any).image_url);

            return (
              <Reveal key={p.name} delay={(i % 4) * 0.05}>
                <Card className="overflow-hidden h-full">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img src={imgSrc} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-sm font-semibold line-clamp-2">{p.name}</h3>
                    {p.price && <div className="mt-1 text-sm font-semibold text-[var(--primary)]">{p.price}</div>}
                    <p className="mt-1 text-xs text-muted-foreground">{pick(p.spec, lang)}</p>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">Tidak ada produk yang cocok.</div>
        )}
      </section>
    </SiteLayout>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${active ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-white text-foreground border-border hover:border-[var(--primary)] hover:text-[var(--primary)]"}`}
    >
      {children}
    </button>
  );
}
