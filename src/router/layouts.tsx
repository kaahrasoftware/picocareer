
import { MenuSidebar } from "@/components/MenuSidebar";
import { Footer } from "@/components/Footer";
import { GoToTopButton } from "@/components/ui/go-to-top-button";

interface LayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <MenuSidebar />
      <main className="pt-16 flex-grow">
        {children}
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
        {children}
      </main>
    </div>
  );
}
