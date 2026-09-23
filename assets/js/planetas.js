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
          descripcion: 'Mundo menor que la Tierra, cálido y seco, cuyos dos océanos polares contrastan con una extensa franja continental de lagos, montañas y grandes cuencas de impacto. Los cráteres habitables alcanzan los 40 °C, mientras que en los desiertos centrales se han medido máximas de hasta 80 °C. Su rotación prolonga el día hasta las veintinueve horas. Una única luna, sensiblemente menor que la terrestre, orbita el planeta y ejerce una influencia muy reducida sobre las mareas. Una bruma ligera cubre sus continentes y las nubes avanzan lentamente sobre un ecosistema activo y complejo. En los océanos se desplazan enormes criaturas; en tierra, los sensores han registrado organismos de morfología inquietantemente próxima a ciertos mamíferos.',
          superficie: 'url("assets/img/observatorio/thalara-mapa-final.png")',
          usaTextura: true,
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
  id: 'sirius-ab-b',
  nombre: 'SIRIUS AB b',
  subtitulo: 'Mundo mineral',
  clasificacion: 'Planeta circumbinario de interés minero',
  codigo: 'SIRIUS AB · OBS-SIR-01',
  estado: 'EXPLOTACIÓN INDUSTRIAL · HEMISFERIO NOCTURNO',
  apariciones: 'ALÉTHEIA I · Sombras sobre Thalara',
  descripcion: 'Mundo mineral situado en una órbita exterior del sistema de Sirius. Su rotación sincrónica mantiene un hemisferio sometido permanentemente a la radiación de las estrellas y otro sumido en una noche perpetua. Mientras el agua hierve o permanece en forma de vapor en la cara iluminada, enormes reservas de hielo cubren las regiones oscuras. La ausencia de oxígeno respirable y una atmósfera rica en hidrógeno impiden la presencia humana sin protección. Sus vastos yacimientos de rodio se explotan en el hemisferio nocturno, donde las instalaciones mineras permanecen protegidas de la radiación directa de Sirius.',
  superficie: 'url("assets/img/observatorio/sirius-ab-b-mapa.png")',
usaTextura: true,
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
        }
      ]
    },
    {
      novela: 'LA CUARTA SONDA',
      color: '#d8d8d9',
      planetas: [
        {
          id: 'registro-s01',
          nombre: 'REGISTRO S-01',
          subtitulo: 'Clasificación pendiente',
          clasificacion: 'Expediente en preparación',
          codigo: 'OBS-S01',
          estado: 'DATOS PENDIENTES',
          apariciones: 'Primera aparición: La cuarta sonda',
          descripcion: 'Registro reservado para un mundo relacionado con La cuarta sonda. El nombre y los datos definitivos podrán sustituir estos textos provisionales desde un único objeto de JavaScript.',
          superficie: 'radial-gradient(circle at 30% 25%, #e5e7ea 0 7%, #9ba8b8 23%, #596878 49%, #252c37 74%)',
          datos: [['TIPO', 'PENDIENTE'], ['ATMÓSFERA', 'PENDIENTE'], ['GRAVEDAD', 'PENDIENTE'], ['ESTADO', 'ARCHIVADO']]
        }
      ]
    }
  ];

  const lista = archivo.querySelector('#lista-planetas');
  const todosLosPlanetas = grupos.flatMap((grupo) => grupo.planetas.map((planeta) => ({ ...planeta, novela: grupo.novela, color: grupo.color })));
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

const esMovil = () =>
  window.matchMedia('(max-width: 575.98px)').matches;

  grupos.forEach((grupo) => {
    const seccion = document.createElement('section');
    seccion.className = 'grupo-novela';
    seccion.style.setProperty('--color-novela', grupo.color);

    const titulo = document.createElement('h3');
    titulo.className = 'grupo-novela__titulo';
    titulo.textContent = grupo.novela;
    seccion.appendChild(titulo);

    grupo.planetas.forEach((planeta) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'selector-planeta';
      boton.dataset.planeta = planeta.id;
      boton.setAttribute('aria-selected', 'false');
      boton.style.setProperty('--color-novela', grupo.color);
      boton.style.setProperty('--miniatura', planeta.superficie);
      boton.innerHTML = `<span class="selector-planeta__miniatura" aria-hidden="true"></span><span><strong>${planeta.nombre}</strong><small>${planeta.subtitulo}</small></span>`;
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
    esfera.classList.toggle('planeta-esfera--textura', Boolean(planeta.usaTextura));
    archivo.querySelector('#planeta-nombre').textContent = planeta.nombre;
    archivo.querySelector('#planeta-clasificacion').textContent = planeta.clasificacion;
    archivo.querySelector('#planeta-novela').textContent = planeta.novela;
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
