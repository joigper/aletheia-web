(() => {
    const canvas = document.querySelector("#granjaCanvas");
    const portada = document.querySelector("#granjaPortada");
    const entrar = document.querySelector("#granjaEntrar");
    const hud = document.querySelector("#granjaHud");
    const fps = document.querySelector("#granjaFps");
    const cubierta = document.querySelector("#granjaCubierta");
    const error = document.querySelector("#granjaError");

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

    const camera = new BABYLON.UniversalCamera("visitante", new BABYLON.Vector3(0, 1.72, 0), scene);
    camera.rotation.y = 0.72;
    camera.minZ = 0.08;
    camera.speed = 0.24;
    camera.angularSensibility = 4800;
    camera.inertia = 0.12;
    camera.applyGravity = false;
    camera.checkCollisions = false;
    camera.ellipsoid = new BABYLON.Vector3(0.42, 0.86, 0.42);
    camera.ellipsoidOffset = new BABYLON.Vector3(0, -0.86, 0);
    camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
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
    // Inicio junto al pie de la rampa para comprobarla inmediatamente.
    let inicio = new BABYLON.Vector3(43.5, 1.72, 49.5);
    let visitaActiva = false;
    let velocidadVertical = 0;
    let actualizarHierbaProxima = null;
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

        const rampa = new BABYLON.PBRMaterial("material-rampa", scene);
        rampa.albedoTexture = textura("camino-albedo-v1.webp", 12, 4);
        rampa.bumpTexture = textura("camino-normal-v1.webp", 12, 4);
        rampa.albedoColor = new BABYLON.Color3(0.72, 0.68, 0.60);
        rampa.emissiveColor = new BABYLON.Color3(0.10, 0.075, 0.045);
        rampa.roughness = 0.94;

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
            else if (/GRANJA_Paredes/i.test(nombre)) {
                uvVertical(mesh, 8);
                mesh.material = pared;
            }
            else if (/GRANJA_Rampa$/i.test(nombre)) {
                uvHorizontal(mesh, false, 5);
                mesh.material = rampa;
            }
            else if (/GRANJA_(?:Lateral_Rampa|Fondo_Hueco_Rampa)/i.test(nombre)) {
                uvVertical(mesh, 4);
                mesh.material = laterales;
            }
            if (/GRANJA_(?:Paredes|Rampa|Lateral_Rampa|Fondo_Hueco_Rampa)/i.test(nombre)) {
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

    function crearCamino(nombre, puntos2d, anchura, superficie, alturaOrigen, material, cerrado = false) {
        const centros = densificarLineal(puntos2d, cerrado, 6)
            .map(([x, z]) => {
                const y = alturaSobre(superficie, x, z, alturaOrigen);
                return y === null ? null : new BABYLON.Vector3(x, y + 0.045, z);
            })
            .filter(Boolean);
        if (centros.length < 2) return;

        const izquierda = [];
        const derecha = [];
        for (let i = 0; i < centros.length; i++) {
            const anterior = centros[(i - 1 + centros.length) % centros.length];
            const siguiente = centros[(i + 1) % centros.length];
            const a = !cerrado && i === 0 ? centros[i] : anterior;
            const b = !cerrado && i === centros.length - 1 ? centros[i] : siguiente;
            const dx = b.x - a.x;
            const dz = b.z - a.z;
            const longitud = Math.hypot(dx, dz) || 1;
            const nx = -dz / longitud * anchura / 2;
            const nz = dx / longitud * anchura / 2;
            izquierda.push(new BABYLON.Vector3(centros[i].x + nx, centros[i].y, centros[i].z + nz));
            derecha.push(new BABYLON.Vector3(centros[i].x - nx, centros[i].y, centros[i].z - nz));
        }
        const camino = BABYLON.MeshBuilder.CreateRibbon(nombre, {
            pathArray: [izquierda, derecha],
            closePath: cerrado,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE,
            updatable: false
        }, scene);
        camino.material = material;
        camino.isPickable = true;
        superficiesTransitables.add(camino);
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
        const sueloC4 = superficies.find(mesh => /suelo_cubierta_3/i.test(mesh.name));
        if (!sueloC2 || !sueloC4) return;

        const ruta = "assets/img/granja/";
        const crearMapa = (archivo, escala) => {
            const mapa = new BABYLON.Texture(`${ruta}${archivo}`, scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
            mapa.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
            mapa.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
            mapa.uScale = escala;
            mapa.vScale = escala;
            return mapa;
        };
        const pradera = new BABYLON.PBRMaterial("pradera-pbr-final", scene);
        pradera.albedoTexture = crearMapa("pradera-albedo-v1.webp", 34);
        pradera.bumpTexture = crearMapa("pradera-normal-v1.webp", 34);
        pradera.albedoColor = new BABYLON.Color3(0.72, 0.78, 0.67);
        pradera.roughness = 0.98;
        pradera.metallic = 0;
        sueloC2.material = pradera;
        sueloC4.material = pradera.clone("pradera-pbr-final-c4");

        const crearTaludRampa = () => {
            const inicioRampa = new BABYLON.Vector3(43.5, alturaSobre(sueloC2, 43.5, 49.5, 10) ?? 0, 49.5);
            const finalRampa = new BABYLON.Vector3(94.6, alturaSobre(sueloC4, 94.6, 102.7, 36) ?? 25, 102.7);
            const direccion = finalRampa.subtract(inicioRampa);
            const longitud = Math.hypot(direccion.x, direccion.z) || 1;
            const lateral = new BABYLON.Vector3(-direccion.z / longitud, 0, direccion.x / longitud);
            const crearLado = (signo, nombre) => {
                const posiciones = [];
                const indices = [];
                const uvs = [];
                const normales = [];
                const tramos = 28;
                const franjas = 5;
                for (let i = 0; i <= tramos; i++) {
                    const t = i / tramos;
                    const centro = BABYLON.Vector3.Lerp(inicioRampa, finalRampa, t);
                    for (let j = 0; j < franjas; j++) {
                        const s = j / (franjas - 1);
                        const distancia = 7.2 + s * 11.5;
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
                        uvs.push(t * 8, s * 2.4);
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

        };
        crearTaludRampa();

        const tierra = new BABYLON.PBRMaterial("tierra-caminos-pbr", scene);
        tierra.albedoTexture = crearMapa("camino-albedo-v1.webp", 4.5);
        tierra.bumpTexture = crearMapa("camino-normal-v1.webp", 4.5);
        tierra.albedoColor = new BABYLON.Color3(0.76, 0.69, 0.59);
        tierra.roughness = 1;
        tierra.metallic = 0;

        const centro = contorno.reduce((acumulado, punto) => [
            acumulado[0] + punto[0] / contorno.length,
            acumulado[1] + punto[1] / contorno.length
        ], [0, 0]);
        const anillo = contorno.map(([x, z]) => {
            const dx = centro[0] - x;
            const dz = centro[1] - z;
            const longitud = Math.hypot(dx, dz) || 1;
            return [x + dx / longitud * 8.5, z + dz / longitud * 8.5];
        });

        crearCamino("camino-perimetral-c2", anillo, 4.8, sueloC2, 10, tierra, true);
        const accesosC2 = [];
        for (let i = 0; i < contorno.length; i++) {
            const siguiente = (i + 1) % contorno.length;
            const puerta = [
                (contorno[i][0] + contorno[siguiente][0]) / 2,
                (contorno[i][1] + contorno[siguiente][1]) / 2
            ];
            const acceso = [
                (anillo[i][0] + anillo[siguiente][0]) / 2,
                (anillo[i][1] + anillo[siguiente][1]) / 2
            ];
            const tramoAcceso = [puerta, acceso];
            accesosC2.push(tramoAcceso);
            crearCamino(`acceso-c2-${i + 1}`, tramoAcceso, 3.8, sueloC2, 10, tierra);
        }

        const caminoC2 = [
            [70, -40], [48, -20], [20, -5], [-5, 15], [-32, 28], [-59, 34]
        ];
        crearCamino("camino-central-c2", caminoC2, 5.4, sueloC2, 10, tierra);

        const caminoC4 = [
            [-58, -205], [-45, -145], [-30, -70], [-8, 5], [14, 78], [48, 155]
        ];
        crearCamino("camino-central-c4", caminoC4, 5.0, sueloC4, 36, tierra);

        const zonasExcluidas = [];
        const registrarTramos = (puntos, radio, cerrado = false) => {
            const limite = cerrado ? puntos.length : puntos.length - 1;
            for (let i = 0; i < limite; i++) {
                zonasExcluidas.push({ segmento: [puntos[i], puntos[(i + 1) % puntos.length]], radio });
            }
        };
        registrarTramos(anillo, 4.2, true);
        accesosC2.forEach(acceso => registrarTramos(acceso, 3.6));
        registrarTramos(caminoC2, 4.4);
        registrarTramos(caminoC4, 4.2);
        crearHierbaProxima({ c2: sueloC2, c4: sueloC4 }, zonasExcluidas);
    }

    BABYLON.SceneLoader.ImportMeshAsync("", "assets/img/granja/", "granja-pradera-pbr-v4.glb", scene)
        .then(({ meshes }) => {
            const visibles = meshes.filter(mesh => mesh.getTotalVertices && mesh.getTotalVertices() > 0);

            visibles.forEach(mesh => {
                mesh.checkCollisions = false;
                if (/suelo|granja_rampa|cubo\.025/i.test(mesh.name)) {
                    mesh.isPickable = true;
                    superficiesTransitables.add(mesh);
                }
            });

            vestirArquitectura(visibles);
            construirPaisaje(visibles);

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

            entrar.disabled = false;
            entrar.textContent = "ENTRAR EN GRANJA";
        })
        .catch(fallo => {
            console.error(fallo);
            error.hidden = false;
            error.textContent = `No se ha podido cargar la maqueta: ${fallo.message || fallo}`;
            entrar.textContent = "ERROR DE CARGA";
        });

    entrar.addEventListener("click", () => {
        portada.hidden = true;
        hud.hidden = false;
        visitaActiva = true;
        camera.attachControl(canvas, true);
        canvas.requestPointerLock?.();
    });

    canvas.addEventListener("click", () => {
        if (visitaActiva && document.pointerLockElement !== canvas) canvas.requestPointerLock?.();
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

            if (movimiento.lengthSquared() > 0) {
                const paso = 3.2 * engine.getDeltaTime() / 1000;
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
                if (!bloqueadoPorPared && !bloqueadoPorBarandilla && !bloqueadoPorMuroHueco) {
                    camera.position.x = destino.x;
                    camera.position.z = destino.z;
                }
            }

            actualizarHierbaProxima?.();

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
