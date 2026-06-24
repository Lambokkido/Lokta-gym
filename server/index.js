const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const routineRoutes = require('./routes/routineRoutes');
const logRoutes = require('./routes/logRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado correctamente'))
  .catch((err) => console.error('Error al conectar a MongoDB:', err));

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);

// Ruta de salud para verificar que el servidor corre
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Lokta Gym API running' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
