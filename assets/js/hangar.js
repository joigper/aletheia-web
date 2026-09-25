/* Crea el visor después de que model-viewer esté completamente registrado. */
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("hangar-model-container");
  if (!container) return;

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

  modelViewer.src = "assets/img/hangar/hangar-estructura.glb";
  container.replaceChildren(modelViewer);
});
