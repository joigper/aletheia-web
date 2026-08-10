document.addEventListener("DOMContentLoaded", () => {
    const listaPersonajes = document.getElementById("lista-personajes");
    const fichaPersonaje = document.getElementById("ficha-personaje");
    const tripulacionContenido = document.querySelector(
    ".tripulacion-contenido"
);
    const botonRetratos = document.getElementById("toggle-retratos");

    let retratosVisibles = false;
    let personajeActual = null;

    if (!listaPersonajes || !fichaPersonaje || !botonRetratos) {
        console.error(
            "No se encontraron #lista-personajes o #ficha-personaje."
        );
        return;
    }

    const personajes = window.personajes;

    if (!Array.isArray(personajes) || personajes.length === 0) {
        listaPersonajes.innerHTML =
            "<p>No se pudieron cargar los personajes.</p>";
        return;
    }

    const personajesOrdenados = [...personajes].sort((a, b) => {
        return (a.orden ?? 999) - (b.orden ?? 999);
    });

    function mostrarFicha(personaje) {
        personajeActual = personaje;

        const nombreCompleto = [
            personaje.nombre,
            personaje.apellidos
        ]
            .filter(Boolean)
            .join(" ");

        const imagenHtml = retratosVisibles
            ? personaje.retratoDisponible && personaje.imagen
                ? `
                    <div class="personaje-ficha__imagen-bloque">
                        <img
                            class="personaje-ficha__imagen"
                            src="assets/img/${personaje.imagen}"
                            alt="${personaje.imagenAlt || nombreCompleto}"
                        >

                        <p class="personaje-ficha__imagen-aviso">
                            Interpretación visual del autor
                        </p>
                    </div>
                `
                : `
                    <div class="personaje-ficha__sin-imagen">
                        <span>Retrato no disponible</span>
                    </div>
                `
            : `
                <div class="personaje-ficha__sin-imagen personaje-ficha__sin-imagen--oculto">
                    <span>Retrato oculto</span>
                </div>
            `;

        fichaPersonaje.innerHTML = `
            <article
                class="personaje-ficha"
                data-departamento="${personaje.departamento || "general"}"
            >
                <header class="personaje-ficha__cabecera">

    <div class="personaje-ficha__nav-movil">

        <button
            id="anterior-ficha-personaje"
            class="personaje-ficha__nav-boton"
            type="button"
        >
            Anterior
        </button>

        <button
            id="siguiente-ficha-personaje"
            class="personaje-ficha__nav-boton"
            type="button"
        >
            Siguiente
        </button>

        <button
            id="cerrar-ficha-personaje"
            class="personaje-ficha__cerrar"
            type="button"
        >
            Cerrar
        </button>

    </div>

    <div>
                        <p class="personaje-ficha__registro">
                            ALÉTHEIA · REGISTRO DE TRIPULACIÓN
                        </p>

                        <h2 class="personaje-ficha__nombre">
                            ${nombreCompleto}
                        </h2>

                        <p class="personaje-ficha__cargo">
                            ${personaje.cargo || ""}
                        </p>
                    </div>

                    <span class="personaje-ficha__departamento">
                        ${personaje.departamento || ""}
                    </span>
                </header>

                <div class="personaje-ficha__separador"></div>

                <div class="personaje-ficha__principal">
                    ${imagenHtml}

                    <dl class="personaje-ficha__datos">
                        <div class="personaje-ficha__dato">
                            <dt>Nacionalidad</dt>
                            <dd>${personaje.nacionalidad || "No indicada"}</dd>
                        </div>

                        <div class="personaje-ficha__dato">
                            <dt>Lugar de nacimiento</dt>
                            <dd>${personaje.ciudadNacimiento || "No indicado"}</dd>
                        </div>

                        <div class="personaje-ficha__dato">
                            <dt>Asignación</dt>
                            <dd>${personaje.moduloTrabajo || "No indicada"}</dd>
                        </div>
                    </dl>
                </div>

                <div class="personaje-ficha__separador"></div>

                <div class="personaje-ficha__descripcion">
                    <p class="personaje-ficha__descripcion-corta">
                        ${personaje.descripcionCorta || ""}
                    </p>

                    <p class="personaje-ficha__descripcion-larga">
                        ${personaje.descripcionLarga || ""}
                    </p>
                </div>

                <footer class="personaje-ficha__pie">
                    ARCHIVO DE PERSONAL · ALÉTHEIA
                </footer>
            </article>
        `;
        const botonCerrarFicha = document.getElementById(
    "cerrar-ficha-personaje"
);

const botonAnteriorFicha = document.getElementById(
    "anterior-ficha-personaje"
);

const botonSiguienteFicha = document.getElementById(
    "siguiente-ficha-personaje"
);


function navegarFicha(direccion) {

    const indiceActual = personajesOrdenados.findIndex(
        (item) => item.id === personajeActual?.id
    );

    if (indiceActual === -1) return;

    const total = personajesOrdenados.length;

    const nuevoIndice =
        (indiceActual + direccion + total) % total;

    mostrarFicha(
        personajesOrdenados[nuevoIndice]
    );

    if (
    window.matchMedia(
        "(max-width: 575.98px)"
    ).matches
) {
    requestAnimationFrame(() => {
        const navegacionFicha =
            document.querySelector(
                ".personaje-ficha__nav-movil"
            );

        if (navegacionFicha) {
            navegacionFicha.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
}
}


if (botonAnteriorFicha) {

    botonAnteriorFicha.addEventListener(
        "click",
        () => {
            navegarFicha(-1);
        }
    );

}


if (botonSiguienteFicha) {

    botonSiguienteFicha.addEventListener(
        "click",
        () => {
            navegarFicha(1);
        }
    );

}


if (botonCerrarFicha) {

    botonCerrarFicha.addEventListener(
        "click",
        () => {

            tripulacionContenido.classList.remove(
                "modo-ficha-movil"
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}
        const fichaActiva =
    fichaPersonaje.querySelector(
        ".personaje-ficha"
    );

if (fichaActiva) {

    let inicioX = 0;
    let inicioY = 0;
    let seguimientoTactil = false;


    fichaActiva.addEventListener(
        "touchstart",
        (evento) => {

            if (
                !window.matchMedia(
                    "(max-width: 575.98px)"
                ).matches
            ) {
                return;
            }

            const toque =
                evento.changedTouches[0];

            inicioX = toque.clientX;
            inicioY = toque.clientY;

            seguimientoTactil = true;

        },
        { passive: true }
    );


    fichaActiva.addEventListener(
        "touchend",
        (evento) => {

            if (!seguimientoTactil) return;

            seguimientoTactil = false;

            const toque =
                evento.changedTouches[0];

            const desplazamientoX =
                toque.clientX - inicioX;

            const desplazamientoY =
                toque.clientY - inicioY;

            const umbral = 60;


            /*
             * Ignoramos movimientos pequeños
             * y desplazamientos principalmente
             * verticales.
             */
            if (
                Math.abs(desplazamientoX) < umbral ||
                Math.abs(desplazamientoX) <=
                    Math.abs(desplazamientoY)
            ) {
                return;
            }


            /*
             * Deslizar hacia la izquierda:
             * siguiente personaje.
             *
             * Deslizar hacia la derecha:
             * personaje anterior.
             */
            navegarFicha(
                desplazamientoX < 0 ? 1 : -1
            );

        },
        { passive: true }
    );

}
      document
            .querySelectorAll(".personaje-lista__boton")
            .forEach((boton) => {
                boton.classList.toggle(
                    "is-active",
                    boton.dataset.personajeId === personaje.id
                );
            });
    }

    botonRetratos.addEventListener("click", () => {
        retratosVisibles = !retratosVisibles;

        botonRetratos.textContent = retratosVisibles
            ? "Ocultar retratos"
            : "Mostrar retratos";

        botonRetratos.setAttribute(
            "aria-pressed",
            String(retratosVisibles)
        );

        if (personajeActual) {
            mostrarFicha(personajeActual);
        }
    });

    personajesOrdenados.forEach((personaje) => {
        const nombreCompleto = [
            personaje.nombre,
            personaje.apellidos
        ]
            .filter(Boolean)
            .join(" ");

        const boton = document.createElement("button");

        boton.type = "button";
        boton.className = "personaje-lista__boton";
        boton.dataset.personajeId = personaje.id;

        boton.innerHTML = `
            <span class="personaje-lista__nombre">
                ${nombreCompleto}
            </span>

            <span class="personaje-lista__cargo">
                ${personaje.cargo || ""}
            </span>
        `;

        boton.addEventListener("click", () => {
    mostrarFicha(personaje);

    if (
        tripulacionContenido &&
        window.matchMedia("(max-width: 575.98px)").matches
    ) {
        tripulacionContenido.classList.add(
            "modo-ficha-movil"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
});

        listaPersonajes.appendChild(boton);
    });

    mostrarFicha(personajesOrdenados[0]);
});