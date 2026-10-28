import { useState } from "react";
import { tieneFiltrosActivos } from "../../utils/consultasDeSolicitudes";
import type { FiltrosDeSolicitudes } from "../../data/tipos";
import { CampoDeFormulario } from "../comunes/CampoDeFormulario";
import { Icono } from "../comunes/Icono";

type OpcionDeFiltro = { valor: string; etiqueta: string };

const OPCIONES_DE_ESTADO: OpcionDeFiltro[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "Pendiente", etiqueta: "Pendiente" },
  { valor: "Confirmado", etiqueta: "Confirmado" },
  { valor: "Realizado", etiqueta: "Realizado" },
  { valor: "Cancelado", etiqueta: "Cancelado" },
];

const OPCIONES_DE_FECHA_DEL_TRABAJO: OpcionDeFiltro[] = [
  { valor: "todas", etiqueta: "Cualquier fecha" },
  { valor: "hoy", etiqueta: "Hoy" },
  { valor: "manana", etiqueta: "Mañana" },
  { valor: "despues", etiqueta: "Después de mañana" },
  { valor: "anteriores", etiqueta: "Anteriores" },
];

const OPCIONES_DE_FECHA_DE_SOLICITUD: OpcionDeFiltro[] = [
  { valor: "todas", etiqueta: "Cualquier fecha" },
  { valor: "hoy", etiqueta: "Hoy" },
  { valor: "7dias", etiqueta: "Últimos 7 días" },
];

const OPCIONES_DE_ASIGNACION: OpcionDeFiltro[] = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "sinAsignar", etiqueta: "Sin asignar" },
  { valor: "asignadas", etiqueta: "Con trabajador" },
];

type SelectorDeFiltroProps = {
  id: string;
  etiqueta: string;
  valorSeleccionado: string;
  opciones: OpcionDeFiltro[];
  onCambiar: (valor: string) => void;
};

function SelectorDeFiltro({ id, etiqueta, valorSeleccionado, opciones, onCambiar }: SelectorDeFiltroProps) {
  return (
    <CampoDeFormulario id={id} etiqueta={etiqueta}>
      <div className="relative">
        <select id={id} value={valorSeleccionado} onChange={(evento) => onCambiar(evento.target.value)} className="field cursor-pointer appearance-none pr-10">
          {opciones.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
        <Icono nombre="flechaAbajo" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
      </div>
    </CampoDeFormulario>
  );
}

type BarraDeFiltrosDeSolicitudesProps = {
  filtros: FiltrosDeSolicitudes;
  totalDeSolicitudes: number;
  solicitudesVisibles: number;
  onCambiarFiltros: (filtros: FiltrosDeSolicitudes) => void;
  onRestablecerFiltros: () => void;
};

export function BarraDeFiltrosDeSolicitudes({ filtros, totalDeSolicitudes, solicitudesVisibles, onCambiarFiltros, onRestablecerFiltros }: BarraDeFiltrosDeSolicitudesProps) {
  const [filtrosAvanzadosVisibles, setFiltrosAvanzadosVisibles] = useState(
    filtros.fechaDelTrabajo !== "todas" || filtros.fechaDeSolicitud !== "todas" || filtros.asignacion !== "todas",
  );
  const hayFiltrosActivos = tieneFiltrosActivos(filtros);

  return (
    <section aria-label="Búsqueda y filtros" className="leaf-sm surface p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Icono nombre="buscar" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input type="search" value={filtros.busqueda} onChange={(evento) => onCambiarFiltros({ ...filtros, busqueda: evento.target.value })} placeholder="Buscar por ID, cliente, servicio, dirección o trabajador" aria-label="Buscar solicitudes" className="field pl-11" />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
          {OPCIONES_DE_ESTADO.map((opcion) => {
            const estaSeleccionada = filtros.estado === opcion.valor;
            return (
              <button key={opcion.valor} onClick={() => onCambiarFiltros({ ...filtros, estado: opcion.valor as FiltrosDeSolicitudes["estado"] })} aria-pressed={estaSeleccionada} className={`cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition duration-300 ${estaSeleccionada ? "bg-navy text-white" : "bg-beige text-storm hover:bg-sky/50"}`}>
                {opcion.etiqueta}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => setFiltrosAvanzadosVisibles(!filtrosAvanzadosVisibles)} aria-expanded={filtrosAvanzadosVisibles} aria-controls="filtros-avanzados" className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-lagoon transition duration-300 hover:bg-sky/50">
          <Icono nombre="filtros" className="h-4 w-4" />
          {filtrosAvanzadosVisibles ? "Menos filtros" : "Más filtros"}
        </button>
        <p className="text-sm text-slate" aria-live="polite">
          Mostrando <strong className="text-navy">{solicitudesVisibles}</strong> de {totalDeSolicitudes} solicitudes
        </p>
      </div>

      {filtrosAvanzadosVisibles && (
        <div id="filtros-avanzados" className="fade mt-3 border-t border-mist pt-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectorDeFiltro id="filtro-fecha-del-trabajo" etiqueta="Fecha del trabajo" valorSeleccionado={filtros.fechaDelTrabajo} opciones={OPCIONES_DE_FECHA_DEL_TRABAJO} onCambiar={(valor) => onCambiarFiltros({ ...filtros, fechaDelTrabajo: valor as FiltrosDeSolicitudes["fechaDelTrabajo"] })} />
            <SelectorDeFiltro id="filtro-fecha-de-solicitud" etiqueta="Fecha de solicitud" valorSeleccionado={filtros.fechaDeSolicitud} opciones={OPCIONES_DE_FECHA_DE_SOLICITUD} onCambiar={(valor) => onCambiarFiltros({ ...filtros, fechaDeSolicitud: valor as FiltrosDeSolicitudes["fechaDeSolicitud"] })} />
            <SelectorDeFiltro id="filtro-asignacion" etiqueta="Trabajador" valorSeleccionado={filtros.asignacion} opciones={OPCIONES_DE_ASIGNACION} onCambiar={(valor) => onCambiarFiltros({ ...filtros, asignacion: valor as FiltrosDeSolicitudes["asignacion"] })} />
          </div>
        </div>
      )}

      {hayFiltrosActivos && (
        <div className="mt-4 flex justify-end">
          <button onClick={onRestablecerFiltros} className="btn btn-quiet">
            <Icono nombre="restablecer" className="h-4 w-4" />
            Restablecer filtros
          </button>
        </div>
      )}
    </section>
  );
}
