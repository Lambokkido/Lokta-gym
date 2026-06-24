const axios = require('axios');
const Exercise = require('../models/Exercise');

const RAPIDAPI_HOST = 'exercisedb.p.rapidapi.com';
const BASE_URL = 'https://exercisedb.p.rapidapi.com';

// Headers necesarios para autenticarse con RapidAPI
const rapidApiHeaders = {
  'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
  'X-RapidAPI-Host': RAPIDAPI_HOST,
};

// Trae todos los ejercicios desde la API externa y los guarda en MongoDB
// Si ya existen en la BD, no se vuelve a hacer la petición (caché)
const fetchAndCacheAllExercises = async () => {
  const existingCount = await Exercise.countDocuments();
  if (existingCount > 0) {
    console.log('Ejercicios ya cacheados en MongoDB, no se llama a la API');
    return;
  }

  const response = await axios.get(`${BASE_URL}/exercises`, {
    headers: rapidApiHeaders,
    params: { limit: 1000 },
  });

  const exercises = response.data.map((ex) => ({
    externalId: ex.id,
    name: ex.name,
    targetMuscle: ex.target,
    secondaryMuscles: ex.secondaryMuscles || [],
    equipment: ex.equipment,
    gifUrl: ex.gifUrl,
    instructions: ex.instructions || [],
  }));

  // insertMany con ordered:false para ignorar duplicados y continuar
  await Exercise.insertMany(exercises, { ordered: false });
  console.log(`${exercises.length} ejercicios guardados en MongoDB`);
};

// Obtiene un ejercicio por su ID externo (primero busca en caché, luego en API)
const getExerciseById = async (externalId) => {
  const cached = await Exercise.findOne({ externalId });
  if (cached) return cached;

  const response = await axios.get(`${BASE_URL}/exercises/exercise/${externalId}`, {
    headers: rapidApiHeaders,
  });

  const ex = response.data;
  const newExercise = await Exercise.create({
    externalId: ex.id,
    name: ex.name,
    targetMuscle: ex.target,
    secondaryMuscles: ex.secondaryMuscles || [],
    equipment: ex.equipment,
    gifUrl: ex.gifUrl,
    instructions: ex.instructions || [],
  });

  return newExercise;
};

module.exports = { fetchAndCacheAllExercises, getExerciseById };
