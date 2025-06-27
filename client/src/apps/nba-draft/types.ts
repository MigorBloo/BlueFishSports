export interface Prospect {
  id: string;
  rank: number;
  player: string;
  position: string;
  school: string;
  class: string;
}

export interface ExpertPick {
  id: string;
  expert: string;
  pick: number;
  logo_urls: string | null;
  team: string;
  player: string;
  position: string;
  trade: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSelection {
  id: string;
  userId: string;
  pick: number;
  team: string;
  player: string;
  position: string;
  trade: boolean;
  confirmed: boolean;
  is_locked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActualResult {
  id: string;
  pick: number;
  team: string;
  player: string;
  position: string;
  trade: boolean;
  points_scored: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url?: string;
  total_points: number;
  correct_selections: number;
  percentage_score: number;
  rank: number;
} 