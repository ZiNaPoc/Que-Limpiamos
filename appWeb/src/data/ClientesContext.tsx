import { createContext, useContext, useState, type ReactNode } from "react";
import { aplicarRevisiones, evaluarAprobacionDeIne, evaluarRevisionDeIne, guardarRevisionesLocales, leerRevisionesLocales, validarMotivoDeRechazo } from "../utils/documentosDeClientes";
import { crearClientesDeDemostracion } from "./clientesDemo";
import type { Cliente, ResultadoDeOperacion, VerificacionDeIne } from "./tipos";

type ValorDelContextoDeClientes = {
  clientes: Cliente[];
  aprobarIne: (idDelCliente: string) => ResultadoDeOperacion;
  rechazarIne: (idDelCliente: string, motivo: string) => ResultadoDeOperacion;
};

const ClientesContext = createContext<ValorDelContextoDeClientes | null>(null);

// Aviso si el navegador no pudo guardar la revisión
const AVISO_SIN_GUARDADO_LOCAL = " No se pudo guardar en este navegador; se perderá al recargar.";

// Guarda los clientes y sus revisiones de INE
export function ClientesProvider({ children }: { children: ReactNode }) {
  const [clientesDeOrigen] = useState<Cliente[]>(() => crearClientesDeDemostracion(new Date()));
  // Las revisiones se guardan en el navegador
  const [revisiones, setRevisiones] = useState<Record<string, VerificacionDeIne>>(leerRevisionesLocales);
  // Mezcla los clientes con el resultado de su revisión
  const clientes = aplicarRevisiones(clientesDeOrigen, revisiones);

  // Guarda la decisión (aprobada o rechazada)
  function registrarRevision(idDelCliente: string, revision: VerificacionDeIne): boolean {
    const revisionesNuevas = { ...revisiones, [idDelCliente]: revision };
    setRevisiones(revisionesNuevas);
    return guardarRevisionesLocales(revisionesNuevas);
  }

  // Aprobar INE: solo si ya envió frente y reverso
  function aprobarIne(idDelCliente: string): ResultadoDeOperacion {
    const cliente = buscarCliente(clientes, idDelCliente);
    if (!cliente) {
      return { exito: false, mensaje: "No se encontró al cliente." };
    }
    const permiso = evaluarAprobacionDeIne(cliente);
    if (!permiso.exito) {
      return permiso;
    }
    const guardado = registrarRevision(idDelCliente, { estado: "Verificada", fechaDeRevision: new Date().toISOString(), motivoDeRechazo: "" });
    return { exito: true, mensaje: `INE de ${cliente.nombre} aprobada.${guardado ? "" : AVISO_SIN_GUARDADO_LOCAL}` };
  }

  // Rechazar INE: pide un motivo para el cliente
  function rechazarIne(idDelCliente: string, motivo: string): ResultadoDeOperacion {
    const cliente = buscarCliente(clientes, idDelCliente);
    if (!cliente) {
      return { exito: false, mensaje: "No se encontró al cliente." };
    }
    const permiso = evaluarRevisionDeIne(cliente);
    if (!permiso.exito) {
      return permiso;
    }
    const errorDelMotivo = validarMotivoDeRechazo(motivo);
    if (errorDelMotivo) {
      return { exito: false, mensaje: errorDelMotivo };
    }
    const guardado = registrarRevision(idDelCliente, { estado: "Rechazada", fechaDeRevision: new Date().toISOString(), motivoDeRechazo: motivo.trim() });
    return { exito: true, mensaje: `INE de ${cliente.nombre} rechazada.${guardado ? "" : AVISO_SIN_GUARDADO_LOCAL}` };
  }

  return <ClientesContext.Provider value={{ clientes, aprobarIne, rechazarIne }}>{children}</ClientesContext.Provider>;
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
