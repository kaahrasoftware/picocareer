
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { WalletDialog } from "./WalletDialog";
import { cn } from "@/lib/utils";

interface WalletButtonProps {
  className?: string;
  showBalance?: boolean;
}

export function WalletButton({ className, showBalance = true }: WalletButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { balance, isLoading } = useWalletBalance();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsDialogOpen(true)}
        className={cn("relative", className)}
        aria-label="Open wallet"
      >
        <Wallet className="h-5 w-5" />
        {showBalance && !isLoading && balance > 0 && (
          <Badge 
            variant="secondary" 
            className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-xs bg-primary text-primary-foreground"
          >
            {balance > 99 ? '99+' : balance}
          </Badge>
        )}
      </Button>

      <WalletDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </>
  );
}
