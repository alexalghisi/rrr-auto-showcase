/**
 * Google AdSense runs only on the production domain. Lovable previews (*.lovable.app,
 * *.lovableproject.com), GitHub Pages, localhost and any other copy of the site never
 * load the ad script, so preview/bot/dev hits are not counted as invalid traffic.
 */
export const AD_PRODUCTION_DOMAINS = ["bremenauto.ro"] as const;

export function isAdProductionHost(hostname?: string): boolean {
  const host = (
    hostname ?? (typeof window === "undefined" ? "" : window.location.hostname)
  ).toLowerCase();
  return AD_PRODUCTION_DOMAINS.some((d) => host === d || host === `www.${d}`);
}
