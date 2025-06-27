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

export interface Prospect {
    id: number;
    player: string;
    position: string;
    school: string;
    height: string;
    weight: number;
    age: number;
    rank: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ExpertPick {
    id: number;
    expertName: string;
    pick: number;
    team: string;
    player: string;
    position: string;
    createdAt: string;
    updatedAt: string;
}

export interface ActualResult {
    id: number;
    pick: number;
    team: string;
    player: string;
    position: string;
    createdAt: string;
    updatedAt: string;
}

export interface LeaderboardEntry {
    userId: number;
    username: string;
    score: number;
    correctPicks: number;
    totalPicks: number;
    createdAt: string;
    updatedAt: string;
} 