import type { Sesion } from "../data/tipos";

const CLAVE_DE_SESION_EN_EL_NAVEGADOR = "ql-session";

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

export function guardarSesion(sesion: Sesion) {
  sessionStorage.setItem(CLAVE_DE_SESION_EN_EL_NAVEGADOR, JSON.stringify(sesion));
}

export function borrarSesion() {
  sessionStorage.removeItem(CLAVE_DE_SESION_EN_EL_NAVEGADOR);
}
