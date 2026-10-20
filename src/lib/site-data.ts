import type { Lang } from "./i18n";

export const COMPANY = {
  name: "CV. Restu Bumi Bersama",
  address: "Ngampel, Kabupaten Madiun, Jawa Timur, Indonesia",
  phone: "+62 857-4818-5726",
  whatsapp: "6285748185726",
  email: "info@restubumibersama.co.id",
};

type L = { id: string; en: string };
export const pick = (v: L, lang: Lang) => v[lang];

export const services: { slug: string; title: L; desc: L; icon: string }[] = [
  {
    slug: "konstruksi",
    icon: "🏗️",
    title: { id: "Konstruksi Bangunan", en: "Building Construction" },
    desc: {
      id: "Pelaksanaan konstruksi gedung komersial, industri, dan hunian dari fondasi hingga finishing.",
      en: "Execution of commercial, industrial, and residential buildings from foundation to finishing.",
    },
  },
  {
    slug: "renovasi",
    icon: "🎨",
    title: { id: "Renovasi & Interior", en: "Renovation & Interior" },
    desc: {
      id: "Renovasi bangunan lama dan pekerjaan interior kantor, ruko, dan hunian dengan hasil rapi.",
      en: "Renovation of existing buildings and interior work for offices, shops, and homes.",
    },
  },
  {
    slug: "sipil",
    icon: "🛠️",
    title: { id: "Pekerjaan Sipil", en: "Civil Works" },
    desc: {
      id: "Pekerjaan jalan, drainase, saluran, dan struktur sipil pendukung kawasan.",
      en: "Roads, drainage, channels, and supporting civil structures for developments.",
    },
  },
  {
    slug: "me",
    icon: "⚡",
    title: { id: "Mekanikal & Elektrikal", en: "Mechanical & Electrical" },
    desc: {
      id: "Instalasi listrik, plumbing, dan sistem mekanikal untuk gedung dan pabrik.",
      en: "Electrical, plumbing, and mechanical system installation for buildings and factories.",
    },
  },
];

export const workSteps: { title: L; desc: L }[] = [
  { title: { id: "Survei", en: "Survey" }, desc: { id: "Peninjauan lokasi dan kebutuhan awal.", en: "Site inspection and initial needs assessment." } },
  { title: { id: "RAB", en: "Cost Plan" }, desc: { id: "Penyusunan Rencana Anggaran Biaya detail.", en: "Detailed budget plan preparation." } },
  { title: { id: "Kontrak", en: "Contract" }, desc: { id: "Kesepakatan lingkup, harga, dan waktu.", en: "Agreement on scope, price, and timeline." } },
  { title: { id: "Pelaksanaan", en: "Execution" }, desc: { id: "Pekerjaan lapangan sesuai jadwal.", en: "On-site work according to schedule." } },
  { title: { id: "Quality Check", en: "Quality Check" }, desc: { id: "Pemeriksaan mutu bertahap.", en: "Staged quality inspection." } },
  { title: { id: "Garansi", en: "Warranty" }, desc: { id: "Serah terima dengan jaminan pekerjaan.", en: "Handover with workmanship warranty." } },
];

export const productCategories = [
  { slug: "besi-baja", label: { id: "Besi & Baja", en: "Steel & Iron" } },
  { slug: "semen-beton", label: { id: "Semen & Beton", en: "Cement & Concrete" } },
  { slug: "umum", label: { id: "Material Umum", en: "General Material" } },
] as const;

