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
/* Puntos de interés del plano residencial HOME */
document.addEventListener("DOMContentLoaded", () => {
  const planStage = document.querySelector(".home-plan-stage");
  const map = document.querySelector(".home-map-image");
  const summaryCard = document.getElementById("home-info-card");
  const liftCard = document.getElementById("home-lift-card");

  if (!planStage || !map || !summaryCard || !liftCard) return;

  const poiLayer = document.createElement("div");
  poiLayer.className = "home-poi-layer";
  planStage.append(poiLayer);

  const points = [
    {
      type: "summary",
      x: 50,
      y: 50,
      label: "Resumen de la cubierta residencial",
      title: "Datos de cubierta"
    },
    {
      type: "lift",
      x: 72.4,
      y: 53.4,
      label: "Ascensor multipropósito A-3000",
      title: "Ascensor A-3000"
    }
  ];

  function showCard(card) {
    summaryCard.hidden = card !== "summary";
    liftCard.hidden = card !== "lift";
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
    point.setAttribute("aria-label", data.label);
    point.title = data.title;

    point.addEventListener("click", () => {
      showCard(data.type);
    });

    poiLayer.append(point);
  });

  function updatePointsVisibility() {
    const residentialPlan = map.src.includes("homec3a7-plano.svg");
    poiLayer.hidden = !residentialPlan;

    if (residentialPlan) {
      syncPoints();
    }
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
