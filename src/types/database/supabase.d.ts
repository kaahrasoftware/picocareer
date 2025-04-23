
import { Database } from './database.types'

type Tables = Database['public']['Tables']

export type AvailabilityRequest = {
  id: string
  mentor_id: string
  mentee_id: string
  created_at: string
  status: 'pending' | 'accepted' | 'rejected'
}

declare global {
  type TablesInsert = {
    [TableName in keyof Tables]: Tables[TableName]['Insert']
  }
  type TablesRow = {
    [TableName in keyof Tables]: Tables[TableName]['Row']
  }
  type TablesUpdate = {
    [TableName in keyof Tables]: Tables[TableName]['Update']
  }
}

// Add new table types
export type DbTables = {
  availability_requests: AvailabilityRequest;
  mentor_sessions: {
    id: string;
    mentor_id: string;
    mentee_id: string;
    session_type_id: string;
    scheduled_at: string;
    status: string;
    notes?: string;
    meeting_platform?: string;
    mentee_phone_number?: string;
    mentee_telegram_username?: string;
    created_at: string;
    updated_at: string;
  };
  mentor_session_types: {
    id: string;
    profile_id: string;
    type: string;
    duration: number;
    price: number;
    token_cost: number;
    description?: string;
    custom_type_name?: string;
    meeting_platform?: string[];
    telegram_username?: string;
    phone_number?: string;
    created_at: string;
    updated_at: string;
  };
  email_campaigns: {
    id: string;
    admin_id: string;
    subject: string;
    body?: string;
    content_type: string;
    content_id: string;
    content_ids?: string[];
    scheduled_for: string;
    frequency: string;
    status: string;
    recipient_type: string;
    recipient_filter?: any;
    sent_at?: string;
    sent_count: number;
    failed_count: number;
    recipients_count: number;
    created_at: string;
    updated_at: string;
    last_error?: string;
    last_checked_at?: string;
  };
  email_campaign_recipients: {
    id: string;
    campaign_id: string;
    profile_id: string;
    email_subscription_id?: string;
    created_at: string;
  };
} & Tables
