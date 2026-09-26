document.addEventListener("DOMContentLoaded", () => {
    const comparador = document.getElementById("jc-comparador");
    const escena = comparador?.querySelector(".jc-escena");
    const capaTecnica = document.getElementById("jc-capa-tecnica");
    const divisor = document.getElementById("jc-divisor");
    const deslizador = document.getElementById("jc-deslizador");
    const estado = document.getElementById("jc-estado");

    if (!escena || !capaTecnica || !divisor || !deslizador || !estado) return;

    const actualizar = (valor) => {
        const porcentaje = Math.max(0, Math.min(100, Number(valor)));
        capaTecnica.style.clipPath = `inset(0 ${100 - porcentaje}% 0 0)`;
        divisor.style.left = `${porcentaje}%`;
        deslizador.value = String(porcentaje);

        if (porcentaje <= 8) {
            estado.textContent = "Vista del parque: la estructura permanece oculta bajo el paisaje.";
        } else if (porcentaje >= 92) {
            estado.textContent = "Vista técnica: anclaje, drenaje y estructura de soporte.";
        } else {
            estado.textContent = "Vista combinada: paisaje e infraestructura.";
        }
    };

    deslizador.addEventListener("input", () => actualizar(deslizador.value));

    const posicionDesdeEvento = (evento) => {
        const rect = escena.getBoundingClientRect();
        return ((evento.clientX - rect.left) / rect.width) * 100;
    };

    escena.addEventListener("pointerdown", (evento) => {
        escena.setPointerCapture(evento.pointerId);
        actualizar(posicionDesdeEvento(evento));
    });

    escena.addEventListener("pointermove", (evento) => {
        if (!escena.hasPointerCapture(evento.pointerId)) return;
        actualizar(posicionDesdeEvento(evento));
    });

    actualizar(deslizador.value);
});
