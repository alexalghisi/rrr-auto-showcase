import { useEffect, useState } from "react";

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

/**
 * Runs `callback` once the page has fully loaded and the main thread is idle, so
 * non-critical work (ads, 360° frame sheets) never competes with the first paint.
 * Returns a cancel function.
 */
export function whenIdleAfterLoad(callback: () => void, timeout = 2500): () => void {
  if (typeof window === "undefined") return () => {};
  const w = window as IdleWindow;
  let idle: number | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    callback();
  };
  const schedule = () => {
    if (w.requestIdleCallback) idle = w.requestIdleCallback(run, { timeout });
    else timer = setTimeout(run, 200);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    done = true;
    window.removeEventListener("load", schedule);
    if (idle !== undefined) w.cancelIdleCallback?.(idle);
    if (timer !== undefined) clearTimeout(timer);
  };
}

/** True once the page has loaded and the browser has had an idle moment. */
export function useAfterLoad(timeout?: number) {
  const [ready, setReady] = useState(false);
  useEffect(() => whenIdleAfterLoad(() => setReady(true), timeout), [timeout]);
  return ready;
}
