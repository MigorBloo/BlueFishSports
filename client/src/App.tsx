import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from './contexts/AuthContext';
import { TotalPointsProvider } from './apps/nfl-draft/contexts/TotalPointsContext';
import theme from './apps/nfl-draft/theme';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import LeaderboardPage from './apps/nfl-draft/pages/LeaderboardPage/LeaderboardPage';
import ActualResultsPage from './apps/nfl-draft/pages/ActualResultsPage/ActualResultsPage';
import UserSelectionsPage from './apps/nfl-draft/pages/UserSelectionsPage/UserSelectionsPage';
import Welcome from './apps/nfl-draft/pages/WelcomePage/WelcomePage';
import TennisWelcome from './apps/tennis/pages/Welcome/Welcome';
import TennisScoring from './apps/tennis/pages/Scoring/Scoring';
import ExpertPicksPage from './apps/nfl-draft/pages/ExpertPicksPage/ExpertPicksPage';
import UserProfilePage from './apps/nfl-draft/pages/UserProfilePage/UserProfilePage';
import Scoring from './apps/nfl-draft/pages/ScoringPage/ScoringPage';
import { useAuth } from './contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import Tournament from './apps/tennis/pages/Tournament/Tournament';
import PlayerPool from './apps/tennis/pages/PlayerPool/PlayerPool';
import YourPicks from './apps/tennis/pages/YourPicks/YourPicks';
import Results from './apps/tennis/pages/Results/Results';
import Leaderboard from './apps/tennis/pages/Leaderboard/Leaderboard';
import UserResults from './apps/tennis/pages/UserResults/UserResults';
import TennisUserProfilePage from './apps/tennis/pages/UserProfilePage/UserProfilePage';

// NBA Draft imports
import NBALeaderboardPage from './apps/nba-draft/pages/LeaderboardPage/LeaderboardPage';
import NBAActualResultsPage from './apps/nba-draft/pages/ActualResultsPage/ActualResultsPage';
import { UserSelectionsPage as NBAUserSelectionsPage } from './apps/nba-draft/pages/UserSelectionsPage/UserSelectionsPage';
import NBAWelcome from './apps/nba-draft/pages/WelcomePage/WelcomePage';
import NBAExpertPicksPage from './apps/nba-draft/pages/ExpertPicksPage/ExpertPicksPage';
import NBAUserProfilePage from './apps/nba-draft/pages/UserProfilePage/UserProfilePage';
import NBAScoring from './apps/nba-draft/pages/ScoringPage/ScoringPage';

import UserProfile from './pages/UserProfile';
import ResetPassword from './components/ResetPassword';
import EmailVerification from './components/EmailVerification';

// Admin imports
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './components/AdminDashboard';

// Root Route component
const RootRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return <Navigate to={user ? "/landing" : "/login"} replace />;
};

// Protected Route component
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return element;
};

// Auth Event Handler component
const AuthEventHandler: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleAuthLogout = (event: CustomEvent) => {
      navigate(event.detail.redirect || '/login');
    };

    window.addEventListener('auth:logout', handleAuthLogout as EventListener);
    
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout as EventListener);
    };
  }, [navigate]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <TotalPointsProvider>
            <AuthEventHandler />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<EmailVerification />} />

              {/* Landing Page */}
              <Route path="/landing" element={<ProtectedRoute element={<LandingPage />} />} />
              
              {/* Protected Routes */}
              <Route path="/nfl-draft" element={<ProtectedRoute element={<Welcome />} />} />
              <Route path="/nfl-draft/welcome" element={<ProtectedRoute element={<Welcome />} />} />
              <Route path="/nfl-draft/scoring" element={<ProtectedRoute element={<Scoring />} />} />
              <Route path="/nfl-draft/prospects" element={<ProtectedRoute element={<ExpertPicksPage />} />} />
              <Route path="/nfl-draft/selections" element={<ProtectedRoute element={<UserSelectionsPage />} />} />
              <Route path="/nfl-draft/results" element={<ProtectedRoute element={<ActualResultsPage />} />} />
              <Route path="/nfl-draft/results/:username" element={<ProtectedRoute element={<ActualResultsPage />} />} />
              <Route path="/nfl-draft/leaderboard" element={<ProtectedRoute element={<LeaderboardPage />} />} />
              
              {/* NBA Draft Routes */}
              <Route path="/nba-draft" element={<ProtectedRoute element={<NBAWelcome />} />} />
              <Route path="/nba-draft/welcome" element={<ProtectedRoute element={<NBAWelcome />} />} />
              <Route path="/nba-draft/scoring" element={<ProtectedRoute element={<NBAScoring />} />} />
              <Route path="/nba-draft/prospects" element={<ProtectedRoute element={<NBAExpertPicksPage />} />} />
              <Route path="/nba-draft/selections" element={<ProtectedRoute element={<NBAUserSelectionsPage />} />} />
              <Route path="/nba-draft/results" element={<ProtectedRoute element={<NBAActualResultsPage />} />} />
              <Route path="/nba-draft/results/:username" element={<ProtectedRoute element={<NBAActualResultsPage />} />} />
              <Route path="/nba-draft/leaderboard" element={<ProtectedRoute element={<NBALeaderboardPage />} />} />
              
              {/* Tennis Routes */}
              <Route path="/tennis" element={<ProtectedRoute element={<TennisWelcome />} />} />
              <Route path="/tennis/welcome" element={<ProtectedRoute element={<TennisWelcome />} />} />
              <Route path="/tennis/scoring" element={<ProtectedRoute element={<TennisScoring />} />} />
              <Route path="/tennis/tournaments" element={<ProtectedRoute element={<Tournament />} />} />
              <Route path="/tennis/player-pool" element={<ProtectedRoute element={<PlayerPool />} />} />
              <Route path="/tennis/selections" element={<ProtectedRoute element={<YourPicks />} />} />
              <Route path="/tennis/results" element={<ProtectedRoute element={<Results />} />} />
              <Route path="/tennis/leaderboard" element={<ProtectedRoute element={<Leaderboard />} />} />
              <Route path="/tennis/user-results/:username" element={<ProtectedRoute element={<UserResults />} />} />
              
              {/* Unified User Profile Route */}
              <Route path="/profile" element={<ProtectedRoute element={<UserProfile />} />} />
              
              {/* Root route */}
              <Route path="/" element={<RootRoute />} />

              {/* Results routes */}
              <Route path="/results/:user_id" element={<Results />} />
              <Route path="/results" element={<Results />} />

              {/* Admin routes */}
              <Route path="/admin/dashboard" element={<AdminRoute element={<AdminDashboard />} />} />
            </Routes>
          </TotalPointsProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
