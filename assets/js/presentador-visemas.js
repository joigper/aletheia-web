/* =====================================================================
   presentador-visemas.js
   Lip sync por visemas para el presentador de ALETHEIA.

   - 14 gestos de boca, extraídos de un vídeo del presentador hablando:
     A  reposo / M          P  labios apretados (P, B, V)   R  suelta tras P/B
     B  dientes juntos (S, I, F)      C / C2  E / dientes suaves
     D / D2  A fuerte / suave         E / E2  O fuerte / suave
     F / F2  U fuerte / suave         CH  labios redondeados con dientes (CH, LL, Y)
     L  lengua tras los dientes (L)     FV  labio inferior bajo los dientes (F)
   - Compatibles con las 9 formas de Rhubarb (A–H, X).
   - Se dibujan como parches encima de la imagen o vídeo base, con
     fundido cruzado entre formas.
   - Las formas pueden venir de un JSON de Rhubarb (lo más preciso)
     o generarse a partir del texto de la frase (textoAVisemas).
   ===================================================================== */

class PresentadorVisemas {
  /**
   * @param {HTMLCanvasElement} canvas  donde se dibuja el presentador
   * @param {HTMLImageElement|HTMLVideoElement} base  imagen o vídeo en bucle
   * @param {object} opciones
   */
  constructor(canvas, base, opciones = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.base = base;
    this.op = Object.assign({
      carpeta: 'bocas/',                           // carpeta con boca_A.webp … boca_F.webp
      formato: 'webp',
      refAncho: 1024,                              // ancho de la imagen original
      rect: { x: 298, y: 534, w: 464, h: 461 },    // dónde va el parche (coords. de la imagen original)
      // Cómo pasar de la imagen original a la base. null = misma imagen o mismo
      // encuadre a otro tamaño. Para un vídeo con otro encuadre: { escala, dx, dy }
      encaje: null,
      fundido: 60,                                 // ms de fundido entre bocas
      duracionMinima: 0.055,                       // s: formas más cortas se saltan
      balanceo: false,                             // true: leve giro del canvas al hablar (solo útil con imagen fija)
      // 0 = casi siempre bocas suaves (tranquilo), 1 = muchas bocas fuertes (enérgico)
      expresividad: 0.5,
      biblioteca: null,                            // 'bocas/biblioteca' para el modo con fotogramas intermedios
      fundidoBiblioteca: 40,                       // ms de fundido entre fotogramas de la biblioteca
      velocidadBoca: 0.020,                        // velocidad máxima de la boca (medida en vídeo real)
      escalaRender: 1,                             // resolución interna del canvas (0.5 = mitad)
      soloParche: false,                           // true: el vídeo se muestra detrás y aquí solo se dibuja la boca
      fpsMax: 60                                   // límite de refresco del canvas
    }, opciones);

    this.parches = {};
    this.cues = [];
    this.reloj = null;
    this.idx = 0;
    this.actual = 'A';
    this.previa = 'A';
    this.tCambio = 0;
    this.hablando = false;
    this.intensidad = 0;          // para el balanceo, sube y baja suave
    this.cobertura = 0;           // 1 = parches visibles; 0 = se ve la boca de la base
    this.alTerminar = null;
    this.activo = true;
    this._ultimoDibujo = 0;

    this._bucle = this._bucle.bind(this);
  }

  /** Carga los parches. Llamar (y esperar) antes de usar. Las versiones suaves son opcionales. */
  cargar() {
    if (this.op.biblioteca) return this._cargarBiblioteca();
    const basicas = ['A', 'B', 'C', 'D', 'E', 'F'], suaves = ['P', 'R', 'C2', 'D2', 'E2', 'F2', 'CH', 'L'];
    const promesas = [...basicas, ...suaves].map(f => new Promise((ok, mal) => {
      const img = new Image();
      img.onload = () => { this.parches[f] = img; ok(); };
      img.onerror = () => basicas.includes(f) ? mal(new Error('No se pudo cargar la boca ' + f)) : ok();
      img.src = (this.op.urls && this.op.urls[f]) || `${this.op.carpeta}boca_${f}.${this.op.formato}`;
    }));
    return Promise.all(promesas).then(() => { requestAnimationFrame(this._bucle); return this; });
  }

