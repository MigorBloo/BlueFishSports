import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Container,
  Chip,
  Avatar,
  AppBar,
  Toolbar
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import './LandingPage.css';

const getDaysTillLockNumber = (startDate: string) => {
  const today = new Date('2025-06-02T00:00:00');
  const start = new Date(startDate);
  const diffTime = start.getTime() - today.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const getTimeTillLock = (startDate: string, gameId?: string) => {
  // Use current date instead of hardcoded date
  const today = new Date();
  
  // Special handling for NBA Draft to match the NBA Draft app logic
  if (gameId === 'nba-draft') {
    // Use the same logic as NBA Draft app
    const lockDate = new Date('2025-06-26T20:00:00-04:00'); // 8:00 PM ET on June 26, 2025
    
    // Convert both times to ET using the proper timezone string
    const nowInET = new Date(today.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const lockDateInET = new Date(lockDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    
    const diff = lockDateInET.getTime() - nowInET.getTime();
    
    if (diff <= 0) {
      return { text: "Locked", color: "red" };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days >= 1) {
      return { text: `${days}d`, color: "green" };
    } else {
      return { text: `${hours}h ${minutes}m`, color: "red" };
    }
  }
  
  // Default logic for other games
  const start = new Date(startDate);
  const diffTime = start.getTime() - today.getTime();

  if (diffTime <= 0) {
    return { text: "Locked", color: "red" };
  }

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays > 0) {
    return { text: `${diffDays} days`, color: "green" };
  } else {
    return { text: `${diffHours} hours`, color: "red" };
  }
};

const getGameStatus = (startDate: string, endDate: string) => {
  const today = new Date('2025-06-02T00:00:00');
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (today < start) {
    return { status: 'Open', color: 'success' };
  } else if (today >= start && today <= end) {
    return { status: 'Running', color: 'primary' };
  } else {
    return { status: 'Finished', color: 'error' };
  }
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [pendingSport, setPendingSport] = useState<string>('All');
  const [pendingType, setPendingType] = useState<string>('All');
  const [pendingStatus, setPendingStatus] = useState<string>('All');

  const [sportFilter, setSportFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const games = [
    {
      id: 'nfl-draft',
      title: 'NFL Mock Draft 2025',
      description: 'Will the Titans take Cam Ward with the first pick or trade down? Will we see a record number of RBs taken in the first round? Compete in the NFL Mock Draft against experts and other fans to see who the true NFL Mock Draft King is!',
      image: '/assets/images/games/nfl-draft/NFLDraft.webp',
      path: '/nfl-draft',
      type: 'Single Event',
      startDate: 'April 25, 2025',
      endDate: 'April 25, 2025',
      duration: '1 day',
      sport: 'NFL'
    },
    {
      id: 'nba-draft',
      title: 'NBA Mock Draft 2025',
      description: 'Cooper Flagg at 1 is a given right? Or will there be a last minute trade or surprise. Compete in our NBA Mock Draft against experts and other fans to see who the true NBA Mock Draft King is!',
      image: '/assets/images/games/nba-draft/NBADraft.webp',
      path: '/nba-draft',
      type: 'Single Event',
      startDate: 'June 26, 2025',
      endDate: 'June 26, 2025',
      duration: '1 day',
      sport: 'NBA'
    },
    {
      id: 'tennis',
      title: 'Tennis 3&Done 2025',
      description: 'Will it be the year of The Sinner or will we see another player leading the ATP Rankings at the end of the season? Pick three players per Tournament, collect points based on their real life performances and see who the inaugural Tennis 3&Done points leader will be at the end of the season. Caveat: You can only select a player once so choose wisely!' ,
      image: '/assets/images/games/tennis/Tennis.webp',
      path: '/tennis',
      type: 'Season Long',
      startDate: 'June 30, 2025',
      endDate: 'September 7, 2025',
      duration: '3 months',
      sport: 'Tennis (ATP)'
    },
    {
      id: 'golf',
      title: 'Golf 1&Done 2026',
      description: 'Will Scottie Scheffler continue his dominance in 2026? Will one of the young Europeans take the next step? Select one golfer each week and earn $ based on their real life earnings to see who the Golf 1&Done earnings leader will be at the end of the season and take the crown. Caveat: You can only select a player once so choose wisely!',
      image: '/assets/images/games/golf/GolfGame.webp',
      path: '/golf',
      type: 'Season Long',
      startDate: 'February 5, 2026',
      endDate: 'August 30, 2026',
      duration: '6 months',
      sport: 'Golf (PGA)'
    }
  ];

  const sortedGames = [...games].sort((a, b) => {
    const aDays = getDaysTillLockNumber(a.startDate);
    const bDays = getDaysTillLockNumber(b.startDate);

    // Locked games go last
    if (aDays < 0 && bDays >= 0) return 1;
    if (bDays < 0 && aDays >= 0) return -1;
    // Otherwise, sort by soonest first
    return aDays - bDays;
  });

  const filteredGames = sortedGames.filter(game => {
    const { status } = getGameStatus(game.startDate, game.endDate);
    return (
      (sportFilter === 'All' || game.sport === sportFilter) &&
      (typeFilter === 'All' || game.type === typeFilter) &&
      (statusFilter === 'All' || status === statusFilter)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'success';
      case 'running':
        return 'primary';
      case 'past':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box className="landing-page">
      <AppBar position="static" className="nav-bar">
        <Toolbar className="nav-toolbar">
          <Box
            component="img"
            src="/assets/images/shared/BlueFish.webp"
            alt="BlueFish Logo"
            className="nav-logo"
          />
          
          <Box className="nav-welcome">
            <Typography 
              variant="h4"
              component="h1"
              className="nav-welcome-text"
            >
              Welcome{user ? `, ${user.username}` : ''}
            </Typography>
            {user && (
              <Avatar
                src={typeof user.profileLogo === 'string' ? user.profileLogo : undefined}
                alt={user.username}
                className="nav-avatar"
                onClick={() => navigate('/profile')}
                style={{ cursor: 'pointer' }}
              >
                {!user.profileLogo && user.username.charAt(0).toUpperCase()}
              </Avatar>
            )}
          </Box>

          <Button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="nav-logout-button"
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box className="content-container">
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <h2 className="games-heading">
            Available Games
          </h2>
          
          <Box className="filter-row" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, justifyContent: 'center' }}>
            <Box>
              <label>Sport:&nbsp;</label>
              <select value={pendingSport} onChange={e => setPendingSport(e.target.value)}>
                <option value="All">All</option>
                {Array.from(
                  games.map(g => g.sport).reduce<string[]>((acc, sport) => {
                    if (!acc.includes(sport)) acc.push(sport);
                    return acc;
                  }, [])
                ).map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </Box>
            <Box>
              <label>Type:&nbsp;</label>
              <select value={pendingType} onChange={e => setPendingType(e.target.value)}>
                <option value="All">All</option>
                {Array.from(
                  games.map(g => g.type).reduce<string[]>((acc, type) => {
                    if (!acc.includes(type)) acc.push(type);
                    return acc;
                  }, [])
                ).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </Box>
            <Box>
              <label>Status:&nbsp;</label>
              <select value={pendingStatus} onChange={e => setPendingStatus(e.target.value)}>
                <option value="All">All</option>
                <option value="Open">Open</option>
                <option value="Running">Running</option>
                <option value="Finished">Finished</option>
              </select>
            </Box>
            <Button
              variant="contained"
              color="primary"
              sx={{ ml: 2, height: '40px' }}
              onClick={() => {
                setSportFilter(pendingSport);
                setTypeFilter(pendingType);
                setStatusFilter(pendingStatus);
              }}
            >
              Let's go
            </Button>
          </Box>
          
          <Box className="games-container">
            {filteredGames.map((game) => (
              <Box key={game.id} className="game-card-wrapper">
                <Card className="game-card">
                  <CardMedia
                    component="img"
                    height="200"
                    image={game.image}
                    alt={game.title}
                  />
                  <CardContent>
                    <Box className="game-header">
                      <Typography gutterBottom variant="h5" component="h2">
                        {game.title}
                      </Typography>
                      {(() => {
                        const { status, color } = getGameStatus(game.startDate, game.endDate);
                        return (
                          <Chip 
                            label={status}
                            color={color as any}
                            size="small"
                            className="status-chip"
                          />
                        );
                      })()}
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {game.description}
                    </Typography>
                    <Box className="game-details">
                      <Box className="detail-item">
                        <Typography variant="caption" color="text.secondary">
                          Sport
                        </Typography>
                        <Typography variant="body2">
                          {game.sport}
                        </Typography>
                      </Box>
                      <Box className="detail-item">
                        <Typography variant="caption" color="text.secondary">
                          Type
                        </Typography>
                        <Typography variant="body2">
                          {game.type}
                        </Typography>
                      </Box>
                      <Box className="detail-item">
                        <Typography variant="caption" color="text.secondary">
                          Start Date
                        </Typography>
                        <Typography variant="body2">
                          {game.startDate}
                        </Typography>
                      </Box>
                      <Box className="detail-item">
                        <Typography variant="caption" color="text.secondary">
                          End Date
                        </Typography>
                        <Typography variant="body2">
                          {game.endDate}
                        </Typography>
                      </Box>
                      <Box className="detail-item">
                        <Typography variant="caption" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body2">
                          {game.duration}
                        </Typography>
                      </Box>
                      <Box className="detail-item">
                        <Typography variant="caption" color="text.secondary">
                          Time till Lock
                        </Typography>
                        {(() => {
                          const { text: timeTillLockText, color: timeTillLockColor } = getTimeTillLock(game.startDate, game.id);
                          return (
                            <Typography variant="body2" style={{ color: timeTillLockColor, fontWeight: 700 }}>
                              {timeTillLockText}
                            </Typography>
                          );
                        })()}
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => navigate(game.path)}
                    >
                      Play Now
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 