
import type { HubMemberRole } from "@/types/database/hubs";

export interface HubInvite {
  id: string;
  hub_id: string;
  invited_email: string;
  token: string;
  role: HubMemberRole;
  status: 'pending' | 'accepted' | 'rejected';
  expires_at: string;
  created_at: string;
  updated_at: string;
  accepted_at?: string | null;
  rejected_at?: string | null;
}

export interface Hub {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
}

export interface UseHubInvitationReturn {
  isLoading: boolean;
  isProcessing: boolean;
  invitation: HubInvite | null;
  hub: Hub | null;
  error: string | null;
  showSuccessDialog: boolean;
  setShowSuccessDialog: (show: boolean) => void;
  handleAccept: () => Promise<void>;
  handleDecline: () => Promise<void>;
}
