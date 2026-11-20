import {
  describirHorario,
  describirTiempoDesdeCreacion,
} from "../../utils/formato";

import type { EtapaDeSolicitud, SolicitudListado } from "../../data/tipos";

import { obtenerEtapaListado } from "../../utils/consultasDeSolicitudes";

type ListaDeSolicitudesProps = {
  solicitudes: SolicitudListado[];
  ahora: Date;
  claveDeHoy: string;
};

const COLOR_DEL_BORDE_POR_ETAPA: Record<EtapaDeSolicitud, string> = {
  "Solicitud enviada": "border-ochre",
  "Asignando colaborador": "border-lagoon",
  "Servicio confirmado": "border-steel",
  "Servicio en proceso": "border-steel",
  "Servicio finalizado": "border-sage",
  Cancelada: "border-frost",
  "Solicitud rechazada": "border-err",
};

function InsigniaDeSeguimiento({ etapa }: { etapa: EtapaDeSolicitud }) {
  return (
    <span className="inline-flex rounded-full bg-moon px-3 py-1 text-xs font-bold text-navy">
      {etapa}
    </span>
  );
}

// Muestra el colaborador asignado, o que falta asignar
function NombreDelTrabajadorAsignado({
  solicitud,
}: {
  solicitud: SolicitudListado;
}) {
  if (!solicitud.trabajador) {
    return <span className="font-bold text-clay">Sin asignar</span>;
  }
  return (
    <span>
      {solicitud.trabajador.nombre}
      <span className="block text-xs text-slate">
        {solicitud.trabajador.estado === "ACTIVO" ? "Activo" : "Inactivo"}
      </span>
    </span>
  );
}

// Nombre del cliente de la solicitud
function DatosDelCliente({ solicitud }: { solicitud: SolicitudListado }) {
  return (
    <>
      <span className="block font-bold text-navy">
        {solicitud.cliente.nombre}
      </span>

      <span className="block text-xs text-slate">
        {solicitud.cliente.telefono}
      </span>
    </>
  );
}

// Tarjetas de solicitudes; al hacer clic se abre el detalle
export function ListaDeSolicitudes({
  solicitudes,
  ahora,
  claveDeHoy,
}: ListaDeSolicitudesProps) {
  return (
    <>
      <div className="surface leaf-sm hidden overflow-hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-moon/60 text-xs uppercase tracking-wider text-slate">
            <tr>
              <th scope="col" className="px-6 py-4 font-bold">
                ID
              </th>
              <th scope="col" className="px-4 py-4 font-bold">
                Cliente
              </th>
              <th scope="col" className="px-4 py-4 font-bold">
                Servicio
              </th>
              <th scope="col" className="px-4 py-4 font-bold">
                Horario
              </th>
              <th
                scope="col"
                className="hidden px-4 py-4 font-bold xl:table-cell"
              >
                Solicitada
              </th>
              <th
                scope="col"
                className="hidden px-4 py-4 font-bold lg:table-cell"
              >
                Colaborador
              </th>
              <th scope="col" className="px-6 py-4 font-bold">
                Seguimiento
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-mist/70">
            {solicitudes.map((solicitud) => {
              const etapa = obtenerEtapaListado(solicitud);

              return (
                <tr key={solicitud.id} className="transition hover:bg-sky/25">
                  <td
                    className={`border-l-4 px-6 py-4 ${COLOR_DEL_BORDE_POR_ETAPA[etapa]}`}
                  >
                    <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">
                      {solicitud.id}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <DatosDelCliente solicitud={solicitud} />
                  </td>

                  <td className="px-4 py-4">{solicitud.servicio}</td>

                  <td className="whitespace-nowrap px-4 py-4 font-bold text-navy">
                    {describirHorario(solicitud.fechaProgramada, claveDeHoy)}
                  </td>

                  <td className="hidden whitespace-nowrap px-4 py-4 text-slate xl:table-cell">
                    {describirTiempoDesdeCreacion(
                      solicitud.fechaCreacion,
                      ahora,
                    )}
                  </td>

                  <td className="hidden px-4 py-4 lg:table-cell">
                    <NombreDelTrabajadorAsignado solicitud={solicitud} />
                  </td>

                  <td className="px-6 py-4">
                    <InsigniaDeSeguimiento etapa={etapa} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-4 md:hidden">
        {solicitudes.map((solicitud) => {
          const etapa = obtenerEtapaListado(solicitud);

          return (
            <li key={solicitud.id}>
              <article
                className={`surface leaf-sm border-l-4 p-5 ${COLOR_DEL_BORDE_POR_ETAPA[etapa]}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">
                    {solicitud.id}
                  </span>

                  <InsigniaDeSeguimiento etapa={etapa} />
                </div>

                <div className="mt-3">
                  <DatosDelCliente solicitud={solicitud} />
                </div>

                <p className="mt-1 text-sm text-slate">{solicitud.servicio}</p>

                <p className="mt-3 text-sm font-bold text-navy">
                  {describirHorario(solicitud.fechaProgramada, claveDeHoy)}
                </p>

                <p className="mt-1 text-xs text-slate">
                  Solicitada{" "}
                  {describirTiempoDesdeCreacion(
                    solicitud.fechaCreacion,
                    ahora,
                  )}
                </p>

                <p className="mt-1 text-xs text-slate">
                  Colaborador:{" "}
                  <NombreDelTrabajadorAsignado solicitud={solicitud} />
                </p>
              </article>
            </li>
          );
        })}
      </ul>
    </>
  );
}
