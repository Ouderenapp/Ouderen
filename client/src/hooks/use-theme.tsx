import { createContext, ReactNode, useContext, useState, useEffect } from "react";

type Theme = {
  isAccessibilityMode: boolean;
  accessibilityLevel: number; // 1 = small, 2 = medium, 3 = large
};

type ThemeContextType = {
  theme: Theme;
  toggleAccessibilityMode: () => void;
  setAccessibilityLevel: (level: number) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get the saved preference from localStorage
    const savedMode = localStorage.getItem("accessibility-mode");
    const savedLevel = localStorage.getItem("accessibility-level");
    return {
      isAccessibilityMode: savedMode === "true",
      accessibilityLevel: savedLevel ? parseInt(savedLevel) : 1,
    };
  });

  useEffect(() => {
    // Save preference to localStorage when it changes
    localStorage.setItem("accessibility-mode", theme.isAccessibilityMode.toString());
    localStorage.setItem("accessibility-level", theme.accessibilityLevel.toString());

    // Update CSS custom properties for accessibility
    if (theme.isAccessibilityMode) {
      // Apply different levels of accessibility based on user preference
      if (theme.accessibilityLevel === 1) {
        document.documentElement.style.setProperty("--font-size-multiplier", "1.25");
        document.documentElement.style.setProperty("--contrast-multiplier", "1.3");
      } else if (theme.accessibilityLevel === 2) {
        document.documentElement.style.setProperty("--font-size-multiplier", "1.5");
        document.documentElement.style.setProperty("--contrast-multiplier", "1.6");
      } else if (theme.accessibilityLevel === 3) {
        document.documentElement.style.setProperty("--font-size-multiplier", "1.75");
        document.documentElement.style.setProperty("--contrast-multiplier", "1.9");
      }
      document.documentElement.setAttribute("data-accessibility-mode", "true");
      document.documentElement.setAttribute("data-accessibility-level", theme.accessibilityLevel.toString());
    } else {
      document.documentElement.style.setProperty("--font-size-multiplier", "1");
      document.documentElement.style.setProperty("--contrast-multiplier", "1");
      document.documentElement.removeAttribute("data-accessibility-mode");
      document.documentElement.removeAttribute("data-accessibility-level");
    }
  }, [theme.isAccessibilityMode, theme.accessibilityLevel]);

  const toggleAccessibilityMode = () => {
    setTheme(prev => ({
      ...prev,
      isAccessibilityMode: !prev.isAccessibilityMode,
    }));
  };
  
  const setAccessibilityLevel = (level: number) => {
    setTheme(prev => ({
      ...prev,
      accessibilityLevel: level,
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleAccessibilityMode, setAccessibilityLevel }}>
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