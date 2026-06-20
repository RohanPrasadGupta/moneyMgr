"use client";
import React, { createContext, useContext, useState } from "react";
export const ThemeContext = createContext({ mode: "dark", toggleTheme: () => {} });
export const useThemeMode = () => useContext(ThemeContext);
export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState("dark");
  const toggleTheme = () => setMode(m => m === "dark" ? "light" : "dark");
  return <ThemeContext.Provider value={{ mode, toggleTheme }}>{children}</ThemeContext.Provider>;
}
