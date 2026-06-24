const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    routine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Routine',
      required: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
