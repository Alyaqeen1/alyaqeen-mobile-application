import React, { createContext, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/slices/themeSlice";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const theme = useSelector((state) => state.theme.mode);
  const dispatch = useDispatch();

  const value = {
    theme,
    isDark: theme === "dark",
    isLight: theme === "light",
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
