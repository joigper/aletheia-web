document.addEventListener("DOMContentLoaded", () => {
    const svg = document.querySelector("#mapa-aletheia svg");

    const fichaModulo = document.getElementById("ficha-modulo");
    const nombreModulo = document.getElementById("modulo-nombre");
    const areaModulo = document.getElementById("modulo-area");
    const descripcionModulo = document.getElementById(
        "modulo-descripcion"
    );
    const imagenModulo = document.getElementById("modulo-imagen");
    const estadoFicha = document.querySelector(
        ".ficha-modulo__estado"
    );
    const botonMasImagenes = document.getElementById(
    "modulo-mas-imagenes"
    );

    const botonNivel1 = document.getElementById("mostrar-nivel-1");
    const botonNivel2 = document.getElementById("mostrar-nivel-2");
    const explorarContenedor = document.querySelector(
    ".explorar-contenedor"
);

const botonCerrarFicha = document.getElementById(
    "cerrar-ficha-modulo"
);

    if (!svg) {
        console.error("No se encontró el mapa SVG.");
        return;
    }

    const nivel1 = svg.querySelector("#g1");
    const nivel2 = svg.querySelector("#g2");

    if (!nivel1 || !nivel2) {
        console.error(
            "No se encontraron los grupos g1 y g2 del SVG."
        );
        return;
    }

    if (
        !fichaModulo ||
        !nombreModulo ||
        !areaModulo ||
        !descripcionModulo ||
        !imagenModulo ||
        !estadoFicha
    ) {
        console.error("Faltan elementos de la ficha.");
        return;
    }

    if (!botonNivel1 || !botonNivel2) {
        console.error("No se encontraron los botones de nivel.");
        return;
    }

    const modulosNivel1 = nivel1.querySelectorAll(
        'g[id^="L1_"]'
    );

    const modulosNivel2 = nivel2.querySelectorAll(
        'g[id^="L2_"]'
    );

    const todosLosModulos = [
        ...modulosNivel1,
        ...modulosNivel2
    ];

    const datosGenerales = {
        nombre: "ALÉTHEIA",
        area: "Organización estructural",
        imagen: "assets/img/Aletheia.jpg",
        imagenAlt:
            "Representación general de la estructura de ALÉTHEIA",
        descripcion:
            "ALÉTHEIA está organizada en dos niveles estructurales. Estos niveles no deben confundirse con las cubiertas interiores de cada módulo. El Nivel 1 concentra la mayor parte de las instalaciones habitables, científicas, industriales y de soporte. El Nivel 2 alberga instalaciones complementarias, zonas de reserva y sistemas de apoyo."
    };

    const datosModulos = {
        L1_001: {
            nombre: "NEXUS",
            area: "Propulsión y navegación",
            imagen: "assets/img/NEXUS.jpg",
            imagenAlt:
                "Interpretación visual del módulo NEXUS",
            descripcion:
                "Núcleo central de ALÉTHEIA. Alberga los sistemas asociados a la propulsión gravitatoria y a la navegación de la nave."
        },
        
        L1_006: {
            nombre: "ZEUS-01",
            area: "Reactor de fusión",
            imagen: "assets/img/ZEUS01.jpg",
            imagenAlt:
                "Interpretación visual del módulo ZEUS",
           descripcion:
                "Uno de los ocho reactores de fusión de ALÉTHEIA. Su ubicación en el primer anillo permite que las líneas de distribución energética de mayor capacidad alimenten directamente al motor gravitatorio NEXUS, minimizando pérdidas y garantizando el suministro al sistema más exigente de la nave."
        },
        L1_005: {
    nombre: "ZEUS-02",
    area: "Reactor de fusión",
    imagen: "assets/img/ZEUS02.jpg",
    imagenAlt: "El capitán y Sabine Van Wijngaarden inspeccionan el reactor ZEUS-02",
    descripcion:
        "ZEUS-02 forma parte del sistema de generación energética de ALÉTHEIA. Además de producir energía mediante fusión, incorpora un complejo circuito de refrigeración encargado de mantener estables las temperaturas de funcionamiento del reactor. La supervisión continua de estos sistemas resulta esencial para garantizar un suministro energético seguro y permanente a toda la nave."
},
        L1_004: {
    nombre: "ZEUS-03",
    area: "Reactor de fusión",
    imagen: "assets/img/ZEUS03.jpg",
    imagenAlt:
        "Interpretación visual del módulo ZEUS-03",
    descripcion:
        "Integrado en la red de generación energética de ALÉTHEIA, ZEUS-03 trabaja de forma sincronizada con el resto de reactores mediante un sistema de reparto dinámico de carga. Esta arquitectura permite redistribuir automáticamente la producción entre los distintos reactores durante operaciones de mantenimiento, incidencias o picos de consumo, garantizando un suministro estable incluso ante la pérdida temporal de uno de ellos."
},
        L1_003: {
    nombre: "ZEUS-04",
    area: "Reactor de fusión",
    imagen: "assets/img/ZEUS04.jpg",
    imagenAlt:
        "Interpretación visual del módulo ZEUS",
    descripcion:
        "Los reactores ZEUS pueden ponerse en marcha o detenerse de forma independiente según las necesidades energéticas de ALÉTHEIA. Durante la permanencia en órbita, un único reactor puede cubrir el consumo habitual de la nave. La navegación requiere aumentar progresivamente el número de unidades activas, mientras que un salto gravitatorio exige un mínimo de cuatro reactores funcionando simultáneamente. A partir de ese umbral, una mayor potencia disponible permite realizar saltos de mayor alcance."
},
        L1_002: {
    nombre: "ZEUS-05",
    area: "Reactor de fusión",
    imagen: "assets/img/ZEUS05.jpg",
    imagenAlt:
        "Instalaciones europeas de fabricación de los reactores ZEUS",
    descripcion:
        "El programa ZEUS fue desarrollado en Europa mediante la colaboración de centros de investigación, universidades y empresas de numerosos países. Antes de fabricar las unidades destinadas a ALÉTHEIA, un prototipo a escala real permaneció durante un año conectado a la red eléctrica francesa, sometido a un régimen continuo de pruebas. Su producción llegó a cubrir por sí sola la demanda eléctrica del país, demostrando la estabilidad y capacidad del sistema antes de iniciar la fabricación de los reactores definitivos."
},
        L1_007: {
    nombre: "ZEUS-06",
    area: "Reactor de fusión",
    imagen: "assets/img/ZEUS06.jpg",
    imagenAlt:
        "Interpretación visual de los sistemas de mantenimiento del reactor ZEUS",
    descripcion:
        "A diferencia de los reactores de fisión, los reactores ZEUS no producen residuos derivados de la fragmentación de núcleos pesados. La fusión genera principalmente helio, pero el intenso flujo de neutrones activa progresivamente algunos materiales del propio reactor. Estos componentes deben ser sustituidos periódicamente y almacenados de forma controlada hasta que su radiactividad disminuya."
},
        L1_014: {
    nombre: "PROMETEO ALFA",
    area: "Supercomputación",
    imagen: "assets/img/PROMETEOALFA.jpg",
    imagenAlt:
        "Sala principal de servidores del superordenador PROMETEO ALFA",
    descripcion:
        "PROMETEO ALFA constituye el núcleo de procesamiento de ALÉTHEIA. Inspirado en la arquitectura del superordenador terrestre «El Capitán», coordina millones de operaciones por segundo relacionadas con la navegación, la gestión energética, las comunicaciones, la investigación científica y el soporte a la inteligencia artificial de la nave. La sala de servidores mantiene condiciones ambientales estrictamente controladas para garantizar un funcionamiento ininterrumpido durante décadas, con sistemas redundantes de alimentación, refrigeración y almacenamiento distribuidos entre distintos módulos."
},
        L1_013: {
    nombre: "ULL PRIMARIO",
    area: "Transferencia térmica",
    imagen: "assets/img/MODULO ULL.jpg",
    imagenAlt:
        "Instalaciones del módulo ULL Primario",
    descripcion:
        "ULL Primario constituye el principal nodo de intercambio térmico de ALÉTHEIA y el único que comunica directamente los niveles 1 y 2. En su interior, enormes intercambiadores transfieren la energía procedente del circuito secundario de agua hacia la red principal de amoniaco que recorre la cubierta 0, completamente aislada del resto de la nave. Gigantescos depósitos, bombas de gran caudal y sistemas de regulación garantizan un flujo continuo entre ambos circuitos, permitiendo distribuir la energía térmica con la máxima seguridad sin que el amoniaco llegue nunca a las zonas habitables."
},
        L1_009: {
    nombre: "ULL-02",
    area: "Transferencia térmica",
    imagen: "assets/img/ULL02.jpg",
    imagenAlt:
        "Instalaciones del módulo ULL-02",
    descripcion:
        "ULL-02 forma parte de la red redundante de transferencia térmica de ALÉTHEIA. Los tres módulos ULL permiten distribuir y sectorizar los circuitos de refrigeración, aislando tramos durante labores de mantenimiento o ante una avería sin interrumpir el servicio general. En caso necesario, dos de ellos pueden mantener la refrigeración de los sistemas esenciales de la nave, aunque con una capacidad reducida."
},

L1_017: {
    nombre: "ULL-03",
    area: "Transferencia térmica",
    imagen: "assets/img/ULL03.jpg",
    imagenAlt:
        "Instalaciones del módulo ULL-03",
    descripcion:
        "ULL-03 completa el sistema de transferencia térmica de ALÉTHEIA. Tras recoger el calor generado en las distintas instalaciones, los circuitos de agua lo transfieren a la red de amoniaco de la cubierta 0, desde donde es conducido hacia cientos de radiadores instalados bajo la nave. Estas grandes superficies radiantes constituyen el último eslabón del sistema, disipando finalmente al espacio el calor acumulado."
},
        L1_052: {
    nombre: "ALMACÉN 1",
    area: "Centro logístico",
    imagen: "assets/img/MODULO ALMACÉN-01.jpg",
    imagenAlt:
        "Centro logístico ALMACÉN 1",
    descripcion:
        "ALMACÉN 1 es uno de los cuatro grandes centros logísticos de ALÉTHEIA. Desde sus instalaciones se gestionan miles de referencias destinadas al mantenimiento, la investigación, la actividad industrial y la vida cotidiana de la tripulación. Mediante sistemas automatizados de clasificación, transporte y control de inventario, abastece a los almacenes locales distribuidos por los distintos módulos de la nave, garantizando la disponibilidad permanente de materiales y equipos esenciales para el funcionamiento de una ciudad espacial de más de quince mil habitantes."
},
        L1_047: {
    nombre: "ALMACÉN 2",
    area: "Logística alimentaria",
    imagen: "assets/img/ALMACEN02.jpg",
    imagenAlt:
        "Instalaciones del Almacén 2",
    descripcion:
        "Especializado en la conservación de alimentos, ALMACÉN 2 constituye el principal centro de almacenamiento refrigerado de ALÉTHEIA. Alberga cámaras frigoríficas y de congelación industrial destinadas a preservar productos frescos, congelados y reservas alimentarias de larga duración. Situado junto a los módulos de Cocina y Granja, facilita el abastecimiento diario de toda la tripulación mediante una cadena logística completamente controlada que garantiza la conservación de los alimentos desde su producción hasta su distribución."
},
        L1_048: {
    nombre: "COCINA",
    area: "Restauración",
    imagenes: [
    {
        src: "assets/img/COCINA.jpg",
        alt: "Cocina principal de ALÉTHEIA"
    },
    {
        src: "assets/img/panaderia.jpg",
        alt: "Cocina principal de ALÉTHEIA"
    },
],
    descripcion:
        "Dirigida por Thomas Müller, la Cocina constituye el principal centro de producción alimentaria de ALÉTHEIA. Cada día elabora miles de menús equilibrados para toda la tripulación a partir de las preferencias registradas previamente por cada usuario mediante la aplicación personal de la nave, optimizando la producción y reduciendo al mínimo el desperdicio de alimentos. Las raciones que no llegan a consumirse son ultracongeladas y envasadas para su posterior distribución, permitiendo que cualquier tripulante pueda disponer de ellas en otro momento sin que se desperdicie comida."
},
        L1_066: {
    nombre: "WASTE",
    area: "Recuperación y tratamiento",
    imagen: "assets/img/WASTE.jpg",
    imagenAlt:
        "Instalaciones del módulo WASTE",
    descripcion:
        "El módulo WASTE alberga la principal planta de recuperación y tratamiento de aguas de ALÉTHEIA. En sus instalaciones se procesan las aguas grises y negras generadas por toda la nave mediante sistemas de filtración, depuración biológica, ultrafiltración y esterilización, permitiendo reincorporarlas al ciclo hídrico con total seguridad. Considerado uno de los departamentos más críticos de la misión, su funcionamiento continuo garantiza el abastecimiento de agua y la estabilidad sanitaria de una ciudad espacial de más de quince mil habitantes."
},
        L1_016: {
    nombre: "MNEME-01",
    area: "Archivo digital",
    imagen: "assets/img/MNEME01.jpg",
    imagenAlt:
        "Centro de almacenamiento digital MNEME 01",
    descripcion:
        "MNEME 01 forma parte de la red de almacenamiento distribuido de ALÉTHEIA. Sus instalaciones albergan una fracción del inmenso archivo digital de la misión, preservando conocimiento científico, documentación técnica, registros históricos, obras culturales y los datos generados durante el viaje. Los seis módulos MNEME funcionan como un único sistema redundante, con una capacidad conjunta superior a los 100 exabytes de información útil, garantizando la conservación del patrimonio digital de la humanidad incluso ante la pérdida completa de uno de sus centros de datos."
},
        L1_010: {
    nombre: "PROMETEO BETA",
    area: "Supercomputación",
    imagen: "assets/img/PROMETEO02.jpg",
    imagenAlt:
        "Centro de supercomputación PROMETEO BETA",
    descripcion:
        "PROMETEO BETA forma parte del clúster de supercomputación de ALÉTHEIA junto a PROMETEO ALFA y PROMETEO GAMMA. Los tres sistemas trabajan de manera coordinada, distribuyendo las tareas de cálculo y verificando conjuntamente todas las operaciones críticas de la nave mediante un sistema de consenso redundante. Esta arquitectura permite mantener el funcionamiento incluso durante labores de mantenimiento o ante el fallo de uno de los superordenadores, garantizando la continuidad de los servicios esenciales de la misión."
},
        L1_018: {
    nombre: "PROMETEO GAMMA",
    area: "Supercomputación",
    imagen: "assets/img/PROMETEOGAMMA.jpg",
    imagenAlt:
        "Instalaciones del módulo PROMETEO GAMMA",
    descripcion:
        "PROMETEO GAMMA completa el clúster de supercomputación de ALÉTHEIA. El conjunto dispone de más de 130.000 unidades de procesamiento de alto rendimiento, que integran varios millones de núcleos de CPU y GPU especializados. ALFA, BETA y GAMMA están conectados mediante una red óptica redundante de muy alta velocidad, cuyo núcleo ocupa una sala independiente."
},
        L1_051: {
    nombre: "SEA-01",
    area: "Acuicultura · Agua salada",
    imagen: "assets/img/SEA01.jpg",
    imagenAlt:
        "Instalaciones del módulo SEA",
    descripcion:
        "Primero de los módulos de acuicultura de ALÉTHEIA, dedicado principalmente a la cría de especies de agua salada. Sus instalaciones cuentan con grandes tanques y circuitos cerrados donde la salinidad, la temperatura, la oxigenación y la calidad del agua se mantienen bajo supervisión permanente. La separación entre ambos módulos permite diversificar las especies criadas a bordo y reducir la dependencia de una única instalación para el suministro de pescado."
},
        L1_039: {
    nombre: "SEA-02",
    area: "Acuicultura · Agua dulce",
    imagen: "assets/img/SEA02.jpg",
    imagenAlt:
        "Instalaciones del módulo SEA",
    descripcion:
        "Segundo de los dos módulos de acuicultura de ALÉTHEIA, dedicado principalmente a la cría de especies de agua dulce. En sus instalaciones, grandes tanques y circuitos cerrados reproducen las condiciones necesarias para cada especie, con un control permanente de la temperatura, la oxigenación y la calidad del agua. Los animales se distribuyen según su especie y fase de crecimiento, contribuyendo al suministro continuo de proteína fresca para la tripulación."
},
        L1_059: {
    nombre: "HANGAR 0-0",
    area: "Operaciones especiales y carga",
    imagen: "assets/img/HANGAR00.jpg",
    imagenAlt:
        "Interpretación visual del HANGAR 0-0",
    descripcion:
        "Hangar concebido para la recepción, montaje y manipulación de vehículos, estructuras y cargas de tamaño excepcional. A diferencia de los hangares del anillo exterior, ocupa un único espacio diáfano de unos cincuenta metros de altura y dispone de una gran compuerta inferior segmentada que permite el acceso directo al espacio. Su apertura se realiza mediante un complejo sistema de paneles y raíles retráctiles y requiere la despresurización previa del recinto. Alrededor del perímetro se distribuyen talleres, laboratorios, almacenes y salas técnicas, aislados del volumen principal mediante compuertas presurizadas."
},
        L1_078: {
    nombre: "INDUSTRIAL",
    area: "Industria y procesamiento de recursos",
    imagenes: [
    {
        src: "assets/img/INDUSTRIAL01.jpg",
        alt: "Interpretación visual del módulo INDUSTRIAL"
    },
    {
        src: "assets/img/INDUSTRIAL02.jpg",
        alt: "Interpretación visual del módulo INDUSTRIAL"
    },
],
    descripcion:
        "Gran complejo industrial de ALÉTHEIA formado por dos módulos fusionados. Sus instalaciones están destinadas al procesamiento de minerales y materias primas, así como a la fabricación, reparación y montaje de componentes y equipos para la nave. Dispone de grandes talleres, maquinaria pesada y sistemas especializados de transformación y reciclaje de materiales. Un hangar de carga propio permite a las lanzaderas mineras descargar directamente los recursos obtenidos durante las operaciones de extracción, reduciendo su transporte por otras zonas de ALÉTHEIA."
},
        L1_073: {
    nombre: "HANGAR 1-1",
    area: "Operaciones espaciales",
    imagen: "assets/img/HANGAR0101.jpg",
    imagenAlt:
        "Hangar pesado HANGAR 1-1 de ALÉTHEIA",
    descripcion:
        "El HANGAR 1-1 es el principal hangar pesado de ALÉTHEIA y el único preparado para operar la lanzadera ARCTURUS, cuyas dimensiones impiden el uso del sistema de doble esclusa instalado posteriormente en los hangares estándar. Además de servir como plataforma de despegue y aterrizaje, dispone de puentes grúa, equipos de mantenimiento, salas técnicas de control y un ascensor de gran capacidad que traslada las naves a los niveles inferiores de almacenamiento y reparación. Al menos una lanzadera permanece siempre lista para despegar, garantizando una respuesta inmediata ante cualquier emergencia o misión exterior."
},
        L1_030: {
    nombre: "HOME-03",
    area: "España",
    imagenes: [
    {
        src: "assets/img/HOME-03 España.jpg",
        alt: "Plaza principal del módulo HOME-03"
    },
    {
        src: "assets/img/HOME0302.jpg",
        alt: "Pasillo del módulo HOME-03"
    },
],
    descripcion:
        "HOME-03 recrea la atmósfera de una localidad española para ofrecer a sus habitantes un entorno familiar lejos de la Tierra. Tras la cubierta de acceso, común a todos los módulos HOME, la segunda cubierta se organiza en torno a una plaza inspirada en la arquitectura tradicional española, rodeada de comercios, cafeterías, pequeños restaurantes y espacios de encuentro. Entre ellos destaca el Bar Ramón, uno de los establecimientos más populares de ALÉTHEIA y lugar habitual del capitán durante sus escasos momentos de descanso. A partir de las cubiertas superiores, el módulo adopta una distribución residencial más funcional, similar a la del resto de zonas habitables de la nave."
},
    L1_062: {
    nombre: "ALMACÉN-03",
    area: "Logística y suministros",
    imagen: "assets/img/ALMACEN03.jpg",
    imagenAlt:
        "Zona logística del módulo ALMACÉN-03",
    descripcion:
        "ALMACÉN-03 gestiona el almacenamiento y distribución de equipos, repuestos y productos de uso cotidiano destinados tanto al mantenimiento de ALÉTHEIA como a la vida diaria de la tripulación. Entre los artículos conservados destacan los identificados con el sello «ALÉTHEIA Certified», una certificación creada para aquellos productos capaces de cumplir los exigentes requisitos de fiabilidad y durabilidad exigidos por una misión de varias décadas. Con el paso del tiempo, esta certificación trascendió el ámbito espacial y comenzó a utilizarse también en la Tierra, donde electrodomésticos, herramientas y equipos con este distintivo se convirtieron en sinónimo de calidad, reparabilidad y una vida útil muy superior a la habitual."
},
    L1_057: {
    nombre: "JARDINES CENTRALES",
    area: "Recreación y bienestar",
    imagen: "assets/img/JARDINES.jpg",
    imagenAlt:
        "Jardines Centrales de ALÉTHEIA",
    descripcion:
        "Los Jardines Centrales constituyen el principal parque urbano de ALÉTHEIA y uno de los lugares de encuentro más frecuentados por la tripulación. Distribuidos entre varios módulos comunicados, ofrecen amplias zonas ajardinadas, senderos, pequeños estanques, áreas de descanso y espacios destinados a actividades culturales y recreativas. A diferencia del módulo GRANJA, concebido para la producción de alimentos, los Jardines Centrales tienen como único objetivo proporcionar un entorno natural donde pasear, descansar y mantener el contacto cotidiano con la vegetación."
},
        L1_043: { 
    nombre: "GRANJA", 
    area: "Agricultura y ecosistemas", 
    imagen: "assets/img/GRANJA.jpg", 
    imagenAlt:
        "Interpretación visual del módulo GRANJA", 
    descripcion:
        "Principal espacio agrícola y ganadero de ALÉTHEIA. Alberga zonas de pastoreo y distintas especies animales en un entorno diseñado para reproducir un ecosistema terrestre. Además de contribuir a la producción de alimentos, permite conservar especies y mantener un espacio natural dentro de la nave."
},
        L1_088: {
    nombre: "OCIO",
    area: "Comercio, restauración y servicios",
    imagen: "assets/img/OCIO.jpg",
    imagenAlt:
        "Avenida comercial principal del módulo OCIO de ALÉTHEIA",
    descripcion:
        "El complejo OCIO ocupa cuatro módulos comunicados y constituye la principal zona comercial y de entretenimiento de ALÉTHEIA. Su interior se organiza alrededor de una gran avenida peatonal abierta, flanqueada por varios niveles de balcones, escaleras mecánicas, zonas de descanso y grandes maceteros con vegetación ornamental. A lo largo del recorrido se distribuyen tiendas, peluquerías, cafeterías, restaurantes y numerosos servicios destinados a la vida cotidiana de la tripulación. Su diseño reproduce la atmósfera de un elegante centro comercial terrestre y ofrece un espacio luminoso y animado donde pasear, reunirse o desconectar de las instalaciones técnicas de la nave."
},
        L1_049: {
    nombre: "LAB-03",
    area: "Ciencias biológicas y ambientales",
    imagen: "assets/img/LAB03.jpg",
    imagenAlt:
        "Interpretación visual del módulo LAB-03",
    descripcion:
        "El tercero de los grandes módulos de investigación de ALÉTHEIA concentra las ciencias biológicas y ambientales. Sus ocho cubiertas albergan laboratorios, despachos, almacenes e instalaciones especializadas en genética, biotecnología, microbiología, botánica y otras disciplinas relacionadas con la vida y los ecosistemas. Dispone además de sistemas de ventilación, seguridad y control ambiental adaptados a las mayores exigencias del trabajo científico."
},
        L1_074: {
    nombre: "SPORT",
    area: "Deporte y actividad física",
    imagenes: [
    {
        src: "assets/img/SPORT.jpg",
        alt: "Interpretación visual del complejo deportivo SPORT"
    },
    {
        src: "assets/img/SPORT02.jpg",
        alt: "Interpretación visual del complejo deportivo SPORT"
    },
    {
        src: "assets/img/SPORT03.jpg",
        alt: "Interpretación visual del complejo deportivo SPORT"
    },
    {
        src: "assets/img/SPORT04.jpg",
        alt: "Interpretación visual del complejo deportivo SPORT"
    },
],
    descripcion:
        "Gran complejo deportivo de ALÉTHEIA, formado por cuatro módulos interconectados. Sus instalaciones reúnen gimnasios, salas para actividades dirigidas, pistas deportivas y numerosos espacios destinados al entrenamiento, la competición y el ejercicio cotidiano de la tripulación. SPORT constituye el principal centro de actividad física de la nave y ofrece instalaciones adaptadas tanto a la práctica individual como a los deportes de equipo."
},
        L1_060: {
    nombre: "LAB-01",
    area: "Ciencias fundamentales y tecnología extraterrestre",
    imagen: "assets/img/LAB01.jpg",
    imagenAlt:
        "Interpretación visual del módulo LAB-01",
    descripcion:
        "El primero de los tres grandes módulos destinados a laboratorios e investigación científica de ALÉTHEIA. Sus ocho cubiertas albergan instalaciones dedicadas a física, química, ciencia de materiales y otras disciplinas fundamentales. Parte de ellas está especialmente preparada para el análisis y estudio de artefactos, materiales y tecnologías de origen extraterrestre."
},

L1_061: {
    nombre: "LAB-02",
    area: "Ingeniería y ciencias aplicadas",
    imagen: "assets/img/LAB02.jpg",
    imagenAlt:
        "Interpretación visual del módulo LAB-02",
    descripcion:
        "El segundo de los grandes módulos de investigación de ALÉTHEIA está dedicado principalmente a la ingeniería y las ciencias aplicadas. Sus ocho cubiertas reúnen laboratorios, despachos, talleres y almacenes especializados en electrónica, telecomunicaciones, instrumentación y otras disciplinas técnicas. En sus instalaciones se investigan, desarrollan y prueban tecnologías destinadas tanto a la misión como a los distintos sistemas de ALÉTHEIA."
},
        L1_055: {
    nombre: "HOSPITAL",
    area: "Medicina, investigación y formación",
    imagenes: [ 
    {
        src: "assets/img/HOSPITAL.jpg",
        alt: "Complejo Hospitalario de ALÉTHEIA"
    },
    {
        src: "assets/img/HOSPITAL02.jpg",
        alt: "Complejo Hospitalario de ALÉTHEIA"
    },
    {
        src: "assets/img/HOSPITAL03.jpg",
        alt: "Complejo Hospitalario de ALÉTHEIA"
    },
],
    descripcion:
        "El Hospital de ALÉTHEIA ocupa cuatro módulos interconectados que constituyen el único complejo sanitario de la nave. Diseñado para atender a una población de más de quince mil habitantes durante décadas de aislamiento interestelar, reúne todas las especialidades médicas, quirófanos, unidades de cuidados intensivos, laboratorios de investigación, diagnóstico por imagen, rehabilitación, docencia y producción farmacéutica. Más que un hospital convencional, es un centro asistencial, científico y docente concebido para garantizar la salud de generaciones enteras nacidas durante la misión. Bajo la dirección del doctor Lars Clarsson, combina la tecnología médica más avanzada con una atención cercana y profundamente humana, convirtiéndose en uno de los pilares esenciales para la supervivencia y el bienestar de ALÉTHEIA."
},
        L1_083: {
    nombre: "HANGAR 1-3",
    area: "Operaciones de vuelo",
    imagen: "assets/img/HANGAR0103.jpg",
    imagenAlt:
        "Hangar estándar de ALÉTHEIA",
    descripcion:
        "Los hangares estándar de ALÉTHEIA están diseñados para las operaciones habituales de las lanzaderas de transporte y exploración. A diferencia del Hangar 1-1, incorporan un sistema de doble esclusa que permite mantener el hangar completamente operativo mientras una aeronave entra o abandona la nave, reduciendo al mínimo el volumen de aire intercambiado en cada maniobra. Cada módulo puede albergar hasta siete lanzaderas repartidas en sus tres cubiertas, manteniendo siempre una de ellas preparada para despegar de inmediato ante cualquier emergencia o misión programada."
},
        L1_063: {
    nombre: "HANGAR 1-2",
    area: "Operaciones de vuelo",
    imagen: "assets/img/HANGAR0102.jpg",
    imagenAlt:
        "Hangar estándar de ALÉTHEIA",
    descripcion:
        "Los hangares estándar de ALÉTHEIA están diseñados para las operaciones habituales de las lanzaderas de transporte y exploración. A diferencia del Hangar 1-1, incorporan un sistema de doble esclusa que permite mantener el hangar completamente operativo mientras una aeronave entra o abandona la nave, reduciendo al mínimo el volumen de aire intercambiado en cada maniobra. Cada módulo puede albergar hasta siete lanzaderas repartidas en sus tres cubiertas, manteniendo siempre una de ellas preparada para despegar de inmediato ante cualquier emergencia o misión programada."
},
        L1_040: {
    nombre: "HANGAR TORO",
    area: "Operaciones de transporte pesado",
    imagen: "assets/img/HANGARTORO.jpg",
    imagenAlt:
        "Interpretación visual del Hangar TORO",
    descripcion:
        "Instalación de grandes dimensiones destinada exclusivamente al remolcador TORO. El hangar ocupa cuatro módulos estructurales de ALÉTHEIA y dispone de una amplia apertura lateral que permite las maniobras de entrada y salida del vehículo, así como las operaciones asociadas al transporte de cargas de gran tamaño."
},
        L1_081: {
    nombre: "SEC",
    area: "Seguridad y emergencias",
    imagen: "assets/img/SEC01.jpg",
    imagenAlt:
        "Instalaciones del módulo SEC",
    descripcion:
        "Centro operativo del departamento de Seguridad de ALÉTHEIA. El módulo alberga las oficinas y dependencias del personal de seguridad, así como los equipos especializados en emergencias, extinción de incendios y rescate. Dispone de zonas de entrenamiento, gimnasio propio, almacenes de material y equipos de intervención, salas de coordinación y una zona de detención. Desde SEC se organizan tanto las tareas habituales de seguridad a bordo como la respuesta ante situaciones de emergencia."
},
        L1_082: {
    nombre: "CONTROL PRIMARIO",
    area: "Mando y coordinación",
    imagenes: [
    {
        src: "assets/img/CONTROLPRIMARIO.jpg",
        alt: "Interpretación visual del módulo CONTROL"
    },
    {
        src: "assets/img/CONTROL02.jpg",
        alt: "Segunda imagen del módulo CONTROL"
    },
    {
        src: "assets/img/DEspacho del capitan.jpg",
        alt: "Interpretación visual del módulo CONTROL"
    },
    {
        src: "assets/img/REUNIONES.jpg",
        alt: "Interpretación visual del módulo CONTROL"
    },
],
    descripcion:
        "Centro principal de mando y coordinación de ALÉTHEIA. Alberga el puente de la nave, salas de reuniones, dependencias de trabajo y los alojamientos destinados a los oficiales. El módulo incorpora además una zona de acoplamiento preparada para recibir naves de gran tamaño como PRAETORIAE, que pueden integrarse de forma sólida en la estructura de ALÉTHEIA mediante un proceso de conexión de varios días que enlaza sistemas de energía, datos, refrigeración y saneamiento, además de asegurar mecánicamente ambas estructuras."
},
        L1_067: {
    nombre: "CONTROL SECUNDARIO",
    area: "Mando de emergencia y sistemas redundantes",
    imagen: "assets/img/CONTROLSECUNDARIO.jpg",
    imagenAlt:
        "Instalaciones exteriores de CONTROL SECUNDARIO y zona de acoplamiento",
    descripcion:
        "Centro de mando alternativo de ALÉTHEIA, situado en el extremo opuesto de la nave respecto a CONTROL PRIMARIO. Constituye una instalación de redundancia total, preparada para asumir el gobierno de la nave si el centro principal queda aislado o inutilizado. En condiciones normales permanece cerrado y su acceso está restringido a operaciones de mantenimiento, inspección y pruebas periódicas. El módulo incorpora además un punto de acoplamiento estructural para naves de gran tamaño, equivalente al disponible en CONTROL PRIMARIO."
},
        L1_080: {
    nombre: "OBSERVATORIO",
    area: "Astronomía y observación espacial",
    imagen: "assets/img/OBSERVATORIO.jpg",
    imagenAlt:
        "Interior del módulo OBSERVATORIO de ALÉTHEIA",
    descripcion:
        "El módulo OBSERVATORIO no cuenta con ventanales ni cúpulas transparentes: toda la observación se realiza mediante telescopios, sensores, espectrómetros y captadores conectados a una extensa red de estaciones de trabajo. En el centro se encuentra «El Coloso», el mayor telescopio óptico construido por la humanidad. Su enorme espejo primario permanece prácticamente inmóvil y solo admite ajustes mínimos; para dirigirlo hacia una nueva región del firmamento es la propia ALÉTHEIA la que debe modificar con precisión su orientación."
},
        L1_015: {
    nombre: "MNEME-02",
    area: "Almacenamiento y preservación de datos",
    imagen: "assets/img/MNEME02.jpg",
    imagenAlt:
        "Cámara de almacenamiento protegido de MNEME-02",
    descripcion:
        "MNEME-02 dispone de una cubierta especialmente protegida destinada a salvaguardar la información más valiosa de ALÉTHEIA. En su interior, una cámara fuertemente blindada conserva soportes de almacenamiento físicamente aislados de la red con copias de investigaciones, cartografía estelar, registros de exploración y otros datos considerados irremplazables. Entre ellos se encuentra una copia maestra de PROMETEO, concebida para permitir la reconstrucción del sistema tras una pérdida catastrófica."
},
        L1_054: {
    nombre: "AGRO-01",
    area: "Producción agrícola",
    imagen: "assets/img/AGRO01.jpg",
    imagenAlt:
        "Cultivos hidropónicos del módulo AGRO 01",
    descripcion:
        "AGRO-01 forma parte del sistema de producción agrícola de ALÉTHEIA. Sus instalaciones albergan extensas áreas de cultivo hidropónico, dedicadas principalmente a verduras de hoja como lechugas, acelgas y espinacas. La iluminación, temperatura, humedad y composición de las soluciones nutritivas se controlan de forma precisa para mantener una producción continua durante todo el año. Junto a los otros tres módulos AGRO, su enorme superficie vegetal contribuye además al equilibrio atmosférico de la nave, convirtiendo estas instalaciones en uno de los grandes pulmones biológicos de ALÉTHEIA."
},

L1_050: {
    nombre: "AGRO-02",
    area: "Producción agrícola",
    imagen: "assets/img/AGRO02.jpg",
    imagenAlt:
        "Cultivos hidropónicos del módulo AGRO 02",
    descripcion:
        "AGRO-02 está especializado principalmente en plantas de mayor porte y cultivos de fruto, como tomates, pimientos y pepinos. Las plantas crecen sobre estructuras verticales que aprovechan la altura disponible y facilitan tanto la recolección como el mantenimiento. La producción se planifica de forma coordinada con el resto de módulos agrícolas para garantizar un suministro regular de alimentos frescos sin dedicar espacio innecesario a excedentes."
},

L1_042: {
    nombre: "AGRO-03",
    area: "Producción agrícola",
    imagen: "assets/img/AGRO03.jpg",
    imagenAlt:
        "Área de cultivos del módulo AGRO 03",
    descripcion:
        "AGRO-03 concentra buena parte de los cultivos cuya parte aprovechable se desarrolla bajo la superficie, utilizando sistemas especialmente diseñados para sustituir el suelo agrícola convencional. Patatas, zanahorias y otros cultivos seleccionados crecen en sustratos controlados que permiten regular con precisión el aporte de agua y nutrientes. La elección de especies prioriza su valor alimentario, productividad y capacidad para integrarse en los ciclos agrícolas de larga duración de ALÉTHEIA."
},

L1_038: {
    nombre: "AGRO-04",
    area: "Producción y propagación vegetal",
    imagen: "assets/img/AGRO04.jpg",
    imagenAlt:
        "Semilleros y cultivos especializados del módulo AGRO 04",
    descripcion:
        "AGRO-04 complementa la producción de los demás módulos mediante semilleros, propagación vegetal y cultivos que requieren una gestión más específica. Sus instalaciones permiten preparar nuevas generaciones de plantas, mantener diferentes variedades y ajustar progresivamente la producción a las necesidades de la tripulación. También proporciona plantones destinados a sustituir cultivos agotados o dañados, contribuyendo a mantener la continuidad del sistema agrícola durante misiones de larga duración."
},
        L1_012: {
    nombre: "MNEME-03",
    area: "Archivo científico",
    imagen: "assets/img/MNEME03.jpg",
    imagenAlt:
        "Archivo científico del módulo MNEME 03",
    descripcion:
        "MNEME-03 está especializado en la conservación de los datos científicos generados durante la misión. Observaciones astronómicas, análisis planetarios, secuencias genéticas, cartografía, telemetría y resultados experimentales se almacenan junto a sus registros originales, que permanecen inalterados aunque posteriormente sean procesados o reinterpretados. De este modo, una observación realizada décadas atrás puede volver a analizarse en el futuro mediante técnicas o modelos que todavía no existían cuando fue obtenida."
},
        L1_053: {
    nombre: "FORUM",
    area: "Administración y justicia",
    imagen: "assets/img/FORUM.jpg",
    imagenAlt:
        "Atrio administrativo del módulo FORUM",
    descripcion:
        "FORUM concentra buena parte de la actividad administrativa e institucional de ALÉTHEIA. Alberga el Consejo, dependencias judiciales, registros y diferentes servicios destinados a resolver los asuntos de una comunidad que debe organizarse a miles de millones de kilómetros de cualquier autoridad terrestre. Las normas de ALÉTHEIA se apoyan en principios fundamentales del derecho internacional y los derechos humanos, adaptados progresivamente a una realidad para la que apenas existían precedentes jurídicos."
},

L1_011: {
    nombre: "MNEME-04",
    area: "Patrimonio cultural",
    imagen: "assets/img/MNEME04.jpg",
    imagenAlt:
        "Acceso al patrimonio cultural almacenado en MNEME 04",
    descripcion:
        "MNEME-04 conserva el archivo maestro del patrimonio cultural transportado desde la Tierra. Millones de libros, películas, grabaciones musicales, fotografías, obras de arte digitalizadas, documentos históricos, archivos lingüísticos y otros contenidos se preservan en alta fidelidad dentro de la red MNEME. Parte de este fondo alimenta servicios de uso cotidiano como ALETHEIATV, permitiendo que la tripulación siga teniendo acceso a una enorme biblioteca cultural durante toda la misión."
},

L1_008: {
    nombre: "MNEME-05",
    area: "Registro de misión",
    imagen: "assets/img/MNEME05.jpg",
    imagenAlt:
        "Sistema de registro histórico de ALÉTHEIA en MNEME 05",
    descripcion:
        "MNEME-05 conserva la memoria operativa de ALÉTHEIA. Registra de forma permanente navegación, comunicaciones, expediciones, incidencias, mantenimiento, modificaciones estructurales y millones de intervenciones realizadas sobre los sistemas de la nave. Este historial permite reconstruir con precisión la evolución de cada instalación y consultar, incluso décadas después, qué reparación se efectuó, qué componentes fueron sustituidos y bajo qué condiciones se realizó cada intervención."
},

L1_019: {
    nombre: "MNEME-06",
    area: "Recuperación de sistemas",
    imagen: "assets/img/MNEME06.jpg",
    imagenAlt:
        "Centro de recuperación de sistemas MNEME 06",
    descripcion:
        "MNEME-06 está especialmente preparado para la recuperación de los servicios digitales de ALÉTHEIA tras una avería grave. A partir de las copias distribuidas entre los distintos módulos MNEME puede reconstruir bases de datos, configuraciones, software operativo, archivos de usuario y otros servicios esenciales. Su función no consiste únicamente en conservar información, sino en garantizar que los sistemas puedan volver a ponerse en funcionamiento incluso después de una pérdida importante de infraestructura."
},
        L1_032: {
    nombre: "HOME-01",
    area: "Japón",
    imagenes: [
    {
        src: "assets/img/HOME01.jpg",
        alt: "Zona residencial de HOME-01"
    },
    {
        src: "assets/img/HOME0102.jpg",
        alt: "Zona residencial de HOME-01"
    },   
],
    descripcion:
        "HOME-01 está dedicado a la cultura japonesa. Su principal espacio público se organiza alrededor de una plaza presidida por un torii de madera, combinando elementos de la arquitectura tradicional con las instalaciones propias de ALÉTHEIA. Comercios, restaurantes y zonas de encuentro ocupan las primeras cubiertas."
},

L1_031: {
    nombre: "HOME-02",
    area: "China",
    imagenes: [
    {
        src: "assets/img/HOME02.jpg",
        alt: "Zona residencial de HOME-02"
    },
    {
        src: "assets/img/HOME0202.jpg",
        alt: "Zona residencial de HOME-02"
    },
],
   descripcion:
        "HOME-02 recrea distintos elementos de la cultura y la arquitectura tradicional china. Como en el resto de módulos HOME, las zonas comunes y comerciales se concentran en las cubiertas inferiores, mientras que las superiores albergan las áreas residenciales."
},

L1_029: {
    nombre: "HOME-04",
    area: "India",
    imagenes: [
    {
        src: "assets/img/HOME04.jpg",
        alt: "Zona residencial de HOME-04"
    },
    {
        src: "assets/img/HOME0402.jpg",
        alt: "Zona residencial de HOME-04"
    },
],
    descripcion:
        "HOME-04 reúne referencias culturales de distintas regiones de la India en sus plazas, comercios y espacios de restauración. El módulo busca conservar parte de la enorme diversidad cultural del país dentro de la vida cotidiana de ALÉTHEIA."
},

L1_028: {
    nombre: "HOME-05",
    area: "Italia",
    imagenes: [
    {
        src: "assets/img/HOME05.jpg",
        alt: "Zona residencial de HOME-05"
    },
    {
        src: "assets/img/HOME0502.jpg",
        alt: "Zona residencial de HOME-05"
    },
],
    descripcion:
        "HOME-05 está inspirado en diferentes regiones de Italia. Una de sus zonas más características es la Plaza Toscana, presidida por una fuente y rodeada de pequeños establecimientos. Entre sus locales se encuentra la conocida Pizzería D'Maggio."
},

L1_027: {
    nombre: "HOME-06",
    area: "Eslavo oriental",
    imagenes: [
    {
        src: "assets/img/HOME06.jpg",
        alt: "Zona residencial de HOME-06"
    },
    {
        src: "assets/img/HOME0602.jpg",
        alt: "Zona residencial de HOME-06"
    },
],
    descripcion:
        "HOME-06 reúne referencias de las culturas eslavas orientales en un entorno concebido para resultar familiar a sus habitantes. Sus espacios públicos combinan arquitectura, gastronomía y elementos tradicionales procedentes de distintas regiones."
},

L1_026: {
    nombre: "HOME-07",
    area: "Estados Unidos",
    imagenes: [
    {
        src: "assets/img/HOME07.jpg",
        alt: "Zona residencial de HOME-07"
    },
    {
        src: "assets/img/HOME0702.jpg",
        alt: "Zona residencial de HOME-07"
    },
],
    descripcion:
        "HOME-07 está dedicado a la cultura estadounidense. Sus espacios comunes reinterpretan distintos ambientes urbanos y residenciales del país, integrando comercios, restauración y zonas de reunión dentro de la estructura del módulo."
},

L1_025: {
    nombre: "HOME-08",
    area: "Francia",
    imagenes: [
    {
        src: "assets/img/HOME08.jpg",
        alt: "Zona residencial de HOME-08"
    },
    {
        src: "assets/img/HOME0802.jpg",
        alt: "Zona residencial de HOME-08"
    },
],
    descripcion:
        "HOME-08 recrea diferentes ambientes de la cultura francesa. Cafeterías, pequeños comercios y espacios públicos ocupan sus primeras cubiertas, concebidas no solo como zonas de servicio, sino también como lugares de convivencia."
},

L1_024: {
    nombre: "HOME-09",
    area: "México y Centroamérica",
    imagenes: [
    {
        src: "assets/img/HOME09.jpg",
        alt: "Zona residencial de HOME-09"
    },
    {
        src: "assets/img/HOME0902.jpg",
        alt: "Zona residencial de HOME-09"
    },
],
    descripcion:
        "HOME-09 reúne referencias culturales de México y distintos países de Centroamérica. Sus zonas comunes utilizan la arquitectura, el color, la vegetación y la gastronomía para conservar parte de la identidad de estas regiones lejos de la Tierra."
},

L1_023: {
    nombre: "HOME-10",
    area: "Sudamérica",
    imagenes: [
    {
        src: "assets/img/HOME10.jpg",
        alt: "Zona residencial de HOME-10"
    },
    {
        src: "assets/img/HOME1002.jpg",
        alt: "Zona residencial de HOME-10"
    },
],
    descripcion:
        "HOME-10 está dedicado a las culturas sudamericanas. En lugar de representar un único país, sus espacios comunes reúnen referencias de distintas regiones del continente a través de la arquitectura, la vegetación, la gastronomía y otros elementos culturales, creando uno de los entornos más diversos del área residencial."
},

L1_022: {
    nombre: "HOME-11",
    area: "África",
    imagenes: [
    {
        src: "assets/img/HOME11.jpg",
        alt: "Zona residencial de HOME-11"
    },
    {
        src: "assets/img/HOME1102.jpg",
        alt: "Zona residencial de HOME-11"
    },
],
    descripcion:
        "HOME-11 reúne referencias de diferentes culturas africanas. Sus espacios públicos incluyen construcciones circulares ricamente ornamentadas y zonas de encuentro inspiradas en diferentes tradiciones arquitectónicas del continente."
},

L1_021: {
    nombre: "HOME-12",
    area: "Mundo árabe",
    imagenes: [
    {
        src: "assets/img/HOME12.jpg",
        alt: "Zona residencial de HOME-12"
    },
    {
        src: "assets/img/HOME1202.jpg",
        alt: "Zona residencial de HOME-12"
    },
],
    descripcion:
        "HOME-12 reúne referencias arquitectónicas y culturales procedentes de diferentes regiones del mundo árabe. Patios, comercios y espacios de reunión conforman un entorno común que refleja la diversidad de sus habitantes."
},

L1_020: {
    nombre: "HOME-13",
    area: "Corea",
    imagenes: [
    {
        src: "assets/img/HOME13.jpg",
        alt: "Zona residencial de HOME-13"
    },
    {
        src: "assets/img/HOME1302.jpg",
        alt: "Zona residencial de HOME-13"
    },
],
    descripcion:
        "HOME-13 está dedicado a la cultura coreana. Como todos los módulos residenciales, se comunica directamente con los HOME contiguos, permitiendo desplazarse entre ellos sin necesidad de regresar a los corredores principales de la cubierta 1."
},

L1_037: {
    nombre: "HOME-14",
    area: "Nórdico",
    imagenes: [
    {
        src: "assets/img/HOME14.jpg",
        alt: "Zona residencial de HOME-14"
    },
    {
        src: "assets/img/HOME1402.jpg",
        alt: "Zona residencial de HOME-14"
    },
],
    descripcion:
        "HOME-14 reúne referencias de las culturas nórdicas. Sus zonas comunes, caracterizadas por casas de madera de colores y espacios abiertos, ofrecen una interpretación de los pequeños núcleos urbanos del norte de Europa."
},

L1_036: {
    nombre: "HOME-15",
    area: "Europa Central",
    imagenes: [
    {
        src: "assets/img/HOME15.jpg",
        alt: "Zona residencial de HOME-15"
    },
    {
        src: "assets/img/HOME1502.jpg",
        alt: "Zona residencial de HOME-15"
    },
],
    descripcion:
        "HOME-15 reúne principalmente referencias de Alemania, Austria, Suiza y otras regiones de Europa Central. La ubicación de los módulos HOME en el tercer anillo los mantiene alejados de las instalaciones más ruidosas y de mayor actividad industrial de ALÉTHEIA."
},

L1_035: {
    nombre: "HOME-16",
    area: "Británico e irlandés",
    imagenes: [
    {
        src: "assets/img/HOME16.jpg",
        alt: "Zona residencial de HOME-16"
    },
    {
        src: "assets/img/HOME1602.jpg",
        alt: "Zona residencial de HOME-16"
    },
],
    descripcion:
        "HOME-16 reúne referencias culturales de Gran Bretaña e Irlanda. La iluminación y climatización de todos los HOME siguen un ciclo de día y noche; durante las horas nocturnas disminuyen la luz y la temperatura y se reducen las operaciones no esenciales."
},

L1_034: {
    nombre: "HOME-17",
    area: "Sudeste asiático",
    imagenes: [
    {
        src: "assets/img/HOME17.jpg",
        alt: "Zona residencial de HOME-17"
    },
    {
        src: "assets/img/HOME1702.jpg",
        alt: "Zona residencial de HOME-17"
    },
],
    descripcion:
        "HOME-17 reúne referencias culturales de diferentes regiones del Sudeste Asiático. Su diseño combina vegetación, zonas comerciales y espacios comunitarios, adaptando elementos tradicionales a las limitaciones de un entorno completamente artificial."
},

L1_033: {
    nombre: "HOME-18",
    area: "Oceanía y Pacífico",
    imagenes: [
    {
        src: "assets/img/HOME18.jpg",
        alt: "Zona residencial de HOME-18"
    },
    {
        src: "assets/img/HOME1802.jpg",
        alt: "Zona residencial de HOME-18"
    },
],
    descripcion:
        "HOME-18 reúne referencias culturales de Australia, Nueva Zelanda y diferentes pueblos del Pacífico. Como medida de emergencia, la cubierta superior de cada módulo HOME dispone de alojamientos colectivos con literas capaces de aumentar temporalmente la capacidad residencial de ALÉTHEIA."
},        
    };

    function eliminarSeleccion() {
        svg
            .querySelectorAll(".modulo-seleccionado")
            .forEach((modulo) => {
                modulo.classList.remove(
                    "modulo-seleccionado"
                );
            });
    }
    let imagenesActuales = [];
    let indiceImagenActual = 0;

    function mostrarDatos(datos, estado) {
    estadoFicha.textContent = estado;
    nombreModulo.textContent = datos.nombre;
    areaModulo.textContent = datos.area;
    descripcionModulo.textContent = datos.descripcion;

    imagenesActuales = datos.imagenes || [
        {
            src: datos.imagen,
            alt: datos.imagenAlt
        }
    ];

    indiceImagenActual = 0;

    imagenModulo.src = imagenesActuales[0].src;
    imagenModulo.alt = imagenesActuales[0].alt;

    if (botonMasImagenes) {
        botonMasImagenes.hidden =
            imagenesActuales.length <= 1;
    }

    fichaModulo.classList.remove(
        "ficha-modulo--oculta"
    );
}
    function mostrarFichaGeneral() {
        eliminarSeleccion();

        mostrarDatos(
            datosGenerales,
            "Estructura de ALÉTHEIA"
        );
    }

    function mostrarFichaModulo(modulo) {
        eliminarSeleccion();

        modulo.classList.add("modulo-seleccionado");

        const datos = datosModulos[modulo.id];

        if (!datos) {
            mostrarDatos(
                {
                    nombre: modulo.id,
                    area: "Información pendiente",
                    imagen:
                        "assets/img/ALETHEIA-NIVELES.jpg",
                    imagenAlt:
                        "Representación general de ALÉTHEIA",
                    descripcion:
                        "Este módulo todavía no tiene una ficha asociada."
                },
                "Módulo seleccionado"
            );

            return;
        }

        mostrarDatos(
            datos,
            "Módulo seleccionado"
        );
        if (
    explorarContenedor &&
    window.matchMedia("(max-width: 575.98px)").matches
) {
    explorarContenedor.classList.add(
        "modo-ficha-movil"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
    }

    function actualizarBotones(esNivel1) {
        botonNivel1.classList.toggle(
            "selector-nivel__boton--activo",
            esNivel1
        );

        botonNivel2.classList.toggle(
            "selector-nivel__boton--activo",
            !esNivel1
        );

        botonNivel1.setAttribute(
            "aria-pressed",
            String(esNivel1)
        );

        botonNivel2.setAttribute(
            "aria-pressed",
            String(!esNivel1)
        );
    }

    function mostrarNivel(numeroNivel) {
        const esNivel1 = numeroNivel === 1;

        eliminarSeleccion();

        nivel1.style.display = esNivel1 ? "" : "none";
        nivel2.style.display = esNivel1 ? "none" : "";

        actualizarBotones(esNivel1);
        mostrarFichaGeneral();
    }

    todosLosModulos.forEach((modulo) => {
        modulo.style.cursor = "pointer";
        modulo.setAttribute("role", "button");
        modulo.setAttribute("tabindex", "0");

        modulo.addEventListener("click", () => {
            mostrarFichaModulo(modulo);
        });

        modulo.addEventListener("keydown", (evento) => {
            if (
                evento.key === "Enter" ||
                evento.key === " "
            ) {
                evento.preventDefault();
                mostrarFichaModulo(modulo);
            }
        });
    });
if (botonMasImagenes) {
    botonMasImagenes.addEventListener("click", () => {
        if (imagenesActuales.length <= 1) {
            return;
        }

        indiceImagenActual =
            (indiceImagenActual + 1) %
            imagenesActuales.length;

        imagenModulo.src =
            imagenesActuales[indiceImagenActual].src;

        imagenModulo.alt =
            imagenesActuales[indiceImagenActual].alt;
    });
}
    botonNivel1.addEventListener("click", () => {
        mostrarNivel(1);
    });

    botonNivel2.addEventListener("click", () => {
        mostrarNivel(2);
    });
    if (botonCerrarFicha && explorarContenedor) {
    botonCerrarFicha.addEventListener("click", () => {
        explorarContenedor.classList.remove(
            "modo-ficha-movil"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

    svg.setAttribute(
        "preserveAspectRatio",
        "xMidYMid meet"
    );

    mostrarNivel(1);
});