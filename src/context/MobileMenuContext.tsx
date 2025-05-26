
import React, { createContext, useContext } from "react";

type MobileMenuContextType = {
  closeMobileMenu: () => void;
  isOpen: boolean;
};

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined);

export function useMobileMenu() {
  const context = useContext(MobileMenuContext);
  
  // Return a no-op function if used outside of context to prevent errors
  if (!context) {
    return { 
      closeMobileMenu: () => {}, 
      isOpen: false 
    };
  }
  
  return context;
}

export const MobileMenuProvider: React.FC<{
  children: React.ReactNode;
  closeMobileMenu: () => void;
  isOpen: boolean;
}> = ({ children, closeMobileMenu, isOpen }) => {
  return (
    <MobileMenuContext.Provider value={{ closeMobileMenu, isOpen }}>
      {children}
    </MobileMenuContext.Provider>
  );
};
