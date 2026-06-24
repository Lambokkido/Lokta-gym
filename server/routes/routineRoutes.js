const express = require('express');
const {
  getMyRoutines,
  createRoutine,
  updateRoutine,
  deleteRoutine,
} = require('../controllers/routineController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

router.get('/', getMyRoutines);
router.post('/', createRoutine);
router.put('/:id', updateRoutine);
router.delete('/:id', deleteRoutine);

module.exports = router;
