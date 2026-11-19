import { createContext, useContext, useState, type ReactNode } from "react";
import { aplicarRevisiones, evaluarAprobacionDeIne, evaluarRevisionDeIne, guardarRevisionesLocales, leerRevisionesLocales, validarMotivoDeRechazo } from "../utils/documentosDeClientes";
import { crearClientesDeDemostracion } from "./clientesDemo";
import type { Cliente, ResultadoDeOperacion, VerificacionDeIne } from "./tipos";

// Lo que ofrece este almacén: la lista de clientes y las 2 acciones para revisar su INE.
type ValorDelContextoDeClientes = {
  clientes: Cliente[];
  aprobarIne: (idDelCliente: string) => ResultadoDeOperacion;
  rechazarIne: (idDelCliente: string, motivo: string) => ResultadoDeOperacion;
};

const ClientesContext = createContext<ValorDelContextoDeClientes | null>(null);

// Texto que se agrega al mensaje si el navegador no pudo guardar la revisión.
const AVISO_SIN_GUARDADO_LOCAL = " No se pudo guardar en este navegador; se perderá al recargar.";

// Guarda los clientes y el resultado de la revisión de su INE.
// Los clientes se registran y suben su INE desde la app móvil; aquí el administrador la aprueba o la rechaza.
// la lista vendría de los usuarios con rol CLIENTE junto con sus documentos, y aprobar/rechazar actualizaría el estado de verificación.// Al revisar, conviene guardar la fecha de revisión y quién la hizo, además del motivo.
// Si dos administradores revisan al mismo tiempo, el segundo debe recibir un error (409) en vez de pisar la decisión del primero.
export function ClientesProvider({ children }: { children: ReactNode }) {
  // Clientes tal como llegan de origen (de demostración). Esta lista no se modifica.
  const [clientesDeOrigen] = useState<Cliente[]>(() => crearClientesDeDemostracion(new Date()));
  // Decisiones ya tomadas por el administrador (por id de cliente). Se recuperan del navegador al abrir.
  const [revisiones, setRevisiones] = useState<Record<string, VerificacionDeIne>>(leerRevisionesLocales);
  // Lista final que usan las pantallas: los clientes de origen con la decisión del administrador puesta encima.
  const clientes = aplicarRevisiones(clientesDeOrigen, revisiones);

  // Guarda la decisión (aprobada o rechazada). Devuelve false si el navegador no pudo guardarla.
  function registrarRevision(idDelCliente: string, revision: VerificacionDeIne): boolean {
    const revisionesNuevas = { ...revisiones, [idDelCliente]: revision };
    setRevisiones(revisionesNuevas);
    return guardarRevisionesLocales(revisionesNuevas);
  }

  // aprobar INE solo si está Pendiente y ya envió frente y reverso. El cliente verá "Verificada" en su app.
  function aprobarIne(idDelCliente: string): ResultadoDeOperacion {
    const cliente = buscarCliente(clientes, idDelCliente);
    if (!cliente) {
      return { exito: false, mensaje: "No se encontró al cliente." };
    }
    const permiso = evaluarAprobacionDeIne(cliente);
    if (!permiso.exito) {
      return permiso;
    }
    // Aquí se haría la petición de aprobar y se esperaría su respuesta antes de armar el mensaje.
    const guardado = registrarRevision(idDelCliente, { estado: "Verificada", fechaDeRevision: new Date().toISOString(), motivoDeRechazo: "" });
    return { exito: true, mensaje: `INE de ${cliente.nombre} aprobada.${guardado ? "" : AVISO_SIN_GUARDADO_LOCAL}` };
  }

  // rechazar INE solo si está Pendiente y con un motivo válido. El cliente verá el motivo y tendrá que enviarla de nuevo.
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
    // Aquí se mandaría el rechazo junto con el motivo (ya validado y sin espacios de los lados).
    const guardado = registrarRevision(idDelCliente, { estado: "Rechazada", fechaDeRevision: new Date().toISOString(), motivoDeRechazo: motivo.trim() });
    return { exito: true, mensaje: `INE de ${cliente.nombre} rechazada.${guardado ? "" : AVISO_SIN_GUARDADO_LOCAL}` };
  }

  return <ClientesContext.Provider value={{ clientes, aprobarIne, rechazarIne }}>{children}</ClientesContext.Provider>;
}

// Hook para usar los clientes en cualquier pantalla (solo funciona dentro de ClientesProvider).
export function useClientes(): ValorDelContextoDeClientes {
  const valor = useContext(ClientesContext);
  if (!valor) {
    throw new Error("useClientes debe usarse dentro de ClientesProvider");
  }
  return valor;
}

// Busca un cliente por su id (devuelve undefined si no existe).
export function buscarCliente(clientes: Cliente[], idDelCliente: string): Cliente | undefined {
  return clientes.find((cliente) => cliente.id === idDelCliente);
}

// Nombre del cliente por su id; si no existe, muestra "Cliente <id>" para que la pantalla no se rompa.
export function nombreDelCliente(clientes: Cliente[], idDelCliente: string): string {
  return buscarCliente(clientes, idDelCliente)?.nombre ?? `Cliente ${idDelCliente}`;
}
