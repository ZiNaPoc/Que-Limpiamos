import { useState, type ReactNode } from "react";
import { useAhora } from "../../hooks/useAhora";
import { buscarCliente, useClientes } from "../../data/ClientesContext";
import { useReportes } from "../../data/ReportesContext";
import { useSolicitudes } from "../../data/SolicitudesContext";
import { useTrabajadores } from "../../data/TrabajadoresContext";
import { buscarTrabajador } from "../../data/trabajadores";
import type { Navegar, ResultadoDeOperacion, Solicitud } from "../../data/tipos";
import { obtenerClaveDeFecha } from "../../utils/fechas";
import { describirHorarioDeTrabajo } from "../../utils/horarios";
import { describirHorario, describirTiempoDesdeCreacion, formatearFechaNumerica, formatearHora, formatearPrecio } from "../../utils/formato";
import {
  describirAcuerdoDePrecio,
  describirCancelacion,
  describirCambioDeTrabajador,
  describirEstadoDeLaAsignacion,
  evaluarCambioDeTrabajador,
  evaluarCancelacion,
  evaluarRegistroDeAcuerdoDePrecio,
  LONGITUD_MAXIMA_DEL_MOTIVO,
  listarTrabajadoresConDisponibilidad,
  validarAcuerdoDePrecio,
  validarCambioDeTrabajador,
  validarMotivoDeCancelacion,
  type DatosDeAcuerdoDePrecio,
  type DisponibilidadDelTrabajador,
  type ErroresDelAcuerdoDePrecio,
} from "../../utils/reglasDeSolicitudes";
import { AvisoTemporal } from "../comunes/AvisoTemporal";
import { CampoDeFormulario } from "../comunes/CampoDeFormulario";
import { Icono } from "../comunes/Icono";
import { InsigniaDeEstado, Puntuacion } from "../comunes/Insignias";
import { VentanaDeConfirmacion, VentanaModal } from "../comunes/VentanasModales";
import { EvidenciasDelLugar } from "./EvidenciasDelLugar";
import { MapaDeUbicacion } from "./MapaDeUbicacion";

function FilaDeInformacion({ etiqueta, children, claseDeFondo = "bg-beige" }: { etiqueta: string; children: ReactNode; claseDeFondo?: string }) {
  return (
    <div className={`rounded-2xl px-4 py-3 ${claseDeFondo}`}>
      <dt className="text-xs font-bold uppercase tracking-wider text-slate">{etiqueta}</dt>
      <dd className="mt-1 text-sm font-bold text-navy">{children}</dd>
    </div>
  );
}

const DATOS_DE_ACUERDO_VACIOS: DatosDeAcuerdoDePrecio = { precio: "", aceptadoPorElCliente: false, aceptadoPorElTrabajador: false };

type VentanaDeAcuerdoDePrecioProps = {
  solicitud: Solicitud;
  nombreDelCliente: string;
  nombreDelTrabajador: string;
  onCerrar: () => void;
  onRegistrar: (datos: DatosDeAcuerdoDePrecio) => void;
};

