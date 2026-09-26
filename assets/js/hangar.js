/* Crea el visor después de que model-viewer esté completamente registrado. */
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("hangar-model-container");
  const playButton = document.getElementById("hangar-play-cycle");
  const status = document.getElementById("hangar-cycle-status");
  const cyclePanel = document.querySelector(".hangar-cycle");
  const title = document.getElementById("hangar-structure-title");
  const selectorButtons = document.querySelectorAll("[data-hangar-variant]");
  if (!container || !playButton || !status || !cyclePanel || !title) return;

  if (!customElements.get("model-viewer")) {
    let script = document.querySelector('script[src*="@google/model-viewer"]');

    if (!script) {
      script = document.createElement("script");
      script.type = "module";
      script.src = "https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js";
      document.head.append(script);
    }

    try {
      await customElements.whenDefined("model-viewer");
    } catch (error) {
      container.textContent = "No se ha podido iniciar el visor 3D.";
      console.error("No se pudo registrar model-viewer:", error);
      return;
    }
  }

  const modelViewer = document.createElement("model-viewer");
  modelViewer.setAttribute("alt", "Modelo estructural tridimensional del módulo HANGAR");
  modelViewer.setAttribute("loading", "eager");
  modelViewer.setAttribute("camera-controls", "");
  modelViewer.setAttribute("touch-action", "pan-y");
  modelViewer.setAttribute("auto-rotate", "");
  modelViewer.setAttribute("auto-rotate-delay", "1400");
  modelViewer.setAttribute("rotation-per-second", "10deg");
  modelViewer.setAttribute("shadow-intensity", "1");
  modelViewer.setAttribute("exposure", "1.1");

  modelViewer.addEventListener("error", (event) => {
    console.error("No se pudo cargar el GLB del hangar:", event.detail);
  });

  const stageAt = (seconds) => {
    if (seconds < 2) return "APERTURA DE COMPUERTAS EXTERIORES";
    if (seconds < 6) return "ENTRADA EN LA ESCLUSA";
    if (seconds < 8) return "AISLAMIENTO DE LA ESCLUSA";
    if (seconds < 10) return "APERTURA DE COMPUERTAS INTERIORES";
    if (seconds < 14) return "TRANSFERENCIA AL ASCENSOR CENTRAL";
    if (seconds < 16) return "CIERRE DEL SECTOR DE RECEPCIÓN";
    if (seconds < 18) return "DESCENSO DEL DISCO DE MANIOBRA";
    if (seconds < 22) return "GIRO CONTROLADO DE 180°";
    if (seconds < 24) return "LIBERACIÓN Y RETIRADA DEL DISCO";
    if (seconds < 28) return "DESCENSO A CUBIERTA 3";
    if (seconds < 34) return "TRASLADO SAGH A ESTACIONAMIENTO";
    return "CICLO COMPLETADO";
  };

  let statusFrame = null;
  let cycleRunning = false;
  let currentVariant = "standard";

  const updateCycleStatus = () => {
    status.textContent = stageAt(modelViewer.currentTime || 0);
    if (cycleRunning) {
      statusFrame = requestAnimationFrame(updateCycleStatus);
    }
  };

  modelViewer.addEventListener("load", () => {
    if (currentVariant !== "standard") return;

    const animation = modelViewer.availableAnimations.find(
      (name) => name === "CICLO_ENTRADA_ALMACENAMIENTO"
    );

    if (!animation) {
      status.textContent = "ANIMACIÓN NO DISPONIBLE";
      return;
    }

    modelViewer.animationName = animation;
    playButton.disabled = false;
    status.textContent = "SISTEMA PREPARADO";
  });

  modelViewer.addEventListener("finished", () => {
    if (statusFrame) cancelAnimationFrame(statusFrame);
    statusFrame = null;
    cycleRunning = false;
    status.textContent = "CICLO COMPLETADO";
    playButton.textContent = "REPETIR CICLO";
  });

  playButton.addEventListener("click", () => {
    modelViewer.pause();
    modelViewer.currentTime = 0;
    modelViewer.play({ repetitions: 1 });
    playButton.textContent = "REINICIAR CICLO";
    if (statusFrame) cancelAnimationFrame(statusFrame);
    cycleRunning = true;
    updateCycleStatus();
  });

  container.replaceChildren(modelViewer);

  const variants = {
    standard: {
      src: "assets/img/hangar/hangar-estructura.glb",
      title: "ESTRUCTURA DEL MÓDULO HANGAR",
      alt: "Modelo estructural tridimensional del hangar estándar"
    },
    heavy: {
      src: "assets/img/hangar/hangar-pesado-1-1.glb",
      title: "HANGAR PESADO 1-1 · ARCTURUS",
      alt: "Modelo estructural tridimensional del hangar pesado 1-1 con ARCTURUS"
    }
  };

  const selectVariant = (variantName) => {
    const variant = variants[variantName];
    if (!variant || variantName === currentVariant && modelViewer.src) return;

    currentVariant = variantName;
    cycleRunning = false;
    if (statusFrame) cancelAnimationFrame(statusFrame);
    statusFrame = null;
    modelViewer.pause();
    modelViewer.removeAttribute("animation-name");
    modelViewer.setAttribute("alt", variant.alt);
    title.textContent = variant.title;

    const isStandard = variantName === "standard";
    cyclePanel.hidden = !isStandard;
    playButton.disabled = true;
    playButton.textContent = "CICLO DE ENTRADA Y ALMACENAMIENTO";
    status.textContent = isStandard ? "CARGANDO MODELO" : "";

    selectorButtons.forEach((button) => {
      const active = button.dataset.hangarVariant === variantName;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    modelViewer.src = variant.src;
  };

  selectorButtons.forEach((button) => {
    button.addEventListener("click", () => selectVariant(button.dataset.hangarVariant));
  });

  currentVariant = "";
  selectVariant("standard");
});
