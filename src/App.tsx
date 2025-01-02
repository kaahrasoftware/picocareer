import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Outlet } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Error from "@/pages/Error";
import EmailConfirmation from "@/pages/EmailConfirmation";
import { useAuthSession } from "@/hooks/useAuthSession";
import { MenuSidebar } from "@/components/MenuSidebar";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <MenuSidebar />
      <Outlet />
    </div>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route
        path="/"
        element={<Index />}
        errorElement={<Error />}
      />
      <Route
        path="/auth"
        element={<Auth />}
      />
      <Route
        path="/email-confirmation"
        element={<EmailConfirmation />}
      />
    </Route>
  )
);

export default function App() {
  return <RouterProvider router={router} />;
}