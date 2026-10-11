(function (global) {
  "use strict";
  const categoria = "COCINA FRANCESA";
  const lote = [
    ["Paté untuoso preparado con pescado azul","RILLETTE DE SARDINAS",2],
    ["Preparación horneada que crece gracias a claras montadas","SUFLÉ DE QUESO",2],
    ["Crema fría elaborada principalmente con puerro y patata","VICHYSSOISE",2],
    ["Caldo gratinado con pan, cebolla y queso","SOPA DE CEBOLLA",2],
    ["Verduras provenzales guisadas lentamente","RATATOUILLE",2],
    ["Pechuga curada que se corta en lonchas finas","JAMÓN DE PATO",2],
    ["Crema de coliflor vinculada a una favorita de Luis quince","CREMA DUBARRY",2],
    ["Caracoles con mantequilla, ajo y perejil","ESCARGOTS A LA BORGOÑONA",2],
    ["Torta salada de trigo sarraceno típica de Bretaña","GALETTE BRETONA",2],
    ["Ensalada mediterránea con atún, anchoas, huevo y aceitunas","ENSALADA NIZARDA",2],
    ["Tarta salada de Lorena con huevo, nata y beicon","QUICHE LORRAINE",2],
    ["Sándwich caliente de jamón, queso y bechamel","CROQUE MONSIEUR",2],
    ["Gratinado alpino de patata, cebolla, beicon y queso","TARTIFLETTE",2],
    ["Versión del sándwich francés coronada con un huevo","CROQUE MADAME",2],
    ["Bocadillo provenzal que reúne los sabores de una ensalada","PAN BAGNAT",2],
    ["Puré de patata elástico mezclado con abundante queso","ALIGOT",2],
    ["Montañitas de puré doradas con forma de roseta","PATATAS DUQUESA",2],
    ["Guarnición glaseada con mantequilla y un toque de azúcar","ZANAHORIAS VICHY",2],
    ["Salsa blanca de leche espesada con harina y mantequilla","SALSA BECHAMEL",2],
    ["Salsa emulsionada de mantequilla, yema y estragón","SALSA BEARNESA",2],
    ["Emulsión caliente de yema, limón y mantequilla","SALSA HOLANDESA",2],
    ["Pechuga rellena de jamón y queso, empanada y frita","CORDON BLEU",2],
    ["Pescado con salsa de mantequilla, limón y alcaparras","LENGUADO MEUNIÈRE",2],
    ["Estofado de ternera cocinado lentamente con vino tinto","BOEUF BOURGUIGNON",2],
    ["Sopa marinera provenzal originaria de Marsella","BULLABESA",2],
    ["Calamares pequeños guisados con sabores de Provenza","CHIPIRONES A LA PROVENZAL",2],
    ["Pechuga de pato servida rosada y cortada en lonchas","MAGRET DE PATO",2],
    ["Ave guisada con la semilla picante de Dijon","CONEJO A LA MOSTAZA",2],
    ["Pescado mediterráneo preparado al estilo de Marsella","DORADA A LA MARSELLESA",2],
    ["Ave cocinada con tomate y asociada a una victoria napoleónica","POLLO MARENGO",2],
    ["Postre horneado de masa líquida y cerezas","CLAFOUTIS DE CEREZAS",2],
    ["Crema de yema con una fina costra de azúcar quemado","CRÈME BRÛLÉE",2],
    ["Tarta invertida de manzana caramelizada","TARTA TATIN",2],
    ["Fresas maceradas acompañadas de crema","FRESAS ROMANOFF",2],
    ["Tortitas francesas muy finas y flexibles","CRÊPES",2],
    ["Pastel parisino de crema cuajada","FLAN PARISIÉN",1],
    ["Tarta de chocolate y café formada por capas","TARTA ÓPERA",2],
    ["Tarta francesa de pera y crema de almendra","TARTA BOURDALOUE",2],
    ["Bollo festivo que esconde una figura en su interior","GALETTE DE ROIS",2],
    ["Pastel alargado de masa choux relleno de crema","ÉCLAIR",2],
    ["Dulce de coco francés con forma de pequeño montículo","CONGOLAIS",2],
    ["Dulces de almendra unidos de dos en dos con relleno","MACARONS",2],
    ["Pequeños bizcochos bordeleses de corteza caramelizada","CANNELÉS",2],
    ["Bizcochitos franceses con característica forma de concha","MADELEINES",2],
    ["Pastelitos de almendra llamados como quienes manejaban dinero","FINANCIERS",2],
    ["Bollo francés enriquecido con mantequilla y huevo","BRIOCHE",2],
    ["Pastel bretón de masa laminada con mantequilla y azúcar","KOUIGN AMANN",2],
    ["Pan francés largo y crujiente","BAGUETTE",1],
  ];
  const existentes = Array.isArray(global.aletheiaPaneles) ? global.aletheiaPaneles : [];
  const normaliza = texto => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const soluciones = new Set(existentes.map(panel => normaliza(panel.solucion)));
  const nuevos = lote.filter(([, solucion]) => !soluciones.has(normaliza(solucion))).map(([pista, solucion, nivel], index) => Object.freeze({ id: `cocina-fr-001-${String(index + 1).padStart(3, "0")}`, categoria, pista, solucion, nivel }));
  global.aletheiaPaneles = Object.freeze([...existentes, ...nuevos]);
})(window);
