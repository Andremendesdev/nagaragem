"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Phase = "visible" | "opening" | "done";

type LoadingContextValue = {
  canPlayHeroVideo: boolean;
  markHeroVideoReady: () => void;
};

const LoadingContext = createContext<LoadingContextValue>({
  canPlayHeroVideo: false,
  markHeroVideoReady: () => {},
});

export function usePageReady() {
  return useContext(LoadingContext);
}

const OPEN_MS = 1000;
const MIN_LOGO_MS = 700;
const MAX_WAIT_MS = 3200;
const VIDEO_WAIT_MS = 3200;

function waitForDomReady() {
  return new Promise<void>((resolve) => {
    if (document.readyState !== "loading") {
      resolve();
      return;
    }
    document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
  });
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function waitForHeroVideo(
  heroVideoReadyRef: React.MutableRefObject<(() => void) | null>,
  isHomePage: boolean
) {
  if (!isHomePage) return Promise.resolve();

  return Promise.race([
    new Promise<void>((resolve) => {
      heroVideoReadyRef.current = resolve;
    }),
    wait(VIDEO_WAIT_MS),
  ]);
}

export default function LoadingScreen({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("visible");
  const [canPlayHeroVideo, setCanPlayHeroVideo] = useState(false);
  const heroVideoReadyRef = useRef<(() => void) | null>(null);

  const markHeroVideoReady = useCallback(() => {
    heroVideoReadyRef.current?.();
    heroVideoReadyRef.current = null;
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setPhase("done");
      setCanPlayHeroVideo(true);
      return;
    }

    let cancelled = false;
    const isHomePage = window.location.pathname === "/";

    (async () => {
      await Promise.race([
        Promise.all([
          isHomePage
            ? waitForHeroVideo(heroVideoReadyRef, isHomePage)
            : waitForDomReady(),
          wait(MIN_LOGO_MS),
        ]),
        wait(MAX_WAIT_MS),
      ]);

      if (cancelled) return;

      setPhase("opening");
      setCanPlayHeroVideo(true);
      await wait(OPEN_MS);

      if (cancelled) return;

      setPhase("done");
    })();

    return () => {
      cancelled = true;
      heroVideoReadyRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (phase === "done") {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  return (
    <LoadingContext.Provider value={{ canPlayHeroVideo, markHeroVideoReady }}>
      {children}

      {phase !== "done" && (
        <div
          className={`loading-screen ${phase === "opening" ? "loading-screen--opening" : ""}`}
          aria-live="polite"
          aria-busy={phase !== "done"}
        >
          <div className="loading-curtain-top" aria-hidden="true" />
          <div className="loading-curtain-bottom" aria-hidden="true" />

          <div className="loading-screen-content px-6">
            <h1 className="font-serif text-4xl font-bold uppercase tracking-tight leading-tight text-white text-center sm:text-5xl md:text-6xl">
              <span className="loading-screen-line loading-screen-line--1 block whitespace-nowrap">
                NA GARAGE
              </span>
              <span className="loading-screen-line loading-screen-line--2 gold-glow mt-2 block whitespace-nowrap">
                BARBEARIA
              </span>
            </h1>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}
