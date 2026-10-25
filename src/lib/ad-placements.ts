const AD_HOST = "https://bauval.org";

export type AdZone = { key: string; width: number; height: number };

export const AD_ZONES = {
  leaderboard: { key: "04eba6e0b9b24743b164ff6f94dd40ad", width: 728, height: 90 },
  mobile: { key: "1a6bda8743a4c00739fc4db44bc7d91d", width: 300, height: 250 },
  rectangle: { key: "1a6bda8743a4c00739fc4db44bc7d91d", width: 300, height: 250 },
} satisfies Record<string, AdZone>;

export const NATIVE_KEY = "8380411ac102e792dca8cfde795da227";
export const NATIVE_SRC = `${AD_HOST}/21/${NATIVE_KEY}`;
export const SOCIAL_BAR_SRC = `${AD_HOST}/14/443f141a0ff3ecf271527c4207eb3e20`;

export function bannerFor(viewportWidth: number): AdZone {
  if (viewportWidth < 768) return AD_ZONES.mobile;
  return AD_ZONES.leaderboard;
}

export function bannerDocument({ key, width, height }: AdZone) {
  return `<!doctype html><html><body style="margin:0"><script>atOptions={'key':'${key}','format':'iframe','width':${width},'height':${height},'params':{}};</script><script src="${AD_HOST}/22/${key}"></script></body></html>`;
}

// Reports creative readiness, not merely successful loading of the provider script.
export function adDocument(zone: AdZone | null) {
  const content = zone
    ? bannerDocument(zone).replace(/^.*?<body[^>]*>|<\/body><\/html>$/g, "")
    : `<script async="async" data-cfasync="false" src="${NATIVE_SRC}"></script><div id="container-${NATIVE_KEY}"></div>`;
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;overflow:hidden}#creative{display:flow-root;width:100%}</style></head><body><script>
  (() => {
    const loaded = new WeakSet();
    let scheduled = false;
    document.addEventListener('load', (event) => {
      if (event.target?.tagName === 'IFRAME') {
        try { if (!event.target.contentDocument?.body?.children.length) return; } catch {}
        loaded.add(event.target);
      }
      schedule();
    }, true);
    const report = () => {
      scheduled = false;
      const root = document.getElementById('creative');
      if (!root) return;
      const candidates = Array.from(root.querySelectorAll('iframe,img,video,object,embed,a'));
      let filled = false;
      for (const el of candidates) {
        const box = el.getBoundingClientRect();
        const visible = box.width > 20 && box.height > 20 && getComputedStyle(el).display !== 'none';
        if (!visible) continue;
        if (el.tagName === 'IFRAME') {
          try { if (el.contentDocument?.readyState === 'complete' && el.contentDocument.body?.children.length) loaded.add(el); } catch {}
          if (!el.dataset.adWatched) {
            el.dataset.adWatched = 'true';
            el.addEventListener('load', () => {
              try { if (!el.contentDocument?.body?.children.length) return; } catch {}
              loaded.add(el); report();
            });
          }
          if (loaded.has(el)) filled = true;
        } else if (el.tagName === 'IMG') {
          if (el.complete && el.naturalWidth > 20) filled = true;
          else el.addEventListener('load', report, { once: true });
        } else if (el.tagName === 'A') {
          if (el.textContent.trim() || el.querySelector('img')) filled = true;
        } else filled = true;
      }
      parent.postMessage({type:'bremen:ad-fill',filled,height:filled ? ${zone ? zone.height : "Math.ceil(root.getBoundingClientRect().height)"} : 0}, '*');
    };
    const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(report); } };
    addEventListener('DOMContentLoaded', () => {
      new MutationObserver(schedule).observe(document.getElementById('creative'), {childList:true,subtree:true,attributes:true});
      new ResizeObserver(schedule).observe(document.getElementById('creative'));
      schedule(); setTimeout(report, 12000);
    });
  })();
  </script><div id="creative">${content}</div></body></html>`;
}

export function inlineAdIndex(listLength: number) {
  return Math.min(listLength, 3) - 1;
}
