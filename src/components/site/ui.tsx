import { Link } from "@tanstack/react-router";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, end, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v).toString()),
    });
    return () => controls.stop();
  }, [inView, end, mv]);
  return <span ref={ref}>{display}{suffix}</span>;
}

type BtnProps = {
  children: ReactNode;
  to?: string;
  href?: string;
  download?: boolean | string;
  variant?: "primary" | "outline" | "ghost";
  size?: "md" | "lg";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
};

export function Button({ children, to, href, download, variant = "primary", size = "md", className = "", onClick, type }: BtnProps) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/50 relative overflow-hidden group";
  const sizes = { md: "h-10 px-5 text-sm", lg: "h-12 px-7 text-base" };
  const variants = {
    primary: "bg-[var(--primary)] text-white hover:bg-[#B01A20] shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_-6px_rgba(212,32,39,0.5)] hover:-translate-y-0.5",
    outline: "border border-foreground/20 text-foreground bg-transparent hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5",
    ghost: "text-foreground hover:bg-[var(--surface)]",
  };
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  const inner = <span className="relative z-10 flex items-center gap-2">{children}</span>;
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  if (href) return <a href={href} download={download} className={cls} target="_blank" rel="noopener noreferrer">{inner}</a>;
  return <button type={type} onClick={onClick} className={cls}>{inner}</button>;
}

export function BackHomeBar({ label }: { label: string }) {
  const { t } = useI18n();
  return (
    <div className="border-b border-border bg-[var(--surface)]/60">
      <div className="mx-auto max-w-7xl px-4 md:px-6 h-11 flex items-center gap-2 text-sm">
        <Link to="/" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-[var(--primary)] transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t("cta.back")}
        </Link>
        <span className="text-muted-foreground/50">/</span>
        <span className="text-[var(--primary)] font-medium">{label}</span>
      </div>
    </div>
  );
}

export function PageHero({ eyebrow, title, subtitle, image }: { eyebrow?: string; title: string; subtitle?: string; image?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[var(--surface)]">
      {image && (
        <div className="absolute inset-0">
          <img src={image} alt="" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)]/40 via-[var(--background)]/60 to-[var(--background)]" />
        </div>
      )}
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-20 md:py-28">
        <Reveal>
          {eyebrow && <div className="inline-block text-xs font-semibold uppercase tracking-widest text-[var(--primary)] mb-4">{eyebrow}</div>}
          <h1 className="font-display text-3xl md:text-5xl font-semibold max-w-3xl text-foreground">{title}</h1>
          {subtitle && <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl">{subtitle}</p>}
        </Reveal>
      </div>
    </section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-border rounded-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] hover:border-foreground/20 ${className}`}>
      {children}
    </div>
  );
}

export function AutoSlider({ images, alt }: { images: string[]; alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    // If we've reached the duplicated first image (at the end)
    if (currentIndex === images.length) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 1000); // 1000ms matches the transition duration
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, images]);

  if (!images || images.length === 0) {
    return <div className="h-full w-full bg-muted flex items-center justify-center text-slate-400">No Image</div>;
  }

  // Duplicate the first image to create a seamless loop
  const displayImages = images.length > 1 ? [...images, images[0]] : images;

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted">
      <div 
        className={`flex w-full h-full ${isTransitioning ? 'transition-transform duration-1000 ease-in-out' : ''}`}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {displayImages.map((img, i) => (
          <div key={i} className="w-full h-full shrink-0">
            <img
              src={img}
              alt={`${alt} ${i + 1}`}
              className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

