const express = require('express');
const {
  getRoutineById,
  getMyRoutines,
  createRoutine,
  updateRoutine,
  deleteRoutine,
} = require('../controllers/routineController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getMyRoutines);
router.post('/', createRoutine);
router.get('/:id', getRoutineById);
router.put('/:id', updateRoutine);
router.delete('/:id', deleteRoutine);

module.exports = router;
