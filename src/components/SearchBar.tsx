import React from "react";
import { Input } from "@/components/ui/input";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchBar = ({ className, ...props }: SearchBarProps) => {
  return (
    <div className="relative">
      <Input
        type="search"
        className={className}
        {...props}
      />
    </div>
  );
};