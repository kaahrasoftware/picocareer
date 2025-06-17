import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

interface MentorTabsSectionProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MentorTabsSection = ({ activeTab, onTabChange }: MentorTabsSectionProps) => {
  // State to manage active tab
  const [selectedTab, setSelectedTab] = useState(activeTab || "browse");

  // Function to handle tab change
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    onTabChange(tab); // Notify parent component about the tab change
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex space-x-4">
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none transition-colors ${
            selectedTab === "browse"
              ? "bg-primary text-primary-foreground hover:bg-primary/80"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
          onClick={() => handleTabChange("browse")}
        >
          Browse Mentors
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none transition-colors ${
            selectedTab === "my-network"
              ? "bg-primary text-primary-foreground hover:bg-primary/80"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
          onClick={() => handleTabChange("my-network")}
        >
          My Network
        </button>
      </div>
      
      {/* Content sections */}
      {selectedTab === "browse" && (
        <div className="p-4 rounded-md">
          {/* Browse Mentors Content */}
          <p className="text-sm text-muted-foreground">
            Explore a wide range of mentors and find the perfect match for your needs.
          </p>
        </div>
      )}

      {selectedTab === "my-network" && (
        <div className="p-4 rounded-md">
          {/* My Network Content */}
          <p className="text-sm text-muted-foreground">
            View and manage your network of mentors.
          </p>
        </div>
      )}
      
      {/* Updated button with "Start Mentoring Today" styling */}
      <div className="text-center mt-8">
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="w-full sm:w-auto bg-white hover:bg-gray-100 text-picocareer-dark font-semibold text-lg py-6 px-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <Link to="/mentor" className="flex items-center justify-center gap-3 focus:outline-none">
            <GraduationCap className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
            Start Your Mentoring Journey
          </Link>
        </Button>
      </div>
    </div>
  );
};
