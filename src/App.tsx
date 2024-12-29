import { Toaster } from "@/components/ui/toaster";
import { GoToTopButton } from "@/components/ui/go-to-top-button";
import { Footer } from "@/components/Footer";
import { AppRoutes } from "@/AppRoutes";
import "./App.css";

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <AppRoutes />
      </main>
      <GoToTopButton />
      <Footer />
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