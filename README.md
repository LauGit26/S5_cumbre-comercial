# Cumbre Comercial — Proteccionismo vs. libre comercio

Simulación interactiva para que el estudiantado **compita, gane puntos y aprenda** sobre política comercial: barreras arancelarias y no arancelarias, principios de la OMC (Nación Más Favorecida, trato nacional), el efecto de un arancel en un país pequeño y en un país grande, y el debate entre proteccionismo y libre comercio.

Eres delegado(a) en una cumbre: cada pregunta es una "moción" que debes votar con fundamento, y tu precisión construye tu **credibilidad diplomática**.

Es un sitio **100% estático** (HTML + CSS + JavaScript puro, sin frameworks ni backend) y totalmente **responsive**. Se puede editar directamente en Visual Studio Code y publicar en minutos.

## En qué se diferencia de TradeQuest y DataQuest

Esta es la tercera de la familia de juegos, y usa una **arquitectura de código distinta** a propósito:

- **TradeQuest**: una clase de juego + pantallas HTML fijas que se muestran/ocultan.
- **DataQuest**: un mapa de nodos por capítulos.
- **Cumbre Comercial**: un **router por URL** (cada pantalla tiene su propia dirección, ej. `#/sesion/1/pregunta/3`) + un **store de estado central** + **vistas que se dibujan dinámicamente** con HTML generado en JavaScript, todo conectado por un solo listener de eventos ("delegación de eventos") en vez de decenas de botones con su propio listener.

En vez de "vidas" o "estrellas", aquí el indicador es un **medidor circular de credibilidad diplomática** (tu % de aciertos acumulado) y, al final de cada sesión y de toda la cumbre, un **rango diplomático** de sabor ("Asesor en formación" → "Embajador Extraordinario"). La tabla de posiciones funciona igual que en los otros dos juegos (local por navegador, o global en vivo con Firebase).

## Contenido del proyecto

```
cumbre-comercial/
├── index.html               → estructura mínima: un contenedor #app-root donde se dibuja todo
├── css/styles.css           → apariencia visual (tema "cumbre diplomática": navy y dorado)
├── js/questions.js          → EL BANCO DE PREGUNTAS, agrupado en sesiones
├── js/scoring.js            → funciones puras de puntaje, mezcla de opciones y rango diplomático
├── js/store.js              → estado central de la partida (un solo objeto)
├── js/router.js             → mini-router por hash de URL (#/menu, #/sesion/0/pregunta/2, …)
├── js/views.js               → funciones que devuelven el HTML de cada pantalla
├── js/app.js                 → conecta rutas + estado + vistas + temporizador + eventos
├── js/firebase-config.js    → credenciales para la tabla de posiciones GLOBAL (opcional)
├── js/leaderboard.js         → tabla de posiciones (modo local o modo global en tiempo real)
├── package.json              → scripts opcionales para probar/publicar desde la terminal
└── README.md                  → este archivo
```

## Cómo se juega

1. La persona estudiante escribe su nombre y elige modo **Competencia** (con tiempo, puntos y racha; el resultado entra a la tabla de posiciones) o **Estudio** (sin tiempo).
2. La cumbre tiene **3 sesiones de negociación**: reglas de la OMC, el arancel en un país pequeño, y el arancel en un país grande + el debate final. Se juegan en orden.
3. Cada "moción" (pregunta) se responde tocando una opción. Un sello de **"APROBADO"** o **"RECHAZADO"** marca la respuesta, y el puntaje depende de:
   - **Nivel cognitivo**: Recordar (100 pts) · Comprender (150) · Aplicar (200) · Analizar (250).
   - **Velocidad** (modo Competencia): responder rápido da hasta +50% de bono.
   - **Racha**: 3 aciertos seguidos = ×1.2, 6 o más = ×1.5.
4. Al terminar una sesión, aparece un resumen con el **medidor de credibilidad** y el **rango diplomático** ganado en esa sesión.
5. Al completar las 3 sesiones se muestra el resultado final (puntaje, precisión, mejor racha, rango diplomático final) y, en modo Competencia, se envía a la tabla de posiciones.
6. Después de cada moción se ve la respuesta correcta y una breve explicación — así el juego también sirve para **aprender**.

## Editar las preguntas o las sesiones

Abre `js/questions.js` en VS Code. El archivo es una lista `SESSIONS`, y cada sesión tiene un título, un ícono, una "convocatoria" (texto de ambientación) y su lista de preguntas:

```js
{
  id: "reglas",
  title: "Sesión de apertura: las reglas del comercio mundial",
  icon: "🏛️",
  briefing: "Texto breve de ambientación.",
  questions: [
    {
      type: "mc",              // "mc" (selección única) o "tf" (verdadero/falso)
      level: "Comprender",     // Recordar | Comprender | Aplicar | Analizar
      text: "Enunciado...",
      options: ["A", "B", "C", "D"],
      correctIndex: 1,         // índice de la opción correcta (0 = primera)
      explanation: "Retroalimentación que ve el estudiante."
    }
  ]
}
```

Puedes agregar preguntas a una sesión existente, o crear una sesión nueva completa (otro objeto en `SESSIONS`) — todo lo demás (router, puntaje, tabla de posiciones) se ajusta solo.

## Probarlo localmente en VS Code

