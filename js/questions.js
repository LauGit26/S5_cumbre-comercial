/**
 * Cumbre Comercial — Banco de preguntas
 * Curso: Economía Internacional — Política comercial, proteccionismo y libre comercio
 *
 * CÓMO EDITAR / AGREGAR PREGUNTAS O SESIONES
 * --------------------------------------------
 * SESSIONS es una lista de "sesiones de la cumbre" (rondas de negociación).
 * Cada sesión tiene un título, un ícono, una breve "convocatoria" (texto de
 * ambientación) y su lista de preguntas.
 *
 * Cada pregunta tiene esta forma:
 *  {
 *    type: "mc" | "tf",
 *    level: "Recordar" | "Comprender" | "Aplicar" | "Analizar",
 *    text: "Enunciado...",
 *    options: ["A", "B", "C", "D"],   // en "tf" se ignora, se usa Verdadero/Falso
 *    correctIndex: 0,                 // 0 = Verdadero en las de tipo "tf"
 *    explanation: "Retroalimentación que ve el estudiante."
 *  }
 *
 * Agrega preguntas a una sesión existente, o crea una sesión nueva
 * agregando otro objeto a SESSIONS. Todo lo demás se arma solo.
 */

const SESSIONS = [
  {
    id: "reglas",
    title: "Sesión de apertura: las reglas del comercio mundial",
    icon: "🏛️",
    briefing: "Antes de negociar, todo delegado debe dominar las reglas del juego: la OMC, sus principios y los tipos de barreras comerciales.",
    questions: [
      {
        type: "mc",
        level: "Recordar",
        text: "¿Cuál de las siguientes opciones describe mejor una barrera arancelaria?",
        options: [
          "Una regulación sanitaria aplicada a determinados productos.",
          "Un impuesto o derecho de aduana aplicado a las mercancías importadas.",
          "Una subvención otorgada a productores nacionales.",
          "Una limitación voluntaria de exportaciones."
        ],
        correctIndex: 1,
        explanation: "Un arancel es un impuesto o derecho de aduana que se cobra sobre las mercancías importadas."
      },
      {
        type: "tf",
        level: "Comprender",
        text: "El principio de Nación Más Favorecida (NMF) implica, en términos generales, que una ventaja comercial concedida a un miembro de la OMC debe extenderse a los demás miembros, salvo las excepciones permitidas.",
        correctIndex: 0,
        explanation: "Verdadero. El principio de Nación Más Favorecida obliga a extender a todos los miembros de la OMC cualquier ventaja comercial concedida a uno de ellos, salvo las excepciones permitidas."
      },
      {
        type: "mc",
        level: "Comprender",
        text: "El principio de trato nacional establece principalmente que:",
        options: [
          "todos los países deben cobrar exactamente el mismo arancel.",
          "los productos extranjeros, una vez ingresados al mercado, deben recibir un trato comparable al de los nacionales.",
          "las importaciones deben quedar libres de derechos aduaneros.",
          "los países no pueden proteger la salud pública mediante regulaciones."
        ],
        correctIndex: 1,
        explanation: "El trato nacional exige que, una vez que un producto importado ingresa al mercado, reciba un trato no menos favorable que el otorgado a los productos nacionales."
      },
      {
        type: "mc",
        level: "Recordar",
        text: "¿Cuál de las siguientes es una función de la OMC?",
        options: [
          "Determinar el tipo de cambio de sus miembros.",
          "Resolver diferencias comerciales entre sus miembros.",
          "Establecer directamente los impuestos internos de cada país.",
          "Financiar empresas privadas exportadoras."
        ],
        correctIndex: 1,
        explanation: "Una función central de la OMC es servir como foro para resolver diferencias (disputas) comerciales entre sus miembros."
      },
      {
        type: "mc",
        level: "Comprender",
        text: "¿Cuál de las siguientes medidas corresponde a una barrera no arancelaria?",
        options: ["Arancel ad valorem.", "Arancel específico.", "Reglamento técnico aplicado a una importación.", "Derecho de aduana sobre el valor CIF."],
        correctIndex: 2,
        explanation: "Un reglamento técnico aplicado a una importación es una barrera no arancelaria, a diferencia de los aranceles, que sí son barreras arancelarias."
      }
    ]
  },
  {
    id: "pais-pequeno",
    title: "Sesión de crisis: el arancel en un país pequeño",
    icon: "⚖️",
    briefing: "Costa Rica, como país pequeño, sube un arancel. La comisión debe analizar quién gana, quién pierde y qué pasa con la eficiencia.",
    questions: [
      {
        type: "mc",
        level: "Aplicar",
        text: "Costa Rica establece un arancel sobre un producto importado. Como resultado, el bien extranjero se vuelve más caro y algunos consumidores sustituyen parte de su consumo por producción nacional. ¿Cuál efecto seguirá?",
        options: ["Disminución de la oferta nacional.", "Mayor competencia de las importaciones.", "Aumento de la producción interna del bien protegido.", "Reducción de la recaudación asociada al arancel."],
        correctIndex: 2,
        explanation: "Al encarecerse el bien importado, parte del consumo se sustituye por producción nacional, lo que aumenta la producción interna del bien protegido."
      },
      {
        type: "mc",
        level: "Aplicar",
        text: "En un país pequeño, la imposición de un arancel a la importación normalmente:",
        options: ["eleva el precio mundial del producto.", "reduce el precio mundial del producto.", "no modifica significativamente el precio mundial.", "elimina toda la producción extranjera."],
        correctIndex: 2,
        explanation: "Un país pequeño no tiene poder de mercado suficiente para modificar el precio mundial del bien; por eso se le llama \"tomador de precios\"."
      },
      {
        type: "tf",
        level: "Comprender",
        text: "Se denomina tomador de precios a un país cuya demanda no es suficientemente grande como para modificar significativamente el precio mundial del bien importado.",
        correctIndex: 0,
        explanation: "Verdadero. Un país es \"tomador de precios\" cuando su demanda no es suficientemente grande como para influir en el precio mundial del bien importado."
      },
      {
        type: "mc",
        level: "Aplicar",
        text: "Suponga que Costa Rica, considerado un país pequeño, aumenta el arancel al queso importado. ¿Quiénes tenderían a beneficiarse directamente de esta medida?",
        options: ["Los consumidores nacionales únicamente.", "Los productores nacionales del bien protegido y el Estado mediante recaudación.", "Los productores extranjeros exclusivamente.", "Todos los participantes del mercado por igual."],
        correctIndex: 1,
        explanation: "Los productores nacionales del bien protegido ganan mercado y precio, y el Estado recauda el arancel; ambos se benefician directamente."
      },
      {
        type: "mc",
        level: "Aplicar",
        text: "¿Cuál sería el efecto esperado sobre las personas consumidoras costarricenses de un aumento del arancel a un bien importado?",
        options: ["Pagan un precio menor y consumen una cantidad mayor.", "Pagan un precio mayor y tienden a demandar una cantidad menor.", "Pagan el mismo precio porque el arancel afecta únicamente al productor.", "Reciben directamente la recaudación del arancel."],
        correctIndex: 1,
        explanation: "Un arancel más alto eleva el precio interno del bien, por lo que los consumidores pagan más y tienden a demandar una cantidad menor."
      },
      {
        type: "mc",
        level: "Analizar",
        text: "En el análisis del arancel para un país pequeño, la pérdida de los consumidores es mayor que la suma de la ganancia de los productores y la recaudación del Estado. Esto implica que:",
        options: ["el arancel aumenta necesariamente el bienestar total.", "se genera una pérdida de eficiencia para la economía.", "los consumidores son los principales beneficiarios.", "el comercio internacional aumenta."],
        correctIndex: 1,
        explanation: "Cuando la pérdida de los consumidores supera la suma de la ganancia de productores y la recaudación estatal, se genera una pérdida neta de eficiencia (peso muerto) para la economía."
      },
      {
        type: "tf",
        level: "Comprender",
        text: "En un país pequeño, un arancel eleva el precio interno, aumenta la producción doméstica y reduce la cantidad importada.",
        correctIndex: 0,
        explanation: "Verdadero. Este es exactamente el efecto esperado de un arancel en un país pequeño: sube el precio interno, aumenta la producción nacional y cae la cantidad importada."
      }
    ]
  },
  {
    id: "pais-grande",
    title: "Sesión de negociación: el país grande y el debate final",
    icon: "🤝",
    briefing: "Cuando el país que arancela es grande, sus decisiones mueven el precio mundial. La cumbre cierra con el argumento de la industria naciente y la gran pregunta: ¿libre comercio o protección?",
    questions: [
      {
        type: "mc",
        level: "Analizar",
        text: "Un país grande establece un arancel y reduce considerablemente su demanda de importaciones. ¿Qué puede ocurrir inicialmente en el mercado internacional?",
        options: ["Surge una mayor oferta relativa del bien en el extranjero.", "El precio internacional necesariamente aumenta.", "Los productores extranjeros aumentan automáticamente su producción.", "El comercio mundial del producto se expande."],
        correctIndex: 0,
        explanation: "Al caer la demanda de importaciones de un país grande, se genera inicialmente una mayor oferta relativa disponible del bien en el mercado extranjero."
      },
      {
        type: "mc",
        level: "Analizar",
        text: "Si la caída de las importaciones de un país grande genera un exceso de oferta en el mercado extranjero, ¿qué efecto se espera sobre el precio internacional?",
        options: ["Aumentará.", "Disminuirá.", "Permanecerá obligatoriamente constante.", "Será igual al arancel."],
        correctIndex: 1,
        explanation: "Un exceso de oferta en el mercado extranjero tiende a presionar a la baja el precio internacional del bien."
      },
      {
        type: "mc",
        level: "Analizar",
        text: "Como consecuencia de la disminución del precio internacional provocada por un arancel impuesto por un país grande, los productores extranjeros tenderán a:",
        options: ["aumentar su oferta.", "disminuir su oferta.", "mantener siempre la misma oferta.", "aumentar el arancel del país importador."],
        correctIndex: 1,
        explanation: "Ante un menor precio internacional, los productores extranjeros tienden a disminuir su oferta."
      },
      {
        type: "tf",
        level: "Analizar",
        text: "Cuando un país grande establece un arancel, el efecto final puede incluir un aumento del precio en el país importador, una disminución del precio en el país exportador y una reducción del volumen del comercio internacional.",
        correctIndex: 0,
        explanation: "Verdadero. Este es el resultado típico de un arancel impuesto por un país grande: afecta tanto el precio interno como el precio internacional, y reduce el volumen de comercio."
      },
      {
        type: "mc",
        level: "Comprender",
        text: "El argumento de la industria naciente sostiene que:",
        options: ["ninguna industria debe recibir protección en ninguna circunstancia.", "una actividad puede ser protegida temporalmente mientras desarrolla productividad y competitividad internacional.", "toda industria antigua debe recibir aranceles permanentes.", "únicamente las empresas multinacionales deben ser protegidas."],
        correctIndex: 1,
        explanation: "El argumento de la industria naciente sostiene que una actividad puede protegerse temporalmente mientras desarrolla productividad y competitividad internacional, no de forma permanente."
      },
      {
        type: "tf",
        level: "Analizar",
        text: "La decisión entre mayor libre comercio o mayor protección no puede resolverse únicamente afirmando que una de las dos posiciones siempre es mejor; deben considerarse las características del país, sus sectores productivos, su población, los costos y beneficios y los posibles sesgos de los argumentos utilizados.",
        correctIndex: 0,
        explanation: "Verdadero. La decisión entre más libre comercio o más protección depende de las características del país, sus sectores, la población y los costos y beneficios de cada argumento; no admite una respuesta única y universal."
      }
    ]
  }
];

// No modificar esta línea: expone las sesiones al resto del juego.
if (typeof module !== "undefined") module.exports = SESSIONS;
