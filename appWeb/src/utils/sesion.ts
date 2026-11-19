import type { Sesion } from "../data/tipos";

// Nombre con el que se guarda la sesión en sessionStorage (memoria del navegador que se borra al cerrar la pestaña).
// Esto es solo para que la web recuerde quién entró; la seguridad real está en la cookie que pone el servidor.
// Si el servidor responde 401 en cualquier petición, hay que llamar a borrarSesion() y volver al login.
const CLAVE_DE_SESION_EN_EL_NAVEGADOR = "ql-session";

// Lee la sesión guardada. Si no hay o está dañada, devuelve null (= nadie ha iniciado sesión).
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

// Guarda la sesión cuando el login fue correcto.
export function guardarSesion(sesion: Sesion) {
  sessionStorage.setItem(CLAVE_DE_SESION_EN_EL_NAVEGADOR, JSON.stringify(sesion));
}

// Borra la sesión al cerrar sesión.
export function borrarSesion() {
  sessionStorage.removeItem(CLAVE_DE_SESION_EN_EL_NAVEGADOR);
}
