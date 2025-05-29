import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/layout/AppLayout";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Career from "@/pages/Career";
import Program from "@/pages/Program";
import Mentor from "@/pages/Mentor";
import Opportunities from "@/pages/Opportunities";
import OpportunityDetails from "@/pages/OpportunityDetails";
import Blog from "@/pages/Blog";
import BlogDetails from "@/pages/BlogDetails";
import EmailVerification from "@/pages/EmailVerification";
import PasswordReset from "@/pages/PasswordReset";
import MajorDetails from "@/components/MajorDetails";
import Partnerships from "@/pages/Partnerships";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/auth",
        element: <Auth />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/career",
        element: <Career />,
      },
      {
        path: "/program",
        element: <Program />,
      },
      {
        path: "/mentor",
        element: <Mentor />,
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
        path: "/blog",
        element: <Blog />,
      },
      {
        path: "/blog/:id",
        element: <BlogDetails />,
      },
      {
        path: "/email-verification",
        element: <EmailVerification />,
      },
      {
        path: "/password-reset",
        element: <PasswordReset />,
      },
      {
        path: "/major/:id",
        element: <MajorDetails />,
      },
      {
        path: "/partnerships",
        element: <Partnerships />,
      },
    ]
  }
]);

export { router };
