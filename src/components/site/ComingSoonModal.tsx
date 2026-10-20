import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Newspaper, Sparkles, X, ArrowRight, Construction, CheckCircle2, Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";

interface ComingSoonData {
  title?: string;
  message?: string;
  category?: string;
  iconType?: "newspaper" | "language" | string;
  featuresTitle?: string;
  features?: string[];
}

interface ComingSoonContextType {
  isOpen: boolean;
  openComingSoon: (data?: ComingSoonData) => void;
  closeComingSoon: () => void;
}

const ComingSoonContext = createContext<ComingSoonContextType>({
  isOpen: false,
  openComingSoon: () => {},
  closeComingSoon: () => {},
});

export function useComingSoon() {
  return useContext(ComingSoonContext);
}

// Global trigger helper that can be called from outside React components if needed
export function showComingSoonModal(data?: ComingSoonData) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app:show-coming-soon", { detail: data }));
  }
}

export function ComingSoonProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState<ComingSoonData | undefined>();
  const { lang } = useI18n();

  const openComingSoon = (data?: ComingSoonData) => {
    setModalData(data);
    setIsOpen(true);
  };

  const closeComingSoon = () => {
    setIsOpen(false);
  };

  // Listen for global custom event and URL search param
  useEffect(() => {
    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<ComingSoonData>;
      openComingSoon(customEvent.detail);
    };

    window.addEventListener("app:show-coming-soon", handleCustomEvent);

    // Check if URL has ?comingSoon query parameter
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("comingSoon")) {
        const param = url.searchParams.get("comingSoon");
        openComingSoon({
          title: param === "artikel" ? (lang === "en" ? "Articles & News" : "Artikel & Berita") : undefined,
        });
        url.searchParams.delete("comingSoon");
        window.history.replaceState({}, "", url.pathname + (url.search || ""));
      }
    } catch {}

    return () => {
      window.removeEventListener("app:show-coming-soon", handleCustomEvent);
    };
  }, [lang]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeComingSoon();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const defaultTitle = lang === "en" ? "Page Coming Soon" : "Halaman Akan Segera Hadir";
  const defaultMessage =
    lang === "en"
      ? "The Articles & News section is currently being prepared and developed. We are crafting insightful construction tips and the latest project updates for you!"
      : "Halaman Artikel & Berita saat ini sedang dalam proses penyusunan dan kurasi konten. Nantikan pembaruan menarik, wawasan konstruksi, dan info proyek terbaru dari kami segera!";

  const title = modalData?.title ?? defaultTitle;
  const message = modalData?.message ?? defaultMessage;
  const iconType = modalData?.iconType ?? "newspaper";
  const featuresTitle =
    modalData?.featuresTitle ?? (lang === "en" ? "What's coming soon:" : "Yang akan hadir di halaman ini:");

  const defaultFeatures =
    lang === "en"
      ? [
          "Latest project documentation & company news",
          "Expert tips on construction & material selection",
          "Industry insights and architectural guides",
        ]
      : [
          "Update dokumentasi proyek & berita perusahaan",
          "Tips praktis konstruksi & pemilihan material terbaik",
          "Wawasan standar mutu dan panduan bangunan",
        ];

  const features = modalData?.features ?? defaultFeatures;

  return (
    <ComingSoonContext.Provider value={{ isOpen, openComingSoon, closeComingSoon }}>
      {children}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeComingSoon}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Modal dialog box */}
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-white shadow-2xl p-6 sm:p-8 text-foreground z-10 overflow-hidden"
            >
              {/* Decorative top gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--primary)] via-amber-500 to-[var(--primary)]" />

              {/* Close button */}
              <button
                type="button"
                onClick={closeComingSoon}
                className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-neutral-100 transition-colors"
                aria-label={lang === "en" ? "Close" : "Tutup"}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                {/* Icon & Badge */}
                <div className="relative mb-4 mt-2">
                  <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-[var(--primary)] shadow-inner border border-red-100">
                    {iconType === "language" ? (
                      <Languages className="w-8 h-8" />
                    ) : (
                      <Newspaper className="w-8 h-8" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-500 text-white shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Status chip */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mb-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>{lang === "en" ? "UNDER CONSTRUCTION" : "DALAM PENGEMBANGAN"}</span>
                </div>

                {/* Heading */}
                <h3 className="text-2xl font-bold font-display text-foreground tracking-tight">
                  {title}
                </h3>

                {/* Message */}
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md">
                  {message}
                </p>

                {/* Features preview box */}
                <div className="mt-5 w-full rounded-xl bg-neutral-50 border border-neutral-200/80 p-4 text-left">
                  <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    {iconType === "language" ? (
                      <Languages className="w-3.5 h-3.5 text-[var(--primary)]" />
                    ) : (
                      <Construction className="w-3.5 h-3.5 text-[var(--primary)]" />
                    )}
                    <span>{featuresTitle}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {features.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={closeComingSoon}
                    className="w-full sm:flex-1 py-2.5 px-5 rounded-lg bg-[var(--primary)] text-white font-medium text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-red-500/20"
                  >
                    {lang === "en" ? "Got It, Thank You" : "Mengerti, Terima Kasih"}
                  </button>
                  <Link
                    to="/klien-kontak"
                    onClick={closeComingSoon}
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-neutral-50 transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <span>{lang === "en" ? "Contact Us" : "Hubungi Kami"}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ComingSoonContext.Provider>
  );
}
