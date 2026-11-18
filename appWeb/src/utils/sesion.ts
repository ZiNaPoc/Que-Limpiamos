import type { Sesion } from "../data/tipos";

// Nombre con el que se guarda la sesión en el navegador
const CLAVE_DE_SESION_EN_EL_NAVEGADOR = "ql-session";

// Lee la sesión guardada (si no hay, devuelve null)
export function leerSesionGuardada(): Sesion | null {
  const sesionGuardada = sessionStorage.getItem(CLAVE_DE_SESION_EN_EL_NAVEGADOR);
  if (!sesionGuardada) {
    return null;
  }
  try {
    return JSON.parse(sesionGuardada) as Sesion;
  } catch {
    return null;
  }
}

// Guarda la sesión al iniciar
export function guardarSesion(sesion: Sesion) {
  sessionStorage.setItem(CLAVE_DE_SESION_EN_EL_NAVEGADOR, JSON.stringify(sesion));
}

// Borra la sesión al cerrar
export function borrarSesion() {
  sessionStorage.removeItem(CLAVE_DE_SESION_EN_EL_NAVEGADOR);
}
