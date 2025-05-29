const express = require('express');
const router = express.Router();
const controller = require('../controllers/roomController');

router.post('/create', controller.createRoom);
router.post('/join', controller.joinRoom);
router.post('/start', controller.startGame);
router.get('/status', controller.getRoomStatus);

module.exports = router;
