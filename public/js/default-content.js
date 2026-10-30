// Contenido inicial del sitio. El panel de administrador guarda una copia
// editable en Firestore (documento site/content) que reemplaza estos valores.

const u = (id, w = 700) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${w}&q=80`;

export const DEFAULT_CONTENT = {
  aviso: "",

  especiales: [
    { nombre: "Arroz con pollo", desc: "Arroz amarillo con pollo, verduras y el sazón de la casa.", precio: 10000, img: u("photo-1714383611437-485d97141913"), disponible: true },
    { nombre: "Pernil sudado o frito", desc: "Pernil de cerdo jugoso, sudado en salsa criolla o bien frito.", precio: 10000, img: u("photo-1608500218882-986df81d55fc"), disponible: true },
    { nombre: "Bagre sudado", desc: "Bagre en salsa criolla, como se prepara en casa.", precio: 10000, img: u("photo-1548704087-b11dab0fbec0"), disponible: true },
    { nombre: "Chuletas", desc: "Chuleta de cerdo apanada, dorada y crocante.", precio: 10000, img: u("photo-1553108850-0c04e29adf36"), disponible: true },
    { nombre: "Carne en bistec", desc: "Carne de res en bistec con cebolla y tomate.", precio: 10000, img: u("photo-1573225342350-16731dd9bf3d"), disponible: true },
  ],

  corrientes: [
    { nombre: "Alitas apanadas", desc: "Alitas de pollo apanadas y crocantes.", precio: 9000, img: u("photo-1585703900468-13c7a978ad86"), disponible: true },
    { nombre: "Carne molida", desc: "Carne molida guisada con hogao.", precio: 8000, img: u("photo-1617904116128-f55dd979f087"), disponible: true },
    { nombre: "Callo sudado", desc: "Callo tierno en guiso casero.", precio: 8000, img: u("photo-1787465195117-231e63fe1b47"), disponible: true },
    { nombre: "Carne sudada", desc: "Carne de res sudada con papa.", precio: 8000, img: u("photo-1708782344137-21c48d98dfcc"), disponible: true },
    { nombre: "Cerdo sudado", desc: "Cerdo en salsa criolla, suave y bien sazonado.", precio: 8000, img: u("photo-1608500218861-01091cdc501e"), disponible: true },
    { nombre: "Hígado sudado", desc: "Hígado de res en salsa con cebolla.", precio: 8000, img: u("photo-1723511413901-99439b957bbf"), disponible: true },
    { nombre: "Pechuga sudada", desc: "Pechuga de pollo en guiso casero.", precio: 8000, img: u("photo-1764304733301-3a9f335f0c67"), disponible: true },
    { nombre: "Albóndigas", desc: "Albóndigas de carne en salsa de tomate.", precio: 8000, img: u("photo-1565086869529-8c7802cca7a0"), disponible: true },
  ],

  adicionales: [
    { nombre: "Proteína", precio: 4000 },
    { nombre: "Proteína especial", precio: 6000 },
    { nombre: "Principio", precio: 2000 },
    { nombre: "Sopa", precio: 3000 },
    { nombre: "Arroz", precio: 2000 },
    { nombre: "Ensalada", precio: 1000 },
    { nombre: "Limonada", precio: 1000 },
  ],

  incluye: ["Arroz", "Ensalada", "Guiso o grano", "Sopa del día", "Limonada", "Carbohidrato del día"],

  planes: [
    { icono: "📦", titulo: "Plan Semanal", desc: "5 almuerzos por semana, uno de ellos especial.", precio: 40000, periodo: "semana", destacado: false },
    { icono: "🎒", titulo: "Plan Estudiantil", desc: "Almuerzo de lunes a viernes, un almuerzo especial por semana.", precio: 160000, periodo: "mes", destacado: true },
    { icono: "⭐", titulo: "Estudiantil Plus", desc: "Almuerzo de lunes a domingo, un almuerzo especial por semana.", precio: 230000, periodo: "mes", destacado: false },
  ],

  extras: [
    { icono: "👥", titulo: "Descuento para grupos", desc: "10% de descuento en pedidos para grupos de 10 personas o más." },
    { icono: "🎉", titulo: "Eventos y celebraciones", desc: "Menús especiales para cumpleaños, despedidas o reuniones. Consulta disponibilidad." },
  ],

  // dias: 0 = domingo … 6 = sábado
  horarios: [
    { etiqueta: "Lunes a sábado", dias: [1, 2, 3, 4, 5, 6], abre: "07:00", cierra: "15:00" },
    { etiqueta: "Domingos y festivos", dias: [0], abre: "08:00", cierra: "15:00" },
  ],
};
