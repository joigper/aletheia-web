/* Selector de cubiertas del módulo HOME.
   C3–C7 comparten el plano residencial estándar; C8 muestra el colectivo. */
document.addEventListener("DOMContentLoaded", () => {
  const poster = document.querySelector(".home-floor-selector");
  const map = document.querySelector(".home-map-image");

  if (!poster || !map) return;

  const selector = document.createElement("div");
  selector.className = "home-selector";
  poster.before(selector);
  selector.append(poster);

  const planStage = document.createElement("div");
  planStage.className = "home-plan-stage";
  map.before(planStage);
  planStage.append(map);

  const deckNumber = document.createElement("div");
  deckNumber.className = "home-deck-number";
  deckNumber.setAttribute("aria-live", "polite");
  deckNumber.innerHTML = '<span>CUBIERTA</span><strong>3</strong>';
  planStage.prepend(deckNumber);

  const plans = {
    residential: {
      src: "assets/img/home/homec3a7-plano.svg",
      alt: "Plano residencial de las cubiertas 3 a 7 del módulo HOME"
    },
    collective: {
      src: "assets/img/home/homec8-plano.svg",
      alt: "Plano de alojamiento colectivo de la cubierta 8 del módulo HOME"
    }
  };

  const residentialFloors = [
    { floor: "C7", polygon: "23.05% 22.81%, 34.77% 20%, 65.23% 20%, 76.95% 22.81%, 76.95% 29.61%, 65.23% 27.5%, 34.77% 27.5%, 23.05% 29.61%" },
    { floor: "C6", polygon: "23.05% 29.61%, 34.77% 27.5%, 65.23% 27.5%, 76.95% 29.61%, 76.95% 36.41%, 65.23% 35%, 34.77% 35%, 23.05% 36.41%" },
    { floor: "C5", polygon: "23.05% 36.41%, 34.77% 35%, 65.23% 35%, 76.95% 36.41%, 76.95% 43.2%, 65.23% 42.5%, 34.77% 42.5%, 23.05% 43.2%" },
    { floor: "C4", polygon: "23.05% 43.2%, 34.77% 42.5%, 65.23% 42.5%, 76.95% 43.2%, 76.95% 50%, 65.23% 50%, 34.77% 50%, 23.05% 50%" },
    { floor: "C3", polygon: "23.05% 50%, 34.77% 50%, 65.23% 50%, 76.95% 50%, 76.95% 56.8%, 65.23% 57.5%, 34.77% 57.5%, 23.05% 56.8%" }
  ];

  const showPlan = (plan, selectedClass, floor) => {
    map.src = plan.src;
    map.alt = plan.alt;
    deckNumber.innerHTML = `<span>CUBIERTA</span><strong>${floor}</strong>`;
    map.hidden = false;
    map.classList.add("is-visible");
    selector.classList.remove("is-residential-selected", "is-collective-selected");
    selector.classList.add(selectedClass);
  };

  residentialFloors.forEach(({ floor, polygon }) => {
    const zone = document.createElement("button");
    zone.type = "button";
    zone.className = "home-floor-zone";
    zone.style.clipPath = `polygon(${polygon})`;
    zone.setAttribute("aria-label", `Cubierta ${floor}: plano residencial`);
    zone.title = `Cubierta ${floor} · Viviendas`;
    zone.addEventListener("click", () => showPlan(plans.residential, "is-residential-selected", floor.replace("C", "")));
    selector.append(zone);
  });

  const collectiveZone = document.createElement("button");
  collectiveZone.type = "button";
  collectiveZone.className = "home-floor-zone home-floor-zone--collective";
  collectiveZone.style.clipPath = "polygon(23.05% 16.02%, 34.77% 12.5%, 65.23% 12.5%, 76.95% 16.02%, 76.95% 22.81%, 65.23% 20%, 34.77% 20%, 23.05% 22.81%)";
  collectiveZone.setAttribute("aria-label", "Cubierta C8: alojamiento colectivo");
  collectiveZone.title = "Cubierta C8 · Alojamiento colectivo";
  collectiveZone.addEventListener("click", () => showPlan(plans.collective, "is-collective-selected", "8"));
  selector.append(collectiveZone);

  // El plano residencial es la vista inicial de HOME.
  showPlan(plans.residential, "is-residential-selected", "3");
});
/* Puntos de interés de los planos del módulo HOME. */
/* Puntos de interés de los planos del módulo HOME. */
document.addEventListener("DOMContentLoaded", () => {
  const planStage = document.querySelector(".home-plan-stage");
  const map = document.querySelector(".home-map-image");

  const cards = {
    summary: document.getElementById("home-info-card"),
    lift: document.getElementById("home-lift-card"),
    cabin: document.getElementById("home-cabin-card"),
    technical: document.getElementById("home-technical-card"),
    collectiveOverview: document.getElementById("home-c8-overview-card"),
    collectiveCabin: document.getElementById("home-c8-cabin-card"),
    collectiveShowers: document.getElementById("home-c8-showers-card"),
    collectiveCommon: document.getElementById("home-c8-common-card"),
    expanded: document.getElementById("home-c8-expanded-card"),
    lockers: document.getElementById("home-c8-lockers-card")
    };

  if (!planStage || !map || Object.values(cards).some((card) => !card)) return;

  const poiLayer = document.createElement("div");
  poiLayer.className = "home-poi-layer";
  planStage.append(poiLayer);

  let activeCard = "summary";

  const points = [
    {
  type: "summary",
  plan: "residential",
  x: 50, y: 50,
  label: "Resumen de la cubierta residencial",
  title: "Datos de cubierta"
},
{
  type: "lift",
  plan: "residential",
  x: 50, y: 8,
  label: "Núcleo de circulación vertical",
  title: "Núcleo vertical"
},
{
  type: "cabin",
  plan: "residential",
  x: 43, y: 27,
  label: "Unidad residencial base · sistema panelizable",
  title: "Unidad residencial base"
},
{
  type: "technical",
  plan: "residential",
  x: 10, y: 50,
  label: "Pleno técnico intercubiertas",
  title: "Pleno técnico · 2,3 m"
},
    {
      type: "collective-overview",
      card: "collectiveOverview",
      plan: "collective",
      x: 50, y: 50,
      label: "Alojamiento colectivo de contingencia",
      title: "700 cabinas · 1.400 plazas"
    },
    {
      type: "collective-cabin",
      card: "collectiveCabin",
      plan: "collective",
      x: 68, y: 34,
      label: "Cabina estándar de alta densidad",
      title: "Cabina estándar"
    },
    {
      type: "collective-showers",
      card: "collectiveShowers",
      plan: "collective",
      x: 40, y: 17,
      label: "Duchas y vestuarios",
      title: "Duchas y vestuarios"
    },
    {
      type: "collective-common",
      card: "collectiveCommon",
      plan: "collective",
      x: 60, y: 83,
      label: "Sala común",
      title: "Sala común"
    },      
{
  type: "collective-expanded",
  card: "expanded",
  plan: "collective",
  x: 45, y: 34,
  label: "Cabina ampliada y adaptable",
  title: "Cabina ampliada"
},
{
  type: "collective-lockers",
  card: "lockers",
  plan: "collective",
  x: 72, y: 20,
  label: "Taquillas y lavandería",
  title: "Taquillas y lavandería"
}
  ];

  const currentPlan = () =>
    map.src.includes("homec8-plano.svg") ? "collective" : "residential";

  const activeCardPlan = () =>
  ["collectiveOverview", "collectiveCabin", "collectiveShowers",
   "collectiveCommon", "expanded", "lockers"].includes(activeCard)
    ? "collective"
    : "residential";

  function showCard(cardName) {
    Object.entries(cards).forEach(([name, card]) => {
      card.hidden = name !== cardName;
    });

    activeCard = cardName;
  }

  function syncPoints() {
    const stageRect = planStage.getBoundingClientRect();
    const mapRect = map.getBoundingClientRect();

    poiLayer.querySelectorAll(".home-poi").forEach((point) => {
      const x = Number(point.dataset.x);
      const y = Number(point.dataset.y);

      point.style.left =
        `${mapRect.left - stageRect.left + (mapRect.width * x) / 100}px`;

      point.style.top =
        `${mapRect.top - stageRect.top + (mapRect.height * y) / 100}px`;
    });
  }

  points.forEach((data) => {
    const point = document.createElement("button");

    point.type = "button";
    point.className = `home-poi home-poi--${data.type}`;
    point.dataset.x = data.x;
    point.dataset.y = data.y;
    point.dataset.plan = data.plan;
    point.setAttribute("aria-label", data.label);
    point.title = data.title;

    point.addEventListener("click", () => {
      showCard(data.card || data.type);
    });

    poiLayer.append(point);
  });

  function updatePointsVisibility() {
    const plan = currentPlan();

    poiLayer.querySelectorAll(".home-poi").forEach((point) => {
      point.hidden = point.dataset.plan !== plan;
    });

    if (activeCardPlan() !== plan) {
      showCard(plan === "collective" ? "collectiveOverview" : "summary");
    }

    syncPoints();
  }

  map.addEventListener("load", syncPoints);
  window.addEventListener("resize", syncPoints);

  new MutationObserver(updatePointsVisibility).observe(map, {
    attributes: true,
    attributeFilter: ["src"]
  });

  showCard("summary");
  updatePointsVisibility();
});
/* Visor inmersivo de la estructura del módulo HOME. */
document.addEventListener("DOMContentLoaded", () => {
  const openButton = document.getElementById("home-open-structure");
  const viewer = document.getElementById("home-structure-viewer");
  const closeButton = document.getElementById("home-close-structure");

  if (!openButton || !viewer || !closeButton) return;

  const closeViewer = () => {
    viewer.hidden = true;
    document.body.classList.remove("home-structure-open");
    openButton.focus();
  };

  openButton.addEventListener("click", () => {
    viewer.hidden = false;
    document.body.classList.add("home-structure-open");
    closeButton.focus();
  });

  closeButton.addEventListener("click", closeViewer);

  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) closeViewer();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !viewer.hidden) closeViewer();
  });
});
/* Visor inmersivo de la estructura del módulo HOME. */
document.addEventListener("DOMContentLoaded", () => {
  const openButton = document.getElementById("home-open-structure");
  if (!openButton) return;

  let viewer = document.getElementById("home-structure-viewer");

  if (!viewer) {
    viewer = document.createElement("section");
    viewer.id = "home-structure-viewer";
    viewer.className = "home-structure-viewer";
    viewer.hidden = true;
    viewer.setAttribute("role", "dialog");
    viewer.setAttribute("aria-modal", "true");
    viewer.setAttribute("aria-label", "Estructura 3D del módulo HOME");

    viewer.innerHTML = `
      <div class="home-structure-viewer__panel">
        <button id="home-close-structure"
                class="home-structure-viewer__close"
                type="button">CERRAR</button>

        <div class="home-structure-viewer__title">
          <p>INFRAESTRUCTURA · MODELO INTERACTIVO</p>
          <h2>ESTRUCTURA DEL MÓDULO HOME</h2>
        </div>

        <model-viewer
          src="assets/img/home/home-estructura.glb"
          alt="Modelo estructural tridimensional del módulo HOME"
          loading="lazy"
          camera-controls
          touch-action="pan-y"
          auto-rotate
          auto-rotate-delay="1400"
          rotation-per-second="10deg"
          shadow-intensity="1"
          exposure="1.1">
          <p>Tu navegador no puede mostrar el modelo 3D.</p>
        </model-viewer>

        <p class="home-structure-viewer__hint">
          Arrastra para girar · Pellizca o usa la rueda para acercar
        </p>
      </div>`;

    document.body.append(viewer);
  }

  if (!document.querySelector('script[src*="@google/model-viewer"]')) {
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    document.head.append(script);
  }

  openButton.innerHTML = "<span>EXPLORAR</span><strong>ESTRUCTURA 3D</strong>";
  openButton.type = "button";

  const closeButton = viewer.querySelector("#home-close-structure");

  const closeViewer = () => {
    viewer.hidden = true;
    document.body.classList.remove("home-structure-open");
    openButton.focus();
  };

  openButton.addEventListener("click", () => {
    viewer.hidden = false;
    document.body.classList.add("home-structure-open");
    closeButton.focus();
  });

  closeButton.addEventListener("click", closeViewer);

  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) closeViewer();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !viewer.hidden) closeViewer();
  });
});