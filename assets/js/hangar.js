/* Crea el visor por JavaScript para que Bootstrap Studio no elimine la etiqueta. */
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("hangar-model-container");
  if (!container) return;

  if (!document.querySelector('script[src*="@google/model-viewer"]')) {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    document.head.append(script);
  }

  const modelViewer = document.createElement("model-viewer");
  modelViewer.setAttribute("src", "assets/img/hangar/hangar-estructura.glb");
  modelViewer.setAttribute("alt", "Modelo estructural tridimensional del módulo HANGAR");
  modelViewer.setAttribute("loading", "eager");
  modelViewer.setAttribute("camera-controls", "");
  modelViewer.setAttribute("touch-action", "pan-y");
  modelViewer.setAttribute("auto-rotate", "");
  modelViewer.setAttribute("auto-rotate-delay", "1400");
  modelViewer.setAttribute("rotation-per-second", "10deg");
  modelViewer.setAttribute("shadow-intensity", "1");
  modelViewer.setAttribute("exposure", "1.1");
  modelViewer.innerHTML = "<p>Tu navegador no puede mostrar el modelo 3D.</p>";

  container.replaceChildren(modelViewer);
});
