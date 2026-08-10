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
            </header>

            <div class="nave-ficha__separador"></div>

<p class="nave-ficha__funcion">
    ${nave.funcion || ""}
</p>

${imagenHtml}

<div class="nave-ficha__acciones">
    ${botonImagenesHtml}
</div>

<div class="nave-ficha__separador"></div>

<dl class="nave-ficha__datos">

    <div class="nave-ficha__dato">
        <dt>Longitud</dt>
        <dd>${nave.longitud || "No indicada"}</dd>
    </div>

    <div class="nave-ficha__dato">
        <dt>Anchura</dt>
        <dd>${nave.anchura || "No indicada"}</dd>
    </div>

    <div class="nave-ficha__dato">
        <dt>Capacidad</dt>
        <dd>${nave.capacidad || "No indicada"}</dd>
    </div>

    <div class="nave-ficha__dato">
        <dt>Unidades</dt>
        <dd>${nave.unidades || "No indicado"}</dd>
    </div>

    <div class="nave-ficha__dato">
        <dt>Capacidad de salto</dt>
        <dd>${nave.salto || "No indicada"}</dd>
    </div>

    <div class="nave-ficha__dato">
        <dt>Alojamiento</dt>
        <dd>${nave.hangar || "No indicado"}</dd>
    </div>

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