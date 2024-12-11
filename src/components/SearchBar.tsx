import React from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchBar = ({ className, ...props }: SearchBarProps) => {
  return (
    <div className="relative flex items-center w-full max-w-3xl mx-auto">
      <input
        type="search"
        className="w-full h-12 pl-6 pr-24 rounded-full bg-white/95 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        {...props}
      />
      <Button 
        type="submit"
        className="absolute right-1 h-10 px-6 rounded-full bg-background hover:bg-background/90 text-foreground"
      >
        search
      </Button>
    </div>
  );
};