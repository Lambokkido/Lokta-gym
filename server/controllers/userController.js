const User = require('../models/User');

// GET /api/users — lista todos los usuarios (solo admin/coach)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

// PUT /api/users/:id/role — cambia el rol de un usuario (solo admin)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'coach', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar rol', error: error.message });
  }
};

// PUT /api/users/:id/membership — activa o desactiva membresía (solo admin)
const updateMembership = async (req, res) => {
  try {
    const { activeMembership } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { activeMembership },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar membresía', error: error.message });
  }
};

module.exports = { getAllUsers, updateUserRole, updateMembership };
