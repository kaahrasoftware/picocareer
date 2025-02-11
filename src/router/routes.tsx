
import { RouteObject } from "react-router-dom";
import { MainLayout, AuthLayout } from "./layouts";
import PersonalityTest from "@/pages/PersonalityTest";
import About from "@/pages/About";
import Auth from "@/pages/Auth";
import Blog from "@/pages/Blog";
import BlogUpload from "@/pages/BlogUpload";
import Career from "@/pages/Career";
import CareerUpload from "@/pages/CareerUpload";
import Contact from "@/pages/Contact";
import Dashboard from "@/pages/Dashboard";
import EmailConfirmation from "@/pages/EmailConfirmation";
import Error from "@/pages/Error";
import Event from "@/pages/Event";
import EventUpload from "@/pages/EventUpload";
import Funding from "@/pages/Funding";
import Index from "@/pages/Index";
import Hub from "@/pages/Hub";
import Hubs from "@/pages/Hubs";
import MajorUpload from "@/pages/MajorUpload";
import Mentor from "@/pages/Mentor";
import MentorRegistration from "@/pages/MentorRegistration";
import PasswordReset from "@/pages/PasswordReset";
import Privacy from "@/pages/Privacy";
import Profile from "@/pages/Profile";
import Program from "@/pages/Program";
import School from "@/pages/School";
import Terms from "@/pages/Terms";
import TokenShop from "@/pages/TokenShop";
import Video from "@/pages/Video";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout><Index /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/about",
    element: <MainLayout><About /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/auth",
    element: <AuthLayout><Auth /></AuthLayout>,
    errorElement: <Error />,
  },
  {
    path: "/blog",
    element: <MainLayout><Blog /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/blog/upload",
    element: <MainLayout><BlogUpload /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/career",
    element: <MainLayout><Career /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/career/upload",
    element: <MainLayout><CareerUpload /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/contact",
    element: <MainLayout><Contact /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/dashboard",
    element: <MainLayout><Dashboard /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/auth/confirm",
    element: <EmailConfirmation />,
    errorElement: <Error />,
  },
  {
    path: "/funding",
    element: <MainLayout><Funding /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/hubs",
    element: <MainLayout><Hubs /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/hubs/:id",
    element: <MainLayout><Hub /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/major/upload",
    element: <MainLayout><MajorUpload /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/mentor",
    element: <MainLayout><Mentor /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/mentor/register",
    element: <MainLayout><MentorRegistration /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/privacy",
    element: <MainLayout><Privacy /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/profile",
    element: <MainLayout><Profile /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/program",
    element: <MainLayout><Program /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/school",
    element: <MainLayout><School /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/terms",
    element: <MainLayout><Terms /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/video",
    element: <MainLayout><Video /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/password-reset",
    element: <PasswordReset />,
    errorElement: <Error />,
  },
  {
    path: "/tokens",
    element: <MainLayout><TokenShop /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/event",
    element: <MainLayout><Event /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/event/upload",
    element: <MainLayout><EventUpload /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/personality-test",
    element: <MainLayout><PersonalityTest /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "*",
    element: <Error />,
  },
];
