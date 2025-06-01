
import { OpportunityType } from "@/types/database/enums";
import { format, parseISO } from "date-fns";

export function getOpportunityTypeStyles(type: OpportunityType | "all") {
  switch (type) {
    case "job":
      return { 
        bg: "bg-blue-100", 
        text: "text-blue-700",
        border: "border-blue-200",
        hoverBg: "hover:bg-blue-200"
      };
    case "internship":
      return { 
        bg: "bg-green-100", 
        text: "text-green-700",
        border: "border-green-200",
        hoverBg: "hover:bg-green-200"
      };
    case "scholarship":
      return { 
        bg: "bg-purple-100", 
        text: "text-purple-700",
        border: "border-purple-200",
        hoverBg: "hover:bg-purple-200"
      };
    case "fellowship":
      return { 
        bg: "bg-indigo-100", 
        text: "text-indigo-700",
        border: "border-indigo-200",
        hoverBg: "hover:bg-indigo-200"
      };
    case "grant":
      return { 
        bg: "bg-yellow-100", 
        text: "text-yellow-700",
        border: "border-yellow-200",
        hoverBg: "hover:bg-yellow-200"
      };
    case "competition":
      return { 
        bg: "bg-red-100", 
        text: "text-red-700",
        border: "border-red-200",
        hoverBg: "hover:bg-red-200"
      };
    case "event":
      return { 
        bg: "bg-pink-100", 
        text: "text-pink-700",
        border: "border-pink-200",
        hoverBg: "hover:bg-pink-200"
      };
    case "volunteer":
      return { 
        bg: "bg-orange-100", 
        text: "text-orange-700",
        border: "border-orange-200",
        hoverBg: "hover:bg-orange-200"
      };
    case "other":
      return { 
        bg: "bg-gray-100", 
        text: "text-gray-700",
        border: "border-gray-200",
        hoverBg: "hover:bg-gray-200"
      };
    default:
      return { 
        bg: "bg-gray-100", 
        text: "text-gray-700",
        border: "border-gray-200",
        hoverBg: "hover:bg-gray-200"
      };
  }
}

export function formatOpportunityDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "MMM d, yyyy");
  } catch (error) {
    return dateString;
  }
}
