const RANDOM = (min, max) =>
    Math.floor(Math.random() * (max - min + 1) + min);

const PARTICLES = document.querySelectorAll(
    '.aletheia-galaxy-button .star'
);

PARTICLES.forEach((particle) => {
    particle.style.setProperty('--angle', RANDOM(0, 360));
    particle.style.setProperty('--duration', RANDOM(6, 20));
    particle.style.setProperty('--delay', RANDOM(1, 10));
    particle.style.setProperty('--alpha', RANDOM(40, 90) / 100);
    particle.style.setProperty('--size', RANDOM(2, 6));
    particle.style.setProperty('--distance', RANDOM(40, 200));
});