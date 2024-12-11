import React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <main className="flex-1 p-8 max-w-[1600px] mx-auto">
      <ThemeToggle />
      <div className="max-w-[1400px] mx-auto">
        {children}
      </div>
      <Footer />
    </main>
  );
};