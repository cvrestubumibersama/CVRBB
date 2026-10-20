import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { I18nProvider } from "../lib/i18n";
import LoadingScreen from "../components/ui/LoadingScreen";
import { ComingSoonProvider } from "../components/site/ComingSoonModal";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => {
    const SITE_URL = (import.meta.env.VITE_SITE_URL as string) ?? "https://restubumibersama.co.id";
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "CV. Restu Bumi Bersama — Kontraktor & Supplier Bahan Bangunan" },
        { name: "description", content: "Kontraktor dan supplier material bangunan tepercaya di Madiun, Jawa Timur sejak 2021. Melayani konstruksi, renovasi, dan supply material." },
        { property: "og:site_name", content: "CV. Restu Bumi Bersama" },
        { property: "og:type", content: "website" },
        { property: "og:image", content: "/RBB.png" },
        { name: "twitter:image", content: "/RBB.png" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/RBB.png", type: "image/png" },
        { rel: "shortcut icon", href: "/RBB.png", type: "image/png" },
        { rel: "apple-touch-icon", href: "/RBB.png" },
        { rel: "canonical", href: SITE_URL },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap" },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const SITE_URL = (import.meta.env.VITE_SITE_URL as string) ?? "https://restubumibersama.co.id";
  const DEFAULT_LANG = (import.meta.env.VITE_DEFAULT_LANG as string) ?? "id";

  const ld = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "CV. Restu Bumi Bersama",
    url: SITE_URL,
    telephone: "+62 812-3456-7890",
    email: "info@restubumibersama.co.id",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ngampel",
      addressLocality: "Madiun",
      addressRegion: "Jawa Timur",
      addressCountry: "ID",
    },
    areaServed: ["Madiun", "Caruban", "Jawa Timur"],
    sameAs: [],
  };

  return (
    <html lang={DEFAULT_LANG}>
      <head>
        <HeadContent />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [showContent, setShowContent] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ComingSoonProvider>
          <LoadingScreen onFinish={() => setShowContent(true)} />
          {showContent && <Outlet />}
        </ComingSoonProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
