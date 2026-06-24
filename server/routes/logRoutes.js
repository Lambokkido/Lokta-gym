const express = require('express');
const { getMyLogs, createLog, deleteLog } = require('../controllers/logController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getMyLogs);
router.post('/', createLog);
router.delete('/:id', deleteLog);

module.exports = router;
