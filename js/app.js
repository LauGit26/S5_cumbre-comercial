/**
 * Cumbre Comercial — App (wiring)
 * =================================
 * Registra las rutas, traduce acciones del usuario (clics con
 * data-action) en cambios de estado, y arranca/detiene el temporizador
 * de cada pregunta. Es el único archivo que "conecta" router + store +
 * vistas + motor de puntaje + tabla de posiciones.
 */

(function () {
  const root = document.getElementById("app-root");

  // ---------- Sonido (sin archivos externos) ----------
  let audioCtx = null;
  function beep(freq, duration, type = "sine", delay = 0) {
    if (!Store.getState().soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const t0 = audioCtx.currentTime + delay;
      gain.gain.setValueAtTime(0.08, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t0);
      osc.stop(t0 + duration);
    } catch (e) { /* audio no disponible */ }
  }
  const sfx = {
    correct: () => beep(880, 0.18, "triangle"),
    incorrect: () => beep(160, 0.25, "sawtooth"),
    tick: () => beep(1200, 0.05, "square"),
    start: () => beep(660, 0.15, "sine"),
    sessionEnd: () => { beep(660, 0.14, "triangle", 0); beep(880, 0.14, "triangle", 0.14); beep(1100, 0.22, "triangle", 0.28); }
  };

  // ---------- Preparar sesiones para una nueva partida ----------
  function prepareSessions() {
    return SESSIONS.map((s) => ({
      id: s.id,
      title: s.title,
      icon: s.icon,
      briefing: s.briefing,
      questions: s.questions.map(prepareQuestion),
      answers: []
    }));
  }

  // ---------- Temporizador (fuera del store: es un efecto, no estado serializable) ----------
  let timerId = null;
  let timerSecondsLeft = 0;
  let timerTotalSeconds = 0;

  function stopTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  function startTimerForCurrentQuestion() {
    stopTimer();
    const state = Store.getState();
    const session = state.sessions[state.currentSessionIndex];
    const q = session.questions[state.currentQuestionIndex];
    const seconds = state.mode === "estudio" ? STUDY_TIME_SECONDS : (LEVEL_TIME_SECONDS[q.level] || 20);
    timerSecondsLeft = seconds;
    timerTotalSeconds = seconds;

    const bar = document.getElementById("timer-bar");
    if (bar) bar.style.width = "100%";
    if (state.mode === "estudio") return;

    timerId = setInterval(() => {
      timerSecondsLeft -= 0.1;
      const barEl = document.getElementById("timer-bar");
      if (timerSecondsLeft <= 0) {
        timerSecondsLeft = 0;
        stopTimer();
        if (barEl) { barEl.style.width = "0%"; barEl.classList.add("warn"); }
        if (!Store.getState().lastAnswer) handleAnswer(null);
        return;
      }
      const pct = Math.max(0, (timerSecondsLeft / timerTotalSeconds) * 100);
      if (barEl) {
        barEl.style.width = pct + "%";
        barEl.classList.toggle("warn", pct < 25);
      }
      if (pct < 25 && Math.ceil(timerSecondsLeft) !== Math.ceil(timerSecondsLeft + 0.1)) sfx.tick();
    }, 100);
  }

  // ---------- Lógica de respuesta ----------
  function handleAnswer(selectedIndex) {
    stopTimer();
    const state = Store.getState();
    if (state.lastAnswer) return; // ya respondida (evita doble clic)

    const session = state.sessions[state.currentSessionIndex];
    const q = session.questions[state.currentQuestionIndex];
    const isCorrect = selectedIndex !== null && selectedIndex === q.shuffledCorrectIndex;

    let pointsEarned = 0;
    let newStreak = state.streak;
    if (isCorrect) {
      newStreak = state.streak + 1;
      pointsEarned = computePoints(q.level, state.mode, timerSecondsLeft, timerTotalSeconds, newStreak);
      sfx.correct();
    } else {
      newStreak = 0;
      sfx.incorrect();
    }

    const newSessions = state.sessions.slice();
    const newSession = { ...session, answers: session.answers.concat([{ isCorrect, pointsEarned }]) };
    newSessions[state.currentSessionIndex] = newSession;

    Store.setState({
      sessions: newSessions,
      score: state.score + pointsEarned,
      streak: newStreak,
      bestStreak: Math.max(state.bestStreak, newStreak),
      correctCount: state.correctCount + (isCorrect ? 1 : 0),
      answeredCount: state.answeredCount + 1,
      lastAnswer: { isCorrect, pointsEarned, correctIndex: q.shuffledCorrectIndex, selectedIndex }
    });

    renderCurrentRoute(); // re-dibuja la pregunta actual mostrando la retroalimentación
  }

  // ---------- Rutas ----------
  function renderCurrentRoute() {
    Router.replace(Router.currentPath() || "menu");
  }

  Router.register("menu", () => {
    stopTimer();
    root.innerHTML = viewMenu();
  });

  Router.register("reglas", () => {
    root.innerHTML = viewRules();
  });

  Router.register("sesion/:s/pregunta/:q", (params) => {
    const state = Store.getState();
    const s = parseInt(params.s, 10);
    const q = parseInt(params.q, 10);
    if (!state.sessions.length || !state.sessions[s]) { Router.replace("menu"); return; }
    // Si la URL no coincide con el estado real (p. ej. el usuario usó "atrás"),
    // nos auto-corregimos a la pregunta actual real en vez de rebobinar la partida.
    if (s !== state.currentSessionIndex || q !== state.currentQuestionIndex) {
      Router.replace(`sesion/${state.currentSessionIndex}/pregunta/${state.currentQuestionIndex}`);
      return;
    }
    root.innerHTML = viewQuestion(state);
    if (!state.lastAnswer) startTimerForCurrentQuestion();
  });

  Router.register("sesion/:s/resumen", (params) => {
    const state = Store.getState();
    const s = parseInt(params.s, 10);
    if (!state.sessions.length || !state.sessions[s]) { Router.replace("menu"); return; }
    if (s !== state.currentSessionIndex) { Router.replace(`sesion/${state.currentSessionIndex}/resumen`); return; }
    stopTimer();
    root.innerHTML = viewSessionSummary(state);
  });

  Router.register("resultados", () => {
    const state = Store.getState();
    if (!state.sessions.length) { Router.replace("menu"); return; }
    stopTimer();
    root.innerHTML = viewResults(state);
  });

  Router.register("tabla", () => {
    root.innerHTML = viewLeaderboard(latestLeaderboardEntries, latestLeaderboardMeta);
  });

  // ---------- Tabla de posiciones: suscripción en vivo ----------
  let latestLeaderboardEntries = [];
  let latestLeaderboardMeta = { remote: false };
  subscribeToLeaderboard((entries, meta) => {
    latestLeaderboardEntries = entries;
    latestLeaderboardMeta = meta;
    if (Router.currentPath() === "tabla") root.innerHTML = viewLeaderboard(entries, meta);
  });

  // ---------- Modal de la persona docente (fuera del router: siempre en el DOM) ----------
  const teacherModal = document.getElementById("modal-teacher-login");
  const teacherEmailInput = document.getElementById("teacher-email");
  const teacherPasswordInput = document.getElementById("teacher-password");
  const teacherLoginError = document.getElementById("teacher-login-error");
  const btnTeacherConfirm = document.getElementById("btn-teacher-confirm");

  document.getElementById("btn-teacher-cancel").addEventListener("click", () => { teacherModal.hidden = true; });
  btnTeacherConfirm.addEventListener("click", async () => {
    const email = teacherEmailInput.value.trim();
    const password = teacherPasswordInput.value;
    btnTeacherConfirm.disabled = true;
    btnTeacherConfirm.textContent = "Verificando…";
    const result = await resetLeaderboard({ email, password });
    btnTeacherConfirm.disabled = false;
    btnTeacherConfirm.textContent = "Confirmar reinicio";
    if (result.ok) {
      teacherModal.hidden = true;
    } else {
      teacherLoginError.textContent = result.message;
      teacherLoginError.hidden = false;
    }
  });

  // ---------- Botón de silenciar (fuera del router) ----------
  document.getElementById("btn-home").addEventListener("click", () => {
    stopTimer();
    Router.go("menu");
  });

  const btnMute = document.getElementById("btn-mute");
  btnMute.addEventListener("click", () => {
    const soundOn = !Store.getState().soundOn;
    Store.setState({ soundOn });
    btnMute.textContent = soundOn ? "🔊" : "🔇";
  });

  // ---------- Delegación de eventos: un solo listener para toda la app ----------
  root.addEventListener("click", (event) => {
    const el = event.target.closest("[data-action]");
    if (!el) return;
    const action = el.dataset.action;
    const state = Store.getState();

    switch (action) {
      case "start-game": {
        const name = (document.getElementById("input-name").value || "").trim().slice(0, 24) || "Delegado(a) anónimo(a)";
        const mode = document.querySelector('input[name="mode"]:checked').value;
        sfx.start();
        Store.setState({
          playerName: name,
          mode,
          sessions: prepareSessions(),
          currentSessionIndex: 0,
          currentQuestionIndex: 0,
          score: 0,
          streak: 0,
          bestStreak: 0,
          correctCount: 0,
          answeredCount: 0,
          lastAnswer: null
        });
        Router.go("sesion/0/pregunta/0");
        break;
      }
      case "go-rules": Router.go("reglas"); break;
      case "rules-back": Router.go("menu"); break;
      case "go-menu": Router.go("menu"); break;
      case "go-leaderboard": Router.go("tabla"); break;

      case "select-option": {
        if (state.lastAnswer) break; // ya respondida
        handleAnswer(parseInt(el.dataset.index, 10));
        break;
      }

      case "next-question": {
        const session = state.sessions[state.currentSessionIndex];
        if (state.currentQuestionIndex < session.questions.length - 1) {
          Store.setState({ currentQuestionIndex: state.currentQuestionIndex + 1, lastAnswer: null });
          Router.go(`sesion/${state.currentSessionIndex}/pregunta/${state.currentQuestionIndex + 1}`);
        } else {
          sfx.sessionEnd();
          Router.go(`sesion/${state.currentSessionIndex}/resumen`);
        }
        break;
      }

      case "session-continue": {
        const isLastSession = state.currentSessionIndex >= state.sessions.length - 1;
        if (isLastSession) {
          finishGame();
        } else {
          Store.setState({ currentSessionIndex: state.currentSessionIndex + 1, currentQuestionIndex: 0, lastAnswer: null });
          Router.go(`sesion/${state.currentSessionIndex + 1}/pregunta/0`);
        }
        break;
      }

      case "play-again": {
        Store.resetGame();
        Router.go("menu");
        break;
      }

      case "download-result": {
        const summary = buildSummary(state);
        const safeName = summary.playerName.replace(/[^a-z0-9áéíóúñ]+/gi, "_");
        downloadJSON(`cumbre_${safeName}_${Date.now()}.json`, [summary]);
        break;
      }

      case "export-leaderboard": {
        downloadJSON(`cumbre_tabla_${Date.now()}.json`, latestLeaderboardEntries);
        break;
      }

      case "reset-leaderboard": {
        if (isRemoteMode()) {
          teacherEmailInput.value = "";
          teacherPasswordInput.value = "";
          teacherLoginError.hidden = true;
          teacherModal.hidden = false;
          teacherEmailInput.focus();
        } else if (confirm("¿Seguro que deseas borrar toda la tabla de posiciones de este navegador? Esta acción no se puede deshacer.")) {
          resetLeaderboard().then(() => {
            latestLeaderboardEntries = [];
            if (Router.currentPath() === "tabla") root.innerHTML = viewLeaderboard(latestLeaderboardEntries, latestLeaderboardMeta);
          });
        }
        break;
      }
    }
  });

  // 'change' también burbujea: usamos delegación para el input de importar archivos.
  root.addEventListener("change", (event) => {
    if (event.target.id !== "input-import") return;
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    let pending = files.length;
    let combined = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          combined = combined.concat(Array.isArray(parsed) ? parsed : [parsed]);
        } catch (err) {
          console.warn(`No se pudo leer ${file.name}:`, err);
        } finally {
          pending--;
          if (pending === 0) {
            const merged = importEntries(combined);
            if (isRemoteMode()) {
              alert("Nota: la tabla global ya se actualiza sola con Firebase. Este archivo se guardó como respaldo local, pero no se agregó a la tabla global.");
            } else {
              latestLeaderboardEntries = merged;
              if (Router.currentPath() === "tabla") root.innerHTML = viewLeaderboard(latestLeaderboardEntries, latestLeaderboardMeta);
            }
          }
        }
      };
      reader.readAsText(file);
    });
  });

  function buildSummary(state) {
    const accuracy = state.answeredCount > 0 ? Math.round((state.correctCount / state.answeredCount) * 100) : 0;
    return {
      playerName: state.playerName,
      mode: state.mode,
      score: state.score,
      correctCount: state.correctCount,
      answeredCount: state.answeredCount,
      totalQuestions: state.sessions.reduce((sum, s) => sum + s.questions.length, 0),
      accuracy,
      bestStreak: state.bestStreak,
      rank: diplomaticRank(accuracy),
      date: new Date().toISOString()
    };
  }

  async function finishGame() {
    const state = Store.getState();
    const summary = buildSummary(state);
    if (summary.mode === "competencia") {
      try {
        const updated = await submitScore(summary);
        if (updated) latestLeaderboardEntries = updated;
      } catch (e) {
        console.warn("No se pudo enviar el puntaje:", e);
      }
    }
    Router.go("resultados");
  }

  // ---------- Arranque ----------
  Router.start("menu");
})();
