import React from "react";
import { RouteObject } from "react-router-dom";
import { MainLayout, AuthLayout } from "./layouts";

// Lazy load all pages
const Home = React.lazy(() => import("../pages/Index"));
const Blog = React.lazy(() => import("../pages/Blog"));
const BlogUpload = React.lazy(() => import("../pages/BlogUpload"));
const FeedUpload = React.lazy(() => import("../pages/FeedUpload"));
const ProfilePage = React.lazy(() => import("../pages/ProfilePage"));
const Auth = React.lazy(() => import("../pages/Auth"));
const Hub = React.lazy(() => import("../pages/Hub"));
const Hubs = React.lazy(() => import("../pages/Hubs"));
const HubSettings = React.lazy(() => import("../pages/HubSettings"));
const CreateHub = React.lazy(() => import("../pages/CreateHub"));
const School = React.lazy(() => import("../pages/School"));
const Schools = React.lazy(() => import("../pages/Schools"));
const CreateSchool = React.lazy(() => import("../pages/CreateSchool"));
const Institution = React.lazy(() => import("../pages/Institution"));
const Institutions = React.lazy(() => import("../pages/Institutions"));
const CreateInstitution = React.lazy(() => import("../pages/CreateInstitution"));
const NotificationsPage = React.lazy(() => import("../pages/NotificationsPage"));
const Mentors = React.lazy(() => import("../pages/Mentors"));
const BookSession = React.lazy(() => import("../pages/BookSession"));
const SessionConfirmation = React.lazy(() => import("../pages/SessionConfirmation"));
const SessionDetails = React.lazy(() => import("../pages/SessionDetails"));
const Sessions = React.lazy(() => import("../pages/Sessions"));
const Admin = React.lazy(() => import("../pages/Admin"));
const Privacy = React.lazy(() => import("../pages/Privacy"));
const Terms = React.lazy(() => import("../pages/Terms"));
const Contact = React.lazy(() => import("../pages/Contact"));
const About = React.lazy(() => import("../pages/About"));
const NotFound = React.lazy(() => import("../pages/NotFound"));

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "blog", element: <Blog /> },
      { path: "blog/upload", element: <BlogUpload /> },
      { path: "feed/upload", element: <FeedUpload /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "hubs", element: <Hubs /> },
      { path: "hubs/:hubId", element: <Hub /> },
      { path: "hubs/:hubId/settings", element: <HubSettings /> },
      { path: "create-hub", element: <CreateHub /> },
      { path: "schools", element: <Schools /> },
      { path: "schools/:schoolId", element: <School /> },
      { path: "create-school", element: <CreateSchool /> },
      { path: "institutions", element: <Institutions /> },
      { path: "institutions/:institutionId", element: <Institution /> },
      { path: "create-institution", element: <CreateInstitution /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "mentors", element: <Mentors /> },
      { path: "book/:mentorId", element: <BookSession /> },
      { path: "book/:mentorId/confirm", element: <SessionConfirmation /> },
      { path: "sessions/:sessionId", element: <SessionDetails /> },
      { path: "sessions", element: <Sessions /> },
      { path: "admin", element: <Admin /> },
      { path: "privacy", element: <Privacy /> },
      { path: "terms", element: <Terms /> },
      { path: "contact", element: <Contact /> },
      { path: "about", element: <About /> },
      { path: "*", element: <NotFound /> },
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
