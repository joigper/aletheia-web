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
  let pauseStartedAt = 0;
  let remoteStateRevision = 0;
  let experienceStarted = false;
  let actionTimeRemaining = 25000;
  let actionDeadline = 0;
  let clockTimer = null;
  let speedTimer = null;
  let speedIntroStartedAt = 0;
  let speedIntroUntil = 0;
  let speedIntroTimer = null;
  let introducedRound = 0;
  let roundIntroUntil = 0;
  let roundIntroTimer = null;
  let interactionLockedUntil = 0;
  let interactionUnlockTimer = null;
  let transientMessage = "";
  let transientMessageUntil = 0;
  let speedInputFocused = false;
  let renderedPhase = null;
  let challengeKey = "";
  let challengeReadyAt = 0;
  let challengeUnlockTimer = null;
  let categoryResultTimer = null;
  let questionSelectionTimer = null;
  let questionResultTimer = null;
  const missingThumbnails = new Set(["OSCAR2"]);
  const phoneStandalone = /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent) && Math.min(screen.width, screen.height) <= 600;
  window.AletheiaPlayMode = { phoneStandalone, remoteActive: false };

  function roundConfiguration(humanCount) {
    if (phoneStandalone) return { playMode: "mobile-standalone", roundModes: ["NORMAL", "NORMAL", "NORMAL", "NORMAL", "NORMAL"] };
    if (window.AletheiaPlayMode.remoteActive) return { playMode: "studio-remotes", roundModes: [...AletheiaGame.roundModes] };
    if (humanCount > 1) return { playMode: "desktop-shared", roundModes: ["NORMAL", "CHOOSE", "NORMAL", "NORMAL", "QUESTION"] };
    return { playMode: "desktop-solo", roundModes: [...AletheiaGame.roundModes] };
  }

  const alphabet = [..."ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"];
  const vowels = new Set(["A", "E", "I", "O", "U"]);
  const keyboard = $("keyboard");
  let wheelRotation = 0;
  let wheelDisplayRun = 0;
  const prometeoBasePath = "assets/img/ocio/";
  const prometeoIdlePrincipal = "Prometeo04B.mp4";
  const prometeoGestures = ["Prometeo01B.mp4", "Prometeo02B.mp4", "Prometeo03B.mp4", "Prometeo06B.mp4", "Prometeo07B.mp4", "Prometeo08B.mp4", "Prometeo09B.mp4"];
  let prometeoActive = $("prometeo-video-a");
  let prometeoStandby = $("prometeo-video-b");
  let prometeoSwitching = false;
  [prometeoActive, prometeoStandby].forEach(video => video?.removeAttribute("poster"));
  let lastPrometeoGesture = null;

  function choosePrometeoGesture() {
    if (Math.random() < 0.70) return prometeoIdlePrincipal;
    const available = prometeoGestures.filter(clip => clip !== lastPrometeoGesture);
    const clip = available[Math.floor(Math.random() * available.length)];
    lastPrometeoGesture = clip;
    return clip;
  }

  function preloadNextPrometeo() {
    if (!prometeoStandby || prometeoStandby.dataset.prepared === "true") return;
    prometeoStandby.src = prometeoBasePath + choosePrometeoGesture();
    prometeoStandby.muted = true;
    prometeoStandby.preload = "auto";
    prometeoStandby.dataset.prepared = "true";
    prometeoStandby.load();
  }

  function playNextPrometeo() {
    if (!prometeoActive || !prometeoStandby || prometeoSwitching) return;
    prometeoSwitching = true;
    preloadNextPrometeo();
    const revealStandby = () => {
      const playback = prometeoStandby.play();
      if (playback === undefined) return;
      const commitSwap = () => {
        const previous = prometeoActive;
        prometeoStandby.classList.add("is-active");
        previous.classList.remove("is-active");
        prometeoActive = prometeoStandby;
        prometeoStandby = previous;
        prometeoStandby.dataset.prepared = "false";
        requestAnimationFrame(() => {
          prometeoStandby.pause();
          prometeoStandby.removeAttribute("src");
          prometeoStandby.load();
          prometeoSwitching = false;
          preloadNextPrometeo();
        });
      };
      playback.then(() => {
        if (typeof prometeoStandby.requestVideoFrameCallback === "function") prometeoStandby.requestVideoFrameCallback(commitSwap);
        else requestAnimationFrame(() => requestAnimationFrame(commitSwap));
      }).catch(() => { prometeoSwitching = false; });
    };
    if (prometeoStandby.readyState >= 3) revealStandby();
    else prometeoStandby.addEventListener("canplay", revealStandby, { once: true });
  }

  function stopPrometeo() {
    prometeoActive?.pause();
    prometeoStandby?.pause();
  }

  function startPrometeoWelcome() {
    if (!prometeoActive) return;
    prometeoActive.pause();
    prometeoActive.src = prometeoBasePath + "Prometeo05B.mp4";
    prometeoActive.currentTime = 0;
    prometeoActive.muted = true;
    prometeoActive.load();
    const playback = prometeoActive.play();
    if (playback !== undefined) playback.then(preloadNextPrometeo).catch(() => {});
  }

  [prometeoActive, prometeoStandby].forEach(video => video?.addEventListener("ended", event => {
    if (event.currentTarget === prometeoActive) playNextPrometeo();
  }));

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
    button.addEventListener("click", () => act(() => {
      if (state.phase === "SPECIAL_LETTER") return engine.specialLetter(state, letter);
      if (state.phase === "FINAL_PICK") return engine.finalLetter(state, letter);
      return vowels.has(letter) ? engine.buyVowel(state, letter) : engine.letter(state, letter);
    }));
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
    const completed = ["ROUND_COMPLETE", "QUESTION_BONUS", "QUESTION_SELECTION", "QUESTION_RESULT", "FINAL_READY", "GAME_COMPLETE"].includes(state.phase);
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
    const phaseChanged = renderedPhase !== state.phase;
    if (phaseChanged && state.phase === "SPEED_RUNNING" && state.special?.reveals === 0) {
      speedIntroStartedAt = Date.now();
      speedIntroUntil = speedIntroStartedAt + 7000;
      speedInputFocused = false;
    }
    const regularRoundOpening = introducedRound !== state.round
      && (state.roundMode === "NORMAL" || state.roundMode === "QUESTION")
      && ["AWAITING_SPIN", "AWAITING_LETTER"].includes(state.phase);
    if (regularRoundOpening) {
      introducedRound = state.round;
      roundIntroUntil = Date.now() + 3000;
      interactionLockedUntil = Math.max(interactionLockedUntil, roundIntroUntil);
    }
    const gameComplete = state.phase === "GAME_COMPLETE";
    const roundComplete = state.phase === "ROUND_COMPLETE";
    const finalReady = state.phase === "FINAL_READY";
    const finalRound = state.phase === "FINAL_PICK" || state.phase === "FINAL_SOLVE";
    const specialRound = state.phase === "SPECIAL_LETTER" || state.phase === "SPEED_RUNNING" || state.phase === "SPEED_SOLVE";
    const forcedClock = state.phase === "SPECIAL_LETTER" || state.phase === "FINAL_SOLVE";
    const consonantsRemain = engine.hasAvailableConsonants(state);
    const humanTurn = !state.players[state.active].cpu;
    const interactionLocked = Date.now() < interactionLockedUntil;
    const speedRound = state.phase === "SPEED_RUNNING" || state.phase === "SPEED_SOLVE";
    const speedHumanIndex = state.players.findIndex(player => !player.cpu);
    const speedHumanCanSolve = speedRound && speedHumanIndex >= 0 && Date.now() >= speedIntroUntil;
    if (roundComplete || finalReady || gameComplete) {
      clearTimeout(clockTimer);
      voice?.stopLoop("reloj");
    }
    if (renderedPhase !== state.phase && forcedClock) resetActionClock();
    renderedPhase = state.phase;
    $("game-clock").hidden = (!timedGame && !forcedClock) || gameComplete;
    $("pause-game").disabled = gameComplete;
    $("puzzle-panel").hidden = gameComplete;
    $("play-area").hidden = gameComplete;
    $("winner-panel").hidden = !gameComplete;
    $("contestants-panel").hidden = gameComplete;
    $("next-round").hidden = !roundComplete && !finalReady;
    $("next-round").textContent = finalReady ? "JUGAR RULETA FINAL" : "SIGUIENTE RONDA";
    $("round-label").textContent = finalRound ? "RULETA FINAL" : `RONDA ${state.round} DE ${state.maxRounds}${state.roundMode === "CHOOSE" ? " · TÚ ELIGES" : state.roundMode === "QUESTION" ? " · PREGUNTA" : state.roundMode === "SPECIAL" ? ` · ${state.special?.type === "SPEED" ? "VELOCIDAD" : "CRONO"}` : ""}`;
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
    $("turn-label").textContent = finalReady ? "Cinco rondas completadas" : roundComplete ? `Ronda ${state.round} terminada` : finalRound ? `Final de ${state.players[state.active].name}` : `Turno de ${state.players[state.active].name}`;
    $("active-round-score").textContent = state.players[state.active].round;
    $("active-total-score").textContent = state.players[state.active].total;
    const visibleTransientMessage = Date.now() < transientMessageUntil ? transientMessage : "";
    $("message").textContent = message || visibleTransientMessage || (finalReady ? "La partida regular ha terminado. El ganador jugará la Ruleta Final." : roundComplete ? `${state.players[state.roundWinner].name} gana la ronda. Los saldos de ronda vuelven a cero.` : state.phase === "FINAL_PICK" ? "Elige tres consonantes y una vocal para la final." : state.phase === "FINAL_SOLVE" ? "Diez segundos para resolver el panel final." : state.phase === "SPECIAL_LETTER" ? `Panel con crono: letras libres por turnos. Premio provisional: ${AletheiaGame.specialPrize}.` : state.phase === "SPEED_RUNNING" ? `Velocidad decreciente: resuelve antes de que el premio baje de ${state.special.prize}.` : state.phase === "SPEED_SOLVE" ? `Panel revelado: ${state.players[state.active].name} debe resolverlo.` : state.phase === "AWAITING_LETTER" ? (state.pending === "COMODÍN" ? "Acierta una consonante para conseguir el comodín." : `Premio pendiente: ${state.pending} por coincidencia.`) : !consonantsRemain ? (state.players[state.active].round >= AletheiaGame.vowelPrice ? "No quedan consonantes: compra una vocal o resuelve el panel." : "No quedan consonantes y no tienes saldo: resuelve o pasa el turno.") : `Gira la ruleta para elegir consonante. Las vocales cuestan ${AletheiaGame.vowelPrice}${state.players[state.active].round >= AletheiaGame.vowelPrice ? " y ya puedes comprar una" : ""}.`);
    $("spin").disabled = gamePaused || interactionLocked || !humanTurn || state.phase !== "AWAITING_SPIN" || !consonantsRemain;
    if (specialRound || finalRound) {
      $("wheel-result").textContent = finalRound ? "FINAL" : state.special.type === "SPEED" ? state.special.prize : "CRONO";
      $("wheel-action").hidden = false;
      $("wheel-action").textContent = finalRound ? "500 PROVISIONALES" : state.special.type === "SPEED" ? "PREMIO ACTUAL" : "SIN RULETA";
    }
    if (state.phase === "AWAITING_SPIN") {
      $("wheel-result").textContent = "PULSA";
      $("wheel-action").hidden = false;
      $("wheel-hub").classList.remove("has-result");
    }
    $("pass-turn").hidden = interactionLocked || !humanTurn || roundComplete || gameComplete || state.phase !== "AWAITING_SPIN" || consonantsRemain || state.players[state.active].round >= AletheiaGame.vowelPrice;
    $("solution").disabled = gamePaused || interactionLocked || (!humanTurn && !speedHumanCanSolve) || roundComplete || finalReady || gameComplete || state.phase === "FINAL_PICK";
    $("solve-form").querySelector("button").disabled = gamePaused || interactionLocked || (!humanTurn && !speedHumanCanSolve) || roundComplete || finalReady || gameComplete || state.phase === "FINAL_PICK";
    $("solution").placeholder = speedRound ? "Escribe la solución y pulsa Enter" : "Escribe la solución";
    if (speedHumanCanSolve && !speedInputFocused) {
      speedInputFocused = true;
      requestAnimationFrame(() => $("solution").focus());
    }
    if (gameComplete) {
      if (!state.statistics.endedAt) state.statistics.endedAt = Date.now();
      const highest = Math.max(...state.players.map(player => player.total));
      const winners = state.players.filter(player => player.total === highest);
      $("winner-name").textContent = winners.length === 1 ? `GANADOR: ${winners[0].name}` : `EMPATE: ${winners.map(player => player.name).join(" · ")}`;
      $("winner-score").textContent = `${highest} puntos consolidados tras cinco rondas y la final`;
      const elapsed = Math.max(0, state.statistics.endedAt - state.statistics.startedAt - state.statistics.pausedMs);
      $("winner-duration").textContent = formatDuration(elapsed);
      $("winner-pause-time").textContent = state.statistics.pausedMs ? `${formatDuration(state.statistics.pausedMs)} en pausa` : "Sin pausas";
      const bestPlayer = state.players.reduce((best, player) => player.stats.bestLetterAward > best.stats.bestLetterAward ? player : best, state.players[0]);
      $("winner-best-play").textContent = bestPlayer.stats.bestLetter ? `${bestPlayer.name}: ${bestPlayer.stats.bestLetterAward} con la ${bestPlayer.stats.bestLetter}` : "Sin premio por letra";
      $("winner-stats").innerHTML = state.players.map(player => {
        const winnerClass = player.total === highest ? " is-winner" : "";
        return `<article class="tv-winner-player${winnerClass}"><small>${player.cpu ? "TRIPULACIÓN" : "HUMANO"}</small><strong>${escapeHtml(player.name)}</strong><b>${player.total}</b><span>TOTAL</span><dl><div><dt>Rondas</dt><dd>${player.stats.roundsWon}</dd></div><div><dt>Consonantes</dt><dd>${player.stats.correctConsonants} bien · ${player.stats.incorrectConsonants} mal</dd></div><div><dt>Vocales</dt><dd>${player.stats.vowelsBought}</dd></div><div><dt>Resoluciones</dt><dd>${player.stats.solvedPanels} bien · ${player.stats.wrongSolutions} mal</dd></div><div><dt>Quiebras</dt><dd>${player.stats.bankruptcies}</dd></div><div><dt>Pierde turno</dt><dd>${player.stats.lostTurns}</dd></div></dl></article>`;
      }).join("");
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
      const unavailable = state.puzzle.revealed.includes(button.dataset.letter);
      const specialAvailable = state.phase === "SPECIAL_LETTER";
      const finalAvailable = state.phase === "FINAL_PICK" && (vowel ? state.final.vowels < 1 : state.final.consonants < 3);
      const normalAvailable = vowel ? state.phase === "AWAITING_SPIN" && state.players[state.active].round >= AletheiaGame.vowelPrice : state.phase === "AWAITING_LETTER";
      button.disabled = gamePaused || interactionLocked || !humanTurn || unavailable || (!specialAvailable && !finalAvailable && !normalAvailable);
    });
    renderChallenge();
    $("event-log").innerHTML = state.events.slice().reverse().map(e => `<li><strong>${e.type}</strong> — ${e.detail}</li>`).join("");
    scheduleCpuTurn();
    scheduleSpeedReveal();
    publishPublicGameState();
  }

  function publishPublicGameState() {
    if (!state || !window.AletheiaPlayMode?.remoteActive) return;
    const forcedClock = state.phase === "SPECIAL_LETTER" || state.phase === "FINAL_SOLVE";
    const timed = Boolean(timedGame || forcedClock);
    const current = state.players[state.active];
    const availableLetters = alphabet.filter(letter => {
      if (state.puzzle.revealed.includes(letter)) return false;
      if (state.phase === "SPECIAL_LETTER") return true;
      if (state.phase === "FINAL_PICK") return vowels.has(letter) ? state.final.vowels < 1 : state.final.consonants < 3;
      return vowels.has(letter) ? state.phase === "AWAITING_SPIN" && current.round >= AletheiaGame.vowelPrice : state.phase === "AWAITING_LETTER";
    });
    window.dispatchEvent(new CustomEvent("aletheia:game-state", { detail: {
      revision: ++remoteStateRevision,
      status: state.phase === "GAME_COMPLETE" ? "finished" : gamePaused ? "paused" : "playing",
      paused: gamePaused, phase: state.phase, round: state.round, maxRounds: state.maxRounds,
      activeSlot: state.active + 1, activeName: current.name, roundWinnerSlot: state.roundWinner == null ? 0 : state.roundWinner + 1, timed,
      interactionLockedMs: Math.max(0, interactionLockedUntil - Date.now()),
      remainingMs: timed ? Math.max(0, gamePaused ? actionTimeRemaining : actionDeadline - Date.now()) : 0,
      pending: state.pending || "", message: $("message").textContent,
      consonantsRemain: engine.hasAvailableConsonants(state),
      canBuyVowel: state.phase === "AWAITING_SPIN" && current.round >= AletheiaGame.vowelPrice,
      availableLetters,
      categoryChoices: state.phase === "CATEGORY_CHOICE" || state.phase === "CATEGORY_RESULT" ? [...state.categoryChoices] : [],
      selectedCategory: state.phase === "CATEGORY_RESULT" ? state.selectedCategory || "" : "",
      question: ["QUESTION_BONUS", "QUESTION_SELECTION", "QUESTION_RESULT"].includes(state.phase) && state.question ? { text: state.question.text, options: [...state.question.options], selected: state.question.selected ?? -1, wasCorrect: state.phase === "QUESTION_RESULT" ? Boolean(state.question.wasCorrect) : null } : null,
      players: Object.fromEntries(state.players.map((player,index) => [String(index + 1), { slot:index+1,name:player.name,round:player.round,total:player.total,cpu:player.cpu }]))
    } }));
  }

  function escapeHtml(value) { const node = document.createElement("span"); node.textContent = value; return node.innerHTML; }
  function escapeAttribute(value) { return escapeHtml(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
  function formatDuration(milliseconds) {
    const seconds = Math.max(0, Math.floor(milliseconds / 1000));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainder = seconds % 60;
    return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}` : `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  }

  function renderChallenge() {
    const overlay = $("challenge-overlay");
    const categoryChoice = state.phase === "CATEGORY_CHOICE" || state.phase === "CATEGORY_RESULT";
    const question = state.phase === "QUESTION_BONUS" || state.phase === "QUESTION_SELECTION" || state.phase === "QUESTION_RESULT";
    const speedIntro = state.phase === "SPEED_RUNNING" && Date.now() < speedIntroUntil;
    const roundIntro = Date.now() < roundIntroUntil;
    overlay.hidden = !categoryChoice && !question && !speedIntro && !roundIntro;
    if (overlay.hidden) { challengeKey = ""; return; }
    if (roundIntro) {
      clearTimeout(roundIntroTimer);
      $("challenge-kicker").textContent = state.round === state.maxRounds ? "ÚLTIMA RONDA" : "NUEVO PANEL";
      $("challenge-title").textContent = `RONDA ${state.round} DE ${state.maxRounds}`;
      $("challenge-text").textContent = `Comienza ${state.players[state.active].name}.`;
      $("challenge-options").innerHTML = '<strong class="tv-round-intro-rule">PREPARANDO EL PANEL…</strong>';
      roundIntroTimer = setTimeout(() => render(), Math.max(40, roundIntroUntil - Date.now()));
      return;
    }
    if (speedIntro) {
      clearTimeout(speedIntroTimer);
      const now = Date.now();
      const instructionEndsAt = speedIntroStartedAt + 4000;
      $("challenge-kicker").textContent = "RONDA 3 · PRUEBA ESPECIAL";
      if (now < instructionEndsAt) {
        $("challenge-title").textContent = "PANEL DE VELOCIDAD";
        $("challenge-text").textContent = "Las letras aparecerán automáticamente. Resuelve antes que tus rivales: el premio disminuye con cada letra.";
        $("challenge-options").innerHTML = '<strong class="tv-speed-rule">OBSERVA EL PANEL · ESCRIBE LA SOLUCIÓN EN CUANTO LA SEPAS</strong>';
        speedIntroTimer = setTimeout(() => render(), Math.max(40, instructionEndsAt - now));
      } else {
        const count = Math.max(1, Math.ceil((speedIntroUntil - now) / 1000));
        $("challenge-title").textContent = String(count);
        $("challenge-text").textContent = "Prepárate…";
        $("challenge-options").innerHTML = '<strong class="tv-speed-rule">EL PREMIO EMPIEZA EN 500 CRÉDITOS</strong>';
        speedIntroTimer = setTimeout(() => render(), Math.max(40, Math.min(1000, speedIntroUntil - now)));
      }
      return;
    }
    const nextKey = categoryChoice ? `category:${state.round}:${state.categoryChoices.join("|")}` : `question:${state.round}:${state.question.text}`;
    if (challengeKey !== nextKey) {
      challengeKey = nextKey;
      challengeReadyAt = Date.now() + 2000;
      clearTimeout(challengeUnlockTimer);
      challengeUnlockTimer = setTimeout(() => { if (state && (state.phase === "CATEGORY_CHOICE" || state.phase === "QUESTION_BONUS")) render(); }, 2050);
    }
    const locked = Date.now() < challengeReadyAt;
    if (categoryChoice) {
      $("challenge-kicker").textContent = "RONDA 2 · TÚ ELIGES";
      const decided = state.phase === "CATEGORY_RESULT";
      $("challenge-title").textContent = decided ? `${state.players[state.active].name} ELIGE ${state.selectedCategory}` : `${state.players[state.active].name}, elige categoría`;
      $("challenge-text").textContent = decided ? "Preparando el panel seleccionado…" : "La categoría elegida determinará el siguiente panel.";
      $("challenge-options").innerHTML = state.categoryChoices.map(category => `<button class="tv-button tv-button-secondary tv-category-option${decided && category === state.selectedCategory ? " is-selected" : decided ? " is-dimmed" : ""}" type="button" data-category-choice="${escapeAttribute(category)}" ${locked || decided ? "disabled" : ""}>${escapeHtml(category)}</button>`).join("");
      if (decided && !categoryResultTimer) categoryResultTimer = setTimeout(() => {
        categoryResultTimer = null;
        if (state?.phase === "CATEGORY_RESULT") act(() => engine.continueCategory(state));
      }, 1900);
      return;
    }
    $("challenge-kicker").textContent = "PREGUNTA DE BONIFICACIÓN";
    $("challenge-title").textContent = state.phase === "QUESTION_RESULT" ? (state.question.wasCorrect ? `RESPUESTA CORRECTA · +${AletheiaGame.questionBonus}` : "RESPUESTA INCORRECTA") : state.phase === "QUESTION_SELECTION" ? `${state.players[state.roundWinner].name} ELIGE…` : `RESPONDE Y GANA ${AletheiaGame.questionBonus} CRÉDITOS ADICIONALES`;
    $("challenge-text").textContent = state.question.text;
    if (state.phase === "QUESTION_RESULT") {
      $("challenge-options").innerHTML = `<strong class="tv-question-result ${state.question.wasCorrect ? "is-correct" : "is-wrong"}">${state.question.wasCorrect ? `+${AletheiaGame.questionBonus} CRÉDITOS` : `LA RESPUESTA ERA: ${escapeHtml(state.question.options[state.question.correct])}`}</strong>`;
      if (!questionResultTimer) questionResultTimer = setTimeout(() => {
        questionResultTimer = null;
        if (state?.phase === "QUESTION_RESULT") act(() => engine.continueAfterQuestion(state));
      }, 2200);
      return;
    }
    const selected = state.phase === "QUESTION_SELECTION";
    $("challenge-options").innerHTML = state.question.options.map((option, index) => `<button class="tv-button tv-button-secondary tv-question-option${selected && index === state.question.selected ? " is-selected" : selected ? " is-dimmed" : ""}" type="button" data-question-choice="${index}" ${locked || selected ? "disabled" : ""}>${escapeHtml(option)}</button>`).join("");
    if (selected && !questionSelectionTimer) questionSelectionTimer = setTimeout(() => {
      questionSelectionTimer = null;
      if (state?.phase === "QUESTION_SELECTION") act(() => engine.revealQuestionResult(state));
    }, 1400);
  }

  function scheduleSpeedReveal() {
    clearTimeout(speedTimer);
    if (gamePaused || !state || state.phase !== "SPEED_RUNNING" || Date.now() < speedIntroUntil) return;
    speedTimer = setTimeout(() => act(() => engine.revealSpeedLetter(state)), 6000);
  }

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
      if ((state.events?.length || 0) > previousEvents && !["CATEGORY_CHOICE", "CATEGORY_RESULT", "QUESTION_BONUS", "QUESTION_SELECTION", "QUESTION_RESULT", "SPECIAL_LETTER", "SPEED_RUNNING", "SPEED_SOLVE", "FINAL_PICK", "FINAL_SOLVE"].includes(state.phase)) resetActionClock();
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
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  }

  function updateClock() {
    clearTimeout(clockTimer);
    if (!state || (!timedGame && state.phase !== "SPECIAL_LETTER" && state.phase !== "FINAL_SOLVE")) return;
    if (["ROUND_COMPLETE", "FINAL_READY", "GAME_COMPLETE", "CATEGORY_CHOICE", "CATEGORY_RESULT", "QUESTION_BONUS", "QUESTION_SELECTION", "QUESTION_RESULT"].includes(state.phase)) return;
    if (!gamePaused) actionTimeRemaining = Math.max(0, actionDeadline - Date.now());
    $("game-clock").textContent = formatClock(actionTimeRemaining);
    $("game-clock").classList.toggle("is-urgent", actionTimeRemaining <= 10000);
    if (!gamePaused && actionTimeRemaining > 0 && actionTimeRemaining <= 10000) voice?.startLoop("reloj");
    else voice?.stopLoop("reloj");
    if (!gamePaused && actionTimeRemaining <= 0 && state.phase !== "ROUND_COMPLETE" && state.phase !== "GAME_COMPLETE") {
      voice?.stopLoop("reloj");
      if (state.phase === "FINAL_SOLVE") state = engine.failFinal(state);
      else if (state.phase === "SPECIAL_LETTER") state = engine.expireSpecial(state);
      else state = engine.yieldTurn(state);
      if (state.phase !== "GAME_COMPLETE" && state.phase !== "ROUND_COMPLETE") resetActionClock();
      render(state.phase === "GAME_COMPLETE" ? "Tiempo agotado en la Ruleta Final." : state.phase === "ROUND_COMPLETE" ? "Tiempo agotado. La prueba termina sin premio." : "Tiempo agotado. El turno pasa al siguiente concursante.");
      voice?.playEffect("respuesta-incorrecta");
      voice?.play("tiempo-agotado");
      return;
    }
    clockTimer = setTimeout(updateClock, 200);
  }

  function resetActionClock() {
    if (!state || (!timedGame && state.phase !== "SPECIAL_LETTER" && state.phase !== "FINAL_SOLVE")) return;
    voice?.stopLoop("reloj");
    actionTimeRemaining = state.phase === "FINAL_SOLVE" ? 10000 : state.phase === "SPECIAL_LETTER" ? 60000 : 25000;
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
    if (state.phase === "CATEGORY_CHOICE") {
      const preferred = state.categoryChoices.find(category => profile.fortalezas.includes(AletheiaGame.normalize(category))) || state.categoryChoices[Math.floor(Math.random() * state.categoryChoices.length)];
      act(() => engine.chooseCategory(state, preferred));
      return;
    }
    if (state.phase === "QUESTION_BONUS") {
      const knowsAnswer = Math.random() * 100 < profile.conocimiento;
      const option = knowsAnswer ? state.question.correct : Math.floor(Math.random() * state.question.options.length);
      act(() => engine.answerQuestion(state, option));
      return;
    }
    if (state.phase === "FINAL_PICK") {
      const wantVowel = state.final.consonants >= 3;
      const letter = pickCpuLetter(player, wantVowel);
      if (letter) act(() => engine.finalLetter(state, letter));
      return;
    }
    if (state.phase === "FINAL_SOLVE") {
      const progress = puzzleProgress();
      const success = Math.random() * 100 < Math.min(94, profile.conocimiento * .65 + progress * 45);
      act(() => engine.solve(state, success ? state.puzzle.solution : "RESPUESTA INCORRECTA"));
      return;
    }
    if (state.phase === "SPECIAL_LETTER") {
      if (cpuAttemptsSolution(player)) return;
      const letter = pickCpuLetter(player, Math.random() < .28);
      if (letter) act(() => engine.specialLetter(state, letter));
      return;
    }
    if (state.phase === "SPEED_RUNNING" || state.phase === "SPEED_SOLVE") {
      cpuAttemptsSolution(player, state.phase === "SPEED_SOLVE");
      return;
    }
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
    if (gamePaused || !state || Date.now() < speedIntroUntil || !state.players[state.active]?.cpu || ["ROUND_COMPLETE", "CATEGORY_RESULT", "QUESTION_SELECTION", "QUESTION_RESULT", "FINAL_READY", "GAME_COMPLETE"].includes(state.phase)) return;
    const player = state.players[state.active];
    const sceneMinimum = Math.max(interactionLockedUntil, roundIntroUntil, state.phase === "CATEGORY_CHOICE" ? challengeReadyAt + 1000 : state.phase === "QUESTION_BONUS" ? challengeReadyAt + 3000 : 0);
    const wait = Math.max(cpuDelay(player), cpuNotBefore - Date.now(), sceneMinimum - Date.now());
    $("message").textContent = `${player.name} está pensando…`;
    cpuTimer = setTimeout(runCpuTurn, wait);
  }

  const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

  function portraitPath(person, useThumbnail) {
    if (person.remoteImage) return person.remoteImage;
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
    window.AletheiaTVSetupState = { ...(window.AletheiaTVSetupState || {}), selectionBusy: true };
    window.dispatchEvent(new CustomEvent("aletheia:setup-selection", { detail: { busy: true } }));
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
    window.AletheiaTVSetupState.selectionBusy = false;
    window.dispatchEvent(new CustomEvent("aletheia:setup-selection", { detail: { busy: false } }));
  }

  function startConfiguredGame() {
    clearTimeout(cpuTimer); clearTimeout(clockTimer); clearTimeout(speedTimer); clearTimeout(speedIntroTimer);
    clearTimeout(roundIntroTimer); clearTimeout(interactionUnlockTimer); clearTimeout(challengeUnlockTimer);
    clearTimeout(categoryResultTimer); clearTimeout(questionSelectionTimer); clearTimeout(questionResultTimer);
    gamePaused = false; renderedPhase = null; introducedRound = 0; roundIntroUntil = 0; interactionLockedUntil = 0;
    transientMessage = ""; transientMessageUntil = 0; speedInputFocused = false; challengeKey = "";
    $("pause-overlay").hidden = true; $("session-overlay").hidden = true; $("game-panel").classList.remove("is-paused");
    $("pause-game").textContent = "PAUSA"; $("pause-game").setAttribute("aria-pressed", "false");
    const alias = $("alias").value.trim().slice(0, 18) || "Invitado";
    const extraSlots = [2, 3].map(slot => slotModes[slot] === "human"
      ? { cpu: false, alias: (document.querySelector(`[data-human-alias="${slot}"]`)?.value || slotAliases[slot]).trim().slice(0, 18) || `Invitado ${slot}`, avatar: humanAvatarData(slot) }
      : { cpu: true, person: selectedBySlot[slot] });
    timedGame = $("timed-game").checked;
    const humanCount = 1 + extraSlots.filter(slot => !slot.cpu).length;
    const mode = roundConfiguration(humanCount);
    state = engine.create(alias, selectedRivals, extraSlots, humanAvatarData(1), mode);
    state.statistics.startedAt = Date.now();
    pauseStartedAt = 0;
    stopPrometeo();
    $("setup-panel").hidden = true; $("game-panel").hidden = false; render("Tres concursantes. Todo preparado. Comenzamos.");
    voice?.startMusic();
    voice?.playEffect("prometeo-aparece");
    voice?.playEffect("ronda-inicio");
    voice?.play(["comienza-partida", "panel-preparado"]);
    $("game-clock").hidden = !timedGame;
    resetActionClock();
    window.dispatchEvent(new CustomEvent("aletheia:session-playing"));
  }
  $("start-game").addEventListener("click", startConfiguredGame);
  window.addEventListener("aletheia:remote-player", event => {
    const slot = Number(event.detail?.slot);
    const player = event.detail?.player;
    if (![1, 2, 3].includes(slot) || !player) return;
    if (slot !== 1 && slotModes[slot] !== "human") return;
    if (slot !== 1) slotAliases[slot] = String(player.alias || `Invitado ${slot}`).slice(0, 18);
    humanAvatars[slot] = {
      id: `remote-${slot}-${player.avatarId || "avatar"}`,
      nombre: player.avatarName || "Avatar",
      apellidos: "",
      cargo: "Jugador conectado",
      imagen: "",
      remoteImage: player.avatarImage || ""
    };
    const avatar = $("human-avatar-slot-" + slot);
    if (avatar) avatar.outerHTML = humanAvatarMarkup(slot);
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
    const spinningPlayer = state.players[state.active].name;
    interactionLockedUntil = Date.now() + 2300;
    cpuNotBefore = interactionLockedUntil;
    act(() => engine.spin(state));
    if (state.events.length === previousEvents || !state.lastSpin) return;
    const { index, result } = state.lastSpin;
    const normalizedResult = String(result).toUpperCase();
    const nextPlayer = state.players[state.active].name;
    transientMessage = normalizedResult.includes("PIERDE")
      ? `${spinningPlayer} pierde el turno. Ahora juega ${nextPlayer}.`
      : normalizedResult.includes("QUIEBRA") || normalizedResult.includes("BANCARROTA")
        ? `${spinningPlayer} cae en quiebra. Ahora juega ${nextPlayer}.`
        : normalizedResult.includes("COMODÍN")
          ? `${spinningPlayer} obtiene el comodín. Debe elegir una consonante.`
          : `${spinningPlayer} obtiene ${result}. Debe elegir una consonante.`;
    transientMessageUntil = interactionLockedUntil;
    clearTimeout(interactionUnlockTimer);
    interactionUnlockTimer = setTimeout(() => render(), 2320);
    render();
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
    const speedRound = state.phase === "SPEED_RUNNING" || state.phase === "SPEED_SOLVE";
    const humanSolver = speedRound ? state.players.findIndex(player => !player.cpu) : state.active;
    act(() => engine.solve(state, answer, humanSolver >= 0 ? humanSolver : state.active));
  });
  function advanceRound() {
    act(() => engine.nextRound(state));
    wheelDisplayRun += 1;
    if (state.phase === "AWAITING_SPIN") {
      $("wheel-result").textContent = "PULSA";
      $("wheel-action").textContent = "PARA GIRAR";
      $("wheel-action").hidden = false;
      $("wheel-hub").classList.remove("has-result");
      $("spin").setAttribute("aria-label", "Girar la ruleta");
    }
    $("solution").value = "";
  }
  $("next-round").addEventListener("click", advanceRound);
  $("challenge-options").addEventListener("click", event => {
    const category = event.target.closest("[data-category-choice]");
    if (category) { act(() => engine.chooseCategory(state, category.dataset.categoryChoice)); return; }
    const answer = event.target.closest("[data-question-choice]");
    if (answer) act(() => engine.answerQuestion(state, Number(answer.dataset.questionChoice)));
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
    clearTimeout(speedTimer);
    voice?.stopEffects();
    if (paused) {
      pauseStartedAt = Date.now();
      if (timedGame) actionTimeRemaining = Math.max(0, actionDeadline - Date.now());
      $("message").textContent = "Partida en pausa.";
      voice?.pauseMusic();
      voice?.playEffect("partida-pausa");
      voice?.play("partida-pausada");
      publishPublicGameState();
      return;
    }
    if (pauseStartedAt) {
      state.statistics.pausedMs += Date.now() - pauseStartedAt;
      pauseStartedAt = 0;
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
  function remoteAck(slot, seq, accepted, message) {
    window.dispatchEvent(new CustomEvent("aletheia:remote-ack", { detail: { slot, seq, accepted, message } }));
  }
  window.addEventListener("aletheia:remote-command", event => {
    if (!state || !window.AletheiaPlayMode?.remoteActive) return;
    const slot = Number(event.detail?.slot), seq = Number(event.detail?.seq || 0), type = event.detail?.type, value = String(event.detail?.value || "").toUpperCase();
    if (type === "pause") { setGamePaused(true); remoteAck(slot, seq, true, "Partida en pausa."); return; }
    if (type === "resume") { setGamePaused(false); remoteAck(slot, seq, true, "Partida reanudada."); return; }
    if (type === "next") {
      const allowed = slot === (state.roundWinner == null ? 0 : state.roundWinner + 1) && ["ROUND_COMPLETE", "FINAL_READY"].includes(state.phase);
      if (!allowed) { remoteAck(slot, seq, false, "Solo el ganador de la ronda puede continuar."); return; }
      advanceRound(); remoteAck(slot, seq, true, "Preparando el siguiente panel."); return;
    }
    if (type === "category") {
      if (slot !== state.active + 1 || state.phase !== "CATEGORY_CHOICE" || !state.categoryChoices.includes(event.detail?.value)) { remoteAck(slot, seq, false, "Esa categoría no está disponible."); return; }
      act(() => engine.chooseCategory(state, event.detail.value)); remoteAck(slot, seq, true, `Categoría ${event.detail.value} seleccionada.`); return;
    }
    if (type === "question") {
      const option = Number(event.detail?.value);
      if (slot !== (state.roundWinner == null ? 0 : state.roundWinner + 1) || state.phase !== "QUESTION_BONUS" || !Number.isInteger(option) || option < 0 || option >= state.question.options.length) { remoteAck(slot, seq, false, "Esa respuesta no está disponible."); return; }
      act(() => engine.answerQuestion(state, option)); remoteAck(slot, seq, true, "Respuesta registrada."); return;
    }
    if (gamePaused) { remoteAck(slot, seq, false, "La partida está en pausa."); return; }
    if (slot !== state.active + 1 || state.players[state.active]?.cpu) { remoteAck(slot, seq, false, `Ahora juega ${state.players[state.active]?.name || "otro concursante"}.`); return; }
    if (Date.now() < interactionLockedUntil) { remoteAck(slot, seq, false, "La jugada anterior aún está terminando."); return; }
    if (type === "spin") {
      if (state.phase !== "AWAITING_SPIN") { remoteAck(slot, seq, false, "Ahora debes elegir una letra."); return; }
      if (!engine.hasAvailableConsonants(state)) { render("No quedan consonantes: compra una vocal o resuelve el panel."); remoteAck(slot, seq, false, "No quedan consonantes. Compra una vocal o resuelve el panel."); return; }
      performSpin(); remoteAck(slot, seq, true, "Giro aceptado."); return;
    }
    if (type === "letter" && value.length === 1) {
      const beforeEvents = state.events.length;
      act(() => {
        if (state.phase === "SPECIAL_LETTER") return engine.specialLetter(state, value);
        if (state.phase === "FINAL_PICK") return engine.finalLetter(state, value);
        return vowels.has(value) ? engine.buyVowel(state, value) : engine.letter(state, value);
      });
      const accepted = state.events.length > beforeEvents;
      remoteAck(slot, seq, accepted, accepted ? state.events[state.events.length - 1].detail : "Esa letra no está disponible ahora.");
      return;
    }
    if (type === "solve" && value.trim()) { const before=state.events.length; act(() => engine.solve(state, value.trim())); remoteAck(slot,seq,state.events.length>before,state.events.length>before?state.events[state.events.length-1].detail:"No se pudo comprobar la respuesta."); return; }
    if (type === "pass" && typeof engine.yieldTurn === "function") { act(() => engine.yieldTurn(state)); remoteAck(slot,seq,true,"Turno cedido."); return; }
    remoteAck(slot, seq, false, "La acción no está disponible.");
  });
  window.addEventListener("aletheia:remote-presence", event => {
    if (!state || $("game-panel").hidden || state.phase === "GAME_COMPLETE" || event.detail?.connected !== false || gamePaused) return;
    setGamePaused(true);
    $("message").textContent = `La plaza ${event.detail.slot} ha perdido la conexión. La partida queda en pausa.`;
  });
  function openSessionMenu() { $("session-overlay").hidden = false; }
  function closeSessionMenu() { $("session-overlay").hidden = true; }
  function returnToSetupAfterClose() {
    clearTimeout(cpuTimer); clearTimeout(clockTimer); clearTimeout(speedTimer); voice?.stopEffects(); voice?.pauseMusic();
    gamePaused = false; state = null; $("session-overlay").hidden = true; $("pause-overlay").hidden = true;
    $("game-panel").hidden = true; $("setup-panel").hidden = false;
    $("setup-message").textContent = "La sala anterior se ha cerrado. Puedes preparar una nueva partida.";
  }
  $("new-game").addEventListener("click", openSessionMenu);
  $("winner-new-game").addEventListener("click", openSessionMenu);
  $("session-cancel").addEventListener("click", closeSessionMenu);
  $("session-replay").addEventListener("click", () => {
    $("session-replay").disabled = true;
    if (window.AletheiaPlayMode?.remoteActive) window.dispatchEvent(new CustomEvent("aletheia:session-restart"));
    else { $("session-replay").disabled = false; startConfiguredGame(); }
  });
  $("session-close").addEventListener("click", () => {
    $("session-close").disabled = true;
    if (window.AletheiaPlayMode?.remoteActive) window.dispatchEvent(new CustomEvent("aletheia:session-close"));
    else { $("session-close").disabled = false; returnToSetupAfterClose(); }
  });
  window.addEventListener("aletheia:session-restart-ready", () => { $("session-replay").disabled = false; startConfiguredGame(); });
  window.addEventListener("aletheia:session-closed-host", () => { $("session-close").disabled = false; returnToSetupAfterClose(); });
  function updateSoundButtons() {
    const enabled = voice?.isEnabled() !== false;
    [$("setup-sound"), $("game-sound")].forEach(button => {
      if (!button) return;
      button.textContent = enabled ? "SONIDO: SÍ" : "SONIDO: NO";
      button.setAttribute("aria-pressed", String(!enabled));
      button.classList.toggle("is-muted", !enabled);
    });
  }

  function setSoundEnabled(enabled) {
    voice?.setEnabled(enabled);
    if (enabled) {
      if (state && !$("game-panel").hidden && !gamePaused) voice?.resumeMusic();
      voice?.playEffect("interfaz-confirmar", { volume: 0.24 });
    }
    updateSoundButtons();
  }

  function toggleSound() {
    setSoundEnabled(!(voice?.isEnabled() !== false));
  }

  function enterExperience(withSound) {
    if (experienceStarted) return;
    experienceStarted = true;
    setSoundEnabled(withSound);
    $("tv-entry").hidden = true;
    startPrometeoWelcome();
    if (withSound) voice?.play("saludo-prometeo");
    setTimeout(() => void chooseRivals(), 550);
  }

  $("enter-with-sound").addEventListener("click", () => enterExperience(true));
  $("enter-without-sound").addEventListener("click", () => enterExperience(false));
  $("setup-sound").addEventListener("click", toggleSound);
  $("game-sound").addEventListener("click", toggleSound);

  function initializeSetup() {
    document.documentElement.classList.toggle("aletheia-tv-phone", phoneStandalone);
    $("entry-desktop-info").hidden = phoneStandalone;
    $("entry-mobile-info").hidden = !phoneStandalone;
    if (phoneStandalone) {
      $("entry-mode-summary").textContent = "Esta versión está adaptada para jugar directamente en el teléfono.";
      $("enable-remotes").hidden = true;
    }
    chooseHumanAvatar(1);
    $("human-avatar-slot-1").outerHTML = humanAvatarMarkup(1);
    $("reroll-rivals").disabled = true;
    $("start-game").disabled = true;
    updateSoundButtons();
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initializeSetup, { once: true });
  } else {
    initializeSetup();
  }
})();
