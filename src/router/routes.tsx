
import { Navigate, createBrowserRouter } from "react-router-dom";

import { MainLayout } from "./layouts";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "../pages/Index";
import Career from "../pages/Career";
import Mentor from "../pages/Mentor";
import Blog from "../pages/Blog";
import Contact from "../pages/Contact";
import Program from "../pages/Program";
import About from "../pages/About";
import Privacy from "../pages/Privacy";
import Terms from "../pages/Terms";
import Event from "../pages/Event";
import CareerUpload from "../pages/CareerUpload";
import EventUpload from "../pages/EventUpload";
import BlogUpload from "../pages/BlogUpload";
import School from "../pages/School";
import SchoolDetail from "../pages/SchoolDetail";
import SchoolUploadPage from "../pages/SchoolUploadPage";
import CompanyUploadPage from "../pages/CompanyUploadPage";
import MajorUpload from "../pages/MajorUpload";
import Profile from "../pages/Profile";
import PersonalityTest from "../pages/PersonalityTest";
import Video from "../pages/Video";
import Auth from "../pages/Auth";
import TokenShop from "../pages/TokenShop";
import EmailConfirmation from "../pages/EmailConfirmation";
import Funding from "../pages/Funding";
import MentorRegistration from "../pages/MentorRegistration";
import PasswordReset from "../pages/PasswordReset";
import Dashboard from "../pages/Dashboard";
import Error from "../pages/Error";
import Hubs from "../pages/Hubs";
import Hub from "../pages/Hub";
import HubInviteResponse from "../pages/HubInviteResponse";
import CareerChat from "../pages/CareerChat";
import Scholarships from "@/pages/Scholarships";
import ScholarshipAdd from "@/pages/ScholarshipAdd";
import Opportunities from "@/pages/Opportunities";
import OpportunityDetails from "@/pages/OpportunityDetails";
import CreateOpportunity from "@/pages/CreateOpportunity";
import AdminEmailCampaigns from "../pages/AdminEmailCampaigns";
import Partnerships from "../pages/Partnerships";
import Careers from "../pages/Careers";
import Mentees from "../pages/Mentees";
import TokenDeductionDebug from "../pages/TokenDeductionDebug";
import ResourceBank from "../pages/ResourceBank";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <Error />,
    children: [
      {
        path: "",
        element: <Index />,
      },
      {
        path: "auth",
        element: <Auth />,
      },
      {
        path: "career",
        element: <Career />,
      },
      {
        path: "career-chat",
        element: <CareerChat />,
      },
      {
        path: "mentor",
        element: <Mentor />,
      },
      {
        path: "mentees",
        element: <Mentees />,
      },
      {
        path: "blog",
        element: <Blog />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "program",
        element: <Program />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "privacy",
        element: <Privacy />,
      },
      {
        path: "terms",
        element: <Terms />,
      },
      {
        path: "event",
        element: <Event />,
      },
      {
        path: "events",
        element: <Event />,
      },
      {
        path: "resource-bank",
        element: <ResourceBank />,
      },
      {
        path: "career/upload",
        element: <CareerUpload />,
      },
      {
        path: "event/upload",
        element: <EventUpload />,
      },
      {
        path: "blog/upload",
        element: <BlogUpload />,
      },
      {
        path: "school",
        element: <School />,
      },
      {
        path: "school/:id",
        element: <SchoolDetail />,
      },
      {
        path: "schools/upload",
        element: <SchoolUploadPage />,
      },
      {
        path: "companies/upload",
        element: <CompanyUploadPage />,
      },
      {
        path: "major/upload",
        element: <MajorUpload />,
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "personality-test",
        element: <PersonalityTest />,
      },
      {
        path: "video",
        element: <Video />,
      },
      {
        path: "token-shop",
        element: (
          <ProtectedRoute>
            <TokenShop />
          </ProtectedRoute>
        ),
      },
      {
        path: "email-confirmation",
        element: <EmailConfirmation />,
      },
      {
        path: "funding",
        element: <Funding />,
      },
      {
        path: "mentor-registration",
        element: (
          <ProtectedRoute>
            <MentorRegistration />
          </ProtectedRoute>
        ),
      },
      {
        path: "password-reset",
        element: <PasswordReset />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "hubs",
        element: <Hubs />,
      },
      {
        path: "hubs/:id",
        element: <Hub />,
      },
      {
        path: "hub-invite/response",
        element: <HubInviteResponse />,
      },
      {
        path: "/scholarships",
        element: <Scholarships />
      },
      {
        path: "/scholarships/add",
        element: <ScholarshipAdd />
      },
      {
        path: "/opportunities",
        element: <Opportunities />,
      },
      {
        path: "/opportunities/:id",
        element: <OpportunityDetails />,
      },
      {
        path: "/opportunities/create",
        element: <CreateOpportunity />,
      },
      {
        path: "partnerships",
        element: <Partnerships />,
      },
      {
        path: "careers",
        element: <Careers />,
      },
      {
        path: "admin/email-campaigns",
        element: <AdminEmailCampaigns />,
      },
      {
        path: "debug/token-deduction",
        element: <TokenDeductionDebug />,
      },
    ],
  },
]);

export default router;
