(function (global) {
  "use strict";

  const lote = [
    ["prueba-046", "GEOGRAFÍA", "El océano más extenso", "OCÉANO PACÍFICO"],
    ["prueba-047", "GEOGRAFÍA", "Cordillera que recorre Sudamérica", "LOS ANDES"],
    ["prueba-048", "GEOGRAFÍA", "Río que atraviesa Egipto", "EL NILO"],
    ["prueba-049", "GEOGRAFÍA", "País europeo con forma de bota", "ITALIA"],
    ["prueba-050", "GEOGRAFÍA", "Capital situada a orillas del Sena", "PARÍS"],
    ["prueba-051", "GEOGRAFÍA", "El continente más frío", "LA ANTÁRTIDA"],
    ["prueba-052", "GEOGRAFÍA", "Mar situado entre Europa y África", "MEDITERRÁNEO"],
    ["prueba-053", "GEOGRAFÍA", "La montaña más alta del mundo", "EVEREST"],
    ["prueba-054", "GEOGRAFÍA", "Archipiélago español del océano Atlántico", "ISLAS CANARIAS"],
    ["prueba-378", "RINCONES DE ESPAÑA", "Palacio nazarí de Granada", "LA ALHAMBRA"],
    ["prueba-379", "RINCONES DE ESPAÑA", "Templo inacabado de Gaudí", "LA SAGRADA FAMILIA"],
    ["prueba-380", "RINCONES DE ESPAÑA", "Campanario de la catedral de Sevilla", "LA GIRALDA"],
    ["prueba-381", "RINCONES DE ESPAÑA", "Templo con un bosque de arcos bicolores", "LA MEZQUITA DE CÓRDOBA"],
    ["prueba-382", "RINCONES DE ESPAÑA", "Obra romana de piedra sin argamasa", "ACUEDUCTO DE SEGOVIA"],
    ["prueba-383", "RINCONES DE ESPAÑA", "Plaza madrileña del kilómetro cero", "PUERTA DEL SOL"],
    ["prueba-384", "RINCONES DE ESPAÑA", "Complejo futurista de Calatrava en Valencia", "CIUDAD DE LAS ARTES Y LAS CIENCIAS"],
    ["prueba-385", "RINCONES DE ESPAÑA", "Meta de los peregrinos del Camino", "CATEDRAL DE SANTIAGO DE COMPOSTELA"],
    ["prueba-386", "RINCONES DE ESPAÑA", "Marismas protegidas entre Huelva y Sevilla", "PARQUE NACIONAL DE DOÑANA"],
    ["prueba-387", "RINCONES DE ESPAÑA", "Parque natural volcánico de Almería", "CABO DE GATA"],
    ["prueba-388", "RINCONES DE ESPAÑA", "Paraje almeriense donde se rodaron muchos wésterns", "DESIERTO DE TABERNAS"],
    ["prueba-389", "RINCONES DE ESPAÑA", "Museo de titanio junto a la ría de Bilbao", "MUSEO GUGGENHEIM"],
    ["prueba-390", "RINCONES DE ESPAÑA", "El pico más alto de España", "EL TEIDE"],
    ["prueba-391", "RINCONES DE ESPAÑA", "Faro romano todavía en uso en La Coruña", "TORRE DE HÉRCULES"],
    ["prueba-392", "RINCONES DE ESPAÑA", "Bahía con forma de concha en San Sebastián", "PLAYA DE LA CONCHA"],
    ["prueba-393", "RINCONES DE ESPAÑA", "Pasarela colgada sobre un desfiladero malagueño", "CAMINITO DEL REY"],
    ["prueba-394", "MONUMENTOS", "Estructura de hierro en el Campo de Marte", "TORRE EIFFEL"],
    ["prueba-395", "MONUMENTOS", "Fortificación de miles de kilómetros en Asia", "GRAN MURALLA CHINA"],
    ["prueba-396", "MONUMENTOS", "Mausoleo de mármol blanco en la India", "TAJ MAHAL"],
    ["prueba-397", "MONUMENTOS", "Regalo de Francia en el puerto de Nueva York", "ESTATUA DE LA LIBERTAD"],
    ["prueba-398", "MONUMENTOS", "Ciudadela inca en los Andes", "MACHU PICCHU"],
    ["prueba-399", "MONUMENTOS", "Tumbas faraónicas junto a El Cairo", "PIRÁMIDES DE GUIZA"],
    ["prueba-400", "MONUMENTOS", "Campanario italiano que se inclina", "TORRE DE PISA"],
    ["prueba-401", "MONUMENTOS", "Famosa campana del reloj de Westminster", "BIG BEN"],
    ["prueba-402", "MONUMENTOS", "Estatua con los brazos abiertos sobre Río de Janeiro", "CRISTO REDENTOR"],
    ["prueba-403", "MONUMENTOS", "Ciudad nabatea excavada en roca rosada", "PETRA"],
    ["prueba-404", "MONUMENTOS", "Pirámide maya de Yucatán", "CHICHÉN ITZÁ"],
    ["prueba-405", "MONUMENTOS", "Edificio con velas blancas en Australia", "ÓPERA DE SÍDNEY"],
    ["prueba-406", "MONUMENTOS", "Templo dedicado a Atenea en la Acrópolis", "PARTENÓN"],
    ["prueba-407", "MONUMENTOS", "Círculo de piedras prehistórico en Inglaterra", "STONEHENGE"],
    ["prueba-408", "MONUMENTOS", "Puente rojo de San Francisco", "GOLDEN GATE"],
    ["prueba-409", "MONUMENTOS", "Anfiteatro romano de gladiadores", "EL COLISEO"],
    ["prueba-445", "FIESTAS", "Monumentos que arden en Valencia", "LAS FALLAS"],
    ["prueba-446", "FIESTAS", "Encierros en Pamplona cada julio", "SAN FERMÍN"],
    ["prueba-447", "FIESTAS", "Batalla de tomates en Buñol", "LA TOMATINA"],
    ["prueba-448", "FIESTAS", "Casetas y sevillanas en Sevilla", "FERIA DE ABRIL"],
    ["prueba-449", "FIESTAS", "Procesiones y pasos en primavera", "SEMANA SANTA"],
    ["prueba-450", "FIESTAS", "Doce campanadas para despedir el año", "LAS DOCE UVAS"],
    ["prueba-451", "FIESTAS", "Dulce con sorpresa del seis de enero", "ROSCÓN DE REYES"],
    ["prueba-452", "FIESTAS", "Chirigotas y comparsas gaditanas", "CARNAVAL DE CÁDIZ"],
    ["prueba-453", "FIESTAS", "Desfiles de bandos con trajes medievales", "MOROS Y CRISTIANOS"],
    ["prueba-454", "FIESTAS", "Hogueras en la noche más corta del año", "NOCHE DE SAN JUAN"],
    ["prueba-455", "FIESTAS", "Desfile de carrozas y caramelos en enero", "CABALGATA DE REYES"],
    ["prueba-456", "FIESTAS", "Romería a la aldea onubense de Almonte", "EL ROCÍO"],
    ["prueba-457", "FIESTAS", "Disfraces y calabazas el treinta y uno de octubre", "HALLOWEEN"],
    ["prueba-458", "FIESTAS", "El día de los enamorados", "SAN VALENTÍN"],
    ["prueba-459", "FIESTAS", "Se visitan los cementerios el uno de noviembre", "DÍA DE TODOS LOS SANTOS"],
    ["prueba-460", "FIESTAS", "Cena familiar del veinticuatro de diciembre", "NOCHEBUENA"]
  ];

  const existentes = Array.isArray(global.aletheiaPaneles) ? global.aletheiaPaneles : [];
  const ids = new Set(existentes.map(panel => panel.id));
  const nuevos = lote
    .filter(([id]) => !ids.has(id))
    .map(([id, categoria, pista, solucion]) => Object.freeze({ id, categoria, pista, solucion }));

  global.aletheiaPaneles = Object.freeze([...existentes, ...nuevos]);
})(window);

