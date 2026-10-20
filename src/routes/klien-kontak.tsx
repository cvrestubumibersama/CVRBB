import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BackHomeBar, Button, Card, PageHero, Reveal } from "@/components/site/ui";
import { useI18n } from "@/lib/i18n";
import { pick, usePartners, useSettings, useTestimonials } from "@/lib/api";
import { Mail, MapPin, Phone, Clock, Quote, Check } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/klien-kontak")({
  head: () => ({
    meta: [
      { title: "Klien & Kontak | CV. Restu Bumi Bersama" },
      { name: "description", content: "Hubungi CV. Restu Bumi Bersama untuk permintaan penawaran proyek konstruksi dan supply material bangunan." },
      { property: "og:title", content: "Klien & Kontak | CV. Restu Bumi Bersama" },
      { property: "og:description", content: "Formulir permintaan penawaran dan informasi kontak." },
    ],
  }),
  component: KontakPage,
});

type Form = { name: string; company: string; phone: string; type: string; location: string; desc: string };
const empty: Form = { name: "", company: "", phone: "", type: "Konstruksi Baru", location: "", desc: "" };

function KontakPage() {
  const { t, lang } = useI18n();
  const { data: settings } = useSettings();
  const { data: partners = [] } = usePartners();
  const { data: testimonials = [] } = useTestimonials();
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [sent, setSent] = useState(false);

  const getQuote = (tm: { quote?: { id?: string; en?: string }; quote_id?: string; quote_en?: string }) => {
    const quoteValue = tm.quote ?? {
      id: tm.quote_id ?? "",
      en: tm.quote_en ?? tm.quote_id ?? "",
    };

    return pick(quoteValue, lang);
  };

  const getAuthorName = (tm: { name?: string; author_name?: string }) => tm.author_name ?? tm.name ?? "Klien";
  const getAuthorRole = (tm: { role?: string; author_role?: string }) => tm.author_role ?? tm.role ?? "";

  const validate = (): boolean => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (form.name.trim().length < 2) e.name = "Wajib diisi";
    if (!/^[+]?[\d\s-]{8,}$/.test(form.phone.trim())) e.phone = "Nomor tidak valid";
    if (form.location.trim().length < 2) e.location = "Wajib diisi";
    if (form.desc.trim().length < 10) e.desc = "Minimal 10 karakter";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const msg = `Halo, saya ${form.name}${form.company ? ` dari ${form.company}` : ""}.\nJenis Proyek: ${form.type}\nLokasi: ${form.location}\nTelepon: ${form.phone}\n\n${form.desc}`;
    const whatsapp = (settings?.whatsapp ?? "6285748185726").replace(/\D/g, "").replace(/^0+/, "62");
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
    setSent(true);
    setForm(empty);
  };

  const googleMapsUrl = "https://www.google.com/maps/place/CV+RESTU+BUMI+BERSAMA/@-7.5362002,111.6541483,15z/data=!4m6!3m5!1s0x2e79c7cf399313d3:0xca906b69d14ce1a3!8m2!3d-7.5372627!4d111.6565939!16s%2Fg%2F11njlj40x9?entry=ttu&g_ep=EgoyMDI2MDgxMi4wIKXMDSoASAFQAw%3D%3D";
  const osmEmbedUrl =
    "https://www.openstreetmap.org/export/embed.html?bbox=111.6465939%2C-7.5422627%2C111.6665939%2C-7.5322627&layer=mapnik&marker=-7.5372627%2C111.6565939";
  const iframeSrc =
    settings?.maps_embed_url && !/google\.com/.test(settings.maps_embed_url)
      ? settings.maps_embed_url
      : osmEmbedUrl;

  return (
    <SiteLayout>
      <PageHero
        eyebrow={t("nav.contact")}
        title={t("contact.title")}
        subtitle="Ceritakan kebutuhan proyek Anda, tim kami siap membantu."
        image="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=70"
      />
      <BackHomeBar label={t("nav.contact")} />

      <section className="w-full py-16 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal>
            <div className="text-center text-sm uppercase tracking-widest text-muted-foreground mb-8">{t("section.partners")}</div>
          </Reveal>
          
          {(() => {
            const isAnimated = partners.length > 8;

            const resolveImage = (url?: string) => {
              if (!url) return "";
              if (/^https?:\/\//.test(url)) return url;
              if (url.startsWith("/")) return url;
              return `/${url.replace(/^\/+/, "")}`;
            };

            const renderPartner = (p: any) => (
              <div className="flex flex-col items-center justify-center gap-3 w-32 shrink-0">
                <div className="h-20 w-32 relative flex items-center justify-center grayscale opacity-80 hover:opacity-100 hover:grayscale-0 transition-all duration-300">
                  {p.image_url ? (
                    <img src={resolveImage(p.image_url)} alt={p.name} className="max-h-full max-w-full object-contain" loading="lazy" />
                  ) : (
                    <div className="font-display font-bold text-2xl text-muted-foreground">{p.name.charAt(0)}</div>
                  )}
                </div>
                <div className="text-center font-display font-semibold text-xs text-muted-foreground line-clamp-1 w-full truncate">
                  {p.name}
                </div>
              </div>
            );

            if (isAnimated) {
              return (
                <div className="relative w-full flex overflow-hidden group">
                  <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-[var(--background)] to-transparent z-10 pointer-events-none" />
                  <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-[var(--background)] to-transparent z-10 pointer-events-none" />
                  
                  <div className="flex w-max animate-marquee-right hover:[animation-play-state:paused]">
                    <div className="flex items-center">
                      {partners.map((p) => <div key={p.id} className="pr-8">{renderPartner(p)}</div>)}
                    </div>
                    <div className="flex items-center">
                      {partners.map((p) => <div key={p.id + "-clone"} className="pr-8">{renderPartner(p)}</div>)}
                    </div>
                  </div>
                  <style>{`
                    @keyframes marquee-right {
                      from { transform: translateX(-50%); }
                      to { transform: translateX(0%); }
                    }
                    .animate-marquee-right {
                      animation: marquee-right 40s linear infinite;
                    }
                  `}</style>
                </div>
              );
            }

            return (
              <div className="flex flex-wrap justify-center gap-8 items-center">
                {partners.map((p, i) => (
                  <Reveal key={p.id ?? i} delay={i * 0.05}>
                    {renderPartner(p)}
                  </Reveal>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      <section className="bg-[var(--surface)] border-y border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-16">
          <Reveal><h2 className="font-display text-3xl md:text-4xl font-semibold">{t("contact.testimonyTitle")}</h2></Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((tm, i) => (
              <Reveal key={tm.id ?? i} delay={i * 0.08}>
                <Card className="p-6 h-full">
                  <Quote className="h-6 w-6 text-[var(--primary)]" />
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90">"{getQuote(tm)}"</p>
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="font-display font-semibold text-sm">{getAuthorName(tm)}</div>
                    <div className="text-xs text-muted-foreground">{getAuthorRole(tm)}</div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-16 grid gap-8 lg:grid-cols-2">
        <Reveal>
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold">{t("contact.info")}</h2>
            <div className="mt-6 space-y-4 text-sm">
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Alamat">{settings?.address ?? "Ngampel, Madiun, Jawa Timur"}</InfoRow>
              <InfoRow icon={<Phone className="h-4 w-4" />} label="Telepon">{settings?.phone ?? "+62 812-3456-7890"}</InfoRow>
              <InfoRow icon={<Mail className="h-4 w-4" />} label="Email">{settings?.email ?? "info@restubumibersama.co.id"}</InfoRow>
              <InfoRow icon={<Clock className="h-4 w-4" />} label={t("contact.hours")}>{t("contact.hoursValue")}</InfoRow>
            </div>
            <div className="mt-6 aspect-[16/10] overflow-hidden rounded-lg border border-border bg-[#eef3f8] relative shadow-[0_10px_30px_-15px_rgba(0,0,0,0.2)]">
              <iframe
                title="Lokasi CV. Restu Bumi Bersama"
                src={iframeSrc}
                className="h-full w-full"
                loading="lazy"
                style={{ filter: "saturate(0.8) contrast(1.08) brightness(1.08)" }}
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="pointer-events-none absolute inset-0 border border-white/60" />
              <a
                href={settings?.maps_embed_url ?? googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-md bg-[var(--primary)] text-white px-3 py-2 text-sm shadow-lg hover:opacity-95"
              >
                Buka di Google Maps
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="p-6 md:p-8">
            <h2 className="font-display text-2xl font-semibold">{t("contact.formTitle")}</h2>
            {sent && (
              <div className="mt-4 flex items-center gap-2 text-sm bg-[var(--primary)]/10 text-[var(--primary)] rounded-md p-3">
                <Check className="h-4 w-4" /> Terima kasih! Pesan Anda diteruskan ke WhatsApp kami.
              </div>
            )}
            <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
              <Field label={t("contact.name")} error={errors.name} required>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
              </Field>
              <Field label={t("contact.company")}>
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("contact.phone")} error={errors.phone} required>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+62 812…" />
                </Field>
                <Field label={t("contact.type")} required>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
                    <option>Konstruksi Baru</option>
                    <option>Renovasi</option>
                    <option>Supply Material</option>
                    <option>Lainnya</option>
                  </select>
                </Field>
              </div>
              <Field label={t("contact.location")} error={errors.location} required>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" />
              </Field>
              <Field label={t("contact.desc")} error={errors.desc} required>
                <textarea rows={4} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} className="input resize-none" />
              </Field>
              <Button type="submit" size="lg" className="w-full">{t("cta.submit")}</Button>
            </form>
          </Card>
        </Reveal>
      </section>

      <style>{`.input{width:100%;height:42px;padding:0 12px;border:1px solid var(--border);border-radius:6px;background:white;font-size:14px;transition:all .15s;font-family:inherit}.input:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px rgba(212,32,39,.15)}textarea.input{height:auto;padding:10px 12px}`}</style>
    </SiteLayout>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 grid place-items-center rounded-md bg-[var(--surface)] text-[var(--primary)] shrink-0">{icon}</div>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm text-foreground mt-0.5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, error, required }: { label: string; children: React.ReactNode; error?: string; required?: boolean }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-foreground mb-1.5">{label}{required && <span className="text-[var(--primary)]"> *</span>}</div>
      {children}
      {error && <div className="mt-1 text-xs text-[var(--primary)]">{error}</div>}
    </label>
  );
}
