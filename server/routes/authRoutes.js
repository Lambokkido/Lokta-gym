const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/register — crea una cuenta nueva
router.post('/register', register);

// POST /api/auth/login — autentica y devuelve un JWT
router.post('/login', login);

module.exports = router;
