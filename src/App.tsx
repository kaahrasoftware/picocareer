import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Error from "@/pages/Error";
import EmailConfirmation from "@/pages/EmailConfirmation";
import { useAuthSession } from "@/hooks/useAuthSession";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <Error />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/email-confirmation",
    element: <EmailConfirmation />,
  },
]);

export default function App() {
  return (
    <RouterProvider router={router} />
  );
}
