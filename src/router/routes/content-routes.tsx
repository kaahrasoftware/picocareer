
import Blog from "@/pages/Blog";
import BlogUpload from "@/pages/BlogUpload";
import Event from "@/pages/Event";
import EventUpload from "@/pages/EventUpload";
import Video from "@/pages/Video";
import TokenShop from "@/pages/TokenShop";

export const contentRoutes = [
  {
    path: "blog",
    element: <Blog />,
  },
  {
    path: "blog/:id",
    element: <Blog />,
  },
  {
    path: "blog/upload",
    element: <BlogUpload />,
  },
  {
    path: "event",
    element: <Event />,
  },
  {
    path: "event/:id",
    element: <Event />,
  },
  {
    path: "event/upload",
    element: <EventUpload />,
  },
  {
    path: "video",
    element: <Video />,
  },
  {
    path: "token-shop",
    element: <TokenShop />,
  },
];
