
import { createBrowserRouter } from "react-router-dom";
import { MainLayout, AuthLayout } from "./layouts";
import Home from '@/pages/Home';
import School from '@/pages/School';
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
import CareerAssessment from '@/pages/CareerAssessment';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "schools", element: <School /> },
      { path: "schools/:id", element: <SchoolDetails /> },
      { path: "majors", element: <Majors /> },
      { path: "majors/:id", element: <MajorDetails /> },
      { path: "careers", element: <Careers /> },
      { path: "careers/:id", element: <CareerDetails /> },
      { path: "opportunities", element: <Opportunities /> },
      { path: "opportunities/:id", element: <OpportunityDetails /> },
      { path: "scholarships", element: <Scholarships /> },
      { path: "scholarships/:id", element: <ScholarshipDetails /> },
      { path: "mentors", element: <Mentors /> },
      { path: "mentors/:id", element: <MentorProfile /> },
      { path: "book-session/:mentorId", element: <BookSession /> },
      { path: "search", element: <Search /> },
      { path: "profile", element: <Profile /> },
      { path: "events", element: <Events /> },
      { path: "events/:id", element: <EventDetails /> },
      { path: "hubs", element: <Hubs /> },
      { path: "hubs/:id", element: <HubDetails /> },
      { path: "admin", element: <Admin /> },
      { path: "blogs", element: <Blogs /> },
      { path: "blogs/:id", element: <BlogDetails /> },
      { path: "checklist", element: <Checklist /> },
      { path: "career-assessment", element: <CareerAssessment /> },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { index: true, element: <Auth /> },
    ],
  },
]);
