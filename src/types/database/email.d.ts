
export interface Campaign {
  id: string;
  admin_id: string;
  subject?: string;
  body?: string;
  content_type: string;
  content_id: string;
  content_ids?: string[];
  recipient_type: string;
  recipient_filter?: {
    profile_ids?: string[];
    [key: string]: any;
  };
  scheduled_for?: string;
  last_sent?: string;
  frequency: string;
  status: "planned" | "pending" | "sending" | "sent" | "failed" | "partial";
  sent_count: number;
  failed_count: number;
  recipients_count: number;
  sent_at?: string;
  created_at: string;
  updated_at: string;
  last_error?: string;
  last_checked_at?: string;
}

export interface EmailSubscription {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}
