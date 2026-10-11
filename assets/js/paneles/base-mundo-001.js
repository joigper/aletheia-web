(function (global) {
  "use strict";

  const lote = [
    ["prueba-046","GEOGRAFÍA","El océano más extenso","OCÉANO PACÍFICO",1],
    ["prueba-047","GEOGRAFÍA","Cordillera que recorre Sudamérica","LOS ANDES",1],
    ["prueba-048","GEOGRAFÍA","Río que atraviesa Egipto","EL NILO",1],
    ["prueba-049","GEOGRAFÍA","País europeo con forma de bota","ITALIA",1],
    ["prueba-050","GEOGRAFÍA","Capital situada a orillas del Sena","PARÍS",1],
    ["prueba-051","GEOGRAFÍA","El continente más frío","LA ANTÁRTIDA",1],
    ["prueba-052","GEOGRAFÍA","Mar situado entre Europa y África","MEDITERRÁNEO",1],
    ["prueba-053","GEOGRAFÍA","La montaña más alta del mundo","EVEREST",1],
    ["prueba-054","GEOGRAFÍA","Archipiélago español del océano Atlántico","ISLAS CANARIAS",1],
    ["prueba-378","RINCONES DE ESPAÑA","Palacio nazarí de Granada","LA ALHAMBRA",1],
    ["prueba-379","RINCONES DE ESPAÑA","Templo inacabado de Gaudí","LA SAGRADA FAMILIA",1],
    ["prueba-380","RINCONES DE ESPAÑA","Campanario de la catedral de Sevilla","LA GIRALDA",2],
    ["prueba-381","RINCONES DE ESPAÑA","Templo con un bosque de arcos bicolores","LA MEZQUITA DE CÓRDOBA",2],
    ["prueba-382","RINCONES DE ESPAÑA","Obra romana de piedra sin argamasa","ACUEDUCTO DE SEGOVIA",2],
    ["prueba-383","RINCONES DE ESPAÑA","Plaza madrileña del kilómetro cero","PUERTA DEL SOL",1],
    ["prueba-384","RINCONES DE ESPAÑA","Complejo futurista de Calatrava en Valencia","CIUDAD DE LAS ARTES Y LAS CIENCIAS",3],
    ["prueba-385","RINCONES DE ESPAÑA","Meta de los peregrinos del Camino","CATEDRAL DE SANTIAGO DE COMPOSTELA",2],
    ["prueba-386","RINCONES DE ESPAÑA","Marismas protegidas entre Huelva y Sevilla","PARQUE NACIONAL DE DOÑANA",2],
    ["prueba-387","RINCONES DE ESPAÑA","Parque natural volcánico de Almería","CABO DE GATA",2],
    ["prueba-388","RINCONES DE ESPAÑA","Paraje almeriense donde se rodaron muchos wésterns","DESIERTO DE TABERNAS",2],
    ["prueba-389","RINCONES DE ESPAÑA","Museo de titanio junto a la ría de Bilbao","MUSEO GUGGENHEIM",2],
    ["prueba-390","RINCONES DE ESPAÑA","El pico más alto de España","EL TEIDE",1],
    ["prueba-391","RINCONES DE ESPAÑA","Faro romano todavía en uso en La Coruña","TORRE DE HÉRCULES",2],
    ["prueba-392","RINCONES DE ESPAÑA","Bahía con forma de concha en San Sebastián","PLAYA DE LA CONCHA",2],
    ["prueba-393","RINCONES DE ESPAÑA","Pasarela colgada sobre un desfiladero malagueño","CAMINITO DEL REY",2],
    ["prueba-394","MONUMENTOS","Estructura de hierro en el Campo de Marte","TORRE EIFFEL",2],
    ["prueba-395","MONUMENTOS","Fortificación de miles de kilómetros en Asia","GRAN MURALLA CHINA",2],
    ["prueba-396","MONUMENTOS","Mausoleo de mármol blanco en la India","TAJ MAHAL",2],
    ["prueba-397","MONUMENTOS","Regalo de Francia en el puerto de Nueva York","ESTATUA DE LA LIBERTAD",2],
    ["prueba-398","MONUMENTOS","Ciudadela inca en los Andes","MACHU PICCHU",1],
    ["prueba-399","MONUMENTOS","Tumbas faraónicas junto a El Cairo","PIRÁMIDES DE GUIZA",1],
    ["prueba-400","MONUMENTOS","Campanario italiano que se inclina","TORRE DE PISA",1],
    ["prueba-401","MONUMENTOS","Famosa campana del reloj de Westminster","BIG BEN",2],
    ["prueba-402","MONUMENTOS","Estatua con los brazos abiertos sobre Río de Janeiro","CRISTO REDENTOR",2],
    ["prueba-403","MONUMENTOS","Ciudad nabatea excavada en roca rosada","PETRA",2],
    ["prueba-404","MONUMENTOS","Pirámide maya de Yucatán","CHICHÉN ITZÁ",1],
    ["prueba-405","MONUMENTOS","Edificio con velas blancas en Australia","ÓPERA DE SÍDNEY",2],
    ["prueba-406","MONUMENTOS","Templo dedicado a Atenea en la Acrópolis","PARTENÓN",2],
    ["prueba-407","MONUMENTOS","Círculo de piedras prehistórico en Inglaterra","STONEHENGE",2],
    ["prueba-408","MONUMENTOS","Puente rojo de San Francisco","GOLDEN GATE",1],
    ["prueba-409","MONUMENTOS","Anfiteatro romano de gladiadores","EL COLISEO",1],
    ["prueba-445","FIESTAS","Monumentos que arden en Valencia","LAS FALLAS",1],
    ["prueba-446","FIESTAS","Encierros en Pamplona cada julio","SAN FERMÍN",1],
    ["prueba-447","FIESTAS","Batalla de tomates en Buñol","LA TOMATINA",1],
    ["prueba-448","FIESTAS","Casetas y sevillanas en Sevilla","FERIA DE ABRIL",1],
    ["prueba-449","FIESTAS","Procesiones y pasos en primavera","SEMANA SANTA",1],
    ["prueba-450","FIESTAS","Doce campanadas para despedir el año","LAS DOCE UVAS",1],
    ["prueba-451","FIESTAS","Dulce con sorpresa del seis de enero","ROSCÓN DE REYES",1],
    ["prueba-452","FIESTAS","Chirigotas y comparsas gaditanas","CARNAVAL DE CÁDIZ",1],
    ["prueba-453","FIESTAS","Desfiles de bandos con trajes medievales","MOROS Y CRISTIANOS",1],
    ["prueba-454","FIESTAS","Hogueras en la noche más corta del año","NOCHE DE SAN JUAN",1],
    ["prueba-455","FIESTAS","Desfile de carrozas y caramelos en enero","CABALGATA DE REYES",1],
    ["prueba-456","FIESTAS","Romería a la aldea onubense de Almonte","EL ROCÍO",1],
    ["prueba-457","FIESTAS","Disfraces y calabazas el treinta y uno de octubre","HALLOWEEN",1],
    ["prueba-458","FIESTAS","El día de los enamorados","SAN VALENTÍN",1],
    ["prueba-459","FIESTAS","Se visitan los cementerios el uno de noviembre","DÍA DE TODOS LOS SANTOS",1],
    ["prueba-460","FIESTAS","Cena familiar del veinticuatro de diciembre","NOCHEBUENA",1],
  ];

  const existentes = Array.isArray(global.aletheiaPaneles) ? global.aletheiaPaneles : [];
  const ids = new Set(existentes.map(panel => panel.id));
  const nuevos = lote
    .filter(([id]) => !ids.has(id))
    .map(([id, categoria, pista, solucion, nivel]) => Object.freeze({ id, categoria, pista, solucion, nivel }));

  global.aletheiaPaneles = Object.freeze([...existentes, ...nuevos]);
})(window);

