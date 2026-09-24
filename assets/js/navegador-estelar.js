(function () {
  'use strict';

  const canvas = document.getElementById('navegador-estelar-canvas');
  const visor = document.getElementById('navegador-estelar');
  const estrellas = window.ALETHEIA_ESTRELLAS;

  if (!canvas || !visor || !Array.isArray(estrellas) || !estrellas.length) return;

  const contexto = canvas.getContext('2d');
  const interfaz = {
    radio: document.getElementById('navegador-radio'),
    seleccion: document.getElementById('navegador-seleccion'),
    clase: document.getElementById('navegador-clase'),
    distancia: document.getElementById('navegador-distancia'),
    origen: document.getElementById('navegador-origen'),
    destino: document.getElementById('navegador-destino'),
    centrar: document.getElementById('navegador-centrar'),
    reiniciar: document.getElementById('navegador-reiniciar'),
    rutaNombres: document.getElementById('navegador-ruta-nombres'),
    rutaDistancia: document.getElementById('navegador-ruta-distancia')
  };

  const sol = estrellas.find((estrella) => estrella.nombre === 'Sol') || estrellas[0];
  // Solo permanecen rotulados los sistemas que forman parte del universo narrativo.
  const destacados = new Set(['Sol', 'Sirius', 'Tau Ceti', 'YZ Ceti']);
  const punteros = new Map();
  const proyectadas = [];

  let anchura = 1;
  let altura = 1;
  let densidad = 1;
  let radio = Number(interfaz.radio?.value) || 30;
  let giroHorizontal = -0.55;
  let giroVertical = 0.36;
  let zoom = 1;
  let centro = sol;
  let seleccionada = sol;
  let origen = sol;
  let destino = null;
  let arrastrando = false;
  let movimiento = 0;
  let ultimoPunto = null;
  let distanciaPinza = 0;

  function limitar(valor, minimo, maximo) {
    return Math.max(minimo, Math.min(maximo, valor));
  }

  function formatearDistancia(valor) {
    return `${valor.toLocaleString('es-ES', {
      minimumFractionDigits: valor < 10 ? 2 : 1,
      maximumFractionDigits: valor < 10 ? 2 : 1
    })} AL`;
  }

  function distanciaEntre(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  function tipoEspectral(estrella) {
    const clase = String(estrella.clase || '').trim().toUpperCase();
    if (/^(DA|DB|DC|DO|DQ|DZ|DX|D)/.test(clase)) return 'D';
    const coincidencia = clase.match(/[OBAFGKM]/);
    return coincidencia ? coincidencia[0] : '?';
  }

  function colorEspectral(estrella) {
    return {
      O: '#6c8dff',
      B: '#8eaeff',
      A: '#c6d7ff',
      F: '#f1f4ff',
      G: '#fff0b8',
      K: '#ffbd73',
      M: '#ff765b',
      D: '#e8fbff',
      '?': '#b59acb'
    }[tipoEspectral(estrella)];
  }

  function redimensionar() {
    const caja = visor.getBoundingClientRect();
    anchura = Math.max(1, caja.width);
    altura = Math.max(1, caja.height);
    densidad = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(anchura * densidad);
    canvas.height = Math.round(altura * densidad);
    canvas.style.width = `${anchura}px`;
    canvas.style.height = `${altura}px`;
    contexto.setTransform(densidad, 0, 0, densidad, 0, 0);
  }

  function rotar(x, y, z) {
    const cosH = Math.cos(giroHorizontal);
    const sinH = Math.sin(giroHorizontal);
    const cosV = Math.cos(giroVertical);
    const sinV = Math.sin(giroVertical);
    const xh = x * cosH - z * sinH;
    const zh = x * sinH + z * cosH;
    return {
      x: xh,
      y: y * cosV - zh * sinV,
      z: y * sinV + zh * cosV
    };
  }

  function proyectarCoordenada(x, y, z) {
    const rotada = rotar(x - centro.x, y - centro.y, z - centro.z);
    const escala = Math.min(anchura, altura) * .43 / radio * zoom;
    return {
      x: anchura / 2 + rotada.x * escala,
      y: altura / 2 - rotada.y * escala,
      z: rotada.z,
      escala
    };
  }

  function dibujarReticula() {
    contexto.save();
    contexto.lineWidth = 1;

    [radio * .25, radio * .5, radio * .75, radio].forEach((distancia, indice) => {
      contexto.beginPath();
      for (let paso = 0; paso <= 96; paso += 1) {
        const angulo = paso / 96 * Math.PI * 2;
        const punto = proyectarCoordenada(
          centro.x + Math.cos(angulo) * distancia,
          centro.y + Math.sin(angulo) * distancia,
          centro.z
        );
        if (paso === 0) contexto.moveTo(punto.x, punto.y);
        else contexto.lineTo(punto.x, punto.y);
      }
      contexto.strokeStyle = `rgba(43, 151, 202, ${.18 - indice * .02})`;
      contexto.stroke();
    });

    contexto.setLineDash([2, 6]);
    contexto.strokeStyle = 'rgba(83, 192, 240, .13)';
    contexto.beginPath();
    const verticalA = proyectarCoordenada(centro.x, centro.y, centro.z - radio);
    const verticalB = proyectarCoordenada(centro.x, centro.y, centro.z + radio);
    contexto.moveTo(verticalA.x, verticalA.y);
    contexto.lineTo(verticalB.x, verticalB.y);
    contexto.stroke();
    contexto.restore();
  }

  function dibujarRuta() {
    if (!origen || !destino) return;
    const a = proyectarCoordenada(origen.x, origen.y, origen.z);
    const b = proyectarCoordenada(destino.x, destino.y, destino.z);
    const gradiente = contexto.createLinearGradient(a.x, a.y, b.x, b.y);
    gradiente.addColorStop(0, '#61dcff');
    gradiente.addColorStop(1, '#f4d675');

    contexto.save();
    contexto.strokeStyle = gradiente;
    contexto.lineWidth = 1.6;
    contexto.shadowBlur = 10;
    contexto.shadowColor = '#64dfff';
    contexto.setLineDash([7, 5]);
    contexto.beginPath();
    contexto.moveTo(a.x, a.y);
    contexto.lineTo(b.x, b.y);
    contexto.stroke();
    contexto.restore();
  }

  function dibujarMarcador(punto, estrella, tiempo) {
    const esSeleccionada = estrella === seleccionada;
    const esOrigen = estrella === origen;
    const esDestino = estrella === destino;
    const color = colorEspectral(estrella);
    const brillo = limitar(4.2 - (Number(estrella.magnitud) + 1) * .22, 1.05, 3.8);
    const profundidad = limitar(1 - punto.z / (radio * 3), .55, 1.25);
    const radioEstrella = brillo * profundidad + (esSeleccionada ? 1.7 : 0);

    contexto.save();
    contexto.globalAlpha = limitar(.52 + profundidad * .32, .45, 1);
    contexto.shadowBlur = esSeleccionada ? 18 : 7 + brillo * 2;
    contexto.shadowColor = color;
    contexto.fillStyle = color;
    contexto.beginPath();
    contexto.arc(punto.x, punto.y, radioEstrella, 0, Math.PI * 2);
    contexto.fill();

    contexto.fillStyle = 'rgba(255,255,255,.95)';
    contexto.beginPath();
    contexto.arc(punto.x - radioEstrella * .18, punto.y - radioEstrella * .18, Math.max(.55, radioEstrella * .34), 0, Math.PI * 2);
    contexto.fill();
    contexto.restore();

    if (esOrigen || esDestino || esSeleccionada) {
      const pulso = esSeleccionada ? Math.sin(tiempo / 280) * 1.5 : 0;
      contexto.save();
      contexto.strokeStyle = esDestino ? '#f4d675' : '#59d7ff';
      contexto.lineWidth = esSeleccionada ? 1.3 : 1;
      contexto.globalAlpha = .82;
      contexto.beginPath();
      contexto.arc(punto.x, punto.y, radioEstrella + 5 + pulso, 0, Math.PI * 2);
      contexto.stroke();
      if (esOrigen) {
        contexto.beginPath();
        contexto.arc(punto.x, punto.y, radioEstrella + 8 + pulso, 0, Math.PI * 2);
        contexto.stroke();
      }
      contexto.restore();
    }

    const debeEtiquetarse = esSeleccionada || esOrigen || esDestino || destacados.has(estrella.nombre);

    if (debeEtiquetarse) {
      contexto.save();
      contexto.font = `${esSeleccionada ? 11 : 9}px Tektur, sans-serif`;
      contexto.fillStyle = esSeleccionada ? '#fff' : 'rgba(180,225,243,.78)';
      contexto.shadowBlur = 4;
      contexto.shadowColor = '#000';
      contexto.fillText(estrella.nombre, punto.x + radioEstrella + 7, punto.y - radioEstrella - 3);
      contexto.restore();
    }
  }

  function dibujar(tiempo) {
    contexto.clearRect(0, 0, anchura, altura);
    dibujarReticula();
    dibujarRuta();
    proyectadas.length = 0;

    estrellas.forEach((estrella) => {
      if (distanciaEntre(estrella, centro) > radio) return;
      const punto = proyectarCoordenada(estrella.x, estrella.y, estrella.z);
      if (punto.x < -20 || punto.x > anchura + 20 || punto.y < -20 || punto.y > altura + 20) return;
      proyectadas.push({ estrella, ...punto });
    });

    proyectadas.sort((a, b) => a.z - b.z);
    proyectadas.forEach((punto) => dibujarMarcador(punto, punto.estrella, tiempo));
    window.requestAnimationFrame(dibujar);
  }

  function actualizarSeleccion() {
    interfaz.seleccion.textContent = seleccionada.nombre;
    interfaz.clase.textContent = seleccionada.clase || 'SIN CLASIFICAR';
    interfaz.distancia.textContent = formatearDistancia(distanciaEntre(seleccionada, sol));
  }

  function actualizarRuta() {
    interfaz.rutaNombres.textContent = `${origen?.nombre || 'SIN ORIGEN'} → ${destino?.nombre || 'SIN DESTINO'}`;
    interfaz.rutaDistancia.textContent = origen && destino
      ? `RUTA DIRECTA · ${formatearDistancia(distanciaEntre(origen, destino))}`
      : 'RUTA NO TRAZADA';
  }

  function estrellaEnPantalla(x, y) {
    let candidata = null;
    let distanciaMinima = 15;
    proyectadas.forEach((punto) => {
      const distancia = Math.hypot(punto.x - x, punto.y - y);
      if (distancia < distanciaMinima) {
        candidata = punto.estrella;
        distanciaMinima = distancia;
      }
    });
    return candidata;
  }

  function posicionLocal(evento) {
    const caja = canvas.getBoundingClientRect();
    return { x: evento.clientX - caja.left, y: evento.clientY - caja.top };
  }

  canvas.addEventListener('pointerdown', (evento) => {
    canvas.setPointerCapture(evento.pointerId);
    const punto = posicionLocal(evento);
    punteros.set(evento.pointerId, punto);
    arrastrando = true;
    movimiento = 0;
    ultimoPunto = punto;
    if (punteros.size === 2) {
      const [a, b] = [...punteros.values()];
      distanciaPinza = Math.hypot(a.x - b.x, a.y - b.y);
    }
  });

  canvas.addEventListener('pointermove', (evento) => {
    if (!punteros.has(evento.pointerId)) return;
    const punto = posicionLocal(evento);
    punteros.set(evento.pointerId, punto);

    if (punteros.size === 2) {
      const [a, b] = [...punteros.values()];
      const nuevaDistancia = Math.hypot(a.x - b.x, a.y - b.y);
      if (distanciaPinza > 0) zoom = limitar(zoom * nuevaDistancia / distanciaPinza, .55, 4.5);
      distanciaPinza = nuevaDistancia;
      movimiento += 5;
      return;
    }

    if (!ultimoPunto) return;
    const dx = punto.x - ultimoPunto.x;
    const dy = punto.y - ultimoPunto.y;
    giroHorizontal += dx * .007;
    giroVertical = limitar(giroVertical + dy * .007, -1.45, 1.45);
    movimiento += Math.abs(dx) + Math.abs(dy);
    ultimoPunto = punto;
  });

  function finalizarPuntero(evento) {
    const punto = posicionLocal(evento);
    if (arrastrando && movimiento < 7 && punteros.size === 1) {
      const estrella = estrellaEnPantalla(punto.x, punto.y);
      if (estrella) {
        seleccionada = estrella;
        actualizarSeleccion();
      }
    }
    punteros.delete(evento.pointerId);
    arrastrando = punteros.size > 0;
    ultimoPunto = punteros.size === 1 ? [...punteros.values()][0] : null;
    distanciaPinza = 0;
  }

  canvas.addEventListener('pointerup', finalizarPuntero);
  canvas.addEventListener('pointercancel', finalizarPuntero);
  canvas.addEventListener('wheel', (evento) => {
    evento.preventDefault();
    zoom = limitar(zoom * Math.exp(-evento.deltaY * .0012), .55, 4.5);
  }, { passive: false });

  interfaz.radio?.addEventListener('change', () => {
    radio = Number(interfaz.radio.value) || 30;
    zoom = 1;
  });

  interfaz.origen?.addEventListener('click', () => {
    origen = seleccionada;
    if (destino === origen) destino = null;
    actualizarRuta();
  });

  interfaz.destino?.addEventListener('click', () => {
    if (seleccionada === origen) return;
    destino = seleccionada;
    actualizarRuta();
  });

  interfaz.centrar?.addEventListener('click', () => {
    centro = seleccionada;
    zoom = 1;
  });

  interfaz.reiniciar?.addEventListener('click', () => {
    centro = sol;
    seleccionada = sol;
    giroHorizontal = -.55;
    giroVertical = .36;
    zoom = 1;
    actualizarSeleccion();
  });

  const observador = new ResizeObserver(redimensionar);
  observador.observe(visor);
  redimensionar();
  actualizarSeleccion();
  actualizarRuta();
  window.requestAnimationFrame(dibujar);
})();
