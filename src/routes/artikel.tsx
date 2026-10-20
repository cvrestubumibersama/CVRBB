import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useI18n } from "@/lib/i18n";
import { useEffect } from "react";
import { Newspaper, ArrowLeft, Sparkles, Construction, CheckCircle2 } from "lucide-react";
import { useComingSoon } from "@/components/site/ComingSoonModal";

export const Route = createFileRoute("/artikel")({
  beforeLoad: () => {
    throw redirect({
      to: "/",
      search: { comingSoon: "artikel" } as any,
    });
  },
  head: () => ({
    meta: [
      { title: "Artikel & Berita (Segera Hadir) — CV. Restu Bumi Bersama" },
      { name: "description", content: "Halaman Artikel & Berita CV. Restu Bumi Bersama akan segera hadir." },
      { property: "og:title", content: "Artikel & Berita Segera Hadir — CV. Restu Bumi Bersama" },
      { property: "og:description", content: "Fitur ini sedang dalam pengembangan." },
    ],
  }),
  component: ArticlesPage,
});

function ArticlesPage() {
  const { lang } = useI18n();
  const { openComingSoon } = useComingSoon();
  const navigate = useNavigate();

  useEffect(() => {
    openComingSoon();
  }, [openComingSoon]);

  return (
    <SiteLayout>
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-[var(--primary)] shadow-sm border border-red-100">
            <Newspaper className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-amber-500 text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mb-4">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>{lang === "en" ? "UNDER CONSTRUCTION" : "DALAM PENGEMBANGAN"}</span>
        </div>

        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground max-w-xl">
          {lang === "en" ? "Articles & News Coming Soon" : "Halaman Artikel & Berita Segera Hadir"}
        </h1>

        <p className="mt-4 max-w-lg text-muted-foreground text-sm md:text-base leading-relaxed">
          {lang === "en"
            ? "We are preparing high quality articles, project updates, and construction guides. This page is not accessible yet and will be launched soon!"
            : "Halaman ini sedang dalam tahap kurasi konten dan pengembangan. Pengunjung belum dapat mengakses konten artikel saat ini. Nantikan peluncurannya segera!"}
        </p>

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => navigate({ to: "/" })}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-md shadow-red-500/20 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === "en" ? "Back to Homepage" : "Kembali ke Beranda"}</span>
          </button>
          <button
            onClick={() => openComingSoon()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-white text-foreground text-sm font-medium hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <Construction className="w-4 h-4 text-amber-600" />
            <span>{lang === "en" ? "View Details" : "Lihat Keterangan"}</span>
          </button>
        </div>
      </div>
    </SiteLayout>
  );
}
