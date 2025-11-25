import { useState, useEffect } from 'react';

type ComponentType = 'stock-ticker' | 'news-ticker' | 'radio';

export function useMinimized(componentType: ComponentType) {
  const [isMinimized, setIsMinimized] = useState(false);

  const updateState = () => {
    const saved = localStorage.getItem(`minimized-${componentType}`);
    setIsMinimized(saved === 'true');
  };

  useEffect(() => {
    // Load from localStorage on mount
    updateState();

    // Listen for storage changes (from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `minimized-${componentType}`) {
        updateState();
      }
    };

    // Listen for custom events (from same window)
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === `minimized-${componentType}`) {
        updateState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('minimized-state-changed', handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('minimized-state-changed', handleCustomStorageChange as EventListener);
    };
  }, [componentType]);

  const toggleMinimized = () => {
    setIsMinimized((prev) => {
      const newValue = !prev;
      localStorage.setItem(`minimized-${componentType}`, String(newValue));
      
      // Dispatch custom event for same-window sync
      window.dispatchEvent(new CustomEvent('minimized-state-changed', {
        detail: { key: `minimized-${componentType}`, value: newValue }
      }));
      
      return newValue;
    });
  };

  return { isMinimized, toggleMinimized };
}

