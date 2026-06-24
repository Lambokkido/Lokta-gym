const Exercise = require('../models/Exercise');
const { fetchAndCacheAllExercises, getExerciseById } = require('../services/exerciseService');

// GET /api/exercises
// Devuelve todos los ejercicios. Si el caché está vacío, los trae de la API externa primero.
const getAllExercises = async (req, res) => {
  try {
    await fetchAndCacheAllExercises();
    const exercises = await Exercise.find().select('-__v');
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ejercicios', error: error.message });
  }
};

// GET /api/exercises/:id
// Obtiene un ejercicio por su ID externo de ExerciseDB
const getExerciseByIdHandler = async (req, res) => {
  try {
    const exercise = await getExerciseById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Ejercicio no encontrado' });
    }
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el ejercicio', error: error.message });
  }
};

// GET /api/exercises/filter?muscle=chest&equipment=barbell&rehab=true
// Filtra ejercicios por músculo objetivo, equipamiento y/o si es apto para rehabilitación
const filterExercises = async (req, res) => {
  try {
    const { muscle, equipment, rehab } = req.query;
    const query = {};

    if (muscle) query.targetMuscle = { $regex: new RegExp(muscle, 'i') };
    if (equipment) query.equipment = { $regex: new RegExp(equipment, 'i') };
    if (rehab === 'true') query.isRehabFriendly = true;

    const exercises = await Exercise.find(query).select('-__v');
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: 'Error al filtrar ejercicios', error: error.message });
  }
};

module.exports = { getAllExercises, getExerciseByIdHandler, filterExercises };
