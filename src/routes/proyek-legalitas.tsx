import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BackHomeBar, Button, Card, PageHero, Reveal } from "@/components/site/ui";
import { useI18n } from "@/lib/i18n";
import { pick, useLegalDocs, useProjects } from "@/lib/api";
import { Download, FileText, MapPin } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/proyek-legalitas")({
  head: () => ({
    meta: [
      { title: "Proyek & Legalitas | CV. Restu Bumi Bersama" },
      { name: "description", content: "Portfolio proyek konstruksi dan dokumen legalitas resmi CV. Restu Bumi Bersama: NIB, NPWP, SBU, dan sertifikasi K3." },
      { property: "og:title", content: "Proyek & Legalitas | CV. Restu Bumi Bersama" },
      { property: "og:description", content: "Portfolio dan legalitas resmi perusahaan kami." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { t, lang } = useI18n();
  const { data: projects = [] } = useProjects();
  const { data: legalDocs = [] } = useLegalDocs();
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => set.add(pick(p.category, lang)));
    return Array.from(set);
  }, [lang, projects]);
  const [cat, setCat] = useState<string>("all");
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const resolveImage = (url?: string) => {
    if (!url) return "";
    if (/^https?:\/\//.test(url)) return url;
    if (url.startsWith("/")) return url;
    return `/${url.replace(/^\/+/, "")}`;
  };
  const filtered = cat === "all" ? projects : projects.filter((p) => pick(p.category, lang) === cat);

  return (
    <SiteLayout>
      <PageHero
        eyebrow={t("nav.projects")}
        title={t("projects.title")}
        subtitle="Portfolio proyek pilihan dan legalitas perusahaan resmi."
        image="https://images.unsplash.com/photo-1565608087341-404b25492fee?w=1600&q=70"
      />
      <BackHomeBar label={t("nav.projects")} />

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12">
        <div className="flex flex-wrap gap-2 mb-8">
          <FilterChip active={cat === "all"} onClick={() => setCat("all")}>{t("products.all")}</FilterChip>
          {categories.map((c) => (
            <FilterChip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</FilterChip>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => {
            const resolveImage = (url?: string) => {
              if (!url) return "";
              if (/^https?:\/\//.test(url)) return url;
              if (url.startsWith("/")) return url;
              return `/${url.replace(/^\/+/, "")}`;
            };
            const imgSrc = resolveImage(p.img || (p as any).image_url);

            return (
            <Reveal key={p.name} delay={(i % 3) * 0.08}>
              <Card className="overflow-hidden h-full">
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img src={imgSrc} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>
                <div className="p-5">
                  <div className="text-xs uppercase tracking-widest text-[var(--primary)] font-semibold">{pick(p.category, lang)}</div>
                  <h3 className="mt-2 font-display font-semibold">{p.name}</h3>
                  <div className="mt-1 text-sm text-muted-foreground">{p.client}</div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{p.location} · {p.year}</div>
                </div>
              </Card>
            </Reveal>
          );
          })}
        </div>
      </section>

      <section className="bg-[var(--surface)] border-y border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-20">
          <Reveal>
            <h2 className="font-display text-3xl md:text-4xl font-semibold">{t("projects.legalTitle")}</h2>
            <p className="mt-3 text-muted-foreground">Dokumen legalitas resmi perusahaan.</p>
          </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {legalDocs.map((doc, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div role="button" tabIndex={0} onClick={() => setSelectedDoc(doc)} onKeyDown={() => setSelectedDoc(doc)} className="cursor-pointer">
                  <Card className="p-5 flex items-start gap-4">
                    {(() => {
                      const imgSrc = resolveImage((doc as any).file_path || (doc as any).filePath || (doc as any).fileUrl || "");
                      if (imgSrc) {
                        return (
                          <div className="h-12 w-12 overflow-hidden rounded-md bg-muted shrink-0">
                            <img src={imgSrc} alt={pick(doc.name, lang)} className="h-12 w-12 object-cover" />
                          </div>
                        );
                      }
                      return (
                        <div className="h-12 w-12 grid place-items-center rounded-md bg-[var(--primary)]/10 text-[var(--primary)] shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                      );
                    })()}
                    <div>
                      <h3 className="font-display font-semibold text-sm">{pick(doc.name, lang)}</h3>
                      <div className="mt-1 text-xs text-muted-foreground font-mono">{(doc as any).document_number ?? (doc as any).number ?? ''}</div>
                    </div>
                  </Card>
                </div>
              </Reveal>
            ))}
          </div>

          {selectedDoc && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/60" onClick={() => setSelectedDoc(null)}>
              <div className="bg-white rounded shadow-lg max-w-3xl w-full mx-4 p-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{pick(selectedDoc.name, lang)}</h3>
                    <div className="text-sm text-muted-foreground">{selectedDoc.document_number || selectedDoc.number || ''}</div>
                  </div>
                  <button className="btn-outline" onClick={() => setSelectedDoc(null)}>Tutup</button>
                </div>
                <div className="mt-4">
                  <img src={resolveImage((selectedDoc as any).file_path || (selectedDoc as any).fileUrl || '')} alt={pick(selectedDoc.name, lang)} className="w-full h-auto object-contain max-h-[70vh] mx-auto" />
                </div>
              </div>
            </div>
          )}
          <div className="mt-10 text-center">
            <Button
              href="/api/public/company-profile-download"
              download="COMPANY PROFILE CV. RBB.pdf"
              variant="primary"
            >
              <Download className="h-4 w-4" /> {t("cta.downloadProfile")}
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${active ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-white text-foreground border-border hover:border-[var(--primary)] hover:text-[var(--primary)]"}`}>{children}</button>
  );
}
