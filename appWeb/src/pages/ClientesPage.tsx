import { useEffect, useState } from "react";
import { useAhora } from "../hooks/useAhora";
import { useClientes } from "../data/ClientesContext";
import { useReportes } from "../data/ReportesContext";
import { useSolicitudes } from "../data/SolicitudesContext";
import type { AperturaDelPanel, Cliente, DocumentoDeCliente, EstadoDeDocumento, EstadoDeVerificacion, FiltroDeVerificacion, Navegar, ResultadoDeOperacion } from "../data/tipos";
import { contarDocumentosPorEstado, listarDocumentos, SECCIONES_DE_DOCUMENTOS } from "../utils/documentosDeClientes";
import { obtenerClaveDeFecha } from "../utils/fechas";
import { describirHorario, formatearFechaNumerica, normalizarTexto } from "../utils/formato";
import { VentanaDeRevisionDeDocumento } from "../components/clientes/VentanaDeRevisionDeDocumento";
import { AvisoTemporal } from "../components/comunes/AvisoTemporal";
import { Icono } from "../components/comunes/Icono";
import { InsigniaDeDatosDeDemostracion, InsigniaDeEstado } from "../components/comunes/Insignias";
import { TarjetaDeIndicador } from "../components/comunes/TarjetaDeIndicador";

// Los clientes se registran en la app y editan sus datos desde «Mi perfil».
// El panel los consulta, revisa su INE y muestra su actividad; no edita su información.

const ESTADOS_DE_VERIFICACION: EstadoDeVerificacion[] = ["Por verificar", "Verificada", "Rechazada"];

function claseDelFiltro(estaActivo: boolean) {
  const claseBase = "cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition duration-300";
  return estaActivo ? `${claseBase} bg-navy text-white` : `${claseBase} bg-white text-storm hover:bg-sky/50`;
}

// Tarjeta de un documento en el perfil del cliente: vista previa, estado y acceso a la revisión.
function TarjetaDeDocumento({ documento, onRevisar }: { documento: DocumentoDeCliente; onRevisar: () => void }) {
  const esPendiente = documento.estado === "Pendiente";
  return (
    <div className={`overflow-hidden rounded-2xl bg-beige ${esPendiente ? "ring-2 ring-ochre/60" : ""}`}>
      <button onClick={onRevisar} aria-label={`${esPendiente ? "Revisar" : "Ver"} ${documento.tipo}`} className="group block w-full cursor-pointer bg-moon">
        {documento.archivo?.formato === "imagen" && <img src={documento.archivo.url} alt="" className="aspect-[8/5] w-full object-cover transition duration-500 ease-soft group-hover:scale-105" />}
        {documento.archivo?.formato === "pdf" && (
          <span className="grid aspect-[8/5] place-items-center text-slate">
            <span className="text-center">
              <Icono nombre="reportes" className="mx-auto h-10 w-10 text-lagoon" />
              <span className="mt-2 block text-xs font-bold">Documento PDF</span>
            </span>
          </span>
        )}
        {!documento.archivo && <span className="grid aspect-[8/5] place-items-center text-sm text-slate">Sin archivo</span>}
      </button>
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-bold text-navy">{documento.tipo}</span>
          <InsigniaDeEstado estado={documento.estado} />
        </div>
        <p className="mt-1 text-xs text-slate">Enviado el {documento.fechaDeEnvio ? formatearFechaNumerica(documento.fechaDeEnvio) : "—"}</p>
        {documento.estado === "Rechazado" && <p className="mt-2 rounded-xl bg-mist/70 p-2 text-xs text-storm">{documento.motivoDeRechazo}</p>}
        <button onClick={onRevisar} className={`btn mt-3 w-full ${esPendiente ? "btn-primary" : "btn-quiet"}`}>
          <Icono nombre={esPendiente ? "palomita" : "ojo"} className="h-4 w-4" />
          {esPendiente ? "Revisar documento" : "Ver documento"}
        </button>
      </div>
    </div>
  );
}

