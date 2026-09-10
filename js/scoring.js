/**
 * Cumbre Comercial — Reglas de puntaje (funciones puras, sin estado)
 * Separadas del store para que sean fáciles de leer y ajustar.
 */

const LEVEL_POINTS = { Recordar: 100, Comprender: 150, Aplicar: 200, Analizar: 250 };
const LEVEL_TIME_SECONDS = { Recordar: 20, Comprender: 20, Aplicar: 25, Analizar: 30 };
const STUDY_TIME_SECONDS = 999;

function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Mezcla las opciones de una pregunta (o Verdadero/Falso) y recalcula el índice correcto. */
function prepareQuestion(question) {
  if (question.type === "tf") {
    return { ...question, shuffledOptions: ["Verdadero", "Falso"], shuffledCorrectIndex: question.correctIndex };
  }
  const indices = shuffleArray(question.options.map((_, i) => i));
  const shuffledOptions = indices.map((i) => question.options[i]);
  const shuffledCorrectIndex = indices.indexOf(question.correctIndex);
  return { ...question, shuffledOptions, shuffledCorrectIndex };
}

/** Puntos ganados por una respuesta correcta, según nivel, tiempo restante y racha. */
function computePoints(level, mode, secondsLeft, totalSeconds, streakAfterThisAnswer) {
  const base = LEVEL_POINTS[level] || 100;
  let timeFactor = 1;
  if (mode === "competencia" && totalSeconds > 0) {
    const ratio = Math.max(0, secondsLeft) / totalSeconds;
    timeFactor = 1 + 0.5 * ratio;
  }
  let comboFactor = 1;
  if (streakAfterThisAnswer >= 6) comboFactor = 1.5;
  else if (streakAfterThisAnswer >= 3) comboFactor = 1.2;
  return Math.round(base * timeFactor * comboFactor);
}

/** Rango diplomático de sabor, según % de aciertos (0-100). */
function diplomaticRank(accuracyPct) {
  if (accuracyPct >= 90) return "Embajador Extraordinario";
  if (accuracyPct >= 70) return "Embajador";
  if (accuracyPct >= 50) return "Delegado";
  if (accuracyPct >= 30) return "Observador";
  return "Asesor en formación";
}

if (typeof module !== "undefined") {
  module.exports = { LEVEL_POINTS, LEVEL_TIME_SECONDS, STUDY_TIME_SECONDS, shuffleArray, prepareQuestion, computePoints, diplomaticRank };
}
