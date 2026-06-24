const Routine = require('../models/Routine');

// GET /api/routines/:id — obtiene una rutina por ID (solo si pertenece al usuario)
const getRoutineById = async (req, res) => {
  try {
    const routine = await Routine.findOne({ _id: req.params.id, user: req.user._id }).populate(
      'exercises',
      'name targetMuscle equipment gifUrl'
    );
    if (!routine) return res.status(404).json({ message: 'Rutina no encontrada' });
    res.json(routine);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener rutina', error: error.message });
  }
};

// GET /api/routines
// Devuelve todas las rutinas del usuario autenticado, con los ejercicios populados
const getMyRoutines = async (req, res) => {
  try {
    const routines = await Routine.find({ user: req.user._id }).populate(
      'exercises',
      'name targetMuscle equipment gifUrl'
    );
    res.json(routines);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener rutinas', error: error.message });
  }
};

// POST /api/routines
// Crea una rutina nueva para el usuario autenticado
const createRoutine = async (req, res) => {
  try {
    const { name, exercises, userId } = req.body;

    // Un coach/admin puede crear una rutina para otro usuario pasando userId
    const targetUser = userId && ['coach', 'admin'].includes(req.user.role)
      ? userId
      : req.user._id;

    const routine = await Routine.create({
      name,
      user: targetUser,
      exercises: exercises || [],
    });

    const populated = await routine.populate('exercises', 'name targetMuscle equipment gifUrl');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear rutina', error: error.message });
  }
};

// PUT /api/routines/:id
// Actualiza nombre y/o ejercicios de una rutina. Solo el dueño puede editarla.
const updateRoutine = async (req, res) => {
  try {
    const routine = await Routine.findOne({ _id: req.params.id, user: req.user._id });

    if (!routine) {
      return res.status(404).json({ message: 'Rutina no encontrada' });
    }

    const { name, exercises } = req.body;
    if (name !== undefined) routine.name = name;
    if (exercises !== undefined) routine.exercises = exercises;

    await routine.save();
    const populated = await routine.populate('exercises', 'name targetMuscle equipment gifUrl');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar rutina', error: error.message });
  }
};

// DELETE /api/routines/:id
// Elimina una rutina. Solo el dueño puede borrarla.
const deleteRoutine = async (req, res) => {
  try {
    const routine = await Routine.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!routine) {
      return res.status(404).json({ message: 'Rutina no encontrada' });
    }

    res.json({ message: 'Rutina eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar rutina', error: error.message });
  }
};

module.exports = { getRoutineById, getMyRoutines, createRoutine, updateRoutine, deleteRoutine };
