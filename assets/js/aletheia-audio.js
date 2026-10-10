(function (global) {
  "use strict";

  if (!global.document || !global.document.getElementById("aletheia-tv-app")) return;

  const basePath = "assets/img/ocio/audio/";
  const effectsPath = basePath;
  const musicFile = "maksymmalko-roblox-minecraft-fortnite-video-game-music-564544.mp3";
  const library = Object.freeze({
    "saludo-prometeo": ["saludo.mp3", "v4-bienvenida-01.mp3", "v4-bienvenida-02.mp3"],
    bienvenida: ["v4-bienvenida-01.mp3", "v4-bienvenida-02.mp3", "bienvenida.mp3", "bienvenida-01.mp3", "bienvenida-02.mp3"],
    "comienza-partida": ["v4-todos-listos-01.mp3", "v4-preparados-01.mp3", "comienza-partida.mp3", "comienza-partida-01.mp3", "comienza-partida-02.mp3", "comienza-partida-03.mp3"],
    "comienza-ronda": ["comienza-ronda.mp3", "comienza-ronda-01.mp3", "comienza-ronda-02.mp3", "comienza-ronda-03.mp3"],
    "ultima-ronda": ["v4-ultima-ronda-01.mp3", "v4-ultima-ronda-02.mp3", "v4-ultimo-panel-01.mp3", "ultima-ronda.mp3", "ultima-ronda-01.mp3", "ultima-ronda-02.mp3", "ultima-ronda-03.mp3"],
    "panel-preparado": ["v4-panel-preparado-01.mp3", "panel-preparado.mp3", "panel-preparado-01.mp3", "panel-preparado-02.mp3"],
    "gira-ruleta": ["v4-gira-ruleta-01.mp3", "v4-gira-ruleta-02.mp3", "v4-gira-ruleta-03.mp3", "gira-ruleta.mp3", "gira-ruleta-01.mp3", "gira-ruleta-02.mp3", "gira-ruleta-03.mp3"],
    "elige-consonante": ["v4-elige-consonante-01.mp3", "v4-elige-consonante-02.mp3", "v4-elige-consonante-03.mp3", "elige-consonante.mp3", "elige-consonante-01.mp3", "elige-consonante-02.mp3", "elige-consonante-03.mp3"],
    "compra-vocal-disponible": ["v4-vocal-disponible-01.mp3", "v4-vocal-disponible-02.mp3", "puedes-comprar-vocal.mp3", "compra-vocal-disponible-01.mp3", "compra-vocal-disponible-02.mp3", "compra-vocal-disponible-03.mp3"],
    "resolver-disponible": ["v4-intenta-resolver-01.mp3", "intenta-resolver.mp3", "resolver-disponible-01.mp3", "resolver-disponible-02.mp3", "resolver-disponible-03.mp3"],
    "sin-coincidencias": ["v4-sin-coincidencias-01.mp3", "v4-sin-coincidencias-02.mp3", "ninguna-coincidencia.mp3", "sin-coincidencias-01.mp3", "sin-coincidencias-02.mp3", "sin-coincidencias-03.mp3"],
    "letra-repetida": ["v4-letra-repetida-01.mp3", "v4-letra-no-disponible-01.mp3", "letra-repetida.mp3", "letra-repetida-01.mp3", "letra-repetida-02.mp3"],
    "ultima-letra": ["v4-ultima-letra-01.mp3", "ultima-letra.mp3", "ultima-letra-01.mp3", "ultima-letra-02.mp3"],
    "sin-consonantes": ["v4-sin-consonantes-01.mp3", "v4-sin-consonantes-ni-saldo-01.mp3", "sin-consonantes.mp3", "sin-consonantes-01.mp3", "sin-consonantes-02.mp3"],
    "sin-vocales": ["sin-vocales.mp3", "sin-vocales-01.mp3", "sin-vocales-02.mp3"],
    quiebra: ["v4-quiebra-01.mp3", "v4-quiebra-02.mp3", "quiebra.mp3", "quiebra-01.mp3", "quiebra-02.mp3", "quiebra-03.mp3", "quiebra-04.mp3"],
    "pierde-turno": ["v4-pierde-turno-01.mp3", "v4-pierde-turno-02.mp3", "pierde-turno.mp3", "pierde-turno-01.mp3", "pierde-turno-02.mp3", "pierde-turno-03.mp3"],
    premio: ["v4-premio-consonante-01.mp3", "v4-premio-consonante-02.mp3", "premio.mp3", "premio-01.mp3", "premio-02.mp3", "premio-03.mp3"],
    "saldo-insuficiente": ["v4-saldo-insuficiente-01.mp3", "saldo-insuficiente.mp3", "saldo-insuficiente-01.mp3", "saldo-insuficiente-02.mp3", "saldo-insuficiente-03.mp3"],
    "vocal-comprada": ["v4-vocal-comprada-01.mp3", "vocal-comprada.mp3", "vocal-comprada-01.mp3", "vocal-comprada-02.mp3", "vocal-comprada-03.mp3"],
    "cambio-turno": ["turno-siguiente.mp3", "cambio-turno-01.mp3", "cambio-turno-02.mp3", "cambio-turno-03.mp3"],
    "solucion-correcta": ["v4-solucion-correcta-01.mp3", "v4-solucion-correcta-02.mp3", "v4-ronda-correcta-01.mp3", "solucion-correcta.mp3", "solucion-correcta-01.mp3", "solucion-correcta-02.mp3", "solucion-correcta-03.mp3", "solucion-correcta-04.mp3"],
    "solucion-incorrecta": ["v4-solucion-incorrecta-01.mp3", "v4-solucion-incorrecta-02.mp3", "solucion-incorrecta.mp3", "solucion-incorrecta-01.mp3", "solucion-incorrecta-02.mp3", "solucion-incorrecta-03.mp3", "solucion-incorrecta-04.mp3"],
    "tiempo-agotado": ["v4-tiempo-agotado-01.mp3", "v4-tiempo-agotado-02.mp3", "tiempo-agotado.mp3", "tiempo-agotado-01.mp3", "tiempo-agotado-02.mp3", "tiempo-agotado-03.mp3"],
    "ronda-ganada": ["v4-ronda-ganada-01.mp3", "v4-ronda-ganada-02.mp3", "ronda-ganada.mp3", "ronda-ganada-01.mp3", "ronda-ganada-02.mp3", "ronda-ganada-03.mp3", "ronda-ganada-04.mp3"],
    "panel-sin-resolver": ["nadie-resuelve.mp3", "panel-sin-resolver-01.mp3", "panel-sin-resolver-02.mp3"],
    "partida-pausada": ["v4-pausa-01.mp3", "v4-pausa-02.mp3", "partida-pausada.mp3", "partida-pausada-01.mp3", "partida-pausada-02.mp3", "partida-pausada-03.mp3"],
    "partida-reanudada": ["v4-reanudar-01.mp3", "v4-reanudar-02.mp3", "partida-reanudada.mp3", "partida-reanudada-01.mp3", "partida-reanudada-02.mp3", "partida-reanudada-03.mp3"],
    "siguiente-panel": ["v4-siguiente-ronda-01.mp3", "v4-siguiente-ronda-02.mp3", "siguiente-ronda.mp3", "siguiente-panel-01.mp3", "siguiente-panel-02.mp3", "siguiente-panel-03.mp3"],
    "fin-partida": ["v4-fin-partida-01.mp3", "fin-partida.mp3", "fin-partida-01.mp3", "fin-partida-02.mp3", "fin-partida-03.mp3"],
    ganador: ["v4-ganador-01.mp3", "tenemos-ganador.mp3", "ganador-01.mp3", "ganador-02.mp3", "ganador-03.mp3", "ganador-04.mp3"],
    empate: ["v4-empate-01.mp3", "empate.mp3", "empate-01.mp3", "empate-02.mp3", "empate-03.mp3"],
    enhorabuena: ["v4-enhorabuena-01.mp3", "enhorabuena.mp3", "enhorabuena-01.mp3", "enhorabuena-02.mp3", "enhorabuena-03.mp3"],
    despedida: ["v4-despedida-01.mp3", "gracias-participar.mp3", "despedida-01.mp3", "despedida-02.mp3", "despedida-03.mp3"],
    "normal-explicacion": ["v4-normal-explicacion-01.mp3"],
    "normal-breve": ["v4-normal-breve-01.mp3", "v4-normal-inicio-01.mp3"],
    "primer-panel": ["v4-primer-panel-01.mp3"],
    "categoria-explicacion": ["v4-categoria-explicacion-01.mp3", "v4-categoria-explicacion-02.mp3"],
    "categoria-elige": ["v4-categoria-elige-01.mp3"],
    "categoria-confirmada": ["v4-categoria-confirmada-01.mp3", "v4-categoria-confirmada-02.mp3"],
    "crono-presentacion": ["v4-crono-presentacion-01.mp3"],
    "crono-explicacion": ["v4-crono-explicacion-01.mp3"],
    "crono-breve": ["v4-crono-breve-01.mp3"],
    "crono-inicio": ["v4-crono-inicio-01.mp3"],
    "crono-poco-tiempo": ["v4-crono-poco-tiempo-01.mp3"],
    "crono-diez-segundos": ["v4-crono-diez-segundos-01.mp3"],
    "crono-ganado": ["v4-crono-ganado-01.mp3"],
    "crono-agotado": ["v4-crono-agotado-01.mp3"],
    "velocidad-presentacion": ["v4-velocidad-presentacion-01.mp3"],
    "velocidad-explicacion": ["v4-velocidad-explicacion-01.mp3"],
    "velocidad-breve": ["v4-velocidad-breve-01.mp3"],
    "velocidad-inicio": ["v4-velocidad-inicio-01.mp3"],
    "velocidad-nueva-letra": ["v4-velocidad-primera-letra-01.mp3", "v4-velocidad-nueva-letra-01.mp3"],
    "velocidad-resolver": ["v4-velocidad-resolver-01.mp3"],
    "velocidad-detenido": ["v4-velocidad-detenido-01.mp3"],
    "velocidad-escribe": ["v4-velocidad-escribe-01.mp3"],
    "velocidad-correcta": ["v4-velocidad-correcta-01.mp3"],
    "velocidad-error": ["v4-velocidad-error-01.mp3"],
    "bonus-presentacion": ["v4-bonus-presentacion-01.mp3"],
    "bonus-explicacion": ["v4-bonus-explicacion-01.mp3"],
    "bonus-breve": ["v4-bonus-breve-01.mp3"],
    "bonus-confirmada": ["v4-bonus-confirmada-01.mp3"],
    "bonus-correcta": ["v4-bonus-correcta-01.mp3"],
    "bonus-incorrecta": ["v4-bonus-incorrecta-01.mp3"],
    "final-presentacion": ["v4-final-presentacion-01.mp3"],
    "final-clasificacion": ["v4-final-clasificacion-01.mp3"],
    "final-explicacion": ["v4-final-explicacion-01.mp3"],
    "final-letras": ["v4-final-letras-01.mp3"],
    "final-letras-elegidas": ["v4-final-letras-elegidas-01.mp3"],
    "final-resolver": ["v4-final-resolver-01.mp3"],
    "final-correcta": ["v4-final-correcta-01.mp3"],
    "final-incorrecta": ["v4-final-incorrecta-01.mp3"],
    "comodin-sale": ["v4-comodin-sale-01.mp3"],
    "comodin-conseguido": ["v4-comodin-conseguido-01.mp3"],
    "vocal-sin-coincidencias": ["v4-vocal-sin-coincidencias-01.mp3"],
    "mando-desconectado": ["v4-mando-desconectado-01.mp3"],
    "mando-reconectado": ["v4-mando-reconectado-01.mp3"],
    "panel-casi-resuelto": ["v4-panel-casi-resuelto-01.mp3"],
    "muchas-coincidencias": ["v4-muchas-coincidencias-01.mp3"]
  });

  const player = new Audio();
  player.preload = "auto";
  player.volume = 1;
  const lastVariant = new Map();
  let queue = [];
  let enabled = true;
  let playbackRun = 0;
  let delayedStart = null;
  let speaking = false;
  const music = new Audio();
  music.preload = "none";
  music.loop = true;
  music.volume = 0;
  const musicVolume = 0.16;
  const duckedMusicVolume = 0.05;
  let musicRequested = false;
  let musicSuspended = false;
  let musicFadeTimer = null;
  const loops = new Map();
  const activeEffects = new Set();
  const effectLibrary = Object.freeze({
    archivador: { file: "archivador-fichas-loop.mp3", volume: 0.40 },
    "partida-reanudar": { file: "partida-reanudar.mp3", volume: 0.48 },
    "pierde-turno": { file: "efecto-pierde-turno.mp3", volume: 0.58 },
    premio: { file: "efecto-premio.mp3", volume: 0.58 },
    "prometeo-aparece": { file: "prometeo-aparece.mp3", volume: 0.45 },
    "prometeo-glitch": { file: "prometeo-glitch.mp3", volume: 0.42 },
    "publico-aplauso-corto": { file: "publico-aplauso-corto.mp3", volume: 0.34 },
    "publico-aplauso-final": { file: "publico-aplauso-final.mp3", volume: 0.50 },
    "publico-aplauso-ronda": { file: "publico-aplauso-ronda.mp3", volume: 0.40 },
    "publico-celebracion": { file: "publico-celebracion.mp3", volume: 0.42 },
    "publico-decepcion": { file: "publico-decepcion.mp3", volume: 0.34 },
    "publico-expectacion": { file: "publico-expectacion.mp3", volume: 0.30 },
    quiebra: { file: "efecto-quiebra.mp3", volume: 0.62 },
    reloj: { file: "reloj-cuenta-atras-loop.mp3", volume: 0.32 },
    "respuesta-correcta": { file: "respuesta-correcta.mp3", volume: 0.48 },
    "respuesta-incorrecta": { file: "respuesta-incorrecta.mp3", volume: 0.48 },
    "ronda-final": { file: "ronda-final.mp3", volume: 0.55 },
    "ronda-inicio": { file: "ronda-inicio.mp3", volume: 0.46 },
    ruleta: { file: "ruleta-giro-loop.mp3", volume: 0.42 },
    "vocal-compra": { file: "vocal-compra.mp3", volume: 0.42 },
    "cambio-turno": { file: "cambio-turno.mp3", volume: 0.38 },
    "comodin-conseguido": { file: "comodin-conseguido.mp3", volume: 0.55 },
    empate: { file: "efecto-empate.mp3", volume: 0.55 },
    "ganador-fanfarria": { file: "ganador-fanfarria.mp3", volume: 0.62 },
    "interfaz-confirmar": { file: "interfaz-confirmar.mp3", volume: 0.30 },
    "muchas-coincidencias": { file: "muchas-coincidencias.mp3", volume: 0.50 },
    "panel-casi-resuelto": { file: "panel-casi-resuelto.mp3", volume: 0.42 },
    "panel-reinicio": { file: "panel-reinicio.mp3", volume: 0.35 },
    "partida-pausa": { file: "partida-pausa.mp3", volume: 0.45 }
  });

  function fadeMusic(target, duration = 400, pauseAfter = false) {
    clearInterval(musicFadeTimer);
    if (!musicRequested && target > 0) return;
    if (musicSuspended && target > 0) return;
    const start = music.volume;
    const startedAt = performance.now();
    musicFadeTimer = setInterval(() => {
      const progress = Math.min(1, (performance.now() - startedAt) / duration);
      music.volume = start + (target - start) * progress;
      if (progress < 1) return;
      clearInterval(musicFadeTimer);
      musicFadeTimer = null;
      if (pauseAfter) music.pause();
    }, 30);
  }

  function startMusic() {
    musicRequested = true;
    musicSuspended = false;
    if (!enabled) return;
    if (!music.src) music.src = effectsPath + musicFile;
    const begin = () => {
      if (!musicRequested) return;
      if (music.currentTime === 0 && Number.isFinite(music.duration) && music.duration > 40) {
        music.currentTime = 12 + Math.random() * (music.duration - 32);
      }
      const playback = music.play();
      if (playback !== undefined) playback.then(() => fadeMusic(speaking ? duckedMusicVolume : musicVolume, 900)).catch(() => {});
    };
    if (music.readyState >= 1) begin();
    else music.addEventListener("loadedmetadata", begin, { once: true });
  }

  function pauseMusic() {
    if (!musicRequested) return;
    musicSuspended = true;
    clearInterval(musicFadeTimer);
    musicFadeTimer = null;
    music.volume = 0;
    music.pause();
  }

  function resumeMusic() {
    if (!musicRequested || !enabled) return;
    musicSuspended = false;
    const playback = music.play();
    if (playback !== undefined) playback.then(() => fadeMusic(speaking ? duckedMusicVolume : musicVolume, 500)).catch(() => {});
  }

  function playEffect(name, options = {}) {
    if (!enabled) return null;
    const definition = effectLibrary[name];
    if (!definition) return null;
    const effect = new Audio(effectsPath + encodeURIComponent(definition.file));
    effect.preload = "auto";
    effect.volume = Math.max(0, Math.min(1, Number(options.volume ?? definition.volume)));
    effect.loop = Boolean(options.loop);
    activeEffects.add(effect);
    const dispose = () => activeEffects.delete(effect);
    effect.addEventListener("ended", dispose, { once: true });
    effect.addEventListener("error", dispose, { once: true });
    const playback = effect.play();
    if (playback !== undefined) playback.catch(dispose);
    if (options.maxDuration) setTimeout(() => {
      effect.pause();
      dispose();
    }, options.maxDuration);
    return effect;
  }

  function startLoop(name) {
    if (loops.has(name)) return loops.get(name);
    const effect = playEffect(name, { loop: true });
    if (effect) loops.set(name, effect);
    return effect;
  }

  function stopLoop(name) {
    const effect = loops.get(name);
    if (!effect) return;
    effect.pause();
    activeEffects.delete(effect);
    loops.delete(name);
  }

  function stopAllLoops() {
    [...loops.keys()].forEach(stopLoop);
  }

  function stopEffects() {
    activeEffects.forEach(effect => effect.pause());
    activeEffects.clear();
    loops.clear();
  }

  function filesFor(intent) {
    if (intent.startsWith("letra:")) {
      const letter = intent.slice(6).toLowerCase().replace("ñ", "enye");
      return [`letra-${letter}.mp3`, `v4-letra-${letter}-02.mp3`];
    }
    if (intent.startsWith("coincidencia:")) {
      const amount = Number(intent.slice(13));
      const basic = [null, "una-coincidencia.mp3", "dos-coincidencias.mp3", "tres-coincidencias.mp3", "cuatro-coincidencias.mp3", "cinco-coincidencias.mp3", "seis-coincidencias.mp3"];
      return [`v4-coincidencia-${amount}-01.mp3`, `coincidencia-${amount}-01.mp3`, `coincidencia-${amount}-02.mp3`, basic[amount]].filter(Boolean);
    }
    return library[intent] || [];
  }

  function choose(intent) {
    const files = filesFor(intent);
    if (!files.length) return null;
    const previous = lastVariant.get(intent);
    const available = files.length > 1 ? files.filter(file => file !== previous) : files;
    const selected = available[Math.floor(Math.random() * available.length)];
    lastVariant.set(intent, selected);
    return selected;
  }

  function finishCurrent() {
    speaking = false;
    playNext(playbackRun);
  }

  function playNext(run) {
    if (run !== playbackRun || !enabled) return;
    const intent = queue.shift();
    if (!intent) {
      speaking = false;
      fadeMusic(musicVolume, 500);
      global.dispatchEvent(new CustomEvent("aletheia-voice-idle"));
      return;
    }
    const file = choose(intent);
    if (!file) {
      playNext(run);
      return;
    }
    speaking = true;
    fadeMusic(duckedMusicVolume, 220);
    const cacheVersion = file.startsWith("v4-letra-") && file.endsWith("-02.mp3")
      ? "?v=natural-20261010-1"
      : "";
    player.src = basePath + encodeURIComponent(file) + cacheVersion;
    player.currentTime = 0;
    const playback = player.play();
    global.dispatchEvent(new CustomEvent("aletheia-voice-start", {
      detail: { intent, file, audio: player }
    }));
    if (playback !== undefined) playback.catch(() => finishCurrent());
  }

  function stop() {
    playbackRun += 1;
    clearTimeout(delayedStart);
    delayedStart = null;
    queue = [];
    speaking = false;
    player.pause();
    if (Number.isFinite(player.duration)) player.currentTime = 0;
  }

  function play(intents, options = {}) {
    const sequence = (Array.isArray(intents) ? intents : [intents]).filter(Boolean);
    if (!enabled || !sequence.length) return;
    stop();
    const run = playbackRun;
    queue = sequence;
    const delay = Math.max(0, Number(options.delay) || 0);
    if (delay) delayedStart = setTimeout(() => {
      delayedStart = null;
      playNext(run);
    }, delay);
    else playNext(run);
  }

  player.addEventListener("ended", finishCurrent);
  player.addEventListener("error", finishCurrent);

  global.AletheiaAudio = Object.freeze({
    play,
    stop,
    isSpeaking: () => speaking || queue.length > 0 || delayedStart !== null,
    setEnabled(value) {
      enabled = Boolean(value);
      if (!enabled) {
        stop();
        stopEffects();
        pauseMusic();
      }
    },
    isEnabled: () => enabled,
    setVolume(value) {
      player.volume = Math.max(0, Math.min(1, Number(value)));
    },
    startMusic,
    pauseMusic,
    resumeMusic,
    playEffect,
    startLoop,
    stopLoop,
    stopAllLoops,
    stopEffects
  });
})(window);
