import { useCallback, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark9" | "system";

const useTheme = (): [Theme, (mode: Theme) => void] => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    return savedTheme || "system";
  });

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark9)",
    );
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        updateDocumentTheme(e.matches ? "dark9" : "light");
      }
    };

    const updateDocumentTheme = (newTheme: "light" | "dark9") => {
      document.documentElement.classList.toggle("dark9", newTheme === "dark9");
    };

    // Set initial theme based on current mode
    if (theme === "system") {
      updateDocumentTheme(darkModeMediaQuery.matches ? "dark9" : "light");
    } else {
      updateDocumentTheme(theme);
    }

    darkModeMediaQuery.addEventListener("change", handleDarkModeChange);

    return () => {
      darkModeMediaQuery.removeEventListener("change", handleDarkModeChange);
    };
  }, [theme]);

  const setThemeWithSideEffect = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme !== "system") {
      document.documentElement.classList.toggle("dark9", newTheme === "dark9");
    }
  }, []);
  return useMemo(
    () => [theme, setThemeWithSideEffect],
    [theme, setThemeWithSideEffect],
  );
};

export default useTheme;
