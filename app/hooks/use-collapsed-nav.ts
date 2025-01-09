import { useState, useEffect } from 'react';

export function useCollapsedNav() {
  const [collapsed, setCollapsed] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('nav-collapsed');
    if (stored !== null) {
      setCollapsed(JSON.parse(stored));
    }
  }, []);

  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('nav-collapsed', JSON.stringify(newState));
  };

  return { collapsed, toggleCollapsed };
} 