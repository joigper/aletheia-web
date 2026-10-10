(function (global) {
  "use strict";
  const categoria = "COCINA ITALIANA";
  const lote = [
    ["Guiso siciliano agridulce protagonizado por la berenjena", "CAPONATA SICILIANA"],
    ["Aceitunas rellenas, empanadas y fritas típicas de Las Marcas", "OLIVE ALL'ASCOLANA"],
    ["Bolas sicilianas de arroz rellenas y fritas", "ARANCINI SICILIANOS"],
    ["Sopa italiana de verduras y legumbres", "MINESTRONE"],
    ["Guiso humilde que reúne pasta y garbanzos", "PASTA E CECI"],
    ["Sopa marinera procedente de la costa de Liguria", "BURRIDA LIGURE"],
    ["Sopa toscana de tomate que aprovecha el pan duro", "PAPPA AL POMODORO"],
    ["Berenjenas horneadas en capas con tomate y queso", "BERENJENAS A LA PARMESANA"],
    ["Ensalada italiana de tomate, mozzarella y albahaca", "ENSALADA CAPRESE"],
    ["Ensalada toscana que aprovecha pan, tomate y hortalizas", "PANZANELLA"],
    ["Tarta salada ligur rellena de verduras, queso y huevo", "TORTA PASCUALINA"],
    ["Tortilla italiana enriquecida con varios quesos", "FRITTATA CUATRO QUESOS"],
    ["Arroz cremoso con espárragos y queso de cabra", "RISOTTO DE ESPÁRRAGOS"],
    ["Versión esencial del arroz cremoso italiano", "RISOTTO BLANCO"],
    ["Arroz italiano cremoso con la hortaliza naranja del otoño", "RISOTTO DE CALABAZA"],
    ["Pizza italiana con jamón, alcachofa, aceituna y champiñón", "PIZZA CAPRICHOSA"],
    ["Pizza cubierta con una mezcla abundante de lácteos curados", "PIZZA CINCO QUESOS"],
    ["Pizza sin tomate cuya base destaca queso y aceite", "PIZZA BLANCA"],
    ["Pizza inspirada en la conocida salsa romana de pasta", "PIZZA CARBONARA"],
    ["Pan plano italiano horneado con aceite y hierbas", "FOCACCIA"],
    ["Pan fino de Emilia Romaña doblado alrededor de un relleno", "PIADINA"],
    ["Pasta romana con tomate, guanciale y queso pecorino", "PASTA AMATRICIANA"],
    ["Pasta romana contundente con guanciale, huevo y tomate", "RIGATONI ALLA ZOZZONA"],
    ["Pasta con forma de orejitas típica de Apulia", "ORECCHIETTE PUGLIESE"],
    ["Pasta teñida con tinta y acompañada de marisco", "PASTA NERO DI SEPIA"],
    ["Cintas de pasta servidas con ragú de carne", "TAGLIATELLE BOLOÑESA"],
    ["Pasta siciliana con berenjena, tomate y ricotta salada", "PASTA ALLA NORMA"],
    ["Pasta en forma de lazo con sabores mediterráneos", "FARFALLE MEDITERRÁNEAS"],
    ["Ternera fría cubierta con una salsa cremosa de atún", "VITELLO TONNATO"],
    ["Pollo italiano guisado al estilo de los cazadores", "POLLO ALLA CACCIATORA"],
    ["Ternera salteada con una salsa ligera de limón", "PICCATA AL LIMONE"],
    ["Sardinas venecianas marinadas con cebolla agridulce", "SARDE IN SAOR"],
    ["Pez espada con tomate, aceitunas y alcaparras", "PEZ ESPADA A LA SICILIANA"],
    ["Bizcocho italiano de almendra y limón", "TORTA ORTIGARA"],
    ["Bolitas dulces fritas típicas del carnaval italiano", "CASTAGNOLE"],
    ["Galleta veneciana con forma de ese", "BUSSOLÀ BURANELLO"],
    ["Masa festiva napolitana enriquecida con queso y embutido", "CASATIELLO NAPOLITANO"],
    ["Galletas italianas horneadas dos veces", "BISCOTTI"],
    ["Tarta de chocolate y almendra originaria de Capri", "TORTA CAPRESE"],
    ["Pastel de chocolate bajo y húmedo de Ferrara", "TORTA TENERINA"],
    ["Postre de café, mascarpone y bizcochos", "TIRAMISÚ"],
    ["Postre de nata cocida acompañado de salsa dulce", "PANNA COTTA"]
  ];
  const existentes = Array.isArray(global.aletheiaPaneles) ? global.aletheiaPaneles : [];
  const normaliza = texto => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const soluciones = new Set(existentes.map(panel => normaliza(panel.solucion)));
  const nuevos = lote.filter(([, solucion]) => !soluciones.has(normaliza(solucion))).map(([pista, solucion], index) => Object.freeze({ id: `cocina-it-001-${String(index + 1).padStart(3, "0")}`, categoria, pista, solucion }));
  global.aletheiaPaneles = Object.freeze([...existentes, ...nuevos]);
})(window);
