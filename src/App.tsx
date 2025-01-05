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
import EmailConfirmation from "@/pages/EmailConfirmation";
import Error from "@/pages/Error";
import Index from "@/pages/Index";
import MajorUpload from "@/pages/MajorUpload";
import Mentor from "@/pages/Mentor";
import MentorRegistration from "@/pages/MentorRegistration";
import Profile from "@/pages/Profile";
import Program from "@/pages/Program";
import Video from "@/pages/Video";
import { MenuSidebar } from "@/components/MenuSidebar";
import { Footer } from "@/components/Footer";

const queryClient = new QueryClient();

// Layout component to wrap pages with MenuSidebar and Footer
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <MenuSidebar />
      <main className="pt-16 flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

// Simple layout without footer for auth pages
function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <MenuSidebar />
      <main className="pt-16 flex-grow">
        {children}
      </main>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout><Index /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/about",
    element: <MainLayout><About /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/auth",
    element: <AuthLayout><Auth /></AuthLayout>,
    errorElement: <Error />,
  },
  {
    path: "/blog",
    element: <MainLayout><Blog /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/blog/upload",
    element: <MainLayout><BlogUpload /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/career",
    element: <MainLayout><Career /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/career/upload",
    element: <MainLayout><CareerUpload /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/email-confirmation",
    element: <EmailConfirmation />,
    errorElement: <Error />,
  },
  {
    path: "/major/upload",
    element: <MainLayout><MajorUpload /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/mentor",
    element: <MainLayout><Mentor /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/mentor/register",
    element: <MainLayout><MentorRegistration /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/profile",
    element: <MainLayout><Profile /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/program",
    element: <MainLayout><Program /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/video",
    element: <MainLayout><Video /></MainLayout>,
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