
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';

type Theme = 'light' | 'dark';

interface AppSettings {
    mainLogoUrl: string;
    headerLogoUrl: string;
    loginLogoUrl: string;
    sidebarLogoUrl: string; // New property for sidebar specific logo
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  logos: AppSettings;
  isCrisisMode: boolean;
  toggleCrisisMode: () => void;
}

const defaultLogos: AppSettings = {
    mainLogoUrl: 'https://c.top4top.io/p_35899m4de1.png',
    headerLogoUrl: 'https://i.ibb.co/7bQ07Pz/sgh-logo.png',
    loginLogoUrl: 'https://c.top4top.io/p_35899m4de1.png',
    sidebarLogoUrl: 'https://i.ibb.co/7bQ07Pz/sgh-logo.png', // Default fallback same as header
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme) return savedTheme;
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
    }
    return 'light';
  });
  
  const [logos, setLogos] = useState<AppSettings>(defaultLogos);
  const [isCrisisMode, setIsCrisisMode] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Crisis Mode Effect
  useEffect(() => {
      if (isCrisisMode) {
          document.documentElement.classList.add('crisis-mode');
      } else {
          document.documentElement.classList.remove('crisis-mode');
      }
  }, [isCrisisMode]);
  
  useEffect(() => {
    const fetchLogos = async () => {
        try {
            const { data, error } = await supabase.from('logos').select('name, image_url');
            if (error) {
                console.warn("Could not fetch logos from database, using default URLs.", error.message);
                return;
            }

            const fetchedLogos = { ...defaultLogos };
            if(data) {
                const mainLogo = data.find(l => l.name === 'main_logo');
                const headerLogo = data.find(l => l.name === 'header_logo');
                const loginLogo = data.find(l => l.name === 'health_holding');
                const sidebarLogo = data.find(l => l.name === 'sidebar_logo'); // Fetch specific sidebar logo

                if (mainLogo?.image_url) {
                    fetchedLogos.mainLogoUrl = mainLogo.image_url;
                }
                if (headerLogo?.image_url) {
                    fetchedLogos.headerLogoUrl = headerLogo.image_url;
                }
                if (loginLogo?.image_url) {
                    fetchedLogos.loginLogoUrl = loginLogo.image_url;
                } else if (mainLogo?.image_url) {
                    fetchedLogos.loginLogoUrl = mainLogo.image_url;
                }
                
                // Set sidebar logo if found in DB, otherwise it falls back to default
                if (sidebarLogo?.image_url) {
                    fetchedLogos.sidebarLogoUrl = sidebarLogo.image_url;
                } else if (headerLogo?.image_url) {
                     // Fallback to header logo if specific sidebar logo isn't set in DB
                    fetchedLogos.sidebarLogoUrl = headerLogo.image_url;
                }
            }
            setLogos(fetchedLogos);
        } catch (e) {
            console.error("Error fetching logos:", e);
        }
    };

    fetchLogos();
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleCrisisMode = () => {
      setIsCrisisMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, logos, isCrisisMode, toggleCrisisMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
