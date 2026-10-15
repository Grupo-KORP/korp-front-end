import { createContext, useCallback, useContext, useState } from "react";

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  const resetDarkMode = useCallback(() => {
    setDarkMode(false);
    document.body.classList.remove("dark");
  }, []);

  function toggleDark() {
    const newDark = !darkMode;
    setDarkMode(newDark);
    document.body.classList.toggle("dark", newDark);
  }

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDark, resetDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  return useContext(DarkModeContext);
}
