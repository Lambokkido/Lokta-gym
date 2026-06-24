const WorkoutLog = require('../models/WorkoutLog');

// GET /api/logs — historial de entrenamientos del usuario logueado
const getMyLogs = async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ user: req.user._id })
      .populate('routine', 'name exercises')
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial', error: error.message });
  }
};

// POST /api/logs — registrar una sesión de entrenamiento completada
const createLog = async (req, res) => {
  try {
    const { routineId, notes } = req.body;
    const log = await WorkoutLog.create({
      user: req.user._id,
      routine: routineId,
      notes: notes || '',
    });
    const populated = await log.populate('routine', 'name exercises');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar entrenamiento', error: error.message });
  }
};

// DELETE /api/logs/:id — eliminar un registro del historial
const deleteLog = async (req, res) => {
  try {
    const log = await WorkoutLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!log) return res.status(404).json({ message: 'Registro no encontrado' });
    res.json({ message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar registro', error: error.message });
  }
};

module.exports = { getMyLogs, createLog, deleteLog };
