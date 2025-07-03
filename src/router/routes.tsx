
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
import SchoolDetails from '@/pages/SchoolDetails';
import OpportunityDetails from '@/pages/OpportunityDetails';
import Auth from '@/pages/Auth';
import Admin from '@/pages/Admin';
import Mentors from '@/pages/Mentors';
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
      { path: "careers", element: <Careers /> },
      { path: "opportunities", element: <Opportunities /> },
      { path: "opportunities/:id", element: <OpportunityDetails /> },
      { path: "scholarships", element: <Scholarships /> },
      { path: "mentors", element: <Mentors /> },
      { path: "mentors/:id", element: <MentorProfile /> },
      { path: "search", element: <Search /> },
      { path: "profile", element: <Profile /> },
      { path: "events", element: <Events /> },
      { path: "hubs", element: <Hubs /> },
      { path: "admin", element: <Admin /> },
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
