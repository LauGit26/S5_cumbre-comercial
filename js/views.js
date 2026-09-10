/**
 * Cumbre Comercial — Vistas
 * ===========================
 * Cada función recibe datos ya calculados y devuelve un string de HTML.
 * No manipulan el DOM directamente ni guardan estado: solo "dibujan".
 * app.js decide cuándo llamarlas (según la ruta) y las inserta en #app-root.
 */

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

/** Medidor circular de "credibilidad diplomática" (= % de aciertos). */
function credibilityGauge(pct, size) {
  size = size || 120;
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, pct)) / 100);
  const color = pct >= 70 ? "var(--gold)" : pct >= 40 ? "var(--accent)" : "var(--wine)";
  return `
    <svg class="gauge" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" class="gauge-track" stroke-width="10" fill="none" />
      <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="${color}" stroke-width="10" fill="none"
        stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
        transform="rotate(-90 ${size / 2} ${size / 2})" class="gauge-fill" />
      <text x="50%" y="47%" text-anchor="middle" class="gauge-number">${Math.round(pct)}%</text>
      <text x="50%" y="66%" text-anchor="middle" class="gauge-label">credibilidad</text>
    </svg>`;
}

function modeChip(mode) {
  return mode === "estudio" ? `<span class="hud-item">📖 Estudio</span>` : `<span class="hud-item">🏆 Competencia</span>`;
}

/* ---------------------------------------------------------------------
 * MENÚ
 * ------------------------------------------------------------------- */
function viewMenu() {
  return `
    <div class="card menu-card">
      <h1>Cumbre Comercial</h1>
      <p class="subtitle">Proteccionismo vs. libre comercio. Eres delegado(a) en una cumbre de política comercial: analiza mociones, vota con fundamento y construye tu credibilidad diplomática compitiendo con tu grupo.</p>

      <label class="field">
        <span>Tu nombre</span>
        <input type="text" id="input-name" maxlength="24" placeholder="Ej. LavaAzul o RanitaFlor" autocomplete="off" />
      </label>

      <fieldset class="field mode-select">
        <legend>Modo de juego</legend>
        <label class="mode-option">
          <input type="radio" name="mode" value="competencia" checked />
          <span>
            <strong>🏆 Competencia</strong>
            <small>Con tiempo, puntos y racha. Tu resultado entra a la tabla de posiciones.</small>
          </span>
        </label>
        <label class="mode-option">
          <input type="radio" name="mode" value="estudio" />
          <span>
            <strong>📖 Estudio</strong>
            <small>Sin tiempo. Ideal para repasar antes de competir.</small>
          </span>
        </label>
      </fieldset>

      <button class="btn btn-primary btn-lg" data-action="start-game">Abrir la cumbre</button>

      <div class="menu-secondary">
        <button class="btn btn-ghost" data-action="go-leaderboard">Ver tabla de posiciones</button>
        <button class="btn btn-ghost" data-action="go-rules">¿Cómo se puntúa?</button>
      </div>
    </div>`;
}

function viewRules() {
  return `
    <div class="card">
      <h2>¿Cómo funciona la cumbre?</h2>
      <ul class="rules-list">
        <li><strong>3 sesiones de negociación:</strong> reglas de la OMC, el arancel en un país pequeño, y el arancel en un país grande + el debate final.</li>
        <li><strong>Puntos según dificultad:</strong> Recordar 100 · Comprender 150 · Aplicar 200 · Analizar 250.</li>
        <li><strong>Bono por velocidad:</strong> responder rápido en modo Competencia da hasta +50% de puntos extra.</li>
        <li><strong>Bono por racha:</strong> 3 aciertos seguidos = ×1.2, 6 o más = ×1.5.</li>
        <li><strong>Credibilidad diplomática:</strong> un medidor circular que refleja tu % de aciertos acumulado. No hay "vidas": la cumbre siempre se completa.</li>
        <li><strong>Rango diplomático:</strong> al final de cada sesión y de la cumbre, tu precisión te da un título, de "Asesor en formación" a "Embajador Extraordinario".</li>
        <li><strong>Competencia asíncrona:</strong> cada delegado(a) juega cuando puede; todos los resultados llegan a la misma tabla de posiciones.</li>
      </ul>
      <button class="btn btn-primary" data-action="rules-back">Entendido</button>
    </div>`;
}

