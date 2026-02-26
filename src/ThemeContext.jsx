import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('midnight');

  useEffect(() => {
    // Check if user has saved theme preference
    const savedTheme = localStorage.getItem('devArchitectTheme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document body
    document.body.className = '';
    if (theme !== 'midnight') {
      document.body.classList.add(`theme-${theme}`);
    }
    localStorage.setItem('devArchitectTheme', theme);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
