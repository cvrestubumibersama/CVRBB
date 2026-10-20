import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BackHomeBar, Card, PageHero, Reveal } from "@/components/site/ui";
import { useI18n } from "@/lib/i18n";
import { pick, useAdvantages, useOrganizationMembers } from "@/lib/api";

export const Route = createFileRoute("/tentang-kami")({
  head: () => ({
    meta: [
      { title: "Tentang Kami | CV. Restu Bumi Bersama" },
      { name: "description", content: "Sejarah, visi misi, dan struktur organisasi CV. Restu Bumi Bersama — kontraktor & supplier bahan bangunan sejak 2012." },
      { property: "og:title", content: "Tentang Kami | CV. Restu Bumi Bersama" },
      { property: "og:description", content: "Kontraktor & supplier material bangunan sejak 2012 di Madiun." },
    ],
  }),
  component: TentangPage,
});

function TentangPage() {
  const { t, lang } = useI18n();
  const { data: advantages = [] } = useAdvantages();
  const { data: org = [] } = useOrganizationMembers();

  return (
    <SiteLayout>
      <PageHero
        eyebrow={t("nav.about")}
        title={t("about.title")}
        subtitle={t("about.history")}
        image="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1600&q=70"
      />
      <BackHomeBar label={t("nav.about")} />

      <section className="mx-auto max-w-4xl px-4 md:px-6 py-16 space-y-5 text-base leading-relaxed text-foreground/90">
        <Reveal>
          <p>{t("about.history")}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <p>{t("about.history2")}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <p>{t("about.history3")}</p>
        </Reveal>
      </section>

      <section className="bg-[var(--surface)] border-y border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-16 grid gap-6 md:grid-cols-2">
          <Reveal>
            <Card className="p-8 h-full">
              <div className="text-xs uppercase tracking-widest text-[var(--primary)] font-semibold">01</div>
              <h3 className="mt-3 font-display text-2xl font-semibold">{t("about.visionTitle")}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{t("about.vision")}</p>
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="p-8 h-full">
              <div className="text-xs uppercase tracking-widest text-[var(--primary)] font-semibold">02</div>
              <h3 className="mt-3 font-display text-2xl font-semibold">{t("about.missionTitle")}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{t("about.mission")}</p>
            </Card>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-6 py-20">
        <Reveal>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-center">{t("about.orgTitle")}</h2>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {org.length > 0 ? (
            org.map((member, index) => (
              <Reveal key={member.id} delay={index * 0.05}>
                <OrgCard
                  id={member.id.toString()}
                  name={member.name}
                  role={pick(member.role, lang)}
                  imageUrl={member.image_url}
                  highlight={index === 0}
                />
              </Reveal>
            ))
          ) : (
            <Reveal>
              <div className="text-center text-slate-500 py-12">Data struktur organisasi belum tersedia.</div>
            </Reveal>
          )}
        </div>
      </section>

      <section className="bg-[var(--surface)] border-t border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-20">
          <Reveal>
            <h2 className="font-display text-3xl md:text-4xl font-semibold">{t("about.advTitle")}</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((a, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <Card className="p-6 h-full">
                  <div className="h-10 w-10 grid place-items-center rounded-md bg-[var(--primary)]/10 text-[var(--primary)] font-bold">{a.icon}</div>
                  <h3 className="mt-4 font-display font-semibold">{pick(a.title, lang)}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{pick(a.desc, lang)}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function OrgCard({ id, name, role, imageUrl, highlight }: { id?: string; name: string; role: string; imageUrl?: string; highlight?: boolean }) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const resolvedImage = imageUrl
    ? imageUrl.match(/^https?:\/\//)
      ? imageUrl
      : imageUrl.startsWith("/")
      ? imageUrl
      : `/${imageUrl.replace(/^\/+/, "")}`
    : null;

  return (
    <div
      data-org-id={id}
      className={`group relative mx-auto w-full max-w-[240px] overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
        highlight ? "border-[var(--primary)]/30 shadow-md shadow-[var(--primary)]/5" : "border-border shadow-sm"
      }`}
    >
      {/* Accent bar signals leadership without flooding the card in color */}
      <div className={`h-1 w-full ${highlight ? "bg-[var(--primary)]" : "bg-transparent"}`} />

      {/* Photo */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-white">
        {resolvedImage ? (
          <img
            src={resolvedImage}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover grayscale-[35%] transition-all duration-500 ease-out group-hover:grayscale-0 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--primary)]/12 via-white to-white">
            <span className="font-display text-3xl font-semibold tracking-tight text-[var(--primary)]/70">
              {initials}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {highlight && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-[var(--primary)] shadow-sm backdrop-blur-sm">
            Pimpinan
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-5 text-center">
        <div className="font-display text-base font-semibold leading-tight text-foreground">{name}</div>
        <div className="mx-auto mt-2.5 h-px w-6 bg-[var(--primary)]/40" />
        <div className="mt-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
          {role}
        </div>
      </div>
    </div>
  );
}