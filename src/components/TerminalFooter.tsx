import React from 'react';
import { StockTicker } from './StockTicker';
import { useMinimized } from '../utils/useMinimized';

export const TerminalFooter = () => {
  const { isMinimized } = useMinimized('stock-ticker');
  
  return (
    <footer className="border-t bg-surface border-bg">
      <div className="h-8 flex items-center justify-between px-4 text-xs font-mono opacity-60">
         <div className="flex gap-4">
           <span>MODE: NORMAL</span>
           <span>UTF-8</span>
           <span>Unix</span>
         </div>
         <div>
           <span>Ln 42, Col 12</span>
         </div>
      </div>
      {!isMinimized && (
        <div className="border-t border-bg">
          <StockTicker />
        </div>
      )}
    </footer>
  );
};

