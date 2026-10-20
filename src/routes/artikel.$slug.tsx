import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BackHomeBar, Card, Reveal } from "@/components/site/ui";
import { useI18n } from "@/lib/i18n";
import { getPublicApiUrl, pick, useArticles } from "@/lib/api";
import { Calendar } from "lucide-react";

async function fetchArticle(slug: string) {
  const response = await fetch(getPublicApiUrl(`/articles/${slug}`));
  if (!response.ok) {
    throw notFound();
  }
  return response.json();
}

export const Route = createFileRoute("/artikel/$slug")({
  beforeLoad: () => {
    throw redirect({
      to: "/",
      search: { comingSoon: "artikel" } as any,
    });
  },
  loader: async ({ params }) => {
    const article = await fetchArticle(params.slug);
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Artikel — CV. Restu Bumi Bersama" }] };
    const a = loaderData.article;
    return {
      meta: [
        { title: `${a.title.id} — CV. Restu Bumi Bersama` },
        { name: "description", content: a.excerpt.id },
        { property: "og:title", content: a.title.id },
        { property: "og:description", content: a.excerpt.id },
        { property: "og:image", content: a.img },
        { property: "og:type", content: "article" },
        { name: "twitter:image", content: a.img },
      ],
    };
  },
  component: ArticleDetail,
});

function ArticleDetail() {
  const { article } = Route.useLoaderData();
  const { lang, t } = useI18n();
  const { data: articles = [] } = useArticles();
  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <SiteLayout>
      <BackHomeBar label={pick(article.title, lang)} />
      <article className="mx-auto max-w-3xl px-4 md:px-6 py-12">
        <Reveal>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[var(--primary)] font-semibold uppercase tracking-widest">{pick(article.category, lang)}</span>
            <span className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" />{article.date}</span>
          </div>
          <h1 className="mt-4 font-display text-3xl md:text-5xl font-semibold leading-tight">{pick(article.title, lang)}</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-8 aspect-[16/9] overflow-hidden rounded-lg bg-muted">
            <img src={article.img} alt={pick(article.title, lang)} className="h-full w-full object-cover" />
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-8 prose prose-lg max-w-none text-foreground/90 leading-relaxed">
            <p className="text-lg">{pick(article.body, lang)}</p>
          </div>
        </Reveal>
      </article>

      <section className="bg-[var(--surface)] border-t border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-16">
          <Reveal><h2 className="font-display text-2xl md:text-3xl font-semibold">{t("articles.related")}</h2></Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {related.map((a, i) => (
              <Reveal key={a.slug} delay={i * 0.08}>
                <Link to="/artikel/$slug" params={{ slug: a.slug }} className="block h-full">
                  <Card className="overflow-hidden h-full">
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      <img src={a.img} alt={pick(a.title, lang)} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                    </div>
                    <div className="p-5">
                      <div className="text-[var(--primary)] font-semibold uppercase tracking-widest text-xs">{pick(a.category, lang)}</div>
                      <h3 className="mt-2 font-display font-semibold">{pick(a.title, lang)}</h3>
                    </div>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
