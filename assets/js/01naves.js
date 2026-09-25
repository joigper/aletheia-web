window.naves = [
    {
        id: "aletheia",
        nombre: "ALÉTHEIA",
        icono: "assets/img/aletheia-alternativa-orbita.png",

        tipo: "Ciudad-nave interestelar",
        funcion: "Exploración científica y asentamiento humano",

        datos: [
            { etiqueta: "Eslora", valor: "≈ 953 m" },
            { etiqueta: "Manga máxima", valor: "≈ 850 m" },
            { etiqueta: "Altura estructural", valor: "≈ 100 m" },
            { etiqueta: "Configuración", valor: "2 niveles estructurales" },
            { etiqueta: "Módulos", valor: "110 módulos hexagonales" },
            { etiqueta: "Superficie acumulada", valor: "≈ 714.000 m²" },
            { etiqueta: "Población habitual", valor: "+15.000 personas" },
            { etiqueta: "Desplazamiento / masa", valor: "Por determinar" },
            { etiqueta: "Capacidad de salto", valor: "Sí" }
        ],

        imagenes: [
            {
                src: "assets/img/aletheia-alternativa-orbita.png",
                alt: "Ciudad-nave interestelar ALÉTHEIA en órbita"
            }
        ],

        descripcion:
            "ALÉTHEIA es una ciudad-nave interestelar concebida para la exploración científica y el asentamiento humano. Su estructura principal está formada por 110 prismas hexagonales de 50 metros de lado y 50 metros de altura: 91 módulos en el nivel inferior y 19 en el superior. Las dimensiones indicadas describen la estructura principal y excluyen torres, antenas y otros elementos de comunicaciones.",

        curiosidad: {
            titulo: "¿Cuánta agua cabría en ALÉTHEIA?",
            cifra: "≈ 35.700 millones de litros",
            equivalencia: "≈ 14.300 piscinas olímpicas",
            nota: "Comparación basada en el volumen geométrico bruto de los 110 prismas estructurales, imaginados completamente vacíos.",
            imagen: "assets/img/comparacion-aletheia-legend-of-the-seas.png",
            imagenAlt: "Comparación en planta y a la misma escala entre ALÉTHEIA y el crucero Legend of the Seas"
        }
    },

    {
        id: "estandar",
        nombre: "LANZADERA ESTÁNDAR",
        icono: "assets/img/ICONOESTANDAR.png",

        tipo: "Lanzadera planetaria",
        funcion: "Transporte de personal y carga",

        longitud: "18 m",
        anchura: "9 m",
        capacidad: "12 personas",
        unidades: "Varias unidades",
        salto: "No",
        hangar: "Hangar estándar",

        imagenes: [
            {
                src: "assets/img/SAURON01.jpg",
                alt: "Lanzadera estándar de ALÉTHEIA"
            },
            {
                src: "assets/img/SAURON02.jpg",
                alt: "Lanzadera estándar durante operaciones"
            },
            {
                src: "assets/img/SAURON03.jpg",
                alt: "Lanzadera estándar durante operaciones"
            }
        ],

        descripcion:
            "La lanzadera estándar constituye el principal vehículo auxiliar de ALÉTHEIA. Está diseñada para realizar de forma continuada operaciones entre la nave y superficies planetarias, soportando numerosos ciclos de entrada atmosférica, aterrizaje y despegue. Cada unidad recibe tradicionalmente un nombre elegido por su piloto."
    },

    {
        id: "minera",
        nombre: "LANZADERA MINERA",
        icono: "assets/img/ICONOMINERO.png",

        tipo: "Lanzadera industrial",
        funcion: "Extracción y transporte de minerales",

        longitud: "20 m",
        anchura: "11 m",
        capacidad: "4 personas",
        unidades: "Varias unidades",
        salto: "No",
        hangar: "Hangar industrial",

        imagenes: [
            {
                src: "assets/img/MINERA01.jpg",
                alt: "Lanzadera minera de ALÉTHEIA"
            },            
        ],

        descripcion:
            "Las lanzaderas mineras son adaptaciones especializadas de la lanzadera estándar. Incorporan equipos destinados a la extracción, recogida y transporte de minerales y materias primas obtenidas durante las operaciones de exploración."
    },

    {
        id: "arcturus",
        nombre: "ARCTURUS",
        icono: "assets/img/ICONOARCTURUS.png",

        tipo: "Lanzadera de largo alcance",
        funcion: "Exploración y transporte interplanetario",

        longitud: "35 m",
        anchura: "18 m",
        capacidad: "12 personas",
        unidades: "1 unidad",
        salto: "Sí",
        hangar: "Hangar pesado",

        imagenes: [
            {
                src: "assets/img/ARCTURUS01.jpg",
                alt: "Nave ARCTURUS"
            },
            {
                src: "assets/img/ARCTURUS02.jpg",
                alt: "Interior de ARCTURUS"
            }
        ],

        descripcion:
            "ARCTURUS es una lanzadera de gran tamaño concebida para misiones que requieren mayor autonomía que una lanzadera convencional. Dispone de varios camarotes, sistemas informáticos propios y sensores avanzados. Su motor gravitatorio permite realizar saltos y superar la velocidad de la luz."
    },

    {
        id: "hermes",
        nombre: "HERMES",
        icono: "assets/img/ICONOHERMES.png",

        tipo: "Nave correo",
        funcion: "Transporte rápido de información y carga ligera",

        longitud: "12 m",
        anchura: "5 m",
        capacidad: "1 piloto",
        unidades: "1 unidad",
        salto: "Sí",
        hangar: "Hangar estándar",

        imagenes: [
            {
                src: "assets/img/HERMES01.jpg",
                alt: "Nave correo HERMES"
            },
        ],

        descripcion:
            "HERMES es una pequeña nave correo diseñada alrededor de una única prioridad: la velocidad. Solo dispone de espacio para un piloto y su interior resulta incómodo y claustrofóbico, ya que prácticamente todo el volumen disponible está ocupado por el motor y su fuente de energía. Cuenta con un pequeño compartimento de carga para objetos y suministros."
    },

    {
        id: "toro",
        nombre: "TORO",
        icono: "assets/img/ICONOTORO.png",

        tipo: "Transbordador pesado",
        funcion: "Transporte y manipulación de grandes estructuras",

        longitud: "70 m",
        anchura: "45 m",
        capacidad: "Tripulación técnica",
        unidades: "1 unidad",
        salto: "Sí",
        hangar: "HANGAR TORO",

        imagenes: [
            {
                src: "assets/img/TORO01.jpg",
                alt: "Transbordador pesado TORO"
            },
        ],

        descripcion:
            "TORO es un enorme transbordador de carga diseñado para manipular estructuras que ninguna otra nave auxiliar puede transportar. Su capacidad permite desplazar módulos completos de ALÉTHEIA. No está concebido para viajes convencionales ni para proporcionar comodidad a su tripulación, pero dispone de un motor gravitatorio completo y una fuente de energía propia capaces de realizar saltos."
    },

    {
        id: "praetoriae",
        nombre: "PRAETORIAE",
        icono: "assets/img/ICONOPRAETORIAE.png",

        tipo: "Nave modular",
        funcion: "Operaciones independientes de largo alcance",

        longitud: "260 m",
        anchura: "260 m",
        capacidad: "500 tripulantes",
        unidades: "1 unidad",
        salto: "Sí",
        hangar: "No aplicable",

        imagenes: [
            {
                src: "assets/img/PRAETORIAE01.jpg",
                alt: "Nave PRAETORIAE"
            },
        ],

        descripcion:
            "PRAETORIAE es una nave construida utilizando la misma arquitectura modular de ALÉTHEIA. Está formada por siete módulos: uno central y un único anillo de seis módulos alrededor. Sus módulos utilizan las mismas dimensiones y principios estructurales que los instalados en ALÉTHEIA."
    },
    {
    id: "ulises",
    nombre: "ULISES",
    icono: "assets/img/ICONOULISES.png",

    tipo: "Vehículo terrestre de exploración",
    funcion: "Exploración científica de larga duración",

    longitud: "18 m",
    anchura: "5 m",
    capacidad: "4 personas",
    unidades: "Pedido en curso",
    salto: "No aplicable",
    hangar: "HANGAR TORO",

    imagenes: [
        {
            src: "assets/img/ULISES01.jpg",
            alt: "Vehículo terrestre de exploración ULISES"
        }
    ],

    descripcion:
        "ULISES es un vehículo terrestre de exploración diseñado para misiones científicas de larga duración sobre superficies planetarias. Su interior permite alojar a un equipo de cuatro personas durante periodos prolongados, proporcionando espacio para descanso, trabajo científico, almacenamiento y los sistemas necesarios para mantener unas condiciones habitables. Su batería nuclear le proporciona una autonomía energética de varios años, reduciendo al mínimo la dependencia de una base exterior. Su tamaño, robustez y sistemas de movilidad están concebidos para operar sobre terrenos difíciles y alejados de las zonas de asentamiento. Estas capacidades tienen una contrapartida: ULISES es una máquina compleja y su coste de mantenimiento resulta excepcionalmente elevado."
},
];
