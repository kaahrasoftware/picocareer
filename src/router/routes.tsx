
import Index from "@/pages/Index";
import { Profile } from "@/pages/Profile";
import { Contact } from "@/pages/Contact";
import { Terms } from "@/pages/Terms";
import { Privacy } from "@/pages/Privacy";
import { Auth } from "@/pages/Auth";
import { Hub } from "@/pages/Hub";
import TokenDeductionTest from "@/pages/TokenDeductionTest";

export const router = {
  routes: [
    {
      path: "/",
      element: <Index />,
    },
    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/contact",
      element: <Contact />,
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
      path: "/auth",
      element: <Auth />,
    },
    {
      path: "/hub",
      element: <Hub />,
    },
    {
      path: "/debug/token-deduction",
      element: <TokenDeductionTest />,
    },
    {
      path: "*",
      element: <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
      </div>,
    },
  ],
};