/* ---------------------------------------------------------------------
 * PREGUNTA
 * ------------------------------------------------------------------- */
function viewQuestion(state) {
  const session = state.sessions[state.currentSessionIndex];
  const q = session.questions[state.currentQuestionIndex];
  const last = state.lastAnswer;
  const accuracy = state.answeredCount > 0 ? Math.round((state.correctCount / state.answeredCount) * 100) : 50;

  const optionsHTML = q.shuffledOptions.map((opt, idx) => {
    let cls = "option-btn";
    let disabled = "";
    if (last) {
      disabled = "disabled";
      if (idx === last.correctIndex) cls += " correct";
      else if (idx === last.selectedIndex) cls += " incorrect";
    }
    return `<button class="${cls}" data-action="select-option" data-index="${idx}" ${disabled}>${escapeHTML(opt)}</button>`;
  }).join("");

  const stampHTML = last
    ? `<div class="stamp ${last.isCorrect ? "stamp-approved" : "stamp-rejected"}">${last.isCorrect ? "APROBADO" : "RECHAZADO"}</div>`
    : "";

  const feedbackHTML = last ? `
    <div class="feedback-box">
      <p class="feedback-title">${last.isCorrect ? `✅ ¡Correcto! +${last.pointsEarned} pts` : (last.selectedIndex === null ? "⏰ ¡Se acabó el tiempo!" : "❌ Incorrecto")}</p>
      <p class="feedback-explanation">${escapeHTML(q.explanation)}</p>
      <button class="btn btn-primary" data-action="next-question">${state.currentQuestionIndex >= session.questions.length - 1 ? "Ver resumen de la sesión →" : "Siguiente moción →"}</button>
    </div>` : "";

  return `
    <div class="game-hud">
      <span class="hud-item">${session.icon} ${escapeHTML(session.title)}</span>
      <span class="hud-item">Moción ${state.currentQuestionIndex + 1}/${session.questions.length}</span>
      <span class="hud-item">⭐ ${state.score} pts</span>
      <span class="hud-item">🔥 Racha: ${state.streak}</span>
    </div>
    <div class="timer-track" id="timer-track" style="display:${state.mode === "competencia" ? "block" : "none"}">
      <div id="timer-bar" class="timer-bar" style="width:100%"></div>
    </div>
    <div class="card question-card">
      ${stampHTML}
      <span class="badge">${q.level}</span>
      <h2>${escapeHTML(q.text)}</h2>
      <div class="options-grid ${q.type === "tf" ? "two-col" : ""}">${optionsHTML}</div>
      ${feedbackHTML}
    </div>`;
}

/* ---------------------------------------------------------------------
 * RESUMEN DE SESIÓN
 * ------------------------------------------------------------------- */
function viewSessionSummary(state) {
  const session = state.sessions[state.currentSessionIndex];
  const correct = session.answers.filter((a) => a.isCorrect).length;
  const total = session.questions.length;
  const pointsThisSession = session.answers.reduce((sum, a) => sum + a.pointsEarned, 0);
  const accuracy = Math.round((correct / total) * 100);
  const isLastSession = state.currentSessionIndex >= state.sessions.length - 1;

  return `
    <div class="card session-summary-card">
      <span class="session-summary-icon">${session.icon}</span>
      <h2>Sesión concluida: "${escapeHTML(session.title)}"</h2>
      ${credibilityGauge(accuracy, 130)}
      <p class="rank-badge">${diplomaticRank(accuracy)}</p>
      <p class="subtitle">${correct}/${total} mociones acertadas · +${pointsThisSession} pts en esta sesión</p>
      <button class="btn btn-primary btn-lg" data-action="session-continue">${isLastSession ? "Ver resultado final de la cumbre →" : "Continuar a la siguiente sesión →"}</button>
    </div>`;
}

/* ---------------------------------------------------------------------
 * RESULTADOS FINALES
 * ------------------------------------------------------------------- */
