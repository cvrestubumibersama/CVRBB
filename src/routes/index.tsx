import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button, Card, CountUp, Reveal, AutoSlider } from "@/components/site/ui";
import { useI18n } from "@/lib/i18n";
import { pick, usePartners, useProjects, useServices, useSiteTexts } from "@/lib/api";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kontraktor Madiun | CV. Restu Bumi Bersama | Kontraktor & Supplier Material Bangunan" },
      { name: "description", content: "Jasa kontraktor dan supplier bahan bangunan di Madiun & Caruban. CV RBB melayani konstruksi, renovasi, gudang, dan supply material dengan mutu terbaik." },
      { property: "og:title", content: "CV. Restu Bumi Bersama" },
      { property: "og:description", content: "Membangun proyek Anda dengan presisi dan material terpercaya." },
      { property: "og:image", content: "/RBB.png" },
      { name: "twitter:image", content: "/RBB.png" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <SiteLayout>
      <Hero />
      <Stats />
      <ServicesPreview />
      <ProjectsPreview />
      <PartnersStrip />
    </SiteLayout>
  );
}

function Typewriter({ text, speed = 50 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(interval);
      }
    }, speed);

    return () => window.clearInterval(interval);
  }, [text, speed]);

  return (
    <span className="inline-flex items-center gap-2">
      <span>{displayed}</span>
      <span className="text-white/80 animate-pulse">|</span>
    </span>
  );
}

function Hero() {
  const { t, lang } = useI18n();
  const { data: siteTexts } = useSiteTexts();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.8], [0.5, 1]);
  const overlayBg = useTransform(scrollYProgress, [0, 1], ["rgba(250,250,248,0)", "rgba(250,250,248,1)"]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  const headline = siteTexts?.["hero.headline"] ?? { id: t("hero.headline"), en: t("hero.headline") };
  const sub = siteTexts?.["hero.sub"] ?? { id: t("hero.sub"), en: t("hero.sub") };

  const images = ["/hero1.webp", "/hero3.webp", "/hero4.webp"];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="relative min-h-[92vh] overflow-hidden bg-white">
      <motion.div style={{ y: bgY }} className="absolute inset-0 bg-black">
        {images.map((src, idx) => (
          <motion.img
            key={src}
            src={src}
            initial={false}
            animate={{ opacity: idx === currentImage ? 0.7 : 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 h-full w-full object-cover"
            alt={`Hero background ${idx + 1}`}
          />
        ))}
      </motion.div>
      <motion.div style={{ opacity: overlayOpacity, backgroundColor: overlayBg }} className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="hero-particle left-12 top-28 w-2 h-2"></span>
        <span className="hero-particle left-[68%] top-16 w-3 h-3"></span>
        <span className="hero-particle left-1/4 top-2/3 w-2.5 h-2.5"></span>
        <span className="hero-streak left-10 top-36 w-48 h-[1px]"></span>
        <span className="hero-streak hero-streak-alt left-1/2 top-40 w-56 h-[1px]"></span>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6 min-h-[92vh] flex flex-col justify-center py-24">
        <Reveal delay={0.1}>
          <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white max-w-4xl leading-[1.05]">
            {headline[lang]}
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 text-base md:text-lg text-white/80 max-w-2xl">
            <Typewriter text={sub[lang]} />
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/klien-kontak" size="lg">{t("cta.quote")} <ArrowRight className="h-4 w-4" /></Button>
            <Button to="/proyek-legalitas" size="lg" variant="outline" className="text-white border-white/40 hover:bg-white hover:text-foreground hover:border-white">{t("cta.viewProjects")}</Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Stats() {
  const { t } = useI18n();
  const items = [
    { n: 50, s: "+", label: t("stats.projects") },
    { n: 5, s: "", label: t("stats.years") },
    { n: 20, s: "+", label: t("stats.clients") },
  ];
  return (
    <section className="border-b border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {items.map((it, i) => (
          <Reveal key={i} delay={i * 0.1} className="text-center sm:text-left">
            <div className="font-display text-5xl md:text-6xl font-semibold text-foreground">
              <CountUp end={it.n} suffix={it.s} />
            </div>
            <div className="mt-2 text-sm uppercase tracking-widest text-muted-foreground">{it.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ServicesPreview() {
  const { t, lang } = useI18n();
  const { data: services = [] } = useServices();

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-20">
      <Reveal>
        <h2 className="font-display text-3xl md:text-4xl font-semibold">{t("section.services")}</h2>
        <p className="mt-3 text-muted-foreground max-w-2xl">{t("section.servicesSub")}</p>
      </Reveal>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {services.map((s, i) => (
          <Reveal key={s.slug} delay={i * 0.08}>
            <Card className="overflow-hidden h-full flex flex-col md:flex-row">
              <div className="md:w-2/5 aspect-[4/3] md:aspect-auto overflow-hidden bg-muted relative">
                <AutoSlider images={s.image_urls || (s.image_url ? [s.image_url] : [])} alt={pick(s.title, lang)} />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="text-2xl">{s.icon}</div>
                <h3 className="mt-3 font-display text-xl font-semibold">{pick(s.title, lang)}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">{pick(s.desc, lang)}</p>
                <Link to="/layanan" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:gap-2 transition-all">
                  {t("nav.services")} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ProjectsPreview() {
  const { t, lang } = useI18n();
  const { data: projects = [] } = useProjects();

  return (
    <section className="bg-[var(--surface)] border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-20">
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl font-semibold">{t("section.highlightProjects")}</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {projects.slice(0, 3).map((p, i) => {
            const resolveImage = (url?: string) => {
              if (!url) return "";
              if (/^https?:\/\//.test(url)) return url;
              if (url.startsWith("/")) return url;
              return `/${url.replace(/^\/+/, "")}`;
            };
            const imgSrc = resolveImage(p.image_url);

            return (
              <Reveal key={p.name} delay={i * 0.08}>
                <Card className="overflow-hidden h-full">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img src={imgSrc} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
                  </div>
                  <div className="p-5">
                    <div className="text-xs uppercase tracking-widest text-[var(--primary)] font-semibold">{pick(p.category, lang)}</div>
                    <h3 className="mt-2 font-display text-lg font-semibold">{p.name}</h3>
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{p.location} · {p.year}</div>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PartnersStrip() {
  const { t } = useI18n();
  const { data: partners = [] } = usePartners();
  
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

  return (
    <section className="w-full py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <div className="text-center text-sm uppercase tracking-widest text-muted-foreground mb-8">{t("section.partners")}</div>
        </Reveal>
        
        {isAnimated ? (
          <div className="relative w-full flex overflow-hidden group">
            {/* Gradien untuk efek blur di kiri kanan */}
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
        ) : (
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {partners.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.05}>
                {renderPartner(p)}
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

