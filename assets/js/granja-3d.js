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

    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);
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
    const obstaculosDinamicos = [];
    // Inicio junto al pie de la rampa para comprobarla inmediatamente.
    let inicio = new BABYLON.Vector3(43.5, 1.72, 49.5);
    let visitaActiva = false;
    let velocidadVertical = 0;
    let actualizarHierbaProxima = null;
    let actualizarPraderaBromus = null;
    let actualizarManzanos = null;
    let actualizarMandarinos = null;
    let actualizarAgapantos = null;
    let actualizarOlmo = null;
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

    function distanciaAlContorno(x, z) {
        let distancia = Infinity;
        for (let i = 0; i < contorno.length; i++) {
            const siguiente = (i + 1) % contorno.length;
            distancia = Math.min(
                distancia,
                distanciaASegmento(x, z, [contorno[i], contorno[siguiente]])
            );
        }
        return distancia;
    }

    function crearTexturaOrganica(nombre, base, variacion, tamano = 1024) {
        const textura = new BABYLON.DynamicTexture(nombre, tamano, scene, false);
        const contexto = textura.getContext();
        const imagen = contexto.createImageData(tamano, tamano);
        for (let y = 0; y < tamano; y++) {
            for (let x = 0; x < tamano; x++) {
                const indicePixel = (y * tamano + x) * 4;
                const nx = x / tamano;
                const ny = y / tamano;
                const onda =
                    Math.sin((nx * 3.1 + ny * 1.7) * Math.PI * 2) * 0.24 +
                    Math.cos((nx * 7.3 - ny * 4.9) * Math.PI * 2) * 0.16 +
                    Math.sin((nx * 18.7 + ny * 13.1) * Math.PI * 2) * 0.09 +
                    Math.cos((nx * 41.3 - ny * 29.7) * Math.PI * 2) * 0.045 +
                    (Math.random() - 0.5) * 0.18;
                imagen.data[indicePixel] = Math.max(0, Math.min(255, base[0] + onda * variacion));
                imagen.data[indicePixel + 1] = Math.max(0, Math.min(255, base[1] + onda * variacion));
                imagen.data[indicePixel + 2] = Math.max(0, Math.min(255, base[2] + onda * variacion));
                imagen.data[indicePixel + 3] = 255;
            }
        }
        contexto.putImageData(imagen, 0, 0);
        textura.update(false);
        textura.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
        textura.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
        textura.uScale = 1;
        textura.vScale = 1;
        return textura;
    }

    function crearTexturaCielo(nombre) {
        const tamano = 1536;
        const textura = new BABYLON.DynamicTexture(nombre, { width: tamano, height: 768 }, scene, false);
        const contexto = textura.getContext();
        const degradado = contexto.createLinearGradient(0, 0, 0, 768);
        degradado.addColorStop(0, "#287fc4");
        degradado.addColorStop(0.52, "#76bce7");
        degradado.addColorStop(1, "#d5e7ed");
        contexto.fillStyle = degradado;
        contexto.fillRect(0, 0, tamano, 768);
        let semilla = 73421;
        const azar = () => ((semilla = (semilla * 16807) % 2147483647) - 1) / 2147483646;
        for (let i = 0; i < 135; i++) {
            const x = azar() * tamano;
            const y = 80 + azar() * 430;
            const radio = 45 + azar() * 155;
            const nube = contexto.createRadialGradient(x, y, 0, x, y, radio);
            nube.addColorStop(0, `rgba(255,255,255,${0.12 + azar() * 0.20})`);
            nube.addColorStop(0.35, "rgba(255,255,255,0.12)");
            nube.addColorStop(1, "rgba(255,255,255,0)");
            contexto.fillStyle = nube;
            contexto.fillRect(x - radio, y - radio * 0.35, radio * 2, radio * 0.7);
        }
        textura.update(false);
        textura.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
        textura.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
        return textura;
    }

    function crearTexturaPaneles(nombre) {
        const textura = new BABYLON.DynamicTexture(nombre, 1024, scene, false);
        const contexto = textura.getContext();
        contexto.fillStyle = "#a9aaa5";
        contexto.fillRect(0, 0, 1024, 1024);
        contexto.strokeStyle = "rgba(52,58,61,.30)";
        contexto.lineWidth = 4;
        for (let x = 0; x <= 1024; x += 128) {
            contexto.beginPath(); contexto.moveTo(x, 0); contexto.lineTo(x, 1024); contexto.stroke();
        }
        for (let y = 0; y <= 1024; y += 96) {
            contexto.beginPath(); contexto.moveTo(0, y); contexto.lineTo(1024, y); contexto.stroke();
        }
        textura.update(false);
        textura.uScale = 5;
        textura.vScale = 2;
        return textura;
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
        cieloC2.backFaceCulling = false;
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

    function materialTerreno(nombre, color, variacion) {
        const material = new BABYLON.StandardMaterial(nombre, scene);
        material.diffuseTexture = crearTexturaOrganica(`${nombre}-textura`, color, variacion);
        material.specularColor = BABYLON.Color3.Black();
        material.roughness = 1;
        return material;
    }

    function alturaSobre(superficie, x, z, alturaOrigen) {
        const rayo = new BABYLON.Ray(
            new BABYLON.Vector3(x, alturaOrigen, z),
            BABYLON.Vector3.Down(),
            30
        );
        const impacto = scene.pickWithRay(rayo, mesh => mesh === superficie);
        return impacto?.hit && impacto.pickedPoint ? impacto.pickedPoint.y : null;
    }

    function densificarLineal(puntos, cerrado, pasos = 5) {
        const resultado = [];
        const total = cerrado ? puntos.length : puntos.length - 1;
        for (let i = 0; i < total; i++) {
            const a = puntos[i];
            const b = puntos[(i + 1) % puntos.length];
            for (let paso = 0; paso < pasos; paso++) {
                const t = paso / pasos;
                resultado.push([
                    a[0] + (b[0] - a[0]) * t,
                    a[1] + (b[1] - a[1]) * t
                ]);
            }
        }
        if (!cerrado) resultado.push(puntos[puntos.length - 1]);
        return resultado;
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

    function crearCamino(nombre, puntos2d, anchura, superficie, alturaOrigen, material, cerrado = false, suavizado = 7) {
        const trazado = suavizarTrazado(puntos2d, cerrado, suavizado, 7);
        const centros = densificarLineal(trazado, cerrado, 2)
            .map(([x, z]) => {
                const y = alturaSobre(superficie, x, z, alturaOrigen);
                return y === null ? null : new BABYLON.Vector3(x, y + 0.045, z);
            })
            .filter(Boolean);
        if (centros.length < 2) return;

        const posiciones = [];
        const uvs = [];
        const indices = [];
        const normales = [];
        let recorrido = 0;
        for (let i = 0; i < centros.length; i++) {
            const anterior = centros[Math.max(0, i - 1)];
            const siguiente = centros[Math.min(centros.length - 1, i + 1)];
            const a = cerrado && i === 0 ? centros[centros.length - 1] : anterior;
            const b = cerrado && i === centros.length - 1 ? centros[0] : siguiente;
            const dx = b.x - a.x;
            const dz = b.z - a.z;
            const longitud = Math.hypot(dx, dz) || 1;
            const nx = -dz / longitud * anchura / 2;
            const nz = dx / longitud * anchura / 2;
            if (i > 0) recorrido += BABYLON.Vector3.Distance(centros[i - 1], centros[i]);
            posiciones.push(
                centros[i].x + nx, centros[i].y, centros[i].z + nz,
                centros[i].x - nx, centros[i].y, centros[i].z - nz
            );
            uvs.push(0, recorrido / 31, 1, recorrido / 31);
        }
        const segmentos = cerrado ? centros.length : centros.length - 1;
        for (let i = 0; i < segmentos; i++) {
            const siguiente = (i + 1) % centros.length;
            const a = i * 2, b = a + 1, c = siguiente * 2, d = c + 1;
            indices.push(a, c, b, b, c, d, b, c, a, d, c, b);
        }
        BABYLON.VertexData.ComputeNormals(posiciones, indices, normales);
        const datos = new BABYLON.VertexData();
        datos.positions = posiciones;
        datos.indices = indices;
        datos.normals = normales;
        datos.uvs = uvs;
        const camino = new BABYLON.Mesh(nombre, scene);
        datos.applyToMesh(camino);
        camino.material = material;
        camino.isPickable = true;
        camino.receiveShadows = true;
        superficiesTransitables.add(camino);
        return camino;
    }

    function crearHierbaProxima(superficies, zonasExcluidas) {
        const hierba = new BABYLON.Mesh("hierba-proxima", scene);
        const ancho = 0.34;
        const alto = 0.24;
        const posiciones = [
            -ancho / 2, 0, 0, ancho / 2, 0, 0, ancho / 2, alto, 0, -ancho / 2, alto, 0,
            0, 0, -ancho / 2, 0, 0, ancho / 2, 0, alto, ancho / 2, 0, alto, -ancho / 2
        ];
        const indices = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7];
        const uvs = [0,1, 1,1, 1,0, 0,0, 0,1, 1,1, 1,0, 0,0];
        const normales = [];
        BABYLON.VertexData.ComputeNormals(posiciones, indices, normales);
        const datos = new BABYLON.VertexData();
        datos.positions = posiciones;
        datos.indices = indices;
        datos.uvs = uvs;
        datos.normals = normales;
        datos.applyToMesh(hierba);

        const materialHierba = new BABYLON.StandardMaterial("hierba-proxima-material", scene);
        const texturaHierba = new BABYLON.Texture(
            "assets/img/granja/hierba-fina-alpha-v1.webp",
            scene,
            true,
            false,
            BABYLON.Texture.TRILINEAR_SAMPLINGMODE
        );
        texturaHierba.hasAlpha = true;
        materialHierba.diffuseTexture = texturaHierba;
        materialHierba.opacityTexture = texturaHierba;
        materialHierba.useAlphaFromDiffuseTexture = true;
        materialHierba.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;
        materialHierba.alphaCutOff = 0.22;
        materialHierba.backFaceCulling = false;
        materialHierba.twoSidedLighting = true;
        materialHierba.specularColor = BABYLON.Color3.Black();
        materialHierba.emissiveColor = new BABYLON.Color3(0.025, 0.055, 0.012);
        hierba.material = materialHierba;
        const crearVariante = (nombre, ruta, tinte) => {
            const variante = hierba.clone(nombre);
            const material = materialHierba.clone(`${nombre}-material`);
            const textura = new BABYLON.Texture(ruta, scene, true, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
            textura.hasAlpha = true;
            material.diffuseTexture = textura;
            material.opacityTexture = textura;
            material.diffuseColor = tinte;
            variante.material = material;
            return variante;
        };
        const hierbaAncha = crearVariante(
            "hierba-ancha",
            "assets/img/granja/hierba-ancha-alpha-v1.webp",
            new BABYLON.Color3(0.92, 1, 0.90)
        );
        const hierbaSeca = crearVariante(
            "hierba-seca",
            "assets/img/granja/hierba-seca-alpha-v1.webp",
            new BABYLON.Color3(1, 0.94, 0.78)
        );
        const variedades = [hierba, hierbaAncha, hierbaSeca];
        variedades.forEach(variedad => {
            variedad.isPickable = false;
            variedad.alwaysSelectAsActiveMesh = true;
        });
        let modoHigh = false;
        let ultimoCentro = new BABYLON.Vector3(Number.POSITIVE_INFINITY, 0, Number.POSITIVE_INFINITY);
        let versionHierba = 0;

        actualizarHierbaProxima = (forzar = false) => {
            if (!modoHigh) return;
            if (!forzar && BABYLON.Vector3.DistanceSquared(camera.position, ultimoCentro) < 900) return;
            const centroCalculo = camera.position.clone();
            ultimoCentro.copyFrom(centroCalculo);
            const version = ++versionHierba;
            let semilla = ((Math.floor(centroCalculo.x / 8) * 73856093) ^ (Math.floor(centroCalculo.z / 8) * 19349663)) >>> 0;
            const aleatorio = () => {
                semilla = (semilla * 1664525 + 1013904223) >>> 0;
                return semilla / 4294967296;
            };
            const matrices = [[], [], []];
            const superficie = centroCalculo.y > 18 ? superficies.c4 : superficies.c2;
            const alturaOrigen = superficie === superficies.c2 ? 10 : 36;
            const candidatos = 11000;
            let indiceCandidato = 0;
            const procesarBloque = () => {
                if (version !== versionHierba || !modoHigh) return;
                const limite = Math.min(candidatos, indiceCandidato + 140);
                for (; indiceCandidato < limite; indiceCandidato++) {
                    const angulo = aleatorio() * Math.PI * 2;
                    const radio = Math.sqrt(aleatorio()) * 44;
                    const probabilidad = radio <= 18 ? 1 : Math.pow(Math.max(0, (44 - radio) / 26), 1.55);
                    if (aleatorio() > probabilidad) continue;
                    const x = centroCalculo.x + Math.cos(angulo) * radio;
                    const z = centroCalculo.z + Math.sin(angulo) * radio;
                    if (!dentroDelContorno(x, z) || distanciaAlContorno(x, z) < 3.5) continue;
                    if (zonasExcluidas.some(zona => distanciaASegmento(x, z, zona.segmento) < zona.radio)) continue;
                    const y = alturaSobre(superficie, x, z, alturaOrigen);
                    if (y === null) continue;
                    const cantidadGrupo = radio < 14 ? 4 : radio < 27 ? 2 : 1;
                    for (let planta = 0; planta < cantidadGrupo; planta++) {
                        const anguloGrupo = aleatorio() * Math.PI * 2;
                        const radioGrupo = planta === 0 ? 0 : 0.08 + aleatorio() * 0.24;
                        const escala = 0.58 + aleatorio() * 0.42;
                        const matriz = BABYLON.Matrix.Compose(
                            new BABYLON.Vector3(escala, escala * (0.78 + aleatorio() * 0.42), escala),
                            BABYLON.Quaternion.FromEulerAngles(0, aleatorio() * Math.PI, 0),
                            new BABYLON.Vector3(x + Math.cos(anguloGrupo) * radioGrupo, y + 0.008, z + Math.sin(anguloGrupo) * radioGrupo)
                        );
                        const eleccion = aleatorio();
                        const tipo = eleccion < 0.72 ? 0 : eleccion < 0.91 ? 1 : 2;
                        matrices[tipo].push(...matriz.asArray());
                    }
                }
                if (indiceCandidato < candidatos) {
                    if (window.requestIdleCallback) window.requestIdleCallback(procesarBloque, { timeout: 40 });
                    else window.setTimeout(procesarBloque, 0);
                    return;
                }
                variedades.forEach((variedad, indice) => {
                    variedad.thinInstanceSetBuffer("matrix", new Float32Array(matrices[indice]), 16, true);
                    variedad.thinInstanceCount = matrices[indice].length / 16;
                    variedad.thinInstanceRefreshBoundingInfo(true);
                });
            };
            procesarBloque();
        };

        variedades.forEach(variedad => {
            variedad.thinInstanceSetBuffer("matrix", new Float32Array(0), 16, true);
            variedad.thinInstanceCount = 0;
        });
        const botonCalidad = document.getElementById("granjaCalidad");
        if (botonCalidad) {
            botonCalidad.addEventListener("click", evento => {
                evento.preventDefault();
                evento.stopPropagation();
                modoHigh = !modoHigh;
                botonCalidad.textContent = modoHigh ? "MODO HIGH" : "MODO LOW";
                if (modoHigh) actualizarHierbaProxima(true);
                else {
                    versionHierba++;
                    variedades.forEach(variedad => variedad.thinInstanceCount = 0);
                }
            });

            const esOrdenador = window.innerWidth >= 1100 && window.matchMedia("(pointer: fine)").matches;
            if (esOrdenador) {
                modoHigh = true;
                botonCalidad.textContent = "MODO HIGH";
                window.setTimeout(() => actualizarHierbaProxima(true), 0);
            }
        }
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

        const crearTaludRampa = () => {
            const mallaRampa = superficies.find(mesh => /^GRANJA_Rampa$/i.test(mesh.name));
            const vertices = mallaRampa?.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            if (!mallaRampa || !vertices?.length) return;
            mallaRampa.computeWorldMatrix(true);
            const matrizMundo = mallaRampa.getWorldMatrix();
            const puntos = [];
            for (let i = 0; i < vertices.length; i += 3) {
                puntos.push(BABYLON.Vector3.TransformCoordinates(
                    new BABYLON.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]),
                    matrizMundo
                ));
            }
            const centroX = puntos.reduce((suma, punto) => suma + punto.x, 0) / puntos.length;
            const centroZ = puntos.reduce((suma, punto) => suma + punto.z, 0) / puntos.length;
            let xx = 0, zz = 0, xz = 0;
            puntos.forEach(punto => {
                const x = punto.x - centroX;
                const z = punto.z - centroZ;
                xx += x * x; zz += z * z; xz += x * z;
            });
            const anguloPrincipal = 0.5 * Math.atan2(2 * xz, xx - zz);
            let eje = new BABYLON.Vector3(Math.cos(anguloPrincipal), 0, Math.sin(anguloPrincipal));
            let lateral = new BABYLON.Vector3(-eje.z, 0, eje.x);
            const proyectados = puntos.map(punto => ({
                punto,
                p: (punto.x - centroX) * eje.x + (punto.z - centroZ) * eje.z,
                q: (punto.x - centroX) * lateral.x + (punto.z - centroZ) * lateral.z
            }));
            const minP = Math.min(...proyectados.map(dato => dato.p));
            const maxP = Math.max(...proyectados.map(dato => dato.p));
            const minQ = Math.min(...proyectados.map(dato => dato.q));
            const maxQ = Math.max(...proyectados.map(dato => dato.q));
            const margenExtremo = (maxP - minP) * 0.08;
            const alturaA = Math.max(...proyectados.filter(dato => dato.p <= minP + margenExtremo).map(dato => dato.punto.y));
            const alturaB = Math.max(...proyectados.filter(dato => dato.p >= maxP - margenExtremo).map(dato => dato.punto.y));
            const qCentro = (minQ + maxQ) / 2;
            let inicioRampa = new BABYLON.Vector3(centroX + eje.x * minP + lateral.x * qCentro, alturaA, centroZ + eje.z * minP + lateral.z * qCentro);
            let finalRampa = new BABYLON.Vector3(centroX + eje.x * maxP + lateral.x * qCentro, alturaB, centroZ + eje.z * maxP + lateral.z * qCentro);
            if (inicioRampa.y > finalRampa.y) {
                [inicioRampa, finalRampa] = [finalRampa, inicioRampa];
                eje = eje.scale(-1);
            }
            const mediaAnchuraRampa = (maxQ - minQ) / 2;
            const direccion = finalRampa.subtract(inicioRampa);
            const longitud = Math.hypot(direccion.x, direccion.z) || 1;
            const crearLado = (signo, nombre) => {
                const posiciones = [];
                const indices = [];
                const uvs = [];
                const normales = [];
                const tramos = 34;
                const franjas = 5;
                for (let i = 0; i <= tramos; i++) {
                    const avance = (i / tramos) * 1.20;
                    const t = Math.min(avance, 1);
                    const centro = avance <= 1
                        ? BABYLON.Vector3.Lerp(inicioRampa, finalRampa, avance)
                        : new BABYLON.Vector3(
                            finalRampa.x + eje.x * longitud * (avance - 1),
                            finalRampa.y,
                            finalRampa.z + eje.z * longitud * (avance - 1)
                        );
                    for (let j = 0; j < franjas; j++) {
                        const s = j / (franjas - 1);
                        const distancia = mediaAnchuraRampa + 0.08 + s * 14;
                        const x = centro.x + lateral.x * distancia * signo;
                        const z = centro.z + lateral.z * distancia * signo;
                        const sueloInferior = alturaSobre(sueloC2, x, z, 10) ?? inicioRampa.y;
                        const progresoFinal = Math.max(0, Math.min(1, (t - 0.80) / 0.20));
                        const suavizadoFinal = progresoFinal * progresoFinal * (3 - 2 * progresoFinal);
                        const baseTalud = sueloInferior + (finalRampa.y - sueloInferior) * suavizadoFinal;
                        posiciones.push(
                            x,
                            centro.y + (baseTalud - centro.y) * Math.pow(s, 1.25) + Math.sin(t * 17 + s * 5) * 0.12 * s,
                            z
                        );
                        uvs.push(avance * 8, s * 2.4);
                    }
                }
                for (let i = 0; i < tramos; i++) {
                    for (let j = 0; j < franjas - 1; j++) {
                        const a = i * franjas + j;
                        const b = a + franjas;
                        indices.push(a, b, a + 1, a + 1, b, b + 1);
                    }
                }
                BABYLON.VertexData.ComputeNormals(posiciones, indices, normales);
                const datos = new BABYLON.VertexData();
                datos.positions = posiciones;
                datos.indices = indices;
                datos.uvs = uvs;
                datos.normals = normales;
                const talud = new BABYLON.Mesh(nombre, scene);
                datos.applyToMesh(talud);
                talud.material = pradera;
                talud.material.backFaceCulling = false;
                talud.isPickable = false;
                talud.receiveShadows = true;
            };
            crearLado(-1, "talud-rampa-izquierdo");
            crearLado(1, "talud-rampa-derecho");

            const direccionNormalizada = new BABYLON.Vector3(direccion.x / longitud, 0, direccion.z / longitud);
            const bordeIzquierdo = [];
            const bordeDerecho = [];
            const tramosEntrada = 12;
            for (let i = 0; i <= tramosEntrada; i++) {
                const t = i / tramosEntrada;
                const distanciaAtras = (1 - t) * 11;
                const xCentro = inicioRampa.x - direccionNormalizada.x * distanciaAtras;
                const zCentro = inicioRampa.z - direccionNormalizada.z * distanciaAtras;
                const sueloEntrada = alturaSobre(sueloC2, xCentro, zCentro, 10) ?? inicioRampa.y;
                const suave = t * t * (3 - 2 * t);
                const y = sueloEntrada + (inicioRampa.y - sueloEntrada) * suave + 0.025;
                bordeIzquierdo.push(new BABYLON.Vector3(xCentro - lateral.x * mediaAnchuraRampa, y, zCentro - lateral.z * mediaAnchuraRampa));
                bordeDerecho.push(new BABYLON.Vector3(xCentro + lateral.x * mediaAnchuraRampa, y, zCentro + lateral.z * mediaAnchuraRampa));
            }
            const prolongacion = BABYLON.MeshBuilder.CreateRibbon("prolongacion-enterrada-rampa", {
                pathArray: [bordeIzquierdo, bordeDerecho],
                sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                updatable: false
            }, scene);
            prolongacion.material = mallaRampa.material;
            prolongacion.isPickable = true;
            prolongacion.receiveShadows = true;
            superficiesTransitables.add(prolongacion);

            const anchoTrasero = mediaAnchuraRampa + 11.7;
            const xIzq = finalRampa.x - lateral.x * anchoTrasero;
            const zIzq = finalRampa.z - lateral.z * anchoTrasero;
            const xDer = finalRampa.x + lateral.x * anchoTrasero;
            const zDer = finalRampa.z + lateral.z * anchoTrasero;
            const baseTrasera = alturaSobre(sueloC2, finalRampa.x, finalRampa.z, 10) ?? inicioRampa.y;
            const posicionesPared = [
                xIzq, baseTrasera, zIzq, xDer, baseTrasera, zDer,
                xDer, finalRampa.y, zDer, xIzq, finalRampa.y, zIzq
            ];
            const indicesPared = [0, 1, 2, 0, 2, 3, 2, 1, 0, 3, 2, 0];
            const normalesPared = [];
            BABYLON.VertexData.ComputeNormals(posicionesPared, indicesPared, normalesPared);
            const datosPared = new BABYLON.VertexData();
            datosPared.positions = posicionesPared;
            datosPared.indices = indicesPared;
            datosPared.normals = normalesPared;
            datosPared.uvs = [0, 0, 1, 0, 1, 1, 0, 1];
            const paredTrasera = new BABYLON.Mesh("pared-trasera-rampa", scene);
            datosPared.applyToMesh(paredTrasera);
            paredTrasera.material = superficies.find(mesh => /GRANJA_Paredes/i.test(mesh.name))?.material;
            paredTrasera.isPickable = false;
            paredTrasera.receiveShadows = true;

        };
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

        // La carretera vuelve a seguir íntegramente el perímetro. La rampa se
        // conecta mediante un único tramo recto, sin desvíos ni curvas añadidas.
        const carreteraPerimetral = suavizarTrazado(anilloBase, true, 8, 10);
        // Boca real de la rampa en coordenadas Babylon. La antigua Z positiva
        // desplazaba la exclusión a otra zona y producía una gran calva.
        const bocaRampa = [48.8504, -38.0921];
        const unionRampa = carreteraPerimetral.reduce((mejor, punto) =>
            Math.hypot(punto[0] - bocaRampa[0], punto[1] - bocaRampa[1]) < Math.hypot(mejor[0] - bocaRampa[0], mejor[1] - bocaRampa[1]) ? punto : mejor
        );
        const enlaceRampa = [unionRampa, bocaRampa];
        const zonasExcluidas = [];
        const registrarTramos = (puntos, radio, cerrado = false, cubierta = "c2") => {
            const limite = cerrado ? puntos.length : puntos.length - 1;
            for (let i = 0; i < limite; i++) {
                zonasExcluidas.push({ segmento: [puntos[i], puntos[(i + 1) % puntos.length]], radio, cubierta });
            }
        };
        // El firme mide 7,4 m y la franja allanada 9,4 m. Este margen cubre la
        // calzada y el arcén sin vaciar grandes bandas de pradera.
        registrarTramos(carreteraPerimetral, 5.0, true);
        registrarTramos(enlaceRampa, 5.0);
        // Corredor preciso para rampa y taludes: impide árboles, ganado y hierba
        // sobre la subida o bajo ella, sin afectar al resto del módulo.
        zonasExcluidas.push(
            { segmento: [[48.85, -38.09], [109.70, -124.35]], radio: 6.2, cubierta: "c2" },
            { segmento: [[92.0, -99.2], [109.70, -124.35]], radio: 6.2, cubierta: "c4" }
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
        const contenedor = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "assets/img/granja/", "tramain_house_1_france.glb", scene
        );
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

        const contenedor = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "assets/img/granja/", "tractor.glb", scene
        );
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
                obstaculosSolidos.add(malla);
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
            BABYLON.SceneLoader.LoadAssetContainerAsync("assets/img/granja/", "bale.glb", scene),
            BABYLON.SceneLoader.LoadAssetContainerAsync("assets/img/granja/", "bag.glb", scene)
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
                    obstaculosSolidos.add(malla);
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

        const contenedor = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "assets/img/granja/", "establo.glb", scene
        );
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
                obstaculosSolidos.add(malla);
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
        const contenedor = await BABYLON.SceneLoader.LoadAssetContainerAsync(
            "assets/img/granja/", "vaca.glb", scene
        );
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

        const puntoPermitido = (x, z) => dentroDelContorno(x, z) &&
            !zonasExcluidas.some(zona => zona.cubierta === "c2" &&
                distanciaASegmento(x, z, zona.segmento) < zona.radio + 1.8);

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

                const altura = alturaSobre(
                    sueloC2, vaca.pivote.position.x, vaca.pivote.position.z, 10
                );
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
            BABYLON.SceneLoader.LoadAssetContainerAsync("assets/img/granja/", "manzano_near.glb", scene),
            BABYLON.SceneLoader.LoadAssetContainerAsync("assets/img/granja/", "manzano_mid.glb", scene)
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
                if (y !== null && !zonasExcluidas.some(zona => zona.cubierta === cubierta &&
                    distanciaASegmento(x, z, zona.segmento) < zona.radio + 6
                )) posiciones.push({ x, y, z, rotacion: aleatorio() * Math.PI * 2 });
            });
            let intentos = 0;
            while (posiciones.length < 100 && intentos++ < 50000) {
                const x = -135 + aleatorio() * 280;
                const z = -200 + aleatorio() * 370;
                if (estaEnZonaRampa(x, z)) continue;
                if (!dentroDelContorno(x, z) || distanciaAlContorno(x, z) < 12) continue;
                if (zonasExcluidas.some(zona => zona.cubierta === cubierta &&
                    distanciaASegmento(x, z, zona.segmento) < zona.radio + 6)) continue;
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
        const mid = await BABYLON.SceneLoader.LoadAssetContainerAsync(ruta, "elmtree_mid.glb", scene);
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
        actualizarOlmo = () => {};
        actualizarOlmo();
    }

    async function crearMandarinos(sueloC2, sueloC4, zonasExcluidas) {
        if (!sueloC2 || !sueloC4) return;
        const ruta = "assets/img/granja/";
        const [nearMid, far] = await Promise.all([
            BABYLON.SceneLoader.LoadAssetContainerAsync(ruta, "mandarino_near_mid.glb", scene),
            BABYLON.SceneLoader.LoadAssetContainerAsync(ruta, "mandarino_far.glb", scene)
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
                if (zonasExcluidas.some(zona => zona.cubierta === cubierta &&
                    distanciaASegmento(x, z, zona.segmento) < zona.radio + 7)) continue;
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
            BABYLON.SceneLoader.LoadAssetContainerAsync(ruta, "agapanthus_01.glb", scene),
            BABYLON.SceneLoader.LoadAssetContainerAsync(ruta, "agapanthus_02.glb", scene)
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
                if (zonasExcluidas.some(zona => zona.cubierta === cubierta &&
                    distanciaASegmento(x, z, zona.segmento) < zona.radio + 0.45)) continue;
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

    async function crearPraderaMixta(sueloC2, sueloC4, zonasExcluidas) {
        if (!sueloC2 || !sueloC4) throw new Error("No se han encontrado las superficies de la pradera.");

        // ✅ FIX WORKER: Inicializar Web Worker para generación async de celdas
        let worker = null;
        let siguienteSolicitudWorker = 1;
        const solicitudesWorker = new Map();
        try {
            // Intenta crear el Worker si está disponible
            worker = new Worker('assets/js/granja-3d-celda-worker.js');
            console.log("✅ Web Worker inicializado para generación async de celdas");

            worker.onmessage = evento => {
                const resolver = solicitudesWorker.get(evento.data.solicitudId);
                if (!resolver) return;
                solicitudesWorker.delete(evento.data.solicitudId);
                resolver(evento.data);
            };
            worker.onerror = error => {
                console.warn("⚠️ El worker ha fallado; se activa el cálculo compatible:", error.message);
                worker = null;
                solicitudesWorker.forEach(resolver => resolver(null));
                solicitudesWorker.clear();
            };

            // Enviar datos iniciales al Worker
            worker.postMessage({
                tipo: "inicializar",
                datos: {
                    pisos: {},  // Se llena después
                    contorno: contorno  // Desde función global
                }
            });
        } catch (error) {
            console.warn("⚠️ Web Worker no disponible, usando thread principal:", error.message);
            worker = null;  // Fallback: seguir con thread principal
        }

        const pedirAlWorker = (tipo, datos) => {
            if (!worker) return Promise.resolve(null);
            const solicitudId = siguienteSolicitudWorker++;
            return new Promise(resolver => {
                solicitudesWorker.set(solicitudId, resolver);
                worker.postMessage({ tipo, datos, solicitudId });
            });
        };

        const ruta = "assets/img/granja/";
        const especies = [
            { nombre: "bromus", peso: 0.34 },
            { nombre: "dactylis", peso: 0.27 },
            { nombre: "alopecurus", peso: 0.22 },
            { nombre: "alliaria", peso: 0.17 }
        ];
        const niveles = ["near", "mid"];
        const resultados = await Promise.all(especies.flatMap(especie =>
            niveles.map(nivel => BABYLON.SceneLoader.ImportMeshAsync(
                "", ruta, `${especie.nombre}_${nivel}.glb`, scene
            ))
        ));
        const obtenerVariantes = resultado => resultado.meshes.filter(
            mesh => mesh.getTotalVertices && mesh.getTotalVertices() > 0
        );
        const modelos = especies.map((especie, indiceEspecie) => {
            const fuentes = niveles.map((nivel, indiceNivel) =>
                obtenerVariantes(resultados[indiceEspecie * niveles.length + indiceNivel])
            );
            if (!fuentes[0].length || fuentes.some(variantes => variantes.length !== fuentes[0].length)) {
                throw new Error(`Los LOD de ${especie.nombre} no contienen las mismas variantes.`);
            }
            fuentes[0].forEach((malla, indice) => {
                fuentes.forEach(variantes => variantes[indice].parent = null);
                const material = malla.material;
                if (material) {
                    material.backFaceCulling = false;
                    material.useAlphaFromAlbedoTexture = true;
                    if (material.albedoTexture) material.albedoTexture.hasAlpha = true;
                    material.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHATEST;
                    material.alphaCutOff = 0.05;
                }
                fuentes.slice(1).forEach(variantes => variantes[indice].material = material);
                fuentes.forEach(variantes => {
                    variantes[indice].isPickable = false;
                    variantes[indice].alwaysSelectAsActiveMesh = true;
                    variantes[indice].position.y = -1000;
                });
            });
            return { ...especie, fuentes };
        });

        const crearImpostor = (nombre, archivo, tinte) => {
            const ancho = 0.48;
            const alto = 0.62;
            const malla = new BABYLON.Mesh(nombre, scene);
            const posiciones = [
                -ancho / 2, 0, 0, ancho / 2, 0, 0, ancho / 2, alto, 0, -ancho / 2, alto, 0,
                0, 0, -ancho / 2, 0, 0, ancho / 2, 0, alto, ancho / 2, 0, alto, -ancho / 2
            ];
            const indices = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7];
            const uvs = [0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0];
            const normales = [];
            BABYLON.VertexData.ComputeNormals(posiciones, indices, normales);
            const vertices = new BABYLON.VertexData();
            vertices.positions = posiciones;
            vertices.indices = indices;
            vertices.uvs = uvs;
            vertices.normals = normales;
            vertices.applyToMesh(malla);

            const material = new BABYLON.StandardMaterial(`${nombre}-material`, scene);
            const textura = new BABYLON.Texture(
                `${ruta}${archivo}`, scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE
            );
            textura.hasAlpha = true;
            textura.anisotropicFilteringLevel = 8;
            material.diffuseTexture = textura;
            material.opacityTexture = textura;
            material.diffuseColor = tinte;
            material.useAlphaFromDiffuseTexture = true;
            material.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;
            material.alphaCutOff = 0.18;
            material.backFaceCulling = false;
            material.twoSidedLighting = true;
            material.specularColor = BABYLON.Color3.Black();
            malla.material = material;
            malla.isPickable = false;
            malla.alwaysSelectAsActiveMesh = true;
            malla.renderingGroupId = 0;
            return malla;
        };
        const impostores = [
            crearImpostor("impostor-fino", "hierba-fina-alpha-v1.webp", new BABYLON.Color3(0.68, 0.76, 0.38)),
            crearImpostor("impostor-ancho", "hierba-ancha-alpha-v1.webp", new BABYLON.Color3(0.58, 0.70, 0.35)),
            crearImpostor("impostor-seco", "hierba-seca-alpha-v1.webp", new BABYLON.Color3(0.78, 0.69, 0.35))
        ];
        const impostoresPorCubierta = {
            c2: impostores,
            c4: impostores.map((malla, indice) => {
                const copia = malla.clone(`impostor-c4-${indice}`);
                copia.setEnabled(false);
                return copia;
            })
        };

        const elegirEspecie = valor => {
            let acumulado = 0;
            for (let indice = 0; indice < modelos.length; indice++) {
                acumulado += modelos[indice].peso;
                if (valor <= acumulado) return indice;
            }
            return modelos.length - 1;
        };
        let ultimaCeldaX = Number.POSITIVE_INFINITY;
        let ultimaCeldaZ = Number.POSITIVE_INFINITY;
        let ultimaCubierta = "";
        // Celdas pequeñas: conservan la densidad, pero reducen el tamaño visible de cada cambio LOD.
        const tamanoCelda = 2.5;
        const divisiones = 8;
        const paso = tamanoCelda / divisiones;
        // La geometría GLB se reserva para el entorno inmediato. El fondo fijo evita huecos.
        const alcance = 10;
        const alcancePrecarga = 18;
        const cache = { c2: new Map(), c4: new Map() };
        const tamanoCeldaImpostor = 10;
        const divisionesImpostor = 10;
        const pasoImpostor = tamanoCeldaImpostor / divisionesImpostor;
        const cacheImpostores = { c2: new Map(), c4: new Map() };
        const fragmentosPorGrupo = modelos.map(modelo => modelo.fuentes.map(variantes =>
            variantes.map(() => [])
        ));
        const buffersPorGrupo = modelos.map(modelo => modelo.fuentes.map(variantes =>
            variantes.map(() => ({ datos: new Float32Array(16 * 2048), inicializado: false }))
        ));
        const colaPrecarga = [];
        const precargaPendiente = new Set();
        let precargaEnCurso = false;
        let celdasDesdeRefresco = 0;
        let c4Activada = false;
        const umbralActivacionC4 = 14.8;

        const generarCelda = (celdaX, celdaZ, cubierta, superficie, alturaOrigen, candidatosWorker = null) => {
            const clave = `${celdaX},${celdaZ}`;
            if (cache[cubierta].has(clave)) return cache[cubierta].get(clave);
            let semilla = (
                Math.imul(celdaX, 73856093) ^ Math.imul(celdaZ, 19349663) ^
                (cubierta === "c2" ? 0x2c2001 : 0x2c4001)
            ) >>> 0;
            const aleatorio = () => {
                semilla = (semilla * 1664525 + 1013904223) >>> 0;
                return semilla / 4294967296;
            };
            const matricesCelda = modelos.map(modelo => modelo.fuentes[0].map(() => []));
            const matriz = new BABYLON.Matrix();
            const escalaVector = new BABYLON.Vector3();
            const posicion = new BABYLON.Vector3();
            const rotacion = new BABYLON.Quaternion();
            let cantidad = 0;
            const candidatos = candidatosWorker || [];
            if (!candidatosWorker) {
                for (let fila = 0; fila < divisiones; fila++) {
                    for (let columna = 0; columna < divisiones; columna++) {
                        candidatos.push({
                            x: celdaX * tamanoCelda + (columna + aleatorio()) * paso,
                            z: celdaZ * tamanoCelda + (fila + aleatorio()) * paso
                        });
                    }
                }
            }
            for (const candidato of candidatos) {
                    const { x, z } = candidato;
                    if (!dentroDelContorno(x, z) || distanciaAlContorno(x, z) < 3.5) continue;
                    if (zonasExcluidas.some(zona => zona.cubierta === cubierta &&
                        distanciaASegmento(x, z, zona.segmento) < zona.radio)) continue;
                    const impacto = scene.pickWithRay(
                        new BABYLON.Ray(new BABYLON.Vector3(x, alturaOrigen, z), BABYLON.Vector3.Down(), 30),
                        mesh => superficiesTransitables.has(mesh)
                    );
                    if (!impacto?.hit || impacto.pickedMesh !== superficie || !impacto.pickedPoint) continue;
                    const indiceEspecie = elegirEspecie(aleatorio());
                    const variantesNear = modelos[indiceEspecie].fuentes[0];
                    const indiceVariante = Math.floor(aleatorio() * variantesNear.length);
                    const escala = 0.88 + aleatorio() * 0.34;
                    const boundingBox = variantesNear[indiceVariante].getBoundingInfo().boundingBox;
                    const base = boundingBox.minimum.y;  // Típicamente -5.0
                    const altura = boundingBox.maximum.y - base;
                    escalaVector.set(escala * 1.55, escala, escala * 1.55);
                    // ✅ FIX 3: ALTURA CORRECTA - invierte el signo del base offset
                    // base es negativo (-5.0), así que -base * escala coloca el fondo EN el terreno
                    posicion.set(x, impacto.pickedPoint.y - base * escala, z);
                    BABYLON.Quaternion.FromEulerAnglesToRef(0, aleatorio() * Math.PI * 2, 0, rotacion);
                    BABYLON.Matrix.ComposeToRef(escalaVector, rotacion, posicion, matriz);
                    matriz.copyToArray(matricesCelda[indiceEspecie][indiceVariante],
                        matricesCelda[indiceEspecie][indiceVariante].length);
                    cantidad++;
            }
            const celda = {
                matrices: matricesCelda.map(variantes => variantes.map(datos => new Float32Array(datos))),
                cantidad,
                transicion: aleatorio()
            };
            cache[cubierta].set(clave, celda);
            return celda;
        };

        const generarCeldaImpostor = (celdaX, celdaZ, cubierta, superficie, alturaOrigen) => {
            const clave = `${celdaX},${celdaZ}`;
            if (cacheImpostores[cubierta].has(clave)) return cacheImpostores[cubierta].get(clave);
            let semilla = (
                Math.imul(celdaX, 83492791) ^ Math.imul(celdaZ, 2971215073) ^
                (cubierta === "c2" ? 0x1f2e3d : 0x4a5b6c)
            ) >>> 0;
            const aleatorio = () => {
                semilla = (semilla * 1664525 + 1013904223) >>> 0;
                return semilla / 4294967296;
            };
            const matrices = impostores.map(() => []);
            const matriz = new BABYLON.Matrix();
            const escalaVector = new BABYLON.Vector3();
            const posicion = new BABYLON.Vector3();
            const rotacion = new BABYLON.Quaternion();
            for (let fila = 0; fila < divisionesImpostor; fila++) {
                for (let columna = 0; columna < divisionesImpostor; columna++) {
                    const x = celdaX * tamanoCeldaImpostor + (columna + aleatorio()) * pasoImpostor;
                    const z = celdaZ * tamanoCeldaImpostor + (fila + aleatorio()) * pasoImpostor;
                    if (!dentroDelContorno(x, z) || distanciaAlContorno(x, z) < 3.5) continue;
                    if (zonasExcluidas.some(zona => zona.cubierta === cubierta &&
                        distanciaASegmento(x, z, zona.segmento) < zona.radio)) continue;
                    const y = alturaSobre(superficie, x, z, alturaOrigen);
                    if (y === null) continue;
                    const eleccion = aleatorio();
                    const tipo = eleccion < 0.60 ? 0 : eleccion < 0.90 ? 1 : 2;
                    const escala = 0.72 + aleatorio() * 0.34;
                    escalaVector.set(escala * (0.85 + aleatorio() * 0.25), escala * (0.72 + aleatorio() * 0.20), escala);
                    posicion.set(x, y + 0.004, z);
                    BABYLON.Quaternion.FromEulerAnglesToRef(0, aleatorio() * Math.PI, 0, rotacion);
                    BABYLON.Matrix.ComposeToRef(escalaVector, rotacion, posicion, matriz);
                    matriz.copyToArray(matrices[tipo], matrices[tipo].length);
                }
            }
            const celda = {
                matrices: matrices.map(datos => new Float32Array(datos)),
                variacion: aleatorio()
            };
            cacheImpostores[cubierta].set(clave, celda);
            return celda;
        };

        const recorrerCeldas = (radio, callback) => {
            const centroX = Math.floor(camera.position.x / tamanoCelda);
            const centroZ = Math.floor(camera.position.z / tamanoCelda);
            const radioCeldas = Math.ceil((radio + tamanoCelda) / tamanoCelda);
            for (let dz = -radioCeldas; dz <= radioCeldas; dz++) {
                for (let dx = -radioCeldas; dx <= radioCeldas; dx++) {
                    const celdaX = centroX + dx;
                    const celdaZ = centroZ + dz;
                    const xCentro = (celdaX + 0.5) * tamanoCelda;
                    const zCentro = (celdaZ + 0.5) * tamanoCelda;
                    if (Math.hypot(xCentro - camera.position.x, zCentro - camera.position.z) <= radio + tamanoCelda) {
                        callback(celdaX, celdaZ);
                    }
                }
            }
        };

        const recorrerCeldasImpostores = callback => {
            const minX = Math.floor(Math.min(...contorno.map(punto => punto[0])) / tamanoCeldaImpostor) - 1;
            const maxX = Math.floor(Math.max(...contorno.map(punto => punto[0])) / tamanoCeldaImpostor) + 1;
            const minZ = Math.floor(Math.min(...contorno.map(punto => punto[1])) / tamanoCeldaImpostor) - 1;
            const maxZ = Math.floor(Math.max(...contorno.map(punto => punto[1])) / tamanoCeldaImpostor) + 1;
            for (let celdaZ = minZ; celdaZ <= maxZ; celdaZ++) {
                for (let celdaX = minX; celdaX <= maxX; celdaX++) {
                    const xCentro = (celdaX + 0.5) * tamanoCeldaImpostor;
                    const zCentro = (celdaZ + 0.5) * tamanoCeldaImpostor;
                    if (dentroDelContorno(xCentro, zCentro) ||
                        distanciaAlContorno(xCentro, zCentro) < tamanoCeldaImpostor) {
                        callback(celdaX, celdaZ);
                    }
                }
            }
        };

        const precalentarPorLotes = async (cubierta, superficie, alturaOrigen, informar) => {
            const celdas = [];
            recorrerCeldas(alcancePrecarga, (celdaX, celdaZ) => celdas.push({ celdaX, celdaZ }));
            const tamanoLote = 12;
            for (let inicioLote = 0; inicioLote < celdas.length; inicioLote += tamanoLote) {
                const lote = celdas.slice(inicioLote, inicioLote + tamanoLote);
                const respuestaWorker = await pedirAlWorker("generar-lote", {
                    celdas: lote, tamanoCelda, divisiones, paso, alturaOrigen, cubierta
                });
                for (let indice = 0; indice < lote.length; indice++) {
                    const { celdaX, celdaZ } = lote[indice];
                    const candidatos = respuestaWorker?.resultados?.[indice]?.resultado?.candidatos || null;
                    generarCelda(celdaX, celdaZ, cubierta, superficie, alturaOrigen, candidatos);
                }
                informar?.(Math.min(1, (inicioLote + lote.length) / celdas.length));
                await new Promise(resolver => window.requestAnimationFrame(resolver));
            }
        };

        const precalentarImpostoresPorLotes = async (cubierta, superficie, alturaOrigen, informar) => {
            const celdas = [];
            recorrerCeldasImpostores((celdaX, celdaZ) =>
                celdas.push({ celdaX, celdaZ })
            );
            for (let indice = 0; indice < celdas.length; indice++) {
                const { celdaX, celdaZ } = celdas[indice];
                generarCeldaImpostor(celdaX, celdaZ, cubierta, superficie, alturaOrigen);
                informar?.((indice + 1) / celdas.length);
                if (indice % 2 === 1) {
                    await new Promise(resolver => window.requestAnimationFrame(resolver));
                }
            }
        };

        const construirCapaImpostores = cubierta => {
            const impostoresActivos = impostoresPorCubierta[cubierta];
            const fragmentos = impostoresActivos.map(() => []);
            cacheImpostores[cubierta].forEach(celda =>
                celda.matrices.forEach((datos, tipo) => {
                    if (datos.length) fragmentos[tipo].push(datos);
                })
            );
            impostoresActivos.forEach((malla, tipo) => {
                const longitud = fragmentos[tipo].reduce((total, datos) => total + datos.length, 0);
                const matrices = new Float32Array(longitud);
                let desplazamiento = 0;
                fragmentos[tipo].forEach(datos => {
                    matrices.set(datos, desplazamiento);
                    desplazamiento += datos.length;
                });
                malla.thinInstanceSetBuffer("matrix", matrices, 16, true);
                malla.thinInstanceCount = longitud / 16;
                // Son solo tres mallas agrupadas por cubierta. Mantenerlas activas evita
                // que Babylon descarte todo el campo usando el límite de la malla fuente.
                malla.alwaysSelectAsActiveMesh = longitud > 0;
                malla.setEnabled(longitud > 0);
                malla.renderingGroupId = 0;
            });
        };

        // ✅ RESTAURADO: Actualizar impostores dinámicamente SOLO cuando cambia posición
        let ultimaCeldaImpostorX = null;
        let ultimaCeldaImpostorZ = null;
        let ultimosImpostoresGrupo0 = null;

        const actualizarImpostoresDinamicos = (cubierta, camaraX, camaraZ, superficie, alturaOrigen) => {
            const impostoresActivos = impostoresPorCubierta[cubierta];
            if (!impostoresActivos || impostoresActivos.length === 0) return;

            // ✅ OPTIMIZACIÓN: Solo recalcular si cambió de celda impostor
            const celdaImpostorX = Math.floor(camaraX / tamanoCeldaImpostor);
            const celdaImpostorZ = Math.floor(camaraZ / tamanoCeldaImpostor);

            if (ultimaCeldaImpostorX === celdaImpostorX && ultimaCeldaImpostorZ === celdaImpostorZ && ultimosImpostoresGrupo0 !== null) {
                return; // Sin cambio, sin recalcular
            }

            ultimaCeldaImpostorX = celdaImpostorX;
            ultimaCeldaImpostorZ = celdaImpostorZ;

            const fragmentos = impostoresActivos.map(() => []);
            const radioCeldas = Math.ceil(100 / tamanoCeldaImpostor);

            for (let dz = -radioCeldas; dz <= radioCeldas; dz++) {
                for (let dx = -radioCeldas; dx <= radioCeldas; dx++) {
                    const celdaX = celdaImpostorX + dx;
                    const celdaZ = celdaImpostorZ + dz;
                    const xCentro = (celdaX + 0.5) * tamanoCeldaImpostor;
                    const zCentro = (celdaZ + 0.5) * tamanoCeldaImpostor;

                    const dxDistancia = xCentro - camaraX;
                    const dzDistancia = zCentro - camaraZ;
                    const distancia2 = dxDistancia * dxDistancia + dzDistancia * dzDistancia;

                    // Rango 20-100m: obtener (NO generar) impostores del caché
                    if (distancia2 >= 400 && distancia2 <= 10000) {
                        const celda = cacheImpostores[cubierta].get(`${celdaX},${celdaZ}`);
                        if (celda) {  // Solo si existe
                            celda.matrices.forEach((datos, tipo) => {
                                if (datos.length) fragmentos[tipo].push(datos);
                            });
                        }
                    }
                }
            }

            // Actualizar thin instances de impostores
            impostoresActivos.forEach((malla, tipo) => {
                const longitud = fragmentos[tipo].reduce((total, datos) => total + datos.length, 0);
                const estadoBuffer = malla.__bufferMatrix || {};

                if (!estadoBuffer.datos || estadoBuffer.datos.length < longitud) {
                    let capacidad = Math.max(longitud * 1.5, 256);
                    estadoBuffer.datos = new Float32Array(Math.ceil(capacidad));
                    malla.__bufferMatrix = estadoBuffer;
                }

                let desplazamiento = 0;
                fragmentos[tipo].forEach(datos => {
                    estadoBuffer.datos.set(datos, desplazamiento);
                    desplazamiento += datos.length;
                });

                if (!estadoBuffer.inicializado) {
                    malla.thinInstanceSetBuffer("matrix", estadoBuffer.datos, 16, true);
                    estadoBuffer.inicializado = true;
                } else {
                    malla.thinInstanceBufferUpdated("matrix");
                }

                malla.thinInstanceCount = longitud / 16;
                malla.alwaysSelectAsActiveMesh = longitud > 0;
                malla.setEnabled(longitud > 0);
                malla.renderingGroupId = 0;  // Fondo
            });
        };


        const procesarPrecarga = async () => {
            if (!colaPrecarga.length) {
                precargaEnCurso = false;
                window.requestAnimationFrame(() => actualizarPraderaBromus?.(true));
                return;
            }
            const celda = colaPrecarga.shift();
            precargaPendiente.delete(celda.claveCola);
            const respuestaWorker = await pedirAlWorker("generar-celda", {
                celdaX: celda.celdaX,
                celdaZ: celda.celdaZ,
                tamanoCelda,
                divisiones,
                paso,
                alturaOrigen: celda.alturaOrigen,
                cubierta: celda.cubierta
            });
            generarCelda(
                celda.celdaX, celda.celdaZ, celda.cubierta, celda.superficie, celda.alturaOrigen,
                respuestaWorker?.resultado?.candidatos || null
            );
            celdasDesdeRefresco++;

            // ✅ FIX 1: Velocidad de precarga (AUMENTADA a 40 celdas/actualización)
            if (celdasDesdeRefresco >= 4 && celda.cubierta === ultimaCubierta) {
                celdasDesdeRefresco = 0;
                window.requestAnimationFrame(() => actualizarPraderaBromus?.(true));
            }

            const continuar = () => procesarPrecarga();

            // Una celda por turno: evita ráfagas largas y funciona igual en todos los navegadores.
            window.setTimeout(continuar, 0);
        };

        const programarPrecarga = (cubierta, superficie, alturaOrigen) => {
            const nuevas = [];
            recorrerCeldas(alcancePrecarga, (celdaX, celdaZ) => {
                const claveCelda = `${celdaX},${celdaZ}`;
                const claveCola = `${cubierta}:${claveCelda}`;
                if (!cache[cubierta].has(claveCelda) && !precargaPendiente.has(claveCola)) {
                    precargaPendiente.add(claveCola);
                    nuevas.push({ cubierta, superficie, alturaOrigen, celdaX, celdaZ, claveCola });
                }
            });
            nuevas.sort((a, b) => {
                const distanciaA = ((a.celdaX + 0.5) * tamanoCelda - camera.position.x) ** 2 +
                    ((a.celdaZ + 0.5) * tamanoCelda - camera.position.z) ** 2;
                const distanciaB = ((b.celdaX + 0.5) * tamanoCelda - camera.position.x) ** 2 +
                    ((b.celdaZ + 0.5) * tamanoCelda - camera.position.z) ** 2;
                return distanciaA - distanciaB;
            });
            colaPrecarga.unshift(...nuevas);
            if (!precargaEnCurso && colaPrecarga.length) {
                precargaEnCurso = true;
                procesarPrecarga();
            }
        };

        const activarC4 = () => {
            c4Activada = true;
            programarPrecarga("c4", sueloC4, 36);
        };

        actualizarPraderaBromus = (forzar = false) => {
            if (!c4Activada && camera.position.y > umbralActivacionC4) {
                activarC4();
            }
            const cubierta = camera.position.y > 18 ? "c4" : "c2";
            const celdaCamaraX = Math.floor(camera.position.x / tamanoCelda);
            const celdaCamaraZ = Math.floor(camera.position.z / tamanoCelda);
            if (!forzar && cubierta === ultimaCubierta &&
                celdaCamaraX === ultimaCeldaX && celdaCamaraZ === ultimaCeldaZ) return;
            const superficie = cubierta === "c2" ? sueloC2 : sueloC4;
            const alturaOrigen = cubierta === "c2" ? 10 : 36;
            // ✅ ARREGLADO: Renderiza lo que TIENE en caché, no espera a que esté completo
            // Siempre precarga para anticipar, pero no bloquea el renderizado
            ultimaCeldaX = celdaCamaraX;
            ultimaCeldaZ = celdaCamaraZ;
            ultimaCubierta = cubierta;
            fragmentosPorGrupo.forEach(nivelesEspecie => nivelesEspecie.forEach(variantes =>
                variantes.forEach(fragmentos => { fragmentos.length = 0; })
            ));
            const camaraX = camera.position.x;
            const camaraZ = camera.position.z;
            const recuentos = [0, 0];

            // ✅ LOD FUNCIONAL: Renderiza plantas dentro del alcance (100m)
            recorrerCeldas(alcance, (celdaX, celdaZ) => {
                const celda = cache[cubierta].get(`${celdaX},${celdaZ}`);
                if (!celda) return;
                const dx = (celdaX + 0.5) * tamanoCelda - camaraX;
                const dz = (celdaZ + 0.5) * tamanoCelda - camaraZ;
                const distancia2 = dx * dx + dz * dz;

                // Sistema LOD: divide en 2 niveles
                const nivel = distancia2 < 16 ? 0 : distancia2 < alcance * alcance ? 1 : -1;
                if (nivel < 0) return;
                celda.matrices.forEach((variantes, indiceEspecie) => variantes.forEach((datos, indiceVariante) => {
                    if (!datos.length) return;
                    fragmentosPorGrupo[indiceEspecie][nivel][indiceVariante].push(datos);
                    recuentos[nivel] += datos.length / 16;
                }));
            });

            modelos.forEach((modelo, indiceEspecie) => modelo.fuentes.forEach((variantes, indiceNivel) =>
                variantes.forEach((malla, indiceVariante) => {
                    const fragmentos = fragmentosPorGrupo[indiceEspecie][indiceNivel][indiceVariante];
                    const longitud = fragmentos.reduce((total, datos) => total + datos.length, 0);
                    const estadoBuffer = buffersPorGrupo[indiceEspecie][indiceNivel][indiceVariante];
                    if (longitud > estadoBuffer.datos.length) {
                        let capacidad = estadoBuffer.datos.length;
                        while (capacidad < longitud) capacidad *= 2;
                        estadoBuffer.datos = new Float32Array(capacidad);
                        estadoBuffer.inicializado = false;
                    }
                    let desplazamiento = 0;
                    fragmentos.forEach(fragmento => {
                        estadoBuffer.datos.set(fragmento, desplazamiento);
                        desplazamiento += fragmento.length;
                    });
                    // Las thin instances usan la transformación de la malla fuente como base.
                    malla.position.set(0, 0, 0);
                    malla.scaling.setAll(1);
                    malla.rotationQuaternion = null;
                    malla.rotation.set(0, 0, 0);
                    if (!estadoBuffer.inicializado) {
                        // ✅ CORREGIDO: Buffer UPDATABLE para cambios dinámicos
                        malla.thinInstanceSetBuffer("matrix", estadoBuffer.datos, 16, true);
                        estadoBuffer.inicializado = true;
                    } else {
                        malla.thinInstanceBufferUpdated("matrix");
                    }
                    malla.thinInstanceCount = longitud / 16;
                    malla.alwaysSelectAsActiveMesh = longitud > 0;
                    malla.setEnabled(longitud > 0);
                    // Hierba, árboles y terreno comparten profundidad; nunca se fuerza
                    // la vegetación por encima de los objetos opacos o recortados.
                    malla.renderingGroupId = 0;
                })
            ));

            programarPrecarga(cubierta, superficie, alturaOrigen);
            if (forzar) console.log(`Pradera thin instances por LOD: ${JSON.stringify(recuentos)}`);
        };

        // Solo C2 se calcula al inicio y se reparte entre fotogramas para no bloquear la interfaz.
        actualizarCarga(84, "GENERANDO C2…");
        await precalentarPorLotes("c2", sueloC2, 10, progreso =>
            actualizarCarga(84 + progreso * 6, "GENERANDO C2…")
        );
        actualizarCarga(90, "PREPARANDO FONDO…");
        await precalentarImpostoresPorLotes("c2", sueloC2, 10, progreso =>
            actualizarCarga(90 + progreso * 2.5, "PREPARANDO FONDO C2…")
        );
        construirCapaImpostores("c2");
        await precalentarImpostoresPorLotes("c4", sueloC4, 36, progreso =>
            actualizarCarga(92.5 + progreso * 2.5, "PREPARANDO FONDO C4…")
        );
        construirCapaImpostores("c4");
        actualizarPraderaBromus(true);
        // Calienta las primeras actualizaciones de buffers mientras la portada sigue visible.
        const xPrecarga = camera.position.x;
        camera.position.x += tamanoCelda;
        actualizarPraderaBromus(true);
        camera.position.x = xPrecarga;
        actualizarPraderaBromus(true);
        console.log("Pradera híbrida: base ligera fija y geometría detallada hasta 18 m.");
        console.log("✅ ESTADÍSTICAS:");
        console.log("   - Caché C2 celdas:", cache.c2.size);
        console.log("   - Caché impostores C2:", cacheImpostores.c2.size);
        console.log("   - Divisiones por celda:", divisiones, "×", divisiones, "=", divisiones * divisiones);
        console.log("   - Divisiones impostores:", divisionesImpostor, "×", divisionesImpostor, "=", divisionesImpostor * divisionesImpostor);
    }

    async function crearPraderaMundoAbierto(sueloC2, sueloC4, zonasExcluidas) {
        if (!sueloC2 || !sueloC4) throw new Error("No se han encontrado las superficies de la pradera.");
        const ruta = "assets/img/granja/";
        const tamanoCelda = 8;
        const configuracionLOD = [
            { nombre: "near", tarjetas: 96, radio: 0.82, ancho: 0.29, alto: 0.64 },
            { nombre: "mid", tarjetas: 18, radio: 0.94, ancho: 0.40, alto: 0.54 },
            { nombre: "far", tarjetas: 8, radio: 1.06, ancho: 0.58, alto: 0.42 }
        ];
        const tipos = [
            { archivo: "hierba-fina-alpha-v1.webp", color: new BABYLON.Color3(0.72, 0.78, 0.40) },
            { archivo: "hierba-ancha-alpha-v1.webp", color: new BABYLON.Color3(0.62, 0.72, 0.36) },
            { archivo: "hierba-seca-alpha-v1.webp", color: new BABYLON.Color3(0.82, 0.72, 0.38) }
        ];

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

        actualizarCarga(77, "CARGANDO MAPA DE HIERBA…");
        const respuesta = await fetch("assets/img/granja/granja-hierba-celdas-v1.bin");
        if (!respuesta.ok) throw new Error(`No se ha podido cargar el mapa de hierba (${respuesta.status}).`);
        const binario = await respuesta.arrayBuffer();
        const vista = new DataView(binario);
        if (String.fromCharCode(...new Uint8Array(binario, 0, 4)) !== "ALGC" || vista.getUint32(4, true) !== 1) {
            throw new Error("El mapa de hierba no es válido.");
        }
        const cantidad = vista.getUint32(8, true);
        const celdas = new Map();
        const permitida = (x, z, cubierta) =>
            dentroDelContorno(x, z) && distanciaAlContorno(x, z) >= 3.5 &&
            !zonasExcluidas.some(zona => zona.cubierta === cubierta &&
                distanciaASegmento(x, z, zona.segmento) < zona.radio);
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
                    celda = { cubierta, celdaX, celdaZ, matrices: tipos.map(() => []) };
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
            if (indice % 5000 === 4999) {
                actualizarCarga(77 + (indice / cantidad) * 15, "ORGANIZANDO CELDAS…");
                await new Promise(resolver => window.requestAnimationFrame(resolver));
            }
        }
        celdas.forEach(celda => {
            celda.matrices = celda.matrices.map(datos => new Float32Array(datos));
        });

        const estadosBuffer = maestros.map(nivel => nivel.map(() => ({
            datos: new Float32Array(16 * 2048), inicializado: false
        })));
        const limitar01 = valor => Math.max(0, Math.min(1, valor));
        const pasoSuave = (inicio, final, valor) => {
            const t = limitar01((valor - inicio) / (final - inicio));
            return t * t * (3 - 2 * t);
        };
        const factorLOD = (nivel, distancia) => {
            if (nivel === 0) return 1 - pasoSuave(18, 27, distancia);
            if (nivel === 1) return pasoSuave(15, 24, distancia) * (1 - pasoSuave(45, 57, distancia));
            return pasoSuave(42, 54, distancia) * (1 - pasoSuave(78, 97.5, distancia));
        };
        const actualizarBuffer = (malla, estado, fragmentos, nivel) => {
            const capacidadNecesaria = fragmentos.reduce((total, datos) => total + datos.length, 0);
            if (capacidadNecesaria > estado.datos.length) {
                let capacidad = estado.datos.length;
                while (capacidad < capacidadNecesaria) capacidad *= 2;
                estado.datos = new Float32Array(capacidad);
                estado.inicializado = false;
            }
            let desplazamiento = 0;
            fragmentos.forEach(datos => {
                for (let origen = 0; origen < datos.length; origen += 16) {
                    const dx = datos[origen + 12] - camera.position.x;
                    const dz = datos[origen + 14] - camera.position.z;
                    const factor = factorLOD(nivel, Math.hypot(dx, dz));
                    if (factor <= 0.002) continue;
                    for (let componente = 0; componente < 16; componente++) {
                        estado.datos[desplazamiento + componente] = datos[origen + componente];
                    }
                    // Se conserva la posición y se reduce progresivamente la mata desde su base.
                    estado.datos[desplazamiento] *= factor;
                    estado.datos[desplazamiento + 1] *= factor;
                    estado.datos[desplazamiento + 2] *= factor;
                    estado.datos[desplazamiento + 4] *= factor;
                    estado.datos[desplazamiento + 5] *= factor;
                    estado.datos[desplazamiento + 6] *= factor;
                    estado.datos[desplazamiento + 8] *= factor;
                    estado.datos[desplazamiento + 9] *= factor;
                    estado.datos[desplazamiento + 10] *= factor;
                    desplazamiento += 16;
                }
            });
            if (!estado.inicializado) {
                malla.thinInstanceSetBuffer("matrix", estado.datos, 16, false);
                estado.inicializado = true;
            } else {
                malla.thinInstanceBufferUpdated("matrix");
            }
            malla.thinInstanceCount = desplazamiento / 16;
            malla.setEnabled(desplazamiento > 0);
        };

        let ultimaPosicion = new BABYLON.Vector3(Number.POSITIVE_INFINITY, 0, Number.POSITIVE_INFINITY);
        let ultimaCubierta = "";
        const actualizar = (forzar = false) => {
            const cubierta = camera.position.y > 18 ? "c4" : "c2";
            if (!forzar && cubierta === ultimaCubierta &&
                BABYLON.Vector3.DistanceSquared(camera.position, ultimaPosicion) < 0.1225) return;
            ultimaPosicion.copyFrom(camera.position);
            ultimaCubierta = cubierta;
            const fragmentos = configuracionLOD.map(() => tipos.map(() => []));
            celdas.forEach(celda => {
                if (celda.cubierta !== cubierta) return;
                const centroX = (celda.celdaX + 0.5) * tamanoCelda;
                const centroZ = (celda.celdaZ + 0.5) * tamanoCelda;
                const distancia = Math.hypot(centroX - camera.position.x, centroZ - camera.position.z);
                const margenCelda = tamanoCelda * Math.SQRT1_2;
                const niveles = [];
                if (distancia <= 27 + margenCelda) niveles.push(0);
                if (distancia >= 15 - margenCelda && distancia <= 57 + margenCelda) niveles.push(1);
                if (distancia >= 42 - margenCelda && distancia <= 97.5 + margenCelda) niveles.push(2);
                niveles.forEach(nivel => celda.matrices.forEach((datos, tipo) => {
                    if (datos.length) fragmentos[nivel][tipo].push(datos);
                }));
            });
            maestros.forEach((nivel, indiceLOD) => nivel.forEach((malla, indiceTipo) =>
                actualizarBuffer(
                    malla,
                    estadosBuffer[indiceLOD][indiceTipo],
                    fragmentos[indiceLOD][indiceTipo],
                    indiceLOD
                )
            ));
        };
        actualizarPraderaBromus = actualizar;
        actualizar(true);
        actualizarCarga(95, "PRADERA PREPARADA…");
        console.log(`Pradera mundo abierto: ${cantidad} grupos, ${celdas.size} celdas precalculadas.`);
    }

    BABYLON.SceneLoader.ImportMeshAsync(
        "", "assets/img/granja/", "granja-pradera-pbr-v40-puertas-centradas-farolas-completas.glb", scene,
        evento => {
            const fraccion = evento.lengthComputable && evento.total ? evento.loaded / evento.total : 0;
            actualizarCarga(4 + fraccion * 26, "CARGANDO TERRENO…");
        }
    )
        .then(async ({ meshes }) => {
            actualizarCarga(32, "PREPARANDO PAISAJE…");
            const visibles = meshes.filter(mesh => mesh.getTotalVertices && mesh.getTotalVertices() > 0);

            visibles.forEach(mesh => {
                mesh.checkCollisions = false;
                if (/SUPERFICIE_HAIR_/i.test(mesh.name)) {
                    mesh.isVisible = false;
                    mesh.visibility = 0;
                    mesh.isPickable = false;
                    return;
                }
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

            if (window.innerWidth >= 1100 && BABYLON.SSAO2RenderingPipeline) {
                const oclusion = new BABYLON.SSAO2RenderingPipeline("oclusion-ambiental", scene, {
                    ssaoRatio: 0.65,
                    blurRatio: 0.5
                });
                oclusion.radius = 1.35;
                oclusion.totalStrength = 0.72;
                oclusion.expensiveBlur = false;
                scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("oclusion-ambiental", camera);
            }


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

    scene.onBeforeRenderObservable.add(() => {
        fps.textContent = `${Math.round(engine.getFps())} FPS`;
        cubierta.textContent = camera.position.y > 18 ? "CUBIERTA C4" : "CUBIERTA C2";

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
                const tramoMovimiento = destino.subtract(camera.position);
                const choqueFrontal = tramoMovimiento.lengthSquared() > 0 && scene.pickWithRay(
                    new BABYLON.Ray(camera.position, tramoMovimiento.normalize(), tramoMovimiento.length() + 0.55),
                    mesh => obstaculosSolidos.has(mesh)
                ).hit;
                const sobreTalud = scene.pickWithRay(
                    new BABYLON.Ray(destino.add(new BABYLON.Vector3(0, 4, 0)), BABYLON.Vector3.Down(), 8),
                    mesh => /talud_rampa/i.test(mesh.name)
                ).hit;
                if (!bloqueadoPorPared && !bloqueadoPorBarandilla && !bloqueadoPorMuroHueco &&
                    !bloqueadoPorAnimal && !choqueFrontal && !sobreTalud) {
                    camera.position.x = destino.x;
                    camera.position.z = destino.z;
                }
            }

            actualizarPraderaBromus?.();
            actualizarManzanos?.();
            actualizarMandarinos?.();
            actualizarAgapantos?.();
            actualizarOlmo?.();
            actualizarVacas?.();

            const delta = Math.min(engine.getDeltaTime() / 1000, 0.05);
            const origenRayo = new BABYLON.Vector3(camera.position.x, camera.position.y + 0.6, camera.position.z);
            const rayoSuelo = new BABYLON.Ray(origenRayo, BABYLON.Vector3.Down(), 3.1);
            const apoyo = scene.pickWithRay(rayoSuelo, mesh => superficiesTransitables.has(mesh));

            const alturaApoyo = apoyo?.hit && apoyo.pickedPoint ? apoyo.pickedPoint.y + 1.72 : null;
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
