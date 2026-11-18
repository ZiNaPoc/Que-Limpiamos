// Secciones del menú de la landing
export const SECCIONES_DE_LA_LANDING = [
  { id: "inicio", etiqueta: "Inicio" },
  { id: "quienes-somos", etiqueta: "¿Quiénes somos?" },
  { id: "app", etiqueta: "App" },
];

export const IDS_DE_SECCIONES_DE_LA_LANDING = SECCIONES_DE_LA_LANDING.map((seccion) => seccion.id);

export const IMAGENES = {
  portada: "",
  quienesSomos: "",
  descargaDeLaApp: "",
  inicioDeSesion: "",
  objetivos: ["", "", "", ""],
  rotacionDeAcceso: ["", ""],
};

export const MARCA = {
  logo: "/logo.png",
  titulo: "/titulo.png",
};

// Enlace de descarga de la app móvil
export const ENLACE_DE_DESCARGA: string = "";

// Cuenta de prueba para entrar al panel
export const CUENTA_DE_DEMOSTRACION = {
  correo: "admin@quelimpiamos.demo",
  telefono: "9981234567",
  contrasena: "Limpieza2026",
  nombre: "Admin",
  nombreDeUsuario: "admin",
};
