// Backend-aligned types for Jira Lite

export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum Status {
  BACKLOG = 'BACKLOG',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}

export enum TeamRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  profile_image?: string;
  is_oauth: boolean;
  created_at: string;
}

// For display purposes (avatar URL generation)
export interface UserDisplay extends User {
  avatar: string;
}

// Team types
export interface TeamMember {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  role: TeamRole;
  joined_at: string;
}

export interface Team {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
}

export interface TeamDetail extends Team {
  members: TeamMember[];
}

// Project types
export interface Project {
  id: number;
  name: string;
  description?: string;
  team_id: number;
  owner_id: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  issue_count?: number;
  is_favorited?: boolean;
}

// Issue Label types
export interface IssueLabel {
  id: number;
  name: string;
  color: string;
  project_id: number;
}

// Subtask types
export interface Subtask {
  id: number;
  issue_id: number;
  title: string;
  is_completed: boolean;
  position: number;
  created_at: string;
}

// Comment types
export interface Comment {
  id: number;
  issue_id: number;
  author_id: number;
  author_name?: string;
  content: string;
  created_at: string;
}

// Issue types
export interface Issue {
  id: number;
  project_id: number;
  creator_id: number;
  title: string;
  description?: string;
  status: Status | string;
  priority: Priority;
  assignee_id?: number;
  assignee_name?: string;
  creator_name?: string;
  due_date?: string;
  position: number;
  created_at: string;
  updated_at: string;
  labels: IssueLabel[];
  subtasks: Subtask[];
}

// Issue create/update payloads 
export interface IssueCreatePayload {
  title: string;
  description?: string;
  project_id: number;
  assignee_id?: number;
  due_date?: string;
  priority?: Priority;
  label_ids?: number[];
}

export interface IssueUpdatePayload {
  title?: string;
  description?: string;
  assignee_id?: number | null;
  due_date?: string | null;
  status?: string;
  priority?: Priority;
  label_ids?: number[];
}

// Notification types
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  content: string;
  is_read: boolean;
  issue_id?: number;
  created_at: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

// API Response wrapper
export interface ApiError {
  detail: string;
}