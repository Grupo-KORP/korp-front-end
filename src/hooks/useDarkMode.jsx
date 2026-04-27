import { createContext, useContext, useState } from "react";

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  function toggleDark() {
    const newDark = !darkMode;
    setDarkMode(newDark);
    document.body.classList.toggle("dark", newDark);
  }

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDark }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  return useContext(DarkModeContext);
}