// Advertising consent belongs to Google's certified CMP, not a local yes/no flag.
export const GOOGLE_CONSENT_DEFAULT = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
  wait_for_update: 500,
} as const;

export const GOOGLE_CONSENT_BOOTSTRAP = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('consent','default',${JSON.stringify(GOOGLE_CONSENT_DEFAULT)});window.googlefc=window.googlefc||{};window.googlefc.callbackQueue=window.googlefc.callbackQueue||[];`;

type GoogleMessaging = {
  callbackQueue?: Array<() => void>;
  showRevocationMessage?: () => void;
};

export function requestGooglePrivacySettings(googlefc?: GoogleMessaging): boolean {
  if (typeof googlefc?.showRevocationMessage !== "function") return false;
  // Google owns displaying the message and writing TCF/Consent Mode signals.
  (googlefc.callbackQueue ??= []).push(googlefc.showRevocationMessage);
  return true;
}

export function openGooglePrivacySettings(): boolean {
  const w = window as Window & { googlefc?: GoogleMessaging };
  return requestGooglePrivacySettings(w.googlefc);
}