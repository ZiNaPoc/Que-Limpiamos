import type { Cliente, DocumentoDeCliente, EstadoDeDocumento, EstadoDeVerificacion, ResultadoDeOperacion, RevisionDeDocumento } from "../data/tipos";

// Reglas de la validación de documentos de clientes (INE frente y reverso).
// Son las mismas que deberá aplicar el backend cuando exista.

export const LONGITUD_MINIMA_DEL_MOTIVO_DE_RECHAZO = 10;
export const LONGITUD_MAXIMA_DEL_MOTIVO_DE_RECHAZO = 300;

export const SECCIONES_DE_DOCUMENTOS: { estado: EstadoDeDocumento; etiqueta: string }[] = [
  { estado: "Pendiente", etiqueta: "Por validar" },
  { estado: "Aprobado", etiqueta: "Confirmada" },
  { estado: "Rechazado", etiqueta: "Rechazada" },
];

// La INE queda verificada cuando sus dos lados están aprobados. Un lado rechazado pide acción
// del cliente; si no, cualquier lado pendiente la deja por verificar.
export function calcularEstadoDeVerificacion(documentos: DocumentoDeCliente[]): EstadoDeVerificacion {
  if (documentos.some((documento) => documento.estado === "Rechazado")) {
    return "Rechazada";
  }
  if (documentos.length > 0 && documentos.every((documento) => documento.estado === "Aprobado")) {
    return "Verificada";
  }
  return "Por verificar";
}

export function evaluarRevision(documento: DocumentoDeCliente): ResultadoDeOperacion {
  if (documento.estado !== "Pendiente") {
    return { exito: false, mensaje: `Este documento ya fue ${documento.estado === "Aprobado" ? "aprobado" : "rechazado"}.` };
  }
  return { exito: true, mensaje: "" };
}

export function evaluarAprobacion(documento: DocumentoDeCliente): ResultadoDeOperacion {
  const permiso = evaluarRevision(documento);
  if (!permiso.exito) {
    return permiso;
  }
  if (!documento.archivo) {
    return { exito: false, mensaje: "No hay archivo que revisar. Solo puede rechazarse para que el cliente lo envíe de nuevo." };
  }
  return permiso;
}

export function validarMotivoDeRechazo(motivo: string): string | undefined {
  const motivoLimpio = motivo.trim();
  if (motivoLimpio.length === 0) {
    return "Escribe el motivo del rechazo; el cliente lo necesita para corregir su documento.";
  }
  if (motivoLimpio.length < LONGITUD_MINIMA_DEL_MOTIVO_DE_RECHAZO) {
    return `Explica el motivo con al menos ${LONGITUD_MINIMA_DEL_MOTIVO_DE_RECHAZO} caracteres.`;
  }
  if (motivoLimpio.length > LONGITUD_MAXIMA_DEL_MOTIVO_DE_RECHAZO) {
    return `Usa como máximo ${LONGITUD_MAXIMA_DEL_MOTIVO_DE_RECHAZO} caracteres.`;
  }
  return undefined;
}

export function listarDocumentos(clientes: Cliente[]): DocumentoDeCliente[] {
  return clientes.flatMap((cliente) => cliente.documentos);
}

export function contarDocumentosPorEstado(clientes: Cliente[]): Record<EstadoDeDocumento, number> {
  const conteo: Record<EstadoDeDocumento, number> = { Pendiente: 0, Aprobado: 0, Rechazado: 0 };
  for (const documento of listarDocumentos(clientes)) {
    conteo[documento.estado] += 1;
  }
  return conteo;
}

// ───────────── Persistencia ÚNICAMENTE LOCAL ─────────────
// Las decisiones del administrador se guardan en el localStorage de este navegador para que
// sobrevivan a una recarga. NO se envían a ningún servidor ni se guardan en MySQL: otro
// navegador u otro administrador no las verá. Cuando exista el endpoint de revisión, estas dos
// funciones son las que hay que sustituir por las llamadas a la API.

const CLAVE_DE_REVISIONES_LOCALES = "ql-revisiones-de-documentos-v1";

function esRevisionValida(valor: unknown): valor is RevisionDeDocumento {
  if (typeof valor !== "object" || valor === null) {
    return false;
  }
  const revision = valor as Record<string, unknown>;
  const estadoValido = revision.estado === "Aprobado" || revision.estado === "Rechazado";
  return estadoValido && typeof revision.fechaDeRevision === "string" && typeof revision.motivoDeRechazo === "string";
}

export function leerRevisionesLocales(): Record<string, RevisionDeDocumento> {
  try {
    const texto = window.localStorage.getItem(CLAVE_DE_REVISIONES_LOCALES);
    if (!texto) {
      return {};
    }
    const datos: unknown = JSON.parse(texto);
    if (typeof datos !== "object" || datos === null) {
      return {};
    }
    const revisiones: Record<string, RevisionDeDocumento> = {};
    for (const [idDelDocumento, revision] of Object.entries(datos as Record<string, unknown>)) {
      if (esRevisionValida(revision)) {
        revisiones[idDelDocumento] = revision;
      }
    }
    return revisiones;
  } catch {
    return {};
  }
}

export function guardarRevisionesLocales(revisiones: Record<string, RevisionDeDocumento>): boolean {
  try {
    window.localStorage.setItem(CLAVE_DE_REVISIONES_LOCALES, JSON.stringify(revisiones));
    return true;
  } catch {
    return false;
  }
}

// Una revisión guardada solo se aplica a un documento que en los datos de origen sigue pendiente,
// para no sobrescribir decisiones que vengan de otra fuente.
export function aplicarRevisiones(clientes: Cliente[], revisiones: Record<string, RevisionDeDocumento>): Cliente[] {
  return clientes.map((cliente) => {
    const documentos = cliente.documentos.map((documento) => {
      const revision = revisiones[documento.id];
      if (!revision || documento.estado !== "Pendiente") {
        return documento;
      }
      return { ...documento, estado: revision.estado, fechaDeRevision: revision.fechaDeRevision, motivoDeRechazo: revision.motivoDeRechazo };
    });
    return { ...cliente, documentos, verificacion: { estado: calcularEstadoDeVerificacion(documentos) } };
  });
}
