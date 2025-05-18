import { useTheme } from "./theme-provider";
import { useEffect, useState } from "react";

export function ThemeDebugger() {
  const { theme, setTheme } = useTheme();
  const [appliedTheme, setAppliedTheme] = useState<string | undefined>(undefined);
  const [hasClasses, setHasClasses] = useState<{light: boolean, dark: boolean}>({light: false, dark: false});
  
  useEffect(() => {
    // Check what theme is actually applied
    const root = document.documentElement;
    const hasLightClass = root.classList.contains('light');
    const hasDarkClass = root.classList.contains('dark');
    setHasClasses({light: hasLightClass, dark: hasDarkClass});
    
    // Get the stored theme
    setAppliedTheme(window.__THEME_APPLIED);
    
    // Set up an interval to check for changes
    const interval = setInterval(() => {
      const hasLightClass = root.classList.contains('light');
      const hasDarkClass = root.classList.contains('dark');
      setHasClasses({light: hasLightClass, dark: hasDarkClass});
      setAppliedTheme(window.__THEME_APPLIED);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [theme]);
  
  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-sm">
      <h3 className="font-bold mb-2">Theme Debugger</h3>
      <div className="space-y-1">
        <p>Selected theme: <span className="font-mono">{theme}</span></p>
        <p>Applied theme: <span className="font-mono">{appliedTheme || 'unknown'}</span></p>
        <p>Has light class: <span className="font-mono">{hasClasses.light ? 'yes' : 'no'}</span></p>
        <p>Has dark class: <span className="font-mono">{hasClasses.dark ? 'yes' : 'no'}</span></p>
      </div>
      <div className="mt-3 space-x-2">
        <button 
          onClick={() => setTheme('light')}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
        >
          Set Light
        </button>
        <button 
          onClick={() => setTheme('dark')}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
        >
          Set Dark
        </button>
        <button 
          onClick={() => setTheme('system')}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
        >
          Set System
        </button>
      </div>
    </div>
  );
}
