/** Poze reale din stoc, decupate din rotirile existente. Nu sunt ilustrații generate. */
export type BlogFigure = { src: string; alt: string; caption: string };

export const BLOG_FIGURES: BlogFigure[] = [
  {
    src: "/blog/audi-a7.jpg",
    alt: "Audi A7 Competition argintiu, văzut din față-stânga",
    caption: "Audi A7 Competition din stocul Bremen Auto, DN1 Florești.",
  },
  {
    src: "/blog/audi-a6.jpg",
    alt: "Audi A6 negru, văzut din față-stânga",
    caption: "Audi A6 second hand adus din Germania, fotografiat în parc.",
  },
  {
    src: "/blog/bmw-x1.jpg",
    alt: "BMW X1 gri, văzut din față",
    caption: "BMW X1 din stoc, una dintre mașinile pe care le vezi la vizionare.",
  },
  {
    src: "/blog/bmw-x6.jpg",
    alt: "BMW X6 negru, văzut din față-stânga",
    caption: "BMW X6 second hand, din lotul verificat pe DN1.",
  },
  {
    src: "/blog/vw-touareg.jpg",
    alt: "Volkswagen Touareg alb, văzut din față",
    caption: "Volkswagen Touareg din stocul Bremen Auto.",
  },
  {
    src: "/blog/dacia-sandero.jpg",
    alt: "Dacia Sandero Stepway gri, văzută din față-stânga",
    caption: "Dacia Sandero Stepway, mașină de oraș din parcul de la Florești.",
  },
  {
    src: "/blog/suzuki-vitara.jpg",
    alt: "Suzuki Vitara alb, văzut din față-stânga",
    caption: "Suzuki Vitara second hand, fotografiată înainte de publicarea anunțului.",
  },
];

export const BLOG_VIDEO = {
  src: "/video/bremen-auto-prezentare.mp4",
  poster: "/video/bremen-auto-prezentare.webp",
  name: "Bremen Auto — mașini second hand pe DN1, Florești",
  caption: "Parcul de pe DN1, în Luna de Sus, în 40 de secunde.",
};

function slot(slug: string) {
  let hash = 0;
  for (const char of slug) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return hash % BLOG_FIGURES.length;
}

const PREFERRED: Array<[RegExp, number]> = [
  [/a7/, 0],
  [/x6/, 3],
  [/x1/, 2],
  [/touareg/, 4],
  [/dacia|sandero/, 5],
  [/suzuki|vitara/, 6],
  [/audi|a6/, 1],
  [/bmw/, 2],
  [/volkswagen|\bvw\b/, 4],
];

/** Copertă + două poze diferite, alese după subiectul articolului. */
export function mediaForPost(slug: string) {
  const preferred = PREFERRED.find(([pattern]) => pattern.test(slug));
  const coverAt = preferred ? preferred[1] : slot(slug);
  const count = BLOG_FIGURES.length;
  const pick = (offset: number) => BLOG_FIGURES[(coverAt + offset) % count]!;
  return {
    cover: pick(0),
    inline: [pick(2), pick(4)],
    video: BLOG_VIDEO,
  };
}
