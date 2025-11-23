import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { ThemeMode } from '../types';

interface ThemeToggleProps {
  mode: ThemeMode;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ mode, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors text-gray-700 dark:text-gray-200"
      aria-label="Toggle Theme"
    >
      {mode === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
};