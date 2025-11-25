import React from 'react';

export const GlowBorder = ({ children, active = false, className = '' }: { children: React.ReactNode, active?: boolean, className?: string }) => {
  return (
    <div 
      className={`relative transition-all duration-300 ease-in-out border-2 rounded-sm ${className} hover:border-accent hover:shadow-[0_0_10px_-2px_var(--color-accent),inset_0_0_5px_-2px_var(--color-accent)] hover:bg-white/5`}
      style={{
        borderColor: active ? 'var(--color-accent)' : 'var(--color-surface)',
        boxShadow: active ? '0 0 10px -2px var(--color-accent), inset 0 0 5px -2px var(--color-accent)' : 'none',
        backgroundColor: active ? 'rgba(0,0,0,0.05)' : 'transparent'
      }}
    >
      {children}
    </div>
  );
};

