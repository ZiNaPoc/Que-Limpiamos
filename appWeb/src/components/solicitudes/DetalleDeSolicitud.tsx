import { useState, type ReactNode } from "react";
import { useAhora } from "../../hooks/useAhora";
import { useSolicitudes } from "../../data/SolicitudesContext";
import { useTrabajadores } from "../../data/TrabajadoresContext";
import { buscarTrabajador } from "../../data/trabajadores";
import type { ResultadoDeOperacion, Solicitud } from "../../data/tipos";
import { describirTiempoDesdeCreacion, formatearFechaNumerica, formatearHora, formatearPrecio } from "../../utils/formato";
import {
  describirAcuerdoDePrecio,
  describirCambioDeTrabajador,
  describirEstadoDeLaAsignacion,
  evaluarCambioDeTrabajador,
  evaluarRegistroDeAcuerdoDePrecio,
  listarTrabajadoresConDisponibilidad,
  validarAcuerdoDePrecio,
  validarCambioDeTrabajador,
  type DatosDeAcuerdoDePrecio,
  type ErroresDelAcuerdoDePrecio,
} from "../../utils/reglasDeSolicitudes";
import { AvisoTemporal } from "../comunes/AvisoTemporal";
import { CampoDeFormulario } from "../comunes/CampoDeFormulario";
import { Icono } from "../comunes/Icono";
import { InsigniaDeEstado } from "../comunes/Insignias";
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
  nombreDelTrabajador: string;
  onCerrar: () => void;
  onRegistrar: (datos: DatosDeAcuerdoDePrecio) => void;
};

function VentanaDeAcuerdoDePrecio({ solicitud, nombreDelTrabajador, onCerrar, onRegistrar }: VentanaDeAcuerdoDePrecioProps) {
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

  let precioAcordadoActual = "Pendiente de acuerdo";
  if (solicitud.acuerdoDePrecio) {
    precioAcordadoActual = formatearPrecio(solicitud.acuerdoDePrecio.precio);
  }

  return (
    <VentanaModal idDelTitulo="titulo-del-acuerdo" onCerrar={onCerrar}>
      <h2 id="titulo-del-acuerdo" className="text-2xl font-extrabold text-navy">
        Registrar acuerdo de precio
      </h2>
      <p className="mt-2 text-sm text-slate">Solo registra un precio que el cliente y el trabajador ya hayan aceptado.</p>
      <dl className="mt-5 grid grid-cols-2 gap-2">
        <FilaDeInformacion etiqueta="Precio estimado">{formatearPrecio(solicitud.precioEstimado)}</FilaDeInformacion>
        <FilaDeInformacion etiqueta="Precio acordado">{precioAcordadoActual}</FilaDeInformacion>
      </dl>
      <div className="mt-5 space-y-4">
        <CampoDeFormulario id="precio-acordado" etiqueta="Precio acordado (MXN)" error={errores.precio}>
          <input id="precio-acordado" type="number" inputMode="decimal" min="1" step="10" value={datos.precio} onChange={(evento) => setDatos({ ...datos, precio: evento.target.value })} aria-invalid={Boolean(errores.precio)} aria-describedby={errores.precio ? "precio-acordado-error" : undefined} className="field" />
        </CampoDeFormulario>
        <fieldset aria-describedby={errores.aceptaciones ? "aceptaciones-error" : undefined}>
          <legend className="label">Aceptación de las partes</legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-beige px-4 py-3 text-sm text-storm">
            <input type="checkbox" checked={datos.aceptadoPorElCliente} onChange={(evento) => setDatos({ ...datos, aceptadoPorElCliente: evento.target.checked })} className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-navy" />
            {solicitud.nombreDelCliente} (cliente) aceptó este precio.
          </label>
          <label className="mt-2 flex cursor-pointer items-start gap-3 rounded-2xl bg-beige px-4 py-3 text-sm text-storm">
            <input type="checkbox" checked={datos.aceptadoPorElTrabajador} onChange={(evento) => setDatos({ ...datos, aceptadoPorElTrabajador: evento.target.checked })} className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-navy" />
            {nombreDelTrabajador} (trabajador) aceptó este precio.
          </label>
          {errores.aceptaciones && (
            <p id="aceptaciones-error" role="alert" className="mt-1.5 text-xs font-semibold text-err">
              {errores.aceptaciones}
            </p>
          )}
        </fieldset>
        <p className="rounded-2xl bg-moon p-3 text-xs text-clay">Simulación local: el acuerdo no se guarda en el servidor ni queda verificado por el cliente o el trabajador.</p>
      </div>
      <div className="mt-7 flex justify-end gap-3">
        <button onClick={onCerrar} className="btn btn-quiet">
          Volver
        </button>
        <button onClick={handleRegistrar} className="btn btn-primary">
          Revisar acuerdo
        </button>
      </div>
    </VentanaModal>
  );
}

type DetalleDeSolicitudProps = {
  solicitud: Solicitud;
  onVolver: () => void;
};

