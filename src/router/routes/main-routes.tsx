
import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Profile from "@/pages/Profile";
import Dashboard from "@/pages/Dashboard";
import Funding from "@/pages/Funding";

export const mainRoutes = [
  {
    path: "",
    element: <Index />,
  },
  {
    path: "about",
    element: <About />,
  },
  {
    path: "contact",
    element: <Contact />,
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
    path: "profile",
    element: <Profile />,
  },
  {
    path: "profile/:id",
    element: <Profile />,
  },
  {
    path: "dashboard",
    element: <Dashboard />,
  },
  {
    path: "feedback/:id",
    element: <Profile initialTab="calendar" />,
  },
  {
    path: "funding",
    element: <Funding />,
  },
];
