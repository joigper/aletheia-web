document.addEventListener("DOMContentLoaded", () => {
    const texto = document.querySelector(".capitulo-aletheia__texto");
    const botonAnterior = document.getElementById("lector-anterior");
    const botonSiguiente = document.getElementById("lector-siguiente");
    const botonMenos = document.getElementById("lector-menos");
    const botonMas = document.getElementById("lector-mas");
    const indicador = document.getElementById("lector-pagina");

    if (
        !texto ||
        !botonAnterior ||
        !botonSiguiente ||
        !botonMenos ||
        !botonMas ||
        !indicador
    ) {
        return;
    }

    const bloques = Array.from(texto.children);
    let paginas = [];
    let paginaActual = 0;

    let tamanoFuente = parseFloat(
        window.getComputedStyle(texto).fontSize
    );

    const TAMANO_MINIMO = 15;
    const TAMANO_MAXIMO = 24;
    const PASO_FUENTE = 1;

    function calcularPaginas() {
        paginas = [];

        // Mostramos temporalmente todos los párrafos para medirlos.
        bloques.forEach((bloque) => {
            bloque.hidden = false;
        });

        const alturaDisponible = texto.clientHeight;

        let pagina = [];
        let alturaPagina = 0;

        bloques.forEach((bloque) => {
            const estilo = window.getComputedStyle(bloque);

            const margenSuperior =
                parseFloat(estilo.marginTop) || 0;

            const margenInferior =
                parseFloat(estilo.marginBottom) || 0;

            const alturaBloque =
                bloque.getBoundingClientRect().height +
                margenSuperior +
                margenInferior;

            if (
                pagina.length > 0 &&
                alturaPagina + alturaBloque > alturaDisponible
            ) {
                paginas.push(pagina);
                pagina = [];
                alturaPagina = 0;
            }

            pagina.push(bloque);
            alturaPagina += alturaBloque;
        });

        if (pagina.length > 0) {
            paginas.push(pagina);
        }

        paginaActual = Math.min(
            paginaActual,
            paginas.length - 1
        );

        mostrarPagina();
    }

    function mostrarPagina() {
        bloques.forEach((bloque) => {
            bloque.hidden = true;
        });

        paginas[paginaActual].forEach((bloque) => {
            bloque.hidden = false;
        });

        indicador.textContent =
            `${paginaActual + 1} / ${paginas.length}`;

        botonAnterior.disabled =
            paginaActual === 0;

        botonSiguiente.disabled =
            paginaActual === paginas.length - 1;
    }

    function cambiarPagina(direccion) {
        const nuevaPagina =
            paginaActual + direccion;

        if (
            nuevaPagina < 0 ||
            nuevaPagina >= paginas.length
        ) {
            return;
        }

        paginaActual = nuevaPagina;
        mostrarPagina();
    }

    function cambiarFuente(cambio) {
        const nuevoTamano = Math.min(
            TAMANO_MAXIMO,
            Math.max(
                TAMANO_MINIMO,
                tamanoFuente + cambio
            )
        );

        if (nuevoTamano === tamanoFuente) {
            return;
        }

        tamanoFuente = nuevoTamano;

        texto.style.fontSize =
            `${tamanoFuente}px`;

        paginaActual = 0;

        calcularPaginas();
    }

    botonAnterior.addEventListener("click", () => {
        cambiarPagina(-1);
    });

    botonSiguiente.addEventListener("click", () => {
        cambiarPagina(1);
    });

    botonMenos.addEventListener("click", () => {
        cambiarFuente(-PASO_FUENTE);
    });

    botonMas.addEventListener("click", () => {
        cambiarFuente(PASO_FUENTE);
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "ArrowLeft") {
            cambiarPagina(-1);
        }

        if (evento.key === "ArrowRight") {
            cambiarPagina(1);
        }
    });
    // Navegación táctil en móvil
let inicioX = 0;
let inicioY = 0;

texto.addEventListener("touchstart", (evento) => {
    inicioX = evento.changedTouches[0].clientX;
    inicioY = evento.changedTouches[0].clientY;
}, { passive: true });

texto.addEventListener("touchend", (evento) => {
    const finX = evento.changedTouches[0].clientX;
    const finY = evento.changedTouches[0].clientY;

    const desplazamientoX = finX - inicioX;
    const desplazamientoY = finY - inicioY;

    // Evita interpretar un desplazamiento vertical como cambio de página.
    if (
        Math.abs(desplazamientoX) < 50 ||
        Math.abs(desplazamientoX) <= Math.abs(desplazamientoY)
    ) {
        return;
    }

    if (desplazamientoX < 0) {
        cambiarPagina(1);
    } else {
        cambiarPagina(-1);
    }
}, { passive: true });

    let temporizador;

    window.addEventListener("resize", () => {
        clearTimeout(temporizador);

        temporizador = setTimeout(() => {
            calcularPaginas();
        }, 150);
    });

    calcularPaginas();
});