import { useState, type ReactNode } from "react";
import { useAhora } from "../../hooks/useAhora";
import { buscarCliente, useClientes } from "../../data/ClientesContext";
import { useSolicitudes } from "../../hooks/useSolicitudes";
import { useTrabajadores } from "../../data/TrabajadoresContext";
import { buscarTrabajador } from "../../data/trabajadores";
import type { EtapaDeSolicitud, Navegar, ResultadoDeOperacion, Solicitud } from "../../data/tipos";
import { obtenerClaveDeFecha } from "../../utils/fechas";
import { describirHorario, describirTiempoDesdeCreacion, formatearFechaNumerica, formatearHora } from "../../utils/formato";
import {
  describirCancelacion,
  describirCambioDeTrabajador,
  describirConfirmacion,
  describirEstadoDeLaAsignacion,
  describirFinalizacion,
  evaluarCambioDeTrabajador,
  evaluarCancelacion,
  evaluarConfirmacion,
  evaluarFinalizacion,
  LONGITUD_MAXIMA_DEL_MOTIVO,
  listarTrabajadoresConDisponibilidad,
  obtenerEtapa,
  puedeAtender,
  validarCambioDeTrabajador,
  validarMotivoDeCancelacion,
  type DisponibilidadDelTrabajador,
} from "../../utils/reglasDeSolicitudes";
import { AvisoTemporal } from "../comunes/AvisoTemporal";
import { CampoDeFormulario } from "../comunes/CampoDeFormulario";
import { Icono } from "../comunes/Icono";
import { InsigniaDeEstado } from "../comunes/Insignias";
import { VentanaDeConfirmacion, VentanaModal } from "../comunes/VentanasModales";

function FilaDeInformacion({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-beige px-4 py-3">
      <dt className="text-xs font-bold uppercase tracking-wider text-slate">{etiqueta}</dt>
      <dd className="mt-1 text-sm font-bold text-navy">{children}</dd>
    </div>
  );
}

// Pasos que se muestran en la barra de seguimiento
const PASOS_DEL_SEGUIMIENTO: EtapaDeSolicitud[] = ["Solicitud enviada", "Asignando colaborador", "Servicio confirmado", "Servicio finalizado"];

// Barra de pasos: marca lo completado y el paso actual
function SeguimientoDeLaSolicitud({ etapa }: { etapa: EtapaDeSolicitud }) {
  if (etapa === "Cancelada") {
    return null;
  }
  const pasoActual = PASOS_DEL_SEGUIMIENTO.indexOf(etapa);
  return (
    <ol aria-label="Seguimiento de la solicitud" className="mt-6 grid gap-2 sm:grid-cols-4">
      {PASOS_DEL_SEGUIMIENTO.map((paso, indice) => {
        const completado = indice < pasoActual || etapa === "Servicio finalizado";
        const esActual = indice === pasoActual && etapa !== "Servicio finalizado";
        return (
          <li key={paso} aria-current={esActual ? "step" : undefined} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold ${esActual ? "bg-navy text-white" : completado ? "bg-moss/40 text-storm" : "bg-white text-slate"}`}>
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs ${esActual ? "bg-white/20" : completado ? "bg-sage text-white" : "bg-beige"}`}>
              {completado ? <Icono nombre="palomita" className="h-4 w-4" /> : indice + 1}
            </span>
            {paso}
          </li>
        );
      })}
    </ol>
  );
}

// Ventana para escribir el motivo de la cancelación
function VentanaDeCancelacion({ solicitud, onCerrar, onContinuar }: { solicitud: Solicitud; onCerrar: () => void; onContinuar: (motivo: string) => void }) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");

  function handleContinuar() {
    const errorDelMotivo = validarMotivoDeCancelacion(motivo);
    if (errorDelMotivo) {
      setError(errorDelMotivo);
      return;
    }
    onContinuar(motivo);
  }

  return (
    <VentanaModal idDelTitulo="titulo-de-cancelacion" onCerrar={onCerrar}>
      <h2 id="titulo-de-cancelacion" className="text-2xl font-extrabold text-navy">
        Cancelar {solicitud.id}
      </h2>
      <p className="mt-2 text-sm text-slate">Úsalo solo cuando el servicio no pueda realizarse (por ejemplo, el colaborador ya no puede asistir y no hay reemplazo). Se libera la asignación y el cliente deberá solicitar de nuevo desde la app.</p>
      <div className="mt-5">
        <CampoDeFormulario id="motivo-de-cancelacion" etiqueta="Motivo (lo verá el cliente)" error={error}>
          <textarea id="motivo-de-cancelacion" rows={4} maxLength={LONGITUD_MAXIMA_DEL_MOTIVO} value={motivo} onChange={(evento) => setMotivo(evento.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? "motivo-de-cancelacion-error" : undefined} className="field resize-y" />
        </CampoDeFormulario>
        <p className="mt-1.5 text-right text-xs text-slate">
          {motivo.trim().length}/{LONGITUD_MAXIMA_DEL_MOTIVO}
        </p>
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <button onClick={onCerrar} className="btn btn-quiet">
          Volver
        </button>
        <button onClick={handleContinuar} className="btn btn-primary">
          Revisar cancelación
        </button>
      </div>
    </VentanaModal>
  );
}

