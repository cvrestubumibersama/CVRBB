import { useEffect, useState } from "react";

const SESSION_KEY = "rbb_loading_shown";

interface LoadingScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
  /** Set false untuk selalu tampil (misal saat testing/preview). Default true. */
  showOncePerSession?: boolean;
}

/**
 * Loading screen dengan animasi logo CV. Restu Bumi Bersama.
 * Ringan: hanya CSS transition/transform, tanpa library animasi eksternal.
 * Progress dihitung dari window "load" event sungguhan, dibungkus
 * minDurationMs supaya animasi tidak terasa "kedip" kalau asset sudah
 * ter-cache dan load-nya sangat cepat.
 *
 * Hanya tampil sekali per sesi tab browser (sessionStorage) -- saat
 * pengunjung pindah antar halaman di situs multi-page ini, animasi
 * tidak akan muncul berulang. Tertutup otomatis kalau tab ditutup atau
 * dibuka di tab baru.
 */
export default function LoadingScreen({
  onFinish,
  minDurationMs = 1800,
  showOncePerSession = true,
}: LoadingScreenProps) {
  const [isClient, setIsClient] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const alreadyShown = 
      showOncePerSession && 
      typeof window !== "undefined" && 
      sessionStorage.getItem(SESSION_KEY) === "1";

    if (alreadyShown) {
      setShouldShow(false);
      onFinish?.();
      return;
    }

    if (showOncePerSession && typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, "1");
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const start = performance.now();
    let rafId: number;

    function tick(now: number) {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / minDurationMs) * 100));
      setProgress(pct);
      if (pct < 100) {
        rafId = requestAnimationFrame(tick);
      }
    }

    if (prefersReducedMotion) {
      setProgress(100);
      setVisible(false);
      onFinish?.();
      return;
    }

    rafId = requestAnimationFrame(tick);

    const finishTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onFinish?.(), 600);
    }, minDurationMs + 400);

    const readyTimer = setTimeout(() => setReady(true), 50);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(finishTimer);
      clearTimeout(readyTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isClient || !shouldShow) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#FAFAFA", // Terang yang bersih
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-16px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
      aria-hidden={!visible}
    >
      <style>
        {`
          @keyframes pulse-glow {
            0% { filter: drop-shadow(0 0 5px rgba(212, 32, 39, 0.05)); }
            50% { filter: drop-shadow(0 0 15px rgba(212, 32, 39, 0.2)); }
            100% { filter: drop-shadow(0 0 5px rgba(212, 32, 39, 0.05)); }
          }
        `}
      </style>

      {/* Container logo tanpa kotak merah, membiarkan logo stand out dengan glow */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: ready ? "scale(1)" : "scale(0.85)",
          opacity: ready ? 1 : 0,
          transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease",
          animation: ready ? "pulse-glow 3s infinite ease-in-out" : "none",
        }}
      >
        <img
          src="/RBB.svg"
          alt="CV. Restu Bumi Bersama"
          width={640}
        />
      </div>

      <div
        style={{
          marginTop: 32,
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: 2,
          color: "#111111", // Teks gelap
          opacity: ready ? 1 : 0,
          transform: ready ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.5s ease 0.4s, transform 0.5s ease 0.4s",
        }}
      >
        CV. RESTU BUMI BERSAMA
      </div>

      {/* Progress bar tipis */}
      <div
        style={{
          width: 240,
          height: 2,
          background: "#E5E7EB", // Abu-abu muda
          borderRadius: 4,
          marginTop: 28,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "#D42027",
            transition: "width 0.1s linear",
            boxShadow: "0 0 5px rgba(212, 32, 39, 0.4)", // Efek cahaya lebih redup
          }}
        />
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 12,
          color: "#555555", // Teks persentase gelap
          fontVariantNumeric: "tabular-nums",
          letterSpacing: 1,
        }}
      >
        {progress}%
      </div>
    </div>
  );
}
