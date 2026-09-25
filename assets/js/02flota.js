document.addEventListener("DOMContentLoaded", () => {
    const listaNaves = document.getElementById("lista-naves");
    const fichaNave = document.getElementById("ficha-nave");
    const flotaContenido = document.querySelector(".flota-contenido");
    let naveActual = null;

    if (!listaNaves || !fichaNave) {
        console.error("No se encontraron #lista-naves o #ficha-nave.");
        return;
    }

    const naves = window.naves;

    if (!Array.isArray(naves) || naves.length === 0) {
        listaNaves.innerHTML =
            "<p>No se pudieron cargar las naves.</p>";
        return;
    }

    function mostrarFicha(nave) {
        naveActual = nave;
    let indiceImagen = 0;

    const imagenes = Array.isArray(nave.imagenes)
        ? nave.imagenes
        : [];

    const imagenPrincipal = imagenes[0];

    const imagenHtml = imagenPrincipal
        ? `
            <div class="nave-ficha__imagen-wrap">
                <img
                    id="nave-imagen"
                    class="nave-ficha__imagen"
                    src="${imagenPrincipal.src}"
                    alt="${imagenPrincipal.alt || nave.nombre}"
                >
            </div>
        `
        : "";

    const botonImagenesHtml = imagenes.length > 1
        ? `
            <button
                id="nave-mas-imagenes"
                class="nave-ficha__mas-imagenes"
                type="button"
            >
                Más imágenes
            </button>
        `
        : "";

    const datosPredeterminados = [
        { etiqueta: "Longitud", valor: nave.longitud || "No indicada" },
        { etiqueta: "Anchura", valor: nave.anchura || "No indicada" },
        { etiqueta: "Capacidad", valor: nave.capacidad || "No indicada" },
        { etiqueta: "Unidades", valor: nave.unidades || "No indicado" },
        { etiqueta: "Capacidad de salto", valor: nave.salto || "No indicada" },
        { etiqueta: "Alojamiento", valor: nave.hangar || "No indicado" }
    ];

    const datosFicha = Array.isArray(nave.datos)
        ? nave.datos
        : datosPredeterminados;

    const datosHtml = datosFicha.map((dato) => `
        <div class="nave-ficha__dato">
            <dt>${dato.etiqueta}</dt>
            <dd>${dato.valor}</dd>
        </div>
    `).join("");

    const botonCuriosidadesHtml = nave.curiosidad
        ? `
            <button
                id="nave-curiosidades-boton"
                class="nave-ficha__curiosidades-boton"
                type="button"
                aria-expanded="false"
                aria-controls="nave-curiosidades-panel"
            >
                <span class="nave-ficha__curiosidades-icono" aria-hidden="true">✦</span>
                <span>
                    <small>Archivo de escala</small>
                    Curiosidades de ALÉTHEIA
                </span>
            </button>
        `
        : "";

    const datosAnimacionHtml = nave.curiosidad?.referencia?.datos
        ?.map((dato, indice) => `
            <div
                class="curiosidades-animacion__dato"
                style="--dato-indice: ${indice}"
            >
                <span>${dato.etiqueta}</span>
                <strong class="curiosidades-animacion__valor-legend">${dato.valor}</strong>
                <strong class="curiosidades-animacion__valor-aletheia">${dato.aletheia}</strong>
            </div>
        `).join("") || "";

    const panelCuriosidadesHtml = nave.curiosidad
        ? `
            <div class="nave-ficha__curiosidades">
                <section
                    id="nave-curiosidades-panel"
                    class="nave-ficha__curiosidades-panel"
                    hidden
                >
                    <p class="nave-ficha__curiosidades-etiqueta">
                        Comparaciones visuales
                    </p>
                    <h3>ALÉTHEIA frente a escalas terrestres</h3>

                    <div
                        id="curiosidades-animacion"
                        class="curiosidades-animacion"
                        aria-label="Animación comparativa entre el USS Gerald R. Ford y ALÉTHEIA"
                    >
                        <div class="curiosidades-animacion__escena">
                            <svg
                                viewBox="0 0 1000 560"
                                role="img"
                                aria-labelledby="comparacion-titulo comparacion-descripcion"
                            >
                                <title id="comparacion-titulo">
                                    USS Gerald R. Ford dentro de ALÉTHEIA
                                </title>
                                <desc id="comparacion-descripcion">
                                    Vista lateral esquemática a escala. El portaaviones mide aproximadamente 333 metros frente a los 953 metros de ALÉTHEIA.
                                </desc>
                                <defs>
                                    <pattern id="curiosidades-grid" width="25" height="25" patternUnits="userSpaceOnUse">
                                        <path d="M 25 0 L 0 0 0 25" fill="none" stroke="currentColor" stroke-width="0.6"></path>
                                    </pattern>
                                </defs>

                                <rect class="curiosidades-animacion__grid" width="1000" height="560" fill="url(#curiosidades-grid)"></rect>

                                <g class="curiosidades-animacion__aletheia">
                                    <rect x="23.5" y="330" width="953" height="50" rx="3"></rect>
                                    <rect x="283.5" y="280" width="433" height="50" rx="3"></rect>
                                    <path d="M23.5 330H976.5M283.5 280H716.5"></path>
                                    <text x="500" y="250">ALÉTHEIA · 953 m · DOS NIVELES</text>
                                </g>

                                <g class="curiosidades-animacion__crucero">
                                    <path d="M333.5 350 L354 322 L643 322 L666.5 342 L645 366 L368 366 Z"></path>
                                    <path class="detalle" d="M350 318 H654 M382 340 H640 M414 355 H610"></path>
                                    <path class="detalle" d="M525 318 L530 286 H568 L579 318 Z"></path>
                                    <line class="detalle" x1="551" y1="286" x2="551" y2="253"></line>
                                    <line class="detalle" x1="551" y1="263" x2="572" y2="263"></line>
                                    <text x="500" y="410">USS GERALD R. FORD · ≈ 333 m</text>
                                </g>

                                <g class="curiosidades-animacion__cotas-finales">
                                    <line x1="23.5" y1="440" x2="976.5" y2="440"></line>
                                    <line x1="23.5" y1="430" x2="23.5" y2="450"></line>
                                    <line x1="976.5" y1="430" x2="976.5" y2="450"></line>
                                    <text x="500" y="470">ALÉTHEIA ES APROXIMADAMENTE 2,6 VECES MÁS LARGA</text>
                                </g>
                            </svg>

                            <div class="curiosidades-animacion__datos" aria-hidden="true">
                                <div class="curiosidades-animacion__datos-cabecera">
                                    <span>Dato</span>
                                    <strong>USS FORD</strong>
                                    <strong>ALÉTHEIA</strong>
                                </div>
                                ${datosAnimacionHtml}
                                <div class="curiosidades-animacion__revelacion">
                                    Y AUN ASÍ…
                                </div>
                            </div>
                        </div>

                        <div class="curiosidades-animacion__controles">
                            <button id="curiosidades-repetir" type="button">
                                Repetir
                            </button>
                            <button id="curiosidades-saltar" type="button">
                                Saltar animación
                            </button>
                        </div>
                    </div>

                    <div class="nave-ficha__curiosidad-dato">
                        <h4>${nave.curiosidad.titulo}</h4>
                        <p class="nave-ficha__curiosidades-cifra">
                            ${nave.curiosidad.cifra}
                        </p>
                        <p class="nave-ficha__curiosidades-equivalencia">
                            ${nave.curiosidad.equivalencia}
                        </p>
                        <p class="nave-ficha__curiosidades-nota">
                            ${nave.curiosidad.nota}
                        </p>
                    </div>
                </section>
            </div>
        `
        : "";

    fichaNave.innerHTML = `
        <article class="nave-ficha">

            <header class="nave-ficha__cabecera">

    <div class="nave-ficha__nav-movil">

        <button
            id="anterior-ficha-nave"
            class="nave-ficha__nav-boton"
            type="button"
        >
            Anterior
        </button>

        <button
            id="siguiente-ficha-nave"
            class="nave-ficha__nav-boton"
            type="button"
        >
            Siguiente
        </button>

        <button
            id="cerrar-ficha-nave"
            class="nave-ficha__cerrar"
            type="button"
        >
            Cerrar
        </button>

    </div>

    <div>
                    <p class="nave-ficha__registro">
                        ALÉTHEIA · REGISTRO DE FLOTA
                    </p>

                    <h2 class="nave-ficha__nombre">
                        ${nave.nombre}
                    </h2>

                    <p class="nave-ficha__tipo">
                        ${nave.tipo || ""}
                    </p>
                </div>

                ${botonCuriosidadesHtml}
            </header>

            <div class="nave-ficha__separador"></div>

            ${panelCuriosidadesHtml}

<p class="nave-ficha__funcion">
    ${nave.funcion || ""}
</p>

${imagenHtml}

<div class="nave-ficha__acciones">
    ${botonImagenesHtml}
</div>

<div class="nave-ficha__separador"></div>

<dl class="nave-ficha__datos">
    ${datosHtml}
</dl>

            <div class="nave-ficha__separador"></div>

            <div class="nave-ficha__descripcion">
                <p>
                    ${nave.descripcion || ""}
                </p>
            </div>

            <footer class="nave-ficha__pie">
                ARCHIVO DE FLOTA · ALÉTHEIA
            </footer>

        </article>
    `;

    const botonCuriosidades = document.getElementById(
        "nave-curiosidades-boton"
    );

    const panelCuriosidades = document.getElementById(
        "nave-curiosidades-panel"
    );

    const animacionCuriosidades = document.getElementById(
        "curiosidades-animacion"
    );

    const botonRepetirCuriosidades = document.getElementById(
        "curiosidades-repetir"
    );

    const botonSaltarCuriosidades = document.getElementById(
        "curiosidades-saltar"
    );

    function iniciarAnimacionCuriosidades() {
        if (!animacionCuriosidades) return;

        animacionCuriosidades.classList.remove(
            "is-playing",
            "is-complete"
        );

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            animacionCuriosidades.classList.add("is-complete");
            return;
        }

        void animacionCuriosidades.offsetWidth;
        animacionCuriosidades.classList.add("is-playing");
    }

    if (botonCuriosidades && panelCuriosidades) {
        botonCuriosidades.addEventListener("click", () => {
            const estaAbierto = !panelCuriosidades.hidden;

            panelCuriosidades.hidden = estaAbierto;
            botonCuriosidades.setAttribute(
                "aria-expanded",
                String(!estaAbierto)
            );
            botonCuriosidades.classList.toggle(
                "is-open",
                !estaAbierto
            );

            if (!estaAbierto) {
                iniciarAnimacionCuriosidades();
            }
        });
    }

    if (botonRepetirCuriosidades) {
        botonRepetirCuriosidades.addEventListener(
            "click",
            iniciarAnimacionCuriosidades
        );
    }

    if (botonSaltarCuriosidades && animacionCuriosidades) {
        botonSaltarCuriosidades.addEventListener("click", () => {
            animacionCuriosidades.classList.remove("is-playing");
            animacionCuriosidades.classList.add("is-complete");
        });
    }
        
    const botonAnteriorFicha = document.getElementById(
    "anterior-ficha-nave"
);

const botonSiguienteFicha = document.getElementById(
    "siguiente-ficha-nave"
);

const botonCerrarFicha = document.getElementById(
    "cerrar-ficha-nave"
);


function navegarFicha(direccion) {

    const indiceActual = naves.findIndex(
        (item) => item.id === naveActual?.id
    );

    if (indiceActual === -1) return;

    const total = naves.length;

    const nuevoIndice =
        (indiceActual + direccion + total) % total;

    mostrarFicha(
        naves[nuevoIndice]
    );

    if (
        window.matchMedia(
            "(max-width: 575.98px)"
        ).matches
    ) {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
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

            flotaContenido.classList.remove(
                "modo-ficha-movil"
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );
}


/* =========================================
   GESTO LATERAL EN MÓVIL
   ========================================= */

const fichaActiva =
    fichaNave.querySelector(
        ".nave-ficha"
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
             * Izquierda = siguiente.
             * Derecha = anterior.
             */
            navegarFicha(
                desplazamientoX < 0 ? 1 : -1
            );

        },
        { passive: true }
    );

}

    const botonMasImagenes = document.getElementById(
        "nave-mas-imagenes"
    );

    const imagenNave = document.getElementById(
        "nave-imagen"
    );

    if (
        botonMasImagenes &&
        imagenNave &&
        imagenes.length > 1
    ) {
        botonMasImagenes.addEventListener("click", () => {
            indiceImagen =
                (indiceImagen + 1) % imagenes.length;

            imagenNave.src =
                imagenes[indiceImagen].src;

            imagenNave.alt =
                imagenes[indiceImagen].alt ||
                nave.nombre;
        });
    }

    document
        .querySelectorAll(".nave-lista__boton")
        .forEach((boton) => {
            boton.classList.toggle(
                "is-active",
                boton.dataset.naveId === nave.id
            );
        });
}
    naves.forEach((nave) => {
        const boton = document.createElement("button");

        boton.type = "button";
        boton.className = "nave-lista__boton";
        boton.dataset.naveId = nave.id;

        boton.innerHTML = `
    <span class="nave-lista__icono">
        <img src="${nave.icono}" alt="">
    </span>

    <span class="nave-lista__nombre">
        ${nave.nombre}
    </span>
`;

        boton.addEventListener("click", () => {
    mostrarFicha(nave);

    if (
        flotaContenido &&
        window.matchMedia("(max-width: 575.98px)").matches
    ) {
        flotaContenido.classList.add("modo-ficha-movil");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
});

        listaNaves.appendChild(boton);
    });

    mostrarFicha(naves[0]);
});
