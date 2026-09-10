/**
 * Cumbre Comercial — Configuración de la tabla de posiciones GLOBAL
 * ====================================================================
 *
 * Por defecto, cada delegado guarda su resultado solo en su propio
 * navegador (modo local). Para que el grupo compita de forma ASÍNCRONA
 * en una sola tabla que se llena sola —igual que en TradeQuest y
 * DataQuest—, conecta este proyecto a Firebase Firestore (gratis).
 *
 * Sigue la guía "Tabla de posiciones global (Firebase)" del README.md.
 *
 * ¿Ya tienes un proyecto de Firebase de TradeQuest o DataQuest? Puedes
 * reutilizar el MISMO proyecto: solo copia aquí el mismo objeto
 * firebaseConfig y agrega la regla de seguridad para la colección
 * "cumbre_scores" (ver README). Cada juego guarda sus resultados en su
 * propia colección, así que no se mezclan entre sí.
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA9Ut8bHBXIplG5qEJVSpfmhErPaFOtcKs",
  authDomain: "cumbre-comercial.firebaseapp.com",
  projectId: "cumbre-comercial",
  storageBucket: "cumbre-comercial.firebasestorage.app",
  messagingSenderId: "981456583190",
  appId: "1:981456583190:web:ab7482f59cbfcd98b41337"
};

// Correo de la persona docente autorizada a reiniciar la tabla global.
// Debe coincidir EXACTAMENTE con el usuario que crees en
// Firebase → Authentication → Users, y con la regla de seguridad de
// Firestore (ver README).
const TEACHER_EMAIL = "laura.sariego@ucr.ac.cr";

// No toques esta línea: detecta automáticamente si ya configuraste Firebase.
const FIREBASE_ENABLED = Boolean(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
