document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contacto-form");
    const mensajeExito = document.getElementById("contacto-exito");
    const mensajeError = document.getElementById("contacto-error");
    const capitan = document.getElementById("contacto-capitan");

    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const boton = form.querySelector('button[type="submit"]');

        // Evita envíos duplicados mientras se procesa el mensaje.
        boton.disabled = true;
        mensajeExito.classList.add("d-none");
        mensajeError.classList.add("d-none");

        try {
            const respuesta = await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!respuesta.ok) {
                throw new Error("Error al enviar el formulario");
            }

            // Limpiamos los campos después de un envío correcto.
            form.reset();

            // Ocultamos el formulario y mostramos la confirmación.
            form.classList.add("d-none");
            capitan.classList.remove("d-none");
            capitan.classList.add("d-block");
            mensajeExito.classList.remove("d-none");

        } catch (error) {
            mensajeError.classList.remove("d-none");
            boton.disabled = false;
        }
    });
});