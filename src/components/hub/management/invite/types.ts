
import { MemberRole } from "@/types/database/hubs";

export interface EmailValidationResult {
  email: string;
  exists: boolean;
}

export interface InviteMemberFormProps {
  hubId: string;
}
