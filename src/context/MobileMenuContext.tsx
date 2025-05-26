
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MobileMenuContextType {
  isOpen: boolean;
  closeMobileMenu: () => void;
  openMobileMenu: () => void;
  toggleMobileMenu: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined);

export const useMobileMenu = () => {
  const context = useContext(MobileMenuContext);
  if (context === undefined) {
    throw new Error('useMobileMenu must be used within a MobileMenuProvider');
  }
  return context;
};

interface MobileMenuProviderProps {
  children: ReactNode;
}

export const MobileMenuProvider: React.FC<MobileMenuProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMobileMenu = () => setIsOpen(false);
  const openMobileMenu = () => setIsOpen(true);
  const toggleMobileMenu = () => setIsOpen(prev => !prev);

  const value = {
    isOpen,
    closeMobileMenu,
    openMobileMenu,
    toggleMobileMenu,
  };

  return (
    <MobileMenuContext.Provider value={value}>
      {children}
    </MobileMenuContext.Provider>
  );
};
