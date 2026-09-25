// Frencia iOS kit — shared mock data (plain globals; loaded before the babel screens)
window.FRENCIA_DATA = {
  user: { name: 'Marco Ríos', initials: 'MR', streak: 12 },
  today: {
    routine: 'Empuje · A',
    tags: ['Pecho', 'Hombro', 'Tríceps'],
    exercisesTotal: 5,
    exercisesDone: 0,
    lastDone: 'hace 3 días',
  },
  weekStats: { volume: '24.6', volumeUnit: 't', sessions: 4, rir: '1.8' },
  // Day-by-day schedule — navegable con flechas en la tarjeta de sesión
  todayIndex: 2,
  schedule: [
    { rel: 'Anteayer', day: 'Mar · 10 jun', routine: 'Pierna · A', tags: ['Cuádriceps', 'Glúteo', 'Femoral'], exercisesTotal: 6, exercisesDone: 6, status: 'done', volume: '21 050', volumeUnit: 'kg' },
    { rel: 'Ayer', day: 'Mié · 11 jun', routine: 'Tirón · A', tags: ['Espalda', 'Bíceps'], exercisesTotal: 6, exercisesDone: 6, status: 'done', volume: '14 220', volumeUnit: 'kg' },
    { rel: 'Hoy', day: 'Jue · 12 jun', routine: 'Empuje · A', tags: ['Pecho', 'Hombro', 'Tríceps'], exercisesTotal: 5, exercisesDone: 0, status: 'today', lastDone: 'hace 3 días' },
    { rel: 'Mañana', day: 'Vie · 13 jun', routine: 'Pierna · B', tags: ['Cuádriceps', 'Pantorrilla'], exercisesTotal: 6, exercisesDone: 0, status: 'planned' },
    { rel: 'Pasado mañana', day: 'Sáb · 14 jun', routine: 'Descanso', tags: ['Movilidad', 'Cardio suave'], exercisesTotal: 0, exercisesDone: 0, status: 'rest' },
  ],
  lastPR: { exercise: 'Press banca', value: '85', unit: 'kg', date: '09 DE JUNIO', reps: 5 },
  // Active workout — Press banca
  exercise: {
    name: 'Press banca',
    target: '4 × 6–8',
    note: 'Pausa 1s en el pecho',
    muscle: 'Pecho',
    sets: [
      { load: 82.5, reps: 8, rir: 2, state: 'done' },
      { load: 82.5, reps: 8, rir: 1, state: 'done' },
      { load: 85.0, reps: 6, rir: null, state: 'active' },
      { load: 85.0, reps: 6, rir: null, state: 'pending' },
    ],
    next: 'Aperturas en polea',
  },
  // Progression — Press banca est. 1RM by week
  progress: {
    exercise: 'Press banca',
    oneRM: '102',
    oneRMDelta: '+4',
    bars: [
      { label: 'S1', v: 64 }, { label: 'S2', v: 70 }, { label: 'S3', v: 68 },
      { label: 'S4', v: 78 }, { label: 'S5', v: 84 }, { label: 'S6', v: 100, pr: true },
    ],
    prs: [
      { date: '09 DE JUNIO', value: '85', unit: 'kg', reps: 5, est: '98' },
      { date: '26 DE MAYO', value: '82.5', unit: 'kg', reps: 6, est: '96' },
      { date: '12 DE MAYO', value: '80', unit: 'kg', reps: 6, est: '93' },
    ],
  },
  // Routines library
  routines: [
    { name: 'Empuje · A', focus: 'Pecho · Hombro · Tríceps', exercises: 5, sets: 18, mins: 55, last: 'hace 3 días', active: true },
    { name: 'Tirón · A', focus: 'Espalda · Bíceps', exercises: 6, sets: 20, mins: 60, last: 'hace 5 días', active: false },
    { name: 'Pierna · A', focus: 'Cuádriceps · Glúteo · Femoral', exercises: 6, sets: 22, mins: 65, last: 'hace 7 días', active: false },
    { name: 'Full Body · Express', focus: 'Cuerpo completo', exercises: 4, sets: 12, mins: 35, last: 'hace 2 semanas', active: false },
  ],
  // Completed session — the stub
  session: {
    date: '12 JUN 2026', time: '07:42', dur: '58:21',
    routine: 'EMPUJE · A',
    volume: '12 480', volumeUnit: 'kg',
    exercises: 5, sets: 18, rir: '1.6', prs: 1,
    id: 'FRENCIA-0418-2773610',
    log: [
      { name: 'Press banca', sets: '4×', top: '85 kg', pr: true },
      { name: 'Press inclinado mancuernas', sets: '3×', top: '34 kg', pr: false },
      { name: 'Aperturas en polea', sets: '3×', top: '20 kg', pr: false },
      { name: 'Press militar', sets: '4×', top: '52.5 kg', pr: false },
      { name: 'Fondos lastrados', sets: '4×', top: '+20 kg', pr: false },
    ],
  },
};
