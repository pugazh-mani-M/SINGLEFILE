import { useState, useEffect, createContext, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('system');
  const [isDark, setIsDark] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme from localStorage after mount
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('themeMode');
      if (saved) {
        setThemeMode(saved);
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return;
    
    const updateTheme = () => {
      let shouldBeDark = false;
      
      if (themeMode === 'dark') {
        shouldBeDark = true;
      } else if (themeMode === 'light') {
        shouldBeDark = false;
      } else { // system
        if (typeof window !== 'undefined' && window.matchMedia) {
          shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
      }
      
      setIsDark(shouldBeDark);
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
      }
    };

    updateTheme();
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('themeMode', themeMode);
    }

    // Listen for system theme changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (themeMode === 'system') {
          updateTheme();
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode, isInitialized]);

  const setTheme = (mode) => {
    setThemeMode(mode);
  };

  const toggleTheme = () => {
    if (themeMode === 'light') {
      setTheme('dark');
    } else if (themeMode === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, themeMode, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};