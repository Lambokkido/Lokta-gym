const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema(
  {
    // Nombre descriptivo de la rutina (e.g., "Push Day - Intermedio")
    name: {
      type: String,
      required: [true, 'El nombre de la rutina es obligatorio'],
      trim: true,
    },

    // Usuario dueño de la rutina
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Lista de ejercicios que componen la rutina
    exercises: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Routine', routineSchema);
