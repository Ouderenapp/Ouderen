import { createContext, ReactNode, useContext, useState, useEffect } from "react";

type Theme = {
  isAccessibilityMode: boolean;
};

type ThemeContextType = {
  theme: Theme;
  toggleAccessibilityMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get the saved preference from localStorage
    const saved = localStorage.getItem("accessibility-mode");
    return {
      isAccessibilityMode: saved === "true",
    };
  });

  useEffect(() => {
    // Save preference to localStorage when it changes
    localStorage.setItem("accessibility-mode", theme.isAccessibilityMode.toString());

    // Update CSS custom properties for accessibility
    if (theme.isAccessibilityMode) {
      document.documentElement.style.setProperty("--font-size-multiplier", "1.25");
      document.documentElement.style.setProperty("--contrast-multiplier", "1.3");
      document.documentElement.setAttribute("data-accessibility-mode", "true");
    } else {
      document.documentElement.style.setProperty("--font-size-multiplier", "1");
      document.documentElement.style.setProperty("--contrast-multiplier", "1");
      document.documentElement.removeAttribute("data-accessibility-mode");
    }
  }, [theme.isAccessibilityMode]);

  const toggleAccessibilityMode = () => {
    setTheme(prev => ({
      ...prev,
      isAccessibilityMode: !prev.isAccessibilityMode,
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleAccessibilityMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme moet binnen een ThemeProvider gebruikt worden");
  }
  return context;
}