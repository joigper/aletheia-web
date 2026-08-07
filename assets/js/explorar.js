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

    const botonNivel1 = document.getElementById("mostrar-nivel-1");
    const botonNivel2 = document.getElementById("mostrar-nivel-2");

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
        
        L1_002: {
            nombre: "ZEUS-01",
            area: "Reactor de fusión",
            imagen: "assets/img/ZEUS01.jpg",
            imagenAlt:
                "Interpretación visual del módulo ZEUS",
           descripcion:
                "Uno de los ocho reactores de fusión de ALÉTHEIA. Su ubicación en el primer anillo permite que las líneas de distribución energética de mayor capacidad alimenten directamente al motor gravitatorio NEXUS, minimizando pérdidas y garantizando el suministro al sistema más exigente de la nave."
        },
        L1_003: {
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
    imagen: "assets/img/COCINA.jpg",
    imagenAlt:
        "Cocina principal de ALÉTHEIA",
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
    nombre: "MNEME 01",
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
    nombre: "SEA",
    area: "Acuicultura",
    imagen: "assets/img/SEA01.jpg",
    imagenAlt:
        "Instalaciones del módulo SEA",
    descripcion:
        "SEA es uno de los dos módulos de acuicultura de ALÉTHEIA. En sus instalaciones se crían distintas especies de peces en circuitos cerrados de agua, donde la temperatura, la salinidad, la oxigenación y la calidad del agua son supervisadas de forma permanente. Los animales se distribuyen entre diferentes tanques según su fase de crecimiento, garantizando un desarrollo óptimo y un suministro continuo de proteína fresca para la tripulación. Su ubicación simétrica respecto al segundo módulo SEA contribuye además al equilibrio estructural y al reparto de masas de la nave."
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
    imagen: "assets/img/HOME-03 España.jpg",
    imagenAlt:
        "Plaza principal del módulo HOME-03",
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
        L1_088: {
    nombre: "OCIO",
    area: "Comercio, restauración y servicios",
    imagen: "assets/img/OCIO.jpg",
    imagenAlt:
        "Avenida comercial principal del módulo OCIO de ALÉTHEIA",
    descripcion:
        "El complejo OCIO ocupa cuatro módulos comunicados y constituye la principal zona comercial y de entretenimiento de ALÉTHEIA. Su interior se organiza alrededor de una gran avenida peatonal abierta, flanqueada por varios niveles de balcones, escaleras mecánicas, zonas de descanso y grandes maceteros con vegetación ornamental. A lo largo del recorrido se distribuyen tiendas, peluquerías, cafeterías, restaurantes y numerosos servicios destinados a la vida cotidiana de la tripulación. Su diseño reproduce la atmósfera de un elegante centro comercial terrestre y ofrece un espacio luminoso y animado donde pasear, reunirse o desconectar de las instalaciones técnicas de la nave."
},
        L1_055: {
    nombre: "HOSPITAL",
    area: "Medicina, investigación y formación",
    imagen: "assets/img/HOSPITAL.jpg",
    imagenAlt:
        "Complejo Hospitalario de ALÉTHEIA",
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
        L1_080: {
    nombre: "OBSERVATORIO",
    area: "Astronomía y observación espacial",
    imagen: "assets/img/OBSERVATORIO.jpg",
    imagenAlt:
        "Interior del módulo OBSERVATORIO de ALÉTHEIA",
    descripcion:
        "El módulo OBSERVATORIO no cuenta con ventanales ni cúpulas transparentes: toda la observación se realiza mediante telescopios, sensores, espectrómetros y captadores conectados a una extensa red de estaciones de trabajo. En el centro se encuentra «El Coloso», el mayor telescopio óptico construido por la humanidad. Su enorme espejo primario permanece prácticamente inmóvil y solo admite ajustes mínimos; para dirigirlo hacia una nueva región del firmamento es la propia ALÉTHEIA la que debe modificar con precisión su orientación."
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

    function mostrarDatos(datos, estado) {
        estadoFicha.textContent = estado;
        nombreModulo.textContent = datos.nombre;
        areaModulo.textContent = datos.area;
        descripcionModulo.textContent = datos.descripcion;

        imagenModulo.src = datos.imagen;
        imagenModulo.alt = datos.imagenAlt;

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

    botonNivel1.addEventListener("click", () => {
        mostrarNivel(1);
    });

    botonNivel2.addEventListener("click", () => {
        mostrarNivel(2);
    });

    svg.setAttribute(
        "preserveAspectRatio",
        "xMidYMid meet"
    );

    mostrarNivel(1);
});