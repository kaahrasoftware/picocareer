import { Home } from "@/pages/Home";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { Pricing } from "@/pages/Pricing";
import { Terms } from "@/pages/Terms";
import { Privacy } from "@/pages/Privacy";
import { Blog } from "@/pages/Blog";
import { BlogArticle } from "@/pages/BlogArticle";
import { Auth } from "@/pages/Auth";
import { Profile } from "@/pages/Profile";
import { ProfileEdit } from "@/pages/ProfileEdit";
import { Dashboard } from "@/pages/Dashboard";
import { Notifications } from "@/pages/Notifications";
import { CareerChat } from "@/pages/CareerChat";
import { Opportunities } from "@/pages/Opportunities";
import { Opportunity } from "@/pages/Opportunity";
import { OpportunityApplication } from "@/pages/OpportunityApplication";
import { Admin } from "@/pages/Admin";
import ApiDemoPage from "@/pages/ApiDemoPage";

export const router = {
  routes: [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/about",
      element: <About />,
    },
    {
      path: "/contact",
      element: <Contact />,
    },
    {
      path: "/pricing",
      element: <Pricing />,
    },
    {
      path: "/terms",
      element: <Terms />,
    },
    {
      path: "/privacy",
      element: <Privacy />,
    },
    {
      path: "/blog",
      element: <Blog />,
    },
    {
      path: "/blog/:id",
      element: <BlogArticle />,
    },
    {
      path: "/auth",
      element: <Auth />,
    },
    {
      path: "/profile/:id",
      element: <Profile />,
    },
    {
      path: "/profile-edit",
      element: <ProfileEdit />,
    },
    {
      path: "/dashboard",
      element: <Dashboard />,
    },
    {
      path: "/notifications",
      element: <Notifications />,
    },
    {
      path: "/career-chat",
      element: <CareerChat />,
    },
    {
      path: "/opportunities",
      element: <Opportunities />,
    },
    {
      path: "/opportunities/:id",
      element: <Opportunity />,
    },
    {
      path: "/opportunities/:id/apply",
      element: <OpportunityApplication />,
    },
    {
      path: "/admin",
      element: <Admin />,
    },
    {
      path: "/api-demo",
      element: <ApiDemoPage />,
    },
  ],
};
