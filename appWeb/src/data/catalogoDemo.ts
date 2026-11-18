import type { ServicioDelCatalogo } from "./tipos";

// Servicios de ejemplo
export const SERVICIOS_DE_DEMOSTRACION: ServicioDelCatalogo[] = [
  { id: "C-01", nombre: "Limpieza regular", descripcion: "Limpieza de mantenimiento que incluye barrer, trapear y aspirar.", precioBase: 400, estado: "Activo" },
  { id: "C-02", nombre: "Limpieza profunda", descripcion: "Limpieza detallada de todas las áreas del espacio, incluyendo zonas de difícil acceso.", precioBase: 600, estado: "Activo" },
  { id: "C-03", nombre: "Limpieza post-obra", descripcion: "Limpieza después de una remodelación o construcción.", precioBase: 650, estado: "Activo" },
  { id: "C-04", nombre: "Limpieza de ventanas", descripcion: "Vidrios interiores y exteriores accesibles.", precioBase: 300, estado: "Activo" },
  { id: "C-05", nombre: "Limpieza de cocina", descripcion: "Cocina completa, campana y estufa.", precioBase: 400, estado: "Activo" },
  { id: "C-06", nombre: "Limpieza de cajonera", descripcion: "Cajones por dentro y por fuera.", precioBase: 150, estado: "Inactivo" },
];
