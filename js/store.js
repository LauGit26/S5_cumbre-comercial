/**
 * Cumbre Comercial — Store de estado
 * ====================================
 * A diferencia de TradeQuest/DataQuest (una clase "juego" con métodos que
 * manipulan el DOM directamente), aquí toda la partida vive en UN objeto
 * de estado inmutable-por-convención. Las vistas (views.js) son funciones
 * puras que reciben el estado y devuelven HTML; el router (router.js)
 * decide qué vista mostrar; y Store.setState(...) es la única forma de
 * cambiar el estado, notificando a quien esté suscrito (normalmente,
 * "vuelve a dibujar la pantalla actual").
 */

const Store = (function () {
  let state = initialState();
  const listeners = [];

  function initialState() {
    return {
      playerName: "",
      mode: "competencia",
      sessions: [],           // se llena al iniciar partida (prepareSessions)
      currentSessionIndex: -1,
      currentQuestionIndex: -1,
      score: 0,
      streak: 0,
      bestStreak: 0,
      correctCount: 0,
      answeredCount: 0,
      lastAnswer: null,       // { isCorrect, pointsEarned, correctIndex, selectedIndex }
      soundOn: true
    };
  }

  function getState() {
    return state;
  }

  function setState(patch) {
    state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
    listeners.forEach((fn) => fn(state));
  }

  function subscribe(fn) {
    listeners.push(fn);
    return () => {
      const idx = listeners.indexOf(fn);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }

  function resetGame() {
    const soundOn = state.soundOn;
    state = initialState();
    state.soundOn = soundOn;
  }

  return { getState, setState, subscribe, resetGame };
})();
