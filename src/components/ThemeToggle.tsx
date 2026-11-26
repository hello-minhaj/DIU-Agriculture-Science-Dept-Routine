import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggleDark: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  isDark,
  onToggleDark,
}) => {
  return (
    <button
      type="button"
      onClick={onToggleDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="h-12 w-12 shrink-0 rounded-xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] flex items-center justify-center hover:border-[#16A34A] transition"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-emerald-400" />
      ) : (
        <Moon className="w-5 h-5 text-[#15803D]" />
      )}
    </button>
  );
};
