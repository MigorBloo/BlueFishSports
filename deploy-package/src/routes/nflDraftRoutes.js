const express = require('express');
const router = express.Router();
const nflDraftController = require('../controllers/nflDraftController');
const { authenticateUser } = require('../middleware/auth');

// Welcome route
router.get('/welcome', authenticateUser, nflDraftController.getWelcomeMessage);

// Prospects routes (ExpertPicksPage)
router.get('/prospects', authenticateUser, nflDraftController.getTop200Prospects);

// Expert picks routes
router.get('/expert-picks', authenticateUser, nflDraftController.getExpertPicks);
router.get('/expert-picks/experts', authenticateUser, nflDraftController.getExpertNames);

// User selections routes (UserSelectionsPage)
router.get('/selections', authenticateUser, nflDraftController.getUserSelections);
router.post('/selections', authenticateUser, nflDraftController.createUserSelection);
router.put('/selections/:id', authenticateUser, nflDraftController.updateUserSelection);
router.post('/selections/:id/confirm', authenticateUser, nflDraftController.confirmUserSelection);

// Teams routes
router.get('/teams', authenticateUser, nflDraftController.getTeams);

// Lock date routes
router.get('/lock-date', authenticateUser, nflDraftController.getLockDate);
router.post('/lock-date', authenticateUser, nflDraftController.updateLockDate);

// Draft picks routes
router.get('/picks', authenticateUser, nflDraftController.getDraftPicks);
router.put('/picks/:pickId', authenticateUser, nflDraftController.updateDraftPick);

// Debug route
router.get('/debug-selections', authenticateUser, nflDraftController.debugUserSelections);

// Actual results routes (ActualResultsPage)
router.get('/results', authenticateUser, nflDraftController.getActualResults);

// Leaderboard routes (LeaderboardPage)
router.get('/leaderboard', authenticateUser, nflDraftController.getLeaderboard);

module.exports = router; 