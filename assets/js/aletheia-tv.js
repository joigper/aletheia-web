(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const engine = new AletheiaGame.Engine();
  const voice = window.AletheiaAudio;
  let state = null;
  let selectedRivals = [];
  const selectedBySlot = { 2: null, 3: null };
  const slotModes = { 2: "cpu", 3: "cpu" };
  const slotAliases = { 2: "Invitado 2", 3: "Invitado 3" };
  const humanAvatars = { 1: null, 2: null, 3: null };
  let selectionRun = 0;
  let cpuTimer = null;
  let cpuNotBefore = 0;
  let timedGame = false;
  let gamePaused = false;
  let actionTimeRemaining = 30000;
  let actionDeadline = 0;
  let clockTimer = null;
  const missingThumbnails = new Set(["OSCAR2"]);

  const alphabet = [..."ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"];
  const vowels = new Set(["A", "E", "I", "O", "U"]);
  const keyboard = $("keyboard");
  let wheelRotation = 0;
  let wheelDisplayRun = 0;
  const prometeoBasePath = "assets/img/ocio/";
  const prometeoIdlePrincipal = "Prometeo04B.mp4";
  const prometeoGestures = ["Prometeo01B.mp4", "Prometeo02B.mp4", "Prometeo03B.mp4", "Prometeo06B.mp4", "Prometeo07B.mp4", "Prometeo08B.mp4", "Prometeo09B.mp4"];
  const prometeoActive = $("prometeo-video-a");
  prometeoActive?.removeAttribute("poster");
  let lastPrometeoGesture = null;

  function choosePrometeoGesture() {
    if (Math.random() < 0.70) return prometeoIdlePrincipal;
    const available = prometeoGestures.filter(clip => clip !== lastPrometeoGesture);
    const clip = available[Math.floor(Math.random() * available.length)];
    lastPrometeoGesture = clip;
    return clip;
  }

  function playNextPrometeo() {
    const nextSource = prometeoBasePath + choosePrometeoGesture();
    prometeoActive.pause();
    prometeoActive.src = nextSource;
    prometeoActive.muted = true;
    prometeoActive.load();
    const startPlayback = () => {
      const playback = prometeoActive.play();
      if (playback !== undefined) playback.catch(() => {});
    };
    if (prometeoActive.readyState >= 3) startPlayback();
    else prometeoActive.addEventListener("canplay", startPlayback, { once: true });
  }

  function stopPrometeo() {
    prometeoActive?.pause();
  }

  prometeoActive.addEventListener("ended", playNextPrometeo);

  AletheiaGame.wheel.forEach((value, index) => {
    const label = document.createElement("span");
    label.className = `wheel-sector-label ${typeof value === "number" ? "" : "wheel-sector-special"} ${value === "PIERDE TURNO" ? "wheel-sector-lose" : ""}`;
    label.style.setProperty("--sector-angle", `${index * 15 + 7.5}deg`);
    label.textContent = typeof value === "number" ? String(value) : value.replace(" ", "\n");
    $("wheel-labels").append(label);
  });
  const wheelColors = ["#2eae50","#111318","#f1cf21","#25c6df","#83439a","#f13c3c","#2eae50","#f3f1ee","#f1cf21","#25c6df","#83439a","#f13c3c","#2eae50","#111318","#f1cf21","#25c6df","#83439a","#f13c3c","#2eae50","#f3f1ee","#f1cf21","#25c6df","#83439a","#f13c3c"];
  $("wheel-rotor").style.background = `conic-gradient(${wheelColors.map((color, index) => `${color} ${index * 15}deg ${(index + 1) * 15}deg`).join(",")})`;
  alphabet.forEach(letter => {
    const button = document.createElement("button");
    button.type = "button"; button.textContent = letter; button.dataset.letter = letter;
    button.classList.toggle("is-vowel", vowels.has(letter));
    button.setAttribute("aria-label", vowels.has(letter) ? `Comprar vocal ${letter} por ${AletheiaGame.vowelPrice}` : `Elegir consonante ${letter}`);
    button.addEventListener("click", () => act(() => vowels.has(letter) ? engine.buyVowel(state, letter) : engine.letter(state, letter)));
    keyboard.append(button);
  });

  const panelRowSizes = [12, 14, 14, 12];
  let previousPanelKey = "";
  let previousVisibleLetters = new Set();
  let panelJustChanged = false;

  function splitPanelText(text) {
    const words = text.trim().split(/\s+/);
    const rowWindows = [[1], [1, 2], [0, 1, 2], [0, 1, 2, 3]];

    for (const rows of rowWindows) {
      const candidates = [];
      const partition = (wordIndex, rowIndex, lines) => {
        if (rowIndex === rows.length) {
          if (wordIndex === words.length) candidates.push(lines.slice());
          return;
        }
        const wordsRemaining = words.length - wordIndex;
        const rowsRemaining = rows.length - rowIndex;
        for (let end = wordIndex + 1; end <= words.length; end += 1) {
          if (words.length - end < rowsRemaining - 1) break;
          const line = words.slice(wordIndex, end).join(" ");
          if (line.length > panelRowSizes[rows[rowIndex]]) break;
          partition(end, rowIndex + 1, [...lines, line]);
        }
      };
      partition(0, 0, []);
      if (candidates.length) {
        const best = candidates.sort((a, b) => {
          const score = lines => lines.reduce((total, line, index) => {
            const free = panelRowSizes[rows[index]] - line.length;
            return total + free * free;
          }, 0);
          return score(a) - score(b);
        })[0];
        const result = ["", "", "", ""];
        rows.forEach((row, index) => { result[row] = best[index]; });
        return result;
      }
    }
    return ["", text.slice(0, 14), text.slice(14, 28), text.slice(28, 40)];
  }

  function maskedPuzzle() {
    const normalized = AletheiaGame.normalize(state.puzzle.solution);
    const panelKey = `${state.round}:${normalized}`;
    const samePanel = panelKey === previousPanelKey;
    panelJustChanged = !samePanel;
    const completed = state.phase === "ROUND_COMPLETE" || state.phase === "GAME_COMPLETE";
    const visibleLetters = new Set(completed ? [...normalized].filter(char => char !== " ") : state.puzzle.revealed);
    const rows = splitPanelText(normalized);

    const html = panelRowSizes.map((size, rowIndex) => {
      const line = rows[rowIndex];
      const offset = Math.floor((size - line.length) / 2);
      const cells = Array.from({ length: size }, (_, cellIndex) => {
        const cellOrder = panelRowSizes.slice(0, rowIndex).reduce((sum, rowSize) => sum + rowSize, 0) + cellIndex;
        const cellStyle = ` style="--cell-order:${cellOrder}"`;
        const lineIndex = cellIndex - offset;
        if (lineIndex < 0 || lineIndex >= line.length) return `<span class="tile tile-inactive"${cellStyle} aria-hidden="true"></span>`;
        const char = line[lineIndex];
        if (char === " ") return `<span class="tile tile-space"${cellStyle} aria-hidden="true"></span>`;
        const visible = visibleLetters.has(char);
        const newlyRevealed = samePanel && !completed && visible && !previousVisibleLetters.has(char);
        return `<span class="tile${visible ? " is-visible" : ""}${newlyRevealed ? " is-new" : ""}"${cellStyle}><span${newlyRevealed ? ` data-letter="${char}"` : ""}>${visible && !newlyRevealed ? char : ""}</span></span>`;
      }).join("");
      return `<div class="letter-row" style="--columns:${size}">${cells}</div>`;
    }).join("");

    previousPanelKey = panelKey;
    previousVisibleLetters = visibleLetters;
    return html;
  }

  function animateNewPanelLetters() {
    const reel = [..."ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"];
    $("letter-board").querySelectorAll(".tile.is-new > span[data-letter]").forEach((slot, index) => {
      const tile = slot.parentElement;
      const finalLetter = slot.dataset.letter;
      window.setTimeout(() => {
        tile.classList.add("is-cycling");
        let frame = 0;
        const frames = 10 + Math.floor(Math.random() * 4);
        const ticker = window.setInterval(() => {
          slot.textContent = reel[Math.floor(Math.random() * reel.length)];
          frame += 1;
          if (frame < frames) return;
          window.clearInterval(ticker);
          slot.textContent = finalLetter;
          tile.classList.remove("is-cycling", "is-new");
          tile.classList.add("is-settled");
        }, 75);
      }, index * 55);
    });
  }

  function animatePanelReset() {
    const reel = [..."ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789"];
    voice?.playEffect("panel-reinicio", { maxDuration: 2200 });
    $("letter-board").querySelectorAll(".tile").forEach((tile, index) => {
      let slot = tile.querySelector("span");
      const temporarySlot = !slot;
      if (!slot) {
        slot = document.createElement("span");
        tile.append(slot);
      }
      const finalText = slot.textContent;
      window.setTimeout(() => {
        tile.classList.add("is-resetting");
        let frame = 0;
        const frames = 8 + (index % 4);
        const ticker = window.setInterval(() => {
          slot.textContent = reel[(index + frame * 7) % reel.length];
          frame += 1;
          if (frame < frames) return;
          window.clearInterval(ticker);
          slot.textContent = finalText;
          tile.classList.remove("is-resetting");
          tile.classList.add("is-reset-complete");
          if (temporarySlot && !finalText) window.setTimeout(() => slot.remove(), 120);
        }, 72);
      }, index * 18);
    });
  }

  function render(message) {
    const gameComplete = state.phase === "GAME_COMPLETE";
    const roundComplete = state.phase === "ROUND_COMPLETE";
    const consonantsRemain = engine.hasAvailableConsonants(state);
    const humanTurn = !state.players[state.active].cpu;
    if (roundComplete || gameComplete) {
      clearTimeout(clockTimer);
      voice?.stopLoop("reloj");
    }
    $("game-clock").hidden = !timedGame || gameComplete;
    $("pause-game").disabled = gameComplete;
    $("puzzle-panel").hidden = gameComplete;
    $("play-area").hidden = gameComplete;
    $("winner-panel").hidden = !gameComplete;
    $("next-round").hidden = !roundComplete;
    $("round-label").textContent = `RONDA ${state.round} DE ${state.maxRounds}`;
    $("category").textContent = state.puzzle.category;
    $("clue").textContent = state.puzzle.clue;
    $("letter-board").innerHTML = maskedPuzzle();
    $("letter-board").classList.toggle("is-completing", roundComplete);
    $("letter-board").classList.toggle("is-opening", panelJustChanged && !roundComplete);
    if (panelJustChanged && !roundComplete) {
      animatePanelReset();
    } else if (!roundComplete) {
      animateNewPanelLetters();
    }
    $("turn-label").textContent = roundComplete ? `Ronda ${state.round} terminada` : `Turno de ${state.players[state.active].name}`;
    $("active-round-score").textContent = state.players[state.active].round;
    $("active-total-score").textContent = state.players[state.active].total;
    $("message").textContent = message || (roundComplete ? `${state.players[state.roundWinner].name} gana la ronda. Los saldos de ronda vuelven a cero.` : state.phase === "AWAITING_LETTER" ? (state.pending === "COMODÍN" ? "Acierta una consonante para conseguir el comodín." : `Premio pendiente: ${state.pending} por coincidencia.`) : !consonantsRemain ? (state.players[state.active].round >= AletheiaGame.vowelPrice ? "No quedan consonantes: compra una vocal o resuelve el panel." : "No quedan consonantes y no tienes saldo: resuelve o pasa el turno.") : `Gira la ruleta para elegir consonante. Las vocales cuestan ${AletheiaGame.vowelPrice}${state.players[state.active].round >= AletheiaGame.vowelPrice ? " y ya puedes comprar una" : ""}.`);
    $("spin").disabled = gamePaused || !humanTurn || state.phase !== "AWAITING_SPIN" || !consonantsRemain;
    if (state.phase === "AWAITING_SPIN") {
      $("wheel-result").textContent = "PULSA";
      $("wheel-action").hidden = false;
      $("wheel-hub").classList.remove("has-result");
    }
    $("pass-turn").hidden = !humanTurn || roundComplete || gameComplete || state.phase !== "AWAITING_SPIN" || consonantsRemain || state.players[state.active].round >= AletheiaGame.vowelPrice;
    $("solution").disabled = gamePaused || !humanTurn || roundComplete || gameComplete;
    $("solve-form").querySelector("button").disabled = gamePaused || !humanTurn || roundComplete || gameComplete;
    if (gameComplete) {
      const highest = Math.max(...state.players.map(player => player.total));
      const winners = state.players.filter(player => player.total === highest);
      $("winner-name").textContent = winners.length === 1 ? `GANADOR: ${winners[0].name}` : `EMPATE: ${winners.map(player => player.name).join(" · ")}`;
      $("winner-score").textContent = `${highest} puntos consolidados tras cinco rondas`;
      $("message").textContent = winners.length === 1 ? `${winners[0].name} gana la partida.` : "La partida termina en empate.";
    }
    $("scoreboard").innerHTML = state.players.map((player, i) => {
      const portrait = player.image
        ? `<img src="${encodeURI(player.image)}" alt="Retrato de ${escapeHtml(player.name)}">`
        : `<span class="player-initials" aria-hidden="true">${escapeHtml(player.name.slice(0, 2).toUpperCase())}</span>`;
      return `<article class="player ${i === state.active && !roundComplete && !gameComplete ? "active" : ""}">${portrait}<div class="player-copy"><small>PLAZA ${i + 1} · ${player.cpu ? "TRIPULACIÓN" : "HUMANO"}</small><strong>${escapeHtml(player.name)}</strong><em>${escapeHtml(player.role || "Concursante")}</em>${player.wildcards ? `<span>COMODÍN ${player.wildcards}</span>` : ""}</div><aside class="player-score"><small>RONDA</small><strong>${player.round}</strong><span><i>TOTAL</i><b>${player.total}</b></span></aside></article>`;
    }).join("");
    keyboard.querySelectorAll("button").forEach(button => {
      const vowel = vowels.has(button.dataset.letter);
      button.disabled = gamePaused || !humanTurn || state.puzzle.revealed.includes(button.dataset.letter) || (vowel
        ? state.phase !== "AWAITING_SPIN" || state.players[state.active].round < AletheiaGame.vowelPrice
        : state.phase !== "AWAITING_LETTER");
    });
    $("event-log").innerHTML = state.events.slice().reverse().map(e => `<li><strong>${e.type}</strong> — ${e.detail}</li>`).join("");
    scheduleCpuTurn();
  }

  function escapeHtml(value) { const node = document.createElement("span"); node.textContent = value; return node.innerHTML; }
  function escapeAttribute(value) { return escapeHtml(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }

  function finalVoiceIntent() {
    if (state.phase !== "GAME_COMPLETE") return "ronda-ganada";
    const highest = Math.max(...state.players.map(player => player.total));
    return state.players.filter(player => player.total === highest).length > 1 ? "empate" : "ganador";
  }

  function announceLetterEvent(event, isVowel, roundWon) {
    const letter = event.detail.match(/^([^:]+):/)?.[1]?.trim();
    const count = Number(event.detail.match(/(\d+) coincidencia/)?.[1] || 0);
    const sequence = letter ? [`letra:${letter}`] : [];
    if (isVowel) {
      voice?.playEffect("vocal-compra");
      sequence.push("vocal-comprada");
    }
    if (roundWon) {
      playRoundOutcomeEffects();
      sequence.push("ultima-letra", finalVoiceIntent());
    } else {
      if (!count) voice?.playEffect("publico-decepcion");
      else if (count >= 4) voice?.playEffect("muchas-coincidencias");
      if (count && puzzleProgress() >= .78) voice?.playEffect("panel-casi-resuelto");
      sequence.push(count ? `coincidencia:${Math.min(count, 6)}` : "sin-coincidencias");
    }
    voice?.play(sequence);
  }

  function playRoundOutcomeEffects() {
    if (state.phase === "GAME_COMPLETE") {
      voice?.pauseMusic();
      const highest = Math.max(...state.players.map(player => player.total));
      const tied = state.players.filter(player => player.total === highest).length > 1;
      voice?.playEffect(tied ? "empate" : "ganador-fanfarria");
      voice?.playEffect("publico-aplauso-final");
      return;
    }
    voice?.playEffect("ronda-final");
    voice?.playEffect("publico-aplauso-ronda");
  }

  function announceEvents(events) {
    if (!voice || !events.length) return;
    const letter = events.find(event => event.type === "LETRA");
    const vowel = events.find(event => event.type === "VOCAL");
    const resolution = events.find(event => event.type === "RESOLUCIÓN");
    const roundWon = events.some(event => event.type === "RONDA GANADA");
    const newRound = events.find(event => event.type === "NUEVA RONDA");
    const wheel = events.find(event => event.type === "RULETA");
    const turnChange = events.find(event => event.type === "CAMBIO DE TURNO");

    if (letter || vowel) {
      announceLetterEvent(letter || vowel, Boolean(vowel), roundWon);
      return;
    }
    if (resolution) {
      if (/Correcta/i.test(resolution.detail)) {
        voice.playEffect("respuesta-correcta");
        if (roundWon) playRoundOutcomeEffects();
        voice.play(["solucion-correcta", roundWon ? finalVoiceIntent() : null]);
      } else {
        voice.playEffect("respuesta-incorrecta");
        voice.playEffect("publico-decepcion");
        voice.play("solucion-incorrecta");
      }
      return;
    }
    if (newRound) {
      voice.playEffect("ronda-inicio");
      voice.play(state.round === state.maxRounds ? "ultima-ronda" : "comienza-ronda");
      return;
    }
    if (wheel) {
      const result = wheel.detail.toUpperCase();
      const intent = result.includes("QUIEBRA") || result.includes("BANCARROTA")
        ? "quiebra"
        : result.includes("PIERDE")
          ? "pierde-turno"
          : result.includes("PREMIO") || result.includes("COMODÍN")
            ? "premio"
            : "elige-consonante";
      voice.play(intent, { delay: 1800 });
      return;
    }
    if (roundWon) {
      playRoundOutcomeEffects();
      voice.play(finalVoiceIntent());
      return;
    }
    if (turnChange) {
      voice.playEffect("cambio-turno");
      voice.play("cambio-turno");
    }
  }

  function act(operation) {
    if (gamePaused) return;
    try {
      const previousEvents = state?.events?.length || 0;
      state = operation();
      if ((state.events?.length || 0) > previousEvents) resetActionClock();
      render();
      announceEvents(state.events.slice(previousEvents));
    } catch (error) {
      render(error.message);
      if (/saldo|necesitas/i.test(error.message)) voice?.play("saldo-insuficiente");
      else if (/disponible|utilizada/i.test(error.message)) voice?.play("letra-repetida");
    }
  }

  function formatClock(milliseconds) {
    const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
    return `00:${String(seconds).padStart(2, "0")}`;
  }

  function updateClock() {
    clearTimeout(clockTimer);
    if (!timedGame || !state) return;
    if (state.phase === "ROUND_COMPLETE" || state.phase === "GAME_COMPLETE") return;
    if (!gamePaused) actionTimeRemaining = Math.max(0, actionDeadline - Date.now());
    $("game-clock").textContent = formatClock(actionTimeRemaining);
    $("game-clock").classList.toggle("is-urgent", actionTimeRemaining <= 10000);
    if (!gamePaused && actionTimeRemaining > 0 && actionTimeRemaining <= 10000) voice?.startLoop("reloj");
    else voice?.stopLoop("reloj");
    if (!gamePaused && actionTimeRemaining <= 0 && state.phase !== "ROUND_COMPLETE" && state.phase !== "GAME_COMPLETE") {
      voice?.stopLoop("reloj");
      state = engine.yieldTurn(state);
      resetActionClock();
      render("Tiempo agotado. El turno pasa al siguiente concursante.");
      voice?.playEffect("respuesta-incorrecta");
      voice?.play("tiempo-agotado");
      return;
    }
    clockTimer = setTimeout(updateClock, 200);
  }

  function resetActionClock() {
    if (!timedGame) return;
    voice?.stopLoop("reloj");
    actionTimeRemaining = 30000;
    actionDeadline = Date.now() + actionTimeRemaining;
    updateClock();
  }

  function cpuStrength(player) {
    return player.cpuProfile?.fortalezas?.includes(AletheiaGame.normalize(state.puzzle.category)) ? 15 : 0;
  }

  function puzzleProgress() {
    const letters = [...new Set([...AletheiaGame.normalize(state.puzzle.solution)].filter(char => /^\p{L}$/u.test(char)))];
    return letters.length ? letters.filter(letter => state.puzzle.revealed.includes(letter)).length / letters.length : 1;
  }

  function cpuDelay(player) {
    const profile = player.cpuProfile || AletheiaGame.defaultCpuProfile;
    return 650 + (100 - profile.rapidez) * 12 + Math.random() * profile.variabilidad * 10;
  }

  function availableLetters(filter) {
    return alphabet.filter(letter => filter(letter) && !state.puzzle.revealed.includes(letter));
  }

  function pickCpuLetter(player, wantVowel) {
    const profile = player.cpuProfile || AletheiaGame.defaultCpuProfile;
    const available = availableLetters(letter => vowels.has(letter) === wantVowel);
    if (!available.length) return null;
    const order = wantVowel ? [..."EAOIU"] : [..."NRSLDTCPMBQYGFVHJÑZXKW"];
    const ordered = order.filter(letter => available.includes(letter));
    if (wantVowel) {
      const variation = Math.random() * 100 < profile.variabilidad;
      return variation ? available[Math.floor(Math.random() * available.length)] : ordered[0];
    }
    const hidden = new Set([...AletheiaGame.normalize(state.puzzle.solution)].filter(letter => available.includes(letter)));
    const precision = Math.min(95, profile.precision + cpuStrength(player));
    if (hidden.size && Math.random() * 100 < precision) return ordered.find(letter => hidden.has(letter)) || [...hidden][0];
    return Math.random() * 100 < profile.variabilidad ? available[Math.floor(Math.random() * available.length)] : ordered[0];
  }

  function cpuAttemptsSolution(player, forced = false) {
    const profile = player.cpuProfile || AletheiaGame.defaultCpuProfile;
    const progress = puzzleProgress();
    const confidence = progress * .7 + (profile.conocimiento + cpuStrength(player)) / 100 * .22 + profile.impulsividad / 100 * .08;
    if (!forced && (progress < .45 || Math.random() > Math.max(0, (confidence - .48) * 1.35))) return false;
    const correctChance = Math.min(.97, .18 + progress * .57 + (profile.conocimiento + cpuStrength(player)) / 100 * .25);
    const answer = Math.random() < correctChance ? state.puzzle.solution : "RESPUESTA INCORRECTA";
    act(() => engine.solve(state, answer));
    return true;
  }

  function runCpuTurn() {
    if (gamePaused || !state || !state.players[state.active]?.cpu || state.phase === "ROUND_COMPLETE" || state.phase === "GAME_COMPLETE") return;
    if (voice?.isSpeaking()) {
      cpuTimer = setTimeout(runCpuTurn, 250);
      return;
    }
    const player = state.players[state.active];
    const profile = player.cpuProfile || AletheiaGame.defaultCpuProfile;
    if (state.phase === "AWAITING_LETTER") {
      const consonant = pickCpuLetter(player, false);
      if (consonant) act(() => engine.letter(state, consonant));
      else act(() => engine.yieldTurn(state));
      return;
    }
    const consonantsRemain = engine.hasAvailableConsonants(state);
    const canBuyVowel = player.round >= AletheiaGame.vowelPrice && availableLetters(letter => vowels.has(letter)).length > 0;
    if (cpuAttemptsSolution(player, !consonantsRemain && !canBuyVowel)) return;
    const buyChance = Math.max(.12, (100 - profile.riesgo) / 100 * .62);
    if (canBuyVowel && (!consonantsRemain || Math.random() < buyChance)) {
      const vowel = pickCpuLetter(player, true);
      act(() => engine.buyVowel(state, vowel));
      return;
    }
    if (consonantsRemain) performSpin();
    else act(() => engine.yieldTurn(state));
  }

  function scheduleCpuTurn() {
    clearTimeout(cpuTimer);
    if (gamePaused || !state || !state.players[state.active]?.cpu || state.phase === "ROUND_COMPLETE" || state.phase === "GAME_COMPLETE") return;
    const player = state.players[state.active];
    const wait = Math.max(cpuDelay(player), cpuNotBefore - Date.now());
    $("message").textContent = `${player.name} está pensando…`;
    cpuTimer = setTimeout(runCpuTurn, wait);
  }

  const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

  function portraitPath(person, useThumbnail) {
    const filename = String(person.imagen || "");
    const stem = filename.replace(/^.*[\\/]/, "").replace(/\.[^.]+$/, "");
    if (useThumbnail && !missingThumbnails.has(stem.toUpperCase())) {
      return `assets/img/ocio/personajes/${stem}.webp`;
    }
    return `assets/img/${filename}`;
  }

  function personCard(person, slot, spinning = false) {
    const name = `${person.nombre} ${person.apellidos || ""}`.trim();
    const portrait = portraitPath(person, spinning);
    return `<article class="rival-card tv-contestant-card tv-panel ${spinning ? "is-spinning" : "is-selected"}" data-slot="slot-${slot}" data-controller="cpu"><div class="tv-file-tab">ARCHIVO ${String(slot).padStart(2, "0")}</div><img src="${encodeURI(portrait)}" alt="Retrato de ${escapeHtml(name)}"><div class="tv-card-copy"><small>PLAZA ${slot} · CPU</small><strong>${escapeHtml(name)}</strong><span>${escapeHtml(person.cargo || "Tripulación")}</span></div></article>`;
  }

  function modeSwitch(slot, mode, disabled = false) {
    const nextMode = mode === "cpu" ? "humano" : "CPU";
    return `<button class="tv-player-toggle" type="button" data-toggle-slot="${slot}" data-mode="${mode}" aria-label="Cambiar la plaza ${slot} a ${nextMode}" ${disabled ? "disabled" : ""}><span>HUMANO</span><span>CPU</span></button>`;
  }

  function activeHumanAvatarIds(exceptSlot = 0) {
    return Object.entries(humanAvatars)
      .filter(([slot, person]) => person && Number(slot) !== exceptSlot && (Number(slot) === 1 || slotModes[slot] === "human"))
      .map(([, person]) => person.id);
  }

  function chooseHumanAvatar(slot) {
    const blocked = new Set([
      ...activeHumanAvatarIds(slot),
      ...[2, 3].filter(number => slotModes[number] === "cpu" && selectedBySlot[number]).map(number => selectedBySlot[number].id),
      humanAvatars[slot]?.id
    ].filter(Boolean));
    const candidates = engine.getRoster().filter(person => !blocked.has(person.id));
    if (candidates.length) humanAvatars[slot] = candidates[Math.floor(Math.random() * candidates.length)];
    return humanAvatars[slot];
  }

  function humanAvatarMarkup(slot) {
    const person = humanAvatars[slot] || chooseHumanAvatar(slot);
    if (!person) return `<button class="tv-human-avatar" id="human-avatar-slot-${slot}" data-avatar-slot="${slot}" type="button">TÚ</button>`;
    const name = `${person.nombre} ${person.apellidos || ""}`.trim();
    return `<button class="tv-human-avatar tv-human-portrait" id="human-avatar-slot-${slot}" data-avatar-slot="${slot}" type="button" aria-label="Cambiar avatar. Avatar actual: ${escapeAttribute(name)}"><img src="${encodeURI(portraitPath(person, true))}" alt="Avatar de ${escapeAttribute(name)}"><span>AVATAR: ${escapeHtml(name)} · PULSA PARA CAMBIAR</span></button>`;
  }

  function humanAvatarData(slot) {
    const person = humanAvatars[slot];
    return person ? {
      name: `${person.nombre} ${person.apellidos || ""}`.trim(),
      image: portraitPath(person, true)
    } : null;
  }

  function humanSlotCard(slot) {
    const alias = slotAliases[slot];
    return `<article class="rival-card tv-contestant-card tv-panel tv-extra-human" data-slot="slot-${slot}" data-controller="human">${modeSwitch(slot, "human")}${humanAvatarMarkup(slot)}<div class="tv-card-copy"><small>PLAZA ${slot} · JUGADOR HUMANO</small><strong>Tu alias</strong><label class="visually-hidden" for="alias-${slot}">Alias del jugador de la plaza ${slot}</label><input id="alias-${slot}" data-human-alias="${slot}" maxlength="18" value="${escapeAttribute(alias)}" autocomplete="nickname"></div></article>`;
  }

  function waitingCard(slot, text) {
    return `<article class="rival-card tv-contestant-card tv-panel is-waiting" data-slot="slot-${slot}" data-controller="cpu"><div class="tv-file-tab">ARCHIVO ${String(slot).padStart(2, "0")}</div>${modeSwitch(slot, "cpu")}<div class="tv-file-placeholder">${String(slot).padStart(2, "0")}</div><div class="tv-card-copy"><small>PLAZA ${slot} · CPU</small><strong>${text}</strong></div></article>`;
  }

  function archiveCard(slot, person, spinning = false) {
    const name = `${person.nombre} ${person.apellidos || ""}`.trim();
    const image = portraitPath(person, true);
    return `<article class="rival-card tv-contestant-card tv-panel ${spinning ? "archive-flip" : "archive-selected"}" data-slot="slot-${slot}" data-controller="cpu"><div class="tv-file-tab">ARCHIVO ${String(slot).padStart(2, "0")}</div>${modeSwitch(slot, "cpu", spinning)}<div class="tv-archive-viewport"><img src="${encodeURI(image)}" alt="${spinning ? "" : `Retrato de ${escapeHtml(name)}`}"></div><div class="tv-card-copy"><small>PLAZA ${slot} · CPU</small><strong>${spinning ? "Archivador en movimiento…" : escapeHtml(name)}</strong>${spinning ? "" : `<span>${escapeHtml(person.cargo || "Tripulación")}</span>`}</div></article>`;
  }

  function flipArchiveCard(slot, person) {
    const image = encodeURI(portraitPath(person, true));
    return `<article class="rival-card tv-contestant-card tv-panel archive-turning" data-slot="slot-${slot}" data-controller="cpu"><div class="tv-file-tab">ARCHIVO ${String(slot).padStart(2, "0")}</div>${modeSwitch(slot, "cpu", true)}<div class="tv-flip-viewport"><div class="tv-flip-inner"><div class="tv-flip-face tv-flip-front"><img src="${image}" alt=""></div><div class="tv-flip-face tv-flip-back"><img src="${image}" alt=""></div></div></div><div class="tv-card-copy"><small>PLAZA ${slot} · CPU</small><strong>Archivador en movimiento…</strong></div></article>`;
  }

  function preloadPortrait(person) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = image.onerror = resolve;
      image.src = portraitPath(person, true);
    });
  }

  function replaceSlot(slot, html) {
    const current = $("rival-preview").querySelector(`[data-slot="slot-${slot}"]`);
    if (current) current.outerHTML = html;
  }

  async function spinSlot(slot, excludedIds, run) {
    const roster = engine.getRoster().filter(person => !excludedIds.includes(person.id));
    const selected = engine.pickRivals(1, excludedIds)[0];
    if (!selected) return null;
    // Se reserva antes de precargar y animar para que no pueda elegirse
    // simultáneamente como avatar humano en otra plaza.
    selectedBySlot[slot] = selected;
    const decoys = roster
      .filter(person => person.id !== selected.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);
    const reel = decoys.length ? [...decoys, selected] : [selected];
    await Promise.all(reel.map(preloadPortrait));
    if (run !== selectionRun) return null;
    if (slotModes[slot] === "human") return { selected };
    let completed = false;
    voice?.startLoop("archivador");
    try {
      replaceSlot(slot, flipArchiveCard(slot, reel[0]));
      const card = $("rival-preview").querySelector(`[data-slot="slot-${slot}"]`);
      const inner = card.querySelector(".tv-flip-inner");
      const frontImage = card.querySelector(".tv-flip-front img");
      const backImage = card.querySelector(".tv-flip-back img");
      let angle = 0;
      for (let frame = 1; frame < reel.length; frame += 1) {
        if (run !== selectionRun) return null;
        const nextImage = angle % 360 === 0 ? backImage : frontImage;
        nextImage.src = portraitPath(reel[frame], true);
        await pause(24);
        angle += 180;
        inner.style.transform = `rotateY(${angle}deg)`;
        await pause(270 + frame * 22);
      }
      completed = true;
      return { selected };
    } finally {
      voice?.stopLoop("archivador");
      if (completed) voice?.playEffect("interfaz-confirmar", { volume: 0.22 });
    }
  }

  async function chooseRivals() {
    const run = ++selectionRun;
    selectedRivals = [];
    selectedBySlot[2] = null; selectedBySlot[3] = null;
    $("reroll-rivals").disabled = true;
    $("start-game").disabled = true;
    $("rival-preview").innerHTML = (slotModes[2] === "human" ? humanSlotCard(2) : waitingCard(2, "Buscando ficha…")) + (slotModes[3] === "human" ? humanSlotCard(3) : waitingCard(3, "En espera"));
    $("setup-message").textContent = "Consultando el archivo de tripulación para la plaza 2…";
    const firstResult = await spinSlot(2, activeHumanAvatarIds(), run);
    if (!firstResult || run !== selectionRun) return;
    const first = firstResult.selected;
    selectedRivals.push(first);
    selectedBySlot[2] = first;
    if (slotModes[2] === "cpu") replaceSlot(2, archiveCard(2, first));
    if (slotModes[3] === "cpu") replaceSlot(3, waitingCard(3, "Buscando ficha…"));
    $("setup-message").textContent = `${first.nombre} ocupará la plaza 2. Su ficha sale del archivador.`;
    await pause(300);
    $("setup-message").textContent = "Seleccionando un personaje diferente para la plaza 3…";
    const secondResult = await spinSlot(3, [first.id, ...activeHumanAvatarIds()], run);
    if (!secondResult || run !== selectionRun) return;
    const second = secondResult.selected;
    selectedRivals.push(second);
    selectedBySlot[3] = second;
    if (slotModes[3] === "cpu") replaceSlot(3, archiveCard(3, second));
    $("setup-message").textContent = `Partida preparada: ${first.nombre} y ${second.nombre} serán los rivales. Escribe tu alias y comienza cuando quieras.`;
    $("reroll-rivals").disabled = false;
    $("start-game").disabled = false;
  }

  $("start-game").addEventListener("click", () => {
    const alias = $("alias").value.trim().slice(0, 18) || "Invitado";
    const extraSlots = [2, 3].map(slot => slotModes[slot] === "human"
      ? { cpu: false, alias: (document.querySelector(`[data-human-alias="${slot}"]`)?.value || slotAliases[slot]).trim().slice(0, 18) || `Invitado ${slot}`, avatar: humanAvatarData(slot) }
      : { cpu: true, person: selectedBySlot[slot] });
    timedGame = $("timed-game").checked;
    state = engine.create(alias, selectedRivals, extraSlots, humanAvatarData(1));
    stopPrometeo();
    $("setup-panel").hidden = true; $("game-panel").hidden = false; render("Tres concursantes. Todo preparado. Comenzamos.");
    voice?.startMusic();
    voice?.playEffect("prometeo-aparece");
    voice?.playEffect("ronda-inicio");
    voice?.play(["comienza-partida", "panel-preparado"]);
    $("game-clock").hidden = !timedGame;
    resetActionClock();
  });
  $("reroll-rivals").addEventListener("click", () => void chooseRivals());
  $("rival-preview").addEventListener("input", event => {
    const slot = Number(event.target.dataset.humanAlias);
    if (slotAliases[slot] !== undefined) slotAliases[slot] = event.target.value;
  });
  $("rival-preview").addEventListener("click", event => {
    const toggle = event.target.closest("[data-toggle-slot]");
    if (!toggle || toggle.disabled) return;
    const slot = Number(toggle.dataset.toggleSlot);
    if (slotModes[slot] === "cpu") {
      slotModes[slot] = "human";
      chooseHumanAvatar(slot);
      replaceSlot(slot, humanSlotCard(slot));
      $("setup-message").textContent = `La plaza ${slot} será humana. Escribe el alias del jugador.`;
    } else {
      const input = document.querySelector(`[data-human-alias="${slot}"]`);
      if (input) slotAliases[slot] = input.value;
      slotModes[slot] = "cpu";
      replaceSlot(slot, selectedBySlot[slot] ? archiveCard(slot, selectedBySlot[slot]) : waitingCard(slot, "Seleccionando…"));
      $("setup-message").textContent = `La plaza ${slot} vuelve a estar controlada por la CPU.`;
    }
  });
  $("setup-panel").addEventListener("click", event => {
    const avatar = event.target.closest("[data-avatar-slot]");
    if (!avatar) return;
    const slot = Number(avatar.dataset.avatarSlot);
    chooseHumanAvatar(slot);
    if (slot === 1) avatar.outerHTML = humanAvatarMarkup(1);
    else if (slotModes[slot] === "human") replaceSlot(slot, humanSlotCard(slot));
    $("setup-message").textContent = `Nuevo avatar seleccionado para la plaza ${slot}. El avatar es solamente visual.`;
  });
  function performSpin() {
    const previousEvents = state.events.length;
    cpuNotBefore = Date.now() + 2300;
    act(() => engine.spin(state));
    if (state.events.length === previousEvents || !state.lastSpin) return;
    const { index, result } = state.lastSpin;
    voice?.startLoop("ruleta");
    const target = -(index * 15 + 7.5);
    const currentPosition = ((wheelRotation % 360) + 360) % 360;
    const targetPosition = ((target % 360) + 360) % 360;
    wheelRotation += 1440 + ((targetPosition - currentPosition + 360) % 360);
    $("wheel-rotor").style.transform = `rotate(${wheelRotation}deg)`;
    $("wheel-result").textContent = String(result);
    $("wheel-action").hidden = true;
    $("wheel-hub").classList.add("has-result");
    const displayRun = ++wheelDisplayRun;
    $("spin").setAttribute("aria-label", `Resultado ${result}. ${state.phase === "AWAITING_SPIN" ? "Girar de nuevo" : "Elige una letra"}`);
    const effectRun = wheelDisplayRun;
    setTimeout(() => {
      if (effectRun !== wheelDisplayRun) return;
      voice?.stopLoop("ruleta");
      const normalizedResult = String(result).toUpperCase();
      if (normalizedResult.includes("QUIEBRA") || normalizedResult.includes("BANCARROTA")) voice?.playEffect("quiebra");
      else if (normalizedResult.includes("PIERDE")) voice?.playEffect("pierde-turno");
      else if (normalizedResult.includes("COMODÍN")) voice?.playEffect("comodin-conseguido");
      else if (normalizedResult.includes("PREMIO")) voice?.playEffect("premio");
    }, 1800);
    if (state.phase === "AWAITING_SPIN") setTimeout(() => {
      if (displayRun !== wheelDisplayRun || state.phase !== "AWAITING_SPIN") return;
      $("wheel-result").textContent = "PULSA";
      $("wheel-action").hidden = false;
      $("wheel-hub").classList.remove("has-result");
      $("spin").setAttribute("aria-label", "Girar la ruleta");
    }, 2200);
  }
  $("spin").addEventListener("click", performSpin);
  $("solve-form").addEventListener("submit", event => {
    event.preventDefault(); const answer = $("solution").value; $("solution").value = "";
    voice?.playEffect("publico-expectacion");
    act(() => engine.solve(state, answer));
  });
  $("next-round").addEventListener("click", () => {
    act(() => engine.nextRound(state));
    wheelDisplayRun += 1;
    $("wheel-result").textContent = "PULSA";
    $("wheel-action").hidden = false;
    $("wheel-hub").classList.remove("has-result");
    $("spin").setAttribute("aria-label", "Girar la ruleta");
    $("solution").value = "";
  });
  $("pass-turn").addEventListener("click", () => act(() => engine.yieldTurn(state)));
  function setGamePaused(paused) {
    if (!state || state.phase === "GAME_COMPLETE" || gamePaused === paused) return;
    gamePaused = paused;
    $("pause-overlay").hidden = !paused;
    $("pause-game").textContent = paused ? "REANUDAR" : "PAUSA";
    $("pause-game").setAttribute("aria-pressed", String(paused));
    $("game-panel").classList.toggle("is-paused", paused);
    clearTimeout(cpuTimer);
    clearTimeout(clockTimer);
    voice?.stopEffects();
    if (paused) {
      if (timedGame) actionTimeRemaining = Math.max(0, actionDeadline - Date.now());
      $("message").textContent = "Partida en pausa.";
      voice?.pauseMusic();
      voice?.playEffect("partida-pausa");
      voice?.play("partida-pausada");
      return;
    }
    if (timedGame) {
      actionDeadline = Date.now() + actionTimeRemaining;
      updateClock();
    }
    voice?.resumeMusic();
    voice?.playEffect("partida-reanudar");
    render();
    voice?.play("partida-reanudada");
  }
  const mobilePortraitQuery = window.matchMedia("(max-width: 900px) and (orientation: portrait) and (pointer: coarse)");
  function enforceMobileLandscape(event) {
    const portrait = typeof event?.matches === "boolean" ? event.matches : mobilePortraitQuery.matches;
    document.documentElement.classList.toggle("tv-mobile-portrait", portrait);
    if (portrait && state && !$("game-panel").hidden && !gamePaused) setGamePaused(true);
  }
  if (typeof mobilePortraitQuery.addEventListener === "function") {
    mobilePortraitQuery.addEventListener("change", enforceMobileLandscape);
  } else {
    mobilePortraitQuery.addListener(enforceMobileLandscape);
  }
  enforceMobileLandscape();
  $("pause-game").addEventListener("click", () => setGamePaused(!gamePaused));
  $("resume-game").addEventListener("click", () => setGamePaused(false));
  $("new-game").addEventListener("click", () => location.reload());
  function initializeSetup() {
    chooseHumanAvatar(1);
    $("human-avatar-slot-1").outerHTML = humanAvatarMarkup(1);
    void chooseRivals();
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initializeSetup, { once: true });
  } else {
    initializeSetup();
  }
})();
