"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark";

type SecurityThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
};

const SecurityThemeContext = createContext<SecurityThemeContextValue | null>(
  null,
);

export function SecurityThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("security-theme") as Theme | null;
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === "light" ? "dark" : "light";
      localStorage.setItem("security-theme", next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      isDark: theme === "dark",
    }),
    [theme, toggleTheme],
  );

  return (
    <SecurityThemeContext.Provider value={value}>
      {children}
    </SecurityThemeContext.Provider>
  );
}

export function useSecurityTheme() {
  const ctx = useContext(SecurityThemeContext);
  if (!ctx) {
    throw new Error("useSecurityTheme must be used within SecurityThemeProvider");
  }
  return ctx;
}
