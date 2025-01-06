import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "@/pages/Root";
import Error from "@/pages/Error";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import EmailConfirmation from "@/pages/EmailConfirmation";
import EmailConfirmationPending from "@/pages/EmailConfirmationPending";
import MentorRegistration from "@/pages/MentorRegistration";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";

// Lazy load DevTools to avoid bundling in production
const ReactQueryDevtools = lazy(() =>
  import("@tanstack/react-query-devtools").then((d) => ({
    default: d.ReactQueryDevtools,
  }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/auth",
        element: <Auth />,
      },
      {
        path: "/auth/confirm-email",
        element: <EmailConfirmationPending />,
      },
      {
        path: "/auth/confirm",
        element: <EmailConfirmation />,
      },
      {
        path: "/mentor/register",
        element: <MentorRegistration />,
      },
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
      {process.env.NODE_ENV === 'development' && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}