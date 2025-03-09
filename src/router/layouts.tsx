
import { MenuSidebar } from "@/components/MenuSidebar";
import { Footer } from "@/components/Footer";
import { GoToTopButton } from "@/components/ui/go-to-top-button";
import { Outlet } from "react-router-dom"; // Add this import

interface LayoutProps {
  children?: React.ReactNode; // Make children optional
}

export function MainLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <MenuSidebar />
      <main className="pt-16 flex-grow">
        {children || <Outlet />} {/* Use children if provided, otherwise use Outlet */}
      </main>
      <Footer />
      <GoToTopButton />
    </div>
  );
}

export function AuthLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <MenuSidebar />
      <main className="pt-16 flex-grow">
        {children || <Outlet />} {/* Use children if provided, otherwise use Outlet */}
      </main>
    </div>
  );
}