function VentanaDeAcuerdoDePrecio({ solicitud, nombreDelCliente, nombreDelTrabajador, onCerrar, onRegistrar }: VentanaDeAcuerdoDePrecioProps) {
  const [datos, setDatos] = useState<DatosDeAcuerdoDePrecio>(DATOS_DE_ACUERDO_VACIOS);
  const [errores, setErrores] = useState<ErroresDelAcuerdoDePrecio>({});

  function handleRegistrar() {
    const erroresEncontrados = validarAcuerdoDePrecio(solicitud, datos);
    setErrores(erroresEncontrados);
    if (Object.keys(erroresEncontrados).length > 0) {
      return;
    }
    onRegistrar(datos);
  }

  let precioAcordadoActual = "Pendiente de confirmar";
  if (solicitud.acuerdoDePrecio) {
    precioAcordadoActual = formatearPrecio(solicitud.acuerdoDePrecio.precio);
  }

  return (
    <VentanaModal idDelTitulo="titulo-del-acuerdo" onCerrar={onCerrar}>
      <h2 id="titulo-del-acuerdo" className="text-2xl font-extrabold text-navy">
        Registrar precio final
      </h2>
      <p className="mt-2 text-sm text-slate">El precio final lo confirma el colaborador al revisar el servicio. Registra solo un precio que el cliente y el colaborador ya aceptaron; el panel no fija precios.</p>
      <dl className="mt-5 grid grid-cols-2 gap-2">
        <FilaDeInformacion etiqueta="Precio estimado">{formatearPrecio(solicitud.precioEstimado)}</FilaDeInformacion>
        <FilaDeInformacion etiqueta="Precio final">{precioAcordadoActual}</FilaDeInformacion>
      </dl>
      <div className="mt-5 space-y-4">
        <CampoDeFormulario id="precio-acordado" etiqueta="Precio confirmado (MXN)" error={errores.precio}>
          <input id="precio-acordado" type="number" inputMode="decimal" min="1" step="10" value={datos.precio} onChange={(evento) => setDatos({ ...datos, precio: evento.target.value })} aria-invalid={Boolean(errores.precio)} aria-describedby={errores.precio ? "precio-acordado-error" : undefined} className="field" />
        </CampoDeFormulario>
        <fieldset aria-describedby={errores.aceptaciones ? "aceptaciones-error" : undefined}>
          <legend className="label">Aceptación de las partes</legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-beige px-4 py-3 text-sm text-storm">
            <input type="checkbox" checked={datos.aceptadoPorElTrabajador} onChange={(evento) => setDatos({ ...datos, aceptadoPorElTrabajador: evento.target.checked })} className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-navy" />
            {nombreDelTrabajador} (colaborador) confirmó este precio.
          </label>
          <label className="mt-2 flex cursor-pointer items-start gap-3 rounded-2xl bg-beige px-4 py-3 text-sm text-storm">
            <input type="checkbox" checked={datos.aceptadoPorElCliente} onChange={(evento) => setDatos({ ...datos, aceptadoPorElCliente: evento.target.checked })} className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-navy" />
            {nombreDelCliente} (cliente) aceptó este precio.
          </label>
          {errores.aceptaciones && (
            <p id="aceptaciones-error" role="alert" className="mt-1.5 text-xs font-semibold text-err">
              {errores.aceptaciones}
            </p>
          )}
        </fieldset>
      </div>
      <div className="mt-7 flex justify-end gap-3">
        <button onClick={onCerrar} className="btn btn-quiet">
          Volver
        </button>
        <button onClick={handleRegistrar} className="btn btn-primary">
          Revisar
        </button>
      </div>
    </VentanaModal>
  );
}

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
      <p className="mt-2 text-sm text-slate">
        Úsalo solo cuando el servicio no pueda realizarse (por ejemplo, el colaborador confirmado ya no puede asistir). Con la cancelación se libera la asignación. Si el cliente aún necesita la limpieza, deberá reagendarla desde la app.
      </p>
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

function describirOpcion({ trabajador, estaOcupado, fueraDeHorario, tieneLaEspecialidad }: DisponibilidadDelTrabajador): string {
  const notas: string[] = [];
  if (fueraDeHorario) {
    notas.push("fuera de su horario");
  } else if (estaOcupado) {
    notas.push("ocupado a esa hora");
  }
  if (!tieneLaEspecialidad) {
    notas.push("sin esta especialidad");
  }
  return `${trabajador.id} · ${trabajador.nombre}${notas.length > 0 ? ` (${notas.join(", ")})` : ""}`;
}

type DetalleDeSolicitudProps = {
  solicitud: Solicitud;
  onVolver: () => void;
  onNavegar: Navegar;
};

