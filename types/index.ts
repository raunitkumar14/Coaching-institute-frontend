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
  | 'transcribing'
  | 'transcribed'
  | 'summarizing'
  | 'completed'
  | 'error';

export interface ConversationSummary {
  executive_summary: string;
  student_interests: string[];
  concerns: string[];
  follow_up_actions: string[];
}

export interface Conversation {
  id: string;
  counselor_id: string;
  student_name: string;
  student_phone: string;
  student_email: string;
  audio_s3_key: string;
  duration_seconds: number;
  status: StatusEnum;
  transcript: string;
  summary: ConversationSummary;
  created_at: string;
  completed_at: string | null;
}
