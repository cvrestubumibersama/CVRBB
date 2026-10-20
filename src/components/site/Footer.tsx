import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/api";
import { Mail, Phone, MapPin } from "lucide-react";
import { useComingSoon } from "./ComingSoonModal";

export function Footer() {
  const { t } = useI18n();
  const { data: settings } = useSettings();
  const { openComingSoon } = useComingSoon();

  return (
    <footer className="mt-24 border-t border-border bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="mb-6">
            <div className="leading-tight space-y-1.5">
              <div className="font-display text-base font-semibold text-foreground">{settings?.company_name ?? "CV. Restu Bumi Bersama"}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Kontraktor & Supplier</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">{settings?.footer_tagline ?? t("footer.tagline")}</p>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" /><span>{settings?.address ?? "Ngampel, Kabupaten Madiun, Jawa Timur, Indonesia"}</span></div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /><span>{settings?.phone ?? "+62 812-3456-7890"}</span></div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>{settings?.email ?? "info@restubumibersama.co.id"}</span></div>
          </div>
        </div>
        <div>
          <div className="font-display font-semibold mb-10 text-sm">{t("nav.about")}</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/tentang-kami" className="hover:text-[var(--primary)] transition-colors">{t("nav.about")}</Link></li>
            <li><Link to="/layanan" className="hover:text-[var(--primary)] transition-colors">{t("nav.services")}</Link></li>
            <li><Link to="/produk" className="hover:text-[var(--primary)] transition-colors">{t("nav.products")}</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-display font-semibold mb-10 text-sm">Link</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/proyek-legalitas" className="hover:text-[var(--primary)] transition-colors">{t("nav.projects")}</Link></li>
            <li><Link to="/klien-kontak" className="hover:text-[var(--primary)] transition-colors">{t("nav.contact")}</Link></li>
            <li>
              <button
                type="button"
                onClick={() => openComingSoon()}
                className="hover:text-[var(--primary)] transition-colors cursor-pointer text-left flex items-center gap-1.5"
              >
                <span>{t("nav.articles")}</span>
                <span className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Soon</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} {settings?.company_name ?? "CV. Restu Bumi Bersama"}. {settings?.footer_rights ?? t("footer.rights")}</div>
          <div>Ngampel, Madiun · Jawa Timur</div>
        </div>
      </div>
    </footer>
  );
}
