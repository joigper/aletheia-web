(function (global) {
  "use strict";

  global.AletheiaTVSmart = true;
  const DESIGN_WIDTH = 1920;
  const DESIGN_HEIGHT = 1080;

  function fitStage() {
    const scale = Math.min(global.innerWidth / DESIGN_WIDTH, global.innerHeight / DESIGN_HEIGHT);
    document.documentElement.style.setProperty("--tv-smart-scale", String(Math.max(0.1, scale)));
  }

  fitStage();
  global.addEventListener("resize", fitStage, { passive: true });
  global.addEventListener("orientationchange", fitStage, { passive: true });
})(window);