  /**
   * Modo biblioteca: en vez de 14 imágenes fijas, un atlas con decenas de
   * fotogramas reales del vídeo de referencia. La boca "viaja" de un gesto al
   * siguiente mostrando los fotogramas intermedios que más se parecen.
   * opciones.biblioteca: carpeta+nombre base ('bocas/biblioteca') o
   * { datos: <json>, imagen: <url del atlas> }.
   */
  async _cargarBiblioteca() {
    const b = this.op.biblioteca;
    const datos = typeof b === 'string' ? await (await fetch(b + '.json')).json() : b.datos;
    const atlas = await new Promise((ok, mal) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = () => mal(new Error('No se pudo cargar el atlas de bocas'));
      img.src = typeof b === 'string' ? b + '.webp' : b.imagen;
    });
    // Descomprimir ya el atlas: si no, el navegador lo hace en el primer dibujo y se congela.
    let listo = atlas;
    try { listo = window.createImageBitmap ? await createImageBitmap(atlas) : (await atlas.decode(), atlas); } catch (e) {}
    this.lib = { datos, atlas: listo };
    this.parches = {};
    Object.keys(datos.anclas).forEach(k => { this.parches[k] = true; });   // gestos disponibles
    this.fActual = this.fPrevio = datos.anclas.A;
    this.x = datos.fotogramas[datos.anclas.A].d.slice();
    this.tFrame = 0;
    requestAnimationFrame(this._bucle);
    return this;
  }

  /** Avanza la "posición" de la boca hacia el gesto actual y elige el fotograma real más cercano. */
  _pasoBiblioteca(ahora) {
    const { fotogramas, anclas } = this.lib.datos;
    const dt = Math.min(100, ahora - (this._tPrev || ahora)); this._tPrev = ahora;
    const objetivo = fotogramas[anclas[this.actual] ?? anclas.A].d;
    const tau = Math.max(8, (this.fundidoActual || this.op.fundido) / 2.2);
    const k = 1 - Math.exp(-dt / tau);
    // Paso hacia el objetivo, limitado a la velocidad máxima de una boca real
    // (medida en los vídeos de referencia), para que siempre pase por los intermedios.
    const paso = this.x.map((v, i) => (objetivo[i] - v) * k);
    const norma = Math.hypot(...paso), limite = this.op.velocidadBoca * dt;
    const f = norma > limite ? limite / norma : 1;
    for (let i = 0; i < this.x.length; i++) this.x[i] += paso[i] * f;
    const vAct = fotogramas[this.fActual].v;
    let mejor = this.fActual, coste = Infinity;
    for (let j = 0; j < fotogramas.length; j++) {
      const d = fotogramas[j].d; let c = 0;
      for (let i = 0; i < d.length; i++) { const z = d[i] - this.x[i]; c += z * z; }
      if (j === this.fActual) c -= 0.03;                          // estabilidad: no titubear
      else if (Math.abs(fotogramas[j].v - vAct) <= 2) c -= 0.015;  // preferir fotogramas seguidos del vídeo
      if (c < coste) { coste = c; mejor = j; }
    }
    if (mejor !== this.fActual) { this.fPrevio = this.fActual; this.fActual = mejor; this.tFrame = ahora; }
  }

  _dibujarFotograma(j, x, y, w, h) {
    const { datos, atlas } = this.lib, t = datos.tile;
    const sx = (j % datos.cols) * t.w, sy = Math.floor(j / datos.cols) * t.h;
    this.ctx.drawImage(atlas, sx, sy, t.w, t.h, x, y, w, h);
  }

  /**
   * Reproduce una lista de formas sincronizada con un reloj.
   * @param {Array<{start:number,end:number,value:string}>} cues  tiempos en segundos
   * @param {() => number} reloj  devuelve el tiempo actual en segundos (p. ej. () => audio.currentTime)
   * @param {{alTerminar?:Function, autoFin?:boolean}} extra  autoFin: parar solo al acabar las formas
   */
  reproducir(cues, reloj, { alTerminar = null, autoFin = true } = {}) {
    this.cues = this._articular(this._elegirVariantes(PresentadorVisemas.limpiarCues(cues, this.op.duracionMinima)));
    this.autoFin = autoFin;
    this.reloj = reloj;
    this.idx = 0;
    this.hablando = true;
    this.alTerminar = alTerminar;
  }

  /** Atajo: reproduce un audio con su JSON de Rhubarb. Devuelve el <audio>. */
  reproducirAudio(urlAudio, jsonRhubarb) {
    const audio = new Audio(urlAudio);
    const cues = jsonRhubarb.mouthCues || jsonRhubarb;
    this.reproducir(cues, () => audio.currentTime, { autoFin: false });
    audio.addEventListener('ended', () => this.detener());
    audio.play();
    return audio;
  }

  detener() {
    this.hablando = false;
    this.cues = [];
    this._cambiarA('A');
    if (this.alTerminar) { const f = this.alTerminar; this.alTerminar = null; f(); }
  }

  /** Muestra una forma fija (útil para pruebas). */
  mostrar(forma) { this.hablando = false; this.cues = []; this._cambiarA(forma); }

  /** Detiene el trabajo gráfico cuando el presentador no está visible. */
  establecerActivo(activo) {
    this.activo = !!activo;
    if (this.activo) this._ultimoDibujo = 0;
  }

  // ---------------------------------------------------------------------

  /** Normaliza cues de Rhubarb o de textoAVisemas y elimina formas demasiado cortas. */
  static limpiarCues(cues, minimo = 0.055) {
    const mapa = { X: 'A', G: 'FV' };             // Rhubarb: X reposo; G = F/V (labio bajo los dientes)
    let lista = cues.map(c => ({ start: +c.start, end: +c.end, value: mapa[c.value] || c.value,
                                 fuerte: !!c.fuerte, suave: !!c.suave, oclusiva: c.oclusiva }));
    // Las formas muy breves no llegan a verse en el habla real: se funden con la anterior.
    // Excepción: los cierres (A), que son los que más se notan si faltan.
    const salida = [];
    for (const c of lista) {
      const dur = c.end - c.start;
      const ult = salida[salida.length - 1];
      if (dur < minimo && c.value !== 'A' && ult) { ult.end = c.end; continue; }
      if (ult && ult.value === c.value) {
        ult.end = c.end; ult.fuerte = ult.fuerte || c.fuerte; ult.suave = ult.suave && c.suave;
        if (c.oclusiva !== undefined) ult.oclusiva = c.oclusiva;
        continue;
      }
      salida.push(c);
    }
    return salida;
  }

  /** Decide qué imagen se dibuja en cada forma: la versión fuerte o la suave. */
  _elegirVariantes(cues) {
    const p = this.parches, umbral = 0.30 - 0.20 * this.op.expresividad;   // s
    const o = (fuerte, suave) => (p[suave] ? suave : fuerte);
    return cues.map((c, i) => {
      const dur = c.end - c.start, alterna = (i * 7 + 3) % 3 === 0;
      const larga = dur >= umbral && !c.suave;
      if (c.suave) c = Object.assign({}, c, { fuerte: false });
      let d = c.value;
      switch (c.value) {
        case 'A':   // cierre corto = P/B (labios apretados); largo o M = reposo
          d = (c.oclusiva ?? (dur < 0.15 && i > 0 && i < cues.length - 1)) ? o('A', 'P') : 'A'; break;
        case 'B': d = (c.fuerte || larga || !alterna) ? 'B' : o('B', 'C2'); break;
        case 'C': d = (c.fuerte || larga) ? 'C' : o('C', 'C2'); break;
        case 'D': d = ((c.fuerte && this.op.expresividad >= 0.3) || dur >= umbral + 0.1) ? 'D' : o('D', 'D2'); break;
        case 'E': d = (c.fuerte || larga) ? 'E' : o('E', 'E2'); break;
        case 'F': d = (c.fuerte || larga) ? 'F' : o('F', 'F2'); break;
        case 'H': d = 'C2'; break;                 // Rhubarb H (L): boca media, sin forma propia
        case 'CH': d = o('B', 'CH'); break;
        case 'L': d = o('C', 'L'); break;
        case 'FV': d = o('B', 'FV'); break;     // F: labio inferior bajo los dientes
      }
      return Object.assign({}, c, { dibujo: d });
    });
  }

  /**
   * Convierte las posturas en movimiento:
   *  - Tras un cierre de labios (P, B, M) seguido de vocal, añade la "suelta":
   *    unos milisegundos con los labios apenas separados, el golpe de aire.
   *  - Da a cada transición su velocidad: cerrar labios y soltarlos es muy
   *    rápido; pasar de una vocal a otra es lento y fluido.
   */
  _articular(cues) {
    const ABIERTAS = /^(C|C2|D|D2|E|E2|F|F2|B|CH|L)$/;
    const salida = [];
    cues.forEach((c, i) => {
      const prev = salida[salida.length - 1], sig = cues[i + 1];
      const cue = Object.assign({}, c);
      // Velocidad de entrada a esta forma (ms)
      if (cue.dibujo === 'A' || cue.dibujo === 'P') cue.entrada = 35;  // cierre: rápido
      else if (prev && (prev.dibujo === 'A' || prev.dibujo === 'P')) cue.entrada = 45;   // apertura tras cierre
      else if (prev && /^(C|D|E|F)/.test(prev.dibujo) && /^(C|D|E|F)/.test(cue.dibujo)) cue.entrada = 90; // vocal a vocal
      else cue.entrada = this.op.fundido;
      // Suelta tras una oclusiva (cierre corto seguido de forma abierta)
      const esOclusiva = prev && prev.dibujo === 'P';
      if (esOclusiva && ABIERTAS.test(cue.dibujo) && this.parches.R && (cue.end - cue.start) > 0.07) {
        const suelta = Math.min(0.035, (cue.end - cue.start) * 0.3);
        salida.push({ start: cue.start, end: cue.start + suelta, value: 'A', dibujo: 'R', entrada: 18 });
        cue.start += suelta; cue.entrada = 50;
      }
      salida.push(cue);
    });
    return salida;
  }

  _cambiarA(forma, entrada) {
    if (forma === this.actual) return;
    this.previa = this.actual;
    this.actual = forma;
    this.tCambio = performance.now();
    this.fundidoActual = entrada || this.op.fundido;
  }

  _formaEn(t) {
    const c = this.cues;
    if (!c.length) return null;
    if (this.idx >= c.length || c[this.idx].start > t) this.idx = 0;   // por si el reloj retrocede
    while (this.idx < c.length - 1 && c[this.idx + 1].start <= t) this.idx++;
    const cue = c[this.idx];
    return (t >= cue.start && t < cue.end) ? cue : null;
  }

  _bucle(ahora) {
    if (this.activo && this.hablando && this.reloj) {
      const t = this.reloj();
      const cue = this._formaEn(t);
      this._cambiarA(cue ? cue.dibujo : 'A', cue ? cue.entrada : 35);
      const ultimo = this.cues[this.cues.length - 1];
      if (this.autoFin && ultimo && t > ultimo.end + 0.15) this.detener();
    }
    const intervalo = 1000 / Math.max(1, Number(this.op.fpsMax) || 60);
    if (this.activo && (this._ultimoDibujo === 0 || ahora - this._ultimoDibujo >= intervalo)) {
      this._ultimoDibujo = ahora;
      this._dibujar(ahora);
    }
    requestAnimationFrame(this._bucle);
  }

  _dibujar(ahora) {
    const b = this.base;
    const bw = b.videoWidth || b.naturalWidth, bh = b.videoHeight || b.naturalHeight;
    if (!bw) return;
    const escalaRender = Math.max(0.1, Math.min(1, Number(this.op.escalaRender) || 1));
    const cw = Math.max(1, Math.round(bw * escalaRender));
    const ch = Math.max(1, Math.round(bh * escalaRender));
    if (this.canvas.width !== cw || this.canvas.height !== ch) {
      this.canvas.width = cw;
      this.canvas.height = ch;
    }
    const ctx = this.ctx, r = this.lib ? this.lib.datos.rect : this.op.rect, e = this.op.encaje;
    const s = e ? e.escala : bw / this.op.refAncho, ox = e ? e.dx : 0, oy = e ? e.dy : 0;
    const x = (r.x * s + ox) * escalaRender;
    const y = (r.y * s + oy) * escalaRender;
    const w = r.w * s * escalaRender;
    const h = r.h * s * escalaRender;

    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, cw, ch);
    if (!this.op.soloParche) ctx.drawImage(b, 0, 0, cw, ch);

    if (this.lib) {
      this._pasoBiblioteca(ahora);
      const reposo = this.fActual === this.lib.datos.anclas.A;
      const objetivo = (this.hablando || !reposo) ? 1 : 0;
      this.cobertura += (objetivo - this.cobertura) * (objetivo ? 0.5 : 0.12);
      if (this.cobertura > 0.01) {
        const a = Math.min(1, (ahora - this.tFrame) / this.op.fundidoBiblioteca);
        ctx.globalAlpha = this.cobertura;
        this._dibujarFotograma(this.fPrevio, x, y, w, h);
        ctx.globalAlpha = this.cobertura * a;
        this._dibujarFotograma(this.fActual, x, y, w, h);
        ctx.globalAlpha = 1;
      }
      return;
    }

    // Mientras habla, la boca cerrada (A) tapa la de la base; al callar, se desvanece
    // y vuelve a verse la base (útil con vídeo: su boca y su expresión originales).
    const objetivo = (this.hablando || this.actual !== 'A') ? 1 : 0;
    this.cobertura += (objetivo - this.cobertura) * (objetivo ? 0.5 : 0.12);
    if (this.cobertura > 0.01) {
      ctx.globalAlpha = this.cobertura;
      ctx.drawImage(this.parches.A, x, y, w, h);
      ctx.globalAlpha = 1;
    }

    const a = Math.min(1, (ahora - this.tCambio) / Math.max(1, this.fundidoActual || this.op.fundido));
    if (a < 1 && this.previa !== 'A') {          // la boca anterior se desvanece
      ctx.globalAlpha = this.actual === 'A' ? 1 - a : 1;
      ctx.drawImage(this.parches[this.previa], x, y, w, h);
    }
    if (this.actual !== 'A') {                   // la nueva aparece
      ctx.globalAlpha = a;
      ctx.drawImage(this.parches[this.actual], x, y, w, h);
    }
    ctx.globalAlpha = 1;

    if (this.op.balanceo) {
      this.intensidad += ((this.hablando ? 1 : 0) - this.intensidad) * 0.04;
      const t = ahora / 1000, k = this.intensidad;
      const rot = k * (0.35 * Math.sin(t * 1.3) + 0.15 * Math.sin(t * 3.1));
      const dy = k * (1.2 * Math.sin(t * 2.2));
      this.canvas.style.transformOrigin = '50% 85%';
      this.canvas.style.transform = `translateY(${dy.toFixed(2)}px) rotate(${rot.toFixed(3)}deg)`;
    }
  }
}

