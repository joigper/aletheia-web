(function (global) {
  "use strict";

  const basePath = "assets/img/ocio/audio/";
  const effectsPath = basePath;
  const musicFile = "maksymmalko-roblox-minecraft-fortnite-video-game-music-564544.mp3";
  const library = Object.freeze({
    "saludo-prometeo": ["saludo.mp3"],
    bienvenida: ["bienvenida.mp3", "bienvenida-01.mp3", "bienvenida-02.mp3"],
    "comienza-partida": ["comienza-partida.mp3", "comienza-partida-01.mp3", "comienza-partida-02.mp3", "comienza-partida-03.mp3"],
    "comienza-ronda": ["comienza-ronda.mp3", "comienza-ronda-01.mp3", "comienza-ronda-02.mp3", "comienza-ronda-03.mp3"],
    "ultima-ronda": ["ultima-ronda.mp3", "ultima-ronda-01.mp3", "ultima-ronda-02.mp3", "ultima-ronda-03.mp3"],
    "panel-preparado": ["panel-preparado.mp3", "panel-preparado-01.mp3", "panel-preparado-02.mp3"],
    "gira-ruleta": ["gira-ruleta.mp3", "gira-ruleta-01.mp3", "gira-ruleta-02.mp3", "gira-ruleta-03.mp3"],
    "elige-consonante": ["elige-consonante.mp3", "elige-consonante-01.mp3", "elige-consonante-02.mp3", "elige-consonante-03.mp3"],
    "compra-vocal-disponible": ["puedes-comprar-vocal.mp3", "compra-vocal-disponible-01.mp3", "compra-vocal-disponible-02.mp3", "compra-vocal-disponible-03.mp3"],
    "resolver-disponible": ["intenta-resolver.mp3", "resolver-disponible-01.mp3", "resolver-disponible-02.mp3", "resolver-disponible-03.mp3"],
    "sin-coincidencias": ["ninguna-coincidencia.mp3", "sin-coincidencias-01.mp3", "sin-coincidencias-02.mp3", "sin-coincidencias-03.mp3"],
    "letra-repetida": ["letra-repetida.mp3", "letra-repetida-01.mp3", "letra-repetida-02.mp3"],
    "ultima-letra": ["ultima-letra.mp3", "ultima-letra-01.mp3", "ultima-letra-02.mp3"],
    "sin-consonantes": ["sin-consonantes.mp3", "sin-consonantes-01.mp3", "sin-consonantes-02.mp3"],
    "sin-vocales": ["sin-vocales.mp3", "sin-vocales-01.mp3", "sin-vocales-02.mp3"],
    quiebra: ["quiebra.mp3", "quiebra-01.mp3", "quiebra-02.mp3", "quiebra-03.mp3", "quiebra-04.mp3"],
    "pierde-turno": ["pierde-turno.mp3", "pierde-turno-01.mp3", "pierde-turno-02.mp3", "pierde-turno-03.mp3"],
    premio: ["premio.mp3", "premio-01.mp3", "premio-02.mp3", "premio-03.mp3"],
    "saldo-insuficiente": ["saldo-insuficiente.mp3", "saldo-insuficiente-01.mp3", "saldo-insuficiente-02.mp3", "saldo-insuficiente-03.mp3"],
    "vocal-comprada": ["vocal-comprada.mp3", "vocal-comprada-01.mp3", "vocal-comprada-02.mp3", "vocal-comprada-03.mp3"],
    "cambio-turno": ["turno-siguiente.mp3", "cambio-turno-01.mp3", "cambio-turno-02.mp3", "cambio-turno-03.mp3"],
    "solucion-correcta": ["solucion-correcta.mp3", "solucion-correcta-01.mp3", "solucion-correcta-02.mp3", "solucion-correcta-03.mp3", "solucion-correcta-04.mp3"],
    "solucion-incorrecta": ["solucion-incorrecta.mp3", "solucion-incorrecta-01.mp3", "solucion-incorrecta-02.mp3", "solucion-incorrecta-03.mp3", "solucion-incorrecta-04.mp3"],
    "tiempo-agotado": ["tiempo-agotado.mp3", "tiempo-agotado-01.mp3", "tiempo-agotado-02.mp3", "tiempo-agotado-03.mp3"],
    "ronda-ganada": ["ronda-ganada.mp3", "ronda-ganada-01.mp3", "ronda-ganada-02.mp3", "ronda-ganada-03.mp3", "ronda-ganada-04.mp3"],
    "panel-sin-resolver": ["nadie-resuelve.mp3", "panel-sin-resolver-01.mp3", "panel-sin-resolver-02.mp3"],
    "partida-pausada": ["partida-pausada.mp3", "partida-pausada-01.mp3", "partida-pausada-02.mp3", "partida-pausada-03.mp3"],
    "partida-reanudada": ["partida-reanudada.mp3", "partida-reanudada-01.mp3", "partida-reanudada-02.mp3", "partida-reanudada-03.mp3"],
    "siguiente-panel": ["siguiente-ronda.mp3", "siguiente-panel-01.mp3", "siguiente-panel-02.mp3", "siguiente-panel-03.mp3"],
    "fin-partida": ["fin-partida.mp3", "fin-partida-01.mp3", "fin-partida-02.mp3", "fin-partida-03.mp3"],
    ganador: ["tenemos-ganador.mp3", "ganador-01.mp3", "ganador-02.mp3", "ganador-03.mp3", "ganador-04.mp3"],
    empate: ["empate.mp3", "empate-01.mp3", "empate-02.mp3", "empate-03.mp3"],
    enhorabuena: ["enhorabuena.mp3", "enhorabuena-01.mp3", "enhorabuena-02.mp3", "enhorabuena-03.mp3"],
    despedida: ["gracias-participar.mp3", "despedida-01.mp3", "despedida-02.mp3", "despedida-03.mp3"]
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
  const music = new Audio(effectsPath + musicFile);
  music.preload = "auto";
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
      return [`letra-${letter}.mp3`];
    }
    if (intent.startsWith("coincidencia:")) {
      const amount = Number(intent.slice(13));
      const basic = [null, "una-coincidencia.mp3", "dos-coincidencias.mp3", "tres-coincidencias.mp3", "cuatro-coincidencias.mp3", "cinco-coincidencias.mp3", "seis-coincidencias.mp3"];
      return [`coincidencia-${amount}-01.mp3`, `coincidencia-${amount}-02.mp3`, basic[amount]].filter(Boolean);
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
    player.src = basePath + encodeURIComponent(file);
    player.currentTime = 0;
    const playback = player.play();
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
