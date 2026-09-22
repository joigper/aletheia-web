document.addEventListener("DOMContentLoaded", () => {

    const videoA = document.getElementById("zeus-video-a");
    const videoB = document.getElementById("zeus-video-b");

    if (!videoA || !videoB) return;

    const preguntas = document.querySelectorAll(".zeus-question");

    const basePath = "assets/img/zeus/";

    const idlePrincipal = "zeus00.mp4";

    const gestos = [
        "zeus01.mp4",
        "zeus02.mp4",
        "zeus03.mp4",
        "zeus04.mp4",
        "zeus05.mp4"
    ];

    const explicaciones = [
        "zeusexpl01.mp4",
        "zeusexpl02.mp4",
        "zeusexpl03.mp4",
        "zeusexpl04.mp4",
        null
    ];

    let activo = videoA;
    let preparado = videoB;
    let ultimoGesto = null;

    let modoExplicacion = false;
    let preguntaActiva = null;


    function elegirSiguienteClip() {

        // El 70 % de las veces Sabine permanece tranquila.
        if (Math.random() < 0.70) {
            return idlePrincipal;
        }

        // Evitamos repetir inmediatamente el mismo gesto.
        const disponibles = gestos.filter(
            gesto => gesto !== ultimoGesto
        );

        const elegido =
            disponibles[Math.floor(Math.random() * disponibles.length)];

        ultimoGesto = elegido;

        return elegido;
    }


    function cargarEnPreparado(nombre) {

        preparado.pause();
        preparado.muted = true;
        preparado.src = basePath + nombre;
        preparado.load();
    }


    function prepararSiguienteIdle() {

        const siguiente = elegirSiguienteClip();
        cargarEnPreparado(siguiente);
    }


    function mostrarPreparado(conSonido = false) {

        preparado.currentTime = 0;
        preparado.muted = !conSonido;

        preparado.classList.add("zeus-video-active");
        activo.classList.remove("zeus-video-active");

        activo.pause();

        const promesa = preparado.play();

        if (promesa !== undefined) {
            promesa.catch(() => {});
        }

        const anterior = activo;
        activo = preparado;
        preparado = anterior;
    }


    function iniciarExplicacion(indice) {

        const archivo = explicaciones[indice];

        if (!archivo) return;

        modoExplicacion = true;
        preguntaActiva = indice;

        preguntas.forEach((pregunta, i) => {
            pregunta.classList.toggle("active", i === indice);
        });

        /*
         * Cargamos la explicación en el vídeo oculto.
         * El clic del usuario permite reproducirla con sonido.
         */
        preparado.pause();
        preparado.src = basePath + archivo;
        preparado.muted = false;
        preparado.load();

        const iniciarCuandoEsteLista = () => {

            preparado.removeEventListener(
                "canplay",
                iniciarCuandoEsteLista
            );

            mostrarPreparado(true);
        };

        preparado.addEventListener(
            "canplay",
            iniciarCuandoEsteLista
        );
    }


    function terminarExplicacion() {

        modoExplicacion = false;
        preguntaActiva = null;

        preguntas.forEach(pregunta => {
            pregunta.classList.remove("active");
        });

        /*
         * Tras responder, Sabine vuelve siempre al idle principal.
         */
        preparado.pause();
        preparado.muted = true;
        preparado.src = basePath + idlePrincipal;
        preparado.load();

        const volverAlIdle = () => {

            preparado.removeEventListener(
                "canplay",
                volverAlIdle
            );

            mostrarPreparado(false);

            // Mientras reproduce zeus00,
            // dejamos preparado el siguiente gesto.
            prepararSiguienteIdle();
        };

        preparado.addEventListener(
            "canplay",
            volverAlIdle
        );
    }


    function alTerminarVideo(video) {

        if (video !== activo) return;

        if (modoExplicacion) {
            terminarExplicacion();
            return;
        }

        /*
         * Funcionamiento normal de Sabine en espera:
         * el siguiente idle ya está precargado.
         */
        mostrarPreparado(false);
        prepararSiguienteIdle();
    }


    videoA.addEventListener("ended", () => {
        alTerminarVideo(videoA);
    });


    videoB.addEventListener("ended", () => {
        alTerminarVideo(videoB);
    });


    preguntas.forEach((pregunta, indice) => {

        pregunta.addEventListener("click", () => {

            if (!explicaciones[indice]) return;

            iniciarExplicacion(indice);
        });
    });


    /*
     * Mientras se reproduce el primer zeus00,
     * cargamos el siguiente idle.
     */
    prepararSiguienteIdle();

});