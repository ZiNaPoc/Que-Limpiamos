import { describirHorario, describirTiempoDesdeCreacion } from "../../utils/formato";
import { useTrabajadores } from "../../data/TrabajadoresContext";
import { buscarTrabajador } from "../../data/trabajadores";
import type { EstadoDeSolicitud, Solicitud } from "../../data/tipos";
import { InsigniaDeEstado } from "../comunes/Insignias";

type ListaDeSolicitudesProps = {
  solicitudes: Solicitud[];
  ahora: Date;
  claveDeHoy: string;
  onAbrirSolicitud: (idDeSolicitud: string) => void;
};

const COLOR_DEL_BORDE_POR_ESTADO: Record<EstadoDeSolicitud, string> = {
  Pendiente: "border-ochre",
  Confirmado: "border-steel",
  Realizado: "border-sage",
  Cancelado: "border-frost",
};

function NombreDelTrabajadorAsignado({ solicitud }: { solicitud: Solicitud }) {
  const { trabajadores } = useTrabajadores();
  const trabajador = buscarTrabajador(trabajadores, solicitud.idDelTrabajador);
  if (!trabajador) {
    return <span className="font-bold text-clay">Sin asignar</span>;
  }
  return <span>{trabajador.nombre}</span>;
}

export function ListaDeSolicitudes({ solicitudes, ahora, claveDeHoy, onAbrirSolicitud }: ListaDeSolicitudesProps) {
  return (
    <>
      <div className="surface leaf-sm hidden overflow-hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-moon/60 text-xs uppercase tracking-wider text-slate">
            <tr>
              <th scope="col" className="px-6 py-4 font-bold">Id</th>
              <th scope="col" className="px-4 py-4 font-bold">Cliente</th>
              <th scope="col" className="px-4 py-4 font-bold">Servicio</th>
              <th scope="col" className="px-4 py-4 font-bold">Horario</th>
              <th scope="col" className="hidden px-4 py-4 font-bold xl:table-cell">Solicitada</th>
              <th scope="col" className="hidden px-4 py-4 font-bold lg:table-cell">Trabajador</th>
              <th scope="col" className="px-6 py-4 font-bold">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mist/70">
            {solicitudes.map((solicitud) => (
              <tr key={solicitud.id} onClick={() => onAbrirSolicitud(solicitud.id)} className="cursor-pointer transition duration-300 hover:bg-sky/25">
                <td className={`border-l-4 px-6 py-4 ${COLOR_DEL_BORDE_POR_ESTADO[solicitud.estado]}`}>
                  <button
                    onClick={(evento) => {
                      evento.stopPropagation();
                      onAbrirSolicitud(solicitud.id);
                    }}
                    aria-label={`Ver detalle de la solicitud ${solicitud.id}`}
                    className="cursor-pointer rounded-full bg-navy px-3 py-1 text-xs font-bold text-white"
                  >
                    {solicitud.id}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <span className="block font-bold text-navy">{solicitud.nombreDelCliente}</span>
                  <span className="block text-xs text-slate">{solicitud.usuarioDelCliente}</span>
                </td>
                <td className="px-4 py-4">{solicitud.servicio}</td>
                <td className="whitespace-nowrap px-4 py-4 font-bold text-navy">{describirHorario(solicitud.fechaProgramada, claveDeHoy)}</td>
                <td className="hidden whitespace-nowrap px-4 py-4 text-slate xl:table-cell">{describirTiempoDesdeCreacion(solicitud.fechaDeCreacion, ahora)}</td>
                <td className="hidden px-4 py-4 lg:table-cell">
                  <NombreDelTrabajadorAsignado solicitud={solicitud} />
                </td>
                <td className="px-6 py-4">
                  <InsigniaDeEstado estado={solicitud.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-4 md:hidden">
        {solicitudes.map((solicitud) => (
          <li key={solicitud.id}>
            <button onClick={() => onAbrirSolicitud(solicitud.id)} className={`surface leaf-sm w-full cursor-pointer border-l-4 p-5 text-left transition duration-300 active:scale-[0.99] ${COLOR_DEL_BORDE_POR_ESTADO[solicitud.estado]}`}>
              <span className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">{solicitud.id}</span>
                <InsigniaDeEstado estado={solicitud.estado} />
              </span>
              <span className="mt-3 block font-bold text-navy">{solicitud.nombreDelCliente}</span>
              <span className="block text-sm text-slate">{solicitud.servicio}</span>
              <span className="mt-3 block text-sm font-bold text-navy">{describirHorario(solicitud.fechaProgramada, claveDeHoy)}</span>
              <span className="mt-1 block text-xs text-slate">Solicitada {describirTiempoDesdeCreacion(solicitud.fechaDeCreacion, ahora)}</span>
              <span className="mt-1 block text-xs text-slate">
                Trabajador: <NombreDelTrabajadorAsignado solicitud={solicitud} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
