(function (global) {
  "use strict";

  const lote = [
    ["prueba-001","ASTRONOMÍA","El satélite natural de nuestro planeta","LA LUNA",3],
    ["prueba-002","ASTRONOMÍA","El planeta conocido por sus anillos","SATURNO",3],
    ["prueba-003","ASTRONOMÍA","Nuestra estrella más cercana","EL SOL",2],
    ["prueba-004","ASTRONOMÍA","Una galaxia que vemos desde la Tierra","LA VÍA LÁCTEA",3],
    ["prueba-005","ASTRONOMÍA","Un viajero de hielo y polvo","COMETA",2],
    ["prueba-006","ASTRONOMÍA","Explosión final de una estrella masiva","SUPERNOVA",3],
    ["prueba-007","ASTRONOMÍA","El planeta rojo","MARTE",2],
    ["prueba-008","ASTRONOMÍA","Región de la que ni la luz escapa","AGUJERO NEGRO",2],
    ["prueba-009","ASTRONOMÍA","Movimiento de un planeta alrededor de una estrella","ÓRBITA PLANETARIA",3],
    ["prueba-010","CIENCIA","La unidad básica de la vida","LA CÉLULA",2],
    ["prueba-011","CIENCIA","Cambio de líquido a gas","EVAPORACIÓN",2],
    ["prueba-012","CIENCIA","Fuerza que nos mantiene sobre el suelo","GRAVEDAD",3],
    ["prueba-013","CIENCIA","Partícula con carga negativa","ELECTRÓN",2],
    ["prueba-014","CIENCIA","La velocidad límite del universo","LA VELOCIDAD DE LA LUZ",3],
    ["prueba-015","CIENCIA","Proceso mediante el que las plantas obtienen energía","FOTOSÍNTESIS",3],
    ["prueba-016","CIENCIA","Molécula que contiene información genética","ADN",3],
    ["prueba-017","CIENCIA","Medida del calor o del frío","TEMPERATURA",2],
    ["prueba-018","CIENCIA","Transformación de sólido a líquido","FUSIÓN",2],
    ["prueba-019","TECNOLOGÍA","Red mundial de ordenadores","INTERNET",2],
    ["prueba-020","TECNOLOGÍA","Sistemas capaces de aprender","INTELIGENCIA ARTIFICIAL",3],
    ["prueba-021","TECNOLOGÍA","Conjunto ordenado de instrucciones","ALGORITMO",2],
    ["prueba-022","TECNOLOGÍA","Almacén remoto de información","LA NUBE",2],
    ["prueba-023","TECNOLOGÍA","Programa malicioso que se propaga","VIRUS INFORMÁTICO",2],
    ["prueba-024","TECNOLOGÍA","Identificación mediante rasgos del cuerpo","BIOMETRÍA",3],
    ["prueba-025","TECNOLOGÍA","Máquina que ejecuta tareas automáticamente","ROBOT",3],
    ["prueba-026","TECNOLOGÍA","Representación digital de la realidad","REALIDAD VIRTUAL",3],
    ["prueba-027","TECNOLOGÍA","Protección de sistemas y datos","CIBERSEGURIDAD",3],
    ["prueba-037","NATURALEZA","Movimiento continuo entre tierra y atmósfera","EL CICLO DEL AGUA",1],
    ["prueba-038","NATURALEZA","Bosque cálido de lluvias abundantes","SELVA TROPICAL",1],
    ["prueba-039","NATURALEZA","Gran masa de hielo en movimiento","GLACIAR",1],
    ["prueba-040","NATURALEZA","Corriente de agua que desemboca en otra","AFLUENTE",1],
    ["prueba-041","NATURALEZA","Conjunto de seres vivos y su entorno","ECOSISTEMA",1],
    ["prueba-042","NATURALEZA","Elevación natural con una cima","MONTAÑA",1],
    ["prueba-043","NATURALEZA","Zona donde el río llega al mar","DESEMBOCADURA",1],
    ["prueba-044","NATURALEZA","Fenómeno luminoso de las regiones polares","AURORA BOREAL",1],
    ["prueba-045","NATURALEZA","Capa gaseosa que rodea un planeta","ATMÓSFERA",1],
    ["prueba-335","ANIMALES","Mamífero con pico de pato que pone huevos","ORNITORRINCO",1],
    ["prueba-336","ANIMALES","Reptil que cambia de color","CAMALEÓN",1],
    ["prueba-337","ANIMALES","El animal más grande que ha existido","BALLENA AZUL",1],
    ["prueba-338","ANIMALES","El animal terrestre más veloz","GUEPARDO",1],
    ["prueba-339","ANIMALES","Ave que incuba el huevo sobre sus patas en la Antártida","PINGÜINO EMPERADOR",1],
    ["prueba-340","ANIMALES","Marsupial australiano que salta","CANGURO",1],
    ["prueba-341","ANIMALES","Oso blanco y negro que come bambú","OSO PANDA",1],
    ["prueba-342","ANIMALES","Marsupial que vive en los eucaliptos","KOALA",1],
    ["prueba-343","ANIMALES","El único mamífero capaz de volar","MURCIÉLAGO",1],
    ["prueba-344","ANIMALES","Tiene tres corazones y ocho brazos","PULPO",1],
    ["prueba-345","ANIMALES","El animal más alto del mundo","JIRAFA",1],
    ["prueba-346","ANIMALES","El mayor animal terrestre","ELEFANTE AFRICANO",1],
    ["prueba-347","ANIMALES","Felino en peligro que vive en la península","LINCE IBÉRICO",1],
    ["prueba-348","ANIMALES","Rapaz majestuosa de las montañas","ÁGUILA REAL",1],
    ["prueba-349","ANIMALES","Pez cuyo macho lleva a las crías","CABALLITO DE MAR",1],
    ["prueba-350","ANIMALES","Insecto que pone todos los huevos de la colmena","ABEJA REINA",1],
    ["prueba-351","ANIMALES","Insecto que migra entre Canadá y México","MARIPOSA MONARCA",1],
    ["prueba-352","ANIMALES","Gran depredador de los océanos","TIBURÓN BLANCO",1],
    ["prueba-353","ANIMALES","Mamífero marino muy inteligente","DELFÍN",1],
    ["prueba-354","ANIMALES","Rumiante del desierto con una sola joroba","DROMEDARIO",1],
    ["prueba-355","ANIMALES","Rumiante de dos jorobas","CAMELLO",1],
    ["prueba-356","ANIMALES","Reptil de mandíbula enorme que vive en ríos","COCODRILO",1],
    ["prueba-357","ANIMALES","Insecto que brilla en la oscuridad","LUCIÉRNAGA",1],
    ["prueba-358","ANIMALES","Ave que puede girar la cabeza casi por completo","BÚHO",1],
    ["prueba-359","ANIMALES","Roedor constructor de presas","CASTOR",1],
  ];

  const existentes = Array.isArray(global.aletheiaPaneles) ? global.aletheiaPaneles : [];
  const ids = new Set(existentes.map(panel => panel.id));
  const nuevos = lote
    .filter(([id]) => !ids.has(id))
    .map(([id, categoria, pista, solucion, nivel]) => Object.freeze({ id, categoria, pista, solucion, nivel }));

  global.aletheiaPaneles = Object.freeze([...existentes, ...nuevos]);
})(window);

