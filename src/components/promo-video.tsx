import { useEffect, useRef, useState } from "react";

export type PromoVideoConfig = {
  src: string;
  poster: string;
  name: string;
  description: string;
  duration: string;
  uploadDate: string;
  heading: string;
  eyebrow: string;
  vertical?: boolean;
};

export const promoVideoLd = (site: string, v: PromoVideoConfig) => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: v.name,
  description: v.description,
  thumbnailUrl: [`${site}${v.poster}`],
  contentUrl: `${site}${v.src}`,
  uploadDate: v.uploadDate,
  duration: v.duration,
  inLanguage: "ro-RO",
});

/**
 * Video de prezentare: când ajunge în ecran pornește cu sunet (unde browserul permite);
 * altfel pornește fără sunet, iar sunetul se activează la prima atingere/click pe pagină.
 */
export function PromoVideo({ video }: { video: PromoVideoConfig }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  // Nimic din video (nici poster, nici fișierul mp4) nu se descarcă până nu se apropie de ecran.
  const [near, setNear] = useState(false);
  const inView = useRef(false);
  // Vizitatorul a oprit sunetul cu butonul: nu i-l mai pornim noi.
  const userMuted = useRef(false);

  // Pornește CU SUNET; dacă browserul refuză (nicio interacțiune încă), pornește fără sunet.
  const startPlayback = () => {
    const v = ref.current;
    if (!v || !v.currentSrc && !v.src) return;
    if (userMuted.current) {
      v.muted = true;
      v.play().catch(() => {});
      return;
    }
    v.muted = false;
    v.play()
      .then(() => setMuted(false))
      .catch(() => {
        v.muted = true;
        setMuted(true);
        v.play().catch(() => {});
      });
  };

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const nearIo = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setNear(true);
          nearIo.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    const playIo = new IntersectionObserver(
      ([e]) => {
        inView.current = !!e?.isIntersecting;
        if (inView.current) startPlayback();
        else v.pause();
      },
      { threshold: 0.5 },
    );
    nearIo.observe(v);
    playIo.observe(v);
    return () => {
      nearIo.disconnect();
      playIo.disconnect();
    };
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!near || !v) return;
    // Sursa a fost tocmai atașată: dacă video-ul e deja vizibil, pornește-l.
    const r = v.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) startPlayback();
  }, [near]);

  // La prima atingere / click / tastă oriunde pe pagină, sunetul pornește singur.
  useEffect(() => {
    const events = ["pointerdown", "touchend", "keydown", "click"] as const;
    const unlock = (e: Event) => {
      const t = e.target as Element | null;
      // Click-urile pe video sau pe butonul de sunet sunt tratate de ele.
      if (t?.closest?.("[data-promo-video]")) return;
      const v = ref.current;
      if (!v || userMuted.current || !v.muted || v.paused) return;
      v.muted = false;
      setMuted(false);
      v.play()
        .then(() => events.forEach((n) => window.removeEventListener(n, unlock, true)))
        .catch(() => {
          v.muted = true;
          setMuted(true);
          v.play().catch(() => {});
        });
    };
    events.forEach((n) => window.addEventListener(n, unlock, true));
    return () => events.forEach((n) => window.removeEventListener(n, unlock, true));
  }, []);

  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    userMuted.current = v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => {});
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6" aria-labelledby="prezentare-video">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">{video.eyebrow}</p>
      <h2 id="prezentare-video" className="mt-2 text-3xl font-bold md:text-4xl">{video.heading}</h2>
      <div data-promo-video className={`relative mx-auto mt-6 overflow-hidden rounded-3xl bg-black shadow-xl ${video.vertical ? "max-w-sm" : ""}`}>
        <video
          ref={ref}
          src={near ? video.src : undefined}
          poster={near ? video.poster : undefined}
          width={video.vertical ? 1080 : 1920}
          height={video.vertical ? 1920 : 1080}
          playsInline
          loop
          preload={near ? "auto" : "none"}
          controls
          className={`w-full ${video.vertical ? "aspect-[9/16]" : "aspect-video"}`}
          aria-label={video.name}
        />
        <button
          type="button"
          onClick={toggleSound}
          className="absolute left-4 top-4 rounded-full bg-black/70 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-black/85"
        >
          {muted ? "🔊 Pornește sunetul" : "🔇 Oprește sunetul"}
        </button>
      </div>
    </section>
  );
}
