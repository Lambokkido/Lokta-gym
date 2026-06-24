const express = require('express');
const {
  getAllExercises,
  getExerciseByIdHandler,
  filterExercises,
} = require('../controllers/exerciseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/exercises — lista completa (requiere autenticación)
router.get('/', protect, getAllExercises);

// GET /api/exercises/filter — filtrar por músculo, equipamiento o rehabilitación
// Definida antes de /:id para evitar que "filter" sea tratado como un ID
router.get('/filter', protect, filterExercises);

// GET /api/exercises/:id — obtener un ejercicio específico por su ID externo
router.get('/:id', protect, getExerciseByIdHandler);

module.exports = router;
