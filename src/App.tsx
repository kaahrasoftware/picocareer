
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "./components/ThemeProvider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { AppSidebar } from './components/AppSidebar';
import { MainNavigation } from './components/navigation/MainNavigation';
import { Footer } from './components/Footer';
import Home from './pages/Index';
import Profile from './pages/Profile';
import Blog from './pages/Blog';
import Opportunities from './pages/Opportunities';
import OpportunityDetails from './pages/OpportunityDetails';
import { ScrollToTop } from './components/ScrollToTop';
import Dashboard from './pages/Dashboard';
import PersonalityTest from './pages/PersonalityTest';
import Scholarships from './pages/Scholarships';
import Partnerships from "./pages/Partnerships";
import PartnershipApplication from "./pages/PartnershipApplication";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background">
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <Toaster />
            <AppSidebar />
            <main className="transition-all duration-300 ease-in-out lg:ml-64">
              <MainNavigation />
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/opportunities" element={<Opportunities />} />
                <Route path="/opportunities/:id" element={<OpportunityDetails />} />
                <Route path="/scholarships" element={<Scholarships />} />
                <Route path="/personality-test" element={<PersonalityTest />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/partnerships" element={<Partnerships />} />
                <Route path="/partnerships/apply" element={<PartnershipApplication />} />
              </Routes>
            </main>
            <Footer />
          </ThemeProvider>
        </div>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
