(function (global) {
  "use strict";

  const frame = document.getElementById("transition-presenter-media");
  const overlay = document.getElementById("challenge-overlay");
  const canvas = document.getElementById("transition-presenter-canvas");
  const base = document.getElementById("transition-presenter-base");
  if (!frame || !overlay || !canvas || !base) return;
  if (typeof PresentadorVisemas !== "function" || typeof textoAVisemas !== "function" || !global.BIBLIOTECA_BOCAS) return;

  const speech = Object.freeze({
    "primer-panel": "Comenzamos con el primer panel.",
    "ultima-ronda": "Llegamos a la última ronda.",
    "normal-explicacion": "Panel normal. Gira la ruleta, elige consonantes y resuelve el panel.",
    "normal-breve": "Vamos con un panel normal.",
    "panel-preparado": "El panel está preparado.",
    "categoria-explicacion": "En esta ronda puedes elegir la categoría del panel.",
    "categoria-elige": "Elige una de las dos categorías.",
    "bonus-presentacion": "Llega una pregunta de bonificación.",
    "bonus-explicacion": "Responde correctamente y gana cien créditos adicionales.",
    "bonus-breve": "Responde y gana cien créditos adicionales.",
    "crono-presentacion": "Comienza el panel contrarreloj.",
    "crono-explicacion": "Sin ruleta. Cada jugador elige una letra antes de que termine el tiempo.",
    "crono-breve": "Panel contrarreloj.",
    "crono-inicio": "El tiempo empieza ahora.",
    "velocidad-presentacion": "Atención al panel de velocidad.",
    "velocidad-explicacion": "Las letras aparecerán una a una. Detén el panel y resuelve antes que tus rivales.",
    "velocidad-breve": "Panel de velocidad.",
    "velocidad-inicio": "Comenzamos.",
    "final-presentacion": "Ha llegado la ruleta final.",
    "final-explicacion": "Elige tus letras y resuelve el último panel.",
    "final-letras": "Selecciona tres consonantes y una vocal."
  });

  let presenter = null;
  let ready = false;
  let currentAudio = null;
  let currentVoiceDetail = null;

  base.muted = true;
  base.loop = true;
  base.playsInline = true;

  function phraseFor(intent) {
    if (speech[intent]) return speech[intent];
    return String(intent || "").replace(/^letra:/, "La ").replace(/[-_]+/g, " ");
  }

  function scaledCues(text, duration) {
    const generated = textoAVisemas(text);
    const naturalDuration = Math.max(0.1, generated.duracion || 0.1);
    const targetDuration = Number.isFinite(duration) && duration > 0 ? duration : naturalDuration;
    const scale = targetDuration / naturalDuration;
    return generated.cues.map(cue => ({
      ...cue,
      start: cue.start * scale,
      end: cue.end * scale
    }));
  }

  function animateVoice(detail) {
    if (overlay.hidden || !detail?.audio) return;
    currentVoiceDetail = detail;
    currentAudio = detail.audio;
    if (!ready) return;
    const start = () => {
      if (!ready || overlay.hidden || currentAudio !== detail.audio) return;
      presenter.reproducir(
        scaledCues(phraseFor(detail.intent), detail.audio.duration),
        () => detail.audio.currentTime,
        { autoFin: false }
      );
      frame.classList.add("is-speaking");
    };
    if (Number.isFinite(detail.audio.duration) && detail.audio.duration > 0) start();
    else detail.audio.addEventListener("loadedmetadata", start, { once: true });
  }

  function stopSpeaking() {
    currentVoiceDetail = null;
    currentAudio = null;
    frame.classList.remove("is-speaking");
    presenter?.detener();
  }

  function playBaseVideo() {
    if (!ready || overlay.hidden) return;
    const attempt = base.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => {});
    }
  }

  function syncBasePlayback() {
    if (overlay.hidden) base.pause();
    else playBaseVideo();
  }

  async function initialize() {
    try {
      if (base.readyState < 2) await new Promise((resolve, reject) => {
        base.addEventListener("loadeddata", resolve, { once: true });
        base.addEventListener("error", reject, { once: true });
      });
      presenter = new PresentadorVisemas(canvas, base, {
        biblioteca: {
          datos: global.BIBLIOTECA_BOCAS,
          imagen: "assets/img/ocio/prometeo-biblioteca.webp?v=20261010-1"
        },
        refAncho: 1024,
        encaje: { escala: 0.8330, dx: -66.12, dy: 0.20 },
        balanceo: false,
        expresividad: 0.48,
        fundido: 62,
        fundidoBiblioteca: 44,
        velocidadBoca: 0.020
      });
      await presenter.cargar();
      canvas.hidden = false;
      frame.classList.add("is-viseme-ready");
      ready = true;
      syncBasePlayback();
      if (currentVoiceDetail && !currentAudio?.ended) animateVoice(currentVoiceDetail);
    } catch (error) {
      console.warn("Prometeo continuará en modo estático:", error);
      canvas.hidden = true;
      frame.classList.remove("is-viseme-ready", "is-speaking");
    }
  }

  global.addEventListener("aletheia-voice-start", event => animateVoice(event.detail));
  global.addEventListener("aletheia-voice-idle", stopSpeaking);
  new MutationObserver(syncBasePlayback).observe(overlay, {
    attributes: true,
    attributeFilter: ["hidden"]
  });
  document.addEventListener("pointerdown", playBaseVideo, { once: true });
  initialize();
})(window);
