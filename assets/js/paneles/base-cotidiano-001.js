(function (global) {
  "use strict";

  const lote = [
    ["prueba-277", "COCINA", "Huevos, patatas y el eterno debate de la cebolla", "TORTILLA DE PATATAS"],
    ["prueba-278", "COCINA", "Arroz con pollo, conejo y garrofón", "PAELLA VALENCIANA"],
    ["prueba-279", "COCINA", "Sopa fría de tomate, pepino y pimiento", "GAZPACHO ANDALUZ"],
    ["prueba-280", "COCINA", "Crema fría de tomate con jamón y huevo", "SALMOREJO CORDOBÉS"],
    ["prueba-281", "COCINA", "Garbanzos servidos en tres vuelcos", "COCIDO MADRILEÑO"],
    ["prueba-282", "COCINA", "Alubias con chorizo, morcilla y lacón", "FABADA ASTURIANA"],
    ["prueba-283", "COCINA", "Pulpo con pimentón y aceite sobre madera", "PULPO A LA GALLEGA"],
    ["prueba-284", "COCINA", "Bechamel rebozada con un ibérico dentro", "CROQUETAS DE JAMÓN"],
    ["prueba-285", "COCINA", "Desayuno de masa frita para mojar", "CHURROS CON CHOCOLATE"],
    ["prueba-286", "COCINA", "Postre con costra de azúcar quemado", "CREMA CATALANA"],
    ["prueba-287", "COCINA", "Tapa de patatas con salsa picante", "PATATAS BRAVAS"],
    ["prueba-288", "COCINA", "Marisco en cazuela de barro con ajo y guindilla", "GAMBAS AL AJILLO"],
    ["prueba-289", "COCINA", "Pan duro desmigado y frito, plato de pastores", "MIGAS"],
    ["prueba-290", "COCINA", "Sofrito de hortalizas de La Mancha", "PISTO MANCHEGO"],
    ["prueba-291", "COCINA", "Postre de arroz con canela y limón", "ARROZ CON LECHE"],
    ["prueba-292", "COCINA", "Postre cuajado con caramelo", "FLAN DE HUEVO"],
    ["prueba-293", "COCINA", "Pan empapado en leche, frito y azucarado", "TORRIJAS"],
    ["prueba-294", "COCINA", "Pasta con huevo, queso y guanciale", "ESPAGUETIS A LA CARBONARA"],
    ["prueba-295", "COCINA", "Tomate, mozzarella y albahaca sobre masa", "PIZZA MARGARITA"],
    ["prueba-296", "COCINA", "Capas de pasta con boloñesa y bechamel", "LASAÑA DE CARNE"],
    ["prueba-297", "COCINA", "Arroz avinagrado con pescado crudo", "SUSHI"],
    ["prueba-298", "COCINA", "Salsa mexicana de aguacate", "GUACAMOLE"],
    ["prueba-299", "COCINA", "Pescado marinado en lima, plato de Perú", "CEVICHE PERUANO"],
    ["prueba-300", "COCINA", "Huevos fritos sobre patatas con ibérico", "HUEVOS ROTOS CON JAMÓN"],
    ["prueba-301", "COCINA", "Tapa fría de patata, atún y mayonesa", "ENSALADILLA RUSA"],
    ["prueba-302", "COCINA", "Pescado vasco en salsa emulsionada", "BACALAO AL PIL PIL"],
    ["prueba-303", "COCINA", "Pescado blanco con perejil y almejas", "MERLUZA EN SALSA VERDE"],
    ["prueba-304", "COCINA", "Ave frita con abundantes dientes de ajo", "POLLO AL AJILLO"],
    ["prueba-305", "COCINA", "Sopa castellana con pan, pimentón y huevo", "SOPA DE AJO"],
    ["prueba-306", "COCINA", "Postre cremoso, al estilo vasco o neoyorquino", "TARTA DE QUESO"],
    ["prueba-307", "COCINA", "Se mide con el mismo envase del lácteo", "BIZCOCHO DE YOGUR"],
    ["prueba-308", "COCINA", "Bebida de vino tinto con frutas", "SANGRÍA"],
    ["prueba-309", "COCINA", "Técnica de cocinar dentro de un recipiente con agua caliente", "AL BAÑO MARÍA"],
    ["prueba-310", "COCINA", "Mezcla de huevo, aceite y ajo bien ligada", "ALIOLI"],
    ["prueba-360", "PROFESIONES", "Apaga incendios", "BOMBERO"],
    ["prueba-361", "PROFESIONES", "Viaja al espacio", "ASTRONAUTA"],
    ["prueba-362", "PROFESIONES", "Trabaja la madera", "CARPINTERO"],
    ["prueba-363", "PROFESIONES", "Médico de animales", "VETERINARIO"],
    ["prueba-364", "PROFESIONES", "Diseña edificios", "ARQUITECTO"],
    ["prueba-365", "PROFESIONES", "Hornea pan cada madrugada", "PANADERO"],
    ["prueba-366", "PROFESIONES", "Arregla tuberías y grifos", "FONTANERO"],
    ["prueba-367", "PROFESIONES", "Instala cables y enchufes", "ELECTRICISTA"],
    ["prueba-368", "PROFESIONES", "Corta y peina el cabello", "PELUQUERO"],
    ["prueba-369", "PROFESIONES", "Sirve mesas en un restaurante", "CAMARERO"],
    ["prueba-370", "PROFESIONES", "Cuida plantas y césped", "JARDINERO"],
    ["prueba-371", "PROFESIONES", "Excava en busca de restos antiguos", "ARQUEÓLOGO"],
    ["prueba-372", "PROFESIONES", "Dispensa medicamentos", "FARMACÉUTICO"],
    ["prueba-373", "PROFESIONES", "Reparte la correspondencia", "CARTERO"],
    ["prueba-374", "PROFESIONES", "Vigila a los bañistas", "SOCORRISTA"],
    ["prueba-375", "PROFESIONES", "Atiende a los pasajeros durante el vuelo", "TRIPULANTE DE CABINA"],
    ["prueba-376", "PROFESIONES", "Organiza el tráfico de aviones desde la torre", "CONTROLADOR AÉREO"],
    ["prueba-377", "PROFESIONES", "Repara calzado", "ZAPATERO"],
    ["prueba-430", "EN CASA", "Electrodoméstico que friega los platos", "LAVAVAJILLAS"],
    ["prueba-431", "EN CASA", "Siempre se pierde entre los cojines del sofá", "MANDO A DISTANCIA"],
    ["prueba-432", "EN CASA", "Aparato imprescindible para el desayuno", "CAFETERA"],
    ["prueba-433", "EN CASA", "Recipiente que cocina a presión", "OLLA EXPRÉS"],
    ["prueba-434", "EN CASA", "Tritura y mezcla alimentos", "BATIDORA"],
    ["prueba-435", "EN CASA", "Absorbe el polvo del suelo", "ASPIRADORA"],
    ["prueba-436", "EN CASA", "Quita las arrugas de la ropa", "PLANCHA"],
    ["prueba-437", "EN CASA", "Dora el pan del desayuno", "TOSTADORA"],
    ["prueba-438", "EN CASA", "Suena cuando hay que levantarse", "DESPERTADOR"],
    ["prueba-439", "EN CASA", "Utensilio para abrir una botella de vino", "SACACORCHOS"],
    ["prueba-440", "EN CASA", "Utensilio para abrir conservas", "ABRELATAS"],
    ["prueba-441", "EN CASA", "Donde se seca la ropa al sol", "TENDEDERO"],
    ["prueba-442", "EN CASA", "Caja de tiritas y vendas", "BOTIQUÍN"],
    ["prueba-443", "EN CASA", "Donde se cuelgan los abrigos", "PERCHERO"],
    ["prueba-444", "EN CASA", "Mueble lleno de libros", "ESTANTERÍA"]
  ];

  const existentes = Array.isArray(global.aletheiaPaneles) ? global.aletheiaPaneles : [];
  const ids = new Set(existentes.map(panel => panel.id));
  const nuevos = lote
    .filter(([id]) => !ids.has(id))
    .map(([id, categoria, pista, solucion]) => Object.freeze({ id, categoria, pista, solucion }));

  global.aletheiaPaneles = Object.freeze([...existentes, ...nuevos]);
})(window);

