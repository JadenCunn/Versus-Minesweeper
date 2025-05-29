const { v4: uuidv4 } = require('uuid');
const gameStore = require('../data/gameStore');

// Create a new game
exports.createGame = (width, height, mines) => {
  const board = createBoard(width, height, mines);
  const gameId = uuidv4();

  gameStore.games[gameId] = {
    id: gameId,
    board,
    status: 'in_progress',
  };

  return { gameId, board: board.getVisibleState() };
};

// Reveal a cell
exports.revealCell = (gameId, x, y) => {
  const game = gameStore.games[gameId];
  if (!game) throw new Error('Invalid game ID');

  const hitMine = game.board.revealCell(x, y);
  if (hitMine) game.status = 'failed';
  else if (game.board.isComplete()) game.status = 'complete';

  return {
    board: game.board.getVisibleState(),
    status: game.status,
    hitMine
  };
};

// Get a game by ID
exports.getGame = (gameId) => {
  return gameStore.games[gameId] || null;
};
