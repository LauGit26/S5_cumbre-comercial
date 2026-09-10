/**
 * Cumbre Comercial — Tabla de posiciones (competencia asíncrona)
 * =================================================================
 * Mismo patrón probado en TradeQuest/DataQuest: modo local (localStorage)
 * por defecto, o modo global (Firestore) si se configuró Firebase.
 */

const LOCAL_LEADERBOARD_KEY = "cumbre_leaderboard_v1";
const LEADERBOARD_MAX_ENTRIES = 100;
const SCORES_COLLECTION = "cumbre_scores";

let firestoreDb = null;
let firebaseAuth = null;
let firebaseReadyPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(s);
  });
}

function ensureFirebaseReady() {
  if (!FIREBASE_ENABLED) return Promise.resolve(false);
  if (firebaseReadyPromise) return firebaseReadyPromise;

  const SDK_VERSION = "10.13.2";
  firebaseReadyPromise = loadScript(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app-compat.js`)
    .then(() => Promise.all([
      loadScript(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-firestore-compat.js`),
      loadScript(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-auth-compat.js`)
    ]))
    .then(() => {
      const app = firebase.apps && firebase.apps.length ? firebase.apps[0] : firebase.initializeApp(FIREBASE_CONFIG);
      firestoreDb = firebase.firestore(app);
      firebaseAuth = firebase.auth(app);
      return true;
    })
    .catch((err) => {
      console.warn("No se pudo conectar con la tabla global (Firebase). Se usará la tabla local.", err);
      firebaseReadyPromise = null;
      return false;
    });

  return firebaseReadyPromise;
}

function isRemoteMode() {
  return FIREBASE_ENABLED;
}

function getLocalLeaderboard() {
  try {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveLocalLeaderboard(entries) {
  try {
    localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(entries));
  } catch (e) { /* almacenamiento no disponible */ }
}

function addLocalScore(entry) {
  const entries = getLocalLeaderboard();
  entries.push(entry);
  entries.sort((a, b) => b.score - a.score);
  const trimmed = entries.slice(0, LEADERBOARD_MAX_ENTRIES);
  saveLocalLeaderboard(trimmed);
  return trimmed;
}

function importEntries(newEntries) {
  const current = getLocalLeaderboard();
  const seen = new Set(current.map((e) => `${e.playerName}|${e.score}|${e.date}`));
  newEntries.forEach((e) => {
    if (!e || typeof e.playerName !== "string" || typeof e.score !== "number") return;
    const key = `${e.playerName}|${e.score}|${e.date}`;
    if (seen.has(key)) return;
    seen.add(key);
    current.push(e);
  });
  current.sort((a, b) => b.score - a.score);
  const trimmed = current.slice(0, LEADERBOARD_MAX_ENTRIES);
  saveLocalLeaderboard(trimmed);
  return trimmed;
}

function subscribeToLeaderboard(onUpdate) {
  let unsubscribed = false;
  let unsubscribeFn = () => { unsubscribed = true; };

  ensureFirebaseReady().then((ready) => {
    if (unsubscribed) return;

    if (!ready) {
      onUpdate(getLocalLeaderboard(), { remote: false });
      return;
    }

    const query = firestoreDb.collection(SCORES_COLLECTION).orderBy("score", "desc").limit(LEADERBOARD_MAX_ENTRIES);
    const unsub = query.onSnapshot(
      (snapshot) => onUpdate(snapshot.docs.map((doc) => doc.data()), { remote: true }),
      (err) => {
        console.warn("Se perdió la conexión con la tabla global; usando copia local.", err);
        onUpdate(getLocalLeaderboard(), { remote: false, error: true });
      }
    );
    unsubscribeFn = unsub;
  });

  return () => unsubscribeFn();
}

async function submitScore(entry) {
  if (!entry || entry.mode !== "competencia") return;

  const record = {
    playerName: entry.playerName,
    score: Math.round(entry.score),
    accuracy: entry.accuracy,
    correctCount: entry.correctCount,
    totalQuestions: entry.totalQuestions,
    bestStreak: entry.bestStreak,
    rank: entry.rank,
    date: entry.date
  };

  const ready = await ensureFirebaseReady();
  if (!ready) return addLocalScore(record);

  try {
    await firestoreDb.collection(SCORES_COLLECTION).add(record);
    return undefined;
  } catch (err) {
    console.warn("No se pudo enviar el puntaje a la tabla global; se guarda localmente.", err);
    return addLocalScore(record);
  }
}

async function resetLeaderboard(credentials) {
  const ready = await ensureFirebaseReady();
  if (!ready) {
    saveLocalLeaderboard([]);
    return { ok: true };
  }

  const { email, password } = credentials || {};
  if (!email || !password) {
    return { ok: false, message: "Ingresa el correo y la contraseña de la persona docente." };
  }

  try {
    await firebaseAuth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    return { ok: false, message: "Credenciales incorrectas. Solo la cuenta docente puede reiniciar la tabla." };
  }

  try {
    const snapshot = await firestoreDb.collection(SCORES_COLLECTION).get();
    const batchSize = 400;
    const docs = snapshot.docs;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = firestoreDb.batch();
      docs.slice(i, i + batchSize).forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { ok: false, message: "Se inició sesión, pero Firestore rechazó el borrado. Revisa las reglas de seguridad (ver README)." };
  } finally {
    firebaseAuth.signOut().catch(() => {});
  }
}

function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

if (typeof module !== "undefined") {
  module.exports = { subscribeToLeaderboard, submitScore, resetLeaderboard, importEntries, downloadJSON, isRemoteMode };
}
