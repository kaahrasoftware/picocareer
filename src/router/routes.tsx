
import { Index } from "@/pages/Index";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { Privacy } from "@/pages/Privacy";
import { Terms } from "@/pages/Terms";
import { Blog } from "@/pages/Blog";
import { Auth } from "@/pages/Auth";
import { Profile } from "@/pages/Profile";
import { Dashboard } from "@/pages/Dashboard";
import { CareerChat } from "@/pages/CareerChat";
import { Opportunities } from "@/pages/Opportunities";
import { OpportunityDetails } from "@/pages/OpportunityDetails";
import ApiDemoPage from "@/pages/ApiDemoPage";

export const router = {
  routes: [
    {
      path: "/",
      element: <Index />,
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
      path: "/privacy",
      element: <Privacy />,
    },
    {
      path: "/terms",
      element: <Terms />,
    },
    {
      path: "/blog",
      element: <Blog />,
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
      path: "/dashboard",
      element: <Dashboard />,
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
      element: <OpportunityDetails />,
    },
    {
      path: "/api-demo",
      element: <ApiDemoPage />,
    },
  ],
};
