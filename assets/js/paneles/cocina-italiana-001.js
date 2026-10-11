(function (global) {
  "use strict";
  const categoria = "COCINA ITALIANA";
  const lote = [
    ["Guiso siciliano agridulce protagonizado por la berenjena","CAPONATA SICILIANA",2],
    ["Aceitunas rellenas, empanadas y fritas típicas de Las Marcas","OLIVE ALL'ASCOLANA",3],
    ["Bolas sicilianas de arroz rellenas y fritas","ARANCINI SICILIANOS",2],
    ["Sopa italiana de verduras y legumbres","MINESTRONE",2],
    ["Guiso humilde que reúne pasta y garbanzos","PASTA E CECI",2],
    ["Sopa marinera procedente de la costa de Liguria","BURRIDA LIGURE",2],
    ["Sopa toscana de tomate que aprovecha el pan duro","PAPPA AL POMODORO",2],
    ["Berenjenas horneadas en capas con tomate y queso","BERENJENAS A LA PARMESANA",2],
    ["Ensalada italiana de tomate, mozzarella y albahaca","ENSALADA CAPRESE",2],
    ["Ensalada toscana que aprovecha pan, tomate y hortalizas","PANZANELLA",2],
    ["Tarta salada ligur rellena de verduras, queso y huevo","TORTA PASCUALINA",2],
    ["Tortilla italiana enriquecida con varios quesos","FRITTATA CUATRO QUESOS",2],
    ["Arroz cremoso con espárragos y queso de cabra","RISOTTO DE ESPÁRRAGOS",2],
    ["Versión esencial del arroz cremoso italiano","RISOTTO BLANCO",2],
    ["Arroz italiano cremoso con la hortaliza naranja del otoño","RISOTTO DE CALABAZA",2],
    ["Pizza italiana con jamón, alcachofa, aceituna y champiñón","PIZZA CAPRICHOSA",2],
    ["Pizza cubierta con una mezcla abundante de lácteos curados","PIZZA CINCO QUESOS",3],
    ["Pizza sin tomate cuya base destaca queso y aceite","PIZZA BLANCA",2],
    ["Pizza inspirada en la conocida salsa romana de pasta","PIZZA CARBONARA",2],
    ["Pan plano italiano horneado con aceite y hierbas","FOCACCIA",2],
    ["Pan fino de Emilia Romaña doblado alrededor de un relleno","PIADINA",2],
    ["Pasta romana con tomate, guanciale y queso pecorino","PASTA AMATRICIANA",2],
    ["Pasta romana contundente con guanciale, huevo y tomate","RIGATONI ALLA ZOZZONA",2],
    ["Pasta con forma de orejitas típica de Apulia","ORECCHIETTE PUGLIESE",2],
    ["Pasta teñida con tinta y acompañada de marisco","PASTA NERO DI SEPIA",3],
    ["Cintas de pasta servidas con ragú de carne","TAGLIATELLE BOLOÑESA",2],
    ["Pasta siciliana con berenjena, tomate y ricotta salada","PASTA ALLA NORMA",2],
    ["Pasta en forma de lazo con sabores mediterráneos","FARFALLE MEDITERRÁNEAS",3],
    ["Ternera fría cubierta con una salsa cremosa de atún","VITELLO TONNATO",2],
    ["Pollo italiano guisado al estilo de los cazadores","POLLO ALLA CACCIATORA",2],
    ["Ternera salteada con una salsa ligera de limón","PICCATA AL LIMONE",2],
    ["Sardinas venecianas marinadas con cebolla agridulce","SARDE IN SAOR",2],
    ["Pez espada con tomate, aceitunas y alcaparras","PEZ ESPADA A LA SICILIANA",2],
    ["Bizcocho italiano de almendra y limón","TORTA ORTIGARA",2],
    ["Bolitas dulces fritas típicas del carnaval italiano","CASTAGNOLE",2],
    ["Galleta veneciana con forma de ese","BUSSOLÀ BURANELLO",1],
    ["Masa festiva napolitana enriquecida con queso y embutido","CASATIELLO NAPOLITANO",2],
    ["Galletas italianas horneadas dos veces","BISCOTTI",2],
    ["Tarta de chocolate y almendra originaria de Capri","TORTA CAPRESE",2],
    ["Pastel de chocolate bajo y húmedo de Ferrara","TORTA TENERINA",2],
    ["Postre de café, mascarpone y bizcochos","TIRAMISÚ",2],
    ["Postre de nata cocida acompañado de salsa dulce","PANNA COTTA",2],
  ];
  const existentes = Array.isArray(global.aletheiaPaneles) ? global.aletheiaPaneles : [];
  const normaliza = texto => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const soluciones = new Set(existentes.map(panel => normaliza(panel.solucion)));
  const nuevos = lote.filter(([, solucion]) => !soluciones.has(normaliza(solucion))).map(([pista, solucion, nivel], index) => Object.freeze({ id: `cocina-it-001-${String(index + 1).padStart(3, "0")}`, categoria, pista, solucion, nivel }));
  global.aletheiaPaneles = Object.freeze([...existentes, ...nuevos]);
})(window);
