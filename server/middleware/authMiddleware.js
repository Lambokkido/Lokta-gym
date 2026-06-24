const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware que protege rutas verificando el JWT en el header Authorization
// Si el token es válido, adjunta el usuario a req.user para uso en controllers
const protect = async (req, res, next) => {
  let token;

  // El token debe venir en el header como: Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, token faltante' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Adjunta el usuario sin la contraseña para que esté disponible en cada ruta protegida
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Middleware para restringir acceso por rol (e.g., solo admins o coaches)
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tenés permisos para esta acción' });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
