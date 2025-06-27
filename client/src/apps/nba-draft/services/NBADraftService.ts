import api from '../../../services/api';
import { Prospect, ExpertPick, UserSelection, ActualResult, LeaderboardEntry } from '../types';

const NBADraftService = {
  // Prospects
  async getTop200Prospects(): Promise<Prospect[]> {
    try {
      const response = await api.get('/api/nba-draft/prospects');
      return response.data.data.map((prospect: any) => ({
        id: prospect.id,
        rank: prospect.rank,
        player: prospect.player,
        position: prospect.position,
        school: prospect.school,
        class: prospect.class
      }));
    } catch (error) {
      throw error;
    }
  },

  // Expert Picks
  async getExpertPicks(expertName?: string): Promise<ExpertPick[]> {
    try {
      const url = expertName 
        ? `/api/nba-draft/expert-picks?expert=${expertName}`
        : '/api/nba-draft/expert-picks';
      const response = await api.get(url);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  async getExpertNames(): Promise<string[]> {
    try {
      const response = await api.get('/api/nba-draft/expert-picks/experts');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // User Selections
  async getUserSelections(userId: string): Promise<UserSelection[]> {
    try {
      const response = await api.get(`/api/nba-draft/user-selections/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user selections:', error);
      throw new Error('Failed to fetch user selections');
    }
  },

  async getUserSelectionsByUsername(username: string): Promise<UserSelection[]> {
    try {
      const response = await api.get(`/api/nba-draft/selections?username=${username}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user selections by username:', error);
      throw error;
    }
  },

  async createUserSelection(selection: Omit<UserSelection, 'id'>): Promise<UserSelection> {
    try {
      const response = await api.post('/api/nba-draft/selections', selection);
      return response.data.data;
    } catch (error) {
      console.error('Error creating user selection:', error);
      throw new Error('Failed to create user selection');
    }
  },

  async updateUserSelection(selection: UserSelection): Promise<UserSelection> {
    try {
      const response = await api.put(`/api/nba-draft/selections/${selection.id}`, selection);
      return response.data.data;
    } catch (error) {
      console.error('Error updating user selection:', error);
      throw new Error('Failed to update user selection');
    }
  },

  async confirmUserSelection(selectionId: string): Promise<UserSelection> {
    try {
      const response = await api.post(`/api/nba-draft/selections/${selectionId}/confirm`);
      return response.data.data;
    } catch (error) {
      console.error('Error confirming user selection:', error);
      throw error;
    }
  },

  // Teams
  async getTeams(): Promise<Array<{ id: string; team: string; original_pick_order: number }>> {
    try {
      const response = await api.get('/api/nba-draft/teams');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw new Error('Failed to fetch teams');
    }
  },

  async getLockDate(): Promise<{ lockDate: string }> {
    try {
      const response = await api.get('/api/nba-draft/lock-date');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching lock date:', error);
      throw error;
    }
  },

  // Actual Results
  async getActualResults(): Promise<ActualResult[]> {
    try {
      const response = await api.get('/api/nba-draft/results');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching actual results:', error);
      throw error;
    }
  },

  async updateActualResults(results: ActualResult[]): Promise<void> {
    try {
      await api.post('/api/nba-draft/results', { results });
    } catch (error) {
      console.error('Error updating actual results:', error);
      throw error;
    }
  },

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const response = await api.get('/api/nba-draft/leaderboard');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }
};

export default NBADraftService;