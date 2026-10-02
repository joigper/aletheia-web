function blackhole(selector) {
  const container = document.querySelector(selector);
  const trigger = container?.querySelector('.centerHover');

  if (!container || !trigger) return;

  const width = container.clientWidth;
  const height = container.clientHeight;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxOrbit = Math.min(225, Math.min(width, height) * 0.43);
  const stars = [];
  let collapse = false;
  let expanse = false;
  let toquePreparado = false;
  let temporizadorToque = null;

  const esDispositivoTactil = window.matchMedia(
    '(hover: none), (pointer: coarse)'
  ).matches;
  const canvas = document.createElement('canvas');
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  container.appendChild(canvas);

  // [OPT] alpha: false → el navegador no tiene que componer el canvas con
  // transparencia sobre la página (el fondo se pinta siempre de negro).
  const context = canvas.getContext('2d', { alpha: false });
  context.scale(pixelRatio, pixelRatio);
  context.globalCompositeOperation = 'source-over';
  context.lineWidth = 1;

  // [OPT] Las estelas se agrupan por opacidad. Antes cada estrella hacía su
  // propio save/translate/rotate/stroke/restore (hasta 2.500 trazos por
  // fotograma); ahora hay un único trazo por grupo. Con 24 niveles la
  // diferencia de opacidad entre grupos vecinos (< 4 %) no se aprecia.
  const NIVELES_OPACIDAD = 24;
  const grupos = Array.from({ length: NIVELES_OPACIDAD }, () => []);
  const estilosGrupo = Array.from({ length: NIVELES_OPACIDAD }, (_, nivel) => {
    const alfa = 0.12 + (nivel / (NIVELES_OPACIDAD - 1)) * 0.88;
    return `rgba(255,255,255,${alfa.toFixed(3)})`;
  });

  class Star {
    constructor() {
      const inner = Math.random() * (maxOrbit / 2) + 1;
      const outer = Math.random() * (maxOrbit / 2) + maxOrbit;
      this.orbital = (inner + outer) / 2;
      this.x = centerX;
      this.y = centerY + this.orbital;
      this.yOrigin = this.y;
      this.speed = (Math.floor(Math.random() * 2.5) + 1.5) * Math.PI / 180;
      this.startRotation = (Math.floor(Math.random() * 360) + 1) * Math.PI / 180;
      this.rotation = this.startRotation;
      this.id = stars.length;
      this.collapseBonus = Math.max(0, this.orbital - (maxOrbit * .7));
      this.hoverPos = centerY + (maxOrbit / 2) + this.collapseBonus;
      this.expansePos = centerY + (this.id % 100) * -10 + Math.floor(Math.random() * 20) + 1;
      const alfa = Math.max(.12, 1 - (this.orbital / maxOrbit));
      const nivel = Math.round((alfa - 0.12) / 0.88 * (NIVELES_OPACIDAD - 1));
      this.grupo = grupos[Math.max(0, Math.min(NIVELES_OPACIDAD - 1, nivel))];
      this.grupo.push(this);
      // Punto anterior ya en coordenadas de pantalla.
      this.prevScreenX = 0;
      this.prevScreenY = 0;
      this.colocar(this.rotation);
      this.prevScreenX = this.screenX;
      this.prevScreenY = this.screenY;
      stars.push(this);
    }

    // Misma rotación que hacía el canvas con translate/rotate, calculada a mano.
    colocar(angle) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const dx = this.x - centerX;
      const dy = this.y - centerY;
      this.screenX = centerX + cos * dx - sin * dy;
      this.screenY = centerY + sin * dx + cos * dy;
    }

    update(currentTime) {
      this.rotation = this.startRotation + currentTime * (expanse ? this.speed / 2 : this.speed);

      if (!expanse) {
        const target = collapse ? this.hoverPos : this.yOrigin;
        this.y += (target - this.y) / (collapse ? 5 : 10);
      } else if (this.y > this.expansePos) {
        this.y += (this.expansePos - this.y) / 80;
      }

      this.prevScreenX = this.screenX;
      this.prevScreenY = this.screenY;
      this.colocar(this.rotation);
    }
  }

  trigger.addEventListener('mouseenter', () => {
    if (!esDispositivoTactil && !expanse) {
      collapse = true;
    }
  });

  trigger.addEventListener('mouseleave', () => {
    if (!esDispositivoTactil && !toquePreparado) {
      collapse = false;
    }
  });

  trigger.addEventListener('contextmenu', (event) => {
    if (esDispositivoTactil) {
      event.preventDefault();
    }
  });

  trigger.addEventListener('click', (event) => {
    event.preventDefault();

    if (expanse) return;

    function abrirArchivo() {
      toquePreparado = false;
      collapse = false;
      expanse = true;

      window.clearTimeout(temporizadorToque);
      trigger.classList.remove('touch-ready');
      trigger.classList.add('open');

      if ('vibrate' in navigator) {
        navigator.vibrate([30, 20, 60]);
      }

      window.setTimeout(() => {
        window.location.assign(trigger.href);
      }, 900);
    }

    if (!esDispositivoTactil) {
      abrirArchivo();
      return;
    }

    if (!toquePreparado) {
      toquePreparado = true;
      collapse = true;
      trigger.classList.add('touch-ready');

      if ('vibrate' in navigator) {
        navigator.vibrate(25);
      }

      temporizadorToque = window.setTimeout(() => {
        toquePreparado = false;
        collapse = false;
        trigger.classList.remove('touch-ready');
      }, 2500);

      return;
    }

    abrirArchivo();
  });

  // ------------------------------------------------------------------
  // [OPT] Bucle con pausa. Antes el agujero negro se dibujaba sin parar,
  // aunque el usuario hubiera bajado con el scroll y no se viera.
  // Ahora se detiene fuera de pantalla y con la pestaña oculta. El reloj
  // también se pausa, así que al volver las estrellas siguen donde estaban
  // (sin saltos ni trazos largos de un fotograma).
  // ------------------------------------------------------------------
  let tiempoActivo = 0;      // ms acumulados con la animación en marcha
  let ultimoInstante = null; // performance.now() del último fotograma
  let fotograma = null;
  let enPantalla = true;

  function dibujar() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, width, height);
    for (let g = 0; g < NIVELES_OPACIDAD; g++) {
      const grupo = grupos[g];
      if (!grupo.length) continue;
      context.strokeStyle = estilosGrupo[g];
      context.beginPath();
      for (let i = 0; i < grupo.length; i++) {
        const star = grupo[i];
        context.moveTo(star.prevScreenX, star.prevScreenY);
        context.lineTo(star.screenX, star.screenY);
      }
      context.stroke();
    }
  }

  function loop(instante) {
    // Se limita el paso a 100 ms para que un tirón puntual no produzca saltos.
    if (ultimoInstante !== null) tiempoActivo += Math.min(100, instante - ultimoInstante);
    ultimoInstante = instante;
    const currentTime = tiempoActivo / 50;
    for (let i = 0; i < stars.length; i++) stars[i].update(currentTime);
    dibujar();
    fotograma = window.requestAnimationFrame(loop);
  }

  function arrancar() {
    if (fotograma !== null || !enPantalla || document.hidden) return;
    ultimoInstante = null;
    fotograma = window.requestAnimationFrame(loop);
  }

  function detener() {
    if (fotograma === null) return;
    window.cancelAnimationFrame(fotograma);
    fotograma = null;
  }

  context.fillStyle = '#000';
  context.fillRect(0, 0, width, height);
  const starCount = Math.min(2500, Math.max(1200, Math.round(width * height / 140)));
  for (let index = 0; index < starCount; index += 1) new Star();

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entradas) => {
      enPantalla = entradas[entradas.length - 1].isIntersecting;
      if (enPantalla) arrancar();
      else detener();
    }).observe(container);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) detener();
    else arrancar();
  });

  arrancar();
}

document.addEventListener('DOMContentLoaded', () => blackhole('#blackhole'));
