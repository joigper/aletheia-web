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
        fichaNave.innerHTML = `
            <h2>${nave.nombre}</h2>
        `;

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