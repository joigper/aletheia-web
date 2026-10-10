(function (global) {
  "use strict";
  const categoria = "COCINA FRANCESA";
  const lote = [
    ["Paté untuoso preparado con pescado azul", "RILLETTE DE SARDINAS"],
    ["Preparación horneada que crece gracias a claras montadas", "SUFLÉ DE QUESO"],
    ["Crema fría elaborada principalmente con puerro y patata", "VICHYSSOISE"],
    ["Caldo gratinado con pan, cebolla y queso", "SOPA DE CEBOLLA"],
    ["Verduras provenzales guisadas lentamente", "RATATOUILLE"],
    ["Pechuga curada que se corta en lonchas finas", "JAMÓN DE PATO"],
    ["Crema de coliflor vinculada a una favorita de Luis quince", "CREMA DUBARRY"],
    ["Caracoles con mantequilla, ajo y perejil", "ESCARGOTS A LA BORGOÑONA"],
    ["Torta salada de trigo sarraceno típica de Bretaña", "GALETTE BRETONA"],
    ["Ensalada mediterránea con atún, anchoas, huevo y aceitunas", "ENSALADA NIZARDA"],
    ["Tarta salada de Lorena con huevo, nata y beicon", "QUICHE LORRAINE"],
    ["Sándwich caliente de jamón, queso y bechamel", "CROQUE MONSIEUR"],
    ["Gratinado alpino de patata, cebolla, beicon y queso", "TARTIFLETTE"],
    ["Versión del sándwich francés coronada con un huevo", "CROQUE MADAME"],
    ["Bocadillo provenzal que reúne los sabores de una ensalada", "PAN BAGNAT"],
    ["Puré de patata elástico mezclado con abundante queso", "ALIGOT"],
    ["Montañitas de puré doradas con forma de roseta", "PATATAS DUQUESA"],
    ["Guarnición glaseada con mantequilla y un toque de azúcar", "ZANAHORIAS VICHY"],
    ["Salsa blanca de leche espesada con harina y mantequilla", "SALSA BECHAMEL"],
    ["Salsa emulsionada de mantequilla, yema y estragón", "SALSA BEARNESA"],
    ["Emulsión caliente de yema, limón y mantequilla", "SALSA HOLANDESA"],
    ["Pechuga rellena de jamón y queso, empanada y frita", "CORDON BLEU"],
    ["Pescado con salsa de mantequilla, limón y alcaparras", "LENGUADO MEUNIÈRE"],
    ["Estofado de ternera cocinado lentamente con vino tinto", "BOEUF BOURGUIGNON"],
    ["Sopa marinera provenzal originaria de Marsella", "BULLABESA"],
    ["Calamares pequeños guisados con sabores de Provenza", "CHIPIRONES A LA PROVENZAL"],
    ["Pechuga de pato servida rosada y cortada en lonchas", "MAGRET DE PATO"],
    ["Ave guisada con la semilla picante de Dijon", "CONEJO A LA MOSTAZA"],
    ["Pescado mediterráneo preparado al estilo de Marsella", "DORADA A LA MARSELLESA"],
    ["Ave cocinada con tomate y asociada a una victoria napoleónica", "POLLO MARENGO"],
    ["Postre horneado de masa líquida y cerezas", "CLAFOUTIS DE CEREZAS"],
    ["Crema de yema con una fina costra de azúcar quemado", "CRÈME BRÛLÉE"],
    ["Tarta invertida de manzana caramelizada", "TARTA TATIN"],
    ["Fresas maceradas acompañadas de crema", "FRESAS ROMANOFF"],
    ["Tortitas francesas muy finas y flexibles", "CRÊPES"],
    ["Pastel parisino de crema cuajada", "FLAN PARISIÉN"],
    ["Tarta de chocolate y café formada por capas", "TARTA ÓPERA"],
    ["Tarta francesa de pera y crema de almendra", "TARTA BOURDALOUE"],
    ["Bollo festivo que esconde una figura en su interior", "GALETTE DE ROIS"],
    ["Pastel alargado de masa choux relleno de crema", "ÉCLAIR"],
    ["Dulce de coco francés con forma de pequeño montículo", "CONGOLAIS"],
    ["Dulces de almendra unidos de dos en dos con relleno", "MACARONS"],
    ["Pequeños bizcochos bordeleses de corteza caramelizada", "CANNELÉS"],
    ["Bizcochitos franceses con característica forma de concha", "MADELEINES"],
    ["Pastelitos de almendra llamados como quienes manejaban dinero", "FINANCIERS"],
    ["Bollo francés enriquecido con mantequilla y huevo", "BRIOCHE"],
    ["Pastel bretón de masa laminada con mantequilla y azúcar", "KOUIGN AMANN"],
    ["Pan francés largo y crujiente", "BAGUETTE"]
  ];
  const existentes = Array.isArray(global.aletheiaPaneles) ? global.aletheiaPaneles : [];
  const normaliza = texto => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const soluciones = new Set(existentes.map(panel => normaliza(panel.solucion)));
  const nuevos = lote.filter(([, solucion]) => !soluciones.has(normaliza(solucion))).map(([pista, solucion], index) => Object.freeze({ id: `cocina-fr-001-${String(index + 1).padStart(3, "0")}`, categoria, pista, solucion }));
  global.aletheiaPaneles = Object.freeze([...existentes, ...nuevos]);
})(window);
