function blackhole(selector) {
  const container = document.querySelector(selector);
  const trigger = container?.querySelector('.centerHover');

  if (!container || !trigger) return;

  const width = container.clientWidth;
  const height = container.clientHeight;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxOrbit = Math.min(225, Math.min(width, height) * 0.43);
  const startTime = Date.now();
  const stars = [];
  let collapse = false;
  let expanse = false;

  let activacionPendiente = false;

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

  const context = canvas.getContext('2d');
  context.scale(pixelRatio, pixelRatio);
  // Conserva las estelas claras sobre el fondo oscuro del sitio.
  context.globalCompositeOperation = 'source-over';

  function rotate(cx, cy, x, y, angle) {
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    return [
      (cosine * (x - cx)) + (sine * (y - cy)) + cx,
      (cosine * (y - cy)) - (sine * (x - cx)) + cy
    ];
  }

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
      this.color = `rgba(255,255,255,${Math.max(.12, 1 - (this.orbital / maxOrbit))})`;
      this.prevR = this.startRotation;
      this.prevX = this.x;
      this.prevY = this.y;
      stars.push(this);
    }

    draw(currentTime) {
      this.rotation = this.startRotation + currentTime * (expanse ? this.speed / 2 : this.speed);

      if (!expanse) {
        const target = collapse ? this.hoverPos : this.yOrigin;
        this.y += (target - this.y) / (collapse ? 5 : 10);
      } else if (this.y > this.expansePos) {
        this.y += (this.expansePos - this.y) / 80;
      }

      context.save();
      context.fillStyle = this.color;
      context.strokeStyle = this.color;
      context.beginPath();
      const oldPos = rotate(centerX, centerY, this.prevX, this.prevY, -this.prevR);
      context.moveTo(oldPos[0], oldPos[1]);
      context.translate(centerX, centerY);
      context.rotate(this.rotation);
      context.translate(-centerX, -centerY);
      context.lineTo(this.x, this.y);
      context.stroke();
      context.restore();

      this.prevR = this.rotation;
      this.prevX = this.x;
      this.prevY = this.y;
    }
  }

  trigger.addEventListener('mouseenter', () => {
    if (!expanse) collapse = true;
  });

  trigger.addEventListener('mouseleave', () => {
    collapse = false;
  });
trigger.addEventListener('pointerdown', (event) => {
  if (
    event.pointerType !== 'mouse' &&
    !expanse &&
    !activacionPendiente
  ) {
    collapse = true;

    if ('vibrate' in navigator) {
      navigator.vibrate(18);
    }
  }
});

trigger.addEventListener('pointercancel', () => {
  if (!activacionPendiente && !expanse) {
    collapse = false;
  }
});
  trigger.addEventListener('click', (event) => {
  event.preventDefault();

  if (expanse || activacionPendiente) return;

  activacionPendiente = true;

  const abrirArchivo = () => {
    collapse = false;
    expanse = true;
    trigger.classList.add('open');

    if ('vibrate' in navigator) {
      navigator.vibrate([25, 20, 55]);
    }

    window.setTimeout(() => {
      window.location.assign(trigger.href);
    }, 900);
  };

  if (esDispositivoTactil) {
    collapse = true;
    window.setTimeout(abrirArchivo, 280);
  } else {
    abrirArchivo();
  }
});

  function loop() {
    const currentTime = (Date.now() - startTime) / 50;
    context.clearRect(0, 0, width, height);
context.fillStyle = '#000';
context.fillRect(0, 0, width, height);
    stars.forEach((star) => star.draw(currentTime));
    window.requestAnimationFrame(loop);
  }

  context.fillStyle = '#000';
  context.fillRect(0, 0, width, height);
  const starCount = Math.min(2500, Math.max(1200, Math.round(width * height / 140)));
  for (let index = 0; index < starCount; index += 1) new Star();
  loop();
}

document.addEventListener('DOMContentLoaded', () => blackhole('#blackhole'));
