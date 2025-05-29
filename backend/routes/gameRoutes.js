const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Start a new game
router.post('/start', gameController.startGame);

// Reveal a cell
router.post('/move', gameController.makeMove);

// (Optional) Get current game state
router.get('/state/:gameId', gameController.getGameState);

module.exports = router;
