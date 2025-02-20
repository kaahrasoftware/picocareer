
export interface AvailabilityRequest {
  id: string;
  mentor_id: string;
  mentee_id: string;
  created_at: string;
  status?: 'pending' | 'accepted' | 'rejected';
}