export function DetalleDeSolicitud({ solicitud, onVolver }: DetalleDeSolicitudProps) {
  const { solicitudes, cambiarTrabajadorAsignado, registrarAcuerdoDePrecio } = useSolicitudes();
  const { trabajadores } = useTrabajadores();
  const ahora = useAhora();
  const [estaEditandoAsignacion, setEstaEditandoAsignacion] = useState(false);
  const [idDelTrabajadorElegido, setIdDelTrabajadorElegido] = useState(solicitud.idDelTrabajador ?? "");
  const [errorDeAsignacion, setErrorDeAsignacion] = useState("");
  const [confirmacionDeAsignacionAbierta, setConfirmacionDeAsignacionAbierta] = useState(false);
  const [ventanaDeAcuerdoAbierta, setVentanaDeAcuerdoAbierta] = useState(false);
  const [acuerdoPorConfirmar, setAcuerdoPorConfirmar] = useState<DatosDeAcuerdoDePrecio | null>(null);
  const [aviso, setAviso] = useState<ResultadoDeOperacion | null>(null);

  const trabajadorAsignado = buscarTrabajador(trabajadores, solicitud.idDelTrabajador);
  const permisoDeAsignacion = evaluarCambioDeTrabajador(solicitud);
  const permisoDeAcuerdo = evaluarRegistroDeAcuerdoDePrecio(solicitud);
  const trabajadoresConDisponibilidad = listarTrabajadoresConDisponibilidad(solicitudes, trabajadores, solicitud);
  const motivosDeBloqueo = [permisoDeAsignacion, permisoDeAcuerdo].filter((permiso) => !permiso.exito).map((permiso) => permiso.mensaje);
  const motivosSinRepetir = motivosDeBloqueo.filter((motivo, indice) => motivosDeBloqueo.indexOf(motivo) === indice);

  let idDelTrabajadorNuevo: string | null = null;
  if (idDelTrabajadorElegido) {
    idDelTrabajadorNuevo = idDelTrabajadorElegido;
  }

  function comenzarEdicionDeAsignacion() {
    setIdDelTrabajadorElegido(solicitud.idDelTrabajador ?? "");
    setErrorDeAsignacion("");
    setEstaEditandoAsignacion(true);
  }

  function cancelarEdicionDeAsignacion() {
    setEstaEditandoAsignacion(false);
    setErrorDeAsignacion("");
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

  function prepararConfirmacionDeAcuerdo(datos: DatosDeAcuerdoDePrecio) {
    setVentanaDeAcuerdoAbierta(false);
    setAcuerdoPorConfirmar(datos);
  }

  function aplicarAcuerdo() {
    if (!acuerdoPorConfirmar) {
      return;
    }
    setAviso(registrarAcuerdoDePrecio(solicitud.id, acuerdoPorConfirmar));
    setAcuerdoPorConfirmar(null);
  }

  let etiquetaDelTrabajador = "Trabajador asignado";
  if (solicitud.estado === "Cancelado") {
    etiquetaDelTrabajador = "Trabajador asignado antes de cancelar";
  }

  return (
    <div>
      <button onClick={onVolver} className="btn btn-quiet">
        <Icono nombre="volver" className="h-4 w-4" />
        Volver a solicitudes
      </button>

      <section aria-label="Datos del cliente y ubicación" className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="leaf overflow-hidden shadow-card lg:col-span-7">
          <MapaDeUbicacion latitud={solicitud.latitud} longitud={solicitud.longitud} direccion={solicitud.direccion} />
        </div>
        <div className="lg:col-span-5">
          <p className="text-xs font-bold uppercase tracking-widest text-lagoon">Cliente</p>
          <h1 className="mt-1 text-4xl font-extrabold text-navy">{solicitud.nombreDelCliente}</h1>
          <p className="mt-1 text-sm text-slate">
            {solicitud.usuarioDelCliente} · <span className="font-bold text-lagoon">{solicitud.id}</span>
          </p>
          <dl className="mt-6 space-y-2">
            <FilaDeInformacion claseDeFondo="bg-white shadow-card" etiqueta="Servicio">{solicitud.servicio}</FilaDeInformacion>
            <FilaDeInformacion claseDeFondo="bg-white shadow-card" etiqueta="Fecha de solicitud">
              {formatearFechaNumerica(solicitud.fechaDeCreacion)} · {describirTiempoDesdeCreacion(solicitud.fechaDeCreacion, ahora)}
            </FilaDeInformacion>
            <FilaDeInformacion claseDeFondo="bg-white shadow-card" etiqueta="Dirección">{solicitud.direccion}</FilaDeInformacion>
            <FilaDeInformacion claseDeFondo="bg-white shadow-card" etiqueta="Estado">
              <InsigniaDeEstado estado={solicitud.estado} />
            </FilaDeInformacion>
          </dl>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <section aria-labelledby="titulo-de-descripcion" className="surface leaf-r p-7 sm:p-9 lg:col-span-7">
          <h2 id="titulo-de-descripcion" className="text-2xl font-extrabold text-navy">
            Descripción
          </h2>
          <p className="mt-4 rounded-2xl bg-beige p-5 text-sm leading-relaxed text-storm">{solicitud.descripcion}</p>
          <EvidenciasDelLugar key={solicitud.id} solicitud={solicitud} onResultado={setAviso} />
        </section>

        <section aria-labelledby="titulo-de-horario" className="surface leaf p-7 sm:p-9 lg:col-span-5">
          <h2 id="titulo-de-horario" className="text-2xl font-extrabold text-navy">
            Horario asignado
          </h2>

          <dl className="mt-4 space-y-2">
            <FilaDeInformacion etiqueta="Fecha y hora">
              {formatearFechaNumerica(solicitud.fechaProgramada)} · {formatearHora(solicitud.fechaProgramada)}
            </FilaDeInformacion>
            <FilaDeInformacion etiqueta="Precio estimado">{formatearPrecio(solicitud.precioEstimado)}</FilaDeInformacion>
            <FilaDeInformacion etiqueta="Precio acordado">
              {solicitud.acuerdoDePrecio && (
                <span>
                  {formatearPrecio(solicitud.acuerdoDePrecio.precio)}
                  <span className="mt-0.5 block text-xs font-semibold text-slate">Registrado en esta sesión · simulación local</span>
                </span>
              )}
              {!solicitud.acuerdoDePrecio && <span className="text-clay">Pendiente de acuerdo entre cliente y trabajador</span>}
            </FilaDeInformacion>
            {!estaEditandoAsignacion && (
              <FilaDeInformacion etiqueta={etiquetaDelTrabajador}>
                {trabajadorAsignado && (
                  <span>
                    {trabajadorAsignado.id} · {trabajadorAsignado.nombre}
                  </span>
                )}
                {!trabajadorAsignado && <span className="text-clay">Sin asignar</span>}
                <span className="mt-0.5 block text-xs font-semibold text-slate">{describirEstadoDeLaAsignacion(solicitud)}</span>
              </FilaDeInformacion>
            )}
          </dl>

          {estaEditandoAsignacion && (
            <div className="fade mt-4 space-y-4">
              <CampoDeFormulario id="trabajador" etiqueta="Trabajador asignado" error={errorDeAsignacion}>
                <select id="trabajador" value={idDelTrabajadorElegido} onChange={(evento) => setIdDelTrabajadorElegido(evento.target.value)} aria-invalid={Boolean(errorDeAsignacion)} aria-describedby={errorDeAsignacion ? "trabajador-error" : "trabajador-ayuda"} className="field cursor-pointer">
                  <option value="">Sin asignar</option>
                  {trabajadoresConDisponibilidad.map(({ trabajador, estaOcupado }) => (
                    <option key={trabajador.id} value={trabajador.id} disabled={estaOcupado && trabajador.id !== solicitud.idDelTrabajador}>
                      {trabajador.id} · {trabajador.nombre}
                      {estaOcupado ? " (ocupado a esa hora)" : ""}
                    </option>
                  ))}
                </select>
              </CampoDeFormulario>
              <p id="trabajador-ayuda" className="text-xs text-slate">
                La fecha, la hora y el precio no se modifican al cambiar el trabajador. La asignación queda pendiente de que el trabajador la confirme.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={cancelarEdicionDeAsignacion} className="btn btn-quiet">
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
                    <li key={motivo} className="rounded-2xl bg-moss/30 p-3 text-xs text-storm">
                      {motivo}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button onClick={() => setVentanaDeAcuerdoAbierta(true)} disabled={!permisoDeAcuerdo.exito} className="btn btn-quiet">
                  Registrar acuerdo de precio
                </button>
                <button onClick={comenzarEdicionDeAsignacion} disabled={!permisoDeAsignacion.exito} className="btn btn-primary">
                  <Icono nombre="editar" className="h-4 w-4" />
                  Editar trabajador
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {confirmacionDeAsignacionAbierta && (
        <VentanaDeConfirmacion titulo="¿Cambiar la asignación?" lineasDeCambios={describirCambioDeTrabajador(solicitud, idDelTrabajadorNuevo, trabajadores)} etiquetaDeConfirmar="Sí, cambiar" onConfirmar={aplicarAsignacion} onCancelar={() => setConfirmacionDeAsignacionAbierta(false)} />
      )}
      {ventanaDeAcuerdoAbierta && trabajadorAsignado && <VentanaDeAcuerdoDePrecio solicitud={solicitud} nombreDelTrabajador={trabajadorAsignado.nombre} onCerrar={() => setVentanaDeAcuerdoAbierta(false)} onRegistrar={prepararConfirmacionDeAcuerdo} />}
      {acuerdoPorConfirmar && (
        <VentanaDeConfirmacion titulo="¿Registrar este acuerdo?" lineasDeCambios={describirAcuerdoDePrecio(solicitud, Number(acuerdoPorConfirmar.precio))} etiquetaDeConfirmar="Sí, registrar" onConfirmar={aplicarAcuerdo} onCancelar={() => setAcuerdoPorConfirmar(null)} />
      )}
      {aviso && <AvisoTemporal aviso={aviso} onTerminar={() => setAviso(null)} />}
    </div>
  );
}
