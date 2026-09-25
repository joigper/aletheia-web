/* Crea el visor después de que model-viewer esté completamente registrado. */
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("hangar-model-container");
  const playButton = document.getElementById("hangar-play-cycle");
  const status = document.getElementById("hangar-cycle-status");
  if (!container || !playButton || !status) return;

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
    if (seconds < 20) return "DESCENSO A CUBIERTA 3";
    if (seconds < 26) return "TRASLADO SAGH A ESTACIONAMIENTO";
    return "CICLO COMPLETADO";
  };

  modelViewer.addEventListener("load", () => {
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

  modelViewer.addEventListener("timeupdate", () => {
    if (!modelViewer.paused) status.textContent = stageAt(modelViewer.currentTime);
  });

  modelViewer.addEventListener("finished", () => {
    status.textContent = "CICLO COMPLETADO";
    playButton.textContent = "REPETIR CICLO";
  });

  playButton.addEventListener("click", () => {
    modelViewer.pause();
    modelViewer.currentTime = 0;
    modelViewer.play({ repetitions: 1 });
    playButton.textContent = "REINICIAR CICLO";
    status.textContent = stageAt(0);
  });

  modelViewer.src = "assets/img/hangar/hangar-estructura.glb";
  container.replaceChildren(modelViewer);
});