/* =====================================================================
   textoAVisemas: convierte una frase en español en formas de boca con
   tiempos estimados. Útil para pruebas o si no tienes JSON de Rhubarb.
   Devuelve { cues, palabras } donde palabras = [[indiceCaracter, tiempo], …]
   ===================================================================== */
function textoAVisemas(texto) {
  const VOCAL = { a: 'D', á: 'D', e: 'C', é: 'C', i: 'B', í: 'B', o: 'E', ó: 'E', u: 'F', ú: 'F', ü: 'F' };
  const esLetra = ch => /[a-záéíóúüñ]/i.test(ch || '');
  const t0 = texto.toLowerCase();
  const tonicas = silabasTonicas(t0);

  // 1. Texto → secuencia de sonidos
  const sonidos = [], palabras = [];
  for (let i = 0; i < t0.length; i++) {
    const ch = t0[i], sig = t0[i + 1], ant = t0[i - 1];
    if (esLetra(ch) && !esLetra(ant)) palabras.push([i, sonidos.length]);
    if (VOCAL[ch]) {
      if (ch === 'u' && (ant === 'q' || (ant === 'g' && 'eéií'.includes(sig || '')))) continue;   // u muda
      const finFrase = /^\s*[,;:.!?…]/.test(t0.slice(i + 1, i + 3)) || i === t0.length - 1;
      sonidos.push({ tipo: 'vocal', forma: VOCAL[ch], dur: tonicas.has(i) ? 0.13 : (finFrase ? 0.12 : 0.095), fuerte: tonicas.has(i) });
    }
    else if (ch === 'y' && !esLetra(sig)) sonidos.push({ tipo: 'vocal', forma: 'B', dur: 0.095 });   // "y", "hoy"
    else if ('pbv'.includes(ch)) sonidos.push({ tipo: 'labial', forma: 'A', dur: 0.07, oclusiva: true });
    else if (ch === 'm') sonidos.push({ tipo: 'labial', forma: 'A', dur: 0.085, oclusiva: false });     // nasal: sin golpe
    else if (ch === 'f') sonidos.push({ tipo: 'dientes', forma: 'FV', dur: 0.08 });
    else if (ch === 'c' && sig === 'h') { sonidos.push({ tipo: 'palatal', forma: 'CH', dur: 0.08 }); i++; }
    else if (ch === 'l' && sig === 'l') { sonidos.push({ tipo: 'palatal', forma: 'CH', dur: 0.075 }); i++; }
    else if (ch === 'y') sonidos.push({ tipo: 'palatal', forma: 'CH', dur: 0.07 });
    else if (ch === 'l') sonidos.push({ tipo: 'neutra', dur: 0.06 });   // la L toma la forma de la vocal vecina
    else if (ch === 'r' && sig === 'r') { sonidos.push({ tipo: 'neutra', dur: 0.08 }); i++; }
    else if ('szx'.includes(ch) || (ch === 'c' && 'eéií'.includes(sig || ''))) sonidos.push({ tipo: 'sibilante', dur: 0.07 });
    else if ('tdnrkgjñcqw'.includes(ch)) sonidos.push({ tipo: 'neutra', dur: 0.055 });
    else if (ch === 'h') continue;
    else if (',;:'.includes(ch)) sonidos.push({ tipo: 'pausa', forma: 'A', dur: 0.22 });
    else if ('.!?…'.includes(ch)) sonidos.push({ tipo: 'pausa', forma: 'A', dur: 0.38 });
  }

  // 2. Coarticulación: las consonantes sin forma propia toman la de la vocal
  //    siguiente (o la anterior); las sibilantes anticipan el redondeo de O/U.
  const vocalVecina = i => {
    for (let j = i + 1; j < sonidos.length && sonidos[j].tipo !== 'pausa'; j++) if (sonidos[j].tipo === 'vocal') return sonidos[j].forma;
    for (let j = i - 1; j >= 0 && sonidos[j].tipo !== 'pausa'; j--) if (sonidos[j].tipo === 'vocal') return sonidos[j].forma;
    return 'B';
  };
  sonidos.forEach((so, i) => {
    if (so.tipo === 'neutra') { so.forma = vocalVecina(i); so.suave = true; }
    if (so.tipo === 'sibilante') {
      const v = vocalVecina(i);
      so.forma = (v === 'E' || v === 'F') ? 'CH' : 'B';   // "so", "su": labios redondeados con dientes
    }
  });

  // 3. Sonidos → formas con tiempos
  const cues = [];
  let t = 0;
  const tiempoSonido = [];
  for (const so of sonidos) {
    tiempoSonido.push(t);
    cues.push({ start: t, end: t + so.dur, value: so.forma, fuerte: !!so.fuerte, suave: !!so.suave, oclusiva: so.oclusiva });
    t += so.dur;
  }
  cues.push({ start: t, end: t + 0.1, value: 'A' });
  return { cues, palabras: palabras.map(([ci, k]) => [ci, tiempoSonido[k] ?? t]), duracion: t + 0.1 };
}

