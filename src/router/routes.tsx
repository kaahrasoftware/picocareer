
import { createBrowserRouter } from "react-router-dom";
import { MainLayout, AuthLayout } from "./layouts";
import Home from '@/pages/Home';
import School from '@/pages/School';
import Program from '@/pages/Program';
import Careers from '@/pages/Careers';
import Opportunities from '@/pages/Opportunities';
import Profile from '@/pages/Profile';
import Scholarships from '@/pages/Scholarships';
import Events from '@/pages/Events';
import SchoolDetail from '@/pages/SchoolDetail';
import OpportunityDetails from '@/pages/OpportunityDetails';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Mentor from '@/pages/Mentor';
import CareerAssessment from '@/pages/CareerAssessment';
import ResourceBank from '@/pages/ResourceBank';
import CareerUpload from '@/pages/CareerUpload';
import MajorUpload from '@/pages/MajorUpload';
import EventUpload from '@/pages/EventUpload';
import SchoolUploadPage from '@/pages/SchoolUploadPage';
import CompanyUploadPage from '@/pages/CompanyUploadPage';
import ScholarshipAdd from '@/pages/ScholarshipAdd';
import CreateOpportunity from '@/pages/CreateOpportunity';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "school", element: <School /> },
      { path: "schools/:id", element: <SchoolDetail /> },
      { path: "program", element: <Program /> },
      { path: "career", element: <Careers /> },
      { path: "careers", element: <Careers /> },
      { path: "opportunities", element: <Opportunities /> },
      { path: "opportunities/:id", element: <OpportunityDetails /> },
      { path: "scholarships", element: <Scholarships /> },
      { path: "mentor", element: <Mentor /> },
      { path: "profile", element: <Profile /> },
      { path: "events", element: <Events /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "career-assessment", element: <CareerAssessment /> },
      { path: "resource-bank", element: <ResourceBank /> },
      // Admin routes
      { path: "career-upload", element: <CareerUpload /> },
      { path: "major-upload", element: <MajorUpload /> },
      { path: "event-upload", element: <EventUpload /> },
      { path: "school-upload", element: <SchoolUploadPage /> },
      { path: "company-upload", element: <CompanyUploadPage /> },
      { path: "scholarship-add", element: <ScholarshipAdd /> },
      { path: "create-opportunity", element: <CreateOpportunity /> },
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
