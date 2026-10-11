(function (global) {
  "use strict";

  const lote = [
    ["prueba-091","ALÉTHEIA","El propósito de una nave extraordinaria","LA NAVE QUE BUSCA LA VERDAD",3],
    ["prueba-092","ALÉTHEIA","Centro de procesamiento de la nave","PROMETEO ALFA",2],
    ["prueba-093","ALÉTHEIA","Lugar donde se reúne la tripulación","SALA DE MANDO",3],
    ["prueba-094","ALÉTHEIA","Sección dedicada al entretenimiento","MÓDULO OCIO",3],
    ["prueba-095","ALÉTHEIA","Registro personal de quienes viajan a bordo","FICHA DE TRIPULACIÓN",3],
    ["prueba-096","ALÉTHEIA","Sistema que conecta las áreas de la nave","RED INTERNA",3],
    ["prueba-097","ALÉTHEIA","Ventana desde la que se estudia el universo","OBSERVATORIO",3],
    ["prueba-098","ALÉTHEIA","Zona destinada al cultivo de alimentos","GRANJA",3],
    ["prueba-099","ALÉTHEIA","Espacio reservado para las naves auxiliares","HANGAR",3],
    ["prueba-100","ALÉTHEIA","Principio que guía toda la misión","BÚSQUEDA DE LA VERDAD",3],
    ["prueba-410","PERSONAJES","Navegante que llegó a América en mil cuatrocientos noventa y dos","CRISTÓBAL COLÓN",2],
    ["prueba-411","PERSONAJES","El manco de Lepanto","MIGUEL DE CERVANTES",2],
    ["prueba-412","PERSONAJES","Genio del Renacimiento, pintor e inventor","LEONARDO DA VINCI",2],
    ["prueba-413","PERSONAJES","Padre de la teoría de la relatividad","ALBERT EINSTEIN",2],
    ["prueba-414","PERSONAJES","Primera persona con dos premios Nobel en ciencias distintas","MARIE CURIE",2],
    ["prueba-415","PERSONAJES","Una manzana y la ley de la gravitación","ISAAC NEWTON",2],
    ["prueba-416","PERSONAJES","Última reina del Egipto ptolemaico","CLEOPATRA",1],
    ["prueba-417","PERSONAJES","Llegué, vi y vencí","JULIO CÉSAR",1],
    ["prueba-418","PERSONAJES","Emperador francés derrotado en Waterloo","NAPOLEÓN BONAPARTE",2],
    ["prueba-419","PERSONAJES","Astrónomo que defendió que la Tierra gira","GALILEO GALILEI",2],
    ["prueba-420","PERSONAJES","Niño prodigio de Salzburgo","WOLFGANG AMADEUS MOZART",2],
    ["prueba-421","PERSONAJES","Compuso sinfonías aun estando sordo","LUDWIG VAN BEETHOVEN",2],
    ["prueba-422","PERSONAJES","Poeta granadino del Romancero gitano","FEDERICO GARCÍA LORCA",2],
    ["prueba-423","PERSONAJES","Premio Nobel español por estudiar las neuronas","SANTIAGO RAMÓN Y CAJAL",2],
    ["prueba-424","PERSONAJES","Reina que financió el viaje a las Indias","ISABEL LA CATÓLICA",2],
    ["prueba-425","PERSONAJES","Primer ser humano en pisar la Luna","NEIL ARMSTRONG",1],
    ["prueba-426","PERSONAJES","Naturalista de la teoría de la evolución","CHARLES DARWIN",2],
    ["prueba-427","PERSONAJES","Pintora mexicana de los autorretratos","FRIDA KAHLO",2],
    ["prueba-428","PERSONAJES","Pintor de La noche estrellada","VINCENT VAN GOGH",2],
    ["prueba-429","PERSONAJES","Rey macedonio que conquistó medio mundo","ALEJANDRO MAGNO",2],
  ];

  const existentes = Array.isArray(global.aletheiaPaneles) ? global.aletheiaPaneles : [];
  const ids = new Set(existentes.map(panel => panel.id));
  const nuevos = lote
    .filter(([id]) => !ids.has(id))
    .map(([id, categoria, pista, solucion, nivel]) => Object.freeze({ id, categoria, pista, solucion, nivel }));

  global.aletheiaPaneles = Object.freeze([...existentes, ...nuevos]);
})(window);

