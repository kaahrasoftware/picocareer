import { Home, BookOpen, GraduationCap, Users, MessageSquare } from "lucide-react";

export const navigationItems = [
  {
    label: "Home",
    href: "/",
    icon: <Home className="w-4 h-4" />,
  },
  {
    label: "Careers",
    href: "/careers",
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    label: "Majors",
    href: "/majors",
    icon: <GraduationCap className="w-4 h-4" />,
  },
  {
    label: "Mentors",
    href: "/mentors",
    icon: <Users className="w-4 h-4" />,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: <MessageSquare className="w-4 h-4" />,
  },
];