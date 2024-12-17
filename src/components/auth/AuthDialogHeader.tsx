import React from "react";

interface AuthDialogHeaderProps {
  isSignUp: boolean;
}

export function AuthDialogHeader({ isSignUp }: AuthDialogHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <img
        src="/lovable-uploads/d815cd5f-d140-4520-87a1-3d7a6c17df4d.png"
        alt="PicoCareer Logo"
        className="w-12 h-12"
      />
      <h2 className="text-2xl font-bold">PicoCareer</h2>
      <p className="text-muted-foreground text-center">
        {isSignUp ? "Create your " : "Sign in to continue your journey"}
        {isSignUp && <span className="font-bold">mentee</span>}
        {isSignUp && " account"}
      </p>
    </div>
  );
}