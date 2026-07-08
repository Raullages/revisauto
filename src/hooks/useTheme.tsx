"use client";

import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(theme: Theme) {
  const isDark = theme === "dark";

  document.documentElement.classList.toggle("dark", isDark);

  const themeColor = isDark ? "#111827" : "#ffffff";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", themeColor);

  if (Capacitor.getPlatform() !== "ios") {
    return;
  }

  void StatusBar.setOverlaysWebView({ overlay: false });
  void StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
  void StatusBar.setBackgroundColor({ color: themeColor });
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) {
      setTheme(stored);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const nextTheme = prefersDark ? "dark" : "light";
      setTheme(nextTheme);
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);

    if (Capacitor.getPlatform() !== "ios") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      applyTheme(theme);
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [theme]);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