// Texto de cada colaborador en la lista, con sus avisos
function describirOpcion(disponibilidad: DisponibilidadDelTrabajador): string {
  const { trabajador, estaInactivo, estaOcupado, fueraDeHorario, tieneLaEspecialidad } = disponibilidad;
  const notas: string[] = [];
  if (estaInactivo) {
    notas.push("inactivo");
  } else if (fueraDeHorario) {
    notas.push("fuera de su horario");
  } else if (estaOcupado) {
    notas.push("ocupado a esa hora");
  }
  if (!tieneLaEspecialidad) {
    notas.push("sin esta especialidad");
  }
  return `${trabajador.id} · ${trabajador.nombre}${notas.length > 0 ? ` (${notas.join(", ")})` : ""}`;
}

// Acciones que piden confirmación antes de ejecutarse
type AccionPorConfirmar = { tipo: "asignacion" } | { tipo: "confirmacion" } | { tipo: "finalizacion" } | { tipo: "cancelacion"; motivo: string };

type DetalleDeSolicitudProps = {
  solicitud: Solicitud;
  onVolver: () => void;
  onNavegar: Navegar;
};

// Detalle de una solicitud: aquí el administrador avanza el flujo
export function DetalleDeSolicitud({ solicitud, onVolver, onNavegar }: DetalleDeSolicitudProps) {
  const { solicitudes, cambiarTrabajadorAsignado, confirmarServicio, finalizarServicio, cancelarSolicitud } = useSolicitudes();
  const { trabajadores } = useTrabajadores();
  const { clientes } = useClientes();
  const ahora = useAhora();
  const claveDeHoy = obtenerClaveDeFecha(ahora);
  // Estado de la pantalla: edición, ventanas abiertas y aviso final
  const [estaEditandoAsignacion, setEstaEditandoAsignacion] = useState(false);
  const [idDelTrabajadorElegido, setIdDelTrabajadorElegido] = useState(solicitud.idDelTrabajador ?? "");
  const [errorDeAsignacion, setErrorDeAsignacion] = useState("");
  const [ventanaDeCancelacionAbierta, setVentanaDeCancelacionAbierta] = useState(false);
  const [accionPorConfirmar, setAccionPorConfirmar] = useState<AccionPorConfirmar | null>(null);
  const [aviso, setAviso] = useState<ResultadoDeOperacion | null>(null);

  const etapa = obtenerEtapa(solicitud);
  const cliente = buscarCliente(clientes, solicitud.idDelCliente);
  const nombreDelCliente = cliente ? cliente.nombre : `Cliente ${solicitud.idDelCliente}`;
  const trabajadorAsignado = buscarTrabajador(trabajadores, solicitud.idDelTrabajador);
  // Permisos según las reglas: definen qué botones se pueden usar
  const permisoDeAsignacion = evaluarCambioDeTrabajador(solicitud);
  const permisoDeConfirmacion = evaluarConfirmacion(solicitud, trabajadores, ahora);
  const permisoDeFinalizacion = evaluarFinalizacion(solicitud, ahora);
  const permisoDeCancelacion = evaluarCancelacion(solicitud);
  const trabajadoresConDisponibilidad = listarTrabajadoresConDisponibilidad(solicitudes, trabajadores, solicitud);
  const colaboradorSinEspecialidad = trabajadorAsignado && !trabajadorAsignado.especialidades.includes(solicitud.idDelServicio);
  const idDelTrabajadorNuevo = idDelTrabajadorElegido || null;

  // Razón por la que todavía no se puede avanzar al siguiente paso
  let motivoParaNoAvanzar = "";
  if (etapa === "Asignando colaborador" && !permisoDeConfirmacion.exito) {
    motivoParaNoAvanzar = permisoDeConfirmacion.mensaje;
  } else if (etapa === "Servicio confirmado" && !permisoDeFinalizacion.exito) {
    motivoParaNoAvanzar = permisoDeFinalizacion.mensaje;
  }

  // Abre el selector de colaborador
  function comenzarEdicionDeAsignacion() {
    setIdDelTrabajadorElegido(solicitud.idDelTrabajador ?? "");
    setErrorDeAsignacion("");
    setEstaEditandoAsignacion(true);
  }

  // Valida el cambio y pide confirmación
  function pedirConfirmacionDeAsignacion() {
    if (idDelTrabajadorNuevo === solicitud.idDelTrabajador) {
      setEstaEditandoAsignacion(false);
      setAviso({ exito: true, mensaje: "No había cambios por aplicar." });
      return;
    }
    const validacion = validarCambioDeTrabajador(solicitud, idDelTrabajadorNuevo, solicitudes, trabajadores);
    if (!validacion.exito) {
      setErrorDeAsignacion(validacion.mensaje);
      return;
    }
    setAccionPorConfirmar({ tipo: "asignacion" });
  }

  // Ejecuta la acción confirmada y muestra el resultado
  function ejecutarAccion() {
    if (!accionPorConfirmar) {
      return;
    }
    let resultado: ResultadoDeOperacion;
    if (accionPorConfirmar.tipo === "asignacion") {
      resultado = cambiarTrabajadorAsignado(solicitud.id, idDelTrabajadorNuevo);
      if (resultado.exito) {
        setEstaEditandoAsignacion(false);
      } else {
        setErrorDeAsignacion(resultado.mensaje);
      }
    } else if (accionPorConfirmar.tipo === "confirmacion") {
      resultado = confirmarServicio(solicitud.id);
    } else if (accionPorConfirmar.tipo === "finalizacion") {
      resultado = finalizarServicio(solicitud.id);
    } else {
      resultado = cancelarSolicitud(solicitud.id, accionPorConfirmar.motivo);
    }
    setAccionPorConfirmar(null);
    setAviso(resultado);
  }

  // Texto de la ventana de confirmación según la acción
  let confirmacion: { titulo: string; lineas: string[]; etiqueta: string } | null = null;
  if (accionPorConfirmar?.tipo === "asignacion") {
    confirmacion = { titulo: solicitud.idDelTrabajador ? "¿Cambiar el colaborador?" : "¿Asignar este colaborador?", lineas: describirCambioDeTrabajador(solicitud, idDelTrabajadorNuevo, trabajadores), etiqueta: "Sí, guardar" };
  } else if (accionPorConfirmar?.tipo === "confirmacion") {
    confirmacion = { titulo: "¿Confirmar el servicio?", lineas: describirConfirmacion(solicitud, trabajadores), etiqueta: "Sí, confirmar" };
  } else if (accionPorConfirmar?.tipo === "finalizacion") {
    confirmacion = { titulo: "¿Marcar el servicio como finalizado?", lineas: describirFinalizacion(), etiqueta: "Sí, finalizar" };
  } else if (accionPorConfirmar?.tipo === "cancelacion") {
    confirmacion = { titulo: "¿Cancelar la solicitud?", lineas: describirCancelacion(solicitud, accionPorConfirmar.motivo, claveDeHoy), etiqueta: "Sí, cancelar" };
  }

  return (
    <div>
      <button onClick={onVolver} className="btn btn-quiet">
        <Icono nombre="volver" className="h-4 w-4" />
        Volver a solicitudes
      </button>

      <header className="mt-8 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">{solicitud.id}</span>
        <InsigniaDeEstado estado={etapa} />
        <h1 className="w-full text-4xl font-extrabold text-navy">{solicitud.servicio}</h1>
        <p className="w-full text-sm text-slate">
          Solicitada el {formatearFechaNumerica(solicitud.fechaDeCreacion)} · {describirTiempoDesdeCreacion(solicitud.fechaDeCreacion, ahora)}
        </p>
      </header>

      {/* Seguimiento de la solicitud paso a paso */}
      <SeguimientoDeLaSolicitud etapa={etapa} />

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Datos del cliente */}
        <section aria-labelledby="titulo-del-cliente" className="surface leaf-r h-fit p-7 sm:p-9 lg:col-span-5">
          <p className="text-xs font-bold uppercase tracking-widest text-lagoon">Cliente</p>
          <h2 id="titulo-del-cliente" className="mt-1 text-3xl font-extrabold text-navy">
            {nombreDelCliente}
          </h2>
          {cliente && (
            <dl className="mt-4 space-y-2">
              <FilaDeInformacion etiqueta="Teléfono">{cliente.telefono}</FilaDeInformacion>
              <FilaDeInformacion etiqueta="Correo">
                <span className="break-all">{cliente.correo}</span>
              </FilaDeInformacion>
              <FilaDeInformacion etiqueta="Verificación del INE">
                <InsigniaDeEstado estado={cliente.verificacion.estado} />
              </FilaDeInformacion>
            </dl>
          )}
          {!cliente && <p className="mt-4 rounded-2xl bg-moon p-4 text-sm text-clay">No se encontró el registro del cliente {solicitud.idDelCliente}.</p>}
          {cliente && (
            <button onClick={() => onNavegar("clientes", { idDelCliente: cliente.id })} className="btn btn-quiet mt-5">
              <Icono nombre="usuario" className="h-4 w-4" />
              Ver perfil del cliente
            </button>
          )}
        </section>

        {/* Servicio y asignación del colaborador */}
        <section aria-labelledby="titulo-del-servicio-acordado" className="surface leaf h-fit p-7 sm:p-9 lg:col-span-7">
          <h2 id="titulo-del-servicio-acordado" className="text-2xl font-extrabold text-navy">
            Servicio y colaborador
          </h2>

          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            <FilaDeInformacion etiqueta="Servicio seleccionado">{solicitud.servicio}</FilaDeInformacion>
            <FilaDeInformacion etiqueta="Fecha y horario solicitados">
              {formatearFechaNumerica(solicitud.fechaProgramada)} · {formatearHora(solicitud.fechaProgramada)}
              <span className="mt-0.5 block text-xs font-semibold text-slate">{describirHorario(solicitud.fechaProgramada, claveDeHoy)}</span>
            </FilaDeInformacion>
            <FilaDeInformacion etiqueta="Elección del colaborador">{solicitud.modoDeEleccion === "Cliente" ? "Selección manual" : "Asignación automática"}</FilaDeInformacion>
            {!estaEditandoAsignacion && trabajadorAsignado && (
              <FilaDeInformacion etiqueta={etapa === "Cancelada" ? "Colaborador antes de cancelar" : "Colaborador asignado"}>
                <span>
                  {trabajadorAsignado.id} · {trabajadorAsignado.nombre}
                </span>
                <span className="mt-1 block text-xs font-semibold text-slate">{describirEstadoDeLaAsignacion(solicitud)}</span>
              </FilaDeInformacion>
            )}
          </dl>

          {colaboradorSinEspecialidad && !estaEditandoAsignacion && (
            <p className="mt-3 flex items-start gap-2 rounded-2xl bg-moon p-3 text-xs text-clay">
              <Icono nombre="alerta" className="h-4 w-4 text-ochre" />
              {trabajadorAsignado.nombre} no tiene «{solicitud.servicio}» entre sus especialidades.
            </p>
          )}

          {solicitud.cancelacion && (
            <div className="mt-3 rounded-2xl bg-mist/70 p-4 text-sm text-storm">
              <p className="font-bold text-navy">Cancelada por {solicitud.cancelacion.canceladaPor === "Cliente" ? "el cliente" : "la administración"}</p>
              <p className="mt-1">{solicitud.cancelacion.motivo}</p>
              <p className="mt-1 text-xs text-slate">
                {formatearFechaNumerica(solicitud.cancelacion.fecha)} · {formatearHora(solicitud.cancelacion.fecha)}
              </p>
            </div>
          )}

          {estaEditandoAsignacion && (
            <div className="fade mt-4 space-y-4">
              <CampoDeFormulario id="trabajador" etiqueta="Colaborador" error={errorDeAsignacion}>
                {/* Lista de colaboradores, con los disponibles primero */}
                <select id="trabajador" value={idDelTrabajadorElegido} onChange={(evento) => setIdDelTrabajadorElegido(evento.target.value)} aria-invalid={Boolean(errorDeAsignacion)} aria-describedby={errorDeAsignacion ? "trabajador-error" : "trabajador-ayuda"} className="field cursor-pointer">
                  <option value="">Sin asignar</option>
                  {trabajadoresConDisponibilidad.map((disponibilidad) => (
                    <option key={disponibilidad.trabajador.id} value={disponibilidad.trabajador.id} disabled={!puedeAtender(disponibilidad) && disponibilidad.trabajador.id !== solicitud.idDelTrabajador}>
                      {describirOpcion(disponibilidad)}
                    </option>
                  ))}
                </select>
              </CampoDeFormulario>
              <p id="trabajador-ayuda" className="text-xs text-slate">
                Solo se pueden elegir colaboradores activos que trabajan a esa hora y no tienen otro servicio cerca. La fecha y la hora no cambian.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setEstaEditandoAsignacion(false);
                    setErrorDeAsignacion("");
                  }}
                  className="btn btn-quiet"
                >
                  Cancelar
                </button>
                <button onClick={pedirConfirmacionDeAsignacion} className="btn btn-primary">
                  Guardar
                </button>
              </div>
            </div>
          )}

          {!estaEditandoAsignacion && (
            <div className="fade">
              {/* Muestra por qué no se puede avanzar */}
              {motivoParaNoAvanzar && (
                <p className="mt-4 flex items-start gap-2 rounded-2xl bg-moon p-3 text-xs text-clay">
                  <Icono nombre="alerta" className="h-4 w-4 text-ochre" />
                  {motivoParaNoAvanzar}
                </p>
              )}
              {etapa === "Servicio confirmado" && (
                <p className="mt-4 flex items-start gap-2 rounded-2xl bg-moss/30 p-3 text-xs text-storm">
                  <Icono nombre="candado" className="h-4 w-4 text-lagoon" />
                  El servicio está confirmado: el colaborador ya no se puede cambiar. Si no puede realizarse, cancélalo.
                </p>
              )}
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                {/* Cancelar la solicitud */}
                {permisoDeCancelacion.exito && (
                  <button onClick={() => setVentanaDeCancelacionAbierta(true)} className="btn btn-quiet text-err">
                    <Icono nombre="prohibido" className="h-4 w-4" />
                    Cancelar solicitud
                  </button>
                )}
                {/* Asignar o cambiar colaborador */}
                {permisoDeAsignacion.exito && (
                  <button onClick={comenzarEdicionDeAsignacion} className={`btn ${etapa === "Solicitud enviada" ? "btn-primary" : "btn-quiet"}`}>
                    <Icono nombre="editar" className="h-4 w-4" />
                    {solicitud.idDelTrabajador ? "Cambiar colaborador" : "Asignar colaborador"}
                  </button>
                )}
                {/* Confirmar el servicio */}
                {etapa === "Asignando colaborador" && (
                  <button onClick={() => setAccionPorConfirmar({ tipo: "confirmacion" })} disabled={!permisoDeConfirmacion.exito} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50">
                    <Icono nombre="palomita" className="h-4 w-4" />
                    Confirmar servicio
                  </button>
                )}
                {/* Finalizar el servicio */}
                {etapa === "Servicio confirmado" && (
                  <button onClick={() => setAccionPorConfirmar({ tipo: "finalizacion" })} disabled={!permisoDeFinalizacion.exito} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50">
                    <Icono nombre="palomita" className="h-4 w-4" />
                    Marcar como finalizado
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {ventanaDeCancelacionAbierta && (
        <VentanaDeCancelacion
          solicitud={solicitud}
          onCerrar={() => setVentanaDeCancelacionAbierta(false)}
          onContinuar={(motivo) => {
            setVentanaDeCancelacionAbierta(false);
            setAccionPorConfirmar({ tipo: "cancelacion", motivo });
          }}
        />
      )}
      {/* Ventana de confirmación */}
      {confirmacion && <VentanaDeConfirmacion titulo={confirmacion.titulo} lineasDeCambios={confirmacion.lineas} etiquetaDeConfirmar={confirmacion.etiqueta} onConfirmar={ejecutarAccion} onCancelar={() => setAccionPorConfirmar(null)} />}
      {/* Resultado de la acción */}
      {aviso && <AvisoTemporal aviso={aviso} onTerminar={() => setAviso(null)} />}
    </div>
  );
}
