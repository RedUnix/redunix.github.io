import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Volume2, Sun, Moon, X, Minimize, Maximize, TrendingUp, Newspaper, Radio } from 'lucide-react';
import { MoonPhaseIcon } from './MoonPhaseIcon';
import { getMoonPhase } from '../utils/moonPhase';
import { useMinimized } from '../utils/useMinimized';

export const TerminalHeader = () => {
  const [theme, setTheme] = useState('dark');
  const [currentTime, setCurrentTime] = useState<Date | null>(null); // Start null to avoid hydration mismatch
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Minimized state for components
  const stockTicker = useMinimized('stock-ticker');
  const newsTicker = useMinimized('news-ticker');
  const radio = useMinimized('radio');

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Initial theme check
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Initial maximize state
    const savedMaximized = localStorage.getItem('terminal-maximized') === 'true';
    if (savedMaximized && window.innerWidth >= 768) {
      setIsMaximized(true);
      document.body.setAttribute('data-maximized', 'true');
    } else {
      document.body.setAttribute('data-maximized', 'false');
      localStorage.setItem('terminal-maximized', 'false');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const triggerAnimation = () => {
    document.body.setAttribute('data-maximize-anim', 'true');
    window.setTimeout(() => {
      document.body.removeAttribute('data-maximize-anim');
    }, 400);
  };

  const handleMaximize = () => {
    if (window.innerWidth < 768 || isMaximized) return;
    triggerAnimation();
    setIsMaximized(true);
    document.body.setAttribute('data-maximized', 'true');
    localStorage.setItem('terminal-maximized', 'true');
  };

  const handleMinimize = () => {
    if (!isMaximized) return;
    triggerAnimation();
    setIsMaximized(false);
    document.body.setAttribute('data-maximized', 'false');
    localStorage.setItem('terminal-maximized', 'false');
  };

  return (
    <header className="h-10 flex items-center justify-between px-4 select-none bg-surface flex-1">
      <div className="flex items-center gap-4">
         <div className="flex gap-2">
           <X size={14} className="opacity-50 hover:text-error cursor-pointer" />
            <Minimize
              size={14}
              className={`opacity-50 cursor-pointer transition-colors ${isMaximized ? 'hover:text-accent' : 'hover:text-error'}`}
              onClick={handleMinimize}
            />
            <Maximize
              size={14}
              className={`opacity-50 cursor-pointer transition-colors ${isMaximized ? 'hover:text-error' : 'hover:text-success'}`}
              onClick={handleMaximize}
            />
         </div>
         <span className="text-xs font-bold tracking-widest opacity-70">TERMINAL_SCOPE v2.0</span>
      </div>
      
      <div className="flex items-center gap-4 text-xs">
         <div 
            className="flex items-center gap-2 opacity-70 relative group cursor-default"
            title={getMoonPhase().phase}
         >
            <MoonPhaseIcon size={14} />
         </div>
         <div className="flex items-center gap-2 opacity-70">
            <Wifi size={14} />
            <span className="hidden sm:inline">CONNECTED</span>
         </div>
         <div className="flex items-center gap-2 opacity-70">
            <Battery size={14} />
            <span className="hidden sm:inline">98%</span>
         </div>
         <div className="flex items-center gap-2 opacity-70">
            <Volume2 size={14} />
            <span className="hidden sm:inline">65%</span>
         </div>
         <span className="opacity-50 hidden md:inline">|</span>
         
         {/* Component minimize/maximize icons */}
         <div className="flex items-center gap-2 opacity-70">
           <button
             onClick={stockTicker.toggleMinimized}
             className="p-1 rounded hover:bg-bg transition-colors"
             title={stockTicker.isMinimized ? 'Show Stock Ticker' : 'Minimize Stock Ticker'}
           >
             <TrendingUp size={14} className={stockTicker.isMinimized ? 'text-accent' : ''} />
           </button>
           <button
             onClick={newsTicker.toggleMinimized}
             className="p-1 rounded hover:bg-bg transition-colors"
             title={newsTicker.isMinimized ? 'Show News Ticker' : 'Minimize News Ticker'}
           >
             <Newspaper size={14} className={newsTicker.isMinimized ? 'text-accent' : ''} />
           </button>
           <button
             onClick={radio.toggleMinimized}
             className="p-1 rounded hover:bg-bg transition-colors"
             title={radio.isMinimized ? 'Show Radio' : 'Minimize Radio'}
           >
             <Radio size={14} className={radio.isMinimized ? 'text-accent' : ''} />
           </button>
         </div>
         
         <span className="opacity-50 hidden md:inline">|</span>
         <span className="font-mono opacity-80 min-w-[60px] text-right">
            {currentTime ? currentTime.toLocaleTimeString() : '--:--:--'}
         </span>
         
         <button 
            onClick={toggleTheme}
            className="ml-2 p-1 rounded hover:bg-bg transition-colors"
            title="Toggle Theme"
         >
           {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
         </button>
      </div>
    </header>
  );
};

