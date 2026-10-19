const AD_HOST = "https://bauval.org";

export type AdZone = { key: string; width: number; height: number };

export const AD_ZONES = {
  leaderboard: { key: "04eba6e0b9b24743b164ff6f94dd40ad", width: 728, height: 90 },
  tablet: { key: "3776d887b9ce883837d095b2300d96fc", width: 468, height: 60 },
  mobile: { key: "c35999d84d7047d5ca021b0fc5ec417b", width: 320, height: 50 },
  rectangle: { key: "1a6bda8743a4c00739fc4db44bc7d91d", width: 300, height: 250 },
  skyscraper: { key: "5bd3ee4e1b7353c1246749e7fb5f2a9a", width: 160, height: 600 },
} satisfies Record<string, AdZone>;

export const NATIVE_KEY = "8380411ac102e792dca8cfde795da227";
export const NATIVE_SRC = `${AD_HOST}/21/${NATIVE_KEY}`;
export const SOCIAL_BAR_SRC = `${AD_HOST}/14/443f141a0ff3ecf271527c4207eb3e20`;

const SIDE_RAILS_MIN_WIDTH = 1600;

export function bannerFor(viewportWidth: number): AdZone {
  if (viewportWidth < 768) return AD_ZONES.mobile;
  if (viewportWidth < 1024) return AD_ZONES.tablet;
  return AD_ZONES.leaderboard;
}

export function showsSideRails(viewportWidth: number) {
  return viewportWidth >= SIDE_RAILS_MIN_WIDTH;
}

export function bannerDocument({ key, width, height }: AdZone) {
  return `<!doctype html><html><body style="margin:0"><script>atOptions={'key':'${key}','format':'iframe','width':${width},'height':${height},'params':{}};</script><script src="${AD_HOST}/22/${key}"></script></body></html>`;
}

export function inlineAdIndex(listLength: number) {
  return Math.min(listLength, 3) - 1;
}
