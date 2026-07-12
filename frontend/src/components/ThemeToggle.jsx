import React from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { useThemeStore } from "../store/themeStore";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 rounded-full border border-dark-border bg-theme-panel px-3 py-2 text-xs font-semibold text-theme-text transition-colors hover:bg-dark-hoverBg ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <SunMedium className="h-4 w-4 text-brand" />
      ) : (
        <MoonStar className="h-4 w-4 text-brand" />
      )}
      <span className="hidden sm:inline">
        {isDark ? "Light mode" : "Dark mode"}
      </span>
      <span className="sm:hidden">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
};

export default ThemeToggle;
