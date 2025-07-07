
import { createBrowserRouter } from "react-router-dom";
import { MainLayout, AuthLayout } from "./layouts";
import Home from '@/pages/Home';
import About from '@/pages/About';
import School from '@/pages/School';
import Program from '@/pages/Program';
import Career from '@/pages/Career';
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
import AssessmentHistoryPage from '@/pages/AssessmentHistoryPage';
import AssessmentResults from '@/pages/AssessmentResults';
import ResourceBank from '@/pages/ResourceBank';
import CareerUpload from '@/pages/CareerUpload';
import MajorUpload from '@/pages/MajorUpload';
import EventUpload from '@/pages/EventUpload';
import SchoolUploadPage from '@/pages/SchoolUploadPage';
import CompanyUploadPage from '@/pages/CompanyUploadPage';
import ScholarshipAdd from '@/pages/ScholarshipAdd';
import CreateOpportunity from '@/pages/CreateOpportunity';
import MentorRegistration from '@/pages/MentorRegistration';
import Partnerships from '@/pages/Partnerships';
import Hubs from '@/pages/Hubs';
import Hub from '@/pages/Hub';
import HubInviteResponse from '@/pages/HubInviteResponse';
import TokenShop from '@/pages/TokenShop';
import NotFound from '@/pages/NotFound';
import ErrorPage from '@/pages/Error';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "school", element: <School /> },
      { path: "schools/:id", element: <SchoolDetail /> },
      { path: "program", element: <Program /> },
      { path: "career", element: <Career /> },
      { path: "careers", element: <Careers /> },
      { path: "opportunities", element: <Opportunities /> },
      { path: "opportunities/:id", element: <OpportunityDetails /> },
      { path: "scholarships", element: <Scholarships /> },
      { path: "mentor", element: <Mentor /> },
      { path: "mentor-registration", element: <MentorRegistration /> },
      { path: "profile", element: <Profile /> },
      { path: "events", element: <Events /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "career-assessment", element: <CareerAssessment /> },
      { path: "career-assessment/history", element: <AssessmentHistoryPage /> },
      { path: "career-assessment/results/:assessmentId", element: <AssessmentResults /> },
      { path: "resource-bank", element: <ResourceBank /> },
      { path: "partnerships", element: <Partnerships /> },
      { path: "hubs", element: <Hubs /> },
      { path: "hubs/:id", element: <Hub /> },
      { path: "hub-invite-response", element: <HubInviteResponse /> },
      { path: "token-shop", element: <TokenShop /> },
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
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Auth /> },
    ],
  },
  // Catch-all route for 404s
  {
    path: "*",
    element: <NotFound />,
  },
]);
