import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage and system preference
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved === 'dark' || (!saved && prefersDark);
    
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="sm"
      className="fixed top-4 right-4 h-10 w-10 p-0 rounded-full shadow-lg bg-card hover:bg-accent z-50 transition-all duration-300 hover:scale-110 active:scale-95 animate-fade-in group"
    >
      {isDark ? (
        <Sun className="h-5 w-5 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
      ) : (
        <Moon className="h-5 w-5 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-110" />
      )}
    </Button>
  );
};

export default ThemeToggle;