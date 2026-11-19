import type { Cliente, EstadoDeVerificacion, ResultadoDeOperacion, VerificacionDeIne } from "../data/tipos";

// REGLAS DE LA REVISIÓN DE INE: dicen cuándo se puede aprobar o rechazar. 
// Largo permitido del motivo de rechazo de INE (10 a 300 letras).
export const LONGITUD_MINIMA_DEL_MOTIVO_DE_RECHAZO = 10;
export const LONGITUD_MAXIMA_DEL_MOTIVO_DE_RECHAZO = 300;

// Los 3 estados de la INE con el nombre que se muestra en los filtros.
export const SECCIONES_DE_VERIFICACION: { estado: EstadoDeVerificacion; etiqueta: string }[] = [
  { estado: "Pendiente", etiqueta: "Por validar" },
  { estado: "Verificada", etiqueta: "Aprobada" },
  { estado: "Rechazada", etiqueta: "Rechazada" },
];

// Solo se revisa una INE que está pendiente. Si ya se aprobó o rechazó, no se puede decidir otra vez.
export function evaluarRevisionDeIne(cliente: Cliente): ResultadoDeOperacion {
  if (cliente.verificacion.estado !== "Pendiente") {
    return { exito: false, mensaje: `La INE ya fue ${cliente.verificacion.estado === "Verificada" ? "aprobada" : "rechazada"}.` };
  }
  return { exito: true, mensaje: "" };
}

// Para aprobar deben estar los dos lados de la INE. Si falta uno, solo se puede rechazar para que el cliente lo envíe.
export function evaluarAprobacionDeIne(cliente: Cliente): ResultadoDeOperacion {
  const permiso = evaluarRevisionDeIne(cliente);
  if (!permiso.exito) {
    return permiso;
  }
  if (cliente.documentos.some((documento) => !documento.archivo)) {
    return { exito: false, mensaje: "Falta un lado de la INE. Solo puede rechazarse para que el cliente lo envíe." };
  }
  return permiso;
}

// El motivo de rechazo es obligatorio (10 a 300 letras) porque el cliente lo lee para corregir su INE.
export function validarMotivoDeRechazo(motivo: string): string | undefined {
  const motivoLimpio = motivo.trim();
  if (motivoLimpio.length === 0) {
    return "Escribe el motivo del rechazo; el cliente lo necesita para corregir su INE.";
  }
  if (motivoLimpio.length < LONGITUD_MINIMA_DEL_MOTIVO_DE_RECHAZO) {
    return `Explica el motivo con al menos ${LONGITUD_MINIMA_DEL_MOTIVO_DE_RECHAZO} caracteres.`;
  }
  if (motivoLimpio.length > LONGITUD_MAXIMA_DEL_MOTIVO_DE_RECHAZO) {
    return `Usa como máximo ${LONGITUD_MAXIMA_DEL_MOTIVO_DE_RECHAZO} caracteres.`;
  }
  return undefined;
}

// Cuenta cuántos clientes hay por cada estado de INE. Alimenta las tarjetas y el aviso del Inicio.
export function contarClientesPorVerificacion(clientes: Cliente[]): Record<EstadoDeVerificacion, number> {
  const conteo: Record<EstadoDeVerificacion, number> = { Pendiente: 0, Verificada: 0, Rechazada: 0 };
  for (const cliente of clientes) {
    conteo[cliente.verificacion.estado] += 1;
  }
  return conteo;
}

// Cuando el back guarde la decisión, este bloque completo (leer, guardar y aplicar las revisiones) se puede borrar: el estado de la INE ya vendría dentro de cada cliente.
// Nombre con el que se guardan.
const CLAVE_DE_REVISIONES_LOCALES = "ql-verificaciones-de-ine-v2";

// Revisa que un dato guardado tenga la forma correcta antes de usarlo (por si el navegador tiene datos viejos o dañados).
function esRevisionValida(valor: unknown): valor is VerificacionDeIne {
  if (typeof valor !== "object" || valor === null) {
    return false;
  }
  const revision = valor as Record<string, unknown>;
  const estadoValido = revision.estado === "Verificada" || revision.estado === "Rechazada";
  return estadoValido && typeof revision.fechaDeRevision === "string" && typeof revision.motivoDeRechazo === "string";
}

// Recupera del navegador las revisiones ya hechas. Si algo falla, devuelve vacío.
export function leerRevisionesLocales(): Record<string, VerificacionDeIne> {
  try {
    const texto = window.localStorage.getItem(CLAVE_DE_REVISIONES_LOCALES);
    if (!texto) {
      return {};
    }
    const datos: unknown = JSON.parse(texto);
    if (typeof datos !== "object" || datos === null) {
      return {};
    }
    const revisiones: Record<string, VerificacionDeIne> = {};
    for (const [idDelCliente, revision] of Object.entries(datos as Record<string, unknown>)) {
      if (esRevisionValida(revision)) {
        revisiones[idDelCliente] = revision;
      }
    }
    return revisiones;
  } catch {
    return {};
  }
}

// Guarda las revisiones en el navegador. Devuelve false si no pudo (por ejemplo, almacenamiento lleno o bloqueado).
export function guardarRevisionesLocales(revisiones: Record<string, VerificacionDeIne>): boolean {
  try {
    window.localStorage.setItem(CLAVE_DE_REVISIONES_LOCALES, JSON.stringify(revisiones));
    return true;
  } catch {
    return false;
  }
}

// Pone a cada cliente el resultado de su revisión (solo a los que estaban Pendientes).
export function aplicarRevisiones(clientes: Cliente[], revisiones: Record<string, VerificacionDeIne>): Cliente[] {
  return clientes.map((cliente) => {
    const revision = revisiones[cliente.id];
    if (!revision || cliente.verificacion.estado !== "Pendiente") {
      return cliente;
    }
    return { ...cliente, verificacion: revision };
  });
}
