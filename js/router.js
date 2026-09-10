/**
 * Cumbre Comercial — Mini router por hash de URL
 * =================================================
 * Cada pantalla tiene su propia dirección (#/menu, #/sesion/1/pregunta/2,
 * #/resultados, #/tabla), así que el botón "atrás" del navegador funciona,
 * y en teoría podrías compartir un enlace directo a una pantalla. Es una
 * arquitectura deliberadamente distinta a la de TradeQuest/DataQuest, que
 * simplemente mostraban/ocultaban secciones fijas del HTML.
 *
 * Uso:
 *   Router.register("menu", () => renderMenu());
 *   Router.register("sesion/:s/pregunta/:q", (params) => renderQuestion(params));
 *   Router.start("menu"); // ruta inicial si no hay hash
 *   Router.go("resultados"); // navega por código
 */

const Router = (function () {
  const routes = []; // { pattern: RegExp, keys: string[], handler: fn }

  function compile(pattern) {
    const keys = [];
    const regexStr = pattern
      .split("/")
      .map((segment) => {
        if (segment.startsWith(":")) {
          keys.push(segment.slice(1));
          return "([^/]+)";
        }
        return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      })
      .join("/");
    return { regex: new RegExp(`^${regexStr}$`), keys };
  }

  function register(pattern, handler) {
    const { regex, keys } = compile(pattern);
    routes.push({ regex, keys, handler });
  }

  function currentPath() {
    return (location.hash || "").replace(/^#\/?/, "");
  }

  function resolve() {
    const path = currentPath();
    for (const route of routes) {
      const match = path.match(route.regex);
      if (match) {
        const params = {};
        route.keys.forEach((key, i) => { params[key] = decodeURIComponent(match[i + 1]); });
        route.handler(params);
        return true;
      }
    }
    return false;
  }

  function go(path) {
    if (currentPath() === path) {
      resolve(); // misma ruta: re-renderiza de una vez (no dispara hashchange)
    } else {
      location.hash = "#/" + path;
    }
  }

  function replace(path) {
    const url = location.pathname + location.search + "#/" + path;
    history.replaceState(null, "", url);
    resolve();
  }

  function start(fallbackPath) {
    window.addEventListener("hashchange", resolve);
    if (!currentPath()) {
      replace(fallbackPath);
    } else if (!resolve()) {
      replace(fallbackPath);
    }
  }

  return { register, go, replace, start, currentPath };
})();
