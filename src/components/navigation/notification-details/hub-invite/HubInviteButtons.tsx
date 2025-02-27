
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HubInviteButtonsProps {
  token: string;
}

export function HubInviteButtons({ token }: HubInviteButtonsProps) {
  const navigate = useNavigate();

  const handleResponse = (action: 'accept' | 'reject') => {
    // Navigate to the hub invite page with the token and intended action
    navigate(`/hub-invite?token=${token}&action=${action}`);
  };

  return (
    <div className="flex gap-2 mt-2">
      <Button
        variant="outline"
        size="sm"
        className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
        onClick={() => handleResponse('accept')}
      >
        <Check className="w-4 h-4 mr-2" />
        Accept
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
        onClick={() => handleResponse('reject')}
      >
        <X className="w-4 h-4 mr-2" />
        Reject
      </Button>
    </div>
  );
}

