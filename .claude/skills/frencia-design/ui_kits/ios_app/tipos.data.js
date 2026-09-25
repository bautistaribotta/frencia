// Frencia — catálogo con tipos de ejercicio, planes del día, sesión e historial (mock).
window.FRENCIA_TIPOS = {
  prefs: { weight: 'kg', dist: 'km' },
  exercises: {
    press:    { id: 'press',    name: 'Press banca',                     muscle: 'Pecho',            kind: 'fuerza',     metrics: ['peso', 'reps'] },
    plancha:  { id: 'plancha',  name: 'Plancha',                         muscle: 'Core',             kind: 'isometrico', metrics: ['tiempo'] },
    sentIso:  { id: 'sentIso',  name: 'Sentadilla isométrica con barra', muscle: 'Cuádriceps',       kind: 'isometrico', metrics: ['peso', 'tiempo'] },
    cinta:    { id: 'cinta',    name: 'Cinta',                           muscle: 'Cardio',           kind: 'cardio',     metrics: ['tiempo', 'distancia'], distScale: 'larga' },
    soga:     { id: 'soga',     name: 'Soga',                            muscle: 'Cardio',           kind: 'cardio',     metrics: ['tiempo'] },
    granjero: { id: 'granjero', name: 'Paseo de granjero',               muscle: 'Agarre · Core',    kind: 'hibrido',    metrics: ['peso', 'distancia'], distScale: 'corta' },
    colgado:  { id: 'colgado',  name: 'Colgado en barra con lastre',     muscle: 'Agarre · Espalda', kind: 'hibrido',    metrics: ['peso', 'tiempo'] },
    sentadilla: { id: 'sentadilla', name: 'Sentadilla',                  muscle: 'Cuádriceps',       kind: 'fuerza',     metrics: ['peso', 'reps'] },
    dominadas:  { id: 'dominadas',  name: 'Dominadas',                   muscle: 'Espalda',          kind: 'fuerza',     metrics: ['peso', 'reps'] },
    hollow:     { id: 'hollow',     name: 'Hollow hold',                 muscle: 'Core',             kind: 'isometrico', metrics: ['tiempo'] },
    remo:       { id: 'remo',       name: 'Remo ergómetro',              muscle: 'Cardio',           kind: 'cardio',     metrics: ['tiempo', 'distancia'], distScale: 'corta' },
    bici:       { id: 'bici',       name: 'Bicicleta fija',              muscle: 'Cardio',           kind: 'cardio',     metrics: ['tiempo', 'distancia'], distScale: 'larga' },
    trineo:     { id: 'trineo',     name: 'Empuje de trineo',            muscle: 'Piernas',          kind: 'hibrido',    metrics: ['peso', 'distancia'], distScale: 'corta' },
  },
  catalogOrder: ['press', 'sentadilla', 'dominadas', 'plancha', 'hollow', 'sentIso', 'cinta', 'bici', 'remo', 'soga', 'granjero', 'trineo', 'colgado'],
  // Plan de cada ejemplo dentro de un día. Nunca trae peso.
  plans: {
    press:    { sets: 4, reps: 10, intensity: 'RIR', intensityValue: 2, rest: 120 },
    plancha:  { sets: 3, tiempo: 45, intensity: 'RIR', intensityValue: 1, rest: 60 },
    sentIso:  { sets: 4, tiempo: 30, intensity: 'RIR', intensityValue: 2, rest: 120 },
    cinta:    { sets: 1, tiempo: 1800, distancia: 5, intensity: 'RPE', intensityValue: 6, rest: null },
    soga:     { sets: 5, tiempo: 60, intensity: 'RPE', intensityValue: 8, rest: 30 },
    granjero: { sets: 3, distancia: 40, intensity: null, rest: 90 },
    colgado:  { sets: 3, tiempo: 30, intensity: 'RIR', intensityValue: 1, rest: 120 },
  },
  dayOrder: ['press', 'sentIso', 'colgado', 'granjero', 'plancha', 'soga', 'cinta'],
  // Sesión en curso: serie actual, anterior y lo cargado hasta ahora.
  session: {
    plancha:  { serie: 2, previous: { tiempo: 42, intensityValue: 1 }, done: [{ tiempo: 47, intensityValue: 1 }] },
    cinta:    { serie: 1, previous: { tiempo: 1800, distancia: 4.82, intensityValue: 6 }, done: [] },
    granjero: { serie: 2, previous: { peso: 32, distancia: 40 }, done: [{ peso: 36, distancia: 40 }] },
  },
  // Detalle de historial: sesión con tipos mezclados.
  history: {
    date: 'Jue 12 jun', time: '07:42', routine: 'Full Body · B', duration: 4212,
    items: [
      { ex: 'press',    intensity: 'RIR', sets: [{ peso: 82.5, reps: 10, intensityValue: 2 }, { peso: 82.5, reps: 10, intensityValue: 1 }, { peso: 85, reps: 8, intensityValue: 1 }, { peso: 85, reps: 7, intensityValue: 0 }] },
      { ex: 'colgado',  intensity: 'RIR', sets: [{ peso: 10, tiempo: 32, intensityValue: 1 }, { peso: 10, tiempo: 30, intensityValue: 1 }, { peso: 10, tiempo: 26, intensityValue: 0 }] },
      { ex: 'granjero', intensity: null,  sets: [{ peso: 32, distancia: 40 }, { peso: 36, distancia: 40 }, { peso: 36, distancia: 35 }] },
      { ex: 'plancha',  intensity: 'RIR', sets: [{ tiempo: 47, intensityValue: 1 }, { tiempo: 45, intensityValue: 1 }, { tiempo: 51, intensityValue: null }] },
      { ex: 'cinta',    intensity: 'RPE', sets: [{ tiempo: 1815, distancia: 5.04, intensityValue: 6 }] },
    ],
  },
};
