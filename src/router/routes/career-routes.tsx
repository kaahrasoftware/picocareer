
import Career from "@/pages/Career";
import CareerChat from "@/pages/CareerChat";
import CareerUpload from "@/pages/CareerUpload";
import Mentor from "@/pages/Mentor";
import MentorRegistration from "@/pages/MentorRegistration";
import PersonalityTest from "@/pages/PersonalityTest";

export const careerRoutes = [
  {
    path: "career",
    element: <Career />,
  },
  {
    path: "career/:id",
    element: <Career />,
  },
  {
    path: "career-chat",
    element: <CareerChat />,
  },
  {
    path: "mentor",
    element: <Mentor />,
  },
  {
    path: "mentor/:id",
    element: <Mentor />,
  },
  {
    path: "career/upload",
    element: <CareerUpload />,
  },
  {
    path: "mentor-registration",
    element: <MentorRegistration />,
  },
  {
    path: "personality-test",
    element: <PersonalityTest />,
  },
];
