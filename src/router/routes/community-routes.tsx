
import Hubs from "@/pages/Hubs";
import Hub from "@/pages/Hub";
import HubInviteResponse from "@/pages/HubInviteResponse";
import Institutions from "@/pages/Institutions";
import Institution from "@/pages/Institution";

export const communityRoutes = [
  {
    path: "hubs",
    element: <Hubs />,
  },
  {
    path: "hubs/:id",
    element: <Hub />,
  },
  {
    path: "hub-invite/response",
    element: <HubInviteResponse />,
  },
  {
    path: "institutions",
    element: <Institutions />,
  },
  {
    path: "institutions/:id",
    element: <Institution />,
  },
];
