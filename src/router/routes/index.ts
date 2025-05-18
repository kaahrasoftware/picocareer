
import { createBrowserRouter } from "react-router-dom";
import { mainRoutes } from "./main-routes";
import { authRoutes } from "./auth-routes";
import { careerRoutes } from "./career-routes";
import { educationRoutes } from "./education-routes";
import { communityRoutes } from "./community-routes";
import { contentRoutes } from "./content-routes";
import { opportunityRoutes } from "./opportunity-routes";
import { adminRoutes } from "./admin-routes";
import { MainLayout } from "../layouts";
import Error from "@/pages/Error";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <Error />,
    children: [
      ...mainRoutes,
      ...authRoutes,
      ...careerRoutes,
      ...educationRoutes,
      ...communityRoutes,
      ...contentRoutes,
      ...opportunityRoutes,
      ...adminRoutes,
    ],
  },
]);

export default router;
