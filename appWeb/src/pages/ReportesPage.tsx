import { useEffect, useState } from "react";
import { ESTADOS_DE_REPORTE, LONGITUD_MAXIMA_DE_LA_SOLUCION, useReportes, validarSolucion } from "../data/ReportesContext";
import { useSolicitudes } from "../data/SolicitudesContext";
import { useTrabajadores } from "../data/TrabajadoresContext";
import { buscarTrabajador } from "../data/trabajadores";
import type { EstadoDeReporte, Reporte, ResultadoDeOperacion, Solicitud, Trabajador } from "../data/tipos";
import { formatearFechaNumerica, formatearHora, normalizarTexto } from "../utils/formato";
import { AvisoTemporal } from "../components/comunes/AvisoTemporal";
import { Icono } from "../components/comunes/Icono";
import { InsigniaDeDatosDeDemostracion, InsigniaDeEstado } from "../components/comunes/Insignias";
import { TarjetaDeIndicador } from "../components/comunes/TarjetaDeIndicador";
import { VentanaDeConfirmacion } from "../components/comunes/VentanasModales";

type FiltroDeEstadoDeReporte = "Todos" | EstadoDeReporte;

type ReporteConContexto = {
  reporte: Reporte;
  solicitud: Solicitud | undefined;
  trabajador: Trabajador | undefined;
};

const COLOR_DEL_BORDE_POR_ESTADO: Record<EstadoDeReporte, string> = {
  Pendiente: "border-ochre",
  "En revisión": "border-steel",
  Resuelto: "border-sage",
};

function claseDelFiltroDeEstado(estaActivo: boolean) {
  const claseBase = "cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition duration-300";
  if (estaActivo) {
    return `${claseBase} bg-navy text-white`;
  }
  return `${claseBase} bg-white text-storm hover:bg-sky/50`;
}

function useReportesConContexto(): ReporteConContexto[] {
  const { reportes } = useReportes();
  const { solicitudes } = useSolicitudes();
  const { trabajadores } = useTrabajadores();
  return reportes
    .map((reporte) => {
      const solicitud = solicitudes.find((solicitudBuscada) => solicitudBuscada.id === reporte.idDeSolicitud);
      const trabajador = solicitud ? buscarTrabajador(trabajadores, solicitud.idDelTrabajador) : undefined;
      return { reporte, solicitud, trabajador };
    })
    .sort((a, b) => new Date(b.reporte.fechaDeCreacion).getTime() - new Date(a.reporte.fechaDeCreacion).getTime());
}

function nombreDelCliente(solicitud: Solicitud | undefined): string {
  return solicitud ? solicitud.nombreDelCliente : "Solicitud no encontrada";
}

function nombreDelTrabajador(trabajador: Trabajador | undefined): string {
  return trabajador ? trabajador.nombre : "Sin trabajador";
}

