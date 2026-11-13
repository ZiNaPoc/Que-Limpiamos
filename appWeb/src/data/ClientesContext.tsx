import { createContext, useContext, useState, type ReactNode } from "react";
import { aplicarRevisiones, evaluarAprobacion, evaluarRevision, guardarRevisionesLocales, leerRevisionesLocales, validarMotivoDeRechazo } from "../utils/documentosDeClientes";
import { crearClientesDeDemostracion } from "./clientesDemo";
import type { Cliente, DocumentoDeCliente, ResultadoDeOperacion, RevisionDeDocumento } from "./tipos";

// Los clientes se registran desde la app móvil (nombre, teléfono, correo y su INE por ambos lados).
// El administrador no edita sus datos —el cliente lo hace desde «Mi perfil»—; solo revisa cada
// documento y lo aprueba o lo rechaza con un motivo.
//
// IMPORTANTE: mientras no exista el backend de esta función, las decisiones se guardan solo en el
// localStorage de este navegador (ver utils/documentosDeClientes.ts). No llegan al servidor.

type ValorDelContextoDeClientes = {
  clientes: Cliente[];
  aprobarDocumento: (idDelDocumento: string) => ResultadoDeOperacion;
  rechazarDocumento: (idDelDocumento: string, motivo: string) => ResultadoDeOperacion;
};

const ClientesContext = createContext<ValorDelContextoDeClientes | null>(null);

const AVISO_SIN_GUARDADO_LOCAL = " No se pudo guardar en este navegador; se perderá al recargar.";

export function ClientesProvider({ children }: { children: ReactNode }) {
  const [clientesDeOrigen] = useState<Cliente[]>(() => crearClientesDeDemostracion(new Date()));
  const [revisiones, setRevisiones] = useState<Record<string, RevisionDeDocumento>>(leerRevisionesLocales);
  const clientes = aplicarRevisiones(clientesDeOrigen, revisiones);

  function buscarDocumento(idDelDocumento: string): { cliente: Cliente; documento: DocumentoDeCliente } | undefined {
    for (const cliente of clientes) {
      const documento = cliente.documentos.find((documentoBuscado) => documentoBuscado.id === idDelDocumento);
      if (documento) {
        return { cliente, documento };
      }
    }
    return undefined;
  }

  function registrarRevision(idDelDocumento: string, revision: RevisionDeDocumento): boolean {
    const revisionesNuevas = { ...revisiones, [idDelDocumento]: revision };
    setRevisiones(revisionesNuevas);
    return guardarRevisionesLocales(revisionesNuevas);
  }

  function aprobarDocumento(idDelDocumento: string): ResultadoDeOperacion {
    const encontrado = buscarDocumento(idDelDocumento);
    if (!encontrado) {
      return { exito: false, mensaje: "No se encontró el documento." };
    }
    const permiso = evaluarAprobacion(encontrado.documento);
    if (!permiso.exito) {
      return permiso;
    }
    const guardado = registrarRevision(idDelDocumento, { estado: "Aprobado", fechaDeRevision: new Date().toISOString(), motivoDeRechazo: "" });
    return { exito: true, mensaje: `${encontrado.documento.tipo} de ${encontrado.cliente.nombre} aprobado.${guardado ? "" : AVISO_SIN_GUARDADO_LOCAL}` };
  }

  function rechazarDocumento(idDelDocumento: string, motivo: string): ResultadoDeOperacion {
    const encontrado = buscarDocumento(idDelDocumento);
    if (!encontrado) {
      return { exito: false, mensaje: "No se encontró el documento." };
    }
    const permiso = evaluarRevision(encontrado.documento);
    if (!permiso.exito) {
      return permiso;
    }
    const errorDelMotivo = validarMotivoDeRechazo(motivo);
    if (errorDelMotivo) {
      return { exito: false, mensaje: errorDelMotivo };
    }
    const guardado = registrarRevision(idDelDocumento, { estado: "Rechazado", fechaDeRevision: new Date().toISOString(), motivoDeRechazo: motivo.trim() });
    return { exito: true, mensaje: `${encontrado.documento.tipo} de ${encontrado.cliente.nombre} rechazado.${guardado ? "" : AVISO_SIN_GUARDADO_LOCAL}` };
  }

  return <ClientesContext.Provider value={{ clientes, aprobarDocumento, rechazarDocumento }}>{children}</ClientesContext.Provider>;
}

export function useClientes(): ValorDelContextoDeClientes {
  const valor = useContext(ClientesContext);
  if (!valor) {
    throw new Error("useClientes debe usarse dentro de ClientesProvider");
  }
  return valor;
}

export function buscarCliente(clientes: Cliente[], idDelCliente: string): Cliente | undefined {
  return clientes.find((cliente) => cliente.id === idDelCliente);
}

export function nombreDelCliente(clientes: Cliente[], idDelCliente: string): string {
  return buscarCliente(clientes, idDelCliente)?.nombre ?? `Cliente ${idDelCliente}`;
}
