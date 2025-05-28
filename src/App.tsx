import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import AppSidebar from './components/AppSidebar';
import MainNavigation from './components/MainNavigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Blog from './pages/Blog';
import Opportunities from './pages/Opportunities';
import OpportunityDetails from './pages/OpportunityDetails';
import BlogDetails from './pages/BlogDetails';
import ProfileEdit from './pages/ProfileEdit';
import ScrollToTop from './components/ScrollToTop';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Careers from './pages/Careers';
import CareerDetails from './pages/CareerDetails';
import Mentors from './pages/Mentors';
import MentorDetails from './pages/MentorDetails';
import Companies from './pages/Companies';
import CompanyDetails from './pages/CompanyDetails';
import Schools from './pages/Schools';
import SchoolDetails from './pages/SchoolDetails';
import Majors from './pages/Majors';
import MajorDetails from './pages/MajorDetails';
import Scholarships from './pages/Scholarships';
import ScholarshipDetails from './pages/ScholarshipDetails';
import EmailPreferences from './pages/EmailPreferences';
import Partnerships from "./pages/Partnerships";
import PartnershipApplication from "./pages/PartnershipApplication";

function App() {
  return (
    <BrowserRouter>
      <QueryClient>
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
                <Route path="/profile/edit" element={<ProfileEdit />} />
                <Route path="/email-preferences" element={<EmailPreferences />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogDetails />} />
                <Route path="/opportunities" element={<Opportunities />} />
                <Route path="/opportunities/:id" element={<OpportunityDetails />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/careers/:id" element={<CareerDetails />} />
                <Route path="/mentors" element={<Mentors />} />
                <Route path="/mentors/:id" element={<MentorDetails />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/companies/:id" element={<CompanyDetails />} />
                <Route path="/schools" element={<Schools />} />
                <Route path="/schools/:id" element={<SchoolDetails />} />
                <Route path="/majors" element={<Majors />} />
                <Route path="/majors/:id" element={<MajorDetails />} />
                <Route path="/scholarships" element={<Scholarships />} />
                <Route path="/scholarships/:id" element={<ScholarshipDetails />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/partnerships" element={<Partnerships />} />
                <Route path="/partnerships/apply" element={<PartnershipApplication />} />
              </Routes>
            </main>
            <Footer />
          </ThemeProvider>
        </div>
      </QueryClient>
    </BrowserRouter>
  );
}

export default App;
