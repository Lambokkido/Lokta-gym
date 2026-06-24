const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Nombre completo del usuario
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },

    // Email único que sirve como identificador de login
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Contraseña hasheada con bcrypt (nunca se guarda en texto plano)
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: 6,
    },

    // Rol del usuario dentro del sistema
    role: {
      type: String,
      enum: ['user', 'coach', 'admin'],
      default: 'user',
    },

    // Indica si el usuario tiene una membresía activa para acceder a contenido premium
    activeMembership: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Agrega automáticamente createdAt y updatedAt
    timestamps: true,
  }
);

// Hook pre-save: hashea la contraseña antes de guardar si fue modificada
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método de instancia para comparar contraseña ingresada con la hasheada
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
