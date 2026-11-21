import { useState } from "react";
import { useAhora } from "../hooks/useAhora";
import { useSolicitudes } from "../hooks/useSolicitudes";

import type { AperturaDelPanel, FiltrosDeSolicitudes } from "../data/tipos";

import {
  filtrarSolicitudes,
  FILTROS_VACIOS,
} from "../utils/consultasDeSolicitudes";

import { obtenerClaveDeFecha } from "../utils/fechas";
import { BarraDeFiltrosDeSolicitudes } from "../components/solicitudes/BarraDeFiltrosDeSolicitudes";
import { ListaDeSolicitudes } from "../components/solicitudes/ListaDeSolicitudes";
import { FormaOrganica } from "../components/comunes/FormasOrganicas";

type SolicitudesPageProps = {
  apertura: AperturaDelPanel;
};

// Lista con búsqueda y filtros; al elegir una se abre su detalle, que es donde se avanza el flujo.
// Si se llegó desde otra pantalla, puede venir con filtros puestos o con una solicitud ya abierta.
// Si hay muchas solicitudes, los filtros de esta pantalla se mandarían al back como parámetros y la lista vendría paginada.
export function SolicitudesPage({ apertura }: SolicitudesPageProps) {
  const { solicitudes, cargando, errorCarga, recargarSolicitudes } =
    useSolicitudes();

  const ahora = useAhora();

  const claveDeHoy = obtenerClaveDeFecha(ahora);
  // Filtros activos (pueden venir ya puestos desde el Inicio).
  const [filtros, setFiltros] = useState<FiltrosDeSolicitudes>(
    apertura.filtrosDeSolicitudes ?? FILTROS_VACIOS,
  );

  const solicitudesVisibles = filtrarSolicitudes(
    solicitudes,
    filtros,
    claveDeHoy,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-extrabold text-navy">
          Gestión de solicitudes
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-slate">
          Solicitudes que los clientes envían desde la app. Consulta sus
          servicios, fechas, clientes, colaboradores y estados de seguimiento.
        </p>
      </div>

      <div className="mt-8">
        <BarraDeFiltrosDeSolicitudes
          filtros={filtros}
          totalDeSolicitudes={solicitudes.length}
          solicitudesVisibles={solicitudesVisibles.length}
          onCambiarFiltros={setFiltros}
          onRestablecerFiltros={() => setFiltros(FILTROS_VACIOS)}
        />
      </div>

      <div className="mt-6">
        {cargando && (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate">
            Cargando solicitudes...
          </div>
        )}

        {!cargando && errorCarga && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-white p-8 text-center"
          >
            <p className="font-bold text-err">
              No se pudieron cargar las solicitudes
            </p>

            <p className="mt-2 text-sm text-slate">{errorCarga}</p>

            <button
              onClick={() => void recargarSolicitudes()}
              className="btn btn-primary mt-5"
            >
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !errorCarga && solicitudesVisibles.length === 0 && (
          <div className="leaf relative overflow-hidden border border-dashed border-frost bg-white/70 p-12 text-center">
            <FormaOrganica className="-right-10 -top-12 h-44 w-44 text-sky/70" />

            <div className="relative">
              <p className="font-display text-2xl font-extrabold text-navy">
                No encontramos solicitudes
              </p>

              <p className="mx-auto mt-2 max-w-sm text-sm text-slate">
                Prueba con otra búsqueda o quita algunos filtros para ver más
                resultados.
              </p>

              <button
                onClick={() => setFiltros(FILTROS_VACIOS)}
                className="btn btn-primary mt-6"
              >
                Restablecer filtros
              </button>
            </div>
          </div>
        )}

        {!cargando && !errorCarga && solicitudesVisibles.length > 0 && (
          <ListaDeSolicitudes
            solicitudes={solicitudesVisibles}
            ahora={ahora}
            claveDeHoy={claveDeHoy}
          />
        )}
      </div>
    </div>
  );
}
