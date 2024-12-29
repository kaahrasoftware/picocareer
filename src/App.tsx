import { Toaster } from "@/components/ui/toaster";
import { GoToTopButton } from "@/components/ui/go-to-top-button";
import { Footer } from "@/components/Footer";
import { AppRoutes } from "@/AppRoutes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MenuSidebar } from "@/components/MenuSidebar";
import "./App.css";

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pt-16">
        <AppRoutes />
      </main>
      <Footer />
      <GoToTopButton />
    </div>
  );
}

function App() {
  return (
    <SidebarProvider>
      <MenuSidebar />
      <AppContent />
      <Toaster />
    </SidebarProvider>
  );
}

export default App;