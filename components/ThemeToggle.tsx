"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore, type ReactNode } from "react";

const ORDER = ["system", "light", "dark"] as const;
type Mode = (typeof ORDER)[number];

const svg = (d: ReactNode) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);
const ICON: Record<Mode, ReactNode> = {
  system: svg(<><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>),
  light: svg(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>),
  dark: svg(<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />),
};

export default function ThemeToggle() {
  // false on the server and during hydration, true after: avoids a mismatch with the stored theme.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const { theme, setTheme } = useTheme();
  const mode: Mode = ORDER.includes(theme as Mode) ? (theme as Mode) : "system";
  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(next)}
      aria-label={mounted ? `Theme: ${mode}. Switch to ${next}.` : "Toggle theme"}
    >
      {mounted ? ICON[mode] : null}
    </button>
  );
}
