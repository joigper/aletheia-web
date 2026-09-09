document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("cocina-intro");
  const video = document.getElementById("cocina-video");

  video.addEventListener("ended", () => {
    intro.classList.add("intro-finalizada");

    setTimeout(() => {
      video.pause();
      video.hidden = true;
    }, 500);
  });

  video.play().catch(() => {
    intro.classList.add("intro-finalizada");
    video.hidden = true;
  });
});