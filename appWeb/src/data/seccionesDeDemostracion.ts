import type { IdDeSeccionDeDatos, SeccionDeDatos } from "./tipos";

export const DATOS_DE_SECCIONES: Record<IdDeSeccionDeDatos, SeccionDeDatos> = {
  clientes: {
    titulo: "Clientes",
    subtitulo: "Clientes registrados y validación de documentos.",
    columnas: [
      { clave: "id", etiqueta: "ID" },
      { clave: "usuario", etiqueta: "Usuario" },
      { clave: "correo", etiqueta: "Correo" },
      { clave: "estado", etiqueta: "Documentos" },
    ],
    filas: [
      { id: "U-201", usuario: "@marina", correo: "marina@ejemplo.com", estado: "Verificado" },
      { id: "U-202", usuario: "@carlos", correo: "carlos@ejemplo.com", estado: "Por validar" },
      { id: "U-203", usuario: "@lucia", correo: "lucia@ejemplo.com", estado: "Verificado" },
      { id: "U-204", usuario: "@andrea", correo: "andrea@ejemplo.com", estado: "Verificado" },
    ],
  },
  resenas: {
    titulo: "Reseñas",
    subtitulo: "Calificaciones y comentarios que forman la reputación de cada trabajador.",
    columnas: [
      { clave: "id", etiqueta: "ID" },
      { clave: "usuario", etiqueta: "Usuario" },
      { clave: "trabajador", etiqueta: "Trabajador" },
      { clave: "calificacion", etiqueta: "Calificación" },
      { clave: "comentario", etiqueta: "Comentario" },
    ],
    filas: [
      { id: "V-31", usuario: "@sofia", trabajador: "Rosa Chan", calificacion: "★★★★★", comentario: "Muy puntual y detallista." },
      { id: "V-30", usuario: "@mateo", trabajador: "Luis May", calificacion: "★★★★☆", comentario: "Buen trabajo en las ventanas." },
      { id: "V-29", usuario: "@valeria", trabajador: "Elena Pech", calificacion: "★★★★★", comentario: "La casa quedó impecable." },
    ],
  },
};
