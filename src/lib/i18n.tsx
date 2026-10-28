import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "id" | "en";

type Dict = Record<string, { id: string; en: string }>;

export const dict: Dict = {
  "nav.about": { id: "Tentang Kami", en: "About Us" },
  "nav.services": { id: "Layanan", en: "Services" },
  "nav.products": { id: "Produk", en: "Products" },
  "nav.projects": { id: "Proyek & Legalitas", en: "Projects & Legal" },
  "nav.contact": { id: "Klien & Kontak", en: "Clients & Contact" },
  "nav.articles": { id: "Artikel & Berita", en: "Articles & News" },
  "cta.quote": { id: "Minta Penawaran", en: "Request a Quote" },
  "cta.viewProjects": { id: "Lihat Proyek", en: "View Projects" },
  "cta.back": { id: "Kembali ke Beranda", en: "Back to Home" },
  "cta.downloadCatalog": { id: "Unduh Katalog PDF", en: "Download Catalog PDF" },
  "cta.downloadProfile": { id: "Unduh Company Profile", en: "Download Company Profile" },
  "cta.submit": { id: "Kirim Permintaan", en: "Send Request" },

  "hero.headline": {
    id: "Membangun proyek Anda dengan presisi menggunakan material terpercaya",
    en: "Building your projects with precision with trusted materials",
  },
  "hero.sub": {
    id: "Kontraktor & supplier bahan bangunan berpengalaman sejak 2021, melayani proyek korporat dan tender di wilayah Jawa Timur.",
    en: "Experienced contractor & building material supplier since 2021, serving corporate and tender projects across East Java.",
  },

  "stats.projects": { id: "Proyek selesai", en: "Projects completed" },
  "stats.years": { id: "Tahun pengalaman", en: "Years of experience" },
  "stats.clients": { id: "Klien tetap", en: "Recurring clients" },

  "section.services": { id: "Layanan Unggulan", en: "Featured Services" },
  "section.servicesSub": {
    id: "Solusi konstruksi terintegrasi dari perencanaan hingga serah terima.",
    en: "Integrated construction solutions from planning to handover.",
  },
  "section.highlightProjects": { id: "Proyek Terpilih", en: "Selected Projects" },
  "section.partners": { id: "Klien & Mitra", en: "Clients & Partners" },

  "about.title": { id: "Tentang CV. Restu Bumi Bersama", en: "About CV. Restu Bumi Bersama" },
  "about.history": {
    id: "Berdiri sejak 2021 di Ngampel, Kabupaten Madiun, CV. Restu Bumi Bersama tumbuh menjadi mitra tepercaya untuk pekerjaan konstruksi dan pengadaan material bangunan wilayah di Jawa Timur.",
    en: "Founded in 2021 in Ngampel, Madiun Regency, CV. Restu Bumi Bersama has grown into a trusted partner for construction work and building material procurement across East Java.",
  },
  "about.history2": {
    id: "Dengan tim inti berpengalaman dan jaringan pemasok yang solid, kami menyelesaikan puluhan proyek, mulai dari renovasi komersial, bangunan sipil, hingga supply material untuk kontraktor lain.",
    en: "With an experienced core team and a solid supplier network, we have delivered hundreds of projects, from commercial renovations and civil works to material supply for other contractors.",
  },
  "about.history3": {
    id: "Kami percaya bahwa kualitas material dan disiplin pelaksanaan adalah fondasi setiap proyek yang berhasil.",
    en: "We believe that material quality and disciplined execution are the foundation of every successful project.",
  },
  "about.visionTitle": { id: "Visi", en: "Vision" },
  "about.vision": {
    id: "Menjadi kontraktor dan supplier material bangunan paling tepercaya di Jawa Timur dengan standar mutu nasional.",
    en: "To become the most trusted contractor and building material supplier in East Java with national quality standards.",
  },
  "about.missionTitle": { id: "Misi", en: "Mission" },
  "about.mission": {
    id: "Memberikan hasil kerja presisi, material berkualitas, harga kompetitif, dan pelayanan profesional bagi setiap klien.",
    en: "To deliver precise workmanship, quality materials, competitive pricing, and professional service to every client.",
  },
  "about.orgTitle": { id: "Struktur Organisasi", en: "Organizational Structure" },
  "about.advTitle": { id: "Keunggulan Kami", en: "Our Strengths" },

  "services.title": { id: "Layanan Kami", en: "Our Services" },
  "services.stepsTitle": { id: "Tahapan Kerja", en: "Work Process" },

  "products.title": { id: "Katalog Produk", en: "Product Catalog" },
  "products.search": { id: "Cari produk...", en: "Search products..." },
  "products.all": { id: "Semua", en: "All" },

  "projects.title": { id: "Proyek & Legalitas", en: "Projects & Legal" },
  "projects.legalTitle": { id: "Legalitas Perusahaan", en: "Company Legal Documents" },

  "contact.title": { id: "Klien & Kontak", en: "Clients & Contact" },
  "contact.testimonyTitle": { id: "Apa Kata Klien", en: "Client Testimonials" },
  "contact.formTitle": { id: "Formulir Permintaan Penawaran", en: "Request a Quote" },
  "contact.name": { id: "Nama Lengkap", en: "Full Name" },
  "contact.company": { id: "Nama Perusahaan (opsional)", en: "Company Name (optional)" },
  "contact.phone": { id: "Nomor Telepon / WhatsApp", en: "Phone / WhatsApp" },
  "contact.type": { id: "Jenis Proyek", en: "Project Type" },
  "contact.location": { id: "Lokasi Proyek", en: "Project Location" },
  "contact.desc": { id: "Deskripsi Kebutuhan", en: "Requirement Description" },
  "contact.info": { id: "Informasi Kontak", en: "Contact Information" },
  "contact.hours": { id: "Jam Operasional", en: "Operating Hours" },
  "contact.hoursValue": { id: "Senin – Sabtu, 08.00 – 17.00 WIB", en: "Mon – Sat, 08:00 – 17:00 WIB" },

  "articles.title": { id: "Artikel & Berita", en: "Articles & News" },
  "articles.related": { id: "Artikel Terkait", en: "Related Articles" },

  "footer.rights": { id: "Seluruh hak cipta dilindungi.", en: "All rights reserved." },
  "footer.tagline": {
    id: "Kontraktor & supplier bahan bangunan tepercaya sejak 2012.",
    en: "Trusted contractor & building material supplier since 2012.",
  },
};

export function t(key: keyof typeof dict | string, lang: Lang): string {
  const entry = dict[key];
  if (!entry) return key;
  return entry[lang];
}

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string }>({
  lang: "id",
  setLang: () => {},
  t: (k) => k,
});

function getInitialLang(): Lang {
  // English mode is intentionally kept in codebase for future work,
  // but it is hidden from the live public interface for now.
  return "id";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");
  useEffect(() => {
    try {
      localStorage.setItem("lang", "id");
    } catch {}
  }, []);
  const setLang = (l: Lang) => {
    if (l === "en") return;
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch {}
  };
  return (
    <Ctx.Provider value={{ lang, setLang, t: (k) => t(k, lang) }}>{children}</Ctx.Provider>
  );
}

export function useI18n() {
  return useContext(Ctx);
}
