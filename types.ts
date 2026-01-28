export interface Task {
  id: string;
  title: string;
  goal: number;
  completed: number;
  unit: string;
  startTime: string; // ISO String
  lastUpdated: string; // ISO String
}

export interface HistoryLog {
  date: string;
  tasks: Task[];
  completionRate: number;
  summary?: string; // AI Summary of the day
}

export interface UserProfile {
  name: string;
  isLoggedIn: boolean;
  onboarded: boolean;
  preferences: {
    theme: 'light' | 'dark';
    voice: 'female' | 'male';
    notifications: boolean;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export const INSTAGRAM_LINK = "https://www.instagram.com/pranto_raman?igsh=MXJ1ZGoxeDZoZmoyeA==";
export const APP_NAME = "Elevate1401";
export const AI_NAME = "Pranto AI";
export const CREATOR_NAME = "Pranto Rahman";
