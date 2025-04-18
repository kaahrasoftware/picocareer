
/**
 * Utility functions for opportunity-related components
 */

import { OpportunityType } from "@/types/database/enums";

/**
 * Returns tailwind classes for styling based on opportunity type
 */
export const getOpportunityTypeStyles = (type: OpportunityType | "all"): {
  bg: string;
  text: string;
  border: string;
  hoverBg: string;
} => {
  switch (type) {
    case "job":
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
        hoverBg: "hover:bg-blue-200",
      };
    case "internship":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        border: "border-emerald-200",
        hoverBg: "hover:bg-emerald-200",
      };
    case "scholarship":
      return {
        bg: "bg-purple-100",
        text: "text-purple-800",
        border: "border-purple-200",
        hoverBg: "hover:bg-purple-200",
      };
    case "fellowship":
      return {
        bg: "bg-indigo-100",
        text: "text-indigo-800",
        border: "border-indigo-200",
        hoverBg: "hover:bg-indigo-200",
      };
    case "grant":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
        hoverBg: "hover:bg-yellow-200",
      };
    case "competition":
      return {
        bg: "bg-orange-100",
        text: "text-orange-800",
        border: "border-orange-200",
        hoverBg: "hover:bg-orange-200",
      };
    case "volunteer":
      return {
        bg: "bg-teal-100",
        text: "text-teal-800",
        border: "border-teal-200",
        hoverBg: "hover:bg-teal-200",
      };
    case "event":
      return {
        bg: "bg-rose-100",
        text: "text-rose-800",
        border: "border-rose-200",
        hoverBg: "hover:bg-rose-200",
      };
    case "other":
    case "all":
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-200",
        hoverBg: "hover:bg-gray-200",
      };
  }
};

/**
 * Format date in a human-readable way
 */
export const formatOpportunityDate = (dateString: string | null) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  const today = new Date();
  
  // If date is today
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  
  // Format the date
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  };
  
  return date.toLocaleDateString('en-US', options);
};

