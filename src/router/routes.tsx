
import React from "react";
import { RouteObject } from "react-router-dom";
import { MainLayout, AuthLayout } from "./layouts";

// Lazy load all pages
const Home = React.lazy(() => import("../pages/Index"));
const Blog = React.lazy(() => import("../pages/Blog"));
const BlogUpload = React.lazy(() => import("../pages/BlogUpload"));
const FeedUpload = React.lazy(() => import("../pages/FeedUpload"));
const Profile = React.lazy(() => import("../pages/Profile"));
const Auth = React.lazy(() => import("../pages/Auth"));
const Hub = React.lazy(() => import("../pages/Hub"));
const Hubs = React.lazy(() => import("../pages/Hubs"));
const School = React.lazy(() => import("../pages/School"));
const Institution = React.lazy(() => import("../pages/Institution"));
const Institutions = React.lazy(() => import("../pages/Institutions"));
const Privacy = React.lazy(() => import("../pages/Privacy"));
const Terms = React.lazy(() => import("../pages/Terms"));
const Contact = React.lazy(() => import("../pages/Contact"));
const About = React.lazy(() => import("../pages/About"));

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "blog", element: <Blog /> },
      { path: "blog/upload", element: <BlogUpload /> },
      { path: "feed/upload", element: <FeedUpload /> },
      { path: "profile", element: <Profile /> },
      { path: "hubs", element: <Hubs /> },
      { path: "hubs/:hubId", element: <Hub /> },
      { path: "institutions", element: <Institutions /> },
      { path: "institutions/:institutionId", element: <Institution /> },
      { path: "privacy", element: <Privacy /> },
      { path: "terms", element: <Terms /> },
      { path: "contact", element: <Contact /> },
      { path: "about", element: <About /> },
      { path: "*", element: <Home /> }, // Fallback to Home instead of NotFound
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { index: true, element: <Auth /> },
    ],
  },
];

export default routes;
