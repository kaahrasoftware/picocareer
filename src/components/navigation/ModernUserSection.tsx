
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { useMarkNotificationRead } from "@/hooks/useMarkNotificationRead";
import { NotificationPanel } from "./NotificationPanel";
import { UserMenu } from "./UserMenu";
import { WalletButton } from "@/components/wallet/WalletButton";
import { useBreakpoints } from "@/hooks/useBreakpoints";
import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ModernUserSection() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { data: notifications = [] } = useNotifications(session);
  const markNotificationRead = useMarkNotificationRead();
  const { isMobile } = useBreakpoints();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Wallet Button */}
      <WalletButton showBalance={!isMobile} />

      {/* Notifications Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative h-8 w-8 p-0"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

        <NotificationPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      </div>

      {/* User Menu */}
      {profile && <UserMenu />}
    </div>
  );
}
