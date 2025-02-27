
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import type { HandleInviteFunction } from "./types";

interface HubInviteButtonsProps {
  onAccept: HandleInviteFunction;
  onReject: HandleInviteFunction;
  isLoading: boolean;
}

export function HubInviteButtons({ onAccept, onReject, isLoading }: HubInviteButtonsProps) {
  return (
    <div className="flex gap-2 mt-2">
      <Button
        variant="outline"
        size="sm"
        className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
        onClick={onAccept}
        disabled={isLoading}
      >
        <Check className="w-4 h-4 mr-2" />
        Accept
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
        onClick={onReject}
        disabled={isLoading}
      >
        <X className="w-4 h-4 mr-2" />
        Reject
      </Button>
    </div>
  );
}
