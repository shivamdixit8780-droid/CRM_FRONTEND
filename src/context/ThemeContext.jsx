import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // 1. LocalStorage se saved theme lo
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;

    // 2. Agar saved nahi hai toh system preference check karo
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    // 3. Default light
    return "light";
  });

  useEffect(() => {
    // Body pe attribute set karo
    document.body.setAttribute("data-theme", theme);

    // HTML tag pe bhi set karo (extra safety)
    document.documentElement.setAttribute("data-theme", theme);

    // LocalStorage mein save karo
    localStorage.setItem("theme", theme);

    // Body ki class bhi update karo
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setLightMode = () => setTheme("light");
  const setDarkMode = () => setTheme("dark");

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setLightMode,
        setDarkMode,
        isDark: theme === "dark",
        isLight: theme === "light",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}