/** Facebook merge prin Apify (plătit per rulare): cel mult o dată la FACEBOOK_EVERY_HOURS. OLX e gratuit și rulează la fiecare apel. */
export const FACEBOOK_EVERY_HOURS = 8;

export function facebookDue(lastRunAt: string | null, now = Date.now()): boolean {
  if (!lastRunAt) return true;
  return now - new Date(lastRunAt).getTime() >= (FACEBOOK_EVERY_HOURS - 0.25) * 3600_000;
}
