document.addEventListener("DOMContentLoaded", () => {
    const listaNaves = document.getElementById("lista-naves");
    const fichaNave = document.getElementById("ficha-nave");

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

            ${imagenHtml}

            <div class="nave-ficha__acciones">
                ${botonImagenesHtml}
            </div>

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
        });

        listaNaves.appendChild(boton);
    });

    mostrarFicha(naves[0]);
});