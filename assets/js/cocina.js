document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("cocina-intro");
  const video = document.getElementById("cocina-video");
  const layout = document.querySelector(".cocina-layout");
  const croquis = document.querySelector(".cocina-croquis");
  const info = document.querySelector(".cocina-info");
  const modelo = document.querySelector(".cocina-final");

  if (!intro || !video || !layout || !croquis || !info || !modelo) {
    return;
  }

  const modeloBase = modelo.getAttribute("src");
  const plano = document.createElement("img");
  plano.className = "cocina-plano";
  plano.alt = "";
  plano.setAttribute("aria-hidden", "true");
  intro.appendChild(plano);

  // Cubiertas con plano funcional disponible.
  const planosDisponibles = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  const puntosCubierta1 = [
    {
      x: 50,
      y: 21,
      titulo: "Tienda de congelados",
      texto: "Esta tienda logística reúne alimentos congelados envasados y trazados para la tripulación. Funciona como punto de suministro de proximidad dentro de la red común de pasillos, con conservación autónoma y reposición desde los circuitos internos de ALÉTHEIA.",
      medio: {
        tipo: "video",
        src: "assets/img/cocina/cocinac1p01.mp4"
      }
    },
    {
      x: 36,
      y: 61,
      titulo: "Frescos de corta duración",
      texto: "Aquí se distribuyen alimentos listos para consumir con rotación rápida: ensaladas, fruta preparada, gazpachos, postres refrigerados, lácteos y raciones envasadas. Solo llegan productos que permanecieron sin servir y han superado el control de tiempo, temperatura y trazabilidad; nunca sobras de platos individuales.",
      medio: {
        tipo: "imagen",
        src: "assets/img/cocina/cocinac1p02.jpg",
        alt: "Tienda de frescos de corta duración de ALÉTHEIA"
      }
    },
    {
      x: 64,
      y: 61,
      titulo: "Retorno y lavado de envases",
      texto: "Las bandejas, cubetas y tapas reutilizables regresan por un circuito separado. Se clasifican, pasan por lavado industrial, secado e inspección, y vuelven a los carros limpios para un nuevo servicio. El sistema reduce el uso de plásticos de un solo uso y mantiene separados los flujos sucio y limpio.",
      medio: {
        tipo: "imagen",
        src: "assets/img/cocina/cocinac1p03.jpg",
        alt: "Retorno y lavado industrial de envases reutilizables de ALÉTHEIA"
      }
    }
  ];

  const puntosCubierta2 = [
    {
  x: 50,
  y: 84,
  titulo: "Recepción y control",
  texto: "Los suministros procedentes de ALMACÉN 2 llegan a esta zona para su identificación, inspección y clasificación antes de incorporarse al circuito de preparación. También se reciben aquí las raciones preparadas que finalmente no han sido servidas y continúan siendo aptas para el consumo. Tras su control y envasado, se derivan a los establecimientos de la cubierta logística 1 para su distribución, manteniendo al público fuera de las áreas de producción alimentaria y reduciendo recorridos innecesarios.",
  medio: {
    tipo: "video",
    src: "assets/img/cocina/cocinac2p01.mp4"
  }
},
    {
      x: 38,
  y: 69,
  titulo: "Conservación y descongelación",
  texto: "Las cámaras frigoríficas de trabajo mantienen únicamente las reservas necesarias para la producción inmediata, evitando almacenar en COCINA grandes cantidades de alimentos durante largos periodos. Los productos procedentes de ALMACÉN 2 se conservan a la temperatura adecuada y, cuando es necesario, pasan por procesos de descongelación controlada antes de incorporarse a las áreas de preparación. Estas operaciones se realizan en espacios separados para mantener la cadena de frío y las condiciones higiénicas.",
  medio: {
    tipo: "imagen",
    src: "assets/img/cocina/cocinac2p02.jpg",
    alt: "Zona de conservación y descongelación controlada del módulo Cocina"
    }
  },
  {
      x: 35,
  y: 31,
  titulo: "Preparación vegetal",
  texto: "Área destinada a la selección, lavado, desinfección, pelado y corte de verduras, frutas y otros productos vegetales. Los procesos se realizan en líneas diferenciadas y parcialmente automatizadas, bajo supervisión del personal de COCINA, antes de que los ingredientes preparados pasen a las áreas de elaboración.",
  medio: {
    tipo: "imagen",
    src: "assets/img/cocina/cocinac2p03.jpg",
    alt: "Zona de preparación y procesado de productos vegetales del módulo Cocina"
  }
    },
    {
      x: 66,
      y: 36,
      titulo: "Carnes y pescado",
      texto: "Los productos cárnicos y el pescado se procesan en sectores diferenciados para mantener unas condiciones higiénicas independientes y evitar contaminaciones cruzadas.",
      medio: {
        tipo: "imagen",
        src: "assets/img/cocina/cocinac2p04.jpg",
        alt: "Área separada de procesamiento de carnes y pescado del módulo Cocina"
      }
    },
    {
      x: 50,
      y: 50,
      titulo: "Circulación vertical y retornos",
      texto: "El núcleo central conecta la cubierta con las plantas superiores mediante montacargas. Los residuos, recipientes y retornos siguen un recorrido separado del flujo de alimentos preparados.",
      medio: {
        tipo: "video",
        src: "assets/img/cocina/cocinac2p05.mp4"
      }
    }
  ];

  const puntosCubierta3 = [
    {
      x: 50,
      y: 24,
      titulo: "Hornos de producción y rosticería",
      texto: "Una batería de hornos de gran capacidad permite asar de forma continua aves, carnes, pescados, verduras y otras preparaciones que requieren calor seco y circulación uniforme. Los ciclos se coordinan con el ritmo del servicio para suministrar grandes tandas de comida caliente a las áreas de terminación y expedición.",
      medio: {
        tipo: "video",
        src: "assets/img/cocina/cocinac3p01.mp4"
      },
      receta: {
        imagen: "assets/img/cocina/cocinac3p01-receta.jpg",
        alt: "Costillas de cerdo caramelizadas con salsa de cola",
        ingredientes: [
          "1,5 kg de costillas de cerdo",
          "330 ml de refresco de cola",
          "120 g de kétchup",
          "1 cucharada de mostaza",
          "1 cucharada de salsa Worcestershire",
          "2 dientes de ajo rallados",
          "1 cucharadita de pimentón ahumado",
          "1 cucharada de vinagre de manzana",
          "Sal y pimienta negra"
        ],
        pasos: [
          "Sazonar las costillas con sal, pimienta y pimentón.",
          "Mezclar la cola, el kétchup, la mostaza, la salsa Worcestershire, el ajo y el vinagre.",
          "Cubrir las costillas con dos tercios de la salsa y hornear, tapadas, a 160 °C durante 1 hora y 45 minutos.",
          "Retirar el aluminio, pintar con la salsa restante y subir el horno a 220 °C.",
          "Hornear entre 12 y 18 minutos más, pintando una o dos veces, hasta que el glaseado caramelice."
        ]
      }
    },
    {
      x: 32,
      y: 50,
      titulo: "Marmitas y cocción principal",
      texto: "Las marmitas de gran capacidad concentran la cocción de caldos, sopas, legumbres, pastas, arroces y otros platos de elaboración continua. Sus controles permiten mantener tiempos y temperaturas constantes mientras el personal supervisa cada lote antes de enviarlo a las áreas de terminación.",
      medio: {
        tipo: "video",
        src: "assets/img/cocina/cocinac3p02.mp4"
      }
    },
    {
      x: 68,
      y: 50,
      titulo: "Planchas y salteados",
      texto: "Dos líneas de planchas industriales permiten trabajar simultáneamente carnes, pescados, verduras y preparaciones de acabado rápido. La producción se organiza por tandas y horarios de servicio para entregar cada elaboración en el punto óptimo de cocción a las cubiertas superiores.",
      medio: {
        tipo: "video",
        src: "assets/img/cocina/cocinac3p03.mp4"
      }
    },
    {
      x: 39,
      y: 76,
      titulo: "Salsas, guarniciones y preparación final",
      texto: "En esta línea se elaboran y mantienen las salsas, se preparan las guarniciones y se realizan los últimos ajustes de cada plato. Las cubetas térmicas y recipientes de servicio conservan cada componente en condiciones adecuadas hasta su paso a emplatado.",
      medio: {
        tipo: "imagen",
        src: "assets/img/cocina/cocinac3p04.jpg",
        alt: "Zona de salsas, guarniciones y preparación final del módulo Cocina"
      }
    },
    {
      x: 61,
      y: 76,
      titulo: "Emplatado y expedición",
      texto: "Las elaboraciones terminadas se porcionan y agrupan según el comedor de destino. El equipo coordina el ritmo de salida, carga los carros térmicos y verifica que cada servicio salga completo antes de su distribución vertical hacia las cubiertas de comedores.",
      medio: {
        tipo: "video",
        src: "assets/img/cocina/cocinac3p05.mp4"
      }
    }
  ];

  const puntosCubierta4 = [
    {
      x: 37,
      y: 37,
      titulo: "Preparación fría",
      texto: "Esta área produce ensaladas, platos fríos, fruta preparada y salsas para el servicio diario. Sus superficies refrigeradas y cámaras de día mantienen la cadena de frío hasta el momento en que cada elaboración pasa a montaje y expedición.",
      medio: {
        tipo: "imagen",
        src: "assets/img/cocina/cocinac4p01.jpg",
        alt: "Área de preparación fría de ALÉTHEIA"
      }
    },
    {
      x: 58,
      y: 25,
      titulo: "Panadería y masas",
      texto: "Amasado, fermentación y horneado se concentran en una zona con control propio de temperatura, vapor y extracción. Produce pan, masas y elaboraciones horneadas para los servicios regulares y los menús especiales del módulo.",
      medio: {
        tipo: "video",
        src: "assets/img/cocina/cocinac4p02.mp4"
      }
    },
    {
      x: 66,
      y: 50,
      titulo: "Repostería y postres",
      texto: "La producción dulce se organiza por lotes: postres de cuchara, fruta, repostería y raciones refrigeradas. Esta separación permite mantener ritmos y controles específicos sin interferir con la cocina caliente ni con la panadería.",
      medio: {
        tipo: "imagen",
        src: "assets/img/cocina/cocinac4p03.jpg",
        alt: "Área de repostería y postres de ALÉTHEIA"
      }
    },
    {
      x: 39,
      y: 70,
      titulo: "Dietas y alérgenos",
      texto: "Esta cocina dietética y clínica prepara menús sin gluten y para alergias alimentarias, además de dietas vegetarianas, veganas, religiosas o prescritas por razones médicas: diabética, baja en sal, renal, hipocalórica y de textura modificada. Sus utensilios, superficies, cámaras y circuitos de trabajo son exclusivos para prevenir contaminaciones cruzadas. Desde aquí también se elaboran, sellan y envían las comidas individualizadas destinadas al Hospital ALÉTHEIA.",
      medio: {
        tipo: "video",
        src: "assets/img/cocina/cocinac4p04.mp4"
      }
    },
    {
      x: 61,
      y: 72,
      titulo: "Acabado frío y expedición",
      texto: "Aquí se completa el montaje de preparaciones frías, se agrupan las bandejas por destino y se cargan los carros de servicio. La salida conecta directamente con la cubierta 5, donde se coordinan los últimos tiempos de entrega hacia los comedores.",
      medio: {
        tipo: "imagen",
        src: "assets/img/cocina/cocinac4p05.jpg",
        alt: "Acabado frío y expedición de la cubierta 4"
      }
    }
  ];

  const puntosCubierta5 = [
    {
      x: 37,
      y: 49,
      titulo: "Recepción de producción",
      texto: "Las elaboraciones procedentes de las cubiertas 2, 3 y 4 llegan en cubetas y carros identificados por lote, destino y ventana de servicio. Antes de pasar al montaje se comprueba su temperatura, integridad y secuencia de entrega para que cada preparación continúe por el circuito correcto.",
      medio: {
        tipo: "imagen",
        src: "assets/img/cocina/cocinac5p01.jpg",
        alt: "Recepción de elaboraciones procedentes de producción en ALÉTHEIA"
      }
    },
    {
      x: 50,
      y: 24,
      titulo: "Montaje final",
      texto: "En esta línea se combinan los componentes de cada servicio en bandejas reutilizables, se completa la guarnición y se verifica el destino de cada lote. El ritmo está sincronizado con los turnos de los comedores para que las bandejas no esperen más tiempo del necesario.",
      medio: {
        tipo: "video",
        src: "assets/img/cocina/cocinac5p02.mp4"
      }
    },
    {
      x: 64,
      y: 49,
      titulo: "Conservación térmica",
      texto: "Carros y armarios térmicos mantienen cada preparación caliente o fría durante la breve espera previa a la salida. No es un almacén: su función es amortiguar los ritmos entre cocina y comedor sin comprometer calidad, temperatura ni trazabilidad.",
      medio: {
        tipo: "imagen",
        src: "assets/img/cocina/cocinac5p03.jpg",
        alt: "Carros térmicos de conservación temporal en ALÉTHEIA"
      }
    },
    {
      x: 50,
      y: 75,
      titulo: "Expedición a comedores",
      texto: "Los carros se agrupan por comedor y turno antes de pasar a los montacargas. Esta última comprobación confirma cantidades, menú y destino, y coordina la salida hacia las cubiertas 6, 7 y 8 sin interferir con el retorno de envases ni los suministros entrantes.",
      medio: {
        tipo: "video",
        src: "assets/img/cocina/cocinac5p04.mp4"
      }
    }
  ];

  const puntosCubierta6 = [
    {
      x: 58,
      y: 74,
      titulo: "Comedor C · sala principal",
      texto: "El comedor C dispone de 1.000 plazas organizadas en sectores amplios y fácilmente legibles. Su distribución permite atender grandes flujos de comensales sin perder comodidad, manteniendo recorridos claros hacia el núcleo central y los accesos laterales.",
      medio: {
        tipo: "video",
        src: "assets/img/cocina/cocinac6p01.mp4"
      }
    },
    {
      x: 56,
      y: 40,
      titulo: "Servicio asistido",
      texto: "Los mostradores abiertos de la corona de servicio permiten entregar los platos, reponer bandejas y coordinar la salida de carros térmicos sin invadir la sala principal. El personal trabaja desde el interior de esta franja técnica, siempre cerca de cada comedor.",
      medio: {
        tipo: "imagen",
        src: "assets/img/cocina/cocinac6p02.jpg",
        alt: "Mostrador de servicio asistido de los comedores del módulo Cocina"
      }
    },
    {
      x: 48,
      y: 37,
      titulo: "Acceso vertical",
      texto: "Los grandes ascensores conectan estas cubiertas con el resto del módulo y absorben los momentos de mayor afluencia. Su tamaño permite alternar el transporte de personas con los desplazamientos logísticos de los pequeños vehículos internos, según la necesidad de cada turno.",
      medio: {
        tipo: "video",
        src: "assets/img/cocina/cocinac6p03.mp4"
      }
    },
    {
      x: 30,
      y: 50,
      titulo: "Accesos laterales y circulación",
      texto: "Además del paso desde el núcleo central, cada comedor dispone de dos accesos por módulos contiguos. Esta red de entradas reparte las llegadas y salidas de los comensales, evita concentraciones en un único punto y facilita el tránsito hacia HOME, SPORT y las escaleras.",
      medio: {
        tipo: "imagen",
        src: "assets/img/cocina/cocinac6p04.jpg",
        alt: "Comensales saliendo del comedor por una de sus conexiones laterales"
      }
    }
  ];

  const puntosCubierta9 = [
    {
      x: 37,
      y: 66,
      titulo: "Comedor de alta densidad",
      texto: "Esta cubierta funciona como comedor de contingencia para misiones de evacuación o transporte masivo. Mesas corridas, recorridos directos y líneas de reparto autónomas permiten atender a miles de personas por turnos, con un servicio simplificado, seguro y de alta rotación.",
      medio: {
        tipo: "imagen",
        src: "assets/img/cocina/cocinac9p01.jpg",
        alt: "Comedor de alta densidad de ALÉTHEIA"
      }
    }
  ];

  const puntosPorCubierta = new Map([
    [1, puntosCubierta1],
    [2, puntosCubierta2],
    [3, puntosCubierta3],
    [4, puntosCubierta4],
    [5, puntosCubierta5],
    [6, puntosCubierta6],
    [9, puntosCubierta9]
  ]);

  const detalle = document.createElement("aside");
  detalle.className = "cocina-detalle";
  detalle.setAttribute("aria-live", "polite");

  const detalleMedio = document.createElement("div");
  detalleMedio.className = "cocina-detalle-medio";
  const detalleReferencia = document.createElement("span");
  detalleReferencia.className = "cocina-info-numero";
  const detalleTitulo = document.createElement("strong");
  detalleTitulo.className = "cocina-info-nombre";
  const detalleTexto = document.createElement("p");
  detalleTexto.className = "cocina-info-descripcion";
    const detalleAccion = document.createElement("button");
  detalleAccion.type = "button";
  detalleAccion.className = "cocina-detalle-accion";
  detalleAccion.textContent = "VER RECETA DE SERVICIO";
  detalleAccion.hidden = true;

  const detalleReceta = document.createElement("div");
  detalleReceta.className = "cocina-receta";
  detalleReceta.hidden = true;

  const detalleVolver = document.createElement("button");
  detalleVolver.type = "button";
  detalleVolver.className = "cocina-detalle-volver";
  detalleVolver.textContent = "VOLVER A HORNOS";
  detalleVolver.hidden = true;

  const detalleCerrar = document.createElement("button");
  detalleCerrar.type = "button";
  detalleCerrar.className = "cocina-detalle-cerrar";
  detalleCerrar.textContent = "CERRAR";

  detalle.append(
    detalleMedio,
    detalleReferencia,
    detalleTitulo,
    detalleTexto,
    detalleAccion,
    detalleReceta,
    detalleVolver,
    detalleCerrar
  );
  intro.parentElement.appendChild(detalle);
  const mostrarReceta = (receta, nivel, numeroPunto, punto) => {
    detalleReferencia.textContent =
      `CUBIERTA ${nivel} · PUNTO ${String(numeroPunto).padStart(2, "0")} · RECETA DE SERVICIO`;

    detalleTitulo.textContent = "COSTILLAS LACADAS CON COLA";
    detalleTexto.hidden = true;
    detalleAccion.hidden = true;
    detalleVolver.hidden = false;

    detalleMedio.replaceChildren();
    const imagen = document.createElement("img");
    imagen.src = receta.imagen;
    imagen.alt = receta.alt;
    detalleMedio.appendChild(imagen);
    detalleMedio.classList.add("con-medio");

    const introduccion = document.createElement("p");
    introduccion.textContent =
      "Una preparación informal de rosticería: cocción lenta y un glaseado final oscuro, dulce y ligeramente ácido.";

    const tituloIngredientes = document.createElement("h3");
    tituloIngredientes.textContent = "INGREDIENTES · 4 RACIONES";

    const ingredientes = document.createElement("ul");
    receta.ingredientes.forEach((ingrediente) => {
      const item = document.createElement("li");
      item.textContent = ingrediente;
      ingredientes.appendChild(item);
    });

    const tituloPreparacion = document.createElement("h3");
    tituloPreparacion.textContent = "PREPARACIÓN";

    const pasos = document.createElement("ol");
    receta.pasos.forEach((paso) => {
      const item = document.createElement("li");
      item.textContent = paso;
      pasos.appendChild(item);
    });

    const nota = document.createElement("p");
    nota.className = "cocina-receta__nota";
    nota.textContent =
      "La cola no deja un sabor reconocible a refresco: aporta color, dulzor y una capa caramelizada. La mostaza y el vinagre evitan que el resultado sea empalagoso.";

    detalleReceta.replaceChildren(
      introduccion,
      tituloIngredientes,
      ingredientes,
      tituloPreparacion,
      pasos,
      nota
    );
    detalleReceta.hidden = false;

    detalleVolver.onclick = () => punto.click();
  };
  const cerrarDetalle = () => {
    detalle.classList.remove("cocina-detalle-activo");
    document.body.classList.remove("cocina-detalle-abierto");
    detalleMedio.replaceChildren();
    detalleMedio.classList.remove("con-medio");
    intro.querySelectorAll(".cocina-punto").forEach((punto) => {
      punto.classList.remove("activo");
    });
  };

  const mostrarPuntos = (nivel) => {
    intro.querySelectorAll(".cocina-punto").forEach((punto) => punto.remove());

    const puntos = puntosPorCubierta.get(nivel) || [];
    puntos.forEach((contenido, indice) => {
      const punto = document.createElement("button");
      punto.type = "button";
      punto.className = "cocina-punto";
      punto.style.setProperty("--punto-x", `${contenido.x}%`);
      punto.style.setProperty("--punto-y", `${contenido.y}%`);
      punto.setAttribute("aria-label", contenido.titulo);
      punto.addEventListener("click", (evento) => {
        evento.stopPropagation();
        intro.querySelectorAll(".cocina-punto").forEach((otro) => {
          otro.classList.toggle("activo", otro === punto);
        });
        detalleReferencia.textContent = `CUBIERTA ${nivel} · PUNTO ${String(indice + 1).padStart(2, "0")}`;
        detalleTitulo.textContent = contenido.titulo;
        detalleTexto.textContent = contenido.texto;
        detalleTexto.hidden = false;
        detalleReceta.hidden = true;
        detalleReceta.replaceChildren();
        detalleAccion.hidden = true;
        detalleVolver.hidden = true;
        detalleMedio.replaceChildren();
        detalleMedio.classList.remove("con-medio");

        if (contenido.medio) {
          if (contenido.medio.tipo === "video") {
            const videoDetalle = document.createElement("video");
            videoDetalle.src = contenido.medio.src;
            videoDetalle.controls = true;
            videoDetalle.playsInline = true;
            videoDetalle.preload = "metadata";
            detalleMedio.appendChild(videoDetalle);
          }

          if (contenido.medio.tipo === "imagen") {
            const imagenDetalle = document.createElement("img");
            imagenDetalle.src = contenido.medio.src;
            imagenDetalle.alt = contenido.medio.alt || "";
            detalleMedio.appendChild(imagenDetalle);
          }

          detalleMedio.classList.add("con-medio");
        }
        if (contenido.receta) {
          detalleAccion.hidden = false;
          detalleAccion.onclick = () => {
            mostrarReceta(contenido.receta, nivel, indice + 1, punto);
          };
        }
        detalle.classList.add("cocina-detalle-activo");
        document.body.classList.add("cocina-detalle-abierto");
      });
      intro.appendChild(punto);
    });
  };

  detalleCerrar.addEventListener("click", cerrarDetalle);
  const modelosCubierta = Array.from(
    { length: 10 },
    (_, nivel) => `assets/img/cocina/cocina-modelo-${nivel}.png`
  );

  const cubiertas = [
    "Red logística común",
    "Sistemas comunes",
    "Recepción y preparación primaria",
    "Cocina caliente",
    "Preparación fría, panadería y especialidades",
    "Terminación y distribución",
    "Comedores A–B–C",
    "Comedores D–E–F",
    "Comedores G–H–I",
    "Comedores J–K · Alta densidad"
  ];

  const descripciones = [
    "Área aislada destinada a los sistemas comunes y servicios técnicos del módulo.",
    "La Cubierta 1 forma parte de la red radial que enlaza los 110 módulos de ALÉTHEIA. Sus corredores permiten el tránsito simultáneo de personas, vehículos eléctricos y suministros, con esclusas que pueden aislar cada unión ante una incidencia. En este módulo, los espacios entre pasillos alojan servicios logísticos de COCINA, pequeños almacenes y apoyo de mantenimiento.",
    "Aquí llega el alimento desde el módulo ALMACÉN 2, situado al sur. Lavado, descongelación controlada, limpieza, corte y preparación de verduras, carnes y pescado. Incluye pequeñas cámaras frigoríficas de trabajo, pero no almacenes para varias semanas.",
    "Grandes zonas de hornos, cocción, planchas y marmitas.",
    "Ensaladas, platos fríos, postres, panadería, repostería y preparaciones específicas.",
    "Montaje final, mantenimiento de temperatura y expedición hacia los comedores superiores. Actúa como interfaz entre producción y servicio.",
    "Comedores A, B y C. Capacidad conjunta de 3.000 plazas y operación habitual del módulo.",
    "Comedores D, E y F. Planta preparada para entrar en servicio cuando el crecimiento de ALÉTHEIA requiera ampliar la capacidad de restauración.",
    "Comedores G, H e I. Planta actualmente sin servicio, reservada para futuras fases de crecimiento del módulo.",
    "Comedores J y K en configuración de alta densidad. Capacidad máxima adicional de 6.000 plazas, normalmente en reserva."
  ];

  const selector = document.createElement("div");
  selector.className = "cocina-selector";
  croquis.parentNode.insertBefore(selector, croquis);
  selector.appendChild(croquis);

  // Indicador visual de la cubierta activa: se reubica por CSS según el formato.
  const indicadorCubierta = document.createElement("div");
  indicadorCubierta.className = "cocina-indicador-cubierta";
  const indicadorEtiqueta = document.createElement("span");
  indicadorEtiqueta.textContent = "CUBIERTA";
  const indicadorNumero = document.createElement("strong");
  indicadorNumero.textContent = "—";
  indicadorNumero.setAttribute("aria-live", "polite");
  indicadorCubierta.append(indicadorEtiqueta, indicadorNumero);
  selector.insertAdjacentElement("afterend", indicadorCubierta);

  const numero = document.createElement("span");
  numero.className = "cocina-info-numero";
  const nombre = document.createElement("strong");
  nombre.className = "cocina-info-nombre";
  const descripcion = document.createElement("p");
  descripcion.className = "cocina-info-descripcion";
  info.replaceChildren(numero, nombre, descripcion);

  let cubiertaFijada = null;
  let cubiertaEnPlanta = null;
  let cubiertaPendiente = null;
  let faseTransicion = "reposo";
  let interaccionActivada = false;

  // La animación dura 4 s. Entre estos dos tiempos permanece cenital.
  const comienzoPlano = 1.2;
  const pausaCenital = 2;
  const comienzoRegreso = 2.2;

  const actualizarFijada = () => {
    selector.querySelectorAll(".cocina-zona").forEach((zona) => {
      zona.classList.toggle(
        "fijada",
        Number(zona.dataset.nivel) === cubiertaFijada
      );
    });
  };

  const mostrarCubierta = (nivel) => {
    selector.querySelectorAll(".cocina-zona").forEach((zona) => {
      zona.classList.toggle("activa", Number(zona.dataset.nivel) === nivel);
    });
    numero.textContent = `CUBIERTA ${nivel}`;
    indicadorNumero.textContent = nivel;
    nombre.textContent = cubiertas[nivel];
    descripcion.textContent = descripciones[nivel];
    info.classList.add("cocina-info-activa");
    modelo.setAttribute("src", modelosCubierta[nivel]);
    intro.classList.add("modelo-resaltado");
  };

  const limpiarCubierta = () => {
    if (cubiertaFijada !== null) {
      mostrarCubierta(cubiertaFijada);
      return;
    }
    selector.querySelectorAll(".cocina-zona").forEach((zona) => {
      zona.classList.remove("activa");
    });
    indicadorNumero.textContent = "—";
    info.classList.remove("cocina-info-activa");
    intro.classList.remove("modelo-resaltado");
    modelo.setAttribute("src", modeloBase);
  };

  const entrarEnCubierta = (nivel) => {
    cubiertaEnPlanta = nivel;
    cubiertaFijada = nivel;
    cubiertaPendiente = null;
    faseTransicion = "entrada";
    actualizarFijada();
    mostrarCubierta(nivel);
    cerrarDetalle();
    mostrarPuntos(nivel);
    intro.dataset.cubierta = nivel;

    intro.classList.remove("vista-planta", "plano-visible", "modelo-resaltado");
    plano.removeAttribute("src");
    if (planosDisponibles.has(nivel)) {
      plano.src = `assets/img/cocina/cocinac${nivel}-plano.png`;
      plano.alt = `Plano funcional de la cubierta ${nivel}`;
    }
    intro.classList.add("transicion-cubierta");
    video.src = `assets/img/cocina/cocinac${nivel}.mp4`;
    video.load();
    video.play().catch(() => {
      faseTransicion = "planta";
      intro.classList.add("vista-planta");
      if (planosDisponibles.has(nivel)) {
        intro.classList.add("plano-visible");
      }
    });
  };

  const salirDeCubierta = (siguiente = null) => {
    if (cubiertaEnPlanta === null) {
      if (siguiente !== null && siguiente >= 1) {
        entrarEnCubierta(siguiente);
      }
      return;
    }

    cubiertaPendiente = siguiente;
    cerrarDetalle();
    intro.querySelectorAll(".cocina-punto").forEach((punto) => punto.remove());
    faseTransicion = "salida";
    intro.classList.remove("vista-planta", "plano-visible");
    if (video.currentTime < comienzoRegreso) {
      video.currentTime = comienzoRegreso;
    }
    video.play();
  };

  // Tras la primera entrada, el plano ya es el contexto de navegación.
  // Cambiar de cubierta sustituye plano y puntos sin repetir dos animaciones.
  const cambiarCubiertaEnPlano = (nivel) => {
    cubiertaEnPlanta = nivel;
    cubiertaFijada = nivel;
    cubiertaPendiente = null;
    faseTransicion = "planta";
    actualizarFijada();
    mostrarCubierta(nivel);
    cerrarDetalle();
    mostrarPuntos(nivel);
    intro.dataset.cubierta = nivel;

    plano.removeAttribute("src");
    if (planosDisponibles.has(nivel)) {
      plano.src = `assets/img/cocina/cocinac${nivel}-plano.png`;
      plano.alt = `Plano funcional de la cubierta ${nivel}`;
    }

    video.pause();
    intro.classList.add("transicion-cubierta", "vista-planta", "plano-visible");
  };

  const seleccionarCubierta = (nivel) => {
    // La cubierta 0 conserva el comportamiento informativo sencillo.
    if (nivel === 0) {
      if (cubiertaEnPlanta !== null) {
        salirDeCubierta(nivel);
      } else {
        cubiertaFijada = cubiertaFijada === nivel ? null : nivel;
        actualizarFijada();
        cubiertaFijada === null ? limpiarCubierta() : mostrarCubierta(nivel);
      }
      return;
    }

    if (faseTransicion === "salida") {
      cubiertaPendiente = nivel;
      return;
    }

    if (cubiertaEnPlanta === nivel) {
      salirDeCubierta();
    } else if (cubiertaEnPlanta !== null) {
      cambiarCubiertaEnPlano(nivel);
    } else {
      entrarEnCubierta(nivel);
    }
  };

  for (let nivel = 0; nivel <= 9; nivel += 1) {
    const zona = document.createElement("button");
    zona.type = "button";
    zona.className = "cocina-zona";
    zona.dataset.nivel = nivel;
    const desdeArriba = 9 - nivel;
    const centroSuperior = 12.5 + desdeArriba * 7.5;
    const centroInferior = centroSuperior + 7.5;
    const lateralSuperior = 16.015625 + desdeArriba * 6.796875;
    const lateralInferior = lateralSuperior + 6.796875;

    zona.style.clipPath = `polygon(
      23.046875% ${lateralSuperior}%,
      34.765625% ${centroSuperior}%,
      65.234375% ${centroSuperior}%,
      76.953125% ${lateralSuperior}%,
      76.953125% ${lateralInferior}%,
      65.234375% ${centroInferior}%,
      34.765625% ${centroInferior}%,
      23.046875% ${lateralInferior}%
    )`;
    zona.setAttribute("aria-label", `Cubierta ${nivel}: ${cubiertas[nivel]}`);
    zona.addEventListener("pointerenter", () => {
      if (faseTransicion === "reposo") mostrarCubierta(nivel);
    });
    zona.addEventListener("focus", () => {
      if (faseTransicion === "reposo") mostrarCubierta(nivel);
    });
    zona.addEventListener("pointerleave", limpiarCubierta);
    zona.addEventListener("blur", limpiarCubierta);
    zona.addEventListener("click", () => seleccionarCubierta(nivel));
    selector.appendChild(zona);
  }

  const activarInteraccion = () => {
    video.pause();
    interaccionActivada = true;
    layout.classList.add("interaccion-lista");
    modelosCubierta.forEach((ruta) => {
      const imagen = new Image();
      imagen.src = ruta;
    });
    planosDisponibles.forEach((nivel) => {
      const imagen = new Image();
      imagen.src = `assets/img/cocina/cocinac${nivel}-plano.png`;
    });
  };

  video.addEventListener("timeupdate", () => {
    if (
      faseTransicion === "entrada" &&
      video.currentTime >= comienzoPlano &&
      planosDisponibles.has(cubiertaEnPlanta)
    ) {
      intro.classList.add("plano-visible");
    }

    if (faseTransicion === "entrada" && video.currentTime >= pausaCenital) {
      video.pause();
      faseTransicion = "planta";
      intro.classList.add("vista-planta");
    }
  });

  video.addEventListener("ended", () => {
    if (!interaccionActivada) {
      activarInteraccion();
      return;
    }

    if (faseTransicion !== "salida") return;

    const siguiente = cubiertaPendiente;
    cubiertaEnPlanta = null;
    cubiertaPendiente = null;
    faseTransicion = "reposo";
    intro.classList.remove(
      "transicion-cubierta",
      "vista-planta",
      "plano-visible"
    );
    delete intro.dataset.cubierta;
    plano.removeAttribute("src");
    modelo.setAttribute("src", modeloBase);

    if (siguiente !== null && siguiente >= 1) {
      requestAnimationFrame(() => entrarEnCubierta(siguiente));
    } else if (siguiente !== null) {
      cubiertaFijada = siguiente;
      actualizarFijada();
      mostrarCubierta(siguiente);
    } else {
      cubiertaFijada = null;
      actualizarFijada();
      limpiarCubierta();
    }
  });

  video.play().catch(() => {
    intro.classList.add("intro-finalizada");
    activarInteraccion();
  });
});
