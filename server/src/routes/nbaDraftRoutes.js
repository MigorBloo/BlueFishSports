const express = require('express');
const router = express.Router();
const nbaDraftController = require('../controllers/nbaDraftController');
const { authenticateUser } = require('../middleware/auth');

// Welcome route
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the NBA Draft API' });
});

// Prospects routes (ExpertPicksPage)
router.get('/prospects', authenticateUser, nbaDraftController.getTop200Prospects);

// Expert picks routes
router.get('/expert-picks', authenticateUser, nbaDraftController.getExpertPicks);
router.get('/expert-picks/experts', authenticateUser, nbaDraftController.getExpertNames);

// User selections routes (UserSelectionsPage)
router.get('/user-selections/:userId', authenticateUser, nbaDraftController.getUserSelections);
router.get('/selections', authenticateUser, nbaDraftController.getUserSelections);
router.post('/selections', authenticateUser, nbaDraftController.createUserSelection);
router.put('/selections/:id', authenticateUser, nbaDraftController.updateUserSelection);
router.post('/selections/:id/confirm', authenticateUser, nbaDraftController.confirmUserSelection);

// Teams routes
router.get('/teams', authenticateUser, nbaDraftController.getTeams);

// Lock date routes
router.get('/lock-date', authenticateUser, nbaDraftController.getLockDate);
router.post('/lock-date', authenticateUser, nbaDraftController.updateLockDate);

// Draft picks routes
router.get('/picks', authenticateUser, nbaDraftController.getDraftPicks);
router.put('/picks/:pickId', authenticateUser, nbaDraftController.updateDraftPick);

// Debug route
router.get('/debug-selections', authenticateUser, nbaDraftController.debugUserSelections);

// Actual results routes (ActualResultsPage)
router.get('/results', authenticateUser, nbaDraftController.getActualResults);
router.post('/results', authenticateUser, nbaDraftController.updateActualResults);

// Leaderboard routes (LeaderboardPage)
router.get('/leaderboard', authenticateUser, nbaDraftController.getLeaderboard);

// Get all user selections with usernames
router.get('/user-selections', authenticateUser, async (req, res) => {
    try {
        const result = await nbaDraftController.getUserSelections();
        res.json(result);
    } catch (err) {
        console.error('Error fetching NBA user selections:', err);
        res.status(500).json({ error: 'Failed to fetch user selections' });
    }
});

module.exports = router; 