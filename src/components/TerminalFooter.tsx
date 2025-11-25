import React from 'react';

export const TerminalFooter = () => {
  return (
    <footer className="h-8 border-t flex items-center justify-between px-4 text-xs font-mono opacity-60 bg-surface border-bg">
       <div className="flex gap-4">
         <span>MODE: NORMAL</span>
         <span>UTF-8</span>
         <span>Unix</span>
       </div>
       <div>
         <span>Ln 42, Col 12</span>
       </div>
    </footer>
  );
};

