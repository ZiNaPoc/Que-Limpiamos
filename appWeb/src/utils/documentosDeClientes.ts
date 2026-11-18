import type { Cliente, EstadoDeVerificacion, ResultadoDeOperacion, VerificacionDeIne } from "../data/tipos";

export const LONGITUD_MINIMA_DEL_MOTIVO_DE_RECHAZO = 10;
export const LONGITUD_MAXIMA_DEL_MOTIVO_DE_RECHAZO = 300;

export const SECCIONES_DE_VERIFICACION: { estado: EstadoDeVerificacion; etiqueta: string }[] = [
  { estado: "Pendiente", etiqueta: "Por validar" },
  { estado: "Verificada", etiqueta: "Aprobada" },
  { estado: "Rechazada", etiqueta: "Rechazada" },
];

// Solo se revisa una INE que está pendiente
export function evaluarRevisionDeIne(cliente: Cliente): ResultadoDeOperacion {
  if (cliente.verificacion.estado !== "Pendiente") {
    return { exito: false, mensaje: `La INE ya fue ${cliente.verificacion.estado === "Verificada" ? "aprobada" : "rechazada"}.` };
  }
  return { exito: true, mensaje: "" };
}

// Para aprobar deben estar los dos lados de la INE
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

// El motivo de rechazo debe tener un largo válido
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

export function contarClientesPorVerificacion(clientes: Cliente[]): Record<EstadoDeVerificacion, number> {
  const conteo: Record<EstadoDeVerificacion, number> = { Pendiente: 0, Verificada: 0, Rechazada: 0 };
  for (const cliente of clientes) {
    conteo[cliente.verificacion.estado] += 1;
  }
  return conteo;
}

const CLAVE_DE_REVISIONES_LOCALES = "ql-verificaciones-de-ine-v2";

function esRevisionValida(valor: unknown): valor is VerificacionDeIne {
  if (typeof valor !== "object" || valor === null) {
    return false;
  }
  const revision = valor as Record<string, unknown>;
  const estadoValido = revision.estado === "Verificada" || revision.estado === "Rechazada";
  return estadoValido && typeof revision.fechaDeRevision === "string" && typeof revision.motivoDeRechazo === "string";
}

// Recupera del navegador las revisiones ya hechas
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

// Guarda las revisiones en el navegador
export function guardarRevisionesLocales(revisiones: Record<string, VerificacionDeIne>): boolean {
  try {
    window.localStorage.setItem(CLAVE_DE_REVISIONES_LOCALES, JSON.stringify(revisiones));
    return true;
  } catch {
    return false;
  }
}

// Pone a cada cliente el resultado de su revisión
export function aplicarRevisiones(clientes: Cliente[], revisiones: Record<string, VerificacionDeIne>): Cliente[] {
  return clientes.map((cliente) => {
    const revision = revisiones[cliente.id];
    if (!revision || cliente.verificacion.estado !== "Pendiente") {
      return cliente;
    }
    return { ...cliente, verificacion: revision };
  });
}
