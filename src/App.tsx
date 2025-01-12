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
import Contact from "@/pages/Contact";
import EmailConfirmation from "@/pages/EmailConfirmation";
import Error from "@/pages/Error";
import Funding from "@/pages/Funding";
import Index from "@/pages/Index";
import MajorUpload from "@/pages/MajorUpload";
import Mentor from "@/pages/Mentor";
import MentorRegistration from "@/pages/MentorRegistration";
import PasswordReset from "@/pages/PasswordReset";
import Privacy from "@/pages/Privacy";
import Profile from "@/pages/Profile";
import Program from "@/pages/Program";
import School from "@/pages/School";
import Terms from "@/pages/Terms";
import TokenShop from "@/pages/TokenShop";
import Video from "@/pages/Video";
import { MenuSidebar } from "@/components/MenuSidebar";
import { Footer } from "@/components/Footer";

// Create a client with specific configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

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
    path: "/contact",
    element: <MainLayout><Contact /></MainLayout>,
    errorElement: <Error />,
  },
  {
    // Update the email confirmation route to match Supabase's redirect
    path: "/auth/confirm",
    element: <EmailConfirmation />,
    errorElement: <Error />,
  },
  {
    path: "/funding",
    element: <MainLayout><Funding /></MainLayout>,
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
    path: "/privacy",
    element: <MainLayout><Privacy /></MainLayout>,
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
    path: "/school",
    element: <MainLayout><School /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/terms",
    element: <MainLayout><Terms /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/video",
    element: <MainLayout><Video /></MainLayout>,
    errorElement: <Error />,
  },
  {
    path: "/password-reset",
    element: <PasswordReset />,
    errorElement: <Error />,
  },
  {
    path: "/tokens",
    element: <MainLayout><TokenShop /></MainLayout>,
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
