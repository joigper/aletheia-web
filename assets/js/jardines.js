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
        if (porcentaje <= 8) estado.textContent = "Vista del parque: la estructura permanece oculta bajo el paisaje.";
        else if (porcentaje >= 92) estado.textContent = "Vista técnica: anclaje, drenaje y estructura de soporte.";
        else estado.textContent = "Vista combinada: paisaje e infraestructura.";
    };
    deslizador.addEventListener("input", () => actualizar(deslizador.value));
    const posicionDesdeEvento = (evento) => {
        const rect = escena.getBoundingClientRect();
        return ((evento.clientX - rect.left) / rect.width) * 100;
    };
    escena.addEventListener("pointerdown", (evento) => { escena.setPointerCapture(evento.pointerId); actualizar(posicionDesdeEvento(evento)); });
    escena.addEventListener("pointermove", (evento) => { if (escena.hasPointerCapture(evento.pointerId)) actualizar(posicionDesdeEvento(evento)); });
    actualizar(deslizador.value);

    document.querySelectorAll("[data-jc-pase]").forEach((pase) => {
        const diapositivas = [...pase.querySelectorAll("[data-jc-slide]")];
        const indices = [...pase.querySelectorAll("[data-jc-ir]")];
        if (!diapositivas.length) return;

        let indiceActual = 0;
        let temporizador;
        const mostrar = (nuevoIndice) => {
            indiceActual = (nuevoIndice + diapositivas.length) % diapositivas.length;
            diapositivas.forEach((diapositiva, indice) => {
                const activa = indice === indiceActual;
                diapositiva.classList.toggle("is-active", activa);
                diapositiva.setAttribute("aria-hidden", String(!activa));
            });
            indices.forEach((boton, indice) => {
                const activo = indice === indiceActual;
                boton.classList.toggle("is-active", activo);
                boton.setAttribute("aria-selected", String(activo));
            });
        };
        const detener = () => window.clearInterval(temporizador);
        const iniciar = () => {
            detener();
            if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                temporizador = window.setInterval(() => mostrar(indiceActual + 1), 6500);
            }
        };
        pase.querySelector("[data-jc-anterior]")?.addEventListener("click", () => { mostrar(indiceActual - 1); iniciar(); });
        pase.querySelector("[data-jc-siguiente]")?.addEventListener("click", () => { mostrar(indiceActual + 1); iniciar(); });
        indices.forEach((boton) => boton.addEventListener("click", () => { mostrar(Number(boton.dataset.jcIr)); iniciar(); }));
        pase.addEventListener("mouseenter", detener);
        pase.addEventListener("mouseleave", iniciar);
        pase.addEventListener("focusin", detener);
        pase.addEventListener("focusout", iniciar);
        mostrar(0);
        iniciar();
    });

    document.querySelectorAll("[data-jc-arboles]").forEach((carrusel) => {
        const pista = carrusel.querySelector("[data-jc-arbol-pista]");
        const slides = [...carrusel.querySelectorAll("[data-jc-arbol-slide]")];
        const progreso = carrusel.querySelector("[data-jc-arbol-progreso]");
        const contador = carrusel.querySelector("[data-jc-arbol-contador]");
        if (!pista || !slides.length) return;

        const clonFinal = slides[slides.length - 1].cloneNode(true);
        const clonInicial = slides[0].cloneNode(true);
        clonFinal.setAttribute("aria-hidden", "true");
        clonInicial.setAttribute("aria-hidden", "true");
        pista.prepend(clonFinal);
        pista.append(clonInicial);
        const todosLosSlides = [...pista.querySelectorAll("[data-jc-arbol-slide]")];

        let indice = 0;
        let indiceFisico = 1;
        let inicioX = 0;
        let inicioY = 0;
        let deltaX = 0;
        let arrastrando = false;
        let gestoDecidido = false;
        let gestoHorizontal = false;
        let ajustePendiente = null;

        const distancia = () => {
            const estilos = window.getComputedStyle(pista);
            return todosLosSlides[0].getBoundingClientRect().width + (parseFloat(estilos.columnGap || estilos.gap) || 0);
        };
        const posicion = () => -(indiceFisico * distancia());
        const dibujar = (animar = true) => {
            pista.style.transition = animar ? "" : "none";
            pista.style.transform = `translate3d(${posicion()}px,0,0)`;
            todosLosSlides.forEach((slide, numero) => {
                const activa = numero === indiceFisico;
                slide.classList.toggle("is-active", activa);
                slide.setAttribute("aria-hidden", String(!activa));
            });
            if (progreso) progreso.style.transform = `scaleX(${(indice + 1) / slides.length})`;
            if (contador) contador.textContent = `${String(indice + 1).padStart(2,"0")} / ${String(slides.length).padStart(2,"0")}`;
        };
        const irA = (nuevoIndice) => {
            ajustePendiente = null;
            if (nuevoIndice < 0) {
                indice = slides.length - 1;
                indiceFisico = 0;
                ajustePendiente = slides.length;
            } else if (nuevoIndice >= slides.length) {
                indice = 0;
                indiceFisico = slides.length + 1;
                ajustePendiente = 1;
            } else {
                indice = nuevoIndice;
                indiceFisico = indice + 1;
            }
            dibujar();
            if (ajustePendiente !== null && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                indiceFisico = ajustePendiente;
                ajustePendiente = null;
                dibujar(false);
            }
        };

        pista.addEventListener("transitionend", (evento) => {
            if (evento.target !== pista || evento.propertyName !== "transform" || ajustePendiente === null) return;
            indiceFisico = ajustePendiente;
            ajustePendiente = null;
            dibujar(false);
            pista.getBoundingClientRect();
            pista.style.transition = "";
        });

        carrusel.querySelector("[data-jc-arbol-anterior]")?.addEventListener("click", () => irA(indice - 1));
        carrusel.querySelector("[data-jc-arbol-siguiente]")?.addEventListener("click", () => irA(indice + 1));
        carrusel.addEventListener("keydown", (evento) => {
            if (evento.key === "ArrowLeft") { evento.preventDefault(); irA(indice - 1); }
            if (evento.key === "ArrowRight") { evento.preventDefault(); irA(indice + 1); }
        });
        pista.addEventListener("pointerdown", (evento) => {
            if (evento.pointerType === "mouse" && evento.button !== 0) return;
            arrastrando = true;
            inicioX = evento.clientX;
            inicioY = evento.clientY;
            deltaX = 0;
            gestoDecidido = false;
            gestoHorizontal = false;
            pista.setPointerCapture(evento.pointerId);
        });
        pista.addEventListener("pointermove", (evento) => {
            if (!arrastrando) return;
            const movimientoX = evento.clientX - inicioX;
            const movimientoY = evento.clientY - inicioY;
            if (!gestoDecidido && Math.hypot(movimientoX,movimientoY) >= 8) {
                gestoDecidido = true;
                gestoHorizontal = Math.abs(movimientoX) > Math.abs(movimientoY) * 1.15;
                if (gestoHorizontal) carrusel.classList.add("is-dragging");
                else {
                    arrastrando = false;
                    if (pista.hasPointerCapture(evento.pointerId)) pista.releasePointerCapture(evento.pointerId);
                }
            }
            if (!gestoHorizontal) return;
            deltaX = movimientoX * .72;
            pista.style.transform = `translate3d(${posicion() + deltaX}px,0,0)`;
        });
        const terminarArrastre = (evento) => {
            if (!arrastrando) return;
            arrastrando = false;
            carrusel.classList.remove("is-dragging");
            if (pista.hasPointerCapture(evento.pointerId)) pista.releasePointerCapture(evento.pointerId);
            if (!gestoHorizontal) { dibujar(); return; }
            const umbral = Math.max(72, Math.min(150, distancia() * .2));
            if (deltaX < -umbral) irA(indice + 1);
            else if (deltaX > umbral) irA(indice - 1);
            else dibujar();
        };
        pista.addEventListener("pointerup", terminarArrastre);
        pista.addEventListener("pointercancel", terminarArrastre);
        window.addEventListener("resize", () => dibujar(false));
        dibujar(false);
    });
});
