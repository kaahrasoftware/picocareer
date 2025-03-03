import { Navigate, createBrowserRouter } from "react-router-dom";

import DefaultLayout from "./layouts";
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
import MajorUpload from "../pages/MajorUpload";
import Profile from "../pages/Profile";
import PersonalityTest from "../pages/PersonalityTest";
import Video from "../pages/Video";
import Auth from "../pages/Auth";
import TokenShop from "../pages/TokenShop";
import EmailConfirmation from "../pages/EmailConfirmation";
import Funding from "../pages/Funding";
import MentorRegistration from "../pages/MentorRegistration";
import Institutions from "../pages/Institutions";
import Institution from "../pages/Institution";
import PasswordReset from "../pages/PasswordReset";
import Dashboard from "../pages/Dashboard";
import Error from "../pages/Error";
import Hubs from "../pages/Hubs";
import Hub from "../pages/Hub";
import HubInviteResponse from "../pages/HubInviteResponse";
import CareerChat from "../pages/CareerChat"; // New import

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
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
        path: "career-chat", // New route
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
        path: "blog",
        element: <Blog />,
      },
      {
        path: "blog/:id",
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
        path: "major/upload",
        element: <MajorUpload />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "profile/:id",
        element: <Profile />,
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
        path: "institutions",
        element: <Institutions />,
      },
      {
        path: "institutions/:id",
        element: <Institution />,
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
    ],
  },
]);

export default router;
