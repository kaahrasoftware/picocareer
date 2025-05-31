
import { OpportunityType } from "@/types/database/enums";

export function getOpportunityTypeStyles(type: OpportunityType | "all") {
  switch (type) {
    case "job":
      return { bg: "bg-blue-100", text: "text-blue-700" };
    case "internship":
      return { bg: "bg-green-100", text: "text-green-700" };
    case "scholarship":
      return { bg: "bg-purple-100", text: "text-purple-700" };
    case "fellowship":
      return { bg: "bg-indigo-100", text: "text-indigo-700" };
    case "grant":
      return { bg: "bg-yellow-100", text: "text-yellow-700" };
    case "competition":
      return { bg: "bg-red-100", text: "text-red-700" };
    case "event":
      return { bg: "bg-pink-100", text: "text-pink-700" };
    case "volunteer":
      return { bg: "bg-orange-100", text: "text-orange-700" };
    case "other":
      return { bg: "bg-gray-100", text: "text-gray-700" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-700" };
  }
}
