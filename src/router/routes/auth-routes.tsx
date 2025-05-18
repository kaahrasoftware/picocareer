
import Auth from "@/pages/Auth";
import EmailConfirmation from "@/pages/EmailConfirmation";
import PasswordReset from "@/pages/PasswordReset";

export const authRoutes = [
  {
    path: "auth",
    element: <Auth />,
  },
  {
    path: "email-confirmation",
    element: <EmailConfirmation />,
  },
  {
    path: "password-reset",
    element: <PasswordReset />,
  },
];
