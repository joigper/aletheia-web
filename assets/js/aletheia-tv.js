(function () {
  "use strict";
  if (!document.getElementById("aletheia-tv-app")) return;
  const $ = id => document.getElementById(id);
  const AletheiaGame = window.AletheiaGame;
  if (!AletheiaGame || typeof AletheiaGame.Engine !== "function") {
    const showLoadError = () => {
      const summary = $("entry-mode-summary");
      if (summary) summary.textContent = "No se ha podido cargar el motor del juego. Recarga la página para intentarlo de nuevo.";
      [$("enter-with-sound"), $("enter-without-sound")].forEach(button => {
        if (!button) return;
        button.disabled = false;
        button.addEventListener("click", () => window.location.reload());
      });
    };
    if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", showLoadError, { once: true });
    else showLoadError();
    return;
  }
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
  let transientWheelOutcome = null;
  let speedInputFocused = false;
  let renderedPhase = null;
  let challengeKey = "";
  let challengeReadyAt = 0;
  let challengeUnlockTimer = null;
  let categoryResultTimer = null;
  let questionSelectionTimer = null;
  let questionResultTimer = null;
  const explainedVoiceModes = new Set();
  let announcedCategoryRound = 0;
  let announcedQuestionRound = 0;
  let announcedFinal = false;
  let introVoicePending = false;
  let introVoiceLockUntil = 0;
  let challengeVoicePending = false;
  let finalVoicePending = false;
  let finalVoiceLockUntil = 0;
  let finalSolveArmed = false;
  let finalSolveInputFocused = false;
  let finalResultHoldUntil = 0;
  let finalResultHoldTimer = null;
  let narrationSnapshot = null;
  let narrationBarrier = false;
  let narrationLockUntil = 0;
  let chronoWarningRound = 0;
  let chronoTenSecondRound = 0;
  let chronoHeldRemaining = 0;
  let pendingResolutionAttempt = null;
  let initialDrawPhase = "idle";
  let initialDrawHighlight = 0;
  let initialDrawTimer = null;
  let initialDrawFallbackTimer = null;
  const cpuResolutionVoiceById = Object.freeze({
    "jean-pierre": "jean-pierre-bernard",
    akama: "akama-takahashi",
    jonas: "jonas-rivas",
    ramon: "ramon-g-santamaria",
    capitan: "el-capitan"
  });
  const missingThumbnails = new Set(["OSCAR2"]);
  const phoneStandalone = /Android|iPhone|iPod|Mobile/i.test(navigator.userAgent) && Math.min(screen.width, screen.height) <= 600;
  window.AletheiaPlayMode = { phoneStandalone, remoteActive: false };

  function roundConfiguration(humanCount) {
    if (phoneStandalone) return { playMode: "mobile-standalone", roundModes: ["NORMAL", "NORMAL", "NORMAL", "NORMAL", "NORMAL"] };
    if (window.AletheiaPlayMode.remoteActive) return { playMode: "studio-remotes", roundModes: [...AletheiaGame.roundModes] };
    if (humanCount > 1) return { playMode: "desktop-shared", roundModes: ["NORMAL", "CHOOSE", "NORMAL", "NORMAL", "NORMAL"] };
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

  function startPrometeoSpokenWelcome() {
    if (!prometeoActive) return;
    const variant = Math.random() < 0.5 ? "01" : "02";
    prometeoActive.pause();
    prometeoActive.src = `assets/img/ocio/locuciones/v4-bienvenida-${variant}.mp4`;
    prometeoActive.currentTime = 0;
    prometeoActive.muted = false;
    prometeoActive.volume = 1;
    prometeoActive.load();
    const playback = prometeoActive.play();
    if (playback !== undefined) playback.catch(() => startPrometeoWelcome());
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
      if (state.phase === "FINAL_PICK") return engine.finalLetter(state, letter);
      return vowels.has(letter) ? engine.buyVowel(state, letter) : engine.letter(state, letter);
    }));
    keyboard.append(button);
  });

  const panelRowSizes = [12, 14, 14, 12];
  let previousPanelKey = "";
  let previousVisibleLetters = new Set();
  let previousVisiblePositions = new Set();
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

  function maskedPuzzle(viewState = state) {
    const normalized = AletheiaGame.panelText ? AletheiaGame.panelText(viewState.puzzle.solution) : AletheiaGame.normalize(viewState.puzzle.solution);
    const panelKey = `${viewState.round}:${normalized}`;
    const samePanel = panelKey === previousPanelKey;
    panelJustChanged = !samePanel;
    const completed = ["ROUND_COMPLETE", "QUESTION_BONUS", "QUESTION_SELECTION", "QUESTION_RESULT", "FINAL_READY", "GAME_COMPLETE"].includes(viewState.phase);
    const visibleLetters = new Set(completed ? [...normalized].filter(char => char !== " ") : viewState.puzzle.revealed);
    const chronoPanel = ["CRONO", "WORD"].includes(viewState.special?.type) && ["SPECIAL_LETTER", "SPECIAL_SOLVE"].includes(viewState.phase);
    const visiblePositions = new Set(completed ? [...normalized].map((char, index) => /^[\p{L}\p{N}]$/u.test(char) ? index : -1).filter(index => index >= 0) : (viewState.puzzle.revealedPositions || []));
    const rows = splitPanelText(normalized);
    let sourcePosition = 0;

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
        const absoluteIndex = normalized.indexOf(line, sourcePosition) + lineIndex;
        const punctuation = !/^[\p{L}\p{N}]$/u.test(char);
        const visible = punctuation || (chronoPanel ? visiblePositions.has(absoluteIndex) : visibleLetters.has(char));
        const newlyRevealed = samePanel && !completed && visible && !punctuation && (chronoPanel ? !previousVisiblePositions.has(absoluteIndex) : !previousVisibleLetters.has(char));
        return `<span class="tile${visible ? " is-visible" : ""}${newlyRevealed ? " is-new" : ""}"${cellStyle}><span${newlyRevealed ? ` data-letter="${char}"` : ""}>${visible && !newlyRevealed ? char : ""}</span></span>`;
      }).join("");
      if (line) sourcePosition = normalized.indexOf(line, sourcePosition) + line.length;
      return `<div class="letter-row" style="--columns:${size}">${cells}</div>`;
    }).join("");

    previousPanelKey = panelKey;
    previousVisibleLetters = visibleLetters;
    previousVisiblePositions = visiblePositions;
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

  function roundVoiceMode() {
    if (state.roundMode !== "SPECIAL") return "normal";
    return state.special?.type === "SPEED" ? "velocidad" : state.special?.type === "WORD" ? "palabra" : "crono";
  }

  function announceRoundIntroduction() {
    const mode = roundVoiceMode();
    const firstExplanation = !explainedVoiceModes.has(mode);
    explainedVoiceModes.add(mode);
    const sequence = [];
    let duration = firstExplanation ? 10500 : 6500;
    if (state.round === 1) sequence.push("primer-panel");
    if (state.round === state.maxRounds) sequence.push("ultima-ronda");
    if (mode === "normal") sequence.push(firstExplanation ? "normal-explicacion" : "normal-breve", "panel-preparado");
    if (mode === "crono") sequence.push("crono-presentacion", "crono-inicio");
    if (mode === "palabra") sequence.push("panel-preparado");
    if (mode === "velocidad") sequence.push("velocidad-presentacion", firstExplanation ? "velocidad-explicacion" : "velocidad-breve", "velocidad-inicio");
    voice?.play(sequence);
    if (voice?.isEnabled() !== false) {
      introVoicePending = true;
      duration = 30000;
    } else duration = 2500;
    return duration;
  }

  function capturePresentationState() {
    if (!state) return null;
    return {
      phase: state.phase,
      active: state.active,
      roundWinner: state.roundWinner,
      pending: state.pending,
      puzzle: { ...state.puzzle, revealed: [...state.puzzle.revealed] },
      players: state.players.map(player => ({ ...player, stats: { ...player.stats } })),
      message: $("message")?.textContent || ""
    };
  }

  function beginNarrationBarrier(snapshot) {
    if (!snapshot || voice?.isEnabled() === false) return;
    narrationSnapshot = snapshot;
    narrationBarrier = true;
    narrationLockUntil = Date.now() + 45000;
    interactionLockedUntil = Math.max(interactionLockedUntil, narrationLockUntil);
    clearTimeout(cpuTimer);
    clearTimeout(speedTimer);
  }

  function releaseNarrationBarrier(shouldRender = true) {
    if (!narrationBarrier) return;
    narrationBarrier = false;
    narrationSnapshot = null;
    if (interactionLockedUntil === narrationLockUntil) interactionLockedUntil = Date.now();
    narrationLockUntil = 0;
    if (state && shouldRender) render();
  }

  function presentationState() {
    if (!narrationSnapshot) return state;
    return {
      ...state,
      phase: narrationSnapshot.phase,
      active: narrationSnapshot.active,
      roundWinner: narrationSnapshot.roundWinner,
      pending: narrationSnapshot.pending,
      puzzle: narrationSnapshot.puzzle,
      players: narrationSnapshot.players
    };
  }

  window.addEventListener("aletheia-voice-idle", () => {
    const now = Date.now();
    if (initialDrawPhase === "running") {
      showInitialDrawResult();
      return;
    }
    if (initialDrawPhase === "result") {
      finishInitialDraw();
      return;
    }
    if (introVoicePending) {
      introVoicePending = false;
      roundIntroUntil = now;
      if (state?.phase === "SPEED_RUNNING" && state.special?.reveals === 0) speedIntroUntil = now;
      if (interactionLockedUntil === introVoiceLockUntil) interactionLockedUntil = now;
      introVoiceLockUntil = 0;
      if (state) render();
    }
    if (challengeVoicePending) {
      challengeVoicePending = false;
      challengeReadyAt = now;
      if (state) render();
    }
    if (finalVoicePending) {
      finalVoicePending = false;
      if (interactionLockedUntil === finalVoiceLockUntil) interactionLockedUntil = now;
      finalVoiceLockUntil = 0;
      if (state?.phase === "FINAL_SOLVE") {
        if (state.players[state.active]?.cpu) {
          actionTimeRemaining = 15000;
          actionDeadline = now + actionTimeRemaining;
          cpuNotBefore = now + 6000;
        } else if (!finalSolveArmed) actionDeadline = now + actionTimeRemaining;
        updateClock();
      }
      if (state) render();
    }
    if (pendingResolutionAttempt) {
      const attempt = pendingResolutionAttempt;
      pendingResolutionAttempt = null;
      releaseNarrationBarrier(false);
      act(() => engine.solve(state, attempt.answer, attempt.playerIndex));
      return;
    }
    if (state?.phase === "GAME_COMPLETE" && finalResultHoldUntil) {
      finalResultHoldUntil = Math.max(finalResultHoldUntil, now + 4000);
    }
    releaseNarrationBarrier();
  });

  function render(message) {
    const viewState = presentationState();
    const phaseChanged = renderedPhase !== state.phase;
    if (phaseChanged && state.phase === "FINAL_SOLVE") {
      finalSolveArmed = Boolean(state.players[state.active]?.cpu);
      finalSolveInputFocused = false;
    }
    const roundOpening = initialDrawPhase === "done" && state.roundMode !== "CHOOSE"
      && introducedRound !== state.round
      && ["AWAITING_SPIN", "AWAITING_LETTER", "SPECIAL_LETTER", "SPEED_RUNNING"].includes(state.phase);
    if (roundOpening) {
      introducedRound = state.round;
      const introDuration = announceRoundIntroduction();
      roundIntroUntil = Date.now() + introDuration;
      interactionLockedUntil = Math.max(interactionLockedUntil, roundIntroUntil);
      introVoiceLockUntil = roundIntroUntil;
      if (state.phase === "SPEED_RUNNING") {
        speedIntroStartedAt = Date.now();
        speedIntroUntil = roundIntroUntil;
        speedInputFocused = false;
      }
    }
    const gameComplete = state.phase === "GAME_COMPLETE";
    const roundComplete = state.phase === "ROUND_COMPLETE";
    const finalReady = state.phase === "FINAL_READY";
    const finalResultHolding = state.phase === "GAME_COMPLETE" && Date.now() < finalResultHoldUntil;
    const visibleGameComplete = viewState.phase === "GAME_COMPLETE" && !finalResultHolding;
    const visibleRoundComplete = viewState.phase === "ROUND_COMPLETE";
    const visibleFinalReady = viewState.phase === "FINAL_READY";
    const finalRound = state.phase === "FINAL_PICK" || state.phase === "FINAL_SOLVE";
    const specialRound = state.phase === "SPECIAL_LETTER" || state.phase === "SPECIAL_SOLVE" || state.phase === "SPEED_RUNNING" || state.phase === "SPEED_SOLVE";
    const forcedClock = state.phase === "SPEED_SOLVE" || state.phase === "FINAL_SOLVE";
    const consonantsRemain = engine.hasAvailableConsonants(state);
    const humanTurn = !state.players[state.active].cpu;
    const interactionLocked = Date.now() < interactionLockedUntil;
    const speedRound = state.phase === "SPEED_RUNNING" || state.phase === "SPEED_SOLVE";
    const speedHumanCanSolve = state.phase === "SPEED_SOLVE" && !state.players[state.active]?.cpu;
    if (roundComplete || finalReady || gameComplete) {
      clearTimeout(clockTimer);
      voice?.stopLoop("reloj");
    }
    if (renderedPhase !== state.phase && forcedClock) resetActionClock();
    renderedPhase = state.phase;
    $("game-clock").hidden = (!timedGame && !forcedClock) || gameComplete;
    $("pause-game").disabled = gameComplete;
    $("puzzle-panel").hidden = visibleGameComplete;
    $("play-area").hidden = visibleGameComplete || finalResultHolding;
    $("winner-panel").hidden = !visibleGameComplete;
    $("contestants-panel").hidden = visibleGameComplete;
    clearTimeout(finalResultHoldTimer);
    if (finalResultHolding) {
      finalResultHoldTimer = setTimeout(() => render(), Math.max(50, finalResultHoldUntil - Date.now()));
    }
    $("next-round").hidden = !visibleRoundComplete && !visibleFinalReady;
    $("next-round").disabled = narrationBarrier;
    $("next-round").textContent = finalReady ? "JUGAR RULETA FINAL" : "SIGUIENTE RONDA";
    $("round-label").textContent = finalRound ? "RULETA FINAL" : `RONDA ${state.round} DE ${state.maxRounds}${state.roundMode === "CHOOSE" ? " · TÚ ELIGES" : state.roundMode === "QUESTION" ? " · REVANCHA" : state.roundMode === "SPECIAL" ? ` · ${state.special?.type === "SPEED" ? "VELOCIDAD" : state.special?.type === "WORD" ? "PALABRA" : "CRONO"}` : ""}`;
    $("category").textContent = state.puzzle.category;
    $("clue").textContent = state.puzzle.clue;
    $("letter-board").innerHTML = maskedPuzzle(viewState);
    $("letter-board").classList.toggle("is-completing", visibleRoundComplete);
    $("letter-board").classList.toggle("is-opening", panelJustChanged && !visibleRoundComplete);
    if (panelJustChanged && !visibleRoundComplete) {
      animatePanelReset();
    } else if (!visibleRoundComplete) {
      animateNewPanelLetters();
    }
    const viewPlayer = viewState.players[viewState.active];
    $("turn-label").textContent = narrationBarrier ? `Turno de ${viewPlayer.name}` : finalReady ? "Cinco rondas completadas" : roundComplete ? `Ronda ${state.round} terminada` : state.phase === "SPEED_SOLVE" ? `¡${state.players[state.active].name} HA PULSADO!` : finalRound ? `Final de ${state.players[state.active].name}` : `Turno de ${state.players[state.active].name}`;
    $("active-round-score").textContent = viewPlayer.round;
    $("active-total-score").textContent = viewPlayer.total;
    const visibleTransientMessage = Date.now() < transientMessageUntil ? transientMessage : "";
      $("message").textContent = narrationBarrier ? (narrationSnapshot.message || "Escucha a Prometeo…") : message || visibleTransientMessage || (finalReady ? "La partida regular ha terminado. El ganador jugará la Ruleta Final." : roundComplete ? (state.special?.noWinner ? `${state.special?.type === "WORD" ? "La Palabra" : "CRONO"} termina sin ganador.` : `${state.players[state.roundWinner].name} gana la ronda. Los saldos de ronda vuelven a cero.`) : state.phase === "FINAL_PICK" ? "Elige tres consonantes y una vocal para la final." : state.phase === "FINAL_SOLVE" ? (finalSolveArmed ? "Escribe la solución. Dispones de 30 segundos." : "Piensa la solución y pulsa RESOLVER AHORA cuando la sepas.") : state.phase === "SPECIAL_LETTER" ? (state.special?.type === "WORD" ? "Memoriza las letras fugaces y pulsa RESOLVER cuando conozcas la palabra. Premio: 150." : `CRONO en marcha: se descubre una posición cada 3 segundos. Pulsa RESOLVER cuando conozcas el panel. Premio: ${AletheiaGame.specialPrize}.`) : state.phase === "SPECIAL_SOLVE" ? `${state.players[state.active].name} ha detenido el panel y está escribiendo la solución.` : state.phase === "SPEED_RUNNING" ? `Panel de velocidad: pulsa ¡LA SÉ! para detenerlo. Premio actual: ${state.special.prize}.` : state.phase === "SPEED_SOLVE" ? `${state.players[state.active].name} ha detenido el panel. Tiene 30 segundos para resolver.` : state.phase === "AWAITING_LETTER" ? (state.pending === "COMODÍN" ? "Acierta una consonante para conseguir el comodín." : `Premio pendiente: ${state.pending} por coincidencia.`) : !consonantsRemain ? (state.players[state.active].round >= AletheiaGame.vowelPrice ? "No quedan consonantes: compra una vocal o resuelve el panel." : "No quedan consonantes y no tienes saldo: resuelve o pasa el turno.") : `Gira la ruleta para elegir consonante. Las vocales cuestan ${AletheiaGame.vowelPrice}${state.players[state.active].round >= AletheiaGame.vowelPrice ? " y ya puedes comprar una" : ""}.`);
    $("spin").disabled = narrationBarrier || gamePaused || interactionLocked || !humanTurn || state.phase !== "AWAITING_SPIN" || !consonantsRemain;
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
    const chronoHumanCanSolve = state.phase === "SPECIAL_SOLVE" && !state.players[state.active]?.cpu;
    const speedInputBlocked = speedRound && !speedHumanCanSolve;
    const finalWaitingToSolve = state.phase === "FINAL_SOLVE" && !finalSolveArmed && humanTurn;
    const solveButton = $("solve-form").querySelector("button");
    $("solution").disabled = narrationBarrier || gamePaused || interactionLocked || finalWaitingToSolve || speedInputBlocked || (!humanTurn && !speedHumanCanSolve && !chronoHumanCanSolve) || roundComplete || finalReady || gameComplete || state.phase === "FINAL_PICK" || state.phase === "SPECIAL_LETTER";
    solveButton.disabled = narrationBarrier || gamePaused || interactionLocked || speedInputBlocked || (!humanTurn && !speedHumanCanSolve && !chronoHumanCanSolve) || roundComplete || finalReady || gameComplete || state.phase === "FINAL_PICK" || state.phase === "SPECIAL_LETTER";
    solveButton.textContent = finalWaitingToSolve ? "RESOLVER AHORA" : "RESOLVER";
    $("solution").placeholder = state.phase === "FINAL_SOLVE" ? (finalSolveArmed ? "Escribe la solución: 30 segundos" : "Pulsa RESOLVER AHORA") : state.phase === "SPECIAL_SOLVE" ? "Escribe la solución: 30 segundos" : state.phase === "SPEED_SOLVE" ? "Escribe la solución: 30 segundos" : speedRound ? "Pulsa ¡LA SÉ! antes de responder" : "Escribe la solución";
    if (state.phase !== "SPEED_SOLVE" && state.phase !== "SPECIAL_SOLVE") speedInputFocused = false;
    if (speedHumanCanSolve && !speedInputFocused) {
      speedInputFocused = true;
      requestAnimationFrame(() => $("solution").focus());
    }
    if (chronoHumanCanSolve && !speedInputFocused) {
      speedInputFocused = true;
      requestAnimationFrame(() => $("solution").focus());
    }
    if (state.phase === "FINAL_SOLVE" && finalSolveArmed && humanTurn && !finalSolveInputFocused) {
      finalSolveInputFocused = true;
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
      const speedBuzzer = state.phase === "SPEED_RUNNING" && Date.now() >= speedIntroUntil && !player.cpu;
      const chronoBuzzer = state.phase === "SPECIAL_LETTER" && ["CRONO", "WORD"].includes(state.special?.type) && !player.cpu;
      const showBuzzer = speedBuzzer || chronoBuzzer;
      const buzzerLocked = showBuzzer && (speedBuzzer ? !engine.canStopSpeed(state, i) : !engine.canStopChrono(state, i));
      const buzzer = showBuzzer ? `<button type="button" class="tv-speed-buzzer${chronoBuzzer ? " is-chrono" : ""}" data-${chronoBuzzer ? "chrono" : "speed"}-buzz-index="${i}" ${buzzerLocked ? "disabled" : ""}><b>${chronoBuzzer ? "RESOLVER YA" : "¡LA SÉ!"}</b><small>${buzzerLocked ? (chronoBuzzer ? "SIN MÁS INTENTOS" : "ESPERA UNA LETRA") : escapeHtml(player.name)}</small></button>` : "";
      const viewPlayerCard = viewState.players[i] || player;
      return `<article class="player ${i === viewState.active && !visibleRoundComplete && !visibleGameComplete ? "active" : ""}${showBuzzer ? " has-speed-buzzer" : ""}">${portrait}<div class="player-copy"><small>PLAZA ${i + 1} · ${player.cpu ? "TRIPULACIÓN" : "HUMANO"}</small><strong>${escapeHtml(player.name)}</strong><em>${escapeHtml(player.role || "Concursante")}</em>${viewPlayerCard.wildcards ? `<span>COMODÍN ${viewPlayerCard.wildcards}</span>` : ""}</div>${buzzer}<aside class="player-score"><small>RONDA</small><strong>${viewPlayerCard.round}</strong><span><i>TOTAL</i><b>${viewPlayerCard.total}</b></span></aside></article>`;
    }).join("");
    keyboard.querySelectorAll("button").forEach(button => {
      const vowel = vowels.has(button.dataset.letter);
      const unavailable = state.puzzle.revealed.includes(button.dataset.letter);
      const specialAvailable = false;
      const finalAvailable = state.phase === "FINAL_PICK" && (vowel ? state.final.vowels < 1 : state.final.consonants < 3);
      const normalAvailable = vowel ? state.phase === "AWAITING_SPIN" && state.players[state.active].round >= AletheiaGame.vowelPrice : state.phase === "AWAITING_LETTER";
      button.disabled = narrationBarrier || gamePaused || interactionLocked || !humanTurn || unavailable || (!specialAvailable && !finalAvailable && !normalAvailable);
    });
    renderChallenge();
    $("event-log").innerHTML = state.events.slice().reverse().map(e => `<li><strong>${e.type}</strong> — ${e.detail}</li>`).join("");
    scheduleCpuTurn();
    scheduleSpecialReveal();
    publishPublicGameState();
  }

  function publishPublicGameState() {
    if (!state || !window.AletheiaPlayMode?.remoteActive) return;
    // La elección de categoría debe llegar a todos los mandos inmediatamente;
    // la locución de Prometeo solo bloquea la interacción, no la sincronización.
    const viewState = ["CATEGORY_CHOICE", "CATEGORY_RESULT"].includes(state.phase) ? state : presentationState();
    const forcedClock = state.phase === "SPEED_SOLVE" || state.phase === "FINAL_SOLVE";
    const timed = Boolean(timedGame || forcedClock);
    const current = viewState.players[viewState.active];
    const availableLetters = alphabet.filter(letter => {
      if (state.puzzle.revealed.includes(letter)) return false;
      if (state.phase === "FINAL_PICK") return vowels.has(letter) ? state.final.vowels < 1 : state.final.consonants < 3;
      return vowels.has(letter) ? state.phase === "AWAITING_SPIN" && current.round >= AletheiaGame.vowelPrice : state.phase === "AWAITING_LETTER";
    });
    window.dispatchEvent(new CustomEvent("aletheia:game-state", { detail: {
      revision: ++remoteStateRevision,
      status: state.phase === "GAME_COMPLETE" && !narrationBarrier ? "finished" : gamePaused ? "paused" : "playing",
      paused: gamePaused, phase: viewState.phase, round: state.round, maxRounds: state.maxRounds,
      activeSlot: viewState.active + 1, activeName: current.name, activeRole: current.role || "Concursante", activeImage: current.image || "", roundWinnerSlot: viewState.roundWinner == null ? 0 : viewState.roundWinner + 1,
      roundWinnerName: viewState.roundWinner == null ? "" : viewState.players[viewState.roundWinner]?.name || "",
      roundWinnerRole: viewState.roundWinner == null ? "" : viewState.players[viewState.roundWinner]?.role || (viewState.players[viewState.roundWinner]?.cpu ? "Tripulación" : "Jugador humano"),
      roundWinnerImage: viewState.roundWinner == null ? "" : viewState.players[viewState.roundWinner]?.image || "",
      timed,
      roundNoWinner: Boolean(state.special?.noWinner),
      interactionLockedMs: Math.max(0, interactionLockedUntil - Date.now()),
      speedReady: state.phase === "SPEED_RUNNING" && Date.now() >= speedIntroUntil,
      speedBuzzerSlot: state.phase === "SPEED_SOLVE" ? state.active + 1 : 0,
      chronoReady: state.phase === "SPECIAL_LETTER" && ["CRONO", "WORD"].includes(state.special?.type),
      wordChallenge: state.special?.type === "WORD",
      chronoBuzzerSlot: state.phase === "SPECIAL_SOLVE" ? state.active + 1 : 0,
      chronoBuzzLockedSlots: ["CRONO", "WORD"].includes(state.special?.type) ? Object.keys(state.special.excludedPlayers || {}).filter(index => state.special.excludedPlayers[index]).map(index => Number(index) + 1) : [],
      finalSolveArmed: state.phase === "FINAL_SOLVE" ? finalSolveArmed : false,
      speedBuzzLockedSlots: state.special?.type === "SPEED" ? Object.keys(state.special.lockedPlayers || {}).filter(index => Number(state.special.lockedPlayers[index]) >= state.special.reveals).map(index => Number(index) + 1) : [],
      resolutionPending: Boolean(pendingResolutionAttempt),
      resolutionPlayerSlot: pendingResolutionAttempt ? pendingResolutionAttempt.playerIndex + 1 : 0,
      resolutionPlayerName: pendingResolutionAttempt ? state.players[pendingResolutionAttempt.playerIndex]?.name || "Concursante" : "",
      initialDrawPhase, initialDrawHighlightSlot: initialDrawHighlight + 1,
      initialDrawWinnerSlot: state.startingPlayer + 1,
      initialDrawWinnerName: state.players[state.startingPlayer]?.name || "",
      finalRevealHolding: state.phase === "GAME_COMPLETE" && Date.now() < finalResultHoldUntil,
      remainingMs: timed ? Math.max(0, gamePaused ? actionTimeRemaining : actionDeadline - Date.now()) : 0,
      pending: state.pending || "", message: $("message").textContent,
      wheelOutcome: transientWheelOutcome && Date.now() < transientMessageUntil ? { ...transientWheelOutcome, remainingMs: Math.max(0, transientMessageUntil - Date.now()) } : null,
      consonantsRemain: engine.hasAvailableConsonants(state),
      canBuyVowel: state.phase === "AWAITING_SPIN" && current.round >= AletheiaGame.vowelPrice,
      availableLetters,
      categoryChoices: state.phase === "CATEGORY_CHOICE" || state.phase === "CATEGORY_RESULT" ? [...state.categoryChoices] : [],
      selectedCategory: state.phase === "CATEGORY_RESULT" ? state.selectedCategory || "" : "",
      questionReady: state.phase === "QUESTION_BONUS" && Date.now() >= challengeReadyAt,
      question: ["QUESTION_BONUS", "QUESTION_SELECTION", "QUESTION_RESULT"].includes(state.phase) && state.question ? { text: state.question.text, options: [...state.question.options], selected: state.question.selected ?? -1, wasCorrect: state.phase === "QUESTION_RESULT" ? Boolean(state.question.wasCorrect) : null, responder: state.question.responder ?? -1, responderName: state.question.responderName || "" } : null,
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

  function setAnimatedChallengeTitle(value) {
    const title = $("challenge-title");
    const text = String(value || "");
    if (title.dataset.value === text) return;
    title.dataset.value = text;
    title.setAttribute("aria-label", text);
    title.replaceChildren();
    let letterIndex = 0;
    text.split(/\s+/).filter(Boolean).forEach(word => {
      const wordNode = document.createElement("span");
      wordNode.className = "tv-title-word";
      wordNode.setAttribute("aria-hidden", "true");
      [...word].forEach(letter => {
        const letterNode = document.createElement("i");
        letterNode.className = "tv-title-letter";
        letterNode.style.setProperty("--letter-index", letterIndex++);
        letterNode.textContent = letter;
        wordNode.append(letterNode);
      });
      title.append(wordNode);
    });
  }

  function renderChallenge() {
    const overlay = $("challenge-overlay");
    const initialDraw = initialDrawPhase === "running" || initialDrawPhase === "result";
    const resolutionIntro = Boolean(pendingResolutionAttempt);
    const categoryChoice = state.phase === "CATEGORY_CHOICE" || state.phase === "CATEGORY_RESULT";
    const question = state.phase === "QUESTION_BONUS" || state.phase === "QUESTION_SELECTION" || state.phase === "QUESTION_RESULT";
    const speedIntro = state.phase === "SPEED_RUNNING" && Date.now() < speedIntroUntil;
    const roundIntro = Date.now() < roundIntroUntil;
    const finalIntro = (state.phase === "FINAL_PICK" || state.phase === "FINAL_SOLVE") && Date.now() < finalVoiceLockUntil;
    overlay.hidden = !initialDraw && !resolutionIntro && !categoryChoice && !question && !speedIntro && !roundIntro && !finalIntro;
    if (overlay.hidden) {
      challengeKey = "";
      delete $("challenge-title").dataset.value;
      $("challenge-title").replaceChildren();
      return;
    }
    if (initialDraw) {
      const winner = state.players[state.startingPlayer];
      overlay.dataset.scene = "draw";
      $("challenge-kicker").textContent = initialDrawPhase === "result" ? "EL AZAR HA DECIDIDO" : "SORTEO INICIAL";
      setAnimatedChallengeTitle(initialDrawPhase === "result" ? `COMIENZA ${winner.name}` : "¿QUIÉN COMIENZA?");
      $("challenge-text").textContent = initialDrawPhase === "result" ? "Abrirá el primer panel." : "Tres concursantes. Un primer turno.";
      $("challenge-options").innerHTML = `<div class="tv-start-draw-grid">${state.players.map((player, index) => {
        const portrait = player.image ? `<img src="${encodeURI(player.image)}" alt="Retrato de ${escapeHtml(player.name)}">` : `<span>${escapeHtml(player.name.slice(0, 2).toUpperCase())}</span>`;
        const selected = initialDrawPhase === "result" && index === state.startingPlayer;
        const dimmed = initialDrawPhase === "result" && index !== state.startingPlayer;
        return `<article class="tv-start-draw-card${index === initialDrawHighlight ? " is-scanning" : ""}${selected ? " is-selected" : ""}${dimmed ? " is-dimmed" : ""}"><small>PLAZA ${index + 1}</small>${portrait}<strong>${escapeHtml(player.name)}</strong><i aria-hidden="true"></i></article>`;
      }).join("")}</div>`;
      return;
    }
    if (resolutionIntro) {
      const player = state.players[pendingResolutionAttempt.playerIndex];
      overlay.dataset.scene = "resolution";
      $("challenge-kicker").textContent = "RESOLUCIÓN EN CURSO";
      setAnimatedChallengeTitle(`${player.name} RESUELVE`);
      $("challenge-text").textContent = "El panel permanece oculto hasta conocer el resultado.";
      $("challenge-options").innerHTML = '<strong class="tv-round-intro-rule">ESCUCHA A PROMETEO…</strong>';
      return;
    }
    if (finalIntro) {
      overlay.dataset.scene = "final";
      clearTimeout(roundIntroTimer);
      $("challenge-kicker").textContent = state.phase === "FINAL_PICK" ? "ÚLTIMO PANEL · RULETA FINAL" : "LETRAS ELEGIDAS";
      setAnimatedChallengeTitle(state.phase === "FINAL_PICK" ? "RULETA FINAL" : "PIENSA LA SOLUCIÓN");
      $("challenge-text").textContent = state.phase === "FINAL_PICK"
        ? "El concursante finalista elige tres consonantes y una vocal."
        : "Cuando conozcas el panel, pulsa RESOLVER AHORA para detener el tiempo y escribir.";
      $("challenge-options").innerHTML = '<strong class="tv-round-intro-rule">ESCUCHA A PROMETEO…</strong>';
      roundIntroTimer = setTimeout(() => render(), Math.max(40, finalVoiceLockUntil - Date.now()));
      return;
    }
    if (roundIntro) {
      clearTimeout(roundIntroTimer);
      const mode = roundVoiceMode();
      overlay.dataset.scene = mode === "velocidad" ? "speed" : mode;
      const titles = { normal: "PANEL NORMAL", crono: "PANEL CRONO", palabra: "PANEL DE LA PALABRA", velocidad: "PANEL DE VELOCIDAD" };
      const instructions = {
        normal: "Gira la ruleta, elige consonantes y resuelve el panel.",
        crono: "Sin ruleta ni límite de tiempo: se descubre una posición cada 3 segundos. El primero que pulse RESOLVER detiene el panel.",
        palabra: "Memoriza cada letra: aparece un instante y vuelve a ocultarse. El primero que pulse RESOLVER detiene el panel.",
        velocidad: "Las letras aparecerán de una en una. Resuelve antes que tus rivales."
      };
      $("challenge-kicker").textContent = `${state.round === state.maxRounds ? "ÚLTIMA RONDA" : "NUEVO PANEL"} · RONDA ${state.round} DE ${state.maxRounds}`;
      setAnimatedChallengeTitle(titles[mode]);
      $("challenge-text").textContent = instructions[mode];
      $("challenge-options").innerHTML = `<strong class="tv-round-intro-rule">${mode === "normal" ? "PREPARANDO EL PANEL…" : "ESCUCHA A PROMETEO…"}</strong>`;
      roundIntroTimer = setTimeout(() => render(), Math.max(40, roundIntroUntil - Date.now()));
      return;
    }
    if (speedIntro) {
      overlay.dataset.scene = "speed";
      clearTimeout(speedIntroTimer);
      const now = Date.now();
      const instructionEndsAt = speedIntroStartedAt + 4000;
      $("challenge-kicker").textContent = "RONDA 3 · PRUEBA ESPECIAL";
      if (now < instructionEndsAt) {
        setAnimatedChallengeTitle("PANEL DE VELOCIDAD");
        $("challenge-text").textContent = "Las letras aparecerán automáticamente. Resuelve antes que tus rivales: el premio disminuye con cada letra.";
        $("challenge-options").innerHTML = '<strong class="tv-speed-rule">OBSERVA EL PANEL · ESCRIBE LA SOLUCIÓN EN CUANTO LA SEPAS</strong>';
        speedIntroTimer = setTimeout(() => render(), Math.max(40, instructionEndsAt - now));
      } else {
        const count = Math.max(1, Math.ceil((speedIntroUntil - now) / 1000));
        setAnimatedChallengeTitle(String(count));
        $("challenge-text").textContent = "Prepárate…";
        $("challenge-options").innerHTML = '<strong class="tv-speed-rule">EL PREMIO EMPIEZA EN 500 CRÉDITOS</strong>';
        speedIntroTimer = setTimeout(() => render(), Math.max(40, Math.min(1000, speedIntroUntil - now)));
      }
      return;
    }
    const nextKey = categoryChoice ? `category:${state.round}:${state.categoryChoices.join("|")}` : `question:${state.round}:${state.question.text}`;
    if (challengeKey !== nextKey) {
      challengeKey = nextKey;
      const firstExplanation = categoryChoice ? !explainedVoiceModes.has("categoria") : !explainedVoiceModes.has("bonus");
      const duration = firstExplanation ? 8500 : 5000;
      if (categoryChoice && state.phase === "CATEGORY_CHOICE" && announcedCategoryRound !== state.round) {
        announcedCategoryRound = state.round;
        explainedVoiceModes.add("categoria");
        voice?.play([
          ...(firstExplanation ? ["categoria-explicacion"] : []),
          ...turnVoiceSequence(state.active),
          "evento-elige-categoria"
        ]);
        challengeVoicePending = voice?.isEnabled() !== false;
      }
      if (question && state.phase === "QUESTION_BONUS" && announcedQuestionRound !== state.round) {
        announcedQuestionRound = state.round;
        explainedVoiceModes.add("bonus");
        voice?.play(firstExplanation ? ["bonus-presentacion", "bonus-explicacion"] : "bonus-breve");
        challengeVoicePending = voice?.isEnabled() !== false;
      }
      challengeReadyAt = Date.now() + (challengeVoicePending ? 30000 : 450);
      clearTimeout(challengeUnlockTimer);
      const pendingChallengeKey = nextKey;
      challengeUnlockTimer = setTimeout(() => {
        if (!state || challengeKey !== pendingChallengeKey) return;
        if (state.phase !== "CATEGORY_CHOICE" && state.phase !== "QUESTION_BONUS") return;
        challengeVoicePending = false;
        challengeReadyAt = Date.now();
        render();
      }, challengeVoicePending ? 22000 : 500);
    }
    const locked = Date.now() < challengeReadyAt;
    if (categoryChoice) {
      overlay.dataset.scene = "category";
      $("challenge-kicker").textContent = "RONDA 2 · TÚ ELIGES";
      const decided = state.phase === "CATEGORY_RESULT";
      setAnimatedChallengeTitle(decided ? `${state.players[state.active].name} ELIGE ${state.selectedCategory}` : `${state.players[state.active].name}, elige categoría`);
      $("challenge-text").textContent = decided ? "Preparando el panel seleccionado…" : "La categoría elegida determinará el siguiente panel.";
      $("challenge-options").innerHTML = state.categoryChoices.map(category => `<button class="tv-button tv-button-secondary tv-category-option${decided && category === state.selectedCategory ? " is-selected" : decided ? " is-dimmed" : ""}" type="button" data-category-choice="${escapeAttribute(category)}" ${locked || decided ? "disabled" : ""}>${escapeHtml(category)}</button>`).join("");
      if (decided && !categoryResultTimer) categoryResultTimer = setTimeout(() => {
        categoryResultTimer = null;
        if (state?.phase === "CATEGORY_RESULT") act(() => engine.continueCategory(state));
      }, 1900);
      return;
    }
    overlay.dataset.scene = "question";
    $("challenge-kicker").textContent = "PREGUNTA DE LA REVANCHA";
    setAnimatedChallengeTitle(state.phase === "QUESTION_RESULT" ? (state.question.wasCorrect ? `${state.question.responderName} GANA LA REVANCHA` : `${state.question.responderName} FALLA`) : state.phase === "QUESTION_SELECTION" ? `${state.question.responderName} SE HA ADELANTADO` : `PRIMERO EN RESPONDER · +${AletheiaGame.questionBonus}`);
    $("challenge-text").textContent = state.question.text;
    if (state.phase === "QUESTION_RESULT") {
      $("challenge-options").innerHTML = `<strong class="tv-question-result ${state.question.wasCorrect ? "is-correct" : "is-wrong"}">${state.question.wasCorrect ? `${escapeHtml(state.question.responderName)} +${AletheiaGame.questionBonus} · RIVALES −${AletheiaGame.questionBonus}` : `${escapeHtml(state.question.responderName)} −${AletheiaGame.questionBonus} · ERA: ${escapeHtml(state.question.options[state.question.correct])}`}</strong>`;
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
      if (state?.phase === "QUESTION_SELECTION") {
        act(() => engine.revealQuestionResult(state));
        voice?.play(state.question.wasCorrect ? "bonus-correcta" : "bonus-incorrecta");
      }
    }, 1400);
  }

  function scheduleSpecialReveal() {
    clearTimeout(speedTimer);
    if (gamePaused || narrationBarrier || !state || Date.now() < speedIntroUntil) return;
    if (state.phase === "SPEED_RUNNING") {
      speedTimer = setTimeout(() => act(() => engine.revealSpeedLetter(state)), 4000);
      return;
    }
    if (state.phase === "SPECIAL_LETTER" && state.special?.type === "WORD") {
      speedTimer = setTimeout(() => {
        if (state.special?.flashVisible) {
          act(() => engine.hideWordPosition(state));
          return;
        }
        const eligibleCpu = state.players.map((player, index) => ({ player, index }))
          .filter(entry => entry.player.cpu && engine.canStopChrono(state, entry.index));
        const candidate = eligibleCpu.sort((a, b) => (b.player.cpuProfile?.rapidez || 50) - (a.player.cpuProfile?.rapidez || 50))[0];
        const progress = Math.min(1, Number(state.special?.reveals || 0) / Math.max(6, AletheiaGame.normalize(state.puzzle.solution).length));
        if (candidate && state.special.reveals >= 4 && Math.random() * 100 < (candidate.player.cpuProfile?.conocimiento || 50) * progress * .38) {
          stopChronoForPlayer(candidate.index);
          return;
        }
        act(() => engine.revealWordPosition(state));
      }, state.special?.flashVisible ? 900 : 1500);
      return;
    }
    if (state.phase === "SPECIAL_LETTER" && state.special?.type === "CRONO") {
      speedTimer = setTimeout(() => {
        const eligibleCpu = state.players.map((player, index) => ({ player, index }))
          .filter(entry => entry.player.cpu && engine.canStopChrono(state, entry.index));
        const progress = (state.puzzle.revealedPositions?.length || 0) / Math.max(1, [...AletheiaGame.panelText(state.puzzle.solution)].filter(char => /^[\p{L}\p{N}]$/u.test(char)).length);
        const candidate = eligibleCpu.sort((a, b) => (b.player.cpuProfile?.rapidez || 50) - (a.player.cpuProfile?.rapidez || 50))[0];
        const knowledge = candidate?.player.cpuProfile?.conocimiento || 0;
        if (candidate && progress > .35 && Math.random() * 100 < knowledge * progress * .45) {
          stopChronoForPlayer(candidate.index);
          return;
        }
        act(() => engine.revealChronoPosition(state));
      }, 3000);
    }
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
      sequence.push("ultima-letra");
      if (state.roundWinner != null) sequence.push(playerIdentityVoice(state.players[state.roundWinner], state.roundWinner), "evento-gana-ronda");
      sequence.push(finalVoiceIntent());
    } else {
      if (!count) voice?.playEffect("publico-decepcion");
      else if (count >= 4) voice?.playEffect("muchas-coincidencias");
      if (count && puzzleProgress() >= .78) voice?.playEffect("panel-casi-resuelto");
      sequence.push(count ? `coincidencia:${Math.min(count, 6)}` : isVowel ? "vocal-sin-coincidencias" : "sin-coincidencias");
      if (/comodín conseguido/i.test(event.detail)) sequence.push(playerIdentityVoice(state.players[state.active], state.active), "evento-comodin");
      if (!count) sequence.push(...turnVoiceSequence(state.active));
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
    const letter = events.find(event => event.type === "LETRA" || event.type === "LETRA RÁPIDA");
    const vowel = events.find(event => event.type === "VOCAL");
    const resolution = events.find(event => event.type === "RESOLUCIÓN");
    const roundWon = events.some(event => event.type === "RONDA GANADA");
    const newRound = events.find(event => event.type === "NUEVA RONDA");
    const wheel = events.find(event => event.type === "RULETA");
    const turnChange = events.find(event => event.type === "CAMBIO DE TURNO");
    const category = events.find(event => event.type === "CATEGORÍA ELEGIDA");
    const question = events.find(event => event.type === "PREGUNTA");
    const final = events.find(event => event.type === "RULETA FINAL" || event.type === "FINAL");
    const speedLetter = events.find(event => event.type === "VELOCIDAD");
    const finalLetter = events.find(event => event.type === "LETRA FINAL");
    const chrono = events.find(event => event.type === "CRONO");
    const speedResolution = state.phase === "SPEED_RUNNING" || state.phase === "SPEED_SOLVE" || state.special?.type === "SPEED";

    if (letter || vowel) {
      announceLetterEvent(letter || vowel, Boolean(vowel), roundWon);
      return;
    }
    if (resolution) {
      if (final?.type === "FINAL") {
        voice.playEffect(/Correcta/i.test(resolution.detail) ? "respuesta-correcta" : "respuesta-incorrecta");
        if (/Correcta/i.test(resolution.detail)) playRoundOutcomeEffects();
        else voice.playEffect("publico-decepcion");
        voice.play(/Correcta/i.test(resolution.detail) ? "final-correcta" : "final-incorrecta");
        return;
      }
      if (/Correcta/i.test(resolution.detail)) {
        voice.playEffect("respuesta-correcta");
        if (roundWon) playRoundOutcomeEffects();
        voice.play([speedResolution ? "velocidad-correcta" : "solucion-correcta", roundWon && state.special?.type === "CRONO" ? "crono-ganado" : roundWon ? finalVoiceIntent() : null]);
      } else {
        voice.playEffect("respuesta-incorrecta");
        voice.playEffect("publico-decepcion");
        voice.play(speedResolution ? "velocidad-error" : ["solucion-incorrecta", ...turnVoiceSequence(state.active)]);
      }
      return;
    }
    if (category) {
      voice.play("categoria-confirmada");
      return;
    }
    if (question) {
      voice.play("bonus-confirmada");
      return;
    }
    if (final) {
      if (final.type === "RULETA FINAL") {
        announcedFinal = true;
        finalVoicePending = voice?.isEnabled() !== false;
        finalVoiceLockUntil = Date.now() + (finalVoicePending ? 30000 : 2500);
        interactionLockedUntil = Math.max(interactionLockedUntil, finalVoiceLockUntil);
        render();
        voice.play(["final-presentacion", "final-explicacion", "final-letras"]);
      } else voice.play(/Correcta/i.test(final.detail) ? "final-correcta" : "final-incorrecta");
      return;
    }
    if (finalLetter) {
      if (state.phase === "FINAL_SOLVE") {
        finalVoicePending = voice?.isEnabled() !== false;
        finalVoiceLockUntil = Date.now() + (finalVoicePending ? 30000 : 800);
        interactionLockedUntil = Math.max(interactionLockedUntil, finalVoiceLockUntil);
        render();
        voice.play([`letra:${finalLetter.detail}`, "final-letras-elegidas", "final-resolver"]);
      } else voice.play(`letra:${finalLetter.detail}`);
      return;
    }
    if (speedLetter) {
      voice.play("velocidad-nueva-letra");
      return;
    }
    if (chrono) {
      voice.play("crono-agotado");
      return;
    }
    if (newRound) { voice.playEffect("ronda-inicio"); return; }
    if (wheel) {
      const result = wheel.detail.toUpperCase();
      if (result.includes("QUIEBRA") || result.includes("BANCARROTA") || result.includes("PIERDE")) {
        const affectedIndex = (state.active - 1 + state.players.length) % state.players.length;
        const outcome = result.includes("PIERDE") ? "evento-pierde-turno" : "evento-quiebra";
        voice.play([playerIdentityVoice(state.players[affectedIndex], affectedIndex), outcome, ...turnVoiceSequence(state.active)], { delay: 1800 });
        return;
      }
      const intent = result.includes("QUIEBRA") || result.includes("BANCARROTA")
        ? "quiebra"
        : result.includes("PIERDE")
          ? "pierde-turno"
          : result.includes("COMODÍN")
            ? "comodin-sale"
            : result.includes("PREMIO")
              ? "premio"
            : "elige-consonante";
      voice.play(intent, { delay: 1800 });
      return;
    }
    if (roundWon) {
      playRoundOutcomeEffects();
      voice.play(state.phase === "FINAL_READY" ? [finalVoiceIntent(), "final-clasificacion"] : finalVoiceIntent());
      return;
    }
    if (turnChange) {
      voice.playEffect("cambio-turno");
      voice.play(turnVoiceSequence(state.active));
    }
  }

  function act(operation) {
    if (initialDrawPhase !== "done" || gamePaused || narrationBarrier) return;
    try {
      const presentationBefore = capturePresentationState();
      const previousEvents = state?.events?.length || 0;
      const previousPhase = state?.phase;
      state = operation();
      const newEvents = state.events.slice(previousEvents);
      const finalLetterChosen = newEvents.some(event => event.type === "LETRA FINAL");
      if (finalLetterChosen) cpuNotBefore = Date.now() + (state.phase === "FINAL_SOLVE" ? 6000 : 3000);
      if (previousPhase === "FINAL_SOLVE" && state.phase === "GAME_COMPLETE") {
        finalResultHoldUntil = Date.now() + 5000;
      }
      if (newEvents.length && voice?.isEnabled() !== false) beginNarrationBarrier(presentationBefore);
      const roundJustClosed = previousPhase !== state.phase && ["ROUND_COMPLETE", "FINAL_READY", "GAME_COMPLETE"].includes(state.phase);
      if (roundJustClosed) {
        clearTimeout(cpuTimer);
        clearTimeout(speedTimer);
        clearTimeout(speedIntroTimer);
        clearTimeout(interactionUnlockTimer);
        cpuTimer = null;
        speedTimer = null;
        speedIntroTimer = null;
        interactionUnlockTimer = null;
        transientWheelOutcome = null;
      }
      if ((state.events?.length || 0) > previousEvents && !["CATEGORY_CHOICE", "CATEGORY_RESULT", "QUESTION_BONUS", "QUESTION_SELECTION", "QUESTION_RESULT", "SPECIAL_LETTER", "SPEED_RUNNING", "SPEED_SOLVE", "FINAL_PICK", "FINAL_SOLVE"].includes(state.phase)) resetActionClock();
      render();
      announceEvents(newEvents);
      if (narrationBarrier && !voice?.isSpeaking()) releaseNarrationBarrier();
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
    if (!state || (!timedGame && state.phase !== "SPEED_SOLVE" && state.phase !== "FINAL_SOLVE")) return;
    if (["ROUND_COMPLETE", "FINAL_READY", "GAME_COMPLETE", "CATEGORY_CHOICE", "CATEGORY_RESULT", "QUESTION_BONUS", "QUESTION_SELECTION", "QUESTION_RESULT"].includes(state.phase)) return;
    if (!gamePaused && Date.now() >= interactionLockedUntil) actionTimeRemaining = Math.max(0, actionDeadline - Date.now());
    else if (!gamePaused && Date.now() < interactionLockedUntil) actionDeadline = interactionLockedUntil + actionTimeRemaining;
    $("game-clock").textContent = formatClock(actionTimeRemaining);
    $("game-clock").classList.toggle("is-urgent", actionTimeRemaining <= 10000);
    if (narrationBarrier) {
      clockTimer = setTimeout(updateClock, 200);
      return;
    }
    if (!gamePaused && actionTimeRemaining > 0 && actionTimeRemaining <= 10000) voice?.startLoop("reloj");
    else voice?.stopLoop("reloj");
    if (!gamePaused && Date.now() >= interactionLockedUntil && actionTimeRemaining <= 0 && state.phase !== "ROUND_COMPLETE" && state.phase !== "GAME_COMPLETE") {
      const presentationBefore = capturePresentationState();
      voice?.stopLoop("reloj");
      if (state.phase === "FINAL_SOLVE") state = engine.failFinal(state);
      else if (state.phase === "SPEED_SOLVE") state = engine.resumeSpeed(state, state.active, "Tiempo agotado");
      else state = engine.yieldTurn(state);
      beginNarrationBarrier(presentationBefore);
      if (state.phase !== "GAME_COMPLETE" && state.phase !== "ROUND_COMPLETE") resetActionClock();
      render(state.phase === "GAME_COMPLETE" ? "Tiempo agotado en la Ruleta Final." : state.phase === "ROUND_COMPLETE" ? "Tiempo agotado. La prueba termina sin premio." : state.phase === "SPEED_RUNNING" ? "Tiempo agotado. El panel de velocidad continúa." : "Tiempo agotado. El turno pasa al siguiente concursante.");
      voice?.playEffect("respuesta-incorrecta");
      voice?.play("tiempo-agotado");
      if (narrationBarrier && !voice?.isSpeaking()) releaseNarrationBarrier();
      return;
    }
    clockTimer = setTimeout(updateClock, 200);
  }

  function resetActionClock() {
    if (!state || (!timedGame && state.phase !== "SPEED_SOLVE" && state.phase !== "FINAL_SOLVE")) return;
    voice?.stopLoop("reloj");
    actionTimeRemaining = state.phase === "FINAL_SOLVE" ? 10000 : state.phase === "SPEED_SOLVE" ? 30000 : 25000;
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

  function pickCpuFinalLetter(player, wantVowel) {
    const profile = player.cpuProfile || AletheiaGame.defaultCpuProfile;
    const available = availableLetters(letter => vowels.has(letter) === wantVowel);
    if (!available.length) return null;
    const frequency = wantVowel ? [..."EAOIU"] : [..."NRTLCDPMSBGVFYQHJÑZXKW"];
    const ordered = frequency.filter(letter => available.includes(letter));
    return Math.random() * 100 < profile.variabilidad
      ? available[Math.floor(Math.random() * available.length)]
      : ordered[0] || available[0];
  }

  function playerIdentityVoice(player, playerIndex) {
    return player.cpu
      ? `resolucion-nombre:${cpuResolutionVoiceById[player.id] || player.id}`
      : `resolucion-jugador:${playerIndex + 1}`;
  }

  function clearInitialDrawTimers() {
    clearInterval(initialDrawTimer);
    clearTimeout(initialDrawFallbackTimer);
    initialDrawTimer = null;
    initialDrawFallbackTimer = null;
  }

  function initialDrawResultVoice() {
    const identity = playerIdentityVoice(state.players[state.startingPlayer], state.startingPlayer);
    return Math.random() < .72 ? ["sorteo-prefijo", identity] : [identity, "sorteo-sufijo"];
  }

  function startInitialDraw() {
    clearInitialDrawTimers();
    initialDrawPhase = "running";
    initialDrawHighlight = Math.floor(Math.random() * state.players.length);
    interactionLockedUntil = Date.now() + 45000;
    let step = 0;
    initialDrawTimer = setInterval(() => {
      if (initialDrawPhase !== "running") return;
      initialDrawHighlight = (initialDrawHighlight + (step > 10 && Math.random() < .28 ? 2 : 1)) % state.players.length;
      step += 1;
      renderChallenge();
    }, 115);
    render("El azar decidirá quién abre el primer panel.");
    voice?.play("sorteo-intro");
    initialDrawFallbackTimer = setTimeout(showInitialDrawResult, voice?.isEnabled() === false ? 3200 : 12000);
  }

  function showInitialDrawResult() {
    if (initialDrawPhase !== "running") return;
    clearInitialDrawTimers();
    initialDrawPhase = "result";
    initialDrawHighlight = state.startingPlayer;
    render(`${state.players[state.startingPlayer].name} tendrá el primer turno.`);
    voice?.play(initialDrawResultVoice());
    initialDrawFallbackTimer = setTimeout(finishInitialDraw, voice?.isEnabled() === false ? 2200 : 9000);
  }

  function finishInitialDraw() {
    if (initialDrawPhase === "done") return;
    clearInitialDrawTimers();
    initialDrawPhase = "done";
    interactionLockedUntil = Date.now();
    render(`${state.players[state.startingPlayer].name} comienza la partida.`);
  }

  function turnVoiceSequence(playerIndex) {
    const player = state.players[playerIndex];
    const identity = playerIdentityVoice(player, playerIndex);
    return Math.random() < .75 ? ["turno-prefijo", identity] : [identity, "turno-sufijo"];
  }

  function resolutionAttemptVoice(player, playerIndex) {
    const identity = playerIdentityVoice(player, playerIndex);
    const announcements = ["resolucion-pulsa", "resolucion-intenta", "resolucion-cree"];
    return [identity, announcements[Math.floor(Math.random() * announcements.length)]];
  }

  function stageResolutionAttempt(answer, playerIndex = state?.active) {
    if (!state || pendingResolutionAttempt || narrationBarrier || !Number.isInteger(playerIndex) || !state.players[playerIndex]) return false;
    if (voice?.isEnabled() === false) {
      act(() => engine.solve(state, answer, playerIndex));
      return true;
    }
    const player = state.players[playerIndex];
    const presentation = capturePresentationState();
    presentation.message = `${player.name} ha pulsado para resolver.`;
    pendingResolutionAttempt = { answer, playerIndex };
    beginNarrationBarrier(presentation);
    render(presentation.message);
    voice.play(resolutionAttemptVoice(player, playerIndex));
    if (!voice.isSpeaking()) {
      pendingResolutionAttempt = null;
      releaseNarrationBarrier(false);
      act(() => engine.solve(state, answer, playerIndex));
    }
    return true;
  }

  function cpuAttemptsSolution(player, forced = false) {
    const profile = player.cpuProfile || AletheiaGame.defaultCpuProfile;
    const progress = puzzleProgress();
    const confidence = progress * .7 + (profile.conocimiento + cpuStrength(player)) / 100 * .22 + profile.impulsividad / 100 * .08;
    if (!forced && (progress < .45 || Math.random() > Math.max(0, (confidence - .48) * 1.35))) return false;
    const correctChance = Math.min(.97, .18 + progress * .57 + (profile.conocimiento + cpuStrength(player)) / 100 * .25);
    const answer = Math.random() < correctChance ? state.puzzle.solution : "RESPUESTA INCORRECTA";
    stageResolutionAttempt(answer, state.active);
    return true;
  }

  function runCpuTurn() {
    if (gamePaused || narrationBarrier || !state || !state.players[state.active]?.cpu || state.phase === "ROUND_COMPLETE" || state.phase === "GAME_COMPLETE") return;
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
      const candidates = state.players.map((candidate, index) => ({ candidate, index })).filter(entry => entry.candidate.cpu);
      const entry = candidates[Math.floor(Math.random() * candidates.length)];
      if (!entry) return;
      const knowsAnswer = Math.random() * 100 < (entry.candidate.cpuProfile?.conocimiento || 50);
      const option = knowsAnswer ? state.question.correct : Math.floor(Math.random() * state.question.options.length);
      act(() => engine.answerQuestion(state, option, entry.index));
      return;
    }
    if (state.phase === "FINAL_PICK") {
      const wantVowel = state.final.consonants >= 3;
      const letter = pickCpuFinalLetter(player, wantVowel);
      if (letter) act(() => engine.finalLetter(state, letter));
      return;
    }
    if (state.phase === "FINAL_SOLVE") {
      const progress = puzzleProgress();
      const success = Math.random() * 100 < Math.min(94, profile.conocimiento * .65 + progress * 45);
      stageResolutionAttempt(success ? state.puzzle.solution : "RESPUESTA INCORRECTA", state.active);
      return;
    }
    if (state.phase === "SPECIAL_LETTER") {
      // CRONO es simultáneo: la revelación automática y los intentos de CPU
      // se coordinan desde scheduleSpecialReveal, no mediante el turno activo.
      return;
    }
    if (state.phase === "SPECIAL_SOLVE") {
      const positionsSeen = state.special?.type === "WORD" ? Number(state.special.reveals || 0) : Number(state.puzzle.revealedPositions?.length || 0);
      const totalPositions = Math.max(1, [...AletheiaGame.normalize(state.puzzle.solution)].filter(char => /^\p{L}$/u.test(char)).length);
      const success = Math.random() * 100 < Math.min(96, profile.conocimiento * .55 + positionsSeen / totalPositions * 55);
      stageResolutionAttempt(success ? state.puzzle.solution : "RESPUESTA INCORRECTA", state.active);
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
    if (initialDrawPhase !== "done" || gamePaused || narrationBarrier || !state || Date.now() < speedIntroUntil || (state.phase !== "QUESTION_BONUS" && !state.players[state.active]?.cpu) || ["ROUND_COMPLETE", "CATEGORY_RESULT", "QUESTION_SELECTION", "QUESTION_RESULT", "FINAL_READY", "GAME_COMPLETE"].includes(state.phase)) return;
    const player = state.phase === "QUESTION_BONUS" ? state.players.find(candidate => candidate.cpu) || state.players[state.active] : state.players[state.active];
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
    clearTimeout(cpuTimer); clearTimeout(clockTimer); clearTimeout(speedTimer); clearTimeout(speedIntroTimer); clearTimeout(finalResultHoldTimer);
    clearTimeout(roundIntroTimer); clearTimeout(interactionUnlockTimer); clearTimeout(challengeUnlockTimer);
    clearTimeout(categoryResultTimer); clearTimeout(questionSelectionTimer); clearTimeout(questionResultTimer);
    clearInitialDrawTimers(); initialDrawPhase = "idle"; initialDrawHighlight = 0;
    gamePaused = false; renderedPhase = null; introducedRound = 0; roundIntroUntil = 0; interactionLockedUntil = 0; transientWheelOutcome = null;
    explainedVoiceModes.clear(); announcedCategoryRound = 0; announcedQuestionRound = 0; announcedFinal = false;
    chronoWarningRound = 0; chronoTenSecondRound = 0; chronoHeldRemaining = 0;
    introVoicePending = false; introVoiceLockUntil = 0; challengeVoicePending = false; finalVoicePending = false; finalVoiceLockUntil = 0; finalSolveArmed = false; finalSolveInputFocused = false; finalResultHoldUntil = 0; finalResultHoldTimer = null; narrationSnapshot = null; narrationBarrier = false; narrationLockUntil = 0; pendingResolutionAttempt = null;
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
    $("setup-panel").hidden = true; $("game-panel").hidden = false;
    voice?.startMusic();
    voice?.playEffect("prometeo-aparece");
    voice?.playEffect("ronda-inicio");
    $("game-clock").hidden = !timedGame;
    resetActionClock();
    startInitialDraw();
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
    const spinningSlot = state.active + 1;
    interactionLockedUntil = Date.now() + 2300;
    cpuNotBefore = interactionLockedUntil;
    act(() => engine.spin(state));
    if (state.events.length === previousEvents || !state.lastSpin) return;
    const { index, result } = state.lastSpin;
    const normalizedResult = String(result).toUpperCase();
    const nextPlayer = state.players[state.active].name;
    transientWheelOutcome = { result: String(result), playerName: spinningPlayer, playerSlot: spinningSlot };
    transientMessage = normalizedResult.includes("PIERDE")
      ? `${spinningPlayer} pierde el turno. Ahora juega ${nextPlayer}.`
      : normalizedResult.includes("QUIEBRA") || normalizedResult.includes("BANCARROTA")
        ? `${spinningPlayer} cae en quiebra. Ahora juega ${nextPlayer}.`
        : normalizedResult.includes("COMODÍN")
          ? `${spinningPlayer} obtiene el comodín. Debe elegir una consonante.`
          : `${spinningPlayer} obtiene ${result}. Debe elegir una consonante.`;
    transientMessageUntil = interactionLockedUntil;
    clearTimeout(interactionUnlockTimer);
    interactionUnlockTimer = setTimeout(() => { transientWheelOutcome = null; render(); }, 2320);
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
  function stopSpeedForPlayer(playerIndex) {
    if (!state || gamePaused || narrationBarrier || Date.now() < speedIntroUntil) return false;
    try {
      const presentationBefore = capturePresentationState();
      clearTimeout(speedTimer);
      state = engine.stopSpeed(state, playerIndex);
      beginNarrationBarrier(presentationBefore);
      resetActionClock();
      render(`${state.players[playerIndex].name} ha detenido el panel. Tiene 30 segundos para resolver.`);
      voice?.play([playerIdentityVoice(state.players[playerIndex], playerIndex), "evento-detiene-panel", "velocidad-escribe"]);
      if (narrationBarrier && !voice?.isSpeaking()) releaseNarrationBarrier();
      return true;
    } catch (error) {
      render(error.message);
      return false;
    }
  }
  function stopChronoForPlayer(playerIndex) {
    if (!state || gamePaused || narrationBarrier || state.phase !== "SPECIAL_LETTER") return false;
    try {
      const presentationBefore = capturePresentationState();
      state = engine.stopChrono(state, playerIndex);
      beginNarrationBarrier(presentationBefore);
      render(`${state.players[playerIndex].name} ha detenido el panel. Escribe la solución.`);
      voice?.play([playerIdentityVoice(state.players[playerIndex], playerIndex), state.special?.type === "WORD" ? "evento-detiene-panel" : "evento-detiene-crono", "velocidad-escribe"]);
      if (narrationBarrier && !voice?.isSpeaking()) releaseNarrationBarrier();
      return true;
    } catch (error) {
      render(error.message);
      return false;
    }
  }
  function armFinalSolve() {
    if (!state || state.phase !== "FINAL_SOLVE" || finalSolveArmed || state.players[state.active]?.cpu || gamePaused || Date.now() < interactionLockedUntil) return false;
    finalSolveArmed = true;
    finalSolveInputFocused = false;
    clearTimeout(clockTimer);
    voice?.stopLoop("reloj");
    actionTimeRemaining = 30000;
    actionDeadline = Date.now() + actionTimeRemaining;
    render("Tiempo detenido. Escribe la solución: dispones de 30 segundos.");
    updateClock();
    return true;
  }
  $("spin").addEventListener("click", performSpin);
  $("scoreboard").addEventListener("click", event => {
    const button = event.target.closest("[data-speed-buzz-index],[data-chrono-buzz-index]");
    if (!button) return;
    button.disabled = true;
    if (button.dataset.chronoBuzzIndex !== undefined) stopChronoForPlayer(Number(button.dataset.chronoBuzzIndex));
    else stopSpeedForPlayer(Number(button.dataset.speedBuzzIndex));
  });
  $("solve-form").addEventListener("submit", event => {
    event.preventDefault();
    if (state.phase === "FINAL_SOLVE" && !finalSolveArmed) {
      armFinalSolve();
      return;
    }
    const answer = $("solution").value;
    if (!answer.trim()) return;
    $("solution").value = "";
    voice?.playEffect("publico-expectacion");
    stageResolutionAttempt(answer, state.active);
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
    if (answer) {
      const humanIndex = state.players.findIndex(player => !player.cpu);
      act(() => engine.answerQuestion(state, Number(answer.dataset.questionChoice), humanIndex < 0 ? state.active : humanIndex));
    }
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
    if (initialDrawPhase !== "done") { remoteAck(slot, seq, false, "El sorteo inicial todavía está en curso."); return; }
    if (narrationBarrier) { remoteAck(slot, seq, false, "Prometeo todavía está explicando la jugada."); return; }
    if (type === "next") {
      const winner = state.roundWinner == null ? null : state.players[state.roundWinner];
      const controller = state.players[slot - 1];
      const allowedController = state.special?.noWinner ? controller && !controller.cpu : winner?.cpu ? controller && !controller.cpu : slot === state.roundWinner + 1;
      const allowed = allowedController && ["ROUND_COMPLETE", "FINAL_READY"].includes(state.phase);
      if (!allowed) { remoteAck(slot, seq, false, "Este mando no puede continuar la ronda."); return; }
      advanceRound(); remoteAck(slot, seq, true, "Preparando el siguiente panel."); return;
    }
    if (type === "category") {
      if (slot !== state.active + 1 || state.phase !== "CATEGORY_CHOICE" || !state.categoryChoices.includes(event.detail?.value)) { remoteAck(slot, seq, false, "Esa categoría no está disponible."); return; }
      act(() => engine.chooseCategory(state, event.detail.value)); remoteAck(slot, seq, true, `Categoría ${event.detail.value} seleccionada.`); return;
    }
    if (type === "question") {
      const option = Number(event.detail?.value);
      const claimSlot = Number(event.detail?.claimSlot || 0);
      if ((claimSlot && claimSlot !== slot) || state.phase !== "QUESTION_BONUS" || Date.now() < challengeReadyAt || state.players[slot - 1]?.cpu || !Number.isInteger(option) || option < 0 || option >= state.question.options.length) { remoteAck(slot, seq, false, claimSlot && claimSlot !== slot ? "Otro concursante se ha adelantado." : "Esa respuesta todavía no está disponible."); return; }
      act(() => engine.answerQuestion(state, option, slot - 1)); remoteAck(slot, seq, true, "Respuesta registrada."); return;
    }
    if (type === "buzz") {
      const playerIndex = slot - 1;
      if (!engine.canStopSpeed(state, playerIndex) || Date.now() < speedIntroUntil) { remoteAck(slot, seq, false, "El pulsador no está disponible ahora."); return; }
      const accepted = stopSpeedForPlayer(playerIndex);
      remoteAck(slot, seq, accepted, accepted ? "Has detenido el panel. Tienes 30 segundos para escribir la solución." : "Otro jugador se ha adelantado.");
      return;
    }
    if (type === "chrono-buzz") {
      const playerIndex = slot - 1;
      const accepted = engine.canStopChrono(state, playerIndex) && stopChronoForPlayer(playerIndex);
      remoteAck(slot, seq, accepted, accepted ? "Has detenido el panel. Escribe la solución." : "Otro concursante se ha adelantado o ya no puedes participar en este panel.");
      return;
    }
    if (type === "final-buzz") {
      const accepted = slot === state.active + 1 && armFinalSolve();
      remoteAck(slot, seq, accepted, accepted ? "Tiempo detenido. Dispones de 30 segundos para escribir." : "El pulsador final no está disponible ahora.");
      return;
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
        if (state.phase === "FINAL_PICK") return engine.finalLetter(state, value);
        return vowels.has(value) ? engine.buyVowel(state, value) : engine.letter(state, value);
      });
      const accepted = state.events.length > beforeEvents;
      remoteAck(slot, seq, accepted, accepted ? state.events[state.events.length - 1].detail : "Esa letra no está disponible ahora.");
      return;
    }
    if (type === "solve" && value.trim()) {
      const playerIndex = slot - 1;
      const accepted = playerIndex === state.active && stageResolutionAttempt(value.trim(), playerIndex);
      remoteAck(slot, seq, accepted, accepted ? "Respuesta recibida. Prometeo anunciará el intento antes de comprobarla." : "No se pudo registrar la respuesta.");
      return;
    }
    if (type === "pass" && typeof engine.yieldTurn === "function") { act(() => engine.yieldTurn(state)); remoteAck(slot,seq,true,"Turno cedido."); return; }
    remoteAck(slot, seq, false, "La acción no está disponible.");
  });
  window.addEventListener("aletheia:remote-presence", event => {
    if (!state || $("game-panel").hidden || state.phase === "GAME_COMPLETE" || event.detail?.connected !== false || gamePaused) return;
    setGamePaused(true);
    $("message").textContent = `La plaza ${event.detail.slot} ha perdido la conexión. La partida queda en pausa.`;
    voice?.play("mando-desconectado");
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
    if (withSound) startPrometeoSpokenWelcome();
    else startPrometeoWelcome();
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