export function DetalleDeSolicitud({ solicitud, onVolver, onNavegar }: DetalleDeSolicitudProps) {
  const { solicitudes, cambiarTrabajadorAsignado, registrarAcuerdoDePrecio, cancelarSolicitud } = useSolicitudes();
  const { trabajadores } = useTrabajadores();
  const { clientes } = useClientes();
  const { reportes } = useReportes();
  const ahora = useAhora();
  const claveDeHoy = obtenerClaveDeFecha(ahora);
  const [estaEditandoAsignacion, setEstaEditandoAsignacion] = useState(false);
  const [idDelTrabajadorElegido, setIdDelTrabajadorElegido] = useState(solicitud.idDelTrabajador ?? "");
  const [errorDeAsignacion, setErrorDeAsignacion] = useState("");
  const [confirmacionDeAsignacionAbierta, setConfirmacionDeAsignacionAbierta] = useState(false);
  const [ventanaDeAcuerdoAbierta, setVentanaDeAcuerdoAbierta] = useState(false);
  const [acuerdoPorConfirmar, setAcuerdoPorConfirmar] = useState<DatosDeAcuerdoDePrecio | null>(null);
  const [ventanaDeCancelacionAbierta, setVentanaDeCancelacionAbierta] = useState(false);
  const [motivoPorConfirmar, setMotivoPorConfirmar] = useState<string | null>(null);
  const [aviso, setAviso] = useState<ResultadoDeOperacion | null>(null);

  const cliente = buscarCliente(clientes, solicitud.idDelCliente);
  const nombreDelCliente = cliente ? cliente.nombre : `Cliente ${solicitud.idDelCliente}`;
  const trabajadorAsignado = buscarTrabajador(trabajadores, solicitud.idDelTrabajador);
  const reportesDeLaSolicitud = reportes.filter((reporte) => reporte.idDeSolicitud === solicitud.id);
  const permisoDeAsignacion = evaluarCambioDeTrabajador(solicitud);
  const permisoDeAcuerdo = evaluarRegistroDeAcuerdoDePrecio(solicitud);
  const permisoDeCancelacion = evaluarCancelacion(solicitud);
  const trabajadoresConDisponibilidad = listarTrabajadoresConDisponibilidad(solicitudes, trabajadores, solicitud);
  const motivosDeBloqueo = [permisoDeAsignacion, permisoDeAcuerdo].filter((permiso) => !permiso.exito).map((permiso) => permiso.mensaje);
  const motivosSinRepetir = motivosDeBloqueo.filter((motivo, indice) => motivosDeBloqueo.indexOf(motivo) === indice);
  const colaboradorSinEspecialidad = trabajadorAsignado && !trabajadorAsignado.especialidades.includes(solicitud.idDelServicio);

  let idDelTrabajadorNuevo: string | null = null;
  if (idDelTrabajadorElegido) {
    idDelTrabajadorNuevo = idDelTrabajadorElegido;
  }

  function comenzarEdicionDeAsignacion() {
    setIdDelTrabajadorElegido(solicitud.idDelTrabajador ?? "");
    setErrorDeAsignacion("");
    setEstaEditandoAsignacion(true);
  }

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
    setConfirmacionDeAsignacionAbierta(true);
  }

  function aplicarAsignacion() {
    const resultado = cambiarTrabajadorAsignado(solicitud.id, idDelTrabajadorNuevo);
    setConfirmacionDeAsignacionAbierta(false);
    if (resultado.exito) {
      setEstaEditandoAsignacion(false);
    } else {
      setErrorDeAsignacion(resultado.mensaje);
    }
    setAviso(resultado);
  }

  function aplicarAcuerdo() {
    if (!acuerdoPorConfirmar) {
      return;
    }
    setAviso(registrarAcuerdoDePrecio(solicitud.id, acuerdoPorConfirmar));
    setAcuerdoPorConfirmar(null);
  }

  function aplicarCancelacionConfirmada() {
    if (motivoPorConfirmar === null) {
      return;
    }
    setAviso(cancelarSolicitud(solicitud.id, motivoPorConfirmar));
    setMotivoPorConfirmar(null);
  }

  let textoDelBotonDeAsignacion = "Cambiar colaborador";
  if (!solicitud.idDelTrabajador) {
    textoDelBotonDeAsignacion = "Asignar colaborador";
  }

  return (
    <div>
      <button onClick={onVolver} className="btn btn-quiet">
        <Icono nombre="volver" className="h-4 w-4" />
        Volver a solicitudes
      </button>

      <header className="mt-8 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">{solicitud.id}</span>
        <InsigniaDeEstado estado={solicitud.estado} />
        <h1 className="w-full text-4xl font-extrabold text-navy">{solicitud.servicio}</h1>
        <p className="w-full text-sm text-slate">
          Solicitada el {formatearFechaNumerica(solicitud.fechaDeCreacion)} · {describirTiempoDesdeCreacion(solicitud.fechaDeCreacion, ahora)}
        </p>
      </header>

      <section aria-label="Cliente y ubicación" className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="leaf overflow-hidden shadow-card lg:col-span-7">
          <MapaDeUbicacion latitud={solicitud.latitud} longitud={solicitud.longitud} direccion={solicitud.direccion} />
        </div>
        <div className="surface leaf-r p-7 lg:col-span-5">
          <p className="text-xs font-bold uppercase tracking-widest text-lagoon">Cliente</p>
          <h2 className="mt-1 text-3xl font-extrabold text-navy">{nombreDelCliente}</h2>
          {cliente && (
            <dl className="mt-4 space-y-2">
              <FilaDeInformacion etiqueta="Teléfono">{cliente.telefono}</FilaDeInformacion>
              <FilaDeInformacion etiqueta="Correo">
                <span className="break-all">{cliente.correo}</span>
              </FilaDeInformacion>
              <FilaDeInformacion etiqueta="INE">
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
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          <section aria-labelledby="titulo-de-descripcion" className="surface leaf-r p-7 sm:p-9">
            <h2 id="titulo-de-descripcion" className="text-2xl font-extrabold text-navy">
              Lo que pidió el cliente
            </h2>
            <dl className="mt-4 space-y-2">
              <FilaDeInformacion etiqueta="Dirección">{solicitud.direccion}</FilaDeInformacion>
            </dl>
            <p className="mt-2 rounded-2xl bg-beige p-5 text-sm leading-relaxed text-storm">{solicitud.descripcion}</p>
            <EvidenciasDelLugar key={solicitud.id} solicitud={solicitud} />
          </section>

          {solicitud.estado === "Realizado" && (
            <section aria-labelledby="titulo-de-calificacion" className="surface leaf p-7 sm:p-9">
              <h2 id="titulo-de-calificacion" className="text-2xl font-extrabold text-navy">
                Calificación del cliente
              </h2>
              {solicitud.calificacion && (
                <div className="mt-4 rounded-2xl bg-beige p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Puntuacion valor={solicitud.calificacion.puntuacion} tamano="h-6 w-6" />
                    <span className="font-display text-xl font-extrabold text-navy">{solicitud.calificacion.puntuacion} de 5</span>
                  </div>
                  {solicitud.calificacion.comentario && <p className="mt-3 text-sm text-storm">“{solicitud.calificacion.comentario}”</p>}
                  <p className="mt-2 text-xs text-slate">{formatearFechaNumerica(solicitud.calificacion.fecha)}</p>
                </div>
              )}
              {!solicitud.calificacion && <p className="mt-4 rounded-2xl bg-beige p-5 text-sm text-slate">El cliente todavía no califica el servicio. La app se lo recuerda en «Avisos».</p>}
            </section>
          )}

          {reportesDeLaSolicitud.length > 0 && (
            <section aria-labelledby="titulo-de-reportes-de-la-solicitud" className="surface leaf-r p-7 sm:p-9">
              <h2 id="titulo-de-reportes-de-la-solicitud" className="text-2xl font-extrabold text-navy">
                Reportes del cliente
              </h2>
              <ul className="mt-4 space-y-2">
                {reportesDeLaSolicitud.map((reporte) => (
                  <li key={reporte.folio}>
                    <button onClick={() => onNavegar("reportes", { folioDeReporte: reporte.folio })} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-beige px-4 py-3 text-left transition duration-300 hover:bg-sky/40">
                      <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">{reporte.folio}</span>
                      <span className="min-w-0 flex-1 truncate text-sm text-storm">{reporte.descripcion}</span>
                      <InsigniaDeEstado estado={reporte.estado} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <section aria-labelledby="titulo-del-servicio-acordado" className="surface leaf h-fit p-7 sm:p-9 lg:col-span-5">
          <h2 id="titulo-del-servicio-acordado" className="text-2xl font-extrabold text-navy">
            Servicio y colaborador
          </h2>

          <dl className="mt-4 space-y-2">
            <FilaDeInformacion etiqueta="Fecha y hora (elegidas por el cliente)">
              {formatearFechaNumerica(solicitud.fechaProgramada)} · {formatearHora(solicitud.fechaProgramada)}
              <span className="mt-0.5 block text-xs font-semibold text-slate">{describirHorario(solicitud.fechaProgramada, claveDeHoy)}</span>
            </FilaDeInformacion>
            <div className="grid grid-cols-2 gap-2">
              <FilaDeInformacion etiqueta="Precio estimado">{formatearPrecio(solicitud.precioEstimado)}</FilaDeInformacion>
              <FilaDeInformacion etiqueta="Precio final">
                {solicitud.acuerdoDePrecio && formatearPrecio(solicitud.acuerdoDePrecio.precio)}
                {!solicitud.acuerdoDePrecio && <span className="text-clay">Lo confirma el colaborador</span>}
              </FilaDeInformacion>
            </div>
            <FilaDeInformacion etiqueta="Elección del colaborador">{solicitud.modoDeEleccion === "Cliente" ? "El cliente lo eligió personalmente" : "Asignación automática"}</FilaDeInformacion>
            {!estaEditandoAsignacion && (
              <FilaDeInformacion etiqueta={solicitud.estado === "Cancelado" ? "Colaborador antes de cancelar" : "Colaborador"}>
                {trabajadorAsignado && (
                  <span>
                    {trabajadorAsignado.id} · {trabajadorAsignado.nombre}
                    <span className="mt-0.5 block text-xs font-semibold text-slate">
                      {trabajadorAsignado.telefono} · {describirHorarioDeTrabajo(trabajadorAsignado.horario)}
                    </span>
                  </span>
                )}
                {!trabajadorAsignado && <span className="text-clay">Sin asignar</span>}
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
                <select id="trabajador" value={idDelTrabajadorElegido} onChange={(evento) => setIdDelTrabajadorElegido(evento.target.value)} aria-invalid={Boolean(errorDeAsignacion)} aria-describedby={errorDeAsignacion ? "trabajador-error" : "trabajador-ayuda"} className="field cursor-pointer">
                  <option value="">Sin asignar</option>
                  {trabajadoresConDisponibilidad.map((disponibilidad) => {
                    const { trabajador, estaOcupado, fueraDeHorario } = disponibilidad;
                    const noPuedeAtender = (estaOcupado || fueraDeHorario) && trabajador.id !== solicitud.idDelTrabajador;
                    return (
                      <option key={trabajador.id} value={trabajador.id} disabled={noPuedeAtender}>
                        {describirOpcion(disponibilidad)}
                      </option>
                    );
                  })}
                </select>
              </CampoDeFormulario>
              <p id="trabajador-ayuda" className="text-xs text-slate">
                Solo se pueden elegir colaboradores que trabajan a esa hora y no tienen otro servicio cerca. La fecha, la hora y el precio no cambian, y el colaborador elegido todavía debe confirmar.
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
              {motivosSinRepetir.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {motivosSinRepetir.map((motivo) => (
                    <li key={motivo} className="flex items-start gap-2 rounded-2xl bg-moss/30 p-3 text-xs text-storm">
                      <Icono nombre="candado" className="h-4 w-4 text-lagoon" />
                      {motivo}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                {permisoDeCancelacion.exito && (
                  <button onClick={() => setVentanaDeCancelacionAbierta(true)} className="btn btn-quiet text-err">
                    <Icono nombre="prohibido" className="h-4 w-4" />
                    Cancelar solicitud
                  </button>
                )}
                {permisoDeAcuerdo.exito && (
                  <button onClick={() => setVentanaDeAcuerdoAbierta(true)} className="btn btn-quiet">
                    Registrar precio final
                  </button>
                )}
                {permisoDeAsignacion.exito && (
                  <button onClick={comenzarEdicionDeAsignacion} className="btn btn-primary">
                    <Icono nombre="editar" className="h-4 w-4" />
                    {textoDelBotonDeAsignacion}
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {confirmacionDeAsignacionAbierta && (
        <VentanaDeConfirmacion titulo="¿Cambiar la asignación?" lineasDeCambios={describirCambioDeTrabajador(solicitud, idDelTrabajadorNuevo, trabajadores)} etiquetaDeConfirmar="Sí, cambiar" onConfirmar={aplicarAsignacion} onCancelar={() => setConfirmacionDeAsignacionAbierta(false)} />
      )}
      {ventanaDeAcuerdoAbierta && trabajadorAsignado && (
        <VentanaDeAcuerdoDePrecio
          solicitud={solicitud}
          nombreDelCliente={nombreDelCliente}
          nombreDelTrabajador={trabajadorAsignado.nombre}
          onCerrar={() => setVentanaDeAcuerdoAbierta(false)}
          onRegistrar={(datos) => {
            setVentanaDeAcuerdoAbierta(false);
            setAcuerdoPorConfirmar(datos);
          }}
        />
      )}
      {acuerdoPorConfirmar && (
        <VentanaDeConfirmacion titulo="¿Registrar este precio?" lineasDeCambios={describirAcuerdoDePrecio(solicitud, Number(acuerdoPorConfirmar.precio))} etiquetaDeConfirmar="Sí, registrar" onConfirmar={aplicarAcuerdo} onCancelar={() => setAcuerdoPorConfirmar(null)} />
      )}
      {ventanaDeCancelacionAbierta && (
        <VentanaDeCancelacion
          solicitud={solicitud}
          onCerrar={() => setVentanaDeCancelacionAbierta(false)}
          onContinuar={(motivo) => {
            setVentanaDeCancelacionAbierta(false);
            setMotivoPorConfirmar(motivo);
          }}
        />
      )}
      {motivoPorConfirmar !== null && (
        <VentanaDeConfirmacion titulo="¿Cancelar la solicitud?" lineasDeCambios={describirCancelacion(solicitud, motivoPorConfirmar, claveDeHoy)} etiquetaDeConfirmar="Sí, cancelar" onConfirmar={aplicarCancelacionConfirmada} onCancelar={() => setMotivoPorConfirmar(null)} />
      )}
      {aviso && <AvisoTemporal aviso={aviso} onTerminar={() => setAviso(null)} />}
    </div>
  );
}
