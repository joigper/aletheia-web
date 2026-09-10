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

  // Se añadirán aquí las demás cubiertas cuando tengan su plano terminado.
  const planosDisponibles = new Set([2]);

  const puntosCubierta2 = [
    {
  x: 50,
  y: 84,
  titulo: "Recepción y control",
  texto: "Los suministros procedentes de ALMACÉN 2 llegan a esta zona para su identificación, inspección y clasificación antes de incorporarse al circuito de preparación. También se reciben aquí las raciones preparadas que finalmente no han sido servidas y continúan siendo aptas para el consumo. Tras su control y envasado, se derivan a los establecimientos de la zona OCIO para su distribución, evitando el acceso de público a las áreas de producción alimentaria.",
  medio: {
    tipo: "video",
    src: "assets/img/cocina/cocinac2p01.mp4"
  }
},
    {
      x: 38,
      y: 69,
      titulo: "Conservación y descongelación",
      texto: "Las cámaras de trabajo mantienen únicamente las reservas necesarias para la producción inmediata. La descongelación se realiza de forma controlada y separada del resto de operaciones.",
      medio: null
    },
    {
      x: 35,
      y: 31,
      titulo: "Preparación vegetal",
      texto: "Área destinada a la selección, lavado, desinfección, pelado y corte de verduras y otros productos vegetales.",
      medio: null
    },
    {
      x: 66,
      y: 36,
      titulo: "Carnes y pescado",
      texto: "Los productos cárnicos y el pescado se procesan en sectores diferenciados para mantener unas condiciones higiénicas independientes y evitar contaminaciones cruzadas.",
      medio: null
    },
    {
      x: 50,
      y: 50,
      titulo: "Circulación vertical y retornos",
      texto: "El núcleo central conecta la cubierta con las plantas superiores mediante montacargas. Los residuos, recipientes y retornos siguen un recorrido separado del flujo de alimentos preparados.",
      medio: null
    }
  ];

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
  const detalleCerrar = document.createElement("button");
  detalleCerrar.type = "button";
  detalleCerrar.className = "cocina-detalle-cerrar";
  detalleCerrar.textContent = "CERRAR";
  detalle.append(
    detalleMedio,
    detalleReferencia,
    detalleTitulo,
    detalleTexto,
    detalleCerrar
  );
  intro.parentElement.appendChild(detalle);

  const cerrarDetalle = () => {
    detalle.classList.remove("cocina-detalle-activo");
    detalleMedio.replaceChildren();
    detalleMedio.classList.remove("con-medio");
    intro.querySelectorAll(".cocina-punto").forEach((punto) => {
      punto.classList.remove("activo");
    });
  };

  puntosCubierta2.forEach((contenido, indice) => {
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
      detalleReferencia.textContent = `CUBIERTA 2 · PUNTO ${String(indice + 1).padStart(2, "0")}`;
      detalleTitulo.textContent = contenido.titulo;
      detalleTexto.textContent = contenido.texto;
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
    detalleMedio.classList.add("con-medio");
  }
}

detalle.classList.add("cocina-detalle-activo");
    });
    intro.appendChild(punto);
  });

  detalleCerrar.addEventListener("click", cerrarDetalle);
  const modelosCubierta = Array.from(
    { length: 10 },
    (_, nivel) => `assets/img/cocina/cocina-modelo-${nivel}.png`
  );

  const cubiertas = [
    "Sistemas comunes",
    "Sistemas comunes",
    "Recepción y preparación primaria",
    "Cocina caliente",
    "Preparación fría, panadería y especialidades",
    "Terminación y distribución",
    "Comedores A–B–C",
    "Comedores D–E–F",
    "Comedores G–H–I",
    "Comedores J–K–L · Alta densidad"
  ];

  const descripciones = [
    "Área aislada destinada a los sistemas comunes y servicios técnicos del módulo.",
    "Sistemas comunes de apoyo a la producción, distribución y funcionamiento general de COCINA.",
    "Aquí llega el alimento desde el módulo ALMACÉN 2, situado al sur. Lavado, descongelación controlada, limpieza, corte y preparación de verduras, carnes y pescado. Incluye pequeñas cámaras frigoríficas de trabajo, pero no almacenes para varias semanas.",
    "Grandes zonas de hornos, cocción, planchas y marmitas. Probablemente sea la cubierta visualmente más espectacular para mostrar en vídeo.",
    "Ensaladas, platos fríos, postres, panadería, repostería y preparaciones específicas.",
    "Montaje final, mantenimiento de temperatura y expedición hacia los comedores superiores. Actúa como interfaz entre producción y servicio.",
    "Comedores A, B y C. Capacidad conjunta de 3.000 plazas y operación habitual del módulo.",
    "Comedores D, E y F. Otras 3.000 plazas mantenidas como capacidad de reserva.",
    "Comedores G, H e I. Otras 3.000 plazas disponibles como capacidad de reserva.",
    "Comedores J, K y L en configuración de alta densidad. Capacidad máxima adicional de 6.000 plazas, normalmente en reserva."
  ];

  const selector = document.createElement("div");
  selector.className = "cocina-selector";
  croquis.parentNode.insertBefore(selector, croquis);
  selector.appendChild(croquis);

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
      if (siguiente !== null && siguiente >= 2) {
        entrarEnCubierta(siguiente);
      }
      return;
    }

    cubiertaPendiente = siguiente;
    cerrarDetalle();
    faseTransicion = "salida";
    intro.classList.remove("vista-planta", "plano-visible");
    if (video.currentTime < comienzoRegreso) {
      video.currentTime = comienzoRegreso;
    }
    video.play();
  };

  const seleccionarCubierta = (nivel) => {
    // Las cubiertas 0 y 1 conservan el comportamiento informativo sencillo.
    if (nivel < 2) {
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
      salirDeCubierta(nivel);
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

    if (siguiente !== null && siguiente >= 2) {
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
