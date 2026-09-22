/* HOSPITAL · Directorio de tres niveles y ficha común, sin asignar cubiertas ni rutas. */
document.addEventListener("DOMContentLoaded", () => {
  const terminal = document.querySelector(".hospital-terminal");

  if (!terminal) return;

  const categorias = [...terminal.querySelectorAll(".hospital-categoria")];
  const estado = terminal.querySelector("#hospital-directorio-estado");
  let categoriaFijada = null;

  // Distribución funcional acordada para los cuatro módulos cardinales.
  const modulosPorCategoria = {
    "urgencias-cuidados-criticos": "norte",
    "cirugia": "norte",
    "diagnostico-laboratorios": "norte",
    "especialidades-medicas": "sur",
    "oncologia": "sur",
    "farmacia": "sur",
    "mujer-infancia-familia": "este",
    "rehabilitacion": "este",
    "salud-mental": "este",
    "investigacion-biomedica": "oeste",
    "docencia-formacion": "oeste",
    "servicios-hospitalarios": "oeste"
  };

  // Segundo nivel provisional: servicios, sin destinos físicos inventados.
  const serviciosPorCategoria = {
    "urgencias-cuidados-criticos": ["Urgencias", "Observación", "Cuidados intensivos", "Unidad coronaria"],
    "cirugia": ["Cirugía general", "Traumatología", "Neurocirugía", "Cirugía cardiovascular", "Anestesia y reanimación", "Quirófanos"],
    "diagnostico-laboratorios": ["Diagnóstico por imagen", "Laboratorio clínico", "Microbiología", "Anatomía patológica"],
    "especialidades-medicas": ["Cardiología", "Neurología", "Neumología", "Digestivo", "Endocrinología", "Nefrología", "Hematología", "Dermatología", "Odontología"],
    "oncologia": ["Oncología médica", "Radioterapia", "Hospital de día", "Cuidados paliativos"],
    "farmacia": ["Farmacia hospitalaria", "Dispensación", "Elaboración farmacéutica", "Control de calidad"],
    "mujer-infancia-familia": ["Ginecología", "Obstetricia", "Pediatría", "Neonatología", "Medicina familiar"],
    "rehabilitacion": ["Fisioterapia", "Terapia ocupacional", "Logopedia", "Rehabilitación cardiopulmonar"],
    "salud-mental": ["Psiquiatría", "Psicología clínica", "Atención en crisis", "Adicciones"],
    "investigacion-biomedica": ["Laboratorios de investigación", "Ensayos clínicos", "Biobanco", "Bioinformática"],
    "docencia-formacion": ["Aulas", "Simulación clínica", "Biblioteca y recursos docentes"],
    "servicios-hospitalarios": ["Admisión y orientación", "Esterilización", "Logística", "Mantenimiento"]
  };

  // Tercer nivel editorial y provisional: puntos de atención o áreas funcionales.
  // Las claves coinciden con el segundo nivel para detectar ramas incompletas.
  const unidadesPorCategoria = {
    "urgencias-cuidados-criticos": {
      "Urgencias": ["Recepción y triaje", "Atención general", "Atención pediátrica", "Sala de procedimientos", "Área de estabilización"],
      "Observación": ["Observación de adultos", "Observación pediátrica", "Área de corta estancia"],
      "Cuidados intensivos": ["UCI de adultos", "UCI pediátrica", "Cuidados intermedios", "Puesto de información a familiares"],
      "Unidad coronaria": ["Acceso a la unidad", "Control de enfermería", "Información a familiares"]
    },
    "cirugia": {
      "Cirugía general": ["Consultas", "Valoración preoperatoria", "Cirugía programada", "Seguimiento posoperatorio"],
      "Traumatología": ["Consultas", "Valoración de lesiones", "Cirugía ortopédica", "Revisión y seguimiento"],
      "Neurocirugía": ["Consultas", "Valoración preoperatoria", "Cirugía neurológica", "Seguimiento posoperatorio"],
      "Cirugía cardiovascular": ["Consultas", "Valoración preoperatoria", "Cirugía cardíaca", "Cirugía vascular", "Seguimiento posoperatorio"],
      "Anestesia y reanimación": ["Consulta preanestésica", "Anestesia", "Reanimación posquirúrgica", "Tratamiento del dolor"],
      "Quirófanos": ["Acceso a quirófanos", "Preparación quirúrgica", "Recuperación posanestésica", "Información a familiares"]
    },
    "diagnostico-laboratorios": {
      "Diagnóstico por imagen": ["Radiología convencional", "Ecografía", "Tomografía computarizada", "Resonancia magnética", "Mamografía"],
      "Laboratorio clínico": ["Extracciones", "Bioquímica", "Hematología analítica", "Recepción de muestras"],
      "Microbiología": ["Recepción de muestras", "Bacteriología", "Virología", "Micología y parasitología"],
      "Anatomía patológica": ["Recepción de muestras", "Histología", "Citología", "Biopsias intraoperatorias"]
    },
    "especialidades-medicas": {
      "Cardiología": ["Consultas", "Unidad coronaria", "Hemodinámica", "Electrofisiología", "Ecocardiografía", "Pruebas funcionales"],
      "Neurología": ["Consultas", "Unidad de ictus", "Neurofisiología", "Electroencefalografía", "Trastornos del movimiento"],
      "Neumología": ["Consultas", "Pruebas de función respiratoria", "Broncoscopia", "Trastornos del sueño", "Terapias respiratorias"],
      "Digestivo": ["Consultas", "Endoscopia digestiva", "Hepatología", "Enfermedad inflamatoria intestinal", "Pruebas funcionales digestivas"],
      "Endocrinología": ["Consultas", "Diabetes", "Nutrición clínica", "Trastornos tiroideos", "Educación terapéutica"],
      "Nefrología": ["Consultas", "Hemodiálisis", "Diálisis peritoneal", "Enfermedad renal crónica", "Trasplante renal"],
      "Hematología": ["Consultas", "Coagulación", "Transfusión", "Tratamientos hematológicos", "Trasplante hematopoyético"],
      "Dermatología": ["Consultas", "Dermatoscopia", "Cirugía dermatológica", "Fototerapia", "Pruebas cutáneas"],
      "Odontología": ["Consultas", "Prevención e higiene", "Odontología restauradora", "Cirugía oral", "Urgencias odontológicas"]
    },
    "oncologia": {
      "Oncología médica": ["Consultas", "Valoración inicial", "Tratamiento sistémico", "Seguimiento", "Consejo genético"],
      "Radioterapia": ["Consultas", "Planificación", "Tratamiento radioterápico", "Seguimiento"],
      "Hospital de día": ["Admisión", "Tratamientos ambulatorios", "Observación", "Información al paciente"],
      "Cuidados paliativos": ["Consultas", "Control de síntomas", "Apoyo a familias", "Coordinación asistencial"]
    },
    "farmacia": {
      "Farmacia hospitalaria": ["Atención farmacéutica", "Validación de tratamientos", "Información sobre medicación"],
      "Dispensación": ["Pacientes externos", "Unidades clínicas", "Medicamentos especiales"],
      "Elaboración farmacéutica": ["Preparaciones estériles", "Preparaciones no estériles", "Nutrición parenteral"],
      "Control de calidad": ["Verificación de preparados", "Trazabilidad", "Seguridad de medicamentos"]
    },
    "mujer-infancia-familia": {
      "Ginecología": ["Consultas", "Ecografía ginecológica", "Patología cervical", "Salud reproductiva"],
      "Obstetricia": ["Consultas prenatales", "Ecografía obstétrica", "Área de partos", "Puerperio"],
      "Pediatría": ["Consultas", "Pediatría general", "Especialidades pediátricas", "Hospitalización pediátrica"],
      "Neonatología": ["Cuidados neonatales", "Cuidados intermedios", "Seguimiento neonatal", "Información a familias"],
      "Medicina familiar": ["Consultas", "Prevención y promoción de la salud", "Seguimiento de crónicos", "Coordinación de cuidados"]
    },
    "rehabilitacion": {
      "Fisioterapia": ["Valoración funcional", "Terapia individual", "Ejercicio terapéutico", "Fisioterapia neurológica"],
      "Terapia ocupacional": ["Valoración", "Actividades de la vida diaria", "Adaptaciones y ayudas técnicas", "Rehabilitación de la mano"],
      "Logopedia": ["Valoración del lenguaje", "Terapia del habla", "Deglución", "Comunicación alternativa"],
      "Rehabilitación cardiopulmonar": ["Valoración inicial", "Entrenamiento supervisado", "Educación terapéutica", "Seguimiento"]
    },
    "salud-mental": {
      "Psiquiatría": ["Consultas", "Hospital de día", "Interconsulta", "Seguimiento"],
      "Psicología clínica": ["Evaluación", "Psicoterapia individual", "Terapia grupal", "Apoyo a familias"],
      "Atención en crisis": ["Valoración urgente", "Intervención breve", "Enlace con urgencias", "Continuidad asistencial"],
      "Adicciones": ["Valoración", "Tratamiento ambulatorio", "Prevención de recaídas", "Apoyo familiar"]
    },
    "investigacion-biomedica": {
      "Laboratorios de investigación": ["Biología molecular", "Cultivos celulares", "Proteómica", "Microscopía"],
      "Ensayos clínicos": ["Coordinación de estudios", "Visitas de participantes", "Gestión de muestras", "Monitorización"],
      "Biobanco": ["Recepción de muestras", "Procesamiento", "Conservación", "Solicitud de muestras"],
      "Bioinformática": ["Análisis de datos", "Genómica", "Apoyo a proyectos", "Infraestructura de cálculo"]
    },
    "docencia-formacion": {
      "Aulas": ["Aulas de formación", "Seminarios", "Aula informática", "Sala de conferencias"],
      "Simulación clínica": ["Simulación de pacientes", "Entrenamiento de procedimientos", "Sala de control", "Evaluación y análisis"],
      "Biblioteca y recursos docentes": ["Consulta", "Recursos digitales", "Estudio individual", "Salas de trabajo"]
    },
    "servicios-hospitalarios": {
      "Admisión y orientación": ["Información general", "Admisión de consultas", "Admisión de hospitalización", "Atención al paciente"],
      "Esterilización": ["Recepción de material", "Preparación", "Esterilización", "Distribución"],
      "Logística": ["Recepción de suministros", "Almacén", "Distribución interna", "Gestión de residuos"],
      "Mantenimiento": ["Avisos e incidencias", "Instalaciones", "Equipos técnicos", "Seguridad operativa"]
    }
  };

  categorias.forEach((boton) => {
    boton.dataset.modulo = modulosPorCategoria[boton.dataset.categoria] ?? "";
  });

  // Reagrupa el menú por módulo: rojo, azul, verde y marrón.
  const lista = terminal.querySelector(".hospital-directorio__lista");
  const ordenModulos = ["sur", "norte", "este", "oeste"];

  if (lista) {
    ordenModulos.forEach((modulo) => {
      const grupo = document.createElement("section");
      grupo.className = `hospital-grupo hospital-grupo--${modulo}`;
      grupo.setAttribute("aria-label", `Módulo ${modulo}`);

      const titulo = document.createElement("p");
      titulo.className = "hospital-grupo__titulo";
      titulo.textContent = `MÓDULO ${modulo.toUpperCase()}`;
      grupo.append(titulo);

      categorias
        .filter((boton) => boton.dataset.modulo === modulo)
        .forEach((boton) => grupo.append(boton));

      lista.append(grupo);
    });
  }

  // Traza de monitor en el espacio libre sobre los prismas. La transición CSS
  // se invierte al volver, incluso si se interrumpe a mitad del recorrido.
  const monitor = document.createElement("div");
  monitor.className = "hospital-alzado__monitor";
  monitor.setAttribute("aria-hidden", "true");
  const onda = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  onda.setAttribute("viewBox", "0 0 600 44");
  onda.setAttribute("preserveAspectRatio", "none");
  onda.classList.add("hospital-alzado__onda");
  const traza = document.createElementNS("http://www.w3.org/2000/svg", "path");
  traza.setAttribute("d", "M0 23 H115 L123 19 L130 23 H168 L176 31 L185 7 L195 37 L204 23 H255 L263 18 L271 23 H358 L366 28 L376 13 L386 32 L396 23 H600");
  traza.setAttribute("pathLength", "1000");
  onda.append(traza);
  const rotulo = document.createElement("div");
  rotulo.className = "hospital-alzado__rotulo";
  const nombreMonitor = document.createElement("strong");
  const datoMonitor = document.createElement("span");
  rotulo.append(nombreMonitor, datoMonitor);
  monitor.append(onda, rotulo);
  terminal.querySelector(".hospital-alzado__cabecera")?.after(monitor);

  const datosMonitor = {
    norte: "URGENCIAS · CIRUGÍA · DIAGNÓSTICO",
    sur: "ESPECIALIDADES · ONCOLOGÍA · FARMACIA",
    este: "FAMILIA · REHABILITACIÓN · SALUD MENTAL",
    oeste: "INVESTIGACIÓN · DOCENCIA · SERVICIOS"
  };

  // Los tres niveles y la ficha comparten el panel derecho; solo el visible es interactivo.
  const directorio = terminal.querySelector(".hospital-directorio");
  const videoFicha = terminal.querySelector(".hospital-alzado__video");
  let vistaGeneral;
  let vistaServicios;
  let tituloServicios;
  let moduloServicios;
  let listaServicios;
  let estadoServicios;
  let vistaUnidades;
  let listaUnidades;
  let estadoUnidades;
  let tituloUnidades;
  let rutaUnidades;
  let volverServicios;
  let vistaFicha;
  let volverUnidades;
  let tituloFicha;

  if (directorio && lista && estado) {
    const cabeceraGeneral = directorio.querySelector(".hospital-directorio__cabecera");
    const tituloGeneral = cabeceraGeneral.querySelector("h2");
    tituloGeneral.tabIndex = -1;
    const vistas = document.createElement("div");
    vistas.className = "hospital-directorio__vistas";

    vistaGeneral = document.createElement("div");
    vistaGeneral.className = "hospital-directorio__vista hospital-directorio__vista--general";
    vistaGeneral.append(cabeceraGeneral, lista, estado);

    vistaServicios = document.createElement("div");
    vistaServicios.className = "hospital-directorio__vista hospital-directorio__vista--servicios";
    vistaServicios.setAttribute("aria-hidden", "true");
    vistaServicios.inert = true;

    const volver = document.createElement("button");
    volver.type = "button";
    volver.className = "hospital-directorio__volver";
    volver.textContent = "‹ Volver al directorio";

    const cabeceraServicios = document.createElement("header");
    cabeceraServicios.className = "hospital-directorio__cabecera";
    moduloServicios = document.createElement("p");
    moduloServicios.className = "hospital-directorio__codigo hospital-directorio__modulo";
    tituloServicios = document.createElement("h2");
    tituloServicios.tabIndex = -1;
    const indicacion = document.createElement("p");
    indicacion.textContent = "Seleccione el servicio que desea encontrar.";
    cabeceraServicios.append(moduloServicios, tituloServicios, indicacion);

    listaServicios = document.createElement("nav");
    listaServicios.className = "hospital-servicios";
    listaServicios.setAttribute("aria-label", "Servicios de la categoría seleccionada");
    estadoServicios = document.createElement("p");
    estadoServicios.className = "hospital-directorio__estado";
    estadoServicios.textContent = "DIRECTORIO DE SERVICIOS · NIVEL 02";
    vistaServicios.append(volver, cabeceraServicios, listaServicios, estadoServicios);

    vistaUnidades = document.createElement("div");
    vistaUnidades.className = "hospital-directorio__vista hospital-directorio__vista--unidades";
    vistaUnidades.setAttribute("aria-hidden", "true");
    vistaUnidades.inert = true;
    volverServicios = document.createElement("button");
    volverServicios.type = "button";
    volverServicios.className = "hospital-directorio__volver";
    volverServicios.textContent = "‹ Volver a servicios";
    const cabeceraUnidades = document.createElement("header");
    cabeceraUnidades.className = "hospital-directorio__cabecera";
    rutaUnidades = document.createElement("p");
    rutaUnidades.className = "hospital-directorio__codigo hospital-directorio__modulo";
    tituloUnidades = document.createElement("h2");
    tituloUnidades.tabIndex = -1;
    const indicacionUnidades = document.createElement("p");
    indicacionUnidades.textContent = "Seleccione la unidad que desea encontrar.";
    cabeceraUnidades.append(rutaUnidades, tituloUnidades, indicacionUnidades);
    listaUnidades = document.createElement("nav");
    listaUnidades.className = "hospital-servicios";
    listaUnidades.setAttribute("aria-label", "Unidades del servicio seleccionado");
    estadoUnidades = document.createElement("p");
    estadoUnidades.className = "hospital-directorio__estado";
    estadoUnidades.textContent = "DIRECTORIO DE UNIDADES · NIVEL 03";
    vistaUnidades.append(volverServicios, cabeceraUnidades, listaUnidades, estadoUnidades);

    // Una ficha común cierra cualquier rama: no se inventan despachos ni responsables.
    vistaFicha = document.createElement("div");
    vistaFicha.className = "hospital-directorio__vista hospital-directorio__vista--ficha";
    vistaFicha.setAttribute("aria-hidden", "true");
    vistaFicha.inert = true;
    volverUnidades = document.createElement("button");
    volverUnidades.type = "button";
    volverUnidades.className = "hospital-directorio__volver";
    volverUnidades.textContent = "‹ Volver a unidades";
    const cabeceraFicha = document.createElement("header");
    cabeceraFicha.className = "hospital-directorio__cabecera";
    const codigoFicha = document.createElement("p");
    codigoFicha.className = "hospital-directorio__codigo";
    codigoFicha.textContent = "HOSPITAL · RED SANITARIA";
    tituloFicha = document.createElement("h2");
    tituloFicha.tabIndex = -1;
    tituloFicha.textContent = "Capacidad y atención";
    const entradillaFicha = document.createElement("p");
    entradillaFicha.textContent = "El directorio muestra las capacidades del complejo, no un despacho atendido de forma permanente para cada entrada.";
    cabeceraFicha.append(codigoFicha, tituloFicha, entradillaFicha);
    const contenidoFicha = document.createElement("div");
    contenidoFicha.className = "hospital-ficha";
    contenidoFicha.innerHTML = `
      <div class="hospital-ficha__cifras">
        <p><strong>1.200–1.500</strong><span>profesionales de la red sanitaria</span></p>
        <p><strong>≈ 260.000 m²</strong><span>superficie bruta del complejo</span></p>
      </div>
      <p class="hospital-ficha__nota">Cuatro módulos × diez cubiertas × ≈ 6.500 m². La cubierta 9, compartida por los cuatro módulos, reserva ≈ 26.000 m² para viviendas. Los ≈ 234.000 m² restantes no están asignados aquí a servicios concretos ni implican ocupación plena.</p>
      <p><strong>Atención flexible.</strong> Urgencias mantiene servicio permanente. Medicina familiar y Odontología ofrecen atención regular; gran parte de las demás consultas se abre con cita o según la demanda. Algunas áreas pueden permanecer cerradas.</p>
      <p><strong>Profesionales compartidos.</strong> La investigación, la docencia, la farmacia y la atención clínica comparten personal. Su disponibilidad asistencial se organiza por turnos y competencias; una urgencia se canaliza primero mediante triaje.</p>
    `;
    vistaFicha.append(volverUnidades, cabeceraFicha, contenidoFicha);

    vistas.append(vistaGeneral, vistaServicios, vistaUnidades, vistaFicha);
    directorio.append(vistas);

    volverUnidades.addEventListener("click", () => {
      directorio.classList.remove("is-ficha");
      terminal.classList.remove("is-ficha");
      videoFicha?.pause();
      if (videoFicha) videoFicha.currentTime = 0;
      directorio.classList.add("is-tercer-nivel");
      vistaFicha.inert = true;
      vistaFicha.setAttribute("aria-hidden", "true");
      vistaUnidades.inert = false;
      vistaUnidades.removeAttribute("aria-hidden");
      tituloUnidades.focus({ preventScroll: true });
    });

    volverServicios.addEventListener("click", () => {
      directorio.classList.remove("is-tercer-nivel");
      directorio.classList.add("is-segundo-nivel");
      vistaUnidades.inert = true;
      vistaUnidades.setAttribute("aria-hidden", "true");
      vistaServicios.inert = false;
      vistaServicios.removeAttribute("aria-hidden");
      tituloServicios.focus({ preventScroll: true });
    });

    volver.addEventListener("click", () => {
      directorio.classList.remove("is-segundo-nivel");
      monitor.classList.remove("is-visible");
      vistaGeneral.inert = false;
      vistaGeneral.removeAttribute("aria-hidden");
      vistaServicios.inert = true;
      vistaServicios.setAttribute("aria-hidden", "true");
      categoriaFijada = null;
      categoriaPrevia = null;
      mostrarCategoria();
      tituloGeneral.focus({ preventScroll: true });
    });
  }

  const abrirUnidades = (categoria, servicio) => {
    if (!directorio || !vistaUnidades || !vistaServicios) return;
    const nombreCategoria = categoria.querySelector("span")?.textContent.trim() ?? categoria.textContent.trim();
    const modulo = categoria.dataset.modulo;
    const unidades = unidadesPorCategoria[categoria.dataset.categoria]?.[servicio] ?? [];
    vistaUnidades.dataset.modulo = modulo;
    volverServicios.textContent = `‹ Volver a ${nombreCategoria.toLowerCase()}`;
    rutaUnidades.textContent = `HOSPITAL › MÓDULO ${modulo.toUpperCase()} › ${nombreCategoria.toUpperCase()}`;
    tituloUnidades.textContent = servicio;
    listaUnidades.setAttribute("aria-label", `Unidades de ${servicio}`);
    estadoUnidades.textContent = "DIRECTORIO DE UNIDADES · NIVEL 03";
    listaUnidades.replaceChildren();
    unidades.forEach((unidad) => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "hospital-servicio";
      boton.setAttribute("aria-pressed", "false");
      boton.textContent = unidad;
      boton.addEventListener("click", () => {
        listaUnidades.querySelectorAll(".hospital-servicio").forEach((opcion) => {
          const activa = opcion === boton;
          opcion.classList.toggle("is-activa", activa);
          opcion.setAttribute("aria-pressed", activa ? "true" : "false");
        });
        estadoUnidades.textContent = `${unidad.toUpperCase()} · FICHA GENERAL`;
        directorio.classList.remove("is-tercer-nivel");
        directorio.classList.add("is-ficha");
        terminal.classList.add("is-ficha");
        vistaUnidades.inert = true;
        vistaUnidades.setAttribute("aria-hidden", "true");
        vistaFicha.dataset.modulo = modulo;
        vistaFicha.inert = false;
        vistaFicha.removeAttribute("aria-hidden");
        tituloFicha.focus({ preventScroll: true });
      });
      listaUnidades.append(boton);
    });
    directorio.classList.remove("is-segundo-nivel");
    directorio.classList.add("is-tercer-nivel");
    vistaServicios.inert = true;
    vistaServicios.setAttribute("aria-hidden", "true");
    vistaUnidades.inert = false;
    vistaUnidades.removeAttribute("aria-hidden");
    tituloUnidades.focus({ preventScroll: true });
  };

  const abrirServicios = (categoria) => {
    if (!directorio || !vistaServicios || !vistaGeneral) return;

    const modulo = categoria.dataset.modulo;
    const nombre = categoria.querySelector("span")?.textContent.trim() ?? categoria.textContent.trim();
    monitor.dataset.modulo = modulo;
    nombreMonitor.textContent = `MÓDULO ${modulo.toUpperCase()}`;
    datoMonitor.textContent = datosMonitor[modulo] ?? "";
    monitor.classList.add("is-visible");
    moduloServicios.textContent = `HOSPITAL › MÓDULO ${modulo.toUpperCase()}`;
    tituloServicios.textContent = nombre;
    estadoServicios.textContent = "DIRECTORIO DE SERVICIOS · NIVEL 02";
    vistaServicios.dataset.modulo = modulo;
    listaServicios.replaceChildren();

    (serviciosPorCategoria[categoria.dataset.categoria] ?? []).forEach((servicio) => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "hospital-servicio";
      boton.setAttribute("aria-pressed", "false");
      const texto = document.createElement("span");
      texto.textContent = servicio;
      const flecha = document.createElement("span");
      flecha.textContent = "›";
      flecha.setAttribute("aria-hidden", "true");
      boton.append(texto, flecha);
      boton.addEventListener("click", () => {
        listaServicios.querySelectorAll(".hospital-servicio").forEach((opcion) => {
          const activa = opcion === boton;
          opcion.classList.toggle("is-activa", activa);
          opcion.setAttribute("aria-pressed", activa ? "true" : "false");
        });
        estadoServicios.textContent = `${servicio.toUpperCase()} · UNIDADES`;
        abrirUnidades(categoria, servicio);
      });
      listaServicios.append(boton);
    });

    directorio.classList.add("is-segundo-nivel");
    vistaGeneral.inert = true;
    vistaGeneral.setAttribute("aria-hidden", "true");
    vistaServicios.inert = false;
    vistaServicios.removeAttribute("aria-hidden");
    tituloServicios.focus({ preventScroll: true });
  };

  // Una capa por prisma: la imagen general solo se muestra mientras cargan.
  // Así el prisma animado nunca se dibuja sobre una segunda copia de sí mismo.
  const imagenBase = terminal.querySelector("img.hospital-alzado__grafico");
  if (imagenBase && !imagenBase.closest(".hospital-alzado__escena")) {
    const escena = document.createElement("div");
    escena.className = "hospital-alzado__escena";
    imagenBase.before(escena);
    escena.append(imagenBase);

    const cargas = ordenModulos.map((modulo) => {
      const capa = document.createElement("img");
      capa.className = "hospital-alzado__grafico hospital-alzado__capa";
      capa.dataset.modulo = modulo;
      capa.src = imagenBase.src.replace(/hospital-alzado\.png(?:\?.*)?$/i, `hospital-modulo-${modulo}.png`);
      capa.alt = "";
      capa.setAttribute("aria-hidden", "true");
      capa.draggable = false;
      escena.append(capa);
      return capa.decode();
    });

    Promise.all(cargas).then(() => {
      escena.classList.add("is-ready");
    }).catch(() => {
      // Si falta alguna imagen, se conserva el alzado general legible.
      escena.querySelectorAll(".hospital-alzado__capa").forEach((capa) => capa.remove());
    });
  }

  let categoriaPrevia = null;

  const mostrarCategoria = () => {
    const boton = categoriaPrevia ?? categoriaFijada;
    categorias.forEach((categoria) => {
      categoria.classList.toggle("is-activa", categoria === boton);
      categoria.setAttribute("aria-pressed", categoria === categoriaFijada ? "true" : "false");
    });

    const modulo = boton?.dataset.modulo ?? "";
    if (modulo) {
      terminal.dataset.moduloActivo = modulo;
      terminal.dataset.vista = categoriaPrevia ? "previa" : "ampliada";
    } else {
      delete terminal.dataset.moduloActivo;
      delete terminal.dataset.vista;
    }

    if (estado) {
      estado.textContent = boton
        ? `MÓDULO ${modulo.toUpperCase()} · ${boton.textContent.replace("›", "").trim().toUpperCase()}`
        : "DIRECTORIO GENERAL · NIVEL 01";
    }
  };

  categorias.forEach((boton) => {
    boton.addEventListener("mouseenter", () => {
      categoriaPrevia = boton;
      mostrarCategoria();
    });
    boton.addEventListener("focus", () => {
      categoriaPrevia = boton;
      mostrarCategoria();
    });
    boton.addEventListener("blur", () => {
      if (categoriaPrevia === boton) {
        categoriaPrevia = null;
        mostrarCategoria();
      }
    });

    boton.addEventListener("click", () => {
      categoriaFijada = boton;
      categoriaPrevia = null;
      mostrarCategoria();

      abrirServicios(boton);

      // Punto de extensión para futuras fichas y rutas concretas.
      terminal.dispatchEvent(new CustomEvent("hospital:categoria", {
        bubbles: true,
        detail: {
          id: categoriaFijada?.dataset.categoria ?? null,
          modulo: categoriaFijada?.dataset.modulo ?? null,
          etiqueta: categoriaFijada?.textContent.replace("›", "").trim() ?? null
        }
      }));
    });
  });

  lista?.addEventListener("mouseleave", () => {
    categoriaPrevia = null;
    mostrarCategoria();
  });
});