/* Índices de las vocales tónicas de cada palabra (reglas de acentuación del español). */
function silabasTonicas(t0) {
  const tonicas = new Set(), VOC = 'aeiouáéíóúü', FUERTE = 'aeoáéó', TILDE = 'áéíóú';
  for (const m of t0.matchAll(/[a-záéíóúüñ]+/g)) {
    const w = m[0], base = m.index;
    if (w.length <= 2 && !/[áéíóú]/.test(w)) continue;   // monosílabos átonos (el, la, de, y…)
    const nucleos = [];                                  // grupos de vocales seguidas
    for (let i = 0; i < w.length; i++) {
      if (!VOC.includes(w[i])) continue;
      if (w[i] === 'u' && (w[i - 1] === 'q' || (w[i - 1] === 'g' && 'eéií'.includes(w[i + 1] || '')))) continue;
      const g = [i];
      while (i + 1 < w.length && VOC.includes(w[i + 1])) g.push(++i);
      nucleos.push(g);
    }
    if (!nucleos.length) continue;
    let n = nucleos.findIndex(g => g.some(i => TILDE.includes(w[i])));
    if (n < 0) n = /[aeiouns]$/.test(w) ? Math.max(0, nucleos.length - 2) : nucleos.length - 1;
    const g = nucleos[n];
    const v = g.find(i => TILDE.includes(w[i])) ?? g.find(i => FUERTE.includes(w[i])) ?? g[g.length - 1];
    tonicas.add(base + v);
  }
  return tonicas;
}

/* =====================================================================
   hablarConVoz: usa la voz del navegador (speechSynthesis) y sincroniza
   las bocas con el texto. Sirve para probar sin locuciones grabadas.
   ===================================================================== */
function hablarConVoz(presentador, texto, { velocidad = 1, voz = null } = {}) {
  const { cues, palabras } = textoAVisemas(texto);
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = 'es-ES';
  u.rate = velocidad;
  if (voz) u.voice = voz;

  let tRef = 0, baseT = 0, empezado = false;
  const reloj = () => empezado ? baseT + (performance.now() - tRef) / 1000 * velocidad : 0;

  u.onstart = () => { empezado = true; tRef = performance.now(); baseT = 0; };
  u.onboundary = e => {          // resincroniza en cada palabra si la voz lo informa
    if (e.name && e.name !== 'word') return;
    const p = palabras.find(([ci]) => ci >= e.charIndex);
    if (p) { baseT = p[1]; tRef = performance.now(); }
  };
  u.onend = u.onerror = () => presentador.detener();

  speechSynthesis.cancel();
  presentador.reproducir(cues, reloj, { autoFin: false });
  speechSynthesis.speak(u);
  return u;
}
