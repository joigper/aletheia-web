(function (global) {
  "use strict";

  /*
   * Presentador de las transiciones.
   *
   * Esta versión no analiza el audio ni genera movimiento labial. Durante la
   * transición mantiene en bucle el vídeo silencioso de Prometeo parpadeando.
   * La presentación inicial se controla desde aletheia-tv.js y no pasa por aquí.
   */
  const overlay = document.getElementById("challenge-overlay");
  const video = document.getElementById("transition-presenter-base");
  if (!overlay || !video) return;
  if (global.__aletheiaTransitionPresenterLoaded) return;
  global.__aletheiaTransitionPresenterLoaded = true;

  video.src = "assets/img/ocio/Prometeo04B.mp4";
  video.muted = true;
  video.loop = true;
  video.autoplay = false;
  video.playsInline = true;
  video.preload = global.AletheiaTVSmart ? "metadata" : "auto";
  video.poster = "assets/img/ocio/prometeo-visemas-base.webp";
  video.hidden = false;
  video.removeAttribute("hidden");
  video.setAttribute("aria-hidden", "true");

  function playWhenVisible() {
    if (overlay.hidden) {
      video.pause();
      return;
    }

    // En Smart TV se prioriza una imagen estable. Evita reservar memoria para
    // un vídeo en bucle durante cada transición y sirve de alternativa segura
    // en navegadores que no reproducen MP4 correctamente.
    if (global.AletheiaTVSmart) {
      video.pause();
      return;
    }

    const playback = video.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(() => {});
    }
  }

  new MutationObserver(playWhenVisible).observe(overlay, {
    attributes: true,
    attributeFilter: ["hidden"]
  });

  document.addEventListener("pointerdown", playWhenVisible, { once: true });
  playWhenVisible();
})(window);
