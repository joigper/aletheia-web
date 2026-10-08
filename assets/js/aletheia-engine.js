(function (global) {
  "use strict";

  const SLOT_IDS = ["slot-1", "slot-2", "slot-3"];
  // Réplica provisional de la ruleta de referencia facilitada: 24 gajos.
  const wheel = [200,"QUIEBRA",150,75,50,150,100,"PIERDE TURNO",25,100,75,50,25,"COMODÍN",25,75,25,50,75,"PIERDE TURNO",50,25,75,50];
  const VOWEL_PRICE = 50;
  const VOWELS = new Set(["A", "E", "I", "O", "U"]);
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
    pickPuzzle(excludedIds = []) {
      const library = Array.isArray(global.aletheiaPaneles)
        ? global.aletheiaPaneles.filter(panel => panel.id && panel.categoria && panel.solucion)
        : [];
      if (!library.length) {
        return { id: "fallback", categoria: "ALÉTHEIA", pista: "Una nave que busca la verdad", solucion: "ALÉTHEIA" };
      }
      const excluded = new Set(excludedIds);
      const available = library.filter(panel => !excluded.has(panel.id));
      const pool = available.length ? available : library;
      return pool[Math.floor(this.random() * pool.length)];
    }
    create(alias, selectedRivals, extraSlots, primaryAvatar = null) {
      const cpu = Array.isArray(selectedRivals) && selectedRivals.length === 2
        ? selectedRivals
        : this.pickRivals(2);
      const configuredSlots = Array.isArray(extraSlots) && extraSlots.length === 2
        ? extraSlots
        : cpu.map(person => ({ cpu: true, person }));
      const selectedPuzzle = this.pickPuzzle();
      return {
        phase: "AWAITING_SPIN", active: 0, round: 1, maxRounds: 5, pending: null, lastSpin: null,
        players: [
          { id: "human", name: alias || "Invitado", cpu: false, image: primaryAvatar?.image || null, role: primaryAvatar?.name ? `Avatar · ${primaryAvatar.name}` : "Concursante" },
          ...configuredSlots.map((slot, index) => {
            if (!slot.cpu) return { id: `human-${index + 2}`, name: slot.alias || `Invitado ${index + 2}`, cpu: false, image: slot.avatar?.image || null, role: slot.avatar?.name ? `Avatar · ${slot.avatar.name}` : "Concursante" };
            const person = slot.person || cpu[index];
            return { id: person.id, name: `${person.nombre} ${person.apellidos || ""}`.trim(), cpu: true, image: `assets/img/${person.imagen}`, role: person.cargo, cpuProfile: cpuProfile(person) };
          })
        ].map((player, i) => ({ ...player, slotId: SLOT_IDS[i], round: 0, total: 0, wildcards: 0 })),
        puzzle: {
          id: selectedPuzzle.id,
          category: selectedPuzzle.categoria,
          clue: selectedPuzzle.pista || "",
          solution: selectedPuzzle.solucion,
          revealed: []
        },
        usedPuzzleIds: [selectedPuzzle.id],
        roundWinner: null,
        events: [{ type: "PARTIDA INICIADA", detail: "Tres plazas preparadas" }]
      };
    }
    spin(state) {
      if (state.phase !== "AWAITING_SPIN") throw new Error("Ahora debes elegir una letra.");
      if (!this.hasAvailableConsonants(state)) throw new Error("No quedan consonantes: compra una vocal, resuelve o pasa el turno.");
      const index = Math.floor(this.random() * 24), result = wheel[index];
      state.lastSpin = { index, result };
      state.events.push({ type: "RULETA", detail: String(result) });
      if (result === "PIERDE TURNO") return this.pass(state, "Pierde turno");
      if (result === "QUIEBRA" || result === "BANCARROTA") { state.players[state.active].round = 0; return this.pass(state, "Quiebra"); }
      if (result === "COMODÍN") { state.pending = result; state.phase = "AWAITING_LETTER"; return state; }
      state.pending = result; state.phase = "AWAITING_LETTER"; return state;
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
      state.players[state.active].round += award;
      if (isWildcard && count) state.players[state.active].wildcards += 1;
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
      return this.pass(state, "Turno cedido por el jugador");
    }
    solve(state, answer) {
      if (state.phase === "ROUND_COMPLETE" || state.phase === "GAME_COMPLETE") throw new Error("La ronda ya ha terminado.");
      const correct = normalize(answer) === normalize(state.puzzle.solution);
      state.events.push({ type: "RESOLUCIÓN", detail: correct ? "Correcta" : "Incorrecta" });
      if (!correct) return this.pass(state, "Respuesta incorrecta");
      return this.completeRound(state, "Panel resuelto");
    }
    completeRound(state, reason) {
      const winner = state.players[state.active];
      const consolidated = winner.round;
      winner.total += consolidated;
      state.roundWinner = state.active;
      state.events.push({ type: "RONDA GANADA", detail: `${winner.name}: +${consolidated} al total · ${reason}` });
      state.players.forEach(player => { player.round = 0; });
      state.phase = state.round >= state.maxRounds ? "GAME_COMPLETE" : "ROUND_COMPLETE";
      state.pending = null; return state;
    }
    nextRound(state) {
      if (state.phase !== "ROUND_COMPLETE") throw new Error("La ronda actual todavía no ha terminado.");
      const selectedPuzzle = this.pickPuzzle(state.usedPuzzleIds);
      state.round += 1;
      state.active = state.roundWinner;
      state.roundWinner = null;
      state.pending = null;
      state.lastSpin = null;
      state.puzzle = {
        id: selectedPuzzle.id,
        category: selectedPuzzle.categoria,
        clue: selectedPuzzle.pista || "",
        solution: selectedPuzzle.solucion,
        revealed: []
      };
      state.usedPuzzleIds.push(selectedPuzzle.id);
      state.phase = "AWAITING_SPIN";
      state.events.push({ type: "NUEVA RONDA", detail: `Ronda ${state.round} de ${state.maxRounds}` });
      return state;
    }
    pass(state, reason) {
      state.active = (state.active + 1) % 3; state.phase = "AWAITING_SPIN"; state.pending = null;
      state.events.push({ type: "CAMBIO DE TURNO", detail: reason }); return state;
    }
  }

  global.AletheiaGame = { Engine, normalize, wheel: Object.freeze([...wheel]), vowelPrice: VOWEL_PRICE, defaultCpuProfile: DEFAULT_CPU_PROFILE };
})(window);
