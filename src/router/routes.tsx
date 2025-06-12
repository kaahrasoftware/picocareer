import { Home } from "@/pages/Home";
import { Profile } from "@/pages/Profile";
import { Pricing } from "@/pages/Pricing";
import { Contact } from "@/pages/Contact";
import { Terms } from "@/pages/Terms";
import { Privacy } from "@/pages/Privacy";
import { NotFound } from "@/pages/NotFound";
import { Auth } from "@/pages/Auth";
import { Events } from "@/pages/Events";
import { EventDetails } from "@/pages/EventDetails";
import { Resources } from "@/pages/Resources";
import { ResourceDetails } from "@/pages/ResourceDetails";
import { Hub } from "@/pages/Hub";
import { Admin } from "@/pages/Admin";
import { MentorDashboard } from "@/pages/MentorDashboard";
import { MentorProfile } from "@/pages/MentorProfile";
import { Mentors } from "@/pages/Mentors";
import { MentorDetails } from "@/pages/MentorDetails";
import { TokenShop } from "@/pages/TokenShop";
import { SessionBooking } from "@/pages/SessionBooking";
import { SessionDetails } from "@/pages/SessionDetails";
import { Community } from "@/pages/Community";
import { CommunityPost } from "@/pages/CommunityPost";
import { CommunityCreate } from "@/pages/CommunityCreate";
import { CommunityCategory } from "@/pages/CommunityCategory";
import { Feed } from "@/pages/Feed";
import { TokenDeductionTest } from "@/pages/TokenDeductionTest";

export const router = {
  routes: [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/pricing",
      element: <Pricing />,
    },
    {
      path: "/contact",
      element: <Contact />,
    },
    {
      path: "/terms",
      element: <Terms />,
    },
    {
      path: "/privacy",
      element: <Privacy />,
    },
    {
      path: "/auth",
      element: <Auth />,
    },
    {
      path: "/events",
      element: <Events />,
    },
    {
      path: "/events/:id",
      element: <EventDetails />,
    },
    {
      path: "/resources",
      element: <Resources />,
    },
    {
      path: "/resources/:id",
      element: <ResourceDetails />,
    },
    {
      path: "/hub",
      element: <Hub />,
    },
    {
      path: "/admin",
      element: <Admin />,
    },
    {
      path: "/mentor-dashboard",
      element: <MentorDashboard />,
    },
    {
      path: "/mentor-profile",
      element: <MentorProfile />,
    },
    {
      path: "/mentors",
      element: <Mentors />,
    },
    {
      path: "/mentors/:id",
      element: <MentorDetails />,
    },
    {
      path: "/token-shop",
      element: <TokenShop />,
    },
    {
      path: "/session-booking",
      element: <SessionBooking />,
    },
    {
      path: "/sessions/:id",
      element: <SessionDetails />,
    },
    {
      path: "/community",
      element: <Community />,
    },
    {
      path: "/community/post/:id",
      element: <CommunityPost />,
    },
    {
      path: "/community/create",
      element: <CommunityCreate />,
    },
    {
      path: "/community/category/:id",
      element: <CommunityCategory />,
    },
    {
      path: "/feed",
      element: <Feed />,
    },
    {
      path: "/debug/token-deduction",
      element: <TokenDeductionTest />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ],
};