function viewResults(state) {
  const accuracy = state.answeredCount > 0 ? Math.round((state.correctCount / state.answeredCount) * 100) : 0;
  const rank = diplomaticRank(accuracy);

  let message = "";
  if (state.mode === "estudio") {
    message = "Modo estudio: este resultado no se guarda en la tabla de posiciones. ¡Ahora inténtalo en modo Competencia!";
  } else if (accuracy >= 90) {
    message = "Cumbre cerrada con éxito: dominas el debate entre proteccionismo y libre comercio. 🏛️";
  } else if (accuracy >= 60) {
    message = "Buena negociación. Repasa los temas donde perdiste credibilidad antes del examen.";
  } else {
    message = "La cumbre fue difícil. Prueba el modo Estudio para repasar con calma antes de competir de nuevo.";
  }

  return `
    <div class="card result-card">
      <h2>Cumbre concluida</h2>
      ${credibilityGauge(accuracy, 150)}
      <p class="rank-badge rank-badge-lg">${rank}</p>
      <div class="result-score">${state.score} pts</div>
      <div class="result-stats">
        <div><span>${state.correctCount}/${state.answeredCount}</span><small>Correctas</small></div>
        <div><span>${accuracy}%</span><small>Precisión</small></div>
        <div><span>${state.bestStreak}</span><small>Mejor racha</small></div>
      </div>
      <p class="result-message">${message}</p>
      <div class="result-actions">
        <button class="btn btn-primary" data-action="play-again">Jugar de nuevo</button>
        <button class="btn btn-secondary" data-action="go-leaderboard">Ver tabla de posiciones</button>
        <button class="btn btn-ghost" data-action="download-result">⬇️ Descargar mi resultado</button>
      </div>
    </div>`;
}

/* ---------------------------------------------------------------------
 * TABLA DE POSICIONES
 * ------------------------------------------------------------------- */
function leaderboardRowsHTML(entries) {
  if (!entries || entries.length === 0) {
    return `<p class="empty-state">Todavía no hay resultados. ¡Sé la primera persona en jugar!</p>`;
  }
  const rows = entries.map((entry, i) => {
    const date = entry.date ? new Date(entry.date).toLocaleDateString() : "—";
    return `<tr>
      <td>${i + 1}</td>
      <td>${escapeHTML(entry.playerName)}</td>
      <td>${entry.score}</td>
      <td>${entry.accuracy}%</td>
      <td>${escapeHTML(entry.rank || "—")}</td>
      <td>${date}</td>
    </tr>`;
  }).join("");
  return `
    <div class="leaderboard-table-scroll">
      <table class="leaderboard-table">
        <thead><tr><th>#</th><th>Nombre</th><th>Puntos</th><th>Precisión</th><th>Rango</th><th>Fecha</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function viewLeaderboard(entries, meta) {
  const statusClass = meta.remote ? "is-remote" : "is-local";
  const statusText = meta.remote ? "🌐 Tabla global en vivo" : (meta.error ? "⚠️ Sin conexión — tabla local" : "💾 Tabla local (solo este navegador)");
  const subtitle = meta.remote
    ? "Competencia asíncrona: cada delegado(a) juega cuando puede y su resultado aparece aquí solo. Solo la persona docente puede reiniciarla."
    : "Los resultados se guardan en este navegador. Para una tabla de todo el grupo, configura Firebase (ver README.md).";

  return `
    <div class="card leaderboard-card">
      <div class="leaderboard-header">
        <h2>🏆 Tabla de posiciones</h2>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>
      <p class="subtitle">${subtitle}</p>
      <div id="leaderboard-rows">${leaderboardRowsHTML(entries)}</div>
      <div class="leaderboard-tools">
        <label class="btn btn-ghost file-btn">
          ⬆️ Importar resultado(s)
          <input type="file" id="input-import" accept="application/json" multiple hidden />
        </label>
        <button class="btn btn-ghost" data-action="export-leaderboard">⬇️ Exportar tabla completa</button>
        <button class="btn btn-danger-ghost" data-action="reset-leaderboard">🗑️ Reiniciar tabla (docente)</button>
      </div>
      <button class="btn btn-primary" data-action="go-menu">Volver al menú</button>
    </div>`;
}