export const products: { name: string; category: string; spec: L; img: string }[] = [
  { name: "Besi Beton Ulir Ø10mm", category: "besi-baja", spec: { id: "SNI, panjang 12m, per batang", en: "SNI, 12m length, per piece" }, img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=70" },
  { name: "Besi Beton Polos Ø8mm", category: "besi-baja", spec: { id: "SNI, panjang 12m, per batang", en: "SNI, 12m length, per piece" }, img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=70" },
  { name: "Wiremesh M8", category: "besi-baja", spec: { id: "Ukuran 2,1 x 5,4m", en: "Size 2.1 x 5.4m" }, img: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&q=70" },
  { name: "Baja Ringan C75", category: "besi-baja", spec: { id: "Tebal 0,75mm, panjang 6m", en: "0.75mm thick, 6m length" }, img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=70" },
  { name: "Semen PCC 40kg", category: "semen-beton", spec: { id: "Portland Composite Cement", en: "Portland Composite Cement" }, img: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=70" },
  { name: "Semen Putih 40kg", category: "semen-beton", spec: { id: "Untuk finishing & dekoratif", en: "For finishing & decorative work" }, img: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=70" },
  { name: "Ready Mix K-225", category: "semen-beton", spec: { id: "Beton siap pakai per m³", en: "Ready-mix concrete per m³" }, img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=70" },
  { name: "Paving Block K-300", category: "semen-beton", spec: { id: "Tebal 8cm, tipe segi enam", en: "8cm thick, hexagon type" }, img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=70" },
  { name: "Pasir Cor", category: "umum", spec: { id: "Per rit truk (7m³)", en: "Per truck load (7m³)" }, img: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&q=70" },
  { name: "Batu Split 1/2", category: "umum", spec: { id: "Per rit truk (7m³)", en: "Per truck load (7m³)" }, img: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=600&q=70" },
  { name: "Bata Merah Press", category: "umum", spec: { id: "Ukuran 5x11x22cm", en: "Size 5x11x22cm" }, img: "https://images.unsplash.com/photo-1516455207990-7a41ce80f7ee?w=600&q=70" },
  { name: "Hebel / Bata Ringan", category: "umum", spec: { id: "Tebal 10cm, per m³", en: "10cm thick, per m³" }, img: "https://images.unsplash.com/photo-1503387837-b154d5074bd2?w=600&q=70" },
];

export const projects: { name: string; client: string; location: string; year: number; category: L; img: string }[] = [
  { name: "Ruko Griya Madiun", client: "PT. Karya Madani", location: "Madiun, Jawa Timur", year: 2024, category: { id: "Komersial", en: "Commercial" }, img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=70" },
  { name: "Gudang Logistik Ngampel", client: "PT. Trans Nusantara", location: "Madiun, Jawa Timur", year: 2023, category: { id: "Industri", en: "Industrial" }, img: "https://images.unsplash.com/photo-1565608087341-404b25492fee?w=1200&q=70" },
  { name: "Renovasi Kantor Cabang", client: "Bank Daerah", location: "Ponorogo, Jawa Timur", year: 2023, category: { id: "Renovasi", en: "Renovation" }, img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=70" },
  { name: "Supply Material Perumahan", client: "CV. Bumi Asri", location: "Ngawi, Jawa Timur", year: 2022, category: { id: "Supply", en: "Supply" }, img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=70" },
];

export const advantages: { icon: string; title: L; desc: L }[] = [
  { icon: "✓", title: { id: "Berpengalaman 5+ Tahun", en: "5+ Years Experienced" }, desc: { id: "Puluhan proyek diselesaikan tepat waktu.", en: "Dozens of projects delivered on time." } },
  { icon: "✓", title: { id: "Material Bersertifikat SNI", en: "SNI-Certified Materials" }, desc: { id: "Kami hanya menggunakan pemasok tepercaya.", en: "We only use trusted suppliers." } },
  { icon: "✓", title: { id: "Tim K3 Tersertifikasi", en: "Certified Safety Team" }, desc: { id: "Standar keselamatan kerja di setiap proyek.", en: "Occupational safety standards on every project." } },
  { icon: "✓", title: { id: "Harga Transparan", en: "Transparent Pricing" }, desc: { id: "RAB detail tanpa biaya tersembunyi.", en: "Detailed cost plan with no hidden fees." } },
];

export const org: { name: string; role: L }[] = [
  { name: "Purwandi", role: { id: "Direktur / Persero Aktif", en: "Director / Active Partner" } },
  { name: "Elga Nur Amilia", role: { id: "Persero Komanditer", en: "Silent Partner" } },
  { name: "Lorem Ipsum, S.T.", role: { id: "Manajer Proyek", en: "Project Manager" } },
  { name: "Lorem Ipsum, S.E.", role: { id: "Manajer Operasional", en: "Operations Manager" } },
];

export const legalDocs: { name: L; number: string }[] = [
  { name: { id: "NIB (Nomor Induk Berusaha)", en: "NIB (Business Number)" }, number: "1234567890123" },
  { name: { id: "NPWP Perusahaan", en: "Company Tax ID (NPWP)" }, number: "01.234.567.8-901.000" },
  { name: { id: "Akta Pendirian", en: "Deed of Establishment" }, number: "No. 42 / 2012" },
  { name: { id: "SBU (Sertifikat Badan Usaha)", en: "Business Entity Certificate (SBU)" }, number: "BG004 / SI003" },
  { name: { id: "Sertifikasi K3 Konstruksi", en: "Construction Safety Certification" }, number: "K3-Konstruksi / 2023" },
];

export const testimonials: { quote: L; name: string; role: string }[] = [
  { quote: { id: "Pekerjaan rapi, komunikatif, dan selesai tepat waktu. Kami puas dengan hasilnya.", en: "Neat work, communicative, and finished on time. We are very satisfied." }, name: "Bapak Hendra", role: "PT. Karya Madani" },
  { quote: { id: "Material selalu tersedia dan harga sangat kompetitif. Mitra supply andalan kami.", en: "Materials are always available at very competitive prices. Our trusted supply partner." }, name: "Ibu Maria", role: "CV. Bumi Asri" },
  { quote: { id: "Tim proyek profesional, laporan progres jelas setiap minggu.", en: "Professional project team with clear weekly progress reports." }, name: "Bapak Yusuf", role: "PT. Trans Nusantara" },
];

export const articles: {
  slug: string;
  title: L;
  category: L;
  date: string;
  excerpt: L;
  body: L;
  img: string;
}[] = [
  {
    slug: "tips-memilih-besi-beton",
    title: { id: "5 Tips Memilih Besi Beton Berkualitas untuk Proyek", en: "5 Tips for Choosing Quality Rebar for Your Project" },
    category: { id: "Tips Konstruksi", en: "Construction Tips" },
    date: "2025-09-12",
    excerpt: { id: "Panduan singkat memilih besi beton yang sesuai standar SNI.", en: "A short guide to choosing rebar that meets SNI standards." },
    body: {
      id: "Besi beton adalah komponen struktural utama pada bangunan. Pastikan Anda memeriksa label SNI, diameter aktual, kelurusan batang, kondisi permukaan, dan sumber pembelian. Menggunakan besi berkualitas mencegah risiko struktural jangka panjang dan mengoptimalkan biaya renovasi di kemudian hari.",
      en: "Rebar is the main structural component of a building. Always check the SNI label, actual diameter, straightness, surface condition, and purchase source. Using quality rebar prevents long-term structural risks and reduces future renovation costs.",
    },
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=70",
  },
  {
    slug: "update-proyek-ruko-griya",
    title: { id: "Update Proyek: Ruko Griya Madiun Memasuki Tahap Finishing", en: "Project Update: Ruko Griya Madiun Enters Finishing Stage" },
    category: { id: "Update Proyek", en: "Project Update" },
    date: "2025-08-28",
    excerpt: { id: "Progres pembangunan 8 unit ruko di Madiun telah mencapai 85%.", en: "Construction progress for 8 shophouse units in Madiun has reached 85%." },
    body: {
      id: "Proyek pembangunan 8 unit ruko di kawasan Griya Madiun kini memasuki tahap finishing. Pekerjaan struktur dan atap telah rampung, sedangkan pekerjaan interior dan fasad ditargetkan selesai bulan depan.",
      en: "The construction project of 8 shophouse units in Griya Madiun is entering the finishing stage. Structural and roofing works are complete, while interior and facade works are targeted for next month.",
    },
    img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=70",
  },
  {
    slug: "sertifikasi-k3-tim-lapangan",
    title: { id: "Tim Lapangan Kami Menyelesaikan Sertifikasi K3", en: "Our Field Team Completes Safety Certification" },
    category: { id: "Berita Perusahaan", en: "Company News" },
    date: "2025-07-15",
    excerpt: { id: "Seluruh mandor dan pengawas kami kini bersertifikat K3 Konstruksi.", en: "All our foremen and supervisors are now Construction Safety certified." },
    body: {
      id: "Sebagai bagian dari komitmen keselamatan kerja, seluruh mandor dan pengawas lapangan CV. Restu Bumi Bersama telah menyelesaikan sertifikasi K3 Konstruksi tingkat dasar. Program ini memastikan setiap proyek dijalankan dengan standar keamanan yang tinggi.",
      en: "As part of our safety commitment, all foremen and field supervisors at CV. Restu Bumi Bersama have completed basic Construction Safety certification, ensuring every project runs with high safety standards.",
    },
    img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=70",
  },
];

export const partners = ["PT. Karya Madani", "PT. Trans Nusantara", "Bank Daerah", "CV. Bumi Asri", "PT. Sinar Bangun", "PT. Adhi Konstruksi"];
