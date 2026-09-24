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
          descripcion: 'Mundo menor que la Tierra, cálido y seco, cuyos dos océanos polares contrastan con una extensa franja continental de lagos, montañas y grandes cuencas de impacto. Los cráteres habitables alcanzan los 40 °C, mientras que en los desiertos centrales se han medido máximas de hasta 80 °C. Su rotación prolonga el día hasta las veintinueve horas. Una única luna, sensiblemente menor y más distante que la terrestre, ejerce una influencia muy reducida sobre las mareas. El gran océano austral presenta vientos suaves y corrientes lentas. Una bruma ligera cubre los continentes y las nubes avanzan lentamente sobre un ecosistema activo y complejo. En los océanos se desplazan enormes criaturas; en tierra, los sensores han registrado organismos de morfología inquietantemente próxima a ciertos mamíferos.',
          superficie: 'url("assets/img/observatorio/thalara-mapa-final.webp")',
          usaTextura: true,
          usaAtmosfera: true,
          atmosfera: 'url("assets/img/observatorio/thalara-atmosfera.webp")',
          mezclaAtmosfera: 'normal',
          opacidadAtmosfera: '1',
          velocidadAtmosfera: '96s',
          archivos: [
            {
              id: 'archivo-n03',
              etiqueta: 'RECUPERACIÓN',
              titulo: 'Un planeta que vuelve a respirar',
              referencia: 'LA CUARTA SONDA · CAPÍTULOS 10–13 Y 35',
              tipoRegistro: 'EVOLUCIÓN PLANETARIA · TERCERA NOVELA',
              notaCanon: 'Esta sección contiene información revelada en La cuarta sonda y puede anticipar la evolución de Thalara posterior a la primera novela.',
              parrafos: [
                'El agua del hemisferio sur avanza sobre territorios que permanecieron secos durante milenios. El nuevo mar, somero y cálido, disuelve fosfatos, nitratos y hierro, favoreciendo una rápida proliferación de algas microscópicas y fitoplancton. Su producción de oxígeno tardará décadas en alterar una atmósfera tan extensa, pero confirma que la recuperación ecológica del planeta se está acelerando.',
                'La costa meridional presenta aguas tranquilas, playas claras, peces de escamas iridiscentes, crustáceos azulados y bosques de madera oscura. La región, más fresca y estable que los cráteres interiores, ha sido elegida para levantar un asentamiento thalariano y las primeras instalaciones humanas permanentes junto al océano.',
                'Generadores instalados en los acantilados crearán una zona local enriquecida con oxígeno. Mientras tanto, Base THALARA-1 experimenta con cultivos terrestres y estudia cómo introducirlos sin transformar de manera agresiva el ecosistema autóctono.'
              ],
              imagenes: [
                {
                  src: 'assets/img/observatorio/thalara-recuperacion-02.webp',
                  alt: 'La nueva costa austral de Thalara, con aguas someras, peces iridiscentes y crustáceos azulados.',
                  pie: 'INTERPRETACIÓN VISUAL · LA COSTA AUSTRAL VUELVE A RESPIRAR'
                },
                {
                  src: 'assets/img/observatorio/thalara-resort-construccion-01.webp',
                  alt: 'Muelle pesquero y primeras construcciones del asentamiento costero de Thalara, con los conversores de oxígeno sobre el acantilado.',
                  pie: 'RECONSTRUCCIÓN VISUAL · EL ASENTAMIENTO COSTERO EMPIEZA A CRECER'
                }
              ]
            },
            {
              id: 'archivo-n02',
              etiqueta: 'ARCHIVO II',
              titulo: 'Historia planetaria y protección',
              referencia: 'SOMBRAS SOBRE THALARA · CAPÍTULO 25 · «AZUL OSCURO»',
              tipoRegistro: 'CONTENIDO DE LA SEGUNDA NOVELA',
              notaCanon: 'Esta sección amplía la historia de Thalara con información revelada en Sombras sobre Thalara y puede anticipar elementos de la segunda novela.',
              parrafos: [
                'Los registros confirman que Thalara albergó antes del cataclismo una civilización industrializada. Los Ancestros explotaron sus recursos durante generaciones y dejaron tras de sí infraestructuras, depósitos y señales de una historia tecnológica interrumpida por un desastre cósmico.',
                'La extracción contemporánea no resulta sencilla ni barata: gran parte de los recursos accesibles ya fue utilizada. Algunos impactos posteriores removieron vetas profundas y expusieron minerales como el paladio, pero intervenir en ellas supondría amenazar ecosistemas que sobrevivieron al cataclismo.',
                'Ante la ONU se propuso reconocer el planeta como hogar de los thalarianos y protegerlo como reserva de vida. La presencia humana queda así subordinada a la conservación del mundo y de sus habitantes.'
              ],
              imagenes: [
                {
                  src: 'assets/img/observatorio/thalara-historia-proteccion-01.webp',
                  alt: 'Ruinas industriales de los Ancestros alrededor de un lago habitado en uno de los antiguos cráteres de Thalara.',
                  pie: 'RECONSTRUCCIÓN VISUAL · PATRIMONIO INDUSTRIAL Y RESERVA DE VIDA'
                }
              ]
            }
          ],
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
  ['SATÉLITES', '1 · LUNA MENOR Y DISTANTE'],
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
      referencia: 'ALÉTHEIA I · CAP. 8 · ALÉTHEIA II · CAP. 2',
      tipoRegistro: 'INFERENCIA DEL ARCHIVO',
      notaCanon: 'ALÉTHEIA I confirma el descubrimiento de los yacimientos de rodio y Sombras sobre Thalara confirma su explotación posterior por EXOWORLDS. Ninguna de las dos novelas describe el descenso ni identifica a los integrantes del equipo; la operación mostrada es una reconstrucción compatible con esos datos.',
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
          id: 'l1159-16-b',
          nombre: 'L1159-16 b',
          subtitulo: 'Mundo de las cinco lunas',
          clasificacion: 'Mundo hídrico de alta gravedad',
          codigo: 'L1159-16 · OBS-L16-01',
          estado: 'DESCENSO TRIPULADO · EXPLORACIÓN PRELIMINAR',
          apariciones: 'Primera aparición: Sombras sobre Thalara',
          primeraAparicion: 'SOMBRAS SOBRE THALARA · CAPÍTULO 29 · «PARALLAX»',
          ordenAparicion: 29,
          descripcion: 'Único planeta detectado alrededor de la enana roja L1159-16. Es aproximadamente un cincuenta por ciento mayor que la Tierra y posee una gravedad sensiblemente superior. Una enorme reserva de agua líquida forma océanos, mares interiores y lagos separados por amplias extensiones de tierra. El clima es frío en términos generales, con grandes casquetes polares, aunque el cinturón ecuatorial mantiene temperaturas cercanas a los 20 °C. Sus cinco grandes lunas provocan mareas complejas, corrientes impredecibles y cambios meteorológicos muy rápidos. La atmósfera contiene oxígeno, pero requiere protección respiratoria. En la superficie se ha observado vida simple semejante al musgo, sin indicios confirmados de fauna compleja.',
          superficie: 'url("assets/img/observatorio/l1159-16-b-mapa.webp")',
          usaTextura: true,
          usaAtmosfera: true,
          atmosfera: 'url("assets/img/observatorio/l1159-16-b-atmosfera.webp")',
          mezclaAtmosfera: 'normal',
          opacidadAtmosfera: '.88',
          velocidadAtmosfera: '46s',
          archivos: [
            {
              id: 'descenso',
              etiqueta: 'DESCENSO',
              titulo: 'Exploración de Olga y Audrey',
              referencia: 'SOMBRAS SOBRE THALARA · CAPÍTULO 29 · «PARALLAX»',
              tipoRegistro: 'REGISTRO DE EXPLORACIÓN',
              notaCanon: 'La designación L1159-16 b sigue el criterio astronómico estándar. La novela identifica el sistema y describe el planeta, pero no le asigna un nombre propio.',
              parrafos: [
                'Olga Petrov y Audrey realizaron el primer descenso conocido mientras ARCTURUS intentaba reconstruir su posición. Aterrizaron junto a un mar interior y comprobaron que la gravedad superficial era entre un diez y un veinte por ciento superior a la terrestre.',
                'La exploración confirmó la presencia de agua líquida y de organismos verdes semejantes al musgo. No detectaron insectos, aves ni otros animales, aunque las capacidades científicas de ARCTURUS eran limitadas y no permiten descartar formas de vida más complejas.',
                'Las cinco lunas generaban mareas simultáneas y difíciles de predecir. El agua avanzaba desde distintas direcciones y las corrientes profundas no coincidían con las superficiales. En pocas horas, el tiempo pasó de la calma a una tormenta eléctrica; al día siguiente, la temperatura había descendido bajo cero y una zona costera inundada aparecía completamente seca.'
              ],
              imagenes: [
                {
                  src: 'assets/img/observatorio/l1159-16-b-superficie-01.webp',
                  alt: 'ARCTURUS sobre una planicie mareal de L1159-16 b bajo el cielo rojizo, las cinco lunas y una tormenta próxima',
                  pie: 'REGISTRO DE SUPERFICIE · PRIMER DESCENSO DE OLGA PETROV Y AUDREY'
                }
              ]
            }
          ],
          datos: [
            ['SISTEMA', 'L1159-16'],
            ['ESTRELLA', 'ENANA ROJA'],
            ['TIPO', 'MUNDO HÍDRICO'],
            ['TAMAÑO', '1,5 × TIERRA'],
            ['GRAVEDAD ESTIMADA', '1,1–1,2 g'],
            ['ATMÓSFERA', 'OXÍGENO · REQUIERE MÁSCARA'],
            ['HIDROSFERA', 'OCÉANOS · MARES · LAGOS'],
            ['CLIMA', 'FRÍO · MUY VARIABLE'],
            ['TEMPERATURA ECUATORIAL', '≈ 20 °C'],
            ['CASQUETES POLARES', 'EXTENSOS'],
            ['SATÉLITES', '5 · GRAN TAMAÑO'],
            ['MAREAS', 'EXTREMAS · IMPREDECIBLES'],
            ['BIOSFERA', 'VIDA SIMPLE CONFIRMADA'],
            ['EXPLORADORES', 'OLGA PETROV · AUDREY']
          ]
        }
      ]
    },
    {
      novela: 'LA CUARTA SONDA',
      color: '#d8d8d9',
      planetas: [
        {
          id: 'yz-ceti-e',
          nombre: 'YZ CETI e',
          subtitulo: 'Mundo magnético',
          clasificacion: 'Planeta terrestre de magnetismo extremo',
          codigo: 'YZ CETI · OBS-YZE-01',
          estado: 'DESCENSO TRIPULADO · RIESGO MAGNÉTICO EXTREMO',
          apariciones: 'Primera aparición: La cuarta sonda',
          primeraAparicion: 'LA CUARTA SONDA · CAPÍTULO 3 · «LA TRAMPA MAGNÉTICA»',
          ordenAparicion: 3,
          descripcion: 'Cuarto mundo identificado en el sistema YZ Ceti. Pese a su masa reducida, presenta una gravedad próxima a la terrestre, atmósfera respirable y grandes masas de agua salina. Su superficie oscura contiene extensas regiones metálicas sometidas a un campo magnético extraordinariamente intenso y desigual. En las zonas de máxima concentración, el planeta puede inmovilizar una nave, saturar sensores y corromper sistemas incluso desde la órbita. Las tormentas mantienen hierro en suspensión y forman granizo azul translúcido con vetas rojizas. Una bacteria adquirida durante la expedición confirma la existencia de vida microbiana autóctona.',
          superficie: 'url("assets/img/observatorio/yz-ceti-e-mapa-v1.webp")',
          usaTextura: true,
          usaAtmosfera: true,
          atmosfera: 'url("assets/img/observatorio/yz-ceti-e-atmosfera-v3.webp")',
          mezclaAtmosfera: 'screen',
          opacidadAtmosfera: '.72',
          velocidadAtmosfera: '68s',
          archivos: [
            {
              id: 'mision-magnetica',
              etiqueta: 'MISIÓN',
              titulo: 'La trampa magnética',
              referencia: 'LA CUARTA SONDA · CAPÍTULOS 3–7',
              tipoRegistro: 'REGISTRO DE EXPLORACIÓN',
              parrafos: [
                'Olga Petrov dirige el primer descenso junto con Corban y su equipo científico. ARCTURUS queda atrapada sobre una región de magnetismo extremo durante casi tres semanas, sin capacidad para despegar y con graves interferencias en sus sistemas.',
                'Haru Akiyama desciende posteriormente en una cápsula no metálica. La liberación exige combinar corriente alterna en el casco, calentamiento del terreno, motores gravitatorios y cohetes sólidos de emergencia.',
                'Tras el rescate se descubre que Olga contrajo una bacteria local. El microorganismo responde a antibióticos, pero dificulta la cicatrización y produce alteraciones neurológicas y conductuales mediante sus metabolitos.'
              ],
              imagenes: [
                {
                  src: 'assets/img/observatorio/yz-ceti-e-superficie-01.webp',
                  alt: 'Tormenta de granizo magnético sobre la superficie oscura y húmeda de YZ Ceti e.',
                  pie: 'REGISTRO DE SUPERFICIE · TORMENTA DE GRANIZO MAGNÉTICO'
                }
              ]
            }
          ],
          datos: [
            ['SISTEMA', 'YZ CETI'],
            ['ESTRELLA', 'ENANA ROJA FULGURANTE'],
            ['TIPO', 'TERRESTRE METÁLICO'],
            ['MASA', 'MUY BAJA'],
            ['GRAVEDAD', 'PRÓXIMA A 1 g'],
            ['ATMÓSFERA', 'RESPIRABLE'],
            ['HIDROSFERA', 'AGUA LÍQUIDA SALINA'],
            ['CAMPO MAGNÉTICO', 'EXTREMO · IRREGULAR'],
            ['TORMENTAS', 'HIERRO · GRANIZO MAGNÉTICO'],
            ['BIOSFERA', 'VIDA MICROBIANA CONFIRMADA'],
            ['PRIMER DESCENSO', 'OLGA PETROV · CORBAN'],
            ['PERMANENCIA EN SUPERFICIE', 'CASI 3 SEMANAS']
          ]
        },
        {
          id: 'planeta-sismico',
          nombre: 'PLANETA SÍSMICO',
          subtitulo: 'Mundo de mareas extremas',
          clasificacion: 'Planeta terrestre con biosfera y actividad tectónica permanente',
          codigo: 'SISTEMA SIN DESIGNAR · OBS-SIS-02',
          estado: 'EXPLORACIÓN TRIPULADA · SEGUNDA SONDA RECUPERADA',
          apariciones: 'Primera aparición: La cuarta sonda',
          primeraAparicion: 'LA CUARTA SONDA · CAPÍTULO 16 · «EL PLANETA SÍSMICO»',
          ordenAparicion: 16,
          descripcion: 'Mundo de gravedad y temperatura similares a las terrestres, protegido por un campo magnético potente y cubierto parcialmente por océanos polares de azul oscuro. Su atmósfera es respirable, aunque el azufre volcánico, el polvo y la lluvia corrosiva convierten algunas regiones en entornos peligrosos. Una luna cercana de enorme tamaño aparente somete la corteza a fuerzas de marea continuas. El resultado es un planeta arrugado: cordilleras casi ininterrumpidas, valles profundos, cascadas, volcanes, fallas y terremotos constantes. Pese a esa inestabilidad, alberga plantas, líquenes e insectos adaptados al movimiento del terreno.',
          superficie: 'url("assets/img/observatorio/planeta-sismico-mapa-v2.webp")',
          usaTextura: true,
          usaAtmosfera: true,
          atmosfera: 'url("assets/img/observatorio/planeta-sismico-atmosfera-v1.webp")',
          mezclaAtmosfera: 'screen',
          opacidadAtmosfera: '.74',
          velocidadAtmosfera: '52s',
          archivos: [
            {
              id: 'luna-extrema',
              etiqueta: 'SATÉLITE',
              titulo: 'La luna que deforma un mundo',
              referencia: 'LA CUARTA SONDA · CAPÍTULO 16 · «EL PLANETA SÍSMICO»',
              tipoRegistro: 'MODELO ORBITAL Y GEOLÓGICO',
              parrafos: [
                'El satélite mide aproximadamente la mitad que la Luna terrestre, pero orbita a una cuarta parte de su distancia y se desplaza entre tres y cuatro veces más rápido. Desde la superficie cruza el cielo con un movimiento visible y un diámetro aparente desmesurado.',
                'Sus fuerzas de marea, estimadas en unas treinta veces las terrestres, afectan tanto a los océanos como a la corteza. Cada paso estira y comprime el planeta, alimentando las fallas, el volcanismo y los terremotos permanentes.'
              ],
              imagenes: [
                {
                  src: 'assets/img/observatorio/planeta-sismico-superficie-01.webp',
                  alt: 'Valle plegado, cascadas y actividad volcánica bajo la enorme luna cercana del planeta sísmico.',
                  pie: 'REGISTRO DE SUPERFICIE · RELIEVE, CASCADAS Y SATÉLITE CERCANO'
                }
              ]
            },
            {
              id: 'segunda-sonda',
              etiqueta: 'SONDA II',
              titulo: 'La caverna de fuego',
              referencia: 'LA CUARTA SONDA · CAPÍTULOS 19–22',
              tipoRegistro: 'REGISTRO DE RECUPERACIÓN',
              notaCanon: 'El embrión recuperado de esta sonda se pierde posteriormente al quedar interrumpida su refrigeración tras los daños sufridos por PRAETORIAE.',
              parrafos: [
                'La segunda sonda ancestral aparece dentro de una galería volcánica, parcialmente incrustada en lava solidificada. Probablemente penetró en la atmósfera, desacopló su motor y empleó bolsas inflables para amortiguar el impacto.',
                'Pese a llevar entre cien y doscientos años atrapada, continúa funcionando. En su interior se encuentra un sistema criogénico todavía activo que conserva un embrión ancestral potencialmente vivo.'
              ]
            }
          ],
          datos: [
            ['SISTEMA', 'SIN DESIGNACIÓN'],
            ['ESTRELLA', 'ENANA AMARILLA ESTABLE'],
            ['TIPO', 'TERRESTRE BIÓTICO'],
            ['GRAVEDAD', 'SIMILAR A LA TIERRA'],
            ['ATMÓSFERA', 'RESPIRABLE · DENSA'],
            ['HIDROSFERA', 'OCÉANOS POLARES · RÍOS'],
            ['RELIEVE', 'CORDILLERAS CASI CONTINUAS'],
            ['ACTIVIDAD', 'SÍSMICA Y VOLCÁNICA EXTREMA'],
            ['SATÉLITES', '1 · ÓRBITA MUY CERCANA'],
            ['FUERZA MAREAL', '≈ 30 × TIERRA'],
            ['BIOSFERA', 'PLANTAS · LÍQUENES · INSECTOS'],
            ['RIESGOS', 'RADIACIÓN · AZUFRE · LLUVIA CORROSIVA']
          ]
        },
        {
          id: 'mundo-violeta',
          nombre: 'MUNDO VIOLETA',
          subtitulo: 'Planeta de 3,6 g',
          clasificacion: 'Mundo de alta gravedad y órbita extrema',
          codigo: 'SISTEMA SIN DESIGNAR · OBS-E0-03',
          estado: 'PROSPECCIÓN REMOTA · EXTRACCIÓN DE ELEMENTO CERO',
          apariciones: 'Primera aparición: La cuarta sonda',
          primeraAparicion: 'LA CUARTA SONDA · CAPÍTULO 30 · «ÓRBITA EXTREMA»',
          ordenAparicion: 30,
          descripcion: 'Planeta masivo atrapado en una órbita de enorme excentricidad. A lo largo de sus ochocientos días alterna una congelación generalizada, dos pasos por la zona habitable y episodios de sobrecalentamiento cerca de la estrella. La atmósfera densa oculta una superficie violácea sometida a 3,6 g. Bajo el hielo existen depósitos de elemento cero, una materia capaz de absorber radiación y anular sensores. Grandes surcos rectilíneos revelan que otra civilización extrajo millones de toneladas antes de la llegada humana. No se ha detectado vida.',
          superficie: 'url("assets/img/observatorio/mundo-violeta-mapa-v1.webp")',
          usaTextura: true,
          usaAtmosfera: true,
          atmosfera: 'url("assets/img/observatorio/mundo-violeta-atmosfera-v1.webp")',
          mezclaAtmosfera: 'screen',
          opacidadAtmosfera: '.60',
          velocidadAtmosfera: '108s',
          archivos: [
            {
              id: 'elemento-cero',
              etiqueta: 'ELEMENTO 0',
              titulo: 'Materia que absorbe la radiación',
              referencia: 'LA CUARTA SONDA · CAPÍTULOS 30–34',
              tipoRegistro: 'ANÁLISIS DE MATERIALES',
              parrafos: [
                'El elemento cero absorbe radiación sin reemitirla en forma detectable. En concentraciones altas interrumpe comunicaciones, radar y telemetría hasta hacer desaparecer por completo una nave de los instrumentos.',
                'Necesita frío y presión para conservar su estado sólido. Disuelto en agua exótica forma una película de ocultación estable durante veinte o treinta minutos. Cuando se satura, cristaliza, pierde sus propiedades y se desintegra.',
                'No ha podido sintetizarse. Sus posibles aplicaciones incluyen blindaje de reactores, contención de residuos nucleares y protección frente a fugas de radiación.'
              ]
            },
            {
              id: 'mision-36g',
              etiqueta: 'MISIÓN',
              titulo: 'Veinticinco minutos en 3,6 g',
              referencia: 'LA CUARTA SONDA · CAPÍTULOS 31–33',
              tipoRegistro: 'REGISTRO DE SUPERFICIE',
              parrafos: [
                'Olga Petrov y Marcus Lowe realizan el primer descenso con trajes HÉRCULES H-10 y una lanzadera reducida a sus componentes esenciales. La gravedad, la presión atmosférica y el esfuerzo circulatorio limitan la permanencia humana a veinticinco minutos.',
                'Marcus obtiene muestras de elemento cero y recupera una aleación perteneciente a una estructura mayor. El hallazgo demuestra la existencia de un tercer actor tecnológico, distinto de la humanidad y de los Ancestros.',
                'Las operaciones posteriores se realizan con un vehículo oruga y una lanzadera no tripulada, sometidos a mantenimiento después de cada ciclo de extracción.'
              ],
              imagenes: [
                {
                  src: 'assets/img/observatorio/mundo-violeta-superficie-02.webp',
                  alt: 'Olga y Marcus con trajes HÉRCULES junto al surco de extracción abierto en la superficie violeta.',
                  pie: 'RECONSTRUCCIÓN VISUAL · PRIMER DESCENSO EN 3,6 g'
                }
              ]
            }
          ],
          datos: [
            ['SISTEMA', 'SIN DESIGNACIÓN'],
            ['TIPO', 'MUNDO DE ALTA GRAVEDAD'],
            ['GRAVEDAD', '3,6 g'],
            ['PERIODO ORBITAL', '≈ 800 DÍAS'],
            ['ÓRBITA', 'EXTREMADAMENTE EXCÉNTRICA'],
            ['AGUA LÍQUIDA', '≈ 300 DÍAS POR CICLO'],
            ['ATMÓSFERA', 'MUY DENSA'],
            ['SUPERFICIE', 'HIELO · TERRENO VIOLETA'],
            ['BIOSFERA', 'NO DETECTADA'],
            ['RECURSO', 'ELEMENTO CERO'],
            ['PERMANENCIA HUMANA', 'MÁXIMO 25 MINUTOS'],
            ['EVIDENCIA', 'EXTRACCIÓN ALIENÍGENA ANTERIOR']
          ]
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
