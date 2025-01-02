import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import About from "@/pages/About";
import Auth from "@/pages/Auth";
import Blog from "@/pages/Blog";
import BlogUpload from "@/pages/BlogUpload";
import Career from "@/pages/Career";
import CareerUpload from "@/pages/CareerUpload";
import Error from "@/pages/Error";
import Index from "@/pages/Index";
import MajorUpload from "@/pages/MajorUpload";
import Mentor from "@/pages/Mentor";
import MentorRegistration from "@/pages/MentorRegistration";
import Profile from "@/pages/Profile";
import Program from "@/pages/Program";
import Video from "@/pages/Video";
import { MenuSidebar } from "@/components/MenuSidebar";

const queryClient = new QueryClient();

// Create a layout component to avoid repetition
const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <MenuSidebar />
    <main className="pt-16">
      {children}
    </main>
  </>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout><Index /></Layout>,
    errorElement: <Error />,
  },
  {
    path: "/about",
    element: <Layout><About /></Layout>,
    errorElement: <Error />,
  },
  {
    path: "/auth",
    element: <Layout><Auth /></Layout>,
    errorElement: <Error />,
  },
  {
    path: "/blog",
    element: <Layout><Blog /></Layout>,
    errorElement: <Error />,
  },
  {
    path: "/blog/upload",
    element: <Layout><BlogUpload /></Layout>,
    errorElement: <Error />,
  },
  {
    path: "/career",
    element: <Layout><Career /></Layout>,
    errorElement: <Error />,
  },
  {
    path: "/career/upload",
    element: <Layout><CareerUpload /></Layout>,
    errorElement: <Error />,
  },
  {
    path: "/major/upload",
    element: <Layout><MajorUpload /></Layout>,
    errorElement: <Error />,
  },
  {
    path: "/mentor",
    element: <Layout><Mentor /></Layout>,
    errorElement: <Error />,
  },
  {
    path: "/mentor/register",
    element: <Layout><MentorRegistration /></Layout>,
    errorElement: <Error />,
  },
  {
    path: "/profile",
    element: <Layout><Profile /></Layout>,
    errorElement: <Error />,
  },
  {
    path: "/program",
    element: <Layout><Program /></Layout>,
    errorElement: <Error />,
  },
  {
    path: "/video",
    element: <Layout><Video /></Layout>,
    errorElement: <Error />,
  },
  {
    path: "*",
    element: <Error />,
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <RouterProvider router={router} />
        <Toaster />
        <Sonner />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;