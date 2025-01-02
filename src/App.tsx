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

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <MenuSidebar />
        <main className="pt-16">
          <Index />
        </main>
      </>
    ),
    errorElement: <Error />,
  },
  {
    path: "/about",
    element: (
      <>
        <MenuSidebar />
        <main className="pt-16">
          <About />
        </main>
      </>
    ),
    errorElement: <Error />,
  },
  {
    path: "/auth",
    element: (
      <>
        <MenuSidebar />
        <main className="pt-16">
          <Auth />
        </main>
      </>
    ),
    errorElement: <Error />,
  },
  {
    path: "/blog",
    element: (
      <>
        <MenuSidebar />
        <main className="pt-16">
          <Blog />
        </main>
      </>
    ),
    errorElement: <Error />,
  },
  {
    path: "/blog/upload",
    element: (
      <>
        <MenuSidebar />
        <main className="pt-16">
          <BlogUpload />
        </main>
      </>
    ),
    errorElement: <Error />,
  },
  {
    path: "/career",
    element: (
      <>
        <MenuSidebar />
        <main className="pt-16">
          <Career />
        </main>
      </>
    ),
    errorElement: <Error />,
  },
  {
    path: "/career/upload",
    element: (
      <>
        <MenuSidebar />
        <main className="pt-16">
          <CareerUpload />
        </main>
      </>
    ),
    errorElement: <Error />,
  },
  {
    path: "/major/upload",
    element: (
      <>
        <MenuSidebar />
        <main className="pt-16">
          <MajorUpload />
        </main>
      </>
    ),
    errorElement: <Error />,
  },
  {
    path: "/mentor",
    element: (
      <>
        <MenuSidebar />
        <main className="pt-16">
          <Mentor />
        </main>
      </>
    ),
    errorElement: <Error />,
  },
  {
    path: "/mentor/register",
    element: (
      <>
        <MenuSidebar />
        <main className="pt-16">
          <MentorRegistration />
        </main>
      </>
    ),
    errorElement: <Error />,
  },
  {
    path: "/profile",
    element: (
      <>
        <MenuSidebar />
        <main className="pt-16">
          <Profile />
        </main>
      </>
    ),
    errorElement: <Error />,
  },
  {
    path: "/program",
    element: (
      <>
        <MenuSidebar />
        <main className="pt-16">
          <Program />
        </main>
      </>
    ),
    errorElement: <Error />,
  },
  {
    path: "/video",
    element: (
      <>
        <MenuSidebar />
        <main className="pt-16">
          <Video />
        </main>
      </>
    ),
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