function ListaDeReportes({ onAbrirReporte }: { onAbrirReporte: (folio: string) => void }) {
  const reportesConContexto = useReportesConContexto();
  const [busqueda, setBusqueda] = useState("");
  const [filtroDeEstado, setFiltroDeEstado] = useState<FiltroDeEstadoDeReporte>("Todos");

  const textoBuscado = normalizarTexto(busqueda);
  const reportesVisibles = reportesConContexto.filter(({ reporte, solicitud, trabajador }) => {
    const coincideConElEstado = filtroDeEstado === "Todos" || reporte.estado === filtroDeEstado;
    const textoDelReporte = normalizarTexto(`${reporte.folio} ${reporte.idDeSolicitud} ${nombreDelCliente(solicitud)} ${solicitud?.usuarioDelCliente ?? ""} ${nombreDelTrabajador(trabajador)} ${reporte.descripcion}`);
    return coincideConElEstado && textoDelReporte.includes(textoBuscado);
  });
  const hayFiltrosActivos = busqueda.trim() !== "" || filtroDeEstado !== "Todos";

  function contarPorEstado(estado: EstadoDeReporte) {
    return reportesConContexto.filter(({ reporte }) => reporte.estado === estado).length;
  }

  function restablecerFiltros() {
    setBusqueda("");
    setFiltroDeEstado("Todos");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-extrabold text-navy">Atención a reportes</h1>
        <InsigniaDeDatosDeDemostracion />
      </div>
      <p className="mt-2 text-sm text-slate">Inconformidades que los clientes envían sobre sus servicios.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {ESTADOS_DE_REPORTE.map((estado) => (
          <TarjetaDeIndicador key={estado} etiqueta={estado} valor={contarPorEstado(estado)} />
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Icono nombre="buscar" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input type="search" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Buscar por folio, cliente, trabajador o descripción" aria-label="Buscar reportes" className="field pl-11" />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estatus">
          {(["Todos", ...ESTADOS_DE_REPORTE] as FiltroDeEstadoDeReporte[]).map((estado) => (
            <button key={estado} onClick={() => setFiltroDeEstado(estado)} aria-pressed={filtroDeEstado === estado} className={claseDelFiltroDeEstado(filtroDeEstado === estado)}>
              {estado}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate" aria-live="polite">
          Mostrando <strong className="text-navy">{reportesVisibles.length}</strong> de {reportesConContexto.length} reportes
        </p>
        {hayFiltrosActivos && (
          <button onClick={restablecerFiltros} className="btn btn-quiet">
            <Icono nombre="restablecer" className="h-4 w-4" />
            Restablecer filtros
          </button>
        )}
      </div>

      {reportesVisibles.length === 0 && <p className="mt-6 rounded-2xl bg-white p-10 text-center text-sm text-slate">No hay reportes que coincidan con la búsqueda o el filtro.</p>}

      {reportesVisibles.length > 0 && (
        <div className="mt-6">
          <div className="surface leaf-sm hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-moon/60 text-xs uppercase tracking-wider text-slate">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">Folio</th>
                  <th scope="col" className="px-4 py-4 font-bold">Cliente</th>
                  <th scope="col" className="px-4 py-4 font-bold">Trabajador</th>
                  <th scope="col" className="px-4 py-4 font-bold">Fecha</th>
                  <th scope="col" className="px-4 py-4 font-bold">Estatus</th>
                  <th scope="col" className="px-4 py-4">
                    <span className="sr-only">Abrir</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist/70">
                {reportesVisibles.map(({ reporte, solicitud, trabajador }) => (
                  <tr key={reporte.folio} onClick={() => onAbrirReporte(reporte.folio)} className="cursor-pointer transition duration-300 hover:bg-sky/25">
                    <td className={`border-l-4 px-6 py-4 ${COLOR_DEL_BORDE_POR_ESTADO[reporte.estado]}`}>
                      <button
                        onClick={(evento) => {
                          evento.stopPropagation();
                          onAbrirReporte(reporte.folio);
                        }}
                        aria-label={`Ver detalle del reporte ${reporte.folio}`}
                        className="cursor-pointer rounded-full bg-navy px-3 py-1 text-xs font-bold text-white"
                      >
                        {reporte.folio}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <span className="block font-bold text-navy">{nombreDelCliente(solicitud)}</span>
                      <span className="block text-xs text-slate">{reporte.idDeSolicitud}</span>
                    </td>
                    <td className="px-4 py-4">{nombreDelTrabajador(trabajador)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate">{formatearFechaNumerica(reporte.fechaDeCreacion)}</td>
                    <td className="px-4 py-4">
                      <InsigniaDeEstado estado={reporte.estado} />
                    </td>
                    <td className="px-4 py-4 text-slate">
                      <Icono nombre="chevronDerecho" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-4 md:hidden">
            {reportesVisibles.map(({ reporte, solicitud, trabajador }) => (
              <li key={reporte.folio}>
                <button onClick={() => onAbrirReporte(reporte.folio)} className={`surface leaf-sm w-full cursor-pointer border-l-4 p-5 text-left transition duration-300 active:scale-[0.99] ${COLOR_DEL_BORDE_POR_ESTADO[reporte.estado]}`}>
                  <span className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">{reporte.folio}</span>
                    <InsigniaDeEstado estado={reporte.estado} />
                  </span>
                  <span className="mt-3 block font-bold text-navy">{nombreDelCliente(solicitud)}</span>
                  <span className="block text-sm text-slate">Trabajador: {nombreDelTrabajador(trabajador)}</span>
                  <span className="mt-1 block text-xs text-slate">{formatearFechaNumerica(reporte.fechaDeCreacion)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

type DetalleDelReporteProps = {
  reporteConContexto: ReporteConContexto;
  onVolver: () => void;
  onResultado: (resultado: ResultadoDeOperacion) => void;
};

function DetalleDelReporte({ reporteConContexto, onVolver, onResultado }: DetalleDelReporteProps) {
  const { guardarSolucion, cerrarReporte } = useReportes();
  const { reporte, solicitud, trabajador } = reporteConContexto;
  const [solucion, setSolucion] = useState(reporte.solucion);
  const [errorDeLaSolucion, setErrorDeLaSolucion] = useState("");
  const [confirmacionDeCierreAbierta, setConfirmacionDeCierreAbierta] = useState(false);
  const estaCerrado = reporte.estado === "Resuelto";

  function handleGuardar() {
    const resultado = guardarSolucion(reporte.folio, solucion);
    setErrorDeLaSolucion(resultado.exito ? "" : resultado.mensaje);
    onResultado(resultado);
  }

  function pedirConfirmacionDeCierre() {
    const validacion = validarSolucion(reporte, solucion);
    if (!validacion.exito) {
      setErrorDeLaSolucion(validacion.mensaje);
      return;
    }
    setErrorDeLaSolucion("");
    setConfirmacionDeCierreAbierta(true);
  }

  function handleCerrar() {
    const resultado = cerrarReporte(reporte.folio, solucion);
    setConfirmacionDeCierreAbierta(false);
    setErrorDeLaSolucion(resultado.exito ? "" : resultado.mensaje);
    onResultado(resultado);
  }

  const datosDelReporte = [
    { etiqueta: "Cliente", valor: nombreDelCliente(solicitud) },
    { etiqueta: "Trabajador", valor: nombreDelTrabajador(trabajador) },
    { etiqueta: "Solicitud", valor: solicitud ? `${solicitud.id} · ${solicitud.servicio}` : reporte.idDeSolicitud },
    { etiqueta: "Fecha del reporte", valor: `${formatearFechaNumerica(reporte.fechaDeCreacion)} · ${formatearHora(reporte.fechaDeCreacion)}` },
  ];

  return (
    <div>
      <button onClick={onVolver} className="btn btn-quiet">
        <Icono nombre="volver" className="h-4 w-4" />
        Volver a reportes
      </button>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-extrabold text-navy">Detalles del reporte</h1>
        <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">{reporte.folio}</span>
        <InsigniaDeEstado estado={reporte.estado} />
      </div>

      <dl className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {datosDelReporte.map(({ etiqueta, valor }) => (
          <div key={etiqueta} className="rounded-2xl bg-white px-4 py-3 shadow-card">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate">{etiqueta}</dt>
            <dd className="mt-1 text-sm font-bold text-navy">{valor}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="titulo-de-descripcion-del-reporte" className="surface leaf-r mt-8 p-7 sm:p-9">
        <h2 id="titulo-de-descripcion-del-reporte" className="text-2xl font-extrabold text-navy">
          Descripción
        </h2>
        <p className="mt-1 text-xs text-slate">Escrita por el cliente.</p>
        <p className="mt-4 rounded-2xl bg-beige p-5 text-sm leading-relaxed text-storm">{reporte.descripcion}</p>
      </section>

      <section aria-labelledby="titulo-de-solucion" className="surface leaf mt-8 p-7 sm:p-9">
        <h2 id="titulo-de-solucion" className="text-2xl font-extrabold text-navy">
          <label htmlFor="solucion-del-reporte">Solución</label>
        </h2>
        <textarea
          id="solucion-del-reporte"
          rows={5}
          maxLength={LONGITUD_MAXIMA_DE_LA_SOLUCION}
          value={solucion}
          onChange={(evento) => setSolucion(evento.target.value)}
          disabled={estaCerrado}
          aria-invalid={Boolean(errorDeLaSolucion)}
          aria-describedby={errorDeLaSolucion ? "solucion-del-reporte-error" : "solucion-del-reporte-ayuda"}
          placeholder="Describe el seguimiento o la solución acordada."
          className="field mt-4 resize-y"
        />
        {errorDeLaSolucion && (
          <p id="solucion-del-reporte-error" role="alert" className="mt-1.5 text-xs font-semibold text-err">
            {errorDeLaSolucion}
          </p>
        )}
        <p id="solucion-del-reporte-ayuda" className="mt-2 text-xs text-slate">
          {estaCerrado && "El reporte está cerrado; la solución ya no se puede modificar."}
          {!estaCerrado && `Al guardar, el reporte queda en revisión. Los cambios solo duran mientras esta pestaña siga abierta. ${solucion.length}/${LONGITUD_MAXIMA_DE_LA_SOLUCION}`}
        </p>
        {!estaCerrado && (
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button onClick={pedirConfirmacionDeCierre} className="btn btn-quiet">
              Cerrar reporte
            </button>
            <button onClick={handleGuardar} className="btn btn-primary">
              Guardar cambios
            </button>
          </div>
        )}
      </section>

      {confirmacionDeCierreAbierta && (
        <VentanaDeConfirmacion
          titulo="¿Cerrar el reporte?"
          lineasDeCambios={[`Estatus: ${reporte.estado} → Resuelto`, `Solución: ${solucion.trim()}`, "Un reporte cerrado ya no se puede editar en este panel."]}
          etiquetaDeConfirmar="Sí, cerrar"
          onConfirmar={handleCerrar}
          onCancelar={() => setConfirmacionDeCierreAbierta(false)}
        />
      )}
    </div>
  );
}

export function ReportesPage() {
  const reportesConContexto = useReportesConContexto();
  const [folioAbierto, setFolioAbierto] = useState<string | null>(null);
  const [aviso, setAviso] = useState<ResultadoDeOperacion | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [folioAbierto]);

  const reporteAbierto = reportesConContexto.find(({ reporte }) => reporte.folio === folioAbierto);

  return (
    <>
      {reporteAbierto && (
        <div className="fade">
          <DetalleDelReporte key={reporteAbierto.reporte.folio} reporteConContexto={reporteAbierto} onVolver={() => setFolioAbierto(null)} onResultado={setAviso} />
        </div>
      )}
      {!reporteAbierto && <ListaDeReportes onAbrirReporte={setFolioAbierto} />}
      {aviso && <AvisoTemporal aviso={aviso} onTerminar={() => setAviso(null)} />}
    </>
  );
}
