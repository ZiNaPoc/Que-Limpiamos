import { useState } from "react";
import { useAhora } from "../hooks/useAhora";
import { useSolicitudes } from "../data/SolicitudesContext";
import { useTrabajadores } from "../data/TrabajadoresContext";
import type { FiltrosDeSolicitudes } from "../data/tipos";
import { filtrarSolicitudes, FILTROS_VACIOS } from "../utils/consultasDeSolicitudes";
import { obtenerClaveDeFecha } from "../utils/fechas";
import { BarraDeFiltrosDeSolicitudes } from "../components/solicitudes/BarraDeFiltrosDeSolicitudes";
import { DetalleDeSolicitud } from "../components/solicitudes/DetalleDeSolicitud";
import { ListaDeSolicitudes } from "../components/solicitudes/ListaDeSolicitudes";
import { InsigniaDeDatosDeDemostracion } from "../components/comunes/Insignias";
import { FormaOrganica } from "../components/comunes/FormasOrganicas";

type SolicitudesPageProps = {
  filtrosIniciales: FiltrosDeSolicitudes;
  idDeSolicitudAbierta: string | null;
};

export function SolicitudesPage({ filtrosIniciales, idDeSolicitudAbierta }: SolicitudesPageProps) {
  const { solicitudes } = useSolicitudes();
  const { trabajadores } = useTrabajadores();
  const ahora = useAhora();
  const claveDeHoy = obtenerClaveDeFecha(ahora);
  const [filtros, setFiltros] = useState<FiltrosDeSolicitudes>(filtrosIniciales);
  const [idDeSolicitudSeleccionada, setIdDeSolicitudSeleccionada] = useState<string | null>(idDeSolicitudAbierta);

  const solicitudSeleccionada = solicitudes.find((solicitud) => solicitud.id === idDeSolicitudSeleccionada);
  if (solicitudSeleccionada) {
    return <DetalleDeSolicitud key={solicitudSeleccionada.id} solicitud={solicitudSeleccionada} onVolver={() => setIdDeSolicitudSeleccionada(null)} />;
  }

  const solicitudesVisibles = filtrarSolicitudes(solicitudes, filtros, claveDeHoy, trabajadores);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-extrabold text-navy">Gestión de solicitudes</h1>
        <InsigniaDeDatosDeDemostracion />
      </div>
      <p className="mt-2 text-sm text-slate">Consulta cada solicitud, sus fotografías y asigna trabajador.</p>

      <div className="mt-8">
        <BarraDeFiltrosDeSolicitudes filtros={filtros} totalDeSolicitudes={solicitudes.length} solicitudesVisibles={solicitudesVisibles.length} onCambiarFiltros={setFiltros} onRestablecerFiltros={() => setFiltros(FILTROS_VACIOS)} />
      </div>

      <div className="mt-6">
        {solicitudesVisibles.length > 0 && <ListaDeSolicitudes solicitudes={solicitudesVisibles} ahora={ahora} claveDeHoy={claveDeHoy} onAbrirSolicitud={setIdDeSolicitudSeleccionada} />}
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
