// ============================================================================
// WEB WORKER: Generador de Celdas para Pradera
// ============================================================================
// Este worker genera celdas de forma asíncrona sin bloquear el render thread
// Ejecuta raycasts y cálculos intensivos en background

let escena = null;
const pisos = {};
const contorno = [];
const dentroDelContorno = (x, z) => {
    let dentro = false;
    for (let i = 0, j = contorno.length - 1; i < contorno.length; j = i++) {
        const [xi, zi] = contorno[i];
        const [xj, zj] = contorno[j];
        const cruza = (zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi;
        if (cruza) dentro = !dentro;
    }
    return dentro;
};

const distanciaASegmento = (x, z, segmento) => {
    const [[ax, az], [bx, bz]] = segmento;
    const dx = bx - ax;
    const dz = bz - az;
    const longitud2 = dx * dx + dz * dz;
    if (longitud2 === 0) return Math.hypot(x - ax, z - az);
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / longitud2));
    return Math.hypot(x - (ax + t * dx), z - (az + t * dz));
};

const distanciaAlContorno = (x, z) => {
    let distancia = Infinity;
    for (let i = 0; i < contorno.length; i++) {
        const siguiente = (i + 1) % contorno.length;
        distancia = Math.min(
            distancia,
            distanciaASegmento(x, z, [contorno[i], contorno[siguiente]])
        );
    }
    return distancia;
};

// Receptor de mensajes del thread principal
self.onmessage = evento => {
    const { tipo, datos, solicitudId } = evento.data;

    if (tipo === "inicializar") {
        // Configurar datos de escena
        Object.assign(pisos, datos.pisos);
        contorno.length = 0;
        contorno.push(...datos.contorno);
        console.log("[Worker] Inicializado. Contorno:", contorno.length, "puntos");
    }

    else if (tipo === "generar-celda") {
        // Generar una celda individual
        const { celdaX, celdaZ, tamanoCelda, divisiones, paso, alturaOrigen, superficie, cubierta } = datos;

        try {
            const resultado = generarCeldaBackground(
                celdaX, celdaZ, tamanoCelda, divisiones, paso,
                alturaOrigen, superficie, cubierta
            );

            self.postMessage({
                tipo: "celda-generada",
                solicitudId,
                clave: `${celdaX},${celdaZ}`,
                cubierta,
                resultado,
                exito: true
            });
        } catch (error) {
            console.error("[Worker] Error generando celda:", error);
            self.postMessage({
                tipo: "celda-generada",
                solicitudId,
                clave: `${celdaX},${celdaZ}`,
                cubierta,
                error: error.message,
                exito: false
            });
        }
    }

    else if (tipo === "generar-lote") {
        // Generar múltiples celdas (más eficiente)
        const { celdas, tamanoCelda, divisiones, paso, alturaOrigen, superficie, cubierta } = datos;
        const resultados = [];

        for (const { celdaX, celdaZ } of celdas) {
            try {
                const resultado = generarCeldaBackground(
                    celdaX, celdaZ, tamanoCelda, divisiones, paso,
                    alturaOrigen, superficie, cubierta
                );
                resultados.push({
                    clave: `${celdaX},${celdaZ}`,
                    resultado,
                    exito: true
                });
            } catch (error) {
                resultados.push({
                    clave: `${celdaX},${celdaZ}`,
                    error: error.message,
                    exito: false
                });
            }
        }

        self.postMessage({
            tipo: "lote-generado",
            solicitudId,
            cubierta,
            resultados
        });
    }
};

// ============================================================================
// Generador de celdas (versión simplificada sin raycasts)
// ============================================================================
const generarCeldaBackground = (celdaX, celdaZ, tamanoCelda, divisiones, paso,
                                alturaOrigen, superficie, cubierta) => {
    let semilla = (
        Math.imul(celdaX, 73856093) ^ Math.imul(celdaZ, 19349663) ^
        (cubierta === "c2" ? 0x2c2001 : 0x2c4001)
    ) >>> 0;

    const aleatorio = () => {
        semilla = (semilla * 1664525 + 1013904223) >>> 0;
        return semilla / 4294967296;
    };

    const candidatos = [];
    let cantidad = 0;

    // Fase 1: Generar candidatos (sin raycasts)
    for (let fila = 0; fila < divisiones; fila++) {
        for (let columna = 0; columna < divisiones; columna++) {
            const x = celdaX * tamanoCelda + (columna + aleatorio()) * paso;
            const z = celdaZ * tamanoCelda + (fila + aleatorio()) * paso;

            // Filtros básicos (sin raycasts caros)
            if (!dentroDelContorno(x, z) || distanciaAlContorno(x, z) < 3.5) continue;

            candidatos.push({ x, z, aleatorio: aleatorio() });
            cantidad++;
        }
    }

    // Retornar candidatos para que el thread principal haga raycasts
    return {
        candidatos,
        cantidad,
        semilla: semilla >>> 0,
        fase: "candidatos"
    };
};

console.log("[Worker] Pradera worker inicializado y listo.");
