
import School from "@/pages/School";
import Schools from "@/pages/Schools";
import MajorUpload from "@/pages/MajorUpload";
import Program from "@/pages/Program";

export const educationRoutes = [
  {
    path: "school",
    element: <School />,
  },
  {
    path: "schools",
    element: <Schools />,
  },
  {
    path: "major/upload",
    element: <MajorUpload />,
  },
  {
    path: "program",
    element: <Program />,
  },
  {
    path: "program/:id",
    element: <Program />,
  },
];
