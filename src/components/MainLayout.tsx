import React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex-1 min-h-screen flex flex-col">
      <div className="p-8 flex-1">
        <div className="max-w-[1600px] mx-auto">
          <ThemeToggle />
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};