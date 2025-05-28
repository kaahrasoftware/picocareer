
import { Navigate, createBrowserRouter } from "react-router-dom";

import { MainLayout } from "./layouts";
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
import ProfileEdit from "../pages/ProfileEdit";
import BlogDetails from "../pages/BlogDetails";
import Events from "../pages/Events";
import EventDetails from "../pages/EventDetails";
import Careers from "../pages/Careers";
import CareerDetails from "../pages/CareerDetails";
import Mentors from "../pages/Mentors";
import MentorDetails from "../pages/MentorDetails";
import Companies from "../pages/Companies";
import CompanyDetails from "../pages/CompanyDetails";
import Schools from "../pages/Schools";
import SchoolDetails from "../pages/SchoolDetails";
import Majors from "../pages/Majors";
import MajorDetails from "../pages/MajorDetails";
import ScholarshipDetails from "../pages/ScholarshipDetails";
import EmailPreferences from "../pages/EmailPreferences";
import Partnerships from "../pages/Partnerships";
import PartnershipApplication from "../pages/PartnershipApplication";

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
        path: "career/:id",
        element: <Career />,
      },
      {
        path: "careers",
        element: <Careers />,
      },
      {
        path: "careers/:id",
        element: <CareerDetails />,
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
        path: "mentor/:id",
        element: <Mentor />,
      },
      {
        path: "mentors",
        element: <Mentors />,
      },
      {
        path: "mentors/:id",
        element: <MentorDetails />,
      },
      {
        path: "blog",
        element: <Blog />,
      },
      {
        path: "blog/:id",
        element: <BlogDetails />,
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
        path: "program/:id",
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
        path: "event/:id",
        element: <Event />,
      },
      {
        path: "events",
        element: <Events />,
      },
      {
        path: "events/:id",
        element: <EventDetails />,
      },
      {
        path: "companies",
        element: <Companies />,
      },
      {
        path: "companies/:id",
        element: <CompanyDetails />,
      },
      {
        path: "schools",
        element: <Schools />,
      },
      {
        path: "schools/:id",
        element: <SchoolDetails />,
      },
      {
        path: "majors",
        element: <Majors />,
      },
      {
        path: "majors/:id",
        element: <MajorDetails />,
      },
      {
        path: "feedback/:id",
        element: <Profile initialTab="calendar" />,
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
        path: "major/upload",
        element: <MajorUpload />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "profile/edit",
        element: <ProfileEdit />,
      },
      {
        path: "profile/:id",
        element: <Profile />,
      },
      {
        path: "email-preferences",
        element: <EmailPreferences />,
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
        element: <TokenShop />,
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
        element: <MentorRegistration />,
      },
      {
        path: "password-reset",
        element: <PasswordReset />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
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
        path: "/scholarships/:id",
        element: <ScholarshipDetails />
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
        path: "/partnerships",
        element: <Partnerships />,
      },
      {
        path: "/partnerships/apply",
        element: <PartnershipApplication />,
      },
      {
        path: "admin/email-campaigns",
        element: <AdminEmailCampaigns />,
      },
    ],
  },
]);

export default router;
