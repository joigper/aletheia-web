document.addEventListener("DOMContentLoaded", () => {
    const listaPersonajes = document.getElementById("lista-personajes");
    const fichaPersonaje = document.getElementById("ficha-personaje");

    if (!listaPersonajes || !fichaPersonaje) {
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
    const nombreCompleto = [
        personaje.nombre,
        personaje.apellidos
    ]
        .filter(Boolean)
        .join(" ");

    const imagenHtml =
        personaje.retratoDisponible && personaje.imagen
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
            `;

    fichaPersonaje.innerHTML = `
        <article
            class="personaje-ficha"
            data-departamento="${personaje.departamento || "general"}"
        >
            <header class="personaje-ficha__cabecera">
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

    document
        .querySelectorAll(".personaje-lista__boton")
        .forEach((boton) => {
            boton.classList.toggle(
                "is-active",
                boton.dataset.personajeId === personaje.id
            );
        });
}

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
        });

        listaPersonajes.appendChild(boton);
    });

    mostrarFicha(personajesOrdenados[0]);
});