**Opción rápida (recomendada): extensión Live Server**
1. Instala la extensión **Live Server** (Ritwick Dey).
2. Clic derecho sobre `index.html` → **"Open with Live Server"**.
3. Prueba también con la ventana angosta (o herramientas de desarrollador en modo celular) para confirmar que es responsive.

> Nota técnica: como este juego usa direcciones tipo `#/menu`, si abres el archivo `index.html` con doble clic (sin servidor) puede que la navegación no funcione igual de bien en todos los navegadores. Usa siempre Live Server o `npx serve .` para probarlo, tal como harás cuando esté publicado.

**Alternativa por terminal:**
```
npx serve .
```

## Publicarlo como webapp desde VS Code

Las mismas tres opciones que en TradeQuest y DataQuest:

> Si en tu computadora la terminal de VS Code usa PowerShell y tuviste problemas con `git` o `npm`, usa Símbolo del sistema (cmd) en vez de PowerShell, o corrige la política con `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

### Opción 1 — GitHub Pages
```
git init
git add .
git commit -m "Cumbre Comercial: juego de proteccionismo y libre comercio"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/cumbre-comercial.git
git push -u origin main

npm install
npm run deploy
```
Luego, en GitHub → Settings → Pages, confirma que la fuente sea la rama `gh-pages`. Tu juego quedará en `https://TU-USUARIO.github.io/cumbre-comercial/`.

### Opción 2 — Netlify (arrastrar y soltar)
Entra a [app.netlify.com/drop](https://app.netlify.com/drop) y arrastra la carpeta `cumbre-comercial` completa.

### Opción 3 — Vercel
```
npm install -g vercel
vercel
```

## Tabla de posiciones global (competencia asíncrona, con reinicio solo para la persona docente)

Igual que en TradeQuest y DataQuest: por defecto cada estudiante guarda su puntaje solo en su navegador. Para una tabla compartida que se actualiza sola conforme cada delegado(a) termina su cumbre —sin que nadie tenga que jugar al mismo tiempo—, conecta Firebase.

**¿Ya configuraste Firebase para TradeQuest o DataQuest?** Reutiliza el mismo proyecto: copia el mismo `firebaseConfig` en `js/firebase-config.js` de este proyecto, y agrega la regla de seguridad para la colección `cumbre_scores` (ver abajo) junto a las que ya tengas.

Si es la primera vez, sigue estos pasos:

1. **Crear el proyecto**: [console.firebase.google.com](https://console.firebase.google.com) → nuevo proyecto.
2. **Activar Firestore**: Compilación → Firestore Database → Crear base de datos (modo producción).
3. **Activar la cuenta docente**: Compilación → Authentication → Correo electrónico/contraseña → Users → Add user.
4. **Registrar la app web**: Configuración del proyecto → General → Tus apps → `</>` → copia el objeto `firebaseConfig`.
5. **Pegar la configuración** en `js/firebase-config.js`:

```js
const FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123"
};

const TEACHER_EMAIL = "tu-correo@ucr.ac.cr";
```

6. **Reglas de seguridad** — Firestore Database → pestaña Reglas:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cumbre_scores/{scoreId} {
      allow create: if request.resource.data.playerName is string
                    && request.resource.data.playerName.size() > 0
                    && request.resource.data.playerName.size() < 40
                    && request.resource.data.score is number
                    && request.resource.data.score >= 0
                    && request.resource.data.score < 100000;
      allow read: if true;
      allow update: if false;
      allow delete: if request.auth != null
                    && request.auth.token.email == "tu-correo@ucr.ac.cr";
    }
  }
}
```

> Si ya tienes reglas para `scores` o `dataquest_scores` en el mismo proyecto, agrega este bloque `match /cumbre_scores/{scoreId} { ... }` junto a los anteriores, dentro del mismo `match /databases/{database}/documents { }`.

7. **Probar y publicar**: prueba localmente que aparece "🌐 Tabla global en vivo", abre el sitio en otro navegador/celular y confirma que un resultado nuevo aparece solo, sin recargar. Luego publica con cualquiera de las tres opciones de arriba.

> **Nota sobre seguridad:** la clave `apiKey` de Firebase es segura de exponer públicamente; lo que protege tus datos son las reglas de seguridad de Firestore. Si GitHub muestra una alerta de "secreto expuesto" al subir `firebase-config.js`, es un aviso genérico y esperado — no necesitas rotar la clave, solo confirmar que las reglas estén bien publicadas.

### Modo de respaldo sin internet
Cada estudiante puede descargar su resultado con **"⬇️ Descargar mi resultado"** y la persona docente puede cargarlo con **"⬆️ Importar resultado(s)"** como respaldo si alguien se queda sin conexión a mitad de la partida.

## Personalización rápida

- **Colores**: variables al inicio de `css/styles.css` (`--gold`, `--accent`, `--wine`).
- **Tiempo por pregunta o puntaje**: `LEVEL_POINTS` y `LEVEL_TIME_SECONDS` en `js/scoring.js`.
- **Umbrales de rango diplomático**: función `diplomaticRank` en `js/scoring.js`.
- **Sesiones y preguntas**: `js/questions.js`.
- **Nuevas pantallas**: agrega una función de vista en `js/views.js` y regístrala con `Router.register(...)` en `js/app.js`.
