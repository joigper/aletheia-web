(() => {
    const canvas = document.querySelector("#granjaCanvas");
    const portada = document.querySelector("#granjaPortada");
    const entrar = document.querySelector("#granjaEntrar");
    const cargaTexto = document.querySelector("#granjaCargaTexto");
    const hud = document.querySelector("#granjaHud");
    const fps = document.querySelector("#granjaFps");
    const cubierta = document.querySelector("#granjaCubierta");
    const error = document.querySelector("#granjaError");
    const controlesTactiles = document.querySelector("#granjaControlesTactiles");
    const joystickMover = document.querySelector("#granjaMover");
    const joystickMirar = document.querySelector("#granjaMirar");
    const botonRapido = document.querySelector("#granjaRapido");
    const esTactil = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;

    const actualizarCarga = (porcentaje, mensaje) => {
        const valor = Math.max(0, Math.min(100, porcentaje));
        entrar.style.setProperty("--progreso-carga", `${valor}%`);
        entrar.setAttribute("aria-valuenow", Math.round(valor));
        cargaTexto.textContent = `${mensaje} ${Math.round(valor)} %`;
    };
    actualizarCarga(2, "INICIANDO…");

    if (!window.BABYLON) {
        error.hidden = false;
        error.textContent = "No se ha podido cargar el motor 3D.";
        return;
    }

    const engine = new BABYLON.Engine(canvas, true, { powerPreference: "high-performance" });
    const scene = new BABYLON.Scene(engine);
    // [OPT] Babylon lanza un pick contra toda la escena en cada movimiento/click del
    // ratón. La visita no usa picking de puntero (la cámara usa sus propios eventos).
    scene.skipPointerMovePicking = true;
    scene.skipPointerDownPicking = true;
    scene.skipPointerUpPicking = true;

    // [OPT] Descargas en paralelo: todos los GLB secundarios y el mapa de hierba
    // empiezan a bajar a la vez que el terreno, en lugar de uno tras otro.
    const rutaModelos = "assets/img/granja/";
    const contenedoresPendientes = new Map();
    const cargarContenedor = archivo => {
        if (!contenedoresPendientes.has(archivo)) {
            const promesa = BABYLON.SceneLoader.LoadAssetContainerAsync(rutaModelos, archivo, scene);
            promesa.catch(() => {}); // el error real se gestiona donde se espera
            contenedoresPendientes.set(archivo, promesa);
        }
        return contenedoresPendientes.get(archivo);
    };
    [
        "tramain_house_1_france.glb", "tractor.glb", "bale.glb", "bag.glb", "establo.glb",
        "vaca.glb", "elmtree_mid.glb", "manzano_near.glb", "manzano_mid.glb",
        "mandarino_near_mid.glb", "mandarino_far.glb", "agapanthus_01.glb", "agapanthus_02.glb"
    ].forEach(cargarContenedor);
    const promesaMapaHierba = fetch(`${rutaModelos}granja-hierba-celdas-v1.bin`).then(respuesta => {
        if (!respuesta.ok) throw new Error(`No se ha podido cargar el mapa de hierba (${respuesta.status}).`);
        return respuesta.arrayBuffer();
    });
    promesaMapaHierba.catch(() => {});
    scene.clearColor = new BABYLON.Color4(0.025, 0.035, 0.04, 1);
    scene.collisionsEnabled = false;
    scene.gravity = BABYLON.Vector3.Zero();
    scene.imageProcessingConfiguration.toneMappingEnabled = true;
    scene.imageProcessingConfiguration.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
    scene.imageProcessingConfiguration.exposure = 1.08;
    scene.imageProcessingConfiguration.contrast = 1.14;
    // Bruma atmosférica: integra el LOD lejano con el horizonte sin ocultar edificios.
    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogStart = 45;
    scene.fogEnd = 145;
    scene.fogColor = new BABYLON.Color3(0.44, 0.60, 0.73);

    const camera = new BABYLON.UniversalCamera("visitante", new BABYLON.Vector3(0, 1.72, 0), scene);
    camera.rotation.y = 0.72;
    camera.minZ = 0.08;
    camera.speed = 0.48;
    camera.angularSensibility = 4800;
    camera.inertia = 0.12;
    camera.applyGravity = false;
    camera.checkCollisions = false;
    camera.ellipsoid = new BABYLON.Vector3(0.42, 0.86, 0.42);
    camera.ellipsoidOffset = new BABYLON.Vector3(0, -0.86, 0);
    camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
    camera.inputs.removeByType("FreeCameraTouchInput");
    scene.activeCamera = camera;

    const luz = new BABYLON.HemisphericLight("luz", new BABYLON.Vector3(0, 1, 0), scene);
    luz.diffuse = new BABYLON.Color3(0.78, 0.86, 1);
    luz.groundColor = new BABYLON.Color3(0.12, 0.16, 0.11);
    luz.intensity = 1.08;

    const luzLateral = new BABYLON.DirectionalLight(
        "luz-lateral-relieve",
        new BABYLON.Vector3(-0.55, -1, -0.38),
        scene
    );
    luzLateral.position = new BABYLON.Vector3(80, 38, 105);
    luzLateral.diffuse = new BABYLON.Color3(1, 0.91, 0.76);
    luzLateral.intensity = 1.22;

    const sombras = new BABYLON.ShadowGenerator(2048, luzLateral);
    sombras.useBlurExponentialShadowMap = true;
    sombras.blurKernel = 24;
    sombras.bias = 0.0008;
    sombras.normalBias = 0.03;

    const luzC2 = new BABYLON.PointLight("luz-cielo-c2", new BABYLON.Vector3(5, 14.2, -10), scene);
    luzC2.diffuse = new BABYLON.Color3(0.72, 0.84, 1);
    luzC2.intensity = 0.22;
    luzC2.range = 260;
    const luzC4 = new BABYLON.PointLight("luz-cielo-c4", new BABYLON.Vector3(-8, 39.2, 8), scene);
    luzC4.diffuse = new BABYLON.Color3(0.72, 0.84, 1);
    luzC4.intensity = 0.20;
    luzC4.range = 260;

    const superficiesTransitables = new Set();
    const obstaculosSolidos = new Set();
    const taludes = new Set();
    const obstaculosDinamicos = [];
    // Inicio junto al pie de la rampa para comprobarla inmediatamente.
    let inicio = new BABYLON.Vector3(43.5, 1.72, 49.5);
    let visitaActiva = false;
    let velocidadVertical = 0;
    let actualizarPraderaBromus = null;
    let actualizarManzanos = null;
    let actualizarMandarinos = null;
    let actualizarAgapantos = null;
    let actualizarVacas = null;
    const movimientoTactil = { x: 0, y: 0 };
    const miradaTactil = { x: 0, y: 0 };
    let multiplicadorTactil = 1;
    const contorno = [
        [156.967,159.375],[156.967,109.375],[113.666,84.375],[113.666,34.375],
        [70.365,9.375],[70.365,-40.625],[27.063,-65.625],[27.063,-115.625],
        [-16.238,-140.625],[-16.238,-190.625],[-59.539,-215.625],[-102.841,-190.625],
        [-102.841,-140.625],[-146.142,-115.625],[-146.142,-65.625],[-102.841,-40.625],
        [-102.841,9.375],[-59.539,34.375],[-59.539,84.375],[-16.238,109.375],
        [-16.238,159.375],[27.063,184.375],[70.365,159.375],[113.666,184.375]
    ];
    const barandillaC4 = [
        [[122.957, 116.258], [92.437, 71.897]],
        [[97.400, 133.803], [66.880, 89.442]],
        [[92.544, 89.548], [66.900, 71.877]]
    ];
    const murosHueco = [
        [[122.410, 116.393], [92.437, 71.897]],
        [[92.437, 71.897], [66.880, 89.442]],
        [[66.880, 89.442], [97.677, 133.372]]
    ];
    // Reserva amplia en planta: impide poblar tanto la propia rampa como el hueco inferior.
    const zonaSinArbolesRampa = { minX: 45, maxX: 135, minZ: 45, maxZ: 145 };
    const estaEnZonaRampa = (x, z) => x >= zonaSinArbolesRampa.minX &&
        x <= zonaSinArbolesRampa.maxX && z >= zonaSinArbolesRampa.minZ &&
        z <= zonaSinArbolesRampa.maxZ;
    const teclas = new Set();
    const teclasMovimiento = new Set([
        "KeyW", "KeyA", "KeyS", "KeyD",
        "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"
    ]);

    function recuperarVisitante() {
        camera.position.copyFrom(inicio);
        velocidadVertical = 0;
        camera.cameraDirection.set(0, 0, 0);
        camera.cameraRotation.set(0, 0);
    }

    function dentroDelContorno(x, z) {
        let dentro = false;
        for (let i = 0, j = contorno.length - 1; i < contorno.length; j = i++) {
            const [xi, zi] = contorno[i];
            const [xj, zj] = contorno[j];
            const cruza = (zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi;
            if (cruza) dentro = !dentro;
        }
        return dentro;
    }

    function distanciaASegmento(x, z, segmento) {
        const [[ax, az], [bx, bz]] = segmento;
        const dx = bx - ax;
        const dz = bz - az;
        const longitud2 = dx * dx + dz * dz;
        if (longitud2 === 0) return Math.hypot(x - ax, z - az);
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / longitud2));
        return Math.hypot(x - (ax + t * dx), z - (az + t * dz));
    }

    // [OPT] Segmentos del contorno precalculados: antes se creaban 24 arrays por consulta.
    const segmentosContorno = contorno.map((punto, i) => [punto, contorno[(i + 1) % contorno.length]]);
    function distanciaAlContorno(x, z) {
        let distancia = Infinity;
        for (let i = 0; i < segmentosContorno.length; i++) {
            const d = distanciaASegmento(x, z, segmentosContorno[i]);
            if (d < distancia) distancia = d;
        }
        return distancia;
    }

    // ------------------------------------------------------------------------
    // [OPT] Índice espacial de zonas excluidas.
    // zonasExcluidas tiene ~300 segmentos (la carretera perimetral suavizada).
    // Antes, cada consulta los recorría todos: al leer el .bin eran
    // 118.000 matas × 300 segmentos ≈ 35 millones de cálculos en la carga.
    // Ahora cada consulta solo mira los segmentos de su casilla de 8 m.
    // El índice se rehace solo si el array crece (se sigue llenando durante la carga).
    // ------------------------------------------------------------------------
    const TAMANO_CASILLA_ZONAS = 8;
    const MARGEN_MAXIMO_ZONAS = 8; // mayor margen extra usado por los llamadores (+7)
    const indicesZonas = new WeakMap();
    const claveCasilla = (cx, cz) => cx * 65536 + cz;
    function indiceZonas(zonas) {
        let indice = indicesZonas.get(zonas);
        if (indice && indice.longitud === zonas.length) return indice;
        indice = { longitud: zonas.length, casillas: new Map() };
        zonas.forEach(zona => {
            const [[ax, az], [bx, bz]] = zona.segmento;
            const alcance = zona.radio + MARGEN_MAXIMO_ZONAS;
            const minX = Math.floor((Math.min(ax, bx) - alcance) / TAMANO_CASILLA_ZONAS);
            const maxX = Math.floor((Math.max(ax, bx) + alcance) / TAMANO_CASILLA_ZONAS);
            const minZ = Math.floor((Math.min(az, bz) - alcance) / TAMANO_CASILLA_ZONAS);
            const maxZ = Math.floor((Math.max(az, bz) + alcance) / TAMANO_CASILLA_ZONAS);
            for (let cx = minX; cx <= maxX; cx++) {
                for (let cz = minZ; cz <= maxZ; cz++) {
                    const clave = claveCasilla(cx, cz);
                    let lista = indice.casillas.get(clave);
                    if (!lista) indice.casillas.set(clave, lista = []);
                    lista.push(zona);
                }
            }
        });
        indicesZonas.set(zonas, indice);
        return indice;
    }
    // Equivale a: zonas.some(z => z.cubierta === cubierta && dist(x,z,z.segmento) < z.radio + margen)
    function enZonaExcluida(zonas, x, z, cubierta, margen = 0) {
        if (margen > MARGEN_MAXIMO_ZONAS) {
            return zonas.some(zona => zona.cubierta === cubierta &&
                distanciaASegmento(x, z, zona.segmento) < zona.radio + margen);
        }
        const lista = indiceZonas(zonas).casillas.get(claveCasilla(
            Math.floor(x / TAMANO_CASILLA_ZONAS), Math.floor(z / TAMANO_CASILLA_ZONAS)
        ));
        if (!lista) return false;
        for (let i = 0; i < lista.length; i++) {
            const zona = lista[i];
            if (zona.cubierta === cubierta &&
                distanciaASegmento(x, z, zona.segmento) < zona.radio + margen) return true;
        }
        return false;
    }

    // ------------------------------------------------------------------------
    // [OPT] Consulta de alturas sin raycast.
    // scene.pickWithRay recorre TODAS las mallas de la escena y, para el suelo,
    // prueba el rayo contra todos sus triángulos. Se usaba para la cámara (cada
    // fotograma), cada vaca (cada fotograma) y miles de veces en la carga.
    // Aquí se proyectan una vez los triángulos en una rejilla XZ de 4 m y cada
    // consulta solo comprueba los triángulos de su casilla.
    // Devuelve la Y más alta entre yMin e yMax (= primer impacto de un rayo hacia abajo).
    // ------------------------------------------------------------------------
    const TAMANO_CASILLA_ALTURA = 4;
    const indicesAltura = new Map();
    function indiceAltura(malla) {
        let indice = indicesAltura.get(malla);
        if (indice) return indice;
        malla.computeWorldMatrix(true);
        const local = malla.getVerticesData(BABYLON.VertexBuffer.PositionKind) || [];
        const matriz = malla.getWorldMatrix();
        const mundo = new Float32Array(local.length);
        const temporal = new BABYLON.Vector3();
        for (let i = 0; i < local.length; i += 3) {
            BABYLON.Vector3.TransformCoordinatesFromFloatsToRef(local[i], local[i + 1], local[i + 2], matriz, temporal);
            mundo[i] = temporal.x; mundo[i + 1] = temporal.y; mundo[i + 2] = temporal.z;
        }
        let triangulos = malla.getIndices();
        if (!triangulos || !triangulos.length) {
            triangulos = Array.from({ length: local.length / 3 }, (_, i) => i);
        }
        const casillas = new Map();
        for (let t = 0; t + 2 < triangulos.length; t += 3) {
            const a = triangulos[t] * 3, b = triangulos[t + 1] * 3, c = triangulos[t + 2] * 3;
            const area = (mundo[b] - mundo[a]) * (mundo[c + 2] - mundo[a + 2]) -
                (mundo[c] - mundo[a]) * (mundo[b + 2] - mundo[a + 2]);
            if (Math.abs(area) < 1e-9) continue; // triángulo vertical: un rayo vertical no lo toca
            const minX = Math.floor(Math.min(mundo[a], mundo[b], mundo[c]) / TAMANO_CASILLA_ALTURA);
            const maxX = Math.floor(Math.max(mundo[a], mundo[b], mundo[c]) / TAMANO_CASILLA_ALTURA);
            const minZ = Math.floor(Math.min(mundo[a + 2], mundo[b + 2], mundo[c + 2]) / TAMANO_CASILLA_ALTURA);
            const maxZ = Math.floor(Math.max(mundo[a + 2], mundo[b + 2], mundo[c + 2]) / TAMANO_CASILLA_ALTURA);
            for (let cx = minX; cx <= maxX; cx++) {
                for (let cz = minZ; cz <= maxZ; cz++) {
                    const clave = claveCasilla(cx, cz);
                    let lista = casillas.get(clave);
                    if (!lista) casillas.set(clave, lista = []);
                    lista.push(t);
                }
            }
        }
        indice = { mundo, triangulos, casillas };
        indicesAltura.set(malla, indice);
        return indice;
    }
    function alturaEnMalla(malla, x, z, yMax, yMin) {
        const { mundo, triangulos, casillas } = indiceAltura(malla);
        const lista = casillas.get(claveCasilla(
            Math.floor(x / TAMANO_CASILLA_ALTURA), Math.floor(z / TAMANO_CASILLA_ALTURA)
        ));
        if (!lista) return null;
        let mejor = null;
        for (let i = 0; i < lista.length; i++) {
            const t = lista[i];
            const a = triangulos[t] * 3, b = triangulos[t + 1] * 3, c = triangulos[t + 2] * 3;
            const x0 = mundo[a], z0 = mundo[a + 2], x1 = mundo[b], z1 = mundo[b + 2], x2 = mundo[c], z2 = mundo[c + 2];
            const det = (z1 - z2) * (x0 - x2) + (x2 - x1) * (z0 - z2);
            const l0 = ((z1 - z2) * (x - x2) + (x2 - x1) * (z - z2)) / det;
            if (l0 < -1e-6) continue;
            const l1 = ((z2 - z0) * (x - x2) + (x0 - x2) * (z - z2)) / det;
            if (l1 < -1e-6) continue;
            const l2 = 1 - l0 - l1;
            if (l2 < -1e-6) continue;
            const y = l0 * mundo[a + 1] + l1 * mundo[b + 1] + l2 * mundo[c + 1];
            if (y <= yMax && y >= yMin && (mejor === null || y > mejor)) mejor = y;
        }
        return mejor;
    }
    function alturaEnMallas(mallas, x, z, yMax, yMin) {
        let mejor = null;
        mallas.forEach(malla => {
            const y = alturaEnMalla(malla, x, z, yMax, yMin);
            if (y !== null && (mejor === null || y > mejor)) mejor = y;
        });
        return mejor;
    }

    function vestirArquitectura(superficies) {
        const ruta = "assets/img/granja/";
        const textura = (archivo, escalaU = 1, escalaV = escalaU) => {
            const mapa = new BABYLON.Texture(`${ruta}${archivo}`, scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
            mapa.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
            mapa.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
            mapa.uScale = escalaU;
            mapa.vScale = escalaV;
            return mapa;
        };

        const cieloC2 = new BABYLON.PBRMaterial("material-cielo-led-c2", scene);
        cieloC2.albedoTexture = textura("cielo-led-v1.webp");
        cieloC2.emissiveTexture = cieloC2.albedoTexture;
        cieloC2.emissiveColor = new BABYLON.Color3(0.72, 0.78, 0.84);
        cieloC2.roughness = 1;
        cieloC2.metallic = 0;
        // El techo de C2 está orientado hacia abajo: se ve desde C2, pero no
        // reaparece como una falsa tapa de cielo al mirar desde C4 por la rampa.
        cieloC2.backFaceCulling = true;
        const cieloC4 = cieloC2.clone("material-cielo-led-c4");
        cieloC4.emissiveColor = new BABYLON.Color3(0.68, 0.76, 0.84);

        const pared = new BABYLON.PBRMaterial("material-pared-tecnica", scene);
        pared.albedoTexture = textura("pared-v2-albedo-v1.webp", 1, 1);
        pared.bumpTexture = textura("pared-v2-normal-v1.webp", 1, 1);
        pared.invertNormalMapX = true;
        pared.invertNormalMapY = true;
        pared.albedoColor = new BABYLON.Color3(0.82, 0.84, 0.83);
        pared.emissiveColor = new BABYLON.Color3(0.045, 0.048, 0.05);
        pared.roughness = 0.76;
        pared.metallic = 0.02;

        const rampa = new BABYLON.PBRMaterial("material-carretera-rampa", scene);
        rampa.albedoTexture = textura("carretera-superficie-v1.png");
        rampa.albedoColor = new BABYLON.Color3(0.92, 0.92, 0.90);
        rampa.roughness = 0.92;
        rampa.metallic = 0;
        rampa.backFaceCulling = false;

        const laterales = new BABYLON.PBRMaterial("material-laterales-rampa", scene);
        laterales.albedoTexture = textura("pared-v2-albedo-v1.webp", 1, 1);
        laterales.bumpTexture = textura("pared-v2-normal-v1.webp", 1, 1);
        laterales.albedoColor = new BABYLON.Color3(0.67, 0.70, 0.70);
        laterales.emissiveColor = new BABYLON.Color3(0.035, 0.04, 0.042);
        laterales.roughness = 0.78;
        laterales.metallic = 0.03;
        // Los laterales de la rampa se observan desde ambas cubiertas.
        laterales.backFaceCulling = false;

        const uvHorizontal = (mesh, normalizado = false, metrosPorRepeticion = 6) => {
            const posiciones = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            if (!posiciones?.length) return;
            let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
            for (let i = 0; i < posiciones.length; i += 3) {
                minX = Math.min(minX, posiciones[i]); maxX = Math.max(maxX, posiciones[i]);
                minZ = Math.min(minZ, posiciones[i + 2]); maxZ = Math.max(maxZ, posiciones[i + 2]);
            }
            const ancho = Math.max(0.001, maxX - minX);
            const fondo = Math.max(0.001, maxZ - minZ);
            const uvs = [];
            for (let i = 0; i < posiciones.length; i += 3) {
                const x = posiciones[i] - minX;
                const z = posiciones[i + 2] - minZ;
                uvs.push(normalizado ? x / ancho : x / metrosPorRepeticion);
                uvs.push(normalizado ? z / fondo : z / metrosPorRepeticion);
            }
            mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs, true);
        };

        const uvVertical = (mesh, metrosPorRepeticion = 7) => {
            const posiciones = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            const normales = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
            if (!posiciones?.length) return;
            const uvs = [];
            for (let i = 0; i < posiciones.length; i += 3) {
                const x = posiciones[i];
                const y = posiciones[i + 1];
                const z = posiciones[i + 2];
                const nx = Math.abs(normales?.[i] ?? 0);
                const nz = Math.abs(normales?.[i + 2] ?? 1);
                uvs.push((nx > nz ? z : x) / metrosPorRepeticion);
                uvs.push(y / metrosPorRepeticion);
            }
            mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs, true);
        };

        const uvCarretera = mesh => {
            const posiciones = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            if (!posiciones?.length) return;
            let centroX = 0, centroZ = 0;
            for (let i = 0; i < posiciones.length; i += 3) {
                centroX += posiciones[i]; centroZ += posiciones[i + 2];
            }
            centroX /= posiciones.length / 3; centroZ /= posiciones.length / 3;
            let xx = 0, zz = 0, xz = 0;
            for (let i = 0; i < posiciones.length; i += 3) {
                const x = posiciones[i] - centroX;
                const z = posiciones[i + 2] - centroZ;
                xx += x * x; zz += z * z; xz += x * z;
            }
            const angulo = 0.5 * Math.atan2(2 * xz, xx - zz);
            const ejeX = Math.cos(angulo), ejeZ = Math.sin(angulo);
            const lateralX = -ejeZ, lateralZ = ejeX;
            const proyectados = [];
            let minLateral = Infinity, maxLateral = -Infinity;
            for (let i = 0; i < posiciones.length; i += 3) {
                const x = posiciones[i] - centroX;
                const z = posiciones[i + 2] - centroZ;
                const longitudinal = x * ejeX + z * ejeZ;
                const lateral = x * lateralX + z * lateralZ;
                proyectados.push([longitudinal, lateral]);
                minLateral = Math.min(minLateral, lateral);
                maxLateral = Math.max(maxLateral, lateral);
            }
            const ancho = Math.max(0.001, maxLateral - minLateral);
            const uvs = [];
            proyectados.forEach(([longitudinal, lateral]) => {
                uvs.push((lateral - minLateral) / ancho, longitudinal / 31);
            });
            mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs, true);
        };

        superficies.forEach(mesh => {
            const nombre = mesh.name;
            mesh.receiveShadows = true;
            if (/GRANJA_Techo_C2/i.test(nombre)) {
                uvHorizontal(mesh, true);
                mesh.material = cieloC2;
            }
            else if (/GRANJA_Techo/i.test(nombre)) {
                uvHorizontal(mesh, true);
                mesh.material = cieloC4;
            }
            else if (/GRANJA_(?:Paredes|Pared_Trasera_Rampa)/i.test(nombre)) {
                uvVertical(mesh, 8);
                mesh.material = pared;
            }
            else if (/GRANJA_Rampa$|Cubo\.025/i.test(nombre)) {
                uvCarretera(mesh);
                mesh.material = rampa;
            }
            else if (/GRANJA_Rampa_Calzada_Central/i.test(nombre)) {
                uvCarretera(mesh);
                mesh.material = rampa;
            }
            else if (/GRANJA_(?:Lateral_Rampa|Fondo_Hueco_Rampa)/i.test(nombre)) {
                uvVertical(mesh, 4);
                mesh.material = laterales;
            }
            if (/GRANJA_(?:Paredes|Rampa|Lateral_Rampa|Fondo_Hueco_Rampa)/i.test(nombre)
                && !/Rampa_(?:Calzada_Central|Estrecha)/i.test(nombre)) {
                sombras.addShadowCaster(mesh, false);
            }
        });
    }

    // Misma semántica que el antiguo rayo (origen alturaOrigen, 30 m hacia abajo), sin pickWithRay.
    function alturaSobre(superficie, x, z, alturaOrigen) {
        return alturaEnMalla(superficie, x, z, alturaOrigen, alturaOrigen - 30);
    }

    function suavizarTrazado(puntos, cerrado, radio = 7, pasos = 7) {
        if (puntos.length < 3) return puntos.slice();
        const resultado = [];
        const inicio = cerrado ? 0 : 1;
        const fin = cerrado ? puntos.length : puntos.length - 1;
        if (!cerrado) resultado.push(puntos[0]);
        for (let i = inicio; i < fin; i++) {
            const anterior = puntos[(i - 1 + puntos.length) % puntos.length];
            const centro = puntos[i];
            const siguiente = puntos[(i + 1) % puntos.length];
            const longitudA = Math.hypot(anterior[0] - centro[0], anterior[1] - centro[1]) || 1;
            const longitudB = Math.hypot(siguiente[0] - centro[0], siguiente[1] - centro[1]) || 1;
            const distancia = Math.min(radio, longitudA * 0.28, longitudB * 0.28);
            const entrada = [
                centro[0] + (anterior[0] - centro[0]) / longitudA * distancia,
                centro[1] + (anterior[1] - centro[1]) / longitudA * distancia
            ];
            const salida = [
                centro[0] + (siguiente[0] - centro[0]) / longitudB * distancia,
                centro[1] + (siguiente[1] - centro[1]) / longitudB * distancia
            ];
            resultado.push(entrada);
            for (let paso = 1; paso <= pasos; paso++) {
                const t = paso / pasos;
                const unoMenos = 1 - t;
                resultado.push([
                    unoMenos * unoMenos * entrada[0] + 2 * unoMenos * t * centro[0] + t * t * salida[0],
                    unoMenos * unoMenos * entrada[1] + 2 * unoMenos * t * centro[1] + t * t * salida[1]
                ]);
            }
        }
        if (!cerrado) resultado.push(puntos[puntos.length - 1]);
        return resultado;
    }

    function construirPaisaje(superficies) {
        const sueloC2 = superficies.find(mesh => /suelo_cubierta_2/i.test(mesh.name));
        const sueloBaseC2 = superficies.find(mesh => /suelo_base_c2/i.test(mesh.name));
        const sueloC4 = superficies.find(mesh => /suelo_cubierta_3/i.test(mesh.name));
        if (!sueloC2 || !sueloC4) return;

        const ruta = "assets/img/granja/";
        const aplicarUvMetrico = (malla, metrosPorRepeticion = 3.2) => {
            const posiciones = malla.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            if (!posiciones?.length) return;
            const uvs = [];
            for (let i = 0; i < posiciones.length; i += 3) {
                uvs.push(posiciones[i] / metrosPorRepeticion, posiciones[i + 2] / metrosPorRepeticion);
            }
            malla.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs, true);
        };
        const crearMapa = (archivo, escala) => {
            const mapa = new BABYLON.Texture(`${ruta}${archivo}`, scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
            mapa.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
            mapa.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
            mapa.anisotropicFilteringLevel = 8;
            mapa.uScale = escala;
            mapa.vScale = escala;
            return mapa;
        };
        const pradera = new BABYLON.PBRMaterial("pradera-pbr-final", scene);
        aplicarUvMetrico(sueloC2);
        if (sueloBaseC2) aplicarUvMetrico(sueloBaseC2);
        aplicarUvMetrico(sueloC4);
        pradera.albedoTexture = crearMapa("pradera-albedo-v1.webp", 1);
        pradera.albedoTexture.anisotropicFilteringLevel = 16;
        pradera.bumpTexture = crearMapa("pradera-normal-v1.webp", 1);
        pradera.bumpTexture.anisotropicFilteringLevel = 16;
        pradera.albedoColor = new BABYLON.Color3(1, 1, 1);
        pradera.roughness = 0.98;
        pradera.metallic = 0;
        sueloC2.material = pradera;
        if (sueloBaseC2) sueloBaseC2.material = pradera;
        sueloC4.material = pradera.clone("pradera-pbr-final-c4");

        // Los taludes, la prolongación y la pared posterior ya forman parte del GLB v5.

        const desplazarPoligono = (puntos, distancia) => {
            const area = puntos.reduce((suma, punto, i) => {
                const siguiente = puntos[(i + 1) % puntos.length];
                return suma + punto[0] * siguiente[1] - siguiente[0] * punto[1];
            }, 0);
            const signo = area > 0 ? 1 : -1;
            const lineas = puntos.map((punto, i) => {
                const siguiente = puntos[(i + 1) % puntos.length];
                const dx = siguiente[0] - punto[0];
                const dz = siguiente[1] - punto[1];
                const longitud = Math.hypot(dx, dz) || 1;
                const nx = signo * -dz / longitud;
                const nz = signo * dx / longitud;
                return { punto: [punto[0] + nx * distancia, punto[1] + nz * distancia], direccion: [dx / longitud, dz / longitud] };
            });
            return puntos.map((_, i) => {
                const a = lineas[(i - 1 + lineas.length) % lineas.length];
                const b = lineas[i];
                const cruz = a.direccion[0] * b.direccion[1] - a.direccion[1] * b.direccion[0];
                if (Math.abs(cruz) < 1e-8) return a.punto.slice();
                const t = ((b.punto[0] - a.punto[0]) * b.direccion[1] - (b.punto[1] - a.punto[1]) * b.direccion[0]) / cruz;
                return [a.punto[0] + a.direccion[0] * t, a.punto[1] + a.direccion[1] * t];
            });
        };
        const anilloBase = desplazarPoligono(contorno, 4.8);

        // La carretera vuelve a seguir íntegramente el perímetro. Los enlaces
        // reproducen el centro real de sus mallas para excluir vegetación sin
        // crear calvas fuera del firme.
        const carreteraPerimetral = suavizarTrazado(anilloBase, true, 8, 10);
        const enlaceRampaC2 = [[65.884,-13.034],[64.528,-15.082],[62.979,-17.172],[61.302,-19.298],[59.565,-21.449],[57.835,-23.618],[56.179,-25.797],[54.664,-27.977],[53.356,-30.149],[52.324,-32.306],[51.632,-34.440],[51.350,-36.541],[51.543,-38.602],[52.279,-40.614],[51.901,-40.186]];
        const enlaceRampaC4 = [[110.109,-124.978],[111.519,-126.325],[113.163,-126.738],[114.977,-126.326],[116.900,-125.202],[118.866,-123.476],[120.813,-121.261],[122.677,-118.667],[124.396,-115.805],[125.905,-112.788],[127.141,-109.726],[128.041,-106.730],[128.541,-103.912],[128.578,-101.383],[128.089,-99.254],[127.010,-97.638],[126.230,-97.056]];
        const zonasExcluidas = [];
        const registrarTramos = (puntos, radio, cerrado = false, cubierta = "c2") => {
            const limite = cerrado ? puntos.length : puntos.length - 1;
            for (let i = 0; i < limite; i++) {
                zonasExcluidas.push({ segmento: [puntos[i], puntos[(i + 1) % puntos.length]], radio, cubierta });
            }
        };
        // El firme mide 7,4 m y la franja allanada 9,4 m. Este margen cubre la
        // calzada y el arcén sin vaciar grandes bandas de pradera.
        registrarTramos(carreteraPerimetral, 5.0, true, "c2");
        registrarTramos(carreteraPerimetral, 5.0, true, "c4");
        registrarTramos(enlaceRampaC2, 5.4, false, "c2");
        // En C4 la reserva anterior dejaba una calva visible alrededor de la
        // desembocadura. 4,25 m cubren el firme (3,7 m por lado) y conservan
        // medio metro de seguridad sin vaciar la pradera contigua.
        registrarTramos(enlaceRampaC4, 4.25, false, "c4");
        // Corredor preciso para rampa y taludes: impide árboles, ganado y hierba
        // sobre la subida o bajo ella, sin afectar al resto del módulo.
        zonasExcluidas.push(
            { segmento: [[48.85, -38.09], [109.70, -124.35]], radio: 6.2, cubierta: "c2" },
            { segmento: [[92.0, -99.2], [110.11, -124.98]], radio: 5.1, cubierta: "c4" }
        );
        return { sueloC2, sueloC4, zonasExcluidas };
    }

    async function crearCasaJeanPierre(sueloC2, zonasExcluidas) {
        if (!sueloC2) return;
        const posicion = { x: 0, z: -30 };
        const y = alturaSobre(sueloC2, posicion.x, posicion.z, 10);
        if (y === null) return;

        // Modelo provisional: Lost Gecko, CC BY 4.0.
        // https://sketchfab.com/3d-models/tramain-house-1-france-ba987b3d4a1e4b96822048f5cc32c4ec
        const contenedor = await cargarContenedor("tramain_house_1_france.glb");
        const casa = contenedor.instantiateModelsToScene(nombre => `casa-jean-pierre-${nombre}`, false);
        casa.rootNodes.forEach(raiz => {
            raiz.position.set(posicion.x, y, posicion.z);
            // El GLB ya incluye internamente la conversión de centímetros a metros.
            raiz.scaling.setAll(1);
            raiz.rotationQuaternion = null;
            raiz.rotation.y = Math.PI * 0.12;
            raiz.getChildMeshes().forEach(malla => {
                malla.isPickable = true;
                malla.receiveShadows = true;
                obstaculosSolidos.add(malla);
            });
        });

        const huella = [[-11, -39], [11, -39], [11, -21], [-11, -21]];
        for (let i = 0; i < huella.length; i++) {
            zonasExcluidas.push({ segmento: [huella[i], huella[(i + 1) % huella.length]], radio: 5, cubierta: "c2" });
        }
    }

    function limitesMallas(mallas) {
        let minimo = new BABYLON.Vector3(Infinity, Infinity, Infinity);
        let maximo = new BABYLON.Vector3(-Infinity, -Infinity, -Infinity);
        mallas.forEach(malla => {
            malla.computeWorldMatrix(true);
            const caja = malla.getBoundingInfo().boundingBox;
            minimo = BABYLON.Vector3.Minimize(minimo, caja.minimumWorld);
            maximo = BABYLON.Vector3.Maximize(maximo, caja.maximumWorld);
        });
        return { minimo, maximo };
    }

    function apoyarModeloEnSuelo(raices, mallas, alturaSuelo) {
        const desplazamiento = alturaSuelo - limitesMallas(mallas).minimo.y;
        raices.forEach(raiz => {
            raiz.position.y += desplazamiento;
            raiz.computeWorldMatrix(true);
        });
    }

    function crearColisionEnvolvente(nombre, mallas) {
        const { minimo, maximo } = limitesMallas(mallas);
        const tamano = maximo.subtract(minimo);
        const colision = BABYLON.MeshBuilder.CreateBox(nombre, {
            width: Math.max(0.35, tamano.x),
            height: Math.max(0.35, tamano.y),
            depth: Math.max(0.35, tamano.z)
        }, scene);
        colision.position = minimo.add(maximo).scale(0.5);
        colision.visibility = 0;
        colision.isPickable = true;
        obstaculosSolidos.add(colision);
        return colision;
    }

    async function crearTractor(sueloC2, zonasExcluidas) {
        if (!sueloC2) return;
        const posicion = { x: 17, z: -31 };
        const y = alturaSobre(sueloC2, posicion.x, posicion.z, 10);
        if (y === null) return;

        const contenedor = await cargarContenedor("tractor.glb");
        const tractor = contenedor.instantiateModelsToScene(nombre => `tractor-${nombre}`, false);
        const mallasTractor = [];
        tractor.rootNodes.forEach(raiz => {
            raiz.position.set(posicion.x, 0, posicion.z);
            // El FBX original mide aproximadamente 1,35 unidades de largo.
            raiz.scaling.scaleInPlace(3);
            raiz.rotationQuaternion = null;
            raiz.rotation.y = Math.PI * 0.42;
            raiz.getChildMeshes().forEach(malla => {
                mallasTractor.push(malla);
                malla.isPickable = true;
                malla.receiveShadows = true;
                // [OPT] Ya hay una caja envolvente de colisión: probar además cada triángulo era redundante.
            });
        });
        apoyarModeloEnSuelo(tractor.rootNodes, mallasTractor, y);
        crearColisionEnvolvente("colision-tractor", mallasTractor);

        zonasExcluidas.push({
            segmento: [[14.5, -31], [19.5, -31]],
            radio: 2.4,
            cubierta: "c2"
        });
    }

    async function crearAdornosCasa(sueloC2, zonasExcluidas) {
        if (!sueloC2) return;
        const [contenedorBala, contenedorSaco] = await Promise.all([
            cargarContenedor("bale.glb"),
            cargarContenedor("bag.glb")
        ]);
        contenedorBala.materials.forEach(material => {
            material.alpha = 1;
            material.backFaceCulling = false;
            material.useAlphaFromAlbedoTexture = true;
            material.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHATEST;
            material.alphaCutOff = 0.38;
            if (material.albedoTexture) material.albedoTexture.hasAlpha = true;
            if (material.diffuseTexture) material.diffuseTexture.hasAlpha = true;
        });
        contenedorSaco.materials.forEach(material => {
            material.alpha = 1;
            material.backFaceCulling = false;
            material.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_OPAQUE;
            if (material.albedoTexture) material.albedoTexture.hasAlpha = false;
            if (material.diffuseTexture) material.diffuseTexture.hasAlpha = false;
        });

        const crearAdorno = (contenedor, prefijo, datos, indice) => {
            const y = datos.alturaBase ?? alturaSobre(sueloC2, datos.x, datos.z, 10);
            if (y === null) return;
            const instancia = contenedor.instantiateModelsToScene(
                nombre => `${prefijo}-${indice}-${nombre}`, false
            );
            const mallas = [];
            instancia.rootNodes.forEach(raiz => {
                raiz.position.set(datos.x, datos.elevacion || 0, datos.z);
                raiz.scaling.scaleInPlace(datos.escala || 1);
                raiz.rotationQuaternion = null;
                raiz.rotation.y = datos.rotacion;
                raiz.rotation.x = datos.inclinacionX || 0;
                raiz.rotation.z = datos.inclinacionZ || 0;
                raiz.getChildMeshes().forEach(malla => {
                    mallas.push(malla);
                    malla.isPickable = true;
                    malla.receiveShadows = true;
                    // [OPT] Ya hay una caja envolvente de colisión: probar además cada triángulo era redundante.
                });
            });
            apoyarModeloEnSuelo(instancia.rootNodes, mallas, y + (datos.elevacion || 0));
            crearColisionEnvolvente(`colision-${prefijo}-${indice}`, mallas);
        };

        const alturaPila = alturaSobre(sueloC2, -53.9, -158.3, 10);
        const balas = alturaPila === null ? [] : [
            // Cinco abajo, cuatro en el centro y tres arriba: una pila compacta.
            ...[-160.14, -159.22, -158.3, -157.38, -156.46].map((z, i) => ({
                x: -53.9, z, alturaBase: alturaPila,
                rotacion: Math.PI * 0.5 + (i % 2 ? 0.01 : -0.008)
            })),
            ...[-159.68, -158.76, -157.84, -156.92].map((z, i) => ({
                x: -53.9, z, alturaBase: alturaPila,
                rotacion: Math.PI * 0.5 + (i % 2 ? -0.008 : 0.01), elevacion: 0.50
            })),
            ...[-159.22, -158.3, -157.38].map((z, i) => ({
                x: -53.9, z, alturaBase: alturaPila,
                rotacion: Math.PI * 0.5 + (i % 2 ? 0.006 : -0.006), elevacion: 1.0
            }))
        ];
        const sacos = [
            // Cuatro apoyados en la pared lateral de la casa.
            { x: -12.1, z: -26.6, rotacion: 0.12, inclinacionZ: 0.10 },
            { x: -12.15, z: -27.25, rotacion: 0.05, inclinacionZ: 0.08 },
            { x: -12.2, z: -27.9, rotacion: 0.16, inclinacionZ: 0.11 },
            { x: -12.25, z: -28.55, rotacion: 0.08, inclinacionZ: 0.09 },
            // Otros cuatro contra la pared exterior del establo.
            { x: -53.95, z: -151.2, rotacion: Math.PI * 0.94, inclinacionZ: -0.09 },
            { x: -53.9, z: -151.85, rotacion: Math.PI * 0.96, inclinacionZ: -0.11 },
            { x: -53.85, z: -152.5, rotacion: Math.PI * 0.93, inclinacionZ: -0.08 },
            { x: -53.8, z: -153.15, rotacion: Math.PI * 0.95, inclinacionZ: -0.10 }
        ];
        balas.forEach((datos, indice) => crearAdorno(contenedorBala, "bala", datos, indice));
        sacos.forEach((datos, indice) => crearAdorno(contenedorSaco, "saco", datos, indice));

        zonasExcluidas.push(
            { segmento: [[-53.9, -160.8], [-53.9, -155.8]], radio: 1.6, cubierta: "c2" },
            { segmento: [[-12.2, -26.3], [-12.2, -28.9]], radio: 1.0, cubierta: "c2" },
            { segmento: [[-53.9, -150.9], [-53.8, -153.5]], radio: 1.0, cubierta: "c2" }
        );
    }

    async function crearEstablo(sueloC2, zonasExcluidas) {
        if (!sueloC2) return;
        // Extremo suroeste de C2: separado de la vivienda y fuera de los caminos.
        const posicion = { x: -61, z: -158 };
        const y = alturaSobre(sueloC2, posicion.x, posicion.z, 10);
        if (y === null) return;

        const contenedor = await cargarContenedor("establo.glb");
        contenedor.materials.forEach(material => {
            // El atlas contiene canales auxiliares que el GLB interpretaba como alfa.
            material.alpha = 1;
            material.backFaceCulling = false;
            material.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_OPAQUE;
            if (material.albedoTexture) {
                material.albedoTexture.hasAlpha = false;
                material.albedoTexture.getAlphaFromRGB = false;
            }
            if (material.diffuseTexture) {
                material.diffuseTexture.hasAlpha = false;
                material.diffuseTexture.getAlphaFromRGB = false;
            }
        });
        const establo = contenedor.instantiateModelsToScene(nombre => `establo-${nombre}`, false);
        const mallas = [];
        establo.rootNodes.forEach(raiz => {
            raiz.position.set(posicion.x, 0, posicion.z);
            raiz.scaling.scaleInPlace(0.75);
            raiz.rotationQuaternion = null;
            raiz.rotation.y = Math.PI * 0.92;
            raiz.getChildMeshes().forEach(malla => {
                mallas.push(malla);
                malla.isPickable = true;
                malla.receiveShadows = true;
                // [OPT] Ya hay una caja envolvente de colisión: probar además cada triángulo era redundante.
            });
        });
        apoyarModeloEnSuelo(establo.rootNodes, mallas, y);
        establo.rootNodes.forEach(raiz => {
            raiz.position.y -= 0.22;
            raiz.computeWorldMatrix(true);
        });
        crearColisionEnvolvente("colision-establo", mallas);

        const { minimo, maximo } = limitesMallas(mallas);
        const centroZ = (minimo.z + maximo.z) * 0.5;
        zonasExcluidas.push({
            segmento: [[minimo.x - 1, centroZ], [maximo.x + 1, centroZ]],
            radio: (maximo.z - minimo.z) * 0.5 + 1.5,
            cubierta: "c2"
        });
    }

    async function crearVacas(sueloC2, zonasExcluidas) {
        if (!sueloC2) return;
        const contenedor = await cargarContenedor("vaca.glb");
        const zonas = [
            { x: -78, z: -166, radio: 10 },
            { x: -43, z: -166, radio: 11 },
            { x: -75, z: -112, radio: 12 },
            { x: -30, z: -91, radio: 11 },
            { x: 20, z: -87, radio: 10 },
            { x: 50, z: -50, radio: 10 },
            { x: -78, z: -18, radio: 11 },
            { x: -31, z: 67, radio: 12 },
            { x: 31, z: 116, radio: 11 },
            { x: 88, z: 139, radio: 10 }
        ];
        const vacas = [];
        const DISTANCIA_SUENO_VACAS = 140;

        const puntoPermitido = (x, z) => dentroDelContorno(x, z) &&
            !enZonaExcluida(zonasExcluidas, x, z, "c2", 1.8);

        const buscarObjetivo = vaca => {
            for (let intento = 0; intento < 20; intento++) {
                const angulo = vaca.aleatorio() * Math.PI * 2;
                const distancia = (0.25 + vaca.aleatorio() * 0.75) * vaca.zona.radio;
                const x = vaca.zona.x + Math.cos(angulo) * distancia;
                const z = vaca.zona.z + Math.sin(angulo) * distancia;
                if (puntoPermitido(x, z)) return new BABYLON.Vector3(x, 0, z);
            }
            return new BABYLON.Vector3(vaca.zona.x, 0, vaca.zona.z);
        };

        const reproducir = (vaca, estado) => {
            vaca.animaciones.forEach(animacion => animacion.stop());
            const nombres = {
                caminar: "caminar",
                comer: "comer",
                reposo: "reposo",
                variacion: "reposo_variacion"
            };
            const buscado = nombres[estado];
            const animacion = vaca.animaciones.find(grupo =>
                grupo.name.toLowerCase().includes(buscado)
            );
            animacion?.start(true, estado === "caminar" ? 0.85 : 1);
            vaca.animacionActual = animacion;
            vaca.estado = estado;
        };

        for (let indice = 0; indice < zonas.length; indice++) {
            const zona = zonas[indice];
            let xInicial = zona.x;
            let zInicial = zona.z;
            if (!puntoPermitido(xInicial, zInicial)) {
                // Algunas zonas históricas quedaron demasiado próximas al nuevo
                // corredor. Se busca una posición segura antes de instanciar.
                for (let intento = 1; intento <= 48; intento++) {
                    const angulo = intento * 2.399963229728653;
                    const distancia = 4 + Math.ceil(intento / 8) * 3.5;
                    const candidatoX = zona.x + Math.cos(angulo) * distancia;
                    const candidatoZ = zona.z + Math.sin(angulo) * distancia;
                    if (puntoPermitido(candidatoX, candidatoZ)) {
                        xInicial = candidatoX;
                        zInicial = candidatoZ;
                        break;
                    }
                }
            }
            if (!puntoPermitido(xInicial, zInicial)) continue;
            const y = alturaSobre(sueloC2, xInicial, zInicial, 10);
            if (y === null) continue;
            const instancia = contenedor.instantiateModelsToScene(
                nombre => `vaca-${indice + 1}-${nombre}`, false
            );
            const pivote = new BABYLON.TransformNode(`vaca-${indice + 1}`, scene);
            const mallas = [];
            instancia.rootNodes.forEach(raiz => {
                // Se emparenta con el pivote aún neutro: así Babylon no genera una
                // compensación local que la animación pueda sobrescribir después.
                raiz.setParent(pivote);
                raiz.getChildMeshes().forEach(malla => {
                    mallas.push(malla);
                    malla.isPickable = true;
                    malla.receiveShadows = true;
                    // El esqueleto puede salir de la caja estática y provocar parpadeos por culling.
                    malla.alwaysSelectAsActiveMesh = true;
                });
            });
            pivote.position.set(xInicial, 0, zInicial);
            pivote.scaling.setAll(1.5);
            pivote.rotation.y = indice * 0.73;
            pivote.computeWorldMatrix(true);
            const minimoInicial = limitesMallas(mallas).minimo.y;
            const separacionSuelo = -minimoInicial - 0.08;
            pivote.position.y = y + separacionSuelo;

            const colision = BABYLON.MeshBuilder.CreateBox(`colision-vaca-${indice + 1}`, {
                width: 1.15,
                height: 1.65,
                depth: 2.85
            }, scene);
            colision.visibility = 0;
            colision.isPickable = true;
            obstaculosSolidos.add(colision);

            let semilla = (0x9e3779b9 ^ ((indice + 1) * 2654435761)) >>> 0;
            const vaca = {
                zona,
                pivote,
                colision,
                animaciones: instancia.animationGroups,
                estado: "",
                restante: 4 + indice * 0.7,
                objetivo: null,
                separacionSuelo,
                aleatorio: () => {
                    semilla = (semilla * 1664525 + 1013904223) >>> 0;
                    return semilla / 4294967296;
                }
            };
            vaca.objetivo = buscarObjetivo(vaca);
            reproducir(vaca, indice % 3 === 0 ? "comer" : (indice % 3 === 1 ? "reposo" : "variacion"));
            vacas.push(vaca);
            obstaculosDinamicos.push({ nodo: pivote, radio: 1.45 });
        }

        actualizarVacas = () => {
            const delta = Math.min(engine.getDeltaTime() / 1000, 0.05);
            vacas.forEach(vaca => {
                // [OPT] Más allá de la niebla (fogEnd = 145 m) la vaca no se ve:
                // se oculta, se pausa su esqueleto y no se calcula nada.
                const lejania2 = (vaca.pivote.position.x - camera.position.x) ** 2 +
                    (vaca.pivote.position.z - camera.position.z) ** 2;
                const dormida = lejania2 > DISTANCIA_SUENO_VACAS * DISTANCIA_SUENO_VACAS;
                if (dormida !== vaca.dormida) {
                    vaca.dormida = dormida;
                    vaca.pivote.setEnabled(!dormida);
                    if (dormida) vaca.animacionActual?.pause();
                    else vaca.animacionActual?.play(true);
                }
                if (dormida) return;
                const xAntes = vaca.pivote.position.x;
                const zAntes = vaca.pivote.position.z;
                if (vaca.estado === "caminar") {
                    const dx = vaca.objetivo.x - vaca.pivote.position.x;
                    const dz = vaca.objetivo.z - vaca.pivote.position.z;
                    const distancia = Math.hypot(dx, dz);
                    if (distancia < 0.35) {
                        vaca.restante = 7 + vaca.aleatorio() * 10;
                        reproducir(vaca, vaca.aleatorio() < 0.55 ? "comer" :
                            (vaca.aleatorio() < 0.5 ? "reposo" : "variacion"));
                    } else {
                        const paso = Math.min(distancia, 0.52 * delta);
                        const siguienteX = vaca.pivote.position.x + dx / distancia * paso;
                        const siguienteZ = vaca.pivote.position.z + dz / distancia * paso;
                        if (!puntoPermitido(siguienteX, siguienteZ)) {
                            vaca.objetivo = buscarObjetivo(vaca);
                            vaca.restante = 2 + vaca.aleatorio() * 3;
                            reproducir(vaca, "reposo");
                            return;
                        }
                        vaca.pivote.position.x = siguienteX;
                        vaca.pivote.position.z = siguienteZ;
                        const deseado = Math.atan2(dx, dz);
                        let diferencia = deseado - vaca.pivote.rotation.y;
                        diferencia = Math.atan2(Math.sin(diferencia), Math.cos(diferencia));
                        vaca.pivote.rotation.y += diferencia * Math.min(1, delta * 3.2);
                    }
                } else {
                    vaca.restante -= delta;
                    if (vaca.restante <= 0) {
                        vaca.objetivo = buscarObjetivo(vaca);
                        reproducir(vaca, "caminar");
                    }
                }

                // [OPT] Solo se consulta el suelo si la vaca se ha movido (o aún no se ha asentado).
                const seHaMovido = vaca.pivote.position.x !== xAntes || vaca.pivote.position.z !== zAntes;
                if (seHaMovido || vaca.alturaSuelo === undefined) {
                    vaca.alturaSuelo = alturaSobre(
                        sueloC2, vaca.pivote.position.x, vaca.pivote.position.z, 10
                    );
                }
                const altura = vaca.alturaSuelo;
                if (altura !== null) {
                    const alturaObjetivo = altura + vaca.separacionSuelo;
                    vaca.pivote.position.y += (alturaObjetivo - vaca.pivote.position.y) *
                        Math.min(1, delta * 10);
                }
                vaca.colision.position.set(
                    vaca.pivote.position.x,
                    vaca.pivote.position.y + 0.75,
                    vaca.pivote.position.z
                );
                vaca.colision.rotation.y = vaca.pivote.rotation.y;
            });
        };
    }

    async function crearManzanos(sueloC2, sueloC4, zonasExcluidas) {
        if (!sueloC2 || !sueloC4) return;
        const [near, mid] = await Promise.all([
            cargarContenedor("manzano_near.glb"),
            cargarContenedor("manzano_mid.glb")
        ]);
        [near, mid].forEach(contenedor => {
            contenedor.materials.forEach(material => {
                material.backFaceCulling = false;
                material.useAlphaFromAlbedoTexture = true;
                if (material.albedoTexture) material.albedoTexture.hasAlpha = true;
                material.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHATEST;
                material.alphaCutOff = 0.12;
            });
        });
        const arboles = [];

        const distribuir = (superficie, alturaOrigen, semillaInicial, cubierta) => {
            let semilla = semillaInicial;
            const aleatorio = () => {
                semilla = (semilla * 1664525 + 1013904223) >>> 0;
                return semilla / 4294967296;
            };
            const posiciones = [];
            const posicionesVisibles = cubierta === "c2"
                ? [[25, 48], [43, 28], [58, 45], [30, 68], [61, 67]]
                : [[25, 48], [43, 28], [58, 45], [30, 68], [61, 67]];
            posicionesVisibles.forEach(([x, z]) => {
                if (estaEnZonaRampa(x, z)) return;
                const y = alturaSobre(superficie, x, z, alturaOrigen);
                if (y !== null && !enZonaExcluida(zonasExcluidas, x, z, cubierta, 6)) posiciones.push({ x, y, z, rotacion: aleatorio() * Math.PI * 2 });
            });
            let intentos = 0;
            while (posiciones.length < 100 && intentos++ < 50000) {
                const x = -135 + aleatorio() * 280;
                const z = -200 + aleatorio() * 370;
                if (estaEnZonaRampa(x, z)) continue;
                if (!dentroDelContorno(x, z) || distanciaAlContorno(x, z) < 12) continue;
                if (enZonaExcluida(zonasExcluidas, x, z, cubierta, 6)) continue;
                if (posiciones.some(posicion => Math.hypot(posicion.x - x, posicion.z - z) < 14)) continue;
                const y = alturaSobre(superficie, x, z, alturaOrigen);
                if (y === null) continue;
                posiciones.push({ x, y, z, rotacion: aleatorio() * Math.PI * 2 });
            }

            posiciones.forEach((posicion, indice) => {
                const crearNivel = (contenedor, nivel) => {
                    const instancia = contenedor.instantiateModelsToScene(
                        nombre => `${nombre}-${nivel}-${cubierta}-${indice + 1}`, false
                    );
                    instancia.rootNodes.forEach(raiz => {
                        raiz.position.set(posicion.x, posicion.y, posicion.z);
                        // El nodo interno ya tiene escala 0.01; 33 produce unos 5.2 m reales.
                        raiz.scaling.setAll(33);
                        raiz.rotationQuaternion = null;
                        raiz.rotation.y = posicion.rotacion;
                        raiz.getChildMeshes().forEach(malla => {
                            malla.isPickable = true;
                            malla.receiveShadows = true;
                            obstaculosSolidos.add(malla);
                        });
                    });
                    return instancia.rootNodes;
                };
                arboles.push({
                    x: posicion.x,
                    z: posicion.z,
                    near: crearNivel(near, "near"),
                    mid: crearNivel(mid, "mid")
                });
            });
        };

        distribuir(sueloC2, 10, 0x2c2001, "c2");
        distribuir(sueloC4, 36, 0x2c4001, "c4");

        actualizarManzanos = () => {
            arboles.forEach(arbol => {
                const distancia2 = (arbol.x - camera.position.x) ** 2 + (arbol.z - camera.position.z) ** 2;
                const usarNear = distancia2 < 900;
                arbol.near.forEach(raiz => raiz.setEnabled(usarNear));
                arbol.mid.forEach(raiz => raiz.setEnabled(!usarNear));
            });
        };
        actualizarManzanos();
    }

    async function crearOlmo(sueloC2, zonasExcluidas) {
        if (!sueloC2) return;
        const posicion = { x: -25, z: -25 };
        const y = alturaSobre(sueloC2, posicion.x, posicion.z, 10);
        if (y === null) return;
        const ruta = "assets/img/granja/";
        const mid = await cargarContenedor("elmtree_mid.glb");
        mid.materials.forEach(material => {
            material.backFaceCulling = false;
            material.useAlphaFromAlbedoTexture = true;
            if (material.albedoTexture) material.albedoTexture.hasAlpha = true;
            material.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHATEST;
            material.alphaCutOff = 0.18;
        });

        const crearNivel = (contenedor, nivel) => {
            const instancia = contenedor.instantiateModelsToScene(nombre => `olmo-${nivel}-${nombre}`, false);
            const ancla = new BABYLON.TransformNode(`olmo-${nivel}`, scene);
            ancla.position.set(posicion.x, y, posicion.z);
            ancla.scaling.setAll(0.75);
            instancia.rootNodes.forEach(raiz => {
                raiz.parent = ancla;
                const mallas = [raiz, ...raiz.getChildMeshes()].filter(malla =>
                    malla.getTotalVertices && malla.getTotalVertices() > 0
                );
                mallas.forEach(malla => {
                    malla.isPickable = true;
                    malla.receiveShadows = true;
                    obstaculosSolidos.add(malla);
                });
            });
            return ancla;
        };
        crearNivel(mid, "mid");
        zonasExcluidas.push({
            segmento: [[posicion.x, posicion.z], [posicion.x, posicion.z]],
            radio: 10,
            cubierta: "c2"
        });
    }

    async function crearMandarinos(sueloC2, sueloC4, zonasExcluidas) {
        if (!sueloC2 || !sueloC4) return;
        const ruta = "assets/img/granja/";
        const [nearMid, far] = await Promise.all([
            cargarContenedor("mandarino_near_mid.glb"),
            cargarContenedor("mandarino_far.glb")
        ]);
        [nearMid, far].forEach(contenedor => contenedor.materials.forEach(material => {
            material.backFaceCulling = false;
            material.useAlphaFromAlbedoTexture = true;
            if (material.albedoTexture) material.albedoTexture.hasAlpha = true;
            material.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHATEST;
            material.alphaCutOff = 0.18;
        }));

        const arboles = [];
        const distribuir = (superficie, alturaOrigen, cubierta, semillaInicial) => {
            let semilla = semillaInicial;
            const aleatorio = () => {
                semilla = (Math.imul(semilla, 1664525) + 1013904223) >>> 0;
                return semilla / 4294967296;
            };
            const posiciones = [];
            let intentos = 0;
            while (posiciones.length < 12 && intentos++ < 20000) {
                const x = -125 + aleatorio() * 260;
                const z = -185 + aleatorio() * 340;
                if (estaEnZonaRampa(x, z)) continue;
                if (!dentroDelContorno(x, z) || distanciaAlContorno(x, z) < 14) continue;
                if (enZonaExcluida(zonasExcluidas, x, z, cubierta, 7)) continue;
                if (posiciones.some(punto => Math.hypot(punto.x - x, punto.z - z) < 24)) continue;
                const y = alturaSobre(superficie, x, z, alturaOrigen);
                if (y === null) continue;
                posiciones.push({ x, y, z, giro: aleatorio() * Math.PI * 2, escala: 0.68 + aleatorio() * 0.16 });
            }

            posiciones.forEach((posicion, indice) => {
                const crearNivel = (contenedor, nivel) => {
                    const instancia = contenedor.instantiateModelsToScene(
                        nombre => `mandarino-${nivel}-${cubierta}-${indice}-${nombre}`, false
                    );
                    instancia.rootNodes.forEach(raiz => {
                        raiz.position.set(posicion.x, posicion.y, posicion.z);
                        raiz.scaling.scaleInPlace(posicion.escala);
                        raiz.rotationQuaternion = null;
                        raiz.rotation.y = posicion.giro;
                        raiz.getChildMeshes().forEach(malla => {
                            malla.isPickable = true;
                            malla.receiveShadows = true;
                            obstaculosSolidos.add(malla);
                        });
                    });
                    return instancia.rootNodes;
                };
                arboles.push({
                    x: posicion.x,
                    z: posicion.z,
                    nearMid: crearNivel(nearMid, "near-mid"),
                    far: crearNivel(far, "far")
                });
            });
        };

        distribuir(sueloC2, 10, "c2", 0x6d2a01);
        distribuir(sueloC4, 36, "c4", 0x6d4a01);
        actualizarMandarinos = () => arboles.forEach(arbol => {
            const distancia2 = (arbol.x - camera.position.x) ** 2 + (arbol.z - camera.position.z) ** 2;
            const usarNearMid = distancia2 < 1156;
            arbol.nearMid.forEach(raiz => raiz.setEnabled(usarNearMid));
            arbol.far.forEach(raiz => raiz.setEnabled(!usarNearMid));
        });
        actualizarMandarinos();
    }

    async function crearAgapantos(sueloC2, sueloC4, zonasExcluidas) {
        if (!sueloC2 || !sueloC4) return;
        const ruta = "assets/img/granja/";
        const variantes = await Promise.all([
            cargarContenedor("agapanthus_01.glb"),
            cargarContenedor("agapanthus_02.glb")
        ]);
        variantes.forEach(contenedor => contenedor.materials.forEach(material => {
            material.backFaceCulling = false;
            material.useAlphaFromAlbedoTexture = true;
            if (material.albedoTexture) material.albedoTexture.hasAlpha = true;
            material.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHATEST;
            material.alphaCutOff = 0.22;
        }));

        const plantas = [];
        const centros = {
            c2: [[-17, -43], [17, -42], [-18, -16], [18, -15], [38, 14], [-42, 18]],
            c4: [[-38, 22], [35, 26], [-48, -28], [48, -22]]
        };
        const distribuir = (superficie, alturaOrigen, cubierta, cantidad, semillaInicial) => {
            let semilla = semillaInicial;
            const aleatorio = () => {
                semilla = (Math.imul(semilla, 1664525) + 1013904223) >>> 0;
                return semilla / 4294967296;
            };
            let creadas = 0;
            let intentos = 0;
            while (creadas < cantidad && intentos++ < cantidad * 80) {
                const centro = centros[cubierta][creadas % centros[cubierta].length];
                const angulo = aleatorio() * Math.PI * 2;
                const radio = 1.2 + Math.sqrt(aleatorio()) * 4.2;
                const x = centro[0] + Math.cos(angulo) * radio;
                const z = centro[1] + Math.sin(angulo) * radio;
                if (!dentroDelContorno(x, z)) continue;
                if (enZonaExcluida(zonasExcluidas, x, z, cubierta, 0.45)) continue;
                const y = alturaSobre(superficie, x, z, alturaOrigen);
                if (y === null) continue;
                const contenedor = variantes[creadas % variantes.length];
                const instancia = contenedor.instantiateModelsToScene(
                    nombre => `agapanto-${cubierta}-${creadas}-${nombre}`, false
                );
                const escala = 0.78 + aleatorio() * 0.34;
                instancia.rootNodes.forEach(raiz => {
                    raiz.position.set(x, y, z);
                    raiz.scaling.scaleInPlace(escala);
                    raiz.rotationQuaternion = null;
                    raiz.rotation.y = aleatorio() * Math.PI * 2;
                    raiz.getChildMeshes().forEach(malla => {
                        malla.isPickable = false;
                        malla.receiveShadows = false;
                    });
                });
                plantas.push({ x, z, raices: instancia.rootNodes });
                creadas++;
            }
        };

        distribuir(sueloC2, 10, "c2", 48, 0xa6a2001);
        distribuir(sueloC4, 36, "c4", 32, 0xa6a4001);
        actualizarAgapantos = () => plantas.forEach(planta => {
            const distancia2 = (planta.x - camera.position.x) ** 2 + (planta.z - camera.position.z) ** 2;
            const visible = distancia2 < 3025;
            planta.raices.forEach(raiz => raiz.setEnabled(visible));
        });
        actualizarAgapantos();
    }

    async function crearPraderaMundoAbierto(sueloC2, sueloC4, zonasExcluidas) {
        if (!sueloC2 || !sueloC4) throw new Error("No se han encontrado las superficies de la pradera.");
        const ruta = rutaModelos;
        const tamanoCelda = 8;
        const configuracionLOD = [
            { nombre: "near", tarjetas: 96, radio: 0.82, ancho: 0.29, alto: 0.64 },
            { nombre: "mid", tarjetas: 18, radio: 0.94, ancho: 0.40, alto: 0.54 },
            { nombre: "far", tarjetas: 8, radio: 1.06, ancho: 0.58, alto: 0.42 }
        ];
        // [OPT] Rangos de fundido (entraInicio, entraFin, saleInicio, saleFin) en metros.
        // Son exactamente los de la antigua factorLOD, pero ahora se evalúan en la GPU.
        const rangosLOD = [
            [0, 0, 18, 27],
            [15, 24, 45, 57],
            [42, 54, 78, 97.5]
        ];
        const tipos = [
            { archivo: "hierba-fina-alpha-v1.webp", color: new BABYLON.Color3(0.72, 0.78, 0.40) },
            { archivo: "hierba-ancha-alpha-v1.webp", color: new BABYLON.Color3(0.62, 0.72, 0.36) },
            { archivo: "hierba-seca-alpha-v1.webp", color: new BABYLON.Color3(0.82, 0.72, 0.38) }
        ];

        // [OPT] Plugin de material: encoge cada mata hacia su base según su distancia
        // a la cámara, en el vertex shader. Antes esto se hacía en JavaScript
        // reescribiendo ~30.000 matrices cada 35 cm de paseo (≈18 veces por segundo
        // caminando) y subiendo ~2 MB a la GPU en cada ocasión.
        class FundidoLOD extends BABYLON.MaterialPluginBase {
            constructor(material, rangos) {
                super(material, "FundidoLOD", 200, { FUNDIDO_LOD: false });
                this.rangos = new BABYLON.Vector4(rangos[0], rangos[1], rangos[2], rangos[3]);
                this._enable(true);
            }
            getClassName() { return "FundidoLOD"; }
            prepareDefines(defines) { defines.FUNDIDO_LOD = true; }
            getUniforms() {
                return {
                    ubo: [
                        { name: "fundidoCamara", size: 3, type: "vec3" },
                        { name: "fundidoRangos", size: 4, type: "vec4" }
                    ],
                    vertex: `
#ifdef FUNDIDO_LOD
uniform vec3 fundidoCamara;
uniform vec4 fundidoRangos;
#endif
`
                };
            }
            bindForSubMesh(ubo) {
                ubo.updateVector3("fundidoCamara", camera.globalPosition);
                ubo.updateVector4("fundidoRangos", this.rangos);
            }
            getCustomCode(tipoShader) {
                if (tipoShader !== "vertex") return null;
                return {
                    CUSTOM_VERTEX_UPDATE_WORLDPOS: `
#ifdef FUNDIDO_LOD
vec3 baseMata = finalWorld[3].xyz;
float distanciaMata = distance(baseMata.xz, fundidoCamara.xz);
float entradaMata = fundidoRangos.y > fundidoRangos.x
    ? smoothstep(fundidoRangos.x, fundidoRangos.y, distanciaMata) : 1.0;
float factorMata = entradaMata * (1.0 - smoothstep(fundidoRangos.z, fundidoRangos.w, distanciaMata));
worldPos.xyz = baseMata + (worldPos.xyz - baseMata) * factorMata;
#endif
`
                };
            }
        }

        const crearGrupoHierba = (lod, tipo, indiceLOD, indiceTipo) => {
            let semilla = 0x7183a5 ^ (indiceLOD * 0x9e3779) ^ (indiceTipo * 0x85ebca);
            const aleatorio = () => {
                semilla = (Math.imul(semilla, 1664525) + 1013904223) >>> 0;
                return semilla / 4294967296;
            };
            const posiciones = [];
            const indices = [];
            const uvs = [];
            const normales = [];
            for (let tarjeta = 0; tarjeta < lod.tarjetas; tarjeta++) {
                const distancia = Math.sqrt(aleatorio()) * lod.radio;
                const direccion = aleatorio() * Math.PI * 2;
                const centroX = Math.cos(direccion) * distancia;
                const centroZ = Math.sin(direccion) * distancia;
                const giro = aleatorio() * Math.PI;
                const medioAncho = lod.ancho * (0.78 + aleatorio() * 0.44) / 2;
                const alto = lod.alto * (0.78 + aleatorio() * 0.44);
                const dx = Math.cos(giro) * medioAncho;
                const dz = Math.sin(giro) * medioAncho;
                const base = posiciones.length / 3;
                posiciones.push(
                    centroX - dx, 0, centroZ - dz,
                    centroX + dx, 0, centroZ + dz,
                    centroX + dx, alto, centroZ + dz,
                    centroX - dx, alto, centroZ - dz
                );
                indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
                uvs.push(0, 1, 1, 1, 1, 0, 0, 0);
            }
            BABYLON.VertexData.ComputeNormals(posiciones, indices, normales);
            const datos = new BABYLON.VertexData();
            datos.positions = posiciones;
            datos.indices = indices;
            datos.uvs = uvs;
            datos.normals = normales;
            const malla = new BABYLON.Mesh(`hierba-${lod.nombre}-${indiceTipo}`, scene);
            datos.applyToMesh(malla);
            const material = new BABYLON.StandardMaterial(`material-hierba-${lod.nombre}-${indiceTipo}`, scene);
            const textura = new BABYLON.Texture(`${ruta}${tipo.archivo}`, scene, false, false,
                BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
            textura.hasAlpha = true;
            textura.anisotropicFilteringLevel = indiceLOD === 0 ? 8 : 4;
            material.diffuseTexture = textura;
            material.opacityTexture = textura;
            material.diffuseColor = tipo.color;
            material.specularColor = BABYLON.Color3.Black();
            material.useAlphaFromDiffuseTexture = true;
            material.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;
            material.alphaCutOff = 0.28;
            material.forceDepthWrite = true;
            material.backFaceCulling = false;
            material.twoSidedLighting = true;
            material.fundidoLOD = new FundidoLOD(material, rangosLOD[indiceLOD]);
            malla.material = material;
            malla.isPickable = false;
            malla.receiveShadows = false;
            malla.renderingGroupId = 0;
            malla.alwaysSelectAsActiveMesh = true;
            return malla;
        };
        const maestros = configuracionLOD.map((lod, indiceLOD) =>
            tipos.map((tipo, indiceTipo) => crearGrupoHierba(lod, tipo, indiceLOD, indiceTipo))
        );
        // [OPT] Las dos luces puntuales de cielo (intensidad 0,2 y alcance 260 m) dan
        // un relleno casi uniforme, pero se evaluaban en cada píxel de cada tarjeta de
        // hierba (la parte con más sobredibujado de la escena). La hierba ya no las usa.
        [luzC2, luzC4].forEach(luz => luz.excludedMeshes.push(...maestros.flat()));

        actualizarCarga(77, "CARGANDO MAPA DE HIERBA…");
        const binario = await promesaMapaHierba;
        const vista = new DataView(binario);
        if (String.fromCharCode(...new Uint8Array(binario, 0, 4)) !== "ALGC" || vista.getUint32(4, true) !== 1) {
            throw new Error("El mapa de hierba no es válido.");
        }
        const cantidad = vista.getUint32(8, true);
        const celdas = new Map();
        const permitida = (x, z, cubierta) =>
            dentroDelContorno(x, z) && distanciaAlContorno(x, z) >= 3.5 &&
            !enZonaExcluida(zonasExcluidas, x, z, cubierta);
        const matriz = new BABYLON.Matrix();
        const escalaVector = new BABYLON.Vector3();
        const posicion = new BABYLON.Vector3();
        const rotacion = new BABYLON.Quaternion();
        for (let indice = 0; indice < cantidad; indice++) {
            const offset = 12 + indice * 16;
            const x = vista.getFloat32(offset, true);
            const y = vista.getFloat32(offset + 4, true);
            const z = vista.getFloat32(offset + 8, true);
            const atributos = vista.getUint32(offset + 12, true);
            const cubierta = y > 10 ? "c4" : "c2";
            if (permitida(x, z, cubierta)) {
                const tipo = (atributos & 7) % tipos.length;
                const celdaX = Math.floor(x / tamanoCelda);
                const celdaZ = Math.floor(z / tamanoCelda);
                const clave = `${cubierta}:${celdaX}:${celdaZ}`;
                let celda = celdas.get(clave);
                if (!celda) {
                    celda = {
                        cubierta, celdaX, celdaZ,
                        centroX: (celdaX + 0.5) * tamanoCelda,
                        centroZ: (celdaZ + 0.5) * tamanoCelda,
                        matrices: tipos.map(() => [])
                    };
                    celdas.set(clave, celda);
                }
                const giro = ((atributos >>> 11) & 255) / 256 * Math.PI * 2;
                const escala = 0.82 + ((atributos >>> 19) & 255) / 255 * 0.38;
                escalaVector.set(escala, escala * (0.88 + ((atributos >>> 3) & 255) / 255 * 0.18), escala);
                posicion.set(x, y + 0.008, z);
                BABYLON.Quaternion.FromEulerAnglesToRef(0, giro, 0, rotacion);
                BABYLON.Matrix.ComposeToRef(escalaVector, rotacion, posicion, matriz);
                matriz.copyToArray(celda.matrices[tipo], celda.matrices[tipo].length);
            }
            if (indice % 20000 === 19999) {
                actualizarCarga(77 + (indice / cantidad) * 15, "ORGANIZANDO CELDAS…");
                await new Promise(resolver => window.requestAnimationFrame(resolver));
            }
        }
        const celdasPorCubierta = { c2: [], c4: [] };
        celdas.forEach(celda => {
            celda.matrices = celda.matrices.map(datos => new Float32Array(datos));
            celdasPorCubierta[celda.cubierta].push(celda);
        });

        const estadosBuffer = maestros.map(nivel => nivel.map(() => ({
            datos: new Float32Array(16 * 2048), inicializado: false
        })));
        // [OPT] Copia por bloques (memcpy) en lugar de bucles por componente.
        const actualizarBuffer = (malla, estado, lista) => {
            let necesario = 0;
            for (let i = 0; i < lista.length; i++) necesario += lista[i].length;
            if (necesario > estado.datos.length) {
                let capacidad = estado.datos.length;
                while (capacidad < necesario) capacidad *= 2;
                estado.datos = new Float32Array(capacidad);
                estado.inicializado = false;
            }
            let desplazamiento = 0;
            for (let i = 0; i < lista.length; i++) {
                estado.datos.set(lista[i], desplazamiento);
                desplazamiento += lista[i].length;
            }
            const instancias = desplazamiento / 16;
            if (!estado.inicializado) {
                malla.thinInstanceSetBuffer("matrix", estado.datos, 16, false);
                estado.inicializado = true;
                malla.thinInstanceCount = instancias;
            } else {
                // [OPT] El recuento va ANTES de avisar del cambio: Babylon sube a la GPU
                // solo las primeras thinInstanceCount matrices. Antes se fijaba después,
                // de modo que al crecer el recuento se dibujaban matrices antiguas.
                malla.thinInstanceCount = instancias;
                malla.thinInstanceBufferUpdated("matrix");
            }
            malla.setEnabled(instancias > 0);
        };

        // [OPT] Reconstrucción mucho menos frecuente y solo con lo que se ve:
        //  - se rehace al avanzar 2 m o girar ~17° (antes: cada 35 cm);
        //  - las celdas fuera del campo de visión (+26° de margen) no se envían.
        //    Antes se dibujaba la hierba de los 360°, unas 3-4 veces más de la necesaria.
        const UMBRAL_MOVIMIENTO = 2;
        const UMBRAL_GIRO = 0.3;
        const MARGEN_CONO = 0.45;
        const RADIO_SIEMPRE_VISIBLE = 12;
        const holgura = UMBRAL_MOVIMIENTO + tamanoCelda * Math.SQRT1_2;
        const fragmentos = configuracionLOD.map(() => tipos.map(() => []));
        const ultimaPosicion = new BABYLON.Vector3(Number.POSITIVE_INFINITY, 0, Number.POSITIVE_INFINITY);
        let ultimoGiro = Number.NaN;
        let ultimaCubierta = "";
        const actualizar = (forzar = false) => {
            const cubierta = camera.position.y > 18 ? "c4" : "c2";
            const giro = camera.rotation.y;
            let diferenciaGiro = Math.abs(Math.atan2(Math.sin(giro - ultimoGiro), Math.cos(giro - ultimoGiro)));
            if (!Number.isFinite(diferenciaGiro)) diferenciaGiro = Number.POSITIVE_INFINITY;
            const dxMov = camera.position.x - ultimaPosicion.x;
            const dzMov = camera.position.z - ultimaPosicion.z;
            if (!forzar && cubierta === ultimaCubierta && diferenciaGiro < UMBRAL_GIRO &&
                dxMov * dxMov + dzMov * dzMov < UMBRAL_MOVIMIENTO * UMBRAL_MOVIMIENTO) return;
            ultimaPosicion.copyFrom(camera.position);
            ultimoGiro = giro;
            ultimaCubierta = cubierta;

            const camaraX = camera.position.x;
            const camaraZ = camera.position.z;
            // Mirando muy hacia abajo/arriba el cono horizontal deja de ser fiable.
            const usarCono = Math.abs(camera.rotation.x) < 0.9;
            const frenteX = Math.sin(giro);
            const frenteZ = Math.cos(giro);
            const semiangulo = Math.atan(Math.tan(camera.fov / 2) * engine.getAspectRatio(camera)) + MARGEN_CONO;
            const radioCelda = tamanoCelda * Math.SQRT1_2;
            fragmentos.forEach(nivel => nivel.forEach(lista => { lista.length = 0; }));

            const lista = celdasPorCubierta[cubierta];
            for (let i = 0; i < lista.length; i++) {
                const celda = lista[i];
                const dx = celda.centroX - camaraX;
                const dz = celda.centroZ - camaraZ;
                const distancia = Math.hypot(dx, dz);
                if (distancia > 97.5 + holgura) continue;
                if (usarCono && distancia > RADIO_SIEMPRE_VISIBLE) {
                    const coseno = Math.max(-1, Math.min(1, (dx * frenteX + dz * frenteZ) / distancia));
                    const radioAngular = Math.asin(Math.min(1, radioCelda / distancia));
                    if (Math.acos(coseno) - radioAngular > semiangulo) continue;
                }
                const anadir = nivel => {
                    const matrices = celda.matrices;
                    for (let tipo = 0; tipo < matrices.length; tipo++) {
                        if (matrices[tipo].length) fragmentos[nivel][tipo].push(matrices[tipo]);
                    }
                };
                if (distancia <= 27 + holgura) anadir(0);
                if (distancia >= 15 - holgura && distancia <= 57 + holgura) anadir(1);
                if (distancia >= 42 - holgura) anadir(2);
            }
            maestros.forEach((nivel, indiceLOD) => nivel.forEach((malla, indiceTipo) =>
                actualizarBuffer(malla, estadosBuffer[indiceLOD][indiceTipo], fragmentos[indiceLOD][indiceTipo])
            ));
        };
        actualizarPraderaBromus = actualizar;
        actualizar(true);
        actualizarCarga(95, "PRADERA PREPARADA…");
        console.log(`Pradera mundo abierto: ${cantidad} grupos, ${celdas.size} celdas precalculadas.`);
    }

    // ------------------------------------------------------------------------
    // [OPT] Calidad real HIGH/LOW. El botón antes conmutaba la "hierba próxima",
    // una función que ya no se llamaba en ningún sitio: no hacía nada.
    //  HIGH: SSAO activado, resolución nativa.
    //  LOW:  sin SSAO (se libera, no solo se oculta) y render interno al 80 %.
    // Si en HIGH la visita va por debajo de 40 FPS durante 4 s seguidos, pasa sola a LOW
    // (salvo que el usuario ya haya elegido manualmente).
    // ------------------------------------------------------------------------
    const botonCalidad = document.getElementById("granjaCalidad");
    let calidadAlta = false;
    let oclusion = null;
    let eleccionManual = false;
    let segundosLentos = 0;
    function aplicarCalidad(alta) {
        calidadAlta = alta;
        if (alta && !oclusion && BABYLON.SSAO2RenderingPipeline) {
            oclusion = new BABYLON.SSAO2RenderingPipeline("oclusion-ambiental", scene, {
                ssaoRatio: 0.65,
                blurRatio: 0.5
            });
            oclusion.radius = 1.35;
            oclusion.totalStrength = 0.72;
            oclusion.expensiveBlur = false;
            scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("oclusion-ambiental", camera);
        } else if (!alta && oclusion) {
            scene.postProcessRenderPipelineManager.detachCamerasFromRenderPipeline("oclusion-ambiental", camera);
            oclusion.dispose(true);
            oclusion = null;
        }
        engine.setHardwareScalingLevel(alta ? 1 : 1.25);
        if (botonCalidad) botonCalidad.textContent = alta ? "MODO HIGH" : "MODO LOW";
    }
    function configurarCalidad() {
        const esOrdenador = window.innerWidth >= 1100 && window.matchMedia("(pointer: fine)").matches;
        aplicarCalidad(esOrdenador);
        botonCalidad?.addEventListener("click", evento => {
            evento.preventDefault();
            evento.stopPropagation();
            eleccionManual = true;
            aplicarCalidad(!calidadAlta);
        });
    }
    function vigilarRendimiento(fotogramas, segundos) {
        if (!visitaActiva || !calidadAlta || eleccionManual) return;
        segundosLentos = fotogramas < 40 ? segundosLentos + segundos : 0;
        if (segundosLentos >= 4) {
            console.info("[Granja] Rendimiento bajo sostenido: se pasa a MODO LOW.");
            eleccionManual = true;
            aplicarCalidad(false);
        }
    }

    BABYLON.SceneLoader.ImportMeshAsync(
        "", "assets/img/granja/", "granja-pradera-pbr-v46-hueco-fondo-enlaces-limpios.glb", scene,
        evento => {
            const fraccion = evento.lengthComputable && evento.total ? evento.loaded / evento.total : 0;
            actualizarCarga(4 + fraccion * 26, "CARGANDO TERRENO…");
        }
    )
        .then(async ({ meshes }) => {
            actualizarCarga(32, "PREPARANDO PAISAJE…");
            const visibles = meshes.filter(mesh => mesh.getTotalVertices && mesh.getTotalVertices() > 0 &&
                !/SUPERFICIE_HAIR_/i.test(mesh.name));
            // [OPT] Las superficies HAIR nunca se dibujan ni se consultan: se liberan de la GPU.
            meshes.filter(mesh => /SUPERFICIE_HAIR_/i.test(mesh.name)).forEach(mesh => mesh.dispose(true, false));

            visibles.forEach(mesh => {
                mesh.checkCollisions = false;
                if (/carretera_/i.test(mesh.name)) {
                    mesh.alwaysSelectAsActiveMesh = true;
                    mesh.receiveShadows = false;
                    mesh.refreshBoundingInfo();
                }
                if (/suelo|granja_rampa|cubo\.025|carretera_/i.test(mesh.name)) {
                    mesh.isPickable = true;
                    superficiesTransitables.add(mesh);
                }
                if (/talud_rampa|pared_trasera_rampa|murete_|muro_/i.test(mesh.name)) {
                    mesh.isPickable = true;
                    obstaculosSolidos.add(mesh);
                }
                // [OPT] Antes se evaluaba esta expresión regular contra TODAS las mallas
                // de la escena en cada fotograma de movimiento.
                if (/talud_rampa/i.test(mesh.name)) taludes.add(mesh);
            });

            vestirArquitectura(visibles);
            const paisaje = construirPaisaje(visibles);
            // La precarga de vegetación debe centrarse en el punto real de aparición.
            camera.position.copyFrom(inicio);
            actualizarCarga(40, "CARGANDO CASA…");
            await crearCasaJeanPierre(paisaje?.sueloC2, paisaje?.zonasExcluidas || []);
            actualizarCarga(47, "CARGANDO TRACTOR…");
            await crearTractor(paisaje?.sueloC2, paisaje?.zonasExcluidas || []);
            actualizarCarga(49, "COLOCANDO APEROS…");
            await crearAdornosCasa(paisaje?.sueloC2, paisaje?.zonasExcluidas || []);
            actualizarCarga(50, "CARGANDO ESTABLO…");
            await crearEstablo(paisaje?.sueloC2, paisaje?.zonasExcluidas || []);
            actualizarCarga(51, "SOLTANDO VACAS…");
            await crearVacas(paisaje?.sueloC2, paisaje?.zonasExcluidas || []);
            actualizarCarga(52, "CARGANDO OLMO…");
            await crearOlmo(paisaje?.sueloC2, paisaje?.zonasExcluidas || []);
            actualizarCarga(56, "CARGANDO MANZANOS…");
            await crearManzanos(paisaje?.sueloC2, paisaje?.sueloC4, paisaje?.zonasExcluidas || []);
            actualizarCarga(68, "CARGANDO MANDARINOS…");
            await crearMandarinos(paisaje?.sueloC2, paisaje?.sueloC4, paisaje?.zonasExcluidas || []);
            actualizarCarga(72, "CARGANDO FLORES…");
            await crearAgapantos(paisaje?.sueloC2, paisaje?.sueloC4, paisaje?.zonasExcluidas || []);
            actualizarCarga(76, "GENERANDO PRADERA…");
            await crearPraderaMundoAbierto(paisaje?.sueloC2, paisaje?.sueloC4, paisaje?.zonasExcluidas || []);
            actualizarCarga(96, "PREPARANDO VISITA…");

            // [OPT] Índices de altura construidos ya, para que el primer paso no tenga tirón.
            superficiesTransitables.forEach(indiceAltura);
            taludes.forEach(indiceAltura);

            configurarCalidad();

            // [OPT] Luz, muros y rampa son estáticos: el mapa de sombras (2048 px + blur
            // de 24) se renderizaba en cada fotograma para obtener siempre el mismo
            // resultado. Ahora se genera una sola vez, cuando todo está listo.
            scene.executeWhenReady(() => {
                sombras.getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
            });

            camera.position.copyFrom(inicio);

            actualizarCarga(100, "LISTO");
            entrar.disabled = false;
            cargaTexto.textContent = "ENTRAR EN GRANJA";
            entrar.removeAttribute("role");
            entrar.removeAttribute("aria-valuemin");
            entrar.removeAttribute("aria-valuemax");
            entrar.removeAttribute("aria-valuenow");
        })
        .catch(fallo => {
            console.error(fallo);
            error.hidden = false;
            error.textContent = `No se ha podido cargar la maqueta: ${fallo.message || fallo}`;
            cargaTexto.textContent = "ERROR DE CARGA";
        });

    entrar.addEventListener("click", () => {
        portada.hidden = true;
        hud.hidden = false;
        visitaActiva = true;
        camera.attachControl(canvas, true);
        if (esTactil) controlesTactiles?.classList.add("granja-controles-tactiles--activos");
        else canvas.requestPointerLock?.();
    });

    canvas.addEventListener("click", () => {
        if (!esTactil && visitaActiva && document.pointerLockElement !== canvas) canvas.requestPointerLock?.();
    });

    function configurarJoystick(elemento, alMover) {
        if (!elemento) return;
        const mando = elemento.querySelector("span");
        let puntero = null;
        const actualizar = evento => {
            const caja = elemento.getBoundingClientRect();
            const radio = Math.min(caja.width, caja.height) * 0.34;
            let x = evento.clientX - (caja.left + caja.width / 2);
            let y = evento.clientY - (caja.top + caja.height / 2);
            const distancia = Math.hypot(x, y);
            if (distancia > radio) {
                x = x / distancia * radio;
                y = y / distancia * radio;
            }
            mando.style.transform = `translate(${x}px,${y}px)`;
            alMover(x / radio, y / radio, evento);
        };
        elemento.addEventListener("pointerdown", evento => {
            evento.preventDefault();
            puntero = evento.pointerId;
            elemento.setPointerCapture(puntero);
            actualizar(evento);
        });
        elemento.addEventListener("pointermove", evento => {
            if (evento.pointerId !== puntero) return;
            evento.preventDefault();
            actualizar(evento);
        });
        const finalizar = evento => {
            if (evento.pointerId !== puntero) return;
            puntero = null;
            mando.style.transform = "translate(0,0)";
            alMover(0, 0, evento);
        };
        elemento.addEventListener("pointerup", finalizar);
        elemento.addEventListener("pointercancel", finalizar);
    }

    configurarJoystick(joystickMover, (x, y) => {
        movimientoTactil.x = x;
        movimientoTactil.y = y;
    });
    configurarJoystick(joystickMirar, (x, y) => {
        miradaTactil.x = x;
        miradaTactil.y = y;
    });
    botonRapido?.addEventListener("pointerdown", evento => {
        evento.preventDefault();
        multiplicadorTactil = multiplicadorTactil === 1 ? 1.8 : 1;
        botonRapido.classList.toggle("activo", multiplicadorTactil > 1);
        botonRapido.textContent = multiplicadorTactil > 1 ? "RÁPIDO ×1,8" : "RÁPIDO";
    });

    window.addEventListener("keydown", evento => {
        if (teclasMovimiento.has(evento.code)) {
            evento.preventDefault();
            teclas.add(evento.code);
        }
        if (evento.code === "KeyR") recuperarVisitante();
    });

    window.addEventListener("keyup", evento => {
        teclas.delete(evento.code);
    });

    window.addEventListener("blur", () => teclas.clear());

    // [OPT] El HUD se escribía en el DOM en cada fotograma (estilo + repintado del
    // HTML encima del canvas). Ahora el FPS se refresca 2 veces por segundo y la
    // cubierta solo cuando cambia.
    let ultimoRefrescoHud = 0;
    let textoCubierta = "";
    const posicionVegetacion = new BABYLON.Vector3(Number.POSITIVE_INFINITY, 0, Number.POSITIVE_INFINITY);
    const origenChoque = new BABYLON.Vector3();
    const direccionChoque = new BABYLON.Vector3();
    const rayoChoque = new BABYLON.Ray(origenChoque, direccionChoque, 1);
    const predicadoChoque = mesh => obstaculosSolidos.has(mesh) && mesh.isEnabled();

    scene.onBeforeRenderObservable.add(() => {
        const ahora = performance.now();
        if (ahora - ultimoRefrescoHud > 500) {
            const intervalo = (ahora - ultimoRefrescoHud) / 1000;
            ultimoRefrescoHud = ahora;
            const fotogramas = engine.getFps();
            fps.textContent = `${Math.round(fotogramas)} FPS`;
            vigilarRendimiento(fotogramas, Math.min(intervalo, 1));
        }
        const nuevaCubierta = camera.position.y > 18 ? "CUBIERTA C4" : "CUBIERTA C2";
        if (nuevaCubierta !== textoCubierta) cubierta.textContent = textoCubierta = nuevaCubierta;

        if (visitaActiva) {
            const deltaControl = Math.min(engine.getDeltaTime() / 1000, 0.05);
            if (esTactil) {
                camera.rotation.y += miradaTactil.x * 2.15 * deltaControl;
                camera.rotation.x = Math.max(-1.25, Math.min(1.15, camera.rotation.x + miradaTactil.y * 1.55 * deltaControl));
            }
            const avance = camera.getDirection(BABYLON.Axis.Z);
            const lateral = camera.getDirection(BABYLON.Axis.X);
            avance.y = 0;
            lateral.y = 0;
            avance.normalize();
            lateral.normalize();

            const movimiento = new BABYLON.Vector3(0, 0, 0);
            if (teclas.has("KeyW") || teclas.has("ArrowUp")) movimiento.addInPlace(avance);
            if (teclas.has("KeyS") || teclas.has("ArrowDown")) movimiento.subtractInPlace(avance);
            if (teclas.has("KeyD") || teclas.has("ArrowRight")) movimiento.addInPlace(lateral);
            if (teclas.has("KeyA") || teclas.has("ArrowLeft")) movimiento.subtractInPlace(lateral);
            if (esTactil) {
                movimiento.addInPlace(avance.scale(-movimientoTactil.y));
                movimiento.addInPlace(lateral.scale(movimientoTactil.x));
            }

            if (movimiento.lengthSquared() > 0) {
                const paso = 6.4 * (esTactil ? multiplicadorTactil : 1) * engine.getDeltaTime() / 1000;
                movimiento.normalize().scaleInPlace(paso);
            }

            if (movimiento.lengthSquared() > 0) {
                const destino = camera.position.add(movimiento);
                const bloqueadoPorPared =
                    !dentroDelContorno(destino.x, destino.z) ||
                    distanciaAlContorno(destino.x, destino.z) < 0.9;
                const bloqueadoPorBarandilla =
                    camera.position.y > 23.3 &&
                    barandillaC4.some(segmento =>
                        distanciaASegmento(destino.x, destino.z, segmento) < 0.65
                    );
                const bloqueadoPorMuroHueco =
                    camera.position.y > 14.8 && camera.position.y < 23.4 &&
                    murosHueco.some(segmento =>
                        distanciaASegmento(destino.x, destino.z, segmento) < 0.75
                    );
                const bloqueadoPorAnimal = obstaculosDinamicos.some(obstaculo =>
                    Math.abs(camera.position.y - obstaculo.nodo.position.y) < 3 &&
                    Math.hypot(
                        destino.x - obstaculo.nodo.position.x,
                        destino.z - obstaculo.nodo.position.z
                    ) < obstaculo.radio + 0.45
                );
                // [OPT] Comprobaciones baratas primero; el raycast solo si hacen falta.
                const bloqueoBarato = bloqueadoPorPared || bloqueadoPorBarandilla ||
                    bloqueadoPorMuroHueco || bloqueadoPorAnimal;
                // En la boca de C4 los taludes continúan parcialmente bajo el
                // enlace y el suelo. No deben bloquear al visitante cuando hay
                // una superficie transitable válida por encima de ellos.
                const sueloDestino = !bloqueoBarato ? alturaEnMallas(
                    superficiesTransitables, destino.x, destino.z,
                    destino.y + 0.6, destino.y - 2.5
                ) : null;
                const sobreTalud = !bloqueoBarato && sueloDestino === null &&
                    alturaEnMallas(taludes, destino.x, destino.z, destino.y + 4, destino.y - 4) !== null;
                let choqueFrontal = false;
                if (!bloqueoBarato && !sobreTalud) {
                    // [OPT] Con predicado propio Babylon NO filtra mallas desactivadas:
                    // se probaban también los LOD ocultos de los 248 árboles. Ahora solo
                    // las activas, y el rayo se reutiliza en vez de crearse cada fotograma.
                    const longitud = movimiento.length();
                    origenChoque.copyFrom(camera.position);
                    direccionChoque.copyFrom(movimiento).scaleInPlace(1 / longitud);
                    rayoChoque.length = longitud + 0.55;
                    choqueFrontal = scene.pickWithRay(rayoChoque, predicadoChoque).hit;
                }
                if (!bloqueoBarato && !choqueFrontal && !sobreTalud) {
                    camera.position.x = destino.x;
                    camera.position.z = destino.z;
                }
            }

            actualizarPraderaBromus?.();
            // [OPT] Los LOD de árboles y flores (≈330 nodos) solo se revisan tras moverse 1 m.
            if (BABYLON.Vector3.DistanceSquared(camera.position, posicionVegetacion) > 1) {
                posicionVegetacion.copyFrom(camera.position);
                actualizarManzanos?.();
                actualizarMandarinos?.();
                actualizarAgapantos?.();
            }
            actualizarVacas?.();

            const delta = Math.min(engine.getDeltaTime() / 1000, 0.05);
            // [OPT] Antes: raycast contra toda la escena y todos los triángulos del suelo
            // en cada fotograma. Mismo rango que el rayo original (de +0,6 m a −2,5 m).
            const suelo = alturaEnMallas(
                superficiesTransitables, camera.position.x, camera.position.z,
                camera.position.y + 0.6, camera.position.y + 0.6 - 3.1
            );
            const alturaApoyo = suelo !== null ? suelo + 1.72 : null;
            if (alturaApoyo !== null && Math.abs(camera.position.y - alturaApoyo) < 2.8) {
                camera.position.y = alturaApoyo;
                velocidadVertical = 0;
            } else {
                velocidadVertical -= 9.81 * delta;
                camera.position.y += velocidadVertical * delta;
            }
        }

        const fueraDelRecinto =
            camera.position.x < -170 || camera.position.x > 160 ||
            camera.position.z < -230 || camera.position.z > 200 ||
            camera.position.y < -5 || camera.position.y > 42;

        if (fueraDelRecinto) recuperarVisitante();
    });

    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());
})();
