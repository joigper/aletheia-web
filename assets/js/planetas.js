document.addEventListener('DOMContentLoaded', () => {
  const archivo = document.querySelector('#archivo-planetas');
  if (!archivo) return;

  // Los registros provisionales conservan la interfaz completa sin fijar datos del canon.
  const grupos = [
    {
      novela: 'ALÉTHEIA I',
      color: '#d9d0d0',
      planetas: [
        {
          id: 'thalara',
          nombre: 'THALARA',
          subtitulo: 'Biosfera compleja',
          clasificacion: 'Mundo terrestre con vida compleja',
          codigo: 'TAU CETI · OBS-THA-01',
          estado: 'EXPLORACIÓN TRIPULADA · BASE THALARA-1',
          apariciones: 'Primera aparición: ALÉTHEIA I',
          primeraAparicion: 'ALÉTHEIA I · CAPÍTULO 11 · «EL SEGUNDO DESPERTAR»',
          ordenAparicion: 11,
          descripcion: 'Mundo menor que la Tierra, cálido y seco, cuyos dos océanos polares contrastan con una extensa franja continental de lagos, montañas y grandes cuencas de impacto. Los cráteres habitables alcanzan los 40 °C, mientras que en los desiertos centrales se han medido máximas de hasta 80 °C. Su rotación prolonga el día hasta las veintinueve horas. Una única luna, sensiblemente menor que la terrestre, orbita el planeta y ejerce una influencia muy reducida sobre las mareas. Una bruma ligera cubre sus continentes y las nubes avanzan lentamente sobre un ecosistema activo y complejo. En los océanos se desplazan enormes criaturas; en tierra, los sensores han registrado organismos de morfología inquietantemente próxima a ciertos mamíferos.',
          superficie: 'url("assets/img/observatorio/thalara-mapa-final.webp")',
          usaTextura: true,
          usaAtmosfera: true,
          atmosfera: 'url("assets/img/observatorio/thalara-atmosfera.webp")',
          mezclaAtmosfera: 'normal',
          opacidadAtmosfera: '1',
          velocidadAtmosfera: '96s',
          datos: [
  ['SISTEMA', 'TAU CETI'],
  ['TIPO', 'TERRESTRE BIÓTICO'],
  ['GRAVEDAD', '0,75 g'],
  ['DURACIÓN DEL DÍA', '29 HORAS'],
  ['CLIMA', 'CÁLIDO Y SECO'],
  ['HIDROSFERA', '2 OCÉANOS POLARES'],
  ['MÁXIMA EN CRÁTERES', '40 °C'],
  ['MÍNIMA NOCTURNA', '20 °C · CRÁTERES'],
  ['MÁXIMA REGISTRADA', '80 °C · DESIERTO CENTRAL'],
  ['SATÉLITES', '1 · LUNA MENOR'],
  ['INFLUENCIA MAREAL', 'MUY REDUCIDA'],
  ['BIOSFERA', 'COMPLEJA']
            ]
        },
        {
          id: 'tau-ceti-t-iii',
          nombre: 'TAU CETI T-III',
          subtitulo: 'Gigante de hielo',
          clasificacion: 'Gigante de hielo anillado',
          codigo: 'TAU CETI · OBS-TIII-01',
          estado: 'OBSERVACIÓN REMOTA · NO EXPLORADO',
          apariciones: 'Primera aparición: ALÉTHEIA I',
          primeraAparicion: 'ALÉTHEIA I · CAPÍTULO 28 · «LOS CONSTRUCTORES»',
          ordenAparicion: 28,
          descripcion: 'Gigante de hielo situado en una órbita ligeramente interior a la de Thalara. Su gran diámetro, su sistema tenue de anillos y un periodo orbital muy próximo al thalarano permiten que, durante alineamientos excepcionales, permanezca interpuesto entre Tau Ceti y Thalara durante treinta y cinco días y cinco horas. El fenómeno reduce de forma sostenida la radiación recibida y provoca un descenso térmico estimado de dieciocho grados en el cráter de Base THALARA-1. T-III no ha recibido ninguna misión de superficie y permanece clasificado como objetivo de observación remota.',
          superficie: 'url("assets/img/observatorio/tau-ceti-t-iii-mapa.webp")',
          usaTextura: true,
          anillado: true,
          archivos: [
            {
              id: 'eclipse',
              etiqueta: 'ECLIPSE',
              titulo: 'Eclipse prolongado de Thalara',
              referencia: 'ALÉTHEIA I · CAPÍTULO 28 · «LOS CONSTRUCTORES»',
              tipoRegistro: 'REGISTRO NARRATIVO · MODELO ORBITAL',
              notaCanon: 'La novela establece una duración total de treinta y cinco días y cinco horas, además de la posición interior y el mayor tamaño de T-III. La resonancia casi 1:1 y la contribución de los anillos forman parte del modelo orbital desarrollado para el archivo.',
              parrafos: [
                'Treinta y un días antes del fenómeno, Base THALARA-1 recibió el aviso de que T-III quedaría alineado entre Tau Ceti y Thalara. El evento tendría una duración total de treinta y cinco días y cinco horas, con oscuridad total durante su fase máxima.',
                'La ocultación sería principalmente parcial y progresiva. El gran diámetro aparente de T-III y el material de sus anillos reducirían de forma sostenida la radiación estelar, con una bajada térmica estimada de dieciocho grados en el cráter ocupado por la base.',
                'La escasa diferencia entre ambos periodos orbitales y la inclinación relativa de sus planos hacen que estos eclipses prolongados sean acontecimientos excepcionales, separados por largos intervalos.'
              ],
              imagenes: [
                {
                  src: 'assets/img/observatorio/tau-ceti-t-iii-eclipse-01.webp',
                  alt: 'T-III ocultando casi por completo la luz de Tau Ceti, visto desde la superficie de Thalara',
                  pie: 'INTERPRETACIÓN VISUAL · ECLIPSE PROLONGADO DE THALARA'
                }
              ]
            }
          ],
          datos: [
            ['SISTEMA', 'TAU CETI'],
            ['TIPO', 'GIGANTE DE HIELO'],
            ['POSICIÓN ORBITAL', 'INTERIOR A THALARA'],
            ['TAMAÑO', 'SUPERIOR A THALARA'],
            ['COMPOSICIÓN', 'HIDRÓGENO · HELIO · HIELOS VOLÁTILES'],
            ['SUPERFICIE SÓLIDA', 'NO DEFINIDA'],
            ['SISTEMA DE ANILLOS', 'TENUE'],
            ['RELACIÓN ORBITAL', 'RESONANCIA CASI 1:1'],
            ['EXPLORACIÓN DIRECTA', 'NINGUNA'],
            ['FENÓMENO', 'ECLIPSE DE THALARA'],
            ['DURACIÓN DEL EVENTO', '35 DÍAS · 5 HORAS'],
            ['DESCENSO TÉRMICO', '18 °C · CRÁTER THALARA-1']
          ]
        },
        {
  id: 'sirius-ab-b',
  nombre: 'SIRIUS AB b',
  subtitulo: 'Mundo mineral',
  clasificacion: 'Planeta circumbinario de interés minero',
  codigo: 'SIRIUS AB · OBS-SIR-01',
  estado: 'EXPLOTACIÓN INDUSTRIAL · HEMISFERIO NOCTURNO',
  apariciones: 'ALÉTHEIA I · Sombras sobre Thalara',
  primeraAparicion: 'ALÉTHEIA I · CAPÍTULO 8 · «LO QUE CAMBIA EL RUMBO»',
  ordenAparicion: 8,
  descripcion: 'Mundo mineral situado en una órbita exterior del sistema de Sirius. Su rotación sincrónica mantiene un hemisferio sometido permanentemente a la radiación de las estrellas y otro sumido en una noche perpetua. Mientras el agua hierve o permanece en forma de vapor en la cara iluminada, enormes reservas de hielo cubren las regiones oscuras. La ausencia de oxígeno respirable y una atmósfera rica en hidrógeno impiden la presencia humana sin protección. Sus vastos yacimientos de rodio se explotan en el hemisferio nocturno, donde las instalaciones mineras permanecen protegidas de la radiación directa de Sirius.',
  superficie: 'url("assets/img/observatorio/sirius-ab-b-mapa.webp")',
  usaTextura: true,
  rotacionSincronica: true,
  archivos: [
    {
      id: 'prospeccion',
      etiqueta: 'PROSPECCIÓN',
      titulo: 'Prospección del hemisferio nocturno',
      referencia: 'ALÉTHEIA I · CAPÍTULO 8 · «LO QUE CAMBIA EL RUMBO»',
      tipoRegistro: 'INFERENCIA DEL ARCHIVO',
      notaCanon: 'La novela confirma el descubrimiento de los yacimientos de rodio, pero no describe el descenso ni identifica a los integrantes del equipo. La operación mostrada a continuación es una reconstrucción compatible con esos datos.',
      parrafos: [
        'Los registros de la misión sitúan en Sirius AB b el descubrimiento de vastos yacimientos de rodio. Para documentar el hallazgo, el archivo reconstruye una operación de prospección en el hemisferio nocturno, donde un equipo anónimo habría tomado muestras y realizado mediciones mineralógicas protegido de la radiación directa de Sirius.',
        'Años después, EXOWORLDS Co. obtuvo importantes beneficios mediante la explotación de aquel recurso. Parte de ese capital terminó vinculada a la financiación de PRAETORIAE.'
      ],
      imagenes: [
        {
          src: 'assets/img/observatorio/sirius-ab-b-prospeccion-01.webp',
          alt: 'Reconstrucción de un equipo anónimo tomando muestras entre roca y hielo en el hemisferio nocturno de Sirius AB b',
          pie: 'RECONSTRUCCIÓN VISUAL · PROSPECCIÓN EN EL HEMISFERIO NOCTURNO'
        }
      ]
    }
  ],
  datos: [
    ['SISTEMA', 'SIRIUS AB'],
    ['TIPO', 'MUNDO MINERAL'],
    ['GRAVEDAD', '0,88 g'],
    ['ÓRBITA', 'EXTERIOR · CIRCUMBINARIA'],
    ['ROTACIÓN', 'SINCRÓNICA'],
    ['ATMÓSFERA', 'RICA EN HIDRÓGENO'],
    ['OXÍGENO', 'NO RESPIRABLE'],
    ['AGUA', 'VAPOR · LÍQUIDA · HIELO'],
    ['BIOSFERA', 'INEXISTENTE'],
    ['RECURSO', 'RODIO'],
    ['YACIMIENTOS', 'VASTOS'],
    ['EXTRACCIÓN', 'HEMISFERIO NOCTURNO']
            ]
        },
        {
          id: 'tau-ceti-i',
          nombre: 'TAU CETI i',
          subtitulo: 'Mundo anómalo',
          clasificacion: 'Planeta terrestre de riesgo extremo',
          codigo: 'TAU CETI · OBS-TCI-01',
          estado: 'EXPLORACIÓN ATMOSFÉRICA · RIESGO EXTREMO',
          apariciones: 'Primera aparición: ALÉTHEIA I',
          primeraAparicion: 'ALÉTHEIA I · CAPÍTULO 37 · «RESTOS DE OTRO TIEMPO»',
          ordenAparicion: 37,
          descripcion: 'Planeta de tamaño terrestre localizado dentro del denso disco de escombros de Tau Ceti. Una expedición penetró en su atmósfera para investigar las lecturas anómalas detectadas en la llanura central. La aproximación estuvo marcada por una concentración creciente de asteroides y cometas, corrientes atmosféricas violentas y enormes remolinos de aire caliente. La llanura presenta extensiones de arena blanquecina cubiertas por formaciones de cristales negros. Las temperaturas superficiales oscilan habitualmente entre 80 y 100 °C, aunque algunos puntos alcanzan los 200 °C. La actividad meteórica es constante y las lecturas erráticas registradas en la superficie continúan sin explicación.',
          superficie: 'url("assets/img/observatorio/tau-ceti-i-mapa.webp")',
          usaTextura: true,
          usaAtmosfera: true,
          atmosfera: 'url("assets/img/observatorio/tau-ceti-i-atmosfera.webp")',
          mezclaAtmosfera: 'screen',
          opacidadAtmosfera: '.72',
          velocidadAtmosfera: '54s',
          archivos: [
            {
              id: 'mision',
              etiqueta: 'MISIÓN',
              titulo: 'Expedición a la llanura central',
              referencia: 'ALÉTHEIA I · CAPÍTULO 37 · «RESTOS DE OTRO TIEMPO»',
              parrafos: [
                'Haru Akiyama y Olga Petrov participaron en la expedición enviada para investigar las lecturas inusuales detectadas en la superficie de Tau Ceti i. Ambos lograron resolver el problema relacionado con aquellas señales durante esta única misión documentada en el planeta.',
                'El descenso resultó especialmente difícil. Las altas temperaturas, las violentas corrientes atmosféricas y los grandes remolinos térmicos sometieron a la lanzadera a fuertes turbulencias, haciendo que la aproximación y el aterrizaje fueran complicados y peligrosos.'
              ],
              imagenes: [
                {
                  src: 'assets/img/observatorio/tau-ceti-i-superficie-01.webp',
                  alt: 'Llanura de arena blanquecina y cristales negros bajo los remolinos térmicos de Tau Ceti i',
                  pie: 'REGISTRO DE SUPERFICIE · LLANURA CENTRAL'
                }
              ]
            }
          ],
          datos: [
            ['SISTEMA', 'TAU CETI'],
            ['TIPO', 'TERRESTRE'],
            ['TAMAÑO', 'SIMILAR A LA TIERRA'],
            ['ENTORNO ORBITAL', 'DISCO DE ESCOMBROS'],
            ['DENSIDAD DE OBJETOS', '10 × SISTEMA SOLAR'],
            ['ZONA INVESTIGADA', 'LLANURA CENTRAL'],
            ['SUPERFICIE', 'CRISTALES NEGROS · ARENA BLANCA'],
            ['TEMPERATURA HABITUAL', '80–100 °C'],
            ['PUNTOS EXTREMOS', 'HASTA 200 °C'],
            ['FENÓMENOS', 'REMOLINOS TÉRMICOS'],
            ['ACTIVIDAD METEÓRICA', 'FRECUENTE'],
            ['LECTURAS', 'ANÓMALAS · SIN EXPLICACIÓN']
          ]
        }
      ]
    },
      {
      novela: 'SOMBRAS SOBRE THALARA',
      color: '#c2c4b7',
      planetas: [
        {
          id: 'registro-N02',
          nombre: 'REGISTRO N-02',
          subtitulo: 'Clasificación pendiente',
          clasificacion: 'Expediente en preparación',
          codigo: 'OBS-S01',
          estado: 'DATOS PENDIENTES',
          apariciones: 'Primera aparición: Sombras sobre Thalara',
          primeraAparicion: 'SOMBRAS SOBRE THALARA',
          descripcion: 'Registro reservado para un mundo relacionado con Sombras sobre Thalara.',
          superficie: 'radial-gradient(circle at 30% 25%, #e5e7ea 0 7%, #9ba8b8 23%, #596878 49%, #252c37 74%)',
          datos: [['TIPO', 'PENDIENTE'], ['ATMÓSFERA', 'PENDIENTE'], ['GRAVEDAD', 'PENDIENTE'], ['ESTADO', 'ARCHIVADO']]
        }
      ]
    },
    {
      novela: 'LA CUARTA SONDA',
      color: '#d8d8d9',
      planetas: [
        {
          id: 'registro-N03',
          nombre: 'REGISTRO N-03',
          subtitulo: 'Clasificación pendiente',
          clasificacion: 'Expediente en preparación',
          codigo: 'OBS-S01',
          estado: 'DATOS PENDIENTES',
          apariciones: 'Primera aparición: La cuarta sonda',
          primeraAparicion: 'LA CUARTA SONDA',
          descripcion: 'Registro reservado para un mundo relacionado con La cuarta sonda.',
          superficie: 'radial-gradient(circle at 30% 25%, #e5e7ea 0 7%, #9ba8b8 23%, #596878 49%, #252c37 74%)',
          datos: [['TIPO', 'PENDIENTE'], ['ATMÓSFERA', 'PENDIENTE'], ['GRAVEDAD', 'PENDIENTE'], ['ESTADO', 'ARCHIVADO']]
        }
      ]
    }
  ];

  const lista = archivo.querySelector('#lista-planetas');
  const ordenarPorAparicion = (a, b) =>
    (a.ordenAparicion ?? Number.MAX_SAFE_INTEGER) -
    (b.ordenAparicion ?? Number.MAX_SAFE_INTEGER);

  const todosLosPlanetas = grupos.flatMap((grupo) =>
    [...grupo.planetas]
      .sort(ordenarPorAparicion)
      .map((planeta) => ({ ...planeta, novela: grupo.novela, color: grupo.color }))
  );
    const fichaPlaneta = archivo.querySelector('.ficha-planeta');

fichaPlaneta.insertAdjacentHTML(
  'afterbegin',
  `
    <nav class="ficha-planeta__nav-movil"
         aria-label="Navegación entre planetas">

      <button id="planeta-anterior"
              class="ficha-planeta__nav-boton"
              type="button">
        Anterior
      </button>

      <button id="planeta-siguiente"
              class="ficha-planeta__nav-boton"
              type="button">
        Siguiente
      </button>

      <button id="cerrar-ficha-planeta"
              class="ficha-planeta__cerrar"
              type="button">
        Cerrar
      </button>

    </nav>
  `
);

let planetaActivo = 'thalara';

const botonAnterior = archivo.querySelector('#planeta-anterior');
const botonSiguiente = archivo.querySelector('#planeta-siguiente');
const botonCerrar = archivo.querySelector('#cerrar-ficha-planeta');
const pestanas = archivo.querySelector('#planeta-pestanas');
const panelPlaneta = archivo.querySelector('#panel-planeta');
const panelArchivo = archivo.querySelector('#panel-archivo-planeta');

const esMovil = () =>
  window.matchMedia('(max-width: 575.98px)').matches;

  function activarPestana(id, planeta) {
    const esPlaneta = id === 'planeta';

    panelPlaneta.hidden = !esPlaneta;
    panelArchivo.hidden = esPlaneta;

    pestanas.querySelectorAll('.pestana-planeta').forEach((boton) => {
      const activa = boton.dataset.pestana === id;
      boton.classList.toggle('pestana-planeta--activa', activa);
      boton.setAttribute('aria-selected', String(activa));
      boton.tabIndex = activa ? 0 : -1;
    });

    if (esPlaneta) return;

    const seccion = (planeta.archivos || []).find((archivoExtra) => archivoExtra.id === id);
    panelArchivo.replaceChildren();
    if (!seccion) return;

    const registro = document.createElement('article');
    registro.className = 'archivo-adicional';

    const referencia = document.createElement('p');
    referencia.className = 'archivo-adicional__registro';
    referencia.textContent = seccion.referencia || planeta.primeraAparicion;

    const titulo = document.createElement('h3');
    titulo.textContent = seccion.titulo || seccion.etiqueta;

    const contenido = document.createElement('div');
    contenido.className = 'archivo-adicional__contenido';

    if (seccion.tipoRegistro) {
      const tipoRegistro = document.createElement('p');
      tipoRegistro.className = 'archivo-adicional__tipo';
      tipoRegistro.textContent = seccion.tipoRegistro;
      registro.appendChild(tipoRegistro);
    }

    if (seccion.notaCanon) {
      const notaCanon = document.createElement('p');
      notaCanon.className = 'archivo-adicional__nota-canon';
      notaCanon.textContent = seccion.notaCanon;
      contenido.appendChild(notaCanon);
    }

    (seccion.parrafos || []).forEach((texto) => {
      const parrafo = document.createElement('p');
      parrafo.textContent = texto;
      contenido.appendChild(parrafo);
    });

    if (seccion.imagenes?.length) {
      const galeria = document.createElement('div');
      galeria.className = 'archivo-adicional__galeria';

      seccion.imagenes.forEach((imagen) => {
        const figura = document.createElement('figure');
        figura.className = 'archivo-adicional__imagen';

        const foto = document.createElement('img');
        foto.src = imagen.src;
        foto.alt = imagen.alt || '';
        foto.loading = 'lazy';

        figura.appendChild(foto);

        if (imagen.pie) {
          const pie = document.createElement('figcaption');
          pie.textContent = imagen.pie;
          figura.appendChild(pie);
        }

        galeria.appendChild(figura);
      });

      contenido.appendChild(galeria);
    }

    registro.prepend(referencia);
    registro.append(titulo, contenido);
    panelArchivo.appendChild(registro);
  }

  function mostrarPestanas(planeta) {
    const secciones = [
      { id: 'planeta', etiqueta: 'PLANETA' },
      ...(planeta.archivos || [])
    ];

    pestanas.replaceChildren();

    secciones.forEach((seccion) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'pestana-planeta';
      boton.dataset.pestana = seccion.id;
      boton.setAttribute('role', 'tab');
      boton.textContent = seccion.etiqueta;
      boton.addEventListener('click', () => activarPestana(seccion.id, planeta));
      pestanas.appendChild(boton);
    });

    activarPestana('planeta', planeta);
  }

  grupos.forEach((grupo) => {
    const seccion = document.createElement('section');
    seccion.className = 'grupo-novela';
    seccion.style.setProperty('--color-novela', grupo.color);

    const titulo = document.createElement('h3');
    titulo.className = 'grupo-novela__titulo';
    titulo.textContent = grupo.novela;
    seccion.appendChild(titulo);

    [...grupo.planetas].sort(ordenarPorAparicion).forEach((planeta) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'selector-planeta';
      boton.dataset.planeta = planeta.id;
      boton.setAttribute('aria-selected', 'false');
      boton.style.setProperty('--color-novela', grupo.color);
      boton.innerHTML = `<span class="selector-planeta__miniatura" aria-hidden="true"></span><span><strong>${planeta.nombre}</strong><small>${planeta.subtitulo}</small></span>`;
      boton.querySelector('.selector-planeta__miniatura').style.backgroundImage = planeta.superficie;
      seccion.appendChild(boton);
    });

    lista.appendChild(seccion);
  });

  function mostrarPlaneta(id) {
    const planeta = todosLosPlanetas.find((registro) => registro.id === id);
    if (!planeta) return;
      planetaActivo = planeta.id;

    archivo.style.setProperty('--color-novela-activa', planeta.color);
    const esfera = archivo.querySelector('#planeta-esfera');
    esfera.style.backgroundImage = planeta.superficie;
    const visor = esfera.closest('.visor-planeta');
    let anillosFondo = visor.querySelector('.planeta-anillos--fondo');
    let anillosFrente = visor.querySelector('.planeta-anillos--frente');

    if (!anillosFondo || !anillosFrente) {
      anillosFondo = document.createElement('span');
      anillosFondo.className = 'planeta-anillos planeta-anillos--fondo';
      anillosFondo.setAttribute('aria-hidden', 'true');

      anillosFrente = document.createElement('span');
      anillosFrente.className = 'planeta-anillos planeta-anillos--frente';
      anillosFrente.setAttribute('aria-hidden', 'true');

      esfera.insertAdjacentElement('beforebegin', anillosFondo);
      esfera.insertAdjacentElement('afterend', anillosFrente);
    }

    [anillosFondo, anillosFrente].forEach((anillo) => {
      anillo.classList.toggle('planeta-anillos--activos', Boolean(planeta.anillado));
    });
      let capaAtmosfera = esfera.querySelector('.planeta-atmosfera');

if (!capaAtmosfera) {
  capaAtmosfera = document.createElement('span');
  capaAtmosfera.className = 'planeta-atmosfera';
  capaAtmosfera.setAttribute('aria-hidden', 'true');
  esfera.appendChild(capaAtmosfera);
}

capaAtmosfera.style.backgroundImage = planeta.atmosfera || 'none';
capaAtmosfera.style.mixBlendMode = planeta.mezclaAtmosfera || 'normal';
capaAtmosfera.style.opacity = planeta.opacidadAtmosfera || '0';
capaAtmosfera.style.animationDuration =
  planeta.velocidadAtmosfera || '96s';

capaAtmosfera.classList.toggle(
  'planeta-atmosfera--activa',
  Boolean(planeta.usaAtmosfera && planeta.atmosfera)
);
      
    esfera.classList.toggle('planeta-esfera--textura', Boolean(planeta.usaTextura));
    esfera.classList.toggle(
    'planeta-esfera--atmosfera',
    Boolean(planeta.usaAtmosfera)
    );
    esfera.classList.toggle(
    'planeta-esfera--sincronica',
    Boolean(planeta.rotacionSincronica)
    );
    esfera.classList.toggle('planeta-esfera--anillado', Boolean(planeta.anillado));
    archivo.querySelector('#planeta-nombre').textContent = planeta.nombre;
    archivo.querySelector('#planeta-clasificacion').textContent = planeta.clasificacion;
    archivo.querySelector('#planeta-novela').textContent = planeta.novela;
    archivo.querySelector('#planeta-primera-aparicion').textContent = planeta.primeraAparicion || planeta.novela;
    archivo.querySelector('#planeta-codigo').textContent = planeta.codigo;
    archivo.querySelector('#planeta-descripcion').textContent = planeta.descripcion;
    archivo.querySelector('#planeta-estado').textContent = planeta.estado;
    archivo.querySelector('#planeta-apariciones').textContent = planeta.apariciones;

    const telemetria = archivo.querySelector('#planeta-telemetria');
    telemetria.replaceChildren();
    planeta.datos.forEach(([etiqueta, valor]) => {
      const dato = document.createElement('dl');
      dato.className = 'dato-planeta';
      dato.innerHTML = `<dt>${etiqueta}</dt><dd>${valor}</dd>`;
      telemetria.appendChild(dato);
    });

    archivo.querySelectorAll('.selector-planeta').forEach((boton) => {
      boton.setAttribute('aria-selected', String(boton.dataset.planeta === planeta.id));
    });

    mostrarPestanas(planeta);
  }

  lista.addEventListener('click', (event) => {
  const boton = event.target.closest('.selector-planeta');
  if (!boton) return;

  mostrarPlaneta(boton.dataset.planeta);

  if (esMovil()) {
    archivo.classList.add('modo-ficha-movil');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
});
    function navegarPlaneta(direccion) {
  const indiceActual = todosLosPlanetas.findIndex(
    (planeta) => planeta.id === planetaActivo
  );

  if (indiceActual === -1) return;

  const nuevoIndice =
    (indiceActual + direccion + todosLosPlanetas.length) %
    todosLosPlanetas.length;

  mostrarPlaneta(todosLosPlanetas[nuevoIndice].id);

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

botonAnterior?.addEventListener('click', () => {
  navegarPlaneta(-1);
});

botonSiguiente?.addEventListener('click', () => {
  navegarPlaneta(1);
});

botonCerrar?.addEventListener('click', () => {
  archivo.classList.remove('modo-ficha-movil');

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

  mostrarPlaneta('thalara');
});
