(function (global) {
  "use strict";

  const lote = [
    ["prueba-001", "ASTRONOMÍA", "El satélite natural de nuestro planeta", "LA LUNA"],
    ["prueba-002", "ASTRONOMÍA", "El planeta conocido por sus anillos", "SATURNO"],
    ["prueba-003", "ASTRONOMÍA", "Nuestra estrella más cercana", "EL SOL"],
    ["prueba-004", "ASTRONOMÍA", "Una galaxia que vemos desde la Tierra", "LA VÍA LÁCTEA"],
    ["prueba-005", "ASTRONOMÍA", "Un viajero de hielo y polvo", "COMETA"],
    ["prueba-006", "ASTRONOMÍA", "Explosión final de una estrella masiva", "SUPERNOVA"],
    ["prueba-007", "ASTRONOMÍA", "El planeta rojo", "MARTE"],
    ["prueba-008", "ASTRONOMÍA", "Región de la que ni la luz escapa", "AGUJERO NEGRO"],
    ["prueba-009", "ASTRONOMÍA", "Movimiento de un planeta alrededor de una estrella", "ÓRBITA PLANETARIA"],
    ["prueba-010", "CIENCIA", "La unidad básica de la vida", "LA CÉLULA"],
    ["prueba-011", "CIENCIA", "Cambio de líquido a gas", "EVAPORACIÓN"],
    ["prueba-012", "CIENCIA", "Fuerza que nos mantiene sobre el suelo", "GRAVEDAD"],
    ["prueba-013", "CIENCIA", "Partícula con carga negativa", "ELECTRÓN"],
    ["prueba-014", "CIENCIA", "La velocidad límite del universo", "LA VELOCIDAD DE LA LUZ"],
    ["prueba-015", "CIENCIA", "Proceso mediante el que las plantas obtienen energía", "FOTOSÍNTESIS"],
    ["prueba-016", "CIENCIA", "Molécula que contiene información genética", "ADN"],
    ["prueba-017", "CIENCIA", "Medida del calor o del frío", "TEMPERATURA"],
    ["prueba-018", "CIENCIA", "Transformación de sólido a líquido", "FUSIÓN"],
    ["prueba-019", "TECNOLOGÍA", "Red mundial de ordenadores", "INTERNET"],
    ["prueba-020", "TECNOLOGÍA", "Sistemas capaces de aprender", "INTELIGENCIA ARTIFICIAL"],
    ["prueba-021", "TECNOLOGÍA", "Conjunto ordenado de instrucciones", "ALGORITMO"],
    ["prueba-022", "TECNOLOGÍA", "Almacén remoto de información", "LA NUBE"],
    ["prueba-023", "TECNOLOGÍA", "Programa malicioso que se propaga", "VIRUS INFORMÁTICO"],
    ["prueba-024", "TECNOLOGÍA", "Identificación mediante rasgos del cuerpo", "BIOMETRÍA"],
    ["prueba-025", "TECNOLOGÍA", "Máquina que ejecuta tareas automáticamente", "ROBOT"],
    ["prueba-026", "TECNOLOGÍA", "Representación digital de la realidad", "REALIDAD VIRTUAL"],
    ["prueba-027", "TECNOLOGÍA", "Protección de sistemas y datos", "CIBERSEGURIDAD"],
    ["prueba-037", "NATURALEZA", "Movimiento continuo entre tierra y atmósfera", "EL CICLO DEL AGUA"],
    ["prueba-038", "NATURALEZA", "Bosque cálido de lluvias abundantes", "SELVA TROPICAL"],
    ["prueba-039", "NATURALEZA", "Gran masa de hielo en movimiento", "GLACIAR"],
    ["prueba-040", "NATURALEZA", "Corriente de agua que desemboca en otra", "AFLUENTE"],
    ["prueba-041", "NATURALEZA", "Conjunto de seres vivos y su entorno", "ECOSISTEMA"],
    ["prueba-042", "NATURALEZA", "Elevación natural con una cima", "MONTAÑA"],
    ["prueba-043", "NATURALEZA", "Zona donde el río llega al mar", "DESEMBOCADURA"],
    ["prueba-044", "NATURALEZA", "Fenómeno luminoso de las regiones polares", "AURORA BOREAL"],
    ["prueba-045", "NATURALEZA", "Capa gaseosa que rodea un planeta", "ATMÓSFERA"],
    ["prueba-335", "ANIMALES", "Mamífero con pico de pato que pone huevos", "ORNITORRINCO"],
    ["prueba-336", "ANIMALES", "Reptil que cambia de color", "CAMALEÓN"],
    ["prueba-337", "ANIMALES", "El animal más grande que ha existido", "BALLENA AZUL"],
    ["prueba-338", "ANIMALES", "El animal terrestre más veloz", "GUEPARDO"],
    ["prueba-339", "ANIMALES", "Ave que incuba el huevo sobre sus patas en la Antártida", "PINGÜINO EMPERADOR"],
    ["prueba-340", "ANIMALES", "Marsupial australiano que salta", "CANGURO"],
    ["prueba-341", "ANIMALES", "Oso blanco y negro que come bambú", "OSO PANDA"],
    ["prueba-342", "ANIMALES", "Marsupial que vive en los eucaliptos", "KOALA"],
    ["prueba-343", "ANIMALES", "El único mamífero capaz de volar", "MURCIÉLAGO"],
    ["prueba-344", "ANIMALES", "Tiene tres corazones y ocho brazos", "PULPO"],
    ["prueba-345", "ANIMALES", "El animal más alto del mundo", "JIRAFA"],
    ["prueba-346", "ANIMALES", "El mayor animal terrestre", "ELEFANTE AFRICANO"],
    ["prueba-347", "ANIMALES", "Felino en peligro que vive en la península", "LINCE IBÉRICO"],
    ["prueba-348", "ANIMALES", "Rapaz majestuosa de las montañas", "ÁGUILA REAL"],
    ["prueba-349", "ANIMALES", "Pez cuyo macho lleva a las crías", "CABALLITO DE MAR"],
    ["prueba-350", "ANIMALES", "Insecto que pone todos los huevos de la colmena", "ABEJA REINA"],
    ["prueba-351", "ANIMALES", "Insecto que migra entre Canadá y México", "MARIPOSA MONARCA"],
    ["prueba-352", "ANIMALES", "Gran depredador de los océanos", "TIBURÓN BLANCO"],
    ["prueba-353", "ANIMALES", "Mamífero marino muy inteligente", "DELFÍN"],
    ["prueba-354", "ANIMALES", "Rumiante del desierto con una sola joroba", "DROMEDARIO"],
    ["prueba-355", "ANIMALES", "Rumiante de dos jorobas", "CAMELLO"],
    ["prueba-356", "ANIMALES", "Reptil de mandíbula enorme que vive en ríos", "COCODRILO"],
    ["prueba-357", "ANIMALES", "Insecto que brilla en la oscuridad", "LUCIÉRNAGA"],
    ["prueba-358", "ANIMALES", "Ave que puede girar la cabeza casi por completo", "BÚHO"],
    ["prueba-359", "ANIMALES", "Roedor constructor de presas", "CASTOR"]
  ];

  const existentes = Array.isArray(global.aletheiaPaneles) ? global.aletheiaPaneles : [];
  const ids = new Set(existentes.map(panel => panel.id));
  const nuevos = lote
    .filter(([id]) => !ids.has(id))
    .map(([id, categoria, pista, solucion]) => Object.freeze({ id, categoria, pista, solucion }));

  global.aletheiaPaneles = Object.freeze([...existentes, ...nuevos]);
})(window);

