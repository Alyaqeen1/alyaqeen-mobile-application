import React, { createContext, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/slices/themeSlice";
import { getThemePalette } from "../theme";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const themeMode = useSelector((state) => state.theme.mode);
  const dispatch = useDispatch();
  const palette = getThemePalette(themeMode);

  const value = {
    theme: themeMode,
    colors: palette,
    gradientColors: palette.gradient,
    gradientLocations: palette.gradientLocations,
    glowColors: palette.glow,
    glowStyle: palette.glowStyle,
    blurTint: palette.blurTint,
    blurIntensity: palette.blurIntensity,
    isDark: themeMode === "dark",
    isLight: themeMode === "light",
    toggleTheme: () => dispatch(toggleTheme()),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
