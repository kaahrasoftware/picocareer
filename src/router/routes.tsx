
import { createBrowserRouter } from "react-router-dom";
import { MainLayout, AuthLayout } from "./layouts";
import Home from '@/pages/Home';
import School from '@/pages/School';
import Program from '@/pages/Program';
import Careers from '@/pages/Careers';
import Opportunities from '@/pages/Opportunities';
import MentorProfile from '@/pages/MentorProfile';
import Profile from '@/pages/Profile';
import Scholarships from '@/pages/Scholarships';
import Events from '@/pages/Events';
import SchoolDetails from '@/pages/SchoolDetails';
import OpportunityDetails from '@/pages/OpportunityDetails';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Mentor from '@/pages/Mentor';
import CareerAssessment from '@/pages/CareerAssessment';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "school", element: <School /> },
      { path: "schools/:id", element: <SchoolDetails /> },
      { path: "program", element: <Program /> },
      { path: "careers", element: <Careers /> },
      { path: "opportunities", element: <Opportunities /> },
      { path: "opportunities/:id", element: <OpportunityDetails /> },
      { path: "scholarships", element: <Scholarships /> },
      { path: "mentor", element: <Mentor /> },
      { path: "mentors/:id", element: <MentorProfile /> },
      { path: "profile", element: <Profile /> },
      { path: "events", element: <Events /> },
      { path: "dashboard", element: <Dashboard /> },
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