// «Validación de documentos»: cola de documentos por estado. Cada fila abre la ventana de revisión.
function SeccionDeValidacionDeDocumentos({ seccionInicial, onRevisarDocumento }: { seccionInicial: EstadoDeDocumento; onRevisarDocumento: (idDelDocumento: string) => void }) {
  const { clientes } = useClientes();
  const [seccion, setSeccion] = useState<EstadoDeDocumento>(seccionInicial);
  const conteo = contarDocumentosPorEstado(clientes);
  const nombres = new Map(clientes.map((cliente) => [cliente.id, cliente.nombre]));
  const documentos = listarDocumentos(clientes)
    .filter((documento) => documento.estado === seccion)
    .sort((a, b) => {
      // Pendientes: los más antiguos primero (llevan más tiempo esperando). Revisados: los más recientes primero.
      const fechaA = new Date((seccion === "Pendiente" ? a.fechaDeEnvio : a.fechaDeRevision) ?? 0).getTime();
      const fechaB = new Date((seccion === "Pendiente" ? b.fechaDeEnvio : b.fechaDeRevision) ?? 0).getTime();
      return seccion === "Pendiente" ? fechaA - fechaB : fechaB - fechaA;
    });

  const mensajesVacios: Record<EstadoDeDocumento, string> = {
    Pendiente: "No hay documentos por validar.",
    Aprobado: "Todavía no hay documentos confirmados.",
    Rechazado: "No hay documentos rechazados.",
  };

  return (
    <section aria-labelledby="titulo-de-validacion" className="mt-10">
      <h2 id="titulo-de-validacion" className="flex items-center gap-2 font-display text-2xl font-extrabold text-navy">
        <Icono nombre="identificacion" className="h-6 w-6 text-lagoon" />
        Validación de documentos
      </h2>
      <p className="mt-1 text-sm text-slate">INE (frente y reverso) que los clientes envían al registrarse en la app.</p>

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Documentos por estado">
        {SECCIONES_DE_DOCUMENTOS.map(({ estado, etiqueta }) => {
          const estaActiva = seccion === estado;
          const requiereAtencion = estado === "Pendiente" && conteo.Pendiente > 0;
          return (
            <button key={estado} role="tab" aria-selected={estaActiva} onClick={() => setSeccion(estado)} className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition duration-300 ${estaActiva ? "bg-navy text-white" : "bg-white text-storm hover:bg-sky/50"}`}>
              Documentación {etiqueta.toLowerCase()}
              <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] ${requiereAtencion ? "bg-ochre text-white" : estaActiva ? "bg-white/20" : "bg-moon text-clay"}`}>{conteo[estado]}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" aria-label={`Documentación ${SECCIONES_DE_DOCUMENTOS.find((item) => item.estado === seccion)?.etiqueta.toLowerCase()}`}>
        {documentos.length === 0 && <p className="mt-4 rounded-2xl bg-white p-8 text-center text-sm text-slate">{mensajesVacios[seccion]}</p>}
        <ul className="mt-4 space-y-3">
          {documentos.map((documento) => (
            <li key={documento.id}>
              <div className={`surface leaf-sm grid items-center gap-3 px-5 py-4 sm:grid-cols-[1.2fr_1fr_1fr_auto] ${documento.estado === "Pendiente" ? "border-l-4 border-ochre" : ""}`}>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-navy">{nombres.get(documento.idDelCliente) ?? documento.idDelCliente}</span>
                  <span className="block text-xs text-slate">{documento.idDelCliente}</span>
                </span>
                <span className="text-sm text-storm">
                  {documento.tipo}
                  <span className="block text-xs text-slate">{documento.archivo ? (documento.archivo.formato === "pdf" ? "PDF" : "Imagen") : "Sin archivo"}</span>
                </span>
                <span className="text-xs text-slate">
                  {documento.estado === "Pendiente" ? "Enviado el " : "Revisado el "}
                  <span className="font-bold text-storm">{formatearFechaNumerica((documento.estado === "Pendiente" ? documento.fechaDeEnvio : documento.fechaDeRevision) ?? "") || "—"}</span>
                  {documento.estado === "Rechazado" && <span className="mt-0.5 block truncate text-storm">{documento.motivoDeRechazo}</span>}
                </span>
                <span className="flex items-center justify-between gap-3 sm:justify-end">
                  <InsigniaDeEstado estado={documento.estado} />
                  <button onClick={() => onRevisarDocumento(documento.id)} className={`btn ${documento.estado === "Pendiente" ? "btn-primary" : "btn-quiet"}`}>
                    {documento.estado === "Pendiente" ? "Revisar" : "Ver"}
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

type DetalleDelClienteProps = {
  cliente: Cliente;
  onVolver: () => void;
  onNavegar: Navegar;
  onRevisarDocumento: (idDelDocumento: string) => void;
};

function DetalleDelCliente({ cliente, onVolver, onNavegar, onRevisarDocumento }: DetalleDelClienteProps) {
  const { solicitudes } = useSolicitudes();
  const { reportes } = useReportes();
  const ahora = useAhora();
  const claveDeHoy = obtenerClaveDeFecha(ahora);
  const solicitudesDelCliente = solicitudes.filter((solicitud) => solicitud.idDelCliente === cliente.id).sort((a, b) => new Date(b.fechaProgramada).getTime() - new Date(a.fechaProgramada).getTime());
  const idsDeSolicitudes = solicitudesDelCliente.map((solicitud) => solicitud.id);
  const reportesDelCliente = reportes.filter((reporte) => idsDeSolicitudes.includes(reporte.idDeSolicitud));
  const calificacionesDadas = solicitudesDelCliente.filter((solicitud) => solicitud.calificacion).length;
  const canceladasPorElCliente = solicitudesDelCliente.filter((solicitud) => solicitud.cancelacion?.canceladaPor === "Cliente").length;

  const datosPersonales = [
    { etiqueta: "Teléfono", valor: cliente.telefono },
    { etiqueta: "Correo", valor: cliente.correo },
    { etiqueta: "Registro", valor: formatearFechaNumerica(cliente.fechaDeRegistro) },
  ];

  return (
    <div>
      <button onClick={onVolver} className="btn btn-quiet">
        <Icono nombre="volver" className="h-4 w-4" />
        Volver a clientes
      </button>

      <header className="mt-8 flex flex-wrap items-center gap-4">
        <span className="pebble grid h-16 w-16 place-items-center bg-navy font-display text-2xl font-extrabold text-moss">{cliente.nombre.charAt(0)}</span>
        <div>
          <h1 className="text-4xl font-extrabold text-navy">{cliente.nombre}</h1>
          <p className="mt-1 text-sm font-bold text-lagoon">{cliente.id}</p>
        </div>
      </header>

      <dl className="mt-6 grid gap-2 sm:grid-cols-3">
        {datosPersonales.map(({ etiqueta, valor }) => (
          <div key={etiqueta} className="rounded-2xl bg-white px-4 py-3 shadow-card">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate">{etiqueta}</dt>
            <dd className="mt-1 break-all text-sm font-bold text-navy">{valor}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-slate">El cliente actualiza estos datos desde «Mi perfil» en la app.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <section aria-labelledby="titulo-de-ine" className="surface leaf p-7 sm:p-9 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="titulo-de-ine" className="flex items-center gap-2 text-2xl font-extrabold text-navy">
              <Icono nombre="identificacion" className="h-6 w-6 text-lagoon" />
              Identificación oficial (INE)
            </h2>
            <InsigniaDeEstado estado={cliente.verificacion.estado} />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {cliente.documentos.map((documento) => (
              <TarjetaDeDocumento key={documento.id} documento={documento} onRevisar={() => onRevisarDocumento(documento.id)} />
            ))}
          </div>
          {cliente.verificacion.estado === "Verificada" && <p className="mt-5 rounded-2xl bg-moss/30 p-4 text-sm text-storm">Los dos lados están aprobados. La app muestra «INE · Verificada» en el perfil del cliente.</p>}
          {cliente.verificacion.estado === "Rechazada" && <p className="mt-5 rounded-2xl bg-mist/70 p-4 text-sm text-storm">Hay un documento rechazado. Se revisará de nuevo cuando el cliente lo vuelva a enviar desde la app.</p>}
        </section>

        <section aria-labelledby="titulo-de-actividad" className="surface leaf-r p-7 sm:p-9 lg:col-span-5">
          <h2 id="titulo-de-actividad" className="text-2xl font-extrabold text-navy">
            Actividad
          </h2>
          <dl className="mt-4 grid grid-cols-2 gap-2">
            {[
              { etiqueta: "Solicitudes", valor: solicitudesDelCliente.length },
              { etiqueta: "Calificaciones", valor: calificacionesDadas },
              { etiqueta: "Reportes", valor: reportesDelCliente.length },
              { etiqueta: "Canceladas por él", valor: canceladasPorElCliente },
            ].map(({ etiqueta, valor }) => (
              <div key={etiqueta} className="rounded-2xl bg-beige px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wider text-slate">{etiqueta}</dt>
                <dd className="mt-1 font-display text-2xl font-extrabold text-navy">{valor}</dd>
              </div>
            ))}
          </dl>

          <h3 className="mt-6 text-xs font-bold uppercase tracking-widest text-slate">Historial de solicitudes</h3>
          {solicitudesDelCliente.length === 0 && <p className="mt-2 rounded-2xl bg-beige p-4 text-sm text-slate">Aún no ha solicitado servicios.</p>}
          <ul className="mt-2 space-y-2">
            {solicitudesDelCliente.map((solicitud) => (
              <li key={solicitud.id}>
                <button onClick={() => onNavegar("solicitudes", { idDeSolicitud: solicitud.id })} className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-beige px-4 py-3 text-left transition duration-300 hover:bg-sky/40">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-navy">
                      {solicitud.id} · {solicitud.servicio}
                    </span>
                    <span className="block text-xs text-slate">{describirHorario(solicitud.fechaProgramada, claveDeHoy)}</span>
                  </span>
                  <InsigniaDeEstado estado={solicitud.estado} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

    </div>
  );
}

type ListaDeClientesProps = {
  filtroInicial: FiltroDeVerificacion;
  seccionDeDocumentosInicial: EstadoDeDocumento;
  onAbrirCliente: (idDelCliente: string) => void;
  onRevisarDocumento: (idDelDocumento: string) => void;
};

function ListaDeClientes({ filtroInicial, seccionDeDocumentosInicial, onAbrirCliente, onRevisarDocumento }: ListaDeClientesProps) {
  const { clientes } = useClientes();
  const { solicitudes } = useSolicitudes();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroDeVerificacion>(filtroInicial);
  const conteoDeDocumentos = contarDocumentosPorEstado(clientes);

  const textoBuscado = normalizarTexto(busqueda);
  const clientesVisibles = clientes
    .filter((cliente) => {
      const coincideConElFiltro = filtro === "Todos" || cliente.verificacion.estado === filtro;
      return coincideConElFiltro && normalizarTexto(`${cliente.id} ${cliente.nombre} ${cliente.correo} ${cliente.telefono}`).includes(textoBuscado);
    })
    .sort((a, b) => new Date(b.fechaDeRegistro).getTime() - new Date(a.fechaDeRegistro).getTime());

  function contarSolicitudes(idDelCliente: string) {
    return solicitudes.filter((solicitud) => solicitud.idDelCliente === idDelCliente).length;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-extrabold text-navy">Gestión de clientes</h1>
        <InsigniaDeDatosDeDemostracion />
      </div>
      <p className="mt-2 max-w-3xl text-sm text-slate">Usuarios registrados en la app. Revisa la INE que suben al crear su cuenta y consulta su actividad.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaDeIndicador etiqueta="Clientes" valor={clientes.length} />
        <TarjetaDeIndicador etiqueta="Documentación por validar" valor={conteoDeDocumentos.Pendiente} descripcion="Documentos esperando revisión." />
        <TarjetaDeIndicador etiqueta="Documentación confirmada" valor={conteoDeDocumentos.Aprobado} />
        <TarjetaDeIndicador etiqueta="Documentación rechazada" valor={conteoDeDocumentos.Rechazado} descripcion="El cliente debe enviarla de nuevo." />
      </div>

      <SeccionDeValidacionDeDocumentos seccionInicial={seccionDeDocumentosInicial} onRevisarDocumento={onRevisarDocumento} />

      <h2 className="mt-12 font-display text-2xl font-extrabold text-navy">Clientes registrados</h2>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Icono nombre="buscar" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input type="search" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Buscar por nombre, correo o teléfono" aria-label="Buscar clientes" className="field pl-11" />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por verificación de INE">
          {(["Todos", ...ESTADOS_DE_VERIFICACION] as FiltroDeVerificacion[]).map((opcion) => (
            <button key={opcion} onClick={() => setFiltro(opcion)} aria-pressed={filtro === opcion} className={claseDelFiltro(filtro === opcion)}>
              {opcion}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-slate" aria-live="polite">
        Mostrando <strong className="text-navy">{clientesVisibles.length}</strong> de {clientes.length} clientes
      </p>

      {clientesVisibles.length === 0 && <p className="mt-4 rounded-2xl bg-white p-10 text-center text-sm text-slate">No hay clientes que coincidan con la búsqueda o el filtro.</p>}

      {clientesVisibles.length > 0 && (
        <>
          <div className="surface leaf-sm mt-4 hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-moon/60 text-xs uppercase tracking-wider text-slate">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">Cliente</th>
                  <th scope="col" className="px-4 py-4 font-bold">Contacto</th>
                  <th scope="col" className="hidden px-4 py-4 font-bold lg:table-cell">Registro</th>
                  <th scope="col" className="hidden px-4 py-4 font-bold lg:table-cell">Solicitudes</th>
                  <th scope="col" className="px-4 py-4 font-bold">INE</th>
                  <th scope="col" className="px-6 py-4 font-bold">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist/70">
                {clientesVisibles.map((cliente) => (
                  <tr key={cliente.id} onClick={() => onAbrirCliente(cliente.id)} className="cursor-pointer transition duration-300 hover:bg-sky/25">
                    <td className="px-6 py-4">
                      <span className="block font-bold text-navy">{cliente.nombre}</span>
                      <span className="block text-xs text-slate">{cliente.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="block">{cliente.correo}</span>
                      <span className="block text-xs text-slate">{cliente.telefono}</span>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-4 text-slate lg:table-cell">{formatearFechaNumerica(cliente.fechaDeRegistro)}</td>
                    <td className="hidden px-4 py-4 font-bold text-navy lg:table-cell">{contarSolicitudes(cliente.id)}</td>
                    <td className="px-4 py-4">
                      <InsigniaDeEstado estado={cliente.verificacion.estado} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(evento) => {
                          evento.stopPropagation();
                          onAbrirCliente(cliente.id);
                        }}
                        className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-bold text-lagoon transition duration-300 hover:bg-sky/50"
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-4 space-y-3 md:hidden">
            {clientesVisibles.map((cliente) => (
              <li key={cliente.id}>
                <button onClick={() => onAbrirCliente(cliente.id)} className="surface leaf-sm w-full cursor-pointer p-5 text-left">
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-bold text-navy">{cliente.nombre}</span>
                    <InsigniaDeEstado estado={cliente.verificacion.estado} />
                  </span>
                  <span className="mt-1 block text-sm text-slate">{cliente.correo}</span>
                  <span className="block text-xs text-slate">
                    {cliente.telefono} · {contarSolicitudes(cliente.id) === 1 ? "1 solicitud" : `${contarSolicitudes(cliente.id)} solicitudes`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

type ClientesPageProps = {
  apertura: AperturaDelPanel;
  onNavegar: Navegar;
};

export function ClientesPage({ apertura, onNavegar }: ClientesPageProps) {
  const { clientes } = useClientes();
  const [idDelClienteAbierto, setIdDelClienteAbierto] = useState<string | null>(apertura.idDelCliente ?? null);
  const [idDelDocumentoEnRevision, setIdDelDocumentoEnRevision] = useState<string | null>(null);
  const [aviso, setAviso] = useState<ResultadoDeOperacion | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [idDelClienteAbierto]);

  const clienteAbierto = clientes.find((cliente) => cliente.id === idDelClienteAbierto);

  return (
    <>
      <div key={clienteAbierto ? clienteAbierto.id : "lista"} className="fade">
        {clienteAbierto && <DetalleDelCliente cliente={clienteAbierto} onVolver={() => setIdDelClienteAbierto(null)} onNavegar={onNavegar} onRevisarDocumento={setIdDelDocumentoEnRevision} />}
        {!clienteAbierto && (
          <ListaDeClientes
            filtroInicial={apertura.filtroDeVerificacion ?? "Todos"}
            seccionDeDocumentosInicial={apertura.seccionDeDocumentos ?? "Pendiente"}
            onAbrirCliente={setIdDelClienteAbierto}
            onRevisarDocumento={setIdDelDocumentoEnRevision}
          />
        )}
      </div>
      {idDelDocumentoEnRevision && <VentanaDeRevisionDeDocumento key={idDelDocumentoEnRevision} idDelDocumento={idDelDocumentoEnRevision} onCerrar={() => setIdDelDocumentoEnRevision(null)} onResultado={setAviso} />}
      {aviso && <AvisoTemporal aviso={aviso} onTerminar={() => setAviso(null)} />}
    </>
  );
}
