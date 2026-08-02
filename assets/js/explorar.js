document.addEventListener("DOMContentLoaded", () => {
    const svg = document.querySelector("#mapa-aletheia svg");

    const fichaModulo = document.getElementById("ficha-modulo");
    const nombreModulo = document.getElementById("modulo-nombre");
    const areaModulo = document.getElementById("modulo-area");
    const descripcionModulo = document.getElementById(
        "modulo-descripcion"
    );
    const imagenModulo = document.getElementById("modulo-imagen");
    const estadoFicha = document.querySelector(
        ".ficha-modulo__estado"
    );

    const botonNivel1 = document.getElementById("mostrar-nivel-1");
    const botonNivel2 = document.getElementById("mostrar-nivel-2");

    if (!svg) {
        console.error("No se encontró el mapa SVG.");
        return;
    }

    const nivel1 = svg.querySelector("#g1");
    const nivel2 = svg.querySelector("#g2");

    if (!nivel1 || !nivel2) {
        console.error(
            "No se encontraron los grupos g1 y g2 del SVG."
        );
        return;
    }

    if (
        !fichaModulo ||
        !nombreModulo ||
        !areaModulo ||
        !descripcionModulo ||
        !imagenModulo ||
        !estadoFicha
    ) {
        console.error("Faltan elementos de la ficha.");
        return;
    }

    if (!botonNivel1 || !botonNivel2) {
        console.error("No se encontraron los botones de nivel.");
        return;
    }

    const modulosNivel1 = nivel1.querySelectorAll(
        'g[id^="L1_"]'
    );

    const modulosNivel2 = nivel2.querySelectorAll(
        'g[id^="L2_"]'
    );

    const todosLosModulos = [
        ...modulosNivel1,
        ...modulosNivel2
    ];

    const datosGenerales = {
        nombre: "ALÉTHEIA",
        area: "Organización estructural",
        imagen: "assets/img/ALETHEIA-NIVELES.jpg",
        imagenAlt:
            "Representación general de la estructura de ALÉTHEIA",
        descripcion:
            "ALÉTHEIA está organizada en dos niveles estructurales. Estos niveles no deben confundirse con las cubiertas interiores de cada módulo. El Nivel 1 concentra la mayor parte de las instalaciones habitables, científicas, industriales y de soporte. El Nivel 2 alberga instalaciones complementarias, zonas de reserva y sistemas de apoyo."
    };

    const datosModulos = {
        L1_001: {
            nombre: "NEXUS",
            area: "Propulsión y navegación",
            imagen: "assets/img/NEXUS.jpg",
            imagenAlt:
                "Interpretación visual del módulo NEXUS",
            descripcion:
                "Núcleo central de ALÉTHEIA. Alberga los sistemas asociados a la propulsión gravitatoria y a la navegación de la nave."
        }
    };

    function eliminarSeleccion() {
        svg
            .querySelectorAll(".modulo-seleccionado")
            .forEach((modulo) => {
                modulo.classList.remove(
                    "modulo-seleccionado"
                );
            });
    }

    function mostrarDatos(datos, estado) {
        estadoFicha.textContent = estado;
        nombreModulo.textContent = datos.nombre;
        areaModulo.textContent = datos.area;
        descripcionModulo.textContent = datos.descripcion;

        imagenModulo.src = datos.imagen;
        imagenModulo.alt = datos.imagenAlt;

        fichaModulo.classList.remove(
            "ficha-modulo--oculta"
        );
    }

    function mostrarFichaGeneral() {
        eliminarSeleccion();

        mostrarDatos(
            datosGenerales,
            "Estructura de ALÉTHEIA"
        );
    }

    function mostrarFichaModulo(modulo) {
        eliminarSeleccion();

        modulo.classList.add("modulo-seleccionado");

        const datos = datosModulos[modulo.id];

        if (!datos) {
            mostrarDatos(
                {
                    nombre: modulo.id,
                    area: "Información pendiente",
                    imagen:
                        "assets/img/ALETHEIA-NIVELES.jpg",
                    imagenAlt:
                        "Representación general de ALÉTHEIA",
                    descripcion:
                        "Este módulo todavía no tiene una ficha asociada."
                },
                "Módulo seleccionado"
            );

            return;
        }

        mostrarDatos(
            datos,
            "Módulo seleccionado"
        );
    }

    function actualizarBotones(esNivel1) {
        botonNivel1.classList.toggle(
            "selector-nivel__boton--activo",
            esNivel1
        );

        botonNivel2.classList.toggle(
            "selector-nivel__boton--activo",
            !esNivel1
        );

        botonNivel1.setAttribute(
            "aria-pressed",
            String(esNivel1)
        );

        botonNivel2.setAttribute(
            "aria-pressed",
            String(!esNivel1)
        );
    }

    function mostrarNivel(numeroNivel) {
        const esNivel1 = numeroNivel === 1;

        eliminarSeleccion();

        nivel1.style.display = esNivel1 ? "" : "none";
        nivel2.style.display = esNivel1 ? "none" : "";

        actualizarBotones(esNivel1);
        mostrarFichaGeneral();
    }

    todosLosModulos.forEach((modulo) => {
        modulo.style.cursor = "pointer";
        modulo.setAttribute("role", "button");
        modulo.setAttribute("tabindex", "0");

        modulo.addEventListener("click", () => {
            mostrarFichaModulo(modulo);
        });

        modulo.addEventListener("keydown", (evento) => {
            if (
                evento.key === "Enter" ||
                evento.key === " "
            ) {
                evento.preventDefault();
                mostrarFichaModulo(modulo);
            }
        });
    });

    botonNivel1.addEventListener("click", () => {
        mostrarNivel(1);
    });

    botonNivel2.addEventListener("click", () => {
        mostrarNivel(2);
    });

    svg.setAttribute(
        "preserveAspectRatio",
        "xMidYMid meet"
    );

    mostrarNivel(1);
});