
import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Schools from '@/pages/Schools';
import Majors from '@/pages/Majors';
import Careers from '@/pages/Careers';
import Opportunities from '@/pages/Opportunities';
import MentorProfile from '@/pages/MentorProfile';
import Profile from '@/pages/Profile';
import Search from '@/pages/Search';
import Scholarships from '@/pages/Scholarships';
import Events from '@/pages/Events';
import Hubs from '@/pages/Hubs';
import HubDetails from '@/pages/HubDetails';
import EventDetails from '@/pages/EventDetails';
import SchoolDetails from '@/pages/SchoolDetails';
import MajorDetails from '@/pages/MajorDetails';
import CareerDetails from '@/pages/CareerDetails';
import OpportunityDetails from '@/pages/OpportunityDetails';
import ScholarshipDetails from '@/pages/ScholarshipDetails';
import Auth from '@/pages/Auth';
import Admin from '@/pages/Admin';
import BlogDetails from '@/pages/BlogDetails';
import Blogs from '@/pages/Blogs';
import Mentors from '@/pages/Mentors';
import BookSession from '@/pages/BookSession';
import Checklist from '@/pages/Checklist';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/schools" element={<Schools />} />
      <Route path="/schools/:id" element={<SchoolDetails />} />
      <Route path="/majors" element={<Majors />} />
      <Route path="/majors/:id" element={<MajorDetails />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/careers/:id" element={<CareerDetails />} />
      <Route path="/opportunities" element={<Opportunities />} />
      <Route path="/opportunities/:id" element={<OpportunityDetails />} />
      <Route path="/scholarships" element={<Scholarships />} />
      <Route path="/scholarships/:id" element={<ScholarshipDetails />} />
      <Route path="/mentors" element={<Mentors />} />
      <Route path="/mentors/:id" element={<MentorProfile />} />
      <Route path="/book-session/:mentorId" element={<BookSession />} />
      <Route path="/search" element={<Search />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/hubs" element={<Hubs />} />
      <Route path="/hubs/:id" element={<HubDetails />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/blogs/:id" element={<BlogDetails />} />
      <Route path="/checklist" element={<Checklist />} />
    </Routes>
  );
}
