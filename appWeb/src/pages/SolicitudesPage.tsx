import { useState } from "react";
import { useAhora } from "../hooks/useAhora";
import { useClientes } from "../data/ClientesContext";
import { useSolicitudes } from "../data/SolicitudesContext";
import { useTrabajadores } from "../data/TrabajadoresContext";
import type { AperturaDelPanel, FiltrosDeSolicitudes, Navegar } from "../data/tipos";
import { filtrarSolicitudes, FILTROS_VACIOS } from "../utils/consultasDeSolicitudes";
import { obtenerClaveDeFecha } from "../utils/fechas";
import { BarraDeFiltrosDeSolicitudes } from "../components/solicitudes/BarraDeFiltrosDeSolicitudes";
import { DetalleDeSolicitud } from "../components/solicitudes/DetalleDeSolicitud";
import { ListaDeSolicitudes } from "../components/solicitudes/ListaDeSolicitudes";
import { InsigniaDeDatosDeDemostracion } from "../components/comunes/Insignias";
import { FormaOrganica } from "../components/comunes/FormasOrganicas";

type SolicitudesPageProps = {
  apertura: AperturaDelPanel;
  onNavegar: Navegar;
};

// Lista con búsqueda y filtros; al elegir una se abre su detalle, que es donde se avanza el flujo.
// Si se llegó desde otra pantalla, puede venir con filtros puestos o con una solicitud ya abierta.
// Si hay muchas solicitudes, los filtros de esta pantalla se mandarían al back como parámetros y la lista vendría paginada.
export function SolicitudesPage({ apertura, onNavegar }: SolicitudesPageProps) {
  const { solicitudes } = useSolicitudes();
  const { trabajadores } = useTrabajadores();
  const { clientes } = useClientes();
  const ahora = useAhora();
  const claveDeHoy = obtenerClaveDeFecha(ahora);
  // Filtros activos (pueden venir ya puestos desde el Inicio).
  const [filtros, setFiltros] = useState<FiltrosDeSolicitudes>(apertura.filtrosDeSolicitudes ?? FILTROS_VACIOS);
  // Id de la solicitud abierta. Si es null se ve la lista; si trae un id se ve su detalle.
  const [idDeSolicitudSeleccionada, setIdDeSolicitudSeleccionada] = useState<string | null>(apertura.idDeSolicitud ?? null);

  // Si hay una solicitud elegida, se muestra su detalle en lugar de la lista.
  const solicitudSeleccionada = solicitudes.find((solicitud) => solicitud.id === idDeSolicitudSeleccionada);
  if (solicitudSeleccionada) {
    return <DetalleDeSolicitud key={solicitudSeleccionada.id} solicitud={solicitudSeleccionada} onVolver={() => setIdDeSolicitudSeleccionada(null)} onNavegar={onNavegar} />;
  }

  // Solicitudes que pasan los filtros (las más nuevas primero).
  const solicitudesVisibles = filtrarSolicitudes(solicitudes, filtros, claveDeHoy, trabajadores, clientes);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-extrabold text-navy">Gestión de solicitudes</h1>
        <InsigniaDeDatosDeDemostracion />
      </div>
      <p className="mt-2 max-w-3xl text-sm text-slate">Solicitudes que los clientes envían desde la app. Asigna o confirma al colaborador y avanza cada solicitud por el mismo seguimiento que ve el cliente: solicitud enviada, asignando colaborador, servicio confirmado y servicio finalizado.</p>

      <div className="mt-8">
        <BarraDeFiltrosDeSolicitudes filtros={filtros} totalDeSolicitudes={solicitudes.length} solicitudesVisibles={solicitudesVisibles.length} onCambiarFiltros={setFiltros} onRestablecerFiltros={() => setFiltros(FILTROS_VACIOS)} />
      </div>

      <div className="mt-6">
        {/* Lista de resultados. Al hacer clic en una solicitud se abre su detalle. */}
        {solicitudesVisibles.length > 0 && <ListaDeSolicitudes solicitudes={solicitudesVisibles} ahora={ahora} claveDeHoy={claveDeHoy} onAbrirSolicitud={setIdDeSolicitudSeleccionada} />}
        {/* Mensaje si ningún resultado coincide con los filtros, con botón para quitarlos. */}
        {solicitudesVisibles.length === 0 && (
          <div className="leaf relative overflow-hidden border border-dashed border-frost bg-white/70 p-12 text-center">
            <FormaOrganica className="-right-10 -top-12 h-44 w-44 text-sky/70" />
            <div className="relative">
              <p className="font-display text-2xl font-extrabold text-navy">No encontramos solicitudes</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate">Prueba con otra búsqueda o quita algunos filtros para ver más resultados.</p>
              <button onClick={() => setFiltros(FILTROS_VACIOS)} className="btn btn-primary mt-6">
                Restablecer filtros
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
