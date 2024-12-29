import { Toaster } from "@/components/ui/toaster";
import { GoToTopButton } from "@/components/ui/go-to-top-button";
import { Footer } from "@/components/Footer";
import { AppRoutes } from "@/AppRoutes";
import "./App.css";

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <AppRoutes />
      </main>
      <Footer />
      <GoToTopButton />
    </div>
  );
}

function App() {
  return (
    <>
      <AppContent />
      <Toaster />
    </>
  );
}

export default App;