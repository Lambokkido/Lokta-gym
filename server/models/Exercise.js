const mongoose = require('mongoose');

// Este modelo cachea los ejercicios traídos desde ExerciseDB (RapidAPI)
// para evitar llamadas repetidas a la API externa y reducir costos
const exerciseSchema = new mongoose.Schema(
  {
    // ID original del ejercicio en la API de ExerciseDB
    externalId: {
      type: String,
      required: true,
      unique: true,
    },

    // Nombre del ejercicio en inglés (como viene de la API)
    name: {
      type: String,
      required: true,
    },

    // Músculo principal trabajado (e.g., "chest", "biceps", "quads")
    targetMuscle: {
      type: String,
      required: true,
    },

    // Músculos secundarios que también se activan durante el ejercicio
    secondaryMuscles: {
      type: [String],
      default: [],
    },

    // Equipamiento necesario (e.g., "barbell", "dumbbell", "body weight")
    equipment: {
      type: String,
      default: 'body weight',
    },

    // URL del GIF animado que muestra cómo realizar el ejercicio
    gifUrl: {
      type: String,
    },

    // Pasos detallados para ejecutar el ejercicio correctamente
    instructions: {
      type: [String],
      default: [],
    },

    // Indica si el ejercicio puede usarse en planes de rehabilitación
    // (se puede marcar manualmente por coaches o admins)
    isRehabFriendly: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Exercise', exerciseSchema);
