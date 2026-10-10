(function (global) {
  "use strict";

  const lote = [
    ["prueba-091", "ALÉTHEIA", "El propósito de una nave extraordinaria", "LA NAVE QUE BUSCA LA VERDAD"],
    ["prueba-092", "ALÉTHEIA", "Centro de procesamiento de la nave", "PROMETEO ALFA"],
    ["prueba-093", "ALÉTHEIA", "Lugar donde se reúne la tripulación", "SALA DE MANDO"],
    ["prueba-094", "ALÉTHEIA", "Sección dedicada al entretenimiento", "MÓDULO OCIO"],
    ["prueba-095", "ALÉTHEIA", "Registro personal de quienes viajan a bordo", "FICHA DE TRIPULACIÓN"],
    ["prueba-096", "ALÉTHEIA", "Sistema que conecta las áreas de la nave", "RED INTERNA"],
    ["prueba-097", "ALÉTHEIA", "Ventana desde la que se estudia el universo", "OBSERVATORIO"],
    ["prueba-098", "ALÉTHEIA", "Zona destinada al cultivo de alimentos", "GRANJA"],
    ["prueba-099", "ALÉTHEIA", "Espacio reservado para las naves auxiliares", "HANGAR"],
    ["prueba-100", "ALÉTHEIA", "Principio que guía toda la misión", "BÚSQUEDA DE LA VERDAD"],
    ["prueba-410", "PERSONAJES", "Navegante que llegó a América en mil cuatrocientos noventa y dos", "CRISTÓBAL COLÓN"],
    ["prueba-411", "PERSONAJES", "El manco de Lepanto", "MIGUEL DE CERVANTES"],
    ["prueba-412", "PERSONAJES", "Genio del Renacimiento, pintor e inventor", "LEONARDO DA VINCI"],
    ["prueba-413", "PERSONAJES", "Padre de la teoría de la relatividad", "ALBERT EINSTEIN"],
    ["prueba-414", "PERSONAJES", "Primera persona con dos premios Nobel en ciencias distintas", "MARIE CURIE"],
    ["prueba-415", "PERSONAJES", "Una manzana y la ley de la gravitación", "ISAAC NEWTON"],
    ["prueba-416", "PERSONAJES", "Última reina del Egipto ptolemaico", "CLEOPATRA"],
    ["prueba-417", "PERSONAJES", "Llegué, vi y vencí", "JULIO CÉSAR"],
    ["prueba-418", "PERSONAJES", "Emperador francés derrotado en Waterloo", "NAPOLEÓN BONAPARTE"],
    ["prueba-419", "PERSONAJES", "Astrónomo que defendió que la Tierra gira", "GALILEO GALILEI"],
    ["prueba-420", "PERSONAJES", "Niño prodigio de Salzburgo", "WOLFGANG AMADEUS MOZART"],
    ["prueba-421", "PERSONAJES", "Compuso sinfonías aun estando sordo", "LUDWIG VAN BEETHOVEN"],
    ["prueba-422", "PERSONAJES", "Poeta granadino del Romancero gitano", "FEDERICO GARCÍA LORCA"],
    ["prueba-423", "PERSONAJES", "Premio Nobel español por estudiar las neuronas", "SANTIAGO RAMÓN Y CAJAL"],
    ["prueba-424", "PERSONAJES", "Reina que financió el viaje a las Indias", "ISABEL LA CATÓLICA"],
    ["prueba-425", "PERSONAJES", "Primer ser humano en pisar la Luna", "NEIL ARMSTRONG"],
    ["prueba-426", "PERSONAJES", "Naturalista de la teoría de la evolución", "CHARLES DARWIN"],
    ["prueba-427", "PERSONAJES", "Pintora mexicana de los autorretratos", "FRIDA KAHLO"],
    ["prueba-428", "PERSONAJES", "Pintor de La noche estrellada", "VINCENT VAN GOGH"],
    ["prueba-429", "PERSONAJES", "Rey macedonio que conquistó medio mundo", "ALEJANDRO MAGNO"]
  ];

  const existentes = Array.isArray(global.aletheiaPaneles) ? global.aletheiaPaneles : [];
  const ids = new Set(existentes.map(panel => panel.id));
  const nuevos = lote
    .filter(([id]) => !ids.has(id))
    .map(([id, categoria, pista, solucion]) => Object.freeze({ id, categoria, pista, solucion }));

  global.aletheiaPaneles = Object.freeze([...existentes, ...nuevos]);
})(window);

