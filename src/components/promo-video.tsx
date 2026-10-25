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
 * Video de prezentare: pornește singur (fără sunet, cum cer browserele) când ajunge în ecran
 * și se oprește când iese; vizitatorul poate porni sunetul. Nu descarcă nimic până nu e aproape.
 */
export function PromoVideo({ video }: { video: PromoVideoConfig }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [near, setNear] = useState(false);

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
        if (e?.isIntersecting) v.play().catch(() => {});
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
    const r = v.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) v.play().catch(() => {});
  }, [near]);

  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => {});
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6" aria-labelledby="prezentare-video">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">{video.eyebrow}</p>
      <h2 id="prezentare-video" className="mt-2 text-3xl font-bold md:text-4xl">{video.heading}</h2>
      <div className={`relative mx-auto mt-6 overflow-hidden rounded-3xl bg-black shadow-xl ${video.vertical ? "max-w-sm" : ""}`}>
        <video
          ref={ref}
          src={near ? video.src : undefined}
          poster={near ? video.poster : undefined}
          width={video.vertical ? 720 : 1280}
          height={video.vertical ? 1280 : 720}
          muted
          playsInline
          loop
          preload={near ? "metadata" : "none"}
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
