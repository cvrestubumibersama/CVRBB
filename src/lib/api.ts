import { useQuery } from "@tanstack/react-query";
import type { Lang } from "./i18n";

export function getApiBase(): string {
  // 1. Explicit environment variable override (if configured in .env / build)
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (typeof envUrl === "string" && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }

  // 2. Client-side browser execution:
  if (typeof window !== "undefined") {
    // Return empty string so all API requests are relative to current origin (e.g. /api/public/...).
    // On production/cPanel, browser requests https://domain.com/api/public/...
    // On local dev (http://localhost:3000), Vite server proxy forwards /api to port 4000.
    // Visitor browsers will NEVER attempt to connect to localhost:4000 on their local device!
    return "";
  }

  // 3. Server-side rendering (SSR in Node environment):
  // Node fetch requires an absolute URL with protocol and host.
  const backendPort = typeof process !== "undefined" && process.env?.PORT ? 4000 : 4000;
  return (
    (typeof process !== "undefined" && process.env?.INTERNAL_API_URL) ||
    `http://127.0.0.1:${backendPort}`
  );
}

export function getPublicApiUrl(path: string = ""): string {
  const base = getApiBase();
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `${base}/api/public${cleanPath}`;
}

export const API_BASE = getApiBase();
export const PUBLIC_API = getPublicApiUrl();

async function fetcher<T>(path: string): Promise<T> {
  const url = getPublicApiUrl(path);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path} - ${response.status}`);
  }
  return response.json();
}

type L = { id: string; en: string };

export interface SiteSettings {
  company_name: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  maps_embed_url?: string;
  operating_hours?: string;
  footer_tagline?: string;
  footer_rights?: string;
}

export interface SiteTexts { [key: string]: L };

export interface Service {
  id: number;
  slug: string;
  icon?: string;
  title: L;
  desc: L;
  image_url?: string;
  image_urls?: string[];
}

export interface WorkStep {
  id: number;
  service_id: number;
  title: L;
  desc: L;
}

export interface ProductCategory {
  id: number;
  slug: string;
  label: L;
  price?: string;
}

export interface Product {
  id: number;
  category: string;
  name: string;
  spec: L;
  image_url?: string;
  price?: string;
}

export interface Project {
  id: number;
  name: string;
  client?: string;
  location?: string;
  year?: number;
  category: L;
  image_url?: string;
}

export interface LegalDoc {
  id: number;
  name: L;
  document_number: string;
}

export interface Partner {
  id: number;
  name: string;
  image_url?: string;
}

export interface Testimonial {
  id: number;
  quote?: L;
  quote_id?: string;
  quote_en?: string;
  name?: string;
  author_name?: string;
  role?: string;
  author_role?: string;
}

export interface Advantage {
  id: number;
  icon?: string;
  title: L;
  desc: L;
}

export interface OrganizationMember {
  id: number;
  name: string;
  role: L;
  image_url?: string;
}

export interface Article {
  id: number;
  slug: string;
  title: L;
  category: L;
  date?: string;
  excerpt: L;
  body: L;
  img?: string;
}

export function useSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["settings"],
    queryFn: () => fetcher(`/settings`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSiteTexts() {
  return useQuery<SiteTexts>({
    queryKey: ["siteTexts"],
    queryFn: () => fetcher(`/site-texts`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useServices() {
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: () => fetcher(`/services`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useWorkSteps() {
  return useQuery<WorkStep[]>({
    queryKey: ["workSteps"],
    queryFn: () => fetcher(`/work-steps`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductCategories() {
  return useQuery<ProductCategory[]>({
    queryKey: ["productCategories"],
    queryFn: () => fetcher(`/product-categories`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => fetcher(`/products`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useProjectCategories() {
  return useQuery<ProductCategory[]>({
    queryKey: ["projectCategories"],
    queryFn: () => fetcher(`/project-categories`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => fetcher(`/projects`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useLegalDocs() {
  return useQuery<LegalDoc[]>({
    queryKey: ["legalDocs"],
    queryFn: () => fetcher(`/legal-docs`),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePartners() {
  return useQuery<Partner[]>({
    queryKey: ["partners"],
    queryFn: () => fetcher(`/partners`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTestimonials() {
  return useQuery<Testimonial[]>({
    queryKey: ["testimonials"],
    queryFn: () => fetcher(`/testimonials`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdvantages() {
  return useQuery<Advantage[]>({
    queryKey: ["advantages"],
    queryFn: () => fetcher(`/advantages`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useOrganizationMembers() {
  return useQuery<OrganizationMember[]>({
    queryKey: ["organizationMembers"],
    queryFn: () => fetcher(`/organization-members`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useArticles() {
  return useQuery<Article[]>({
    queryKey: ["articles"],
    queryFn: () => fetcher(`/articles`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useArticle(slug: string) {
  return useQuery<Article | null>({
    queryKey: ["articles", slug],
    queryFn: () => fetcher(`/articles/${slug}`),
    staleTime: 1000 * 60 * 5,
  });
}

export function pick(v: L, lang: Lang) {
  return v[lang] ?? v.id;
}
