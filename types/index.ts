export type UserRole = 'counselor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type StatusEnum =
  | 'recording'
  | 'uploading'
  | 'uploaded'
  | 'error';

export interface Conversation {
  id: string;
  counselor_id: string;
  lead_id: string;
  student_name: string;
  student_phone: string;
  audio_s3_key: string;
  duration_seconds: number;
  status: StatusEnum;
  created_at: string;
  completed_at: string | null;
}
