
import { useRoutes } from "react-router-dom";
import { router } from "./routes";

/**
 * AppRoutes component that renders the application routes
 * Uses the routes defined in the routes.tsx file
 */
export function AppRoutes() {
  // Use the routes configuration from the router object
  const routes = router.routes;
  
  // Render the routes using useRoutes hook
  const element = useRoutes(routes);
  
  return element;
}
