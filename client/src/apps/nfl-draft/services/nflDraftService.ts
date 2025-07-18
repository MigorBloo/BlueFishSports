import api from '../../../services/api';
import { Prospect, ExpertPick, UserSelection, ActualResult, LeaderboardEntry } from '../types';

const nflDraftService = {
  // Prospects
  async getTop200Prospects(): Promise<Prospect[]> {
    try {
      const response = await api.get('/api/nfl-draft/prospects');
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
        ? `/api/nfl-draft/expert-picks?expert=${expertName}`
        : '/api/nfl-draft/expert-picks';
      const response = await api.get(url);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  async getExpertNames(): Promise<string[]> {
    try {
      const response = await api.get('/api/nfl-draft/expert-picks/experts');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // User Selections
  async getUserSelections(userId: string): Promise<UserSelection[]> {
    try {
      const response = await api.get(`/api/nfl-draft/selections?userId=${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user selections:', error);
      throw error;
    }
  },

  async createUserSelection(selection: Partial<UserSelection>): Promise<UserSelection> {
    try {
      const response = await api.post('/api/nfl-draft/selections', selection);
      return response.data.data;
    } catch (error) {
      console.error('Error creating user selection:', error);
      throw error;
    }
  },

  async updateUserSelection(selection: Partial<UserSelection>): Promise<UserSelection> {
    try {
      const response = await api.put(`/api/nfl-draft/selections/${selection.id}`, selection);
      return response.data.data;
    } catch (error) {
      console.error('Error updating user selection:', error);
      throw error;
    }
  },

  async confirmUserSelection(selectionId: string): Promise<UserSelection> {
    try {
      const response = await api.post(`/api/nfl-draft/selections/${selectionId}/confirm`);
      return response.data.data;
    } catch (error) {
      console.error('Error confirming user selection:', error);
      throw error;
    }
  },

  async getUserSelectionsByUsername(username: string): Promise<UserSelection[]> {
    try {
      const response = await api.get(`/api/nfl-draft/selections?username=${username}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user selections by username:', error);
      throw error;
    }
  },

  // Teams
  async getTeams(): Promise<any[]> {
    try {
      const response = await api.get('/api/nfl-draft/teams');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },

  async getLockDate(): Promise<{ lockDate: string }> {
    try {
      const response = await api.get('/api/nfl-draft/lock-date');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching lock date:', error);
      throw error;
    }
  },

  // Actual Results
  async getActualResults(): Promise<ActualResult[]> {
    try {
      const response = await api.get('/api/nfl-draft/results');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching actual results:', error);
      throw error;
    }
  },

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const response = await api.get('/api/nfl-draft/leaderboard');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }
};

export default nflDraftService;