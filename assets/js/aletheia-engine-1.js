(function (global) {
  "use strict";

  const SLOT_IDS = ["slot-1", "slot-2", "slot-3"];
  // Réplica provisional de la ruleta de referencia facilitada: 24 gajos.
  const wheel = [200,"QUIEBRA",150,75,50,150,100,"PIERDE TURNO",25,100,75,50,25,"COMODÍN",25,75,25,50,75,"PIERDE TURNO",50,25,75,50];
  const VOWEL_PRICE = 50;
  const VOWELS = new Set(["A", "E", "I", "O", "U"]);
  const ROUND_MODES = ["NORMAL", "CHOOSE", "SPECIAL", "NORMAL", "QUESTION"];
  const SPECIAL_PRIZE = 300;
  const QUESTION_BONUS = 100;
  const FINAL_PRIZE = 500;
  // Provisional hasta trasladar esta decisión a personaje.juego.seleccionable.
  const excludedCpuIds = new Set(["oscar"]);
  const DEFAULT_CPU_PROFILE = Object.freeze({
    conocimiento: 50,
    precision: 55,
    rapidez: 50,
    impulsividad: 35,
    riesgo: 50,
    variabilidad: 25,
    fortalezas: []
  });

  function clampParameter(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : fallback;
  }

  function cpuProfile(person) {
    const game = person?.juego || {};
    return {
      conocimiento: clampParameter(game.conocimiento, DEFAULT_CPU_PROFILE.conocimiento),
      precision: clampParameter(game.precision, DEFAULT_CPU_PROFILE.precision),
      rapidez: clampParameter(game.rapidez, DEFAULT_CPU_PROFILE.rapidez),
      impulsividad: clampParameter(game.impulsividad, DEFAULT_CPU_PROFILE.impulsividad),
      riesgo: clampParameter(game.riesgo, DEFAULT_CPU_PROFILE.riesgo),
      variabilidad: clampParameter(game.variabilidad, DEFAULT_CPU_PROFILE.variabilidad),
      fortalezas: Array.isArray(game.fortalezas) ? game.fortalezas.map(value => normalize(value)) : []
    };
  }

  function normalize(value) {
    return value.toLocaleUpperCase("es").normalize("NFD").replace(/N\u0303/g, "\uE000")
      .replace(/\p{Diacritic}/gu, "").replace(/\uE000/g, "Ñ")
      .replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
  }

  class Engine {
    constructor(random = Math.random) { this.random = random; }
    getRoster() {
      return Array.isArray(global.personajes)
        ? global.personajes.filter(person =>
            person.retratoDisponible &&
            person.nombre &&
            person.imagen &&
            !excludedCpuIds.has(person.id) &&
            person.juego?.seleccionable !== false
          )
        : [];
    }
    pickRivals(count = 2, excludedIds = []) {
      const excluded = new Set(excludedIds);
      const roster = this.getRoster().filter(person => !excluded.has(person.id));
      const shuffled = [...roster];
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(this.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const cpu = shuffled.slice(0, count);
      const fallback = [
        { id: "cpu-andrei", nombre: "Andrei", apellidos: "", imagen: "ANDRE.jpg", cargo: "Tripulación" },
        { id: "cpu-dunia", nombre: "Dunia", apellidos: "", imagen: "ANNA.jpg", cargo: "Tripulación" }
      ];
      while (cpu.length < count) cpu.push(fallback[cpu.length]);
      return cpu;
    }
    pickPuzzle(excludedIds = [], excludedCategories = [], requiredCategory = null, excludedSolutions = []) {
      const library = Array.isArray(global.aletheiaPaneles)
        ? global.aletheiaPaneles.filter(panel => panel.id && panel.categoria && panel.solucion)
        : [];
      if (!library.length) {
        return { id: "fallback", categoria: "ALÉTHEIA", pista: "Una nave que busca la verdad", solucion: "ALÉTHEIA" };
      }
      const excluded = new Set(excludedIds);
      const excludedCategorySet = new Set(excludedCategories);
      const excludedSolutionSet = new Set(excludedSolutions.map(normalize));
      const unused = library.filter(panel =>
        !excluded.has(panel.id) &&
        !excludedSolutionSet.has(normalize(panel.solucion))
      );
      const requested = requiredCategory
        ? unused.filter(panel => panel.categoria === requiredCategory)
        : unused.filter(panel => !excludedCategorySet.has(panel.categoria));
      const eligible = requested.length ? requested : unused;
      // Una misma solución puede existir en varios lotes. Para que no tenga más
      // probabilidades por estar duplicada, solo participa una vez en el sorteo.
      const uniqueSolutions = new Map();
      eligible.forEach(panel => {
        const solution = normalize(panel.solucion);
        if (!uniqueSolutions.has(solution)) uniqueSolutions.set(solution, panel);
      });
      const pool = [...uniqueSolutions.values()];
      const selected = pool[Math.floor(this.random() * pool.length)];
      return selected;
    }
    categoryChoices(state, count = 2) {
      const used = new Set(state.usedPuzzleCategories || []);
      const categories = [...new Set((global.aletheiaPaneles || [])
        .filter(panel => panel && panel.categoria && panel.solucion)
        .map(panel => panel.categoria))]
        .filter(category => !used.has(category));
      const shuffled = [...categories];
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(this.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, count);
    }
    pickQuestion() {
      const questions = Array.isArray(global.aletheiaPreguntas) ? global.aletheiaPreguntas : [];
      const fallback = { pregunta: "¿Cuál es el planeta rojo?", opciones: ["Marte", "Venus", "Júpiter"], correcta: 0 };
      const selected = questions.length ? questions[Math.floor(this.random() * questions.length)] : fallback;
      const paired = selected.opciones.map((option, index) => ({ option, correct: index === selected.correcta }));
      for (let i = paired.length - 1; i > 0; i -= 1) {
        const j = Math.floor(this.random() * (i + 1));
        [paired[i], paired[j]] = [paired[j], paired[i]];
      }
      return { text: selected.pregunta, options: paired.map(item => item.option), correct: paired.findIndex(item => item.correct) };
    }
    create(alias, selectedRivals, extraSlots, primaryAvatar = null, options = {}) {
      const cpu = Array.isArray(selectedRivals) && selectedRivals.length === 2
        ? selectedRivals
        : this.pickRivals(2);
      const configuredSlots = Array.isArray(extraSlots) && extraSlots.length === 2
        ? extraSlots
        : cpu.map(person => ({ cpu: true, person }));
      const selectedPuzzle = this.pickPuzzle();
      const requestedModes = Array.isArray(options.roundModes) && options.roundModes.length === 5 ? options.roundModes : ROUND_MODES;
      const roundModes = requestedModes.map(mode => ["NORMAL", "CHOOSE", "SPECIAL", "QUESTION"].includes(mode) ? mode : "NORMAL");
      return {
        phase: "AWAITING_SPIN", active: 0, round: 1, maxRounds: 5, pending: null, lastSpin: null,
        roundModes, roundMode: roundModes[0], specialRotation: this.random() < .5 ? "SPEED" : "CRONO", special: null, categoryChoices: [], selectedCategory: null, question: null, final: null,
        playMode: String(options.playMode || "desktop-local"),
        players: [
          { id: "human", name: alias || "Invitado", cpu: false, image: primaryAvatar?.image || null, role: primaryAvatar?.name ? `Avatar · ${primaryAvatar.name}` : "Concursante" },
          ...configuredSlots.map((slot, index) => {
            if (!slot.cpu) return { id: `human-${index + 2}`, name: slot.alias || `Invitado ${index + 2}`, cpu: false, image: slot.avatar?.image || null, role: slot.avatar?.name ? `Avatar · ${slot.avatar.name}` : "Concursante" };
            const person = slot.person || cpu[index];
            return { id: person.id, name: `${person.nombre} ${person.apellidos || ""}`.trim(), cpu: true, image: `assets/img/${person.imagen}`, role: person.cargo, cpuProfile: cpuProfile(person) };
          })
        ].map((player, i) => ({
          ...player, slotId: SLOT_IDS[i], round: 0, total: 0, wildcards: 0,
          stats: { roundsWon: 0, correctConsonants: 0, incorrectConsonants: 0, vowelsBought: 0, solvedPanels: 0, wrongSolutions: 0, bankruptcies: 0, lostTurns: 0, bestLetter: null, bestLetterAward: 0 }
        })),
        puzzle: {
          id: selectedPuzzle.id,
          category: selectedPuzzle.categoria,
          clue: selectedPuzzle.pista || "",
          solution: selectedPuzzle.solucion,
          revealed: []
        },
        usedPuzzleIds: [selectedPuzzle.id],
        usedPuzzleSolutions: [normalize(selectedPuzzle.solucion)],
        usedPuzzleCategories: [selectedPuzzle.categoria],
        roundWinner: null,
        statistics: { startedAt: 0, endedAt: 0, pausedMs: 0 },
        events: [{ type: "PARTIDA INICIADA", detail: "Tres plazas preparadas" }]
      };
    }
    spin(state) {
      if (state.phase !== "AWAITING_SPIN") throw new Error("Ahora debes elegir una letra.");
      if (!this.hasAvailableConsonants(state)) throw new Error("No quedan consonantes: compra una vocal, resuelve o pasa el turno.");
      const index = Math.floor(this.random() * 24), result = wheel[index];
      state.lastSpin = { index, result };
      state.events.push({ type: "RULETA", detail: String(result) });
      if (result === "PIERDE TURNO") { state.players[state.active].stats.lostTurns += 1; return this.pass(state, "Pierde turno"); }
      if (result === "QUIEBRA" || result === "BANCARROTA") { state.players[state.active].stats.bankruptcies += 1; state.players[state.active].round = 0; return this.pass(state, "Quiebra"); }
      if (result === "COMODÍN") { state.pending = result; state.phase = "AWAITING_LETTER"; return state; }
      state.pending = result; state.phase = "AWAITING_LETTER"; return state;
    }
    specialLetter(state, raw) {
      if (state.phase !== "SPECIAL_LETTER") throw new Error("Esta acción no está disponible ahora.");
      const letter = normalize(raw);
      if (!/^\p{L}$/u.test(letter) || state.puzzle.revealed.includes(letter)) throw new Error("Esa letra no está disponible.");
      const count = [...normalize(state.puzzle.solution)].filter(char => char === letter).length;
      state.puzzle.revealed.push(letter);
      const player = state.players[state.active];
      if (VOWELS.has(letter)) player.stats.vowelsBought += 1;
      else if (count) player.stats.correctConsonants += 1;
      else player.stats.incorrectConsonants += 1;
      state.events.push({ type: "LETRA RÁPIDA", detail: `${letter}: ${count} coincidencia(s)` });
      if (this.isPuzzleComplete(state)) { player.round += SPECIAL_PRIZE; return this.completeRound(state, "Panel con crono completado"); }
      state.active = (state.active + 1) % 3;
      return state;
    }
    revealSpeedLetter(state) {
      if (state.phase !== "SPEED_RUNNING") return state;
      const available = [...new Set([...normalize(state.puzzle.solution)].filter(char => /^\p{L}$/u.test(char) && !state.puzzle.revealed.includes(char)))];
      if (!available.length) { state.phase = "SPEED_SOLVE"; return state; }
      const letter = available[Math.floor(this.random() * available.length)];
      state.puzzle.revealed.push(letter);
      state.special.reveals += 1;
      state.special.prize = Math.max(50, SPECIAL_PRIZE - state.special.reveals * 25);
      state.active = (state.active + 1) % 3;
      state.events.push({ type: "VELOCIDAD", detail: `${letter} revelada · premio ${state.special.prize}` });
      if (this.isPuzzleComplete(state)) state.phase = "SPEED_SOLVE";
      return state;
    }
    letter(state, raw) {
      if (state.phase !== "AWAITING_LETTER") throw new Error("Primero debes girar la ruleta.");
      const letter = normalize(raw);
      if (!/^\p{L}$/u.test(letter) || state.puzzle.revealed.includes(letter)) throw new Error("Esa letra no está disponible.");
      if (VOWELS.has(letter)) throw new Error("Las vocales no se eligen después de girar: se compran por 50.");
      const count = [...normalize(state.puzzle.solution)].filter(char => char === letter).length;
      state.puzzle.revealed.push(letter);
      const isWildcard = state.pending === "COMODÍN";
      const award = isWildcard ? 0 : count * state.pending;
      const player = state.players[state.active];
      player.round += award;
      if (count) player.stats.correctConsonants += 1;
      else player.stats.incorrectConsonants += 1;
      if (award > player.stats.bestLetterAward) { player.stats.bestLetter = letter; player.stats.bestLetterAward = award; }
      if (isWildcard && count) player.wildcards += 1;
      state.events.push({ type: "LETRA", detail: isWildcard && count ? `${letter}: ${count} coincidencia(s), comodín conseguido` : `${letter}: ${count} coincidencia(s), +${award}` });
      state.pending = null;
      if (!count) return this.pass(state, "La letra no aparece");
      if (this.isPuzzleComplete(state)) return this.completeRound(state, "Última letra descubierta");
      state.phase = "AWAITING_SPIN"; return state;
    }
    buyVowel(state, raw) {
      if (state.phase !== "AWAITING_SPIN") throw new Error("Las vocales se compran antes de girar.");
      const vowel = normalize(raw);
      if (!VOWELS.has(vowel) || state.puzzle.revealed.includes(vowel)) throw new Error("Esa vocal no está disponible.");
      const player = state.players[state.active];
      if (player.round < VOWEL_PRICE) throw new Error(`Necesitas ${VOWEL_PRICE} para comprar una vocal.`);
      player.stats.vowelsBought += 1;
      player.round -= VOWEL_PRICE;
      const count = [...normalize(state.puzzle.solution)].filter(char => char === vowel).length;
      state.puzzle.revealed.push(vowel);
      state.events.push({ type: "VOCAL", detail: `${vowel}: coste ${VOWEL_PRICE}, ${count} coincidencia(s)` });
      if (!count) return this.pass(state, "La vocal no aparece");
      if (this.isPuzzleComplete(state)) return this.completeRound(state, "Última letra descubierta");
      return state;
    }
    isPuzzleComplete(state) {
      const revealed = new Set(state.puzzle.revealed);
      return [...normalize(state.puzzle.solution)].filter(char => /^\p{L}$/u.test(char)).every(char => revealed.has(char));
    }
    hasAvailableConsonants(state) {
      const revealed = new Set(state.puzzle.revealed);
      return [...new Set([...normalize(state.puzzle.solution)].filter(char => /^\p{L}$/u.test(char) && !VOWELS.has(char)))]
        .some(letter => !revealed.has(letter));
    }
    yieldTurn(state) {
      if (state.phase === "ROUND_COMPLETE" || state.phase === "GAME_COMPLETE") throw new Error("La ronda ya ha terminado.");
      if (state.phase === "SPECIAL_LETTER" || state.phase === "SPEED_RUNNING") {
        state.active = (state.active + 1) % 3;
        state.events.push({ type: "CAMBIO DE TURNO", detail: "Turno cedido durante la prueba" });
        return state;
      }
      return this.pass(state, "Turno cedido por el jugador");
    }
    solve(state, answer, solverIndex = state.active) {
      if (state.phase === "ROUND_COMPLETE" || state.phase === "GAME_COMPLETE") throw new Error("La ronda ya ha terminado.");
      const speedRound = state.phase === "SPEED_RUNNING" || state.phase === "SPEED_SOLVE";
      const validSolver = Number.isInteger(solverIndex) && solverIndex >= 0 && solverIndex < state.players.length ? solverIndex : state.active;
      const outOfTurnSpeedAttempt = speedRound && validSolver !== state.active;
      const correct = normalize(answer) === normalize(state.puzzle.solution);
      state.events.push({ type: "RESOLUCIÓN", detail: correct ? "Correcta" : "Incorrecta" });
      if (state.phase === "FINAL_SOLVE") return this.finishFinal(state, correct);
      if (!correct) {
        state.players[validSolver].stats.wrongSolutions += 1;
        if (state.phase === "SPECIAL_LETTER" || speedRound) {
          if (!outOfTurnSpeedAttempt) state.active = (state.active + 1) % 3;
          return state;
        }
        return this.pass(state, "Respuesta incorrecta");
      }
      if (speedRound) state.active = validSolver;
      state.players[state.active].stats.solvedPanels += 1;
      if (state.phase === "SPECIAL_LETTER") state.players[state.active].round += SPECIAL_PRIZE;
      if (state.phase === "SPEED_RUNNING" || state.phase === "SPEED_SOLVE") state.players[state.active].round += state.special.prize;
      return this.completeRound(state, "Panel resuelto");
    }
    completeRound(state, reason) {
      const winner = state.players[state.active];
      const consolidated = winner.round;
      winner.total += consolidated;
      winner.stats.roundsWon += 1;
      state.roundWinner = state.active;
      state.events.push({ type: "RONDA GANADA", detail: `${winner.name}: +${consolidated} al total · ${reason}` });
      state.players.forEach(player => { player.round = 0; });
      if (state.round >= state.maxRounds) {
        if (state.roundMode === "QUESTION") {
          state.question = this.pickQuestion();
          state.phase = "QUESTION_BONUS";
        } else state.phase = "FINAL_READY";
      } else state.phase = "ROUND_COMPLETE";
      state.pending = null; return state;
    }
    nextRound(state) {
      if (state.phase === "FINAL_READY") return this.startFinal(state);
      if (state.phase !== "ROUND_COMPLETE") throw new Error("La ronda actual todavía no ha terminado.");
      const usedCategories = Array.isArray(state.usedPuzzleCategories)
        ? state.usedPuzzleCategories
        : [state.puzzle.category];
      state.round += 1;
      state.active = state.roundWinner;
      state.roundWinner = null;
      state.pending = null;
      state.lastSpin = null;
      state.roundMode = state.roundModes[state.round - 1];
      if (state.roundMode === "CHOOSE") {
        state.categoryChoices = this.categoryChoices(state);
        state.phase = "CATEGORY_CHOICE";
        state.events.push({ type: "TÚ ELIGES", detail: "Elige la categoría del siguiente panel" });
        return state;
      }
      return this.startRound(state, usedCategories);
    }
    chooseCategory(state, category) {
      if (state.phase !== "CATEGORY_CHOICE" || !state.categoryChoices.includes(category)) throw new Error("Esa categoría no está disponible.");
      state.selectedCategory = category;
      state.phase = "CATEGORY_RESULT";
      state.events.push({ type: "CATEGORÍA ELEGIDA", detail: `${state.players[state.active].name}: ${category}` });
      return state;
    }
    continueCategory(state) {
      if (state.phase !== "CATEGORY_RESULT" || !state.selectedCategory) return state;
      return this.startRound(state, state.usedPuzzleCategories, state.selectedCategory);
    }
    startRound(state, usedCategories, category = null) {
      const selectedPuzzle = this.pickPuzzle(state.usedPuzzleIds, usedCategories, category, state.usedPuzzleSolutions);
      state.puzzle = {
        id: selectedPuzzle.id,
        category: selectedPuzzle.categoria,
        clue: selectedPuzzle.pista || "",
        solution: selectedPuzzle.solucion,
        revealed: []
      };
      state.usedPuzzleIds.push(selectedPuzzle.id);
      state.usedPuzzleSolutions.push(normalize(selectedPuzzle.solucion));
      state.usedPuzzleCategories = [...usedCategories, selectedPuzzle.categoria];
      state.categoryChoices = [];
      state.selectedCategory = null;
      state.special = null;
      if (state.roundMode === "SPECIAL") {
        state.special = { type: state.specialRotation, prize: SPECIAL_PRIZE, reveals: 0 };
        state.phase = state.specialRotation === "SPEED" ? "SPEED_RUNNING" : "SPECIAL_LETTER";
      } else state.phase = "AWAITING_SPIN";
      state.events.push({ type: "NUEVA RONDA", detail: `Ronda ${state.round} de ${state.maxRounds} · ${state.roundMode}` });
      return state;
    }
    answerQuestion(state, optionIndex) {
      if (state.phase !== "QUESTION_BONUS") throw new Error("No hay ninguna pregunta activa.");
      const correct = Number(optionIndex) === state.question.correct;
      if (correct) state.players[state.roundWinner].total += QUESTION_BONUS;
      state.question.selected = Number(optionIndex);
      state.question.answered = true;
      state.question.wasCorrect = correct;
      state.events.push({ type: "PREGUNTA", detail: correct ? `Correcta: +${QUESTION_BONUS}` : "Incorrecta" });
      state.phase = "QUESTION_SELECTION";
      return state;
    }
    revealQuestionResult(state) {
      if (state.phase === "QUESTION_SELECTION") state.phase = "QUESTION_RESULT";
      return state;
    }
    continueAfterQuestion(state) {
      if (state.phase !== "QUESTION_RESULT") return state;
      state.phase = "FINAL_READY";
      return state;
    }
    startFinal(state) {
      if (state.phase !== "FINAL_READY") throw new Error("La final todavía no está disponible.");
      const highest = Math.max(...state.players.map(player => player.total));
      const finalists = state.players.map((player, index) => ({ player, index })).filter(entry => entry.player.total === highest)
        .sort((a, b) => b.player.stats.roundsWon - a.player.stats.roundsWon || b.player.stats.solvedPanels - a.player.stats.solvedPanels || b.player.stats.correctConsonants - a.player.stats.correctConsonants || a.index - b.index);
      state.active = finalists[0].index;
      const selectedPuzzle = this.pickPuzzle(state.usedPuzzleIds, state.usedPuzzleCategories, null, state.usedPuzzleSolutions);
      state.puzzle = { id: selectedPuzzle.id, category: selectedPuzzle.categoria, clue: selectedPuzzle.pista || "", solution: selectedPuzzle.solucion, revealed: ["R", "S", "F", "Y", "O"] };
      state.final = { picks: [], consonants: 0, vowels: 0, prize: FINAL_PRIZE, correct: null };
      state.phase = "FINAL_PICK";
      state.events.push({ type: "RULETA FINAL", detail: `${state.players[state.active].name} juega la final` });
      return state;
    }
    finalLetter(state, raw) {
      if (state.phase !== "FINAL_PICK") throw new Error("Ahora no puedes elegir letras para la final.");
      const letter = normalize(raw);
      if (!/^\p{L}$/u.test(letter) || state.puzzle.revealed.includes(letter) || state.final.picks.includes(letter)) throw new Error("Esa letra no está disponible.");
      const vowel = VOWELS.has(letter);
      if (vowel && state.final.vowels >= 1) throw new Error("Ya has elegido la vocal de la final.");
      if (!vowel && state.final.consonants >= 3) throw new Error("Ya has elegido las tres consonantes de la final.");
      state.final.picks.push(letter);
      state.puzzle.revealed.push(letter);
      if (vowel) state.final.vowels += 1; else state.final.consonants += 1;
      state.events.push({ type: "LETRA FINAL", detail: letter });
      if (state.final.vowels === 1 && state.final.consonants === 3) state.phase = "FINAL_SOLVE";
      return state;
    }
    finishFinal(state, correct) {
      state.final.correct = correct;
      if (correct) {
        state.players[state.active].total += state.final.prize;
        state.players[state.active].stats.solvedPanels += 1;
      } else state.players[state.active].stats.wrongSolutions += 1;
      state.events.push({ type: "FINAL", detail: correct ? `Correcta: +${state.final.prize}` : "No resuelta" });
      state.phase = "GAME_COMPLETE";
      return state;
    }
    failFinal(state) {
      if (state.phase !== "FINAL_SOLVE") return state;
      return this.finishFinal(state, false);
    }
    expireSpecial(state) {
      if (state.phase !== "SPECIAL_LETTER") return state;
      state.roundWinner = state.active;
      state.players.forEach(player => { player.round = 0; });
      state.phase = "ROUND_COMPLETE";
      state.events.push({ type: "CRONO", detail: "Tiempo agotado: prueba sin premio" });
      return state;
    }
    pass(state, reason) {
      state.active = (state.active + 1) % 3; state.phase = "AWAITING_SPIN"; state.pending = null;
      state.events.push({ type: "CAMBIO DE TURNO", detail: reason }); return state;
    }
  }

  global.AletheiaGame = { Engine, normalize, wheel: Object.freeze([...wheel]), vowelPrice: VOWEL_PRICE, defaultCpuProfile: DEFAULT_CPU_PROFILE, roundModes: ROUND_MODES, specialPrize: SPECIAL_PRIZE, questionBonus: QUESTION_BONUS, finalPrize: FINAL_PRIZE };
})(window);
