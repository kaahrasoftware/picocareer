import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check initial theme
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add("dark");
      toast({
        description: "Dark theme activated",
      });
    } else {
      document.documentElement.classList.remove("dark");
      toast({
        description: "Light theme activated",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="fixed top-4 right-4 z-50"
      onClick={toggleTheme}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-slate-900" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}