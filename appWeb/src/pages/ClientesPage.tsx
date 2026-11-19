import { useEffect, useState } from "react";
import { useClientes } from "../data/ClientesContext";
import type { AperturaDelPanel, Cliente, DocumentoDeCliente, FiltroDeVerificacion, ResultadoDeOperacion } from "../data/tipos";
import { contarClientesPorVerificacion, SECCIONES_DE_VERIFICACION } from "../utils/documentosDeClientes";
import { formatearFechaNumerica, normalizarTexto } from "../utils/formato";
import { VentanaDeRevisionDeIne } from "../components/clientes/VentanaDeRevisionDeIne";
import { AvisoTemporal } from "../components/comunes/AvisoTemporal";
import { Icono } from "../components/comunes/Icono";
import { InsigniaDeDatosDeDemostracion, InsigniaDeEstado } from "../components/comunes/Insignias";
import { TarjetaDeIndicador } from "../components/comunes/TarjetaDeIndicador";

// Estilo del botón de filtro: resaltado si es el elegido.
function claseDelFiltro(estaActivo: boolean) {
  const claseBase = "flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition duration-300";
  return estaActivo ? `${claseBase} bg-navy text-white` : `${claseBase} bg-white text-storm hover:bg-sky/50`;
}

// Tarjeta de un lado de la INE (frente o reverso): muestra la imagen, un ícono si es PDF, o "Sin archivo". Al hacer clic abre la ventana de revisión.
function TarjetaDeLadoDeIne({ documento, onAbrir }: { documento: DocumentoDeCliente; onAbrir: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-beige">
      <button onClick={onAbrir} aria-label={`Ver ${documento.tipo}`} className="group block w-full cursor-pointer bg-moon">
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
      <div className="px-4 py-3">
        <span className="text-sm font-bold text-navy">{documento.tipo}</span>
        <p className="mt-0.5 text-xs text-slate">Enviado el {documento.fechaDeEnvio ? formatearFechaNumerica(documento.fechaDeEnvio) : "—"}</p>
      </div>
    </div>
  );
}

// Datos y botones que recibe el detalle: el cliente, volver y abrir la revisión de INE.
type DetalleDelClienteProps = {
  cliente: Cliente;
  onVolver: () => void;
  onRevisarIne: () => void;
};

// Detalle de un cliente: datos personales (se actualizan desde "Mi perfil" en la app móvil) y el estado de su INE.
// Si la INE fue aprobada o rechazada, lo explica (con el motivo del rechazo). El botón abre la ventana de revisión.
function DetalleDelCliente({ cliente, onVolver, onRevisarIne }: DetalleDelClienteProps) {
  const { verificacion } = cliente;
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

      <section aria-label="Datos personales">
        <dl className="mt-6 grid gap-2 sm:grid-cols-3">
          {datosPersonales.map(({ etiqueta, valor }) => (
            <div key={etiqueta} className="rounded-2xl bg-white px-4 py-3 shadow-card">
              <dt className="text-xs font-bold uppercase tracking-wider text-slate">{etiqueta}</dt>
              <dd className="mt-1 break-all text-sm font-bold text-navy">{valor}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-slate">El cliente actualiza estos datos desde «Mi perfil» en la app.</p>
      </section>

      <section aria-labelledby="titulo-de-ine" className="surface leaf mt-8 p-7 sm:p-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="titulo-de-ine" className="flex items-center gap-2 text-2xl font-extrabold text-navy">
            <Icono nombre="identificacion" className="h-6 w-6 text-lagoon" />
            Identificación oficial (INE)
          </h2>
          <InsigniaDeEstado estado={verificacion.estado} />
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {cliente.documentos.map((documento) => (
            <TarjetaDeLadoDeIne key={documento.id} documento={documento} onAbrir={onRevisarIne} />
          ))}
        </div>

        {verificacion.estado === "Verificada" && <p className="mt-5 rounded-2xl bg-moss/30 p-4 text-sm text-storm">INE aprobada{verificacion.fechaDeRevision ? ` el ${formatearFechaNumerica(verificacion.fechaDeRevision)}` : ""}. El cliente ve «Verificada» en su perfil de la app.</p>}
        {verificacion.estado === "Rechazada" && (
          <div className="mt-5 rounded-2xl bg-mist/70 p-4 text-sm text-storm">
            <p className="font-bold text-navy">Motivo del rechazo</p>
            <p className="mt-1">{verificacion.motivoDeRechazo || "No se registró un motivo."}</p>
            <p className="mt-2 text-xs text-slate">Se revisará de nuevo cuando el cliente vuelva a enviar su INE desde la app.</p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={onRevisarIne} className={`btn ${verificacion.estado === "Pendiente" ? "btn-primary" : "btn-quiet"}`}>
            <Icono nombre={verificacion.estado === "Pendiente" ? "palomita" : "ojo"} className="h-4 w-4" />
            {verificacion.estado === "Pendiente" ? "Revisar INE" : "Ver INE"}
          </button>
        </div>
      </section>
    </div>
  );
}

// Datos que recibe la lista: filtro inicial y qué hacer al abrir un cliente o revisar su INE.
type ListaDeClientesProps = {
  filtroInicial: FiltroDeVerificacion;
  onAbrirCliente: (idDelCliente: string) => void;
  onRevisarIne: (idDelCliente: string) => void;
};

// Lista de clientes con búsqueda y filtro por estado de la INE (por validar, aprobada, rechazada o todos).
// Se necsita a usuarios con rol cliente, con su estado de verificación y los documentos (frente y reverso) de su INE.
// Va en el orden de primero las INE pendientes (las que llevan más tiempo esperando, arriba) y luego el resto (los más recientes primero).
function ListaDeClientes({ filtroInicial, onAbrirCliente, onRevisarIne }: ListaDeClientesProps) {
  const { clientes } = useClientes();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroDeVerificacion>(filtroInicial);
  // Cuántos clientes hay en cada estado de INE.
  const conteo = contarClientesPorVerificacion(clientes);

  const textoBuscado = normalizarTexto(busqueda);
  // Clientes que cumplen el filtro y la búsqueda (por id, nombre, correo o teléfono).
  const clientesVisibles = clientes
    .filter((cliente) => {
      const coincideConElFiltro = filtro === "Todos" || cliente.verificacion.estado === filtro;
      return coincideConElFiltro && normalizarTexto(`${cliente.id} ${cliente.nombre} ${cliente.correo} ${cliente.telefono}`).includes(textoBuscado);
    })
    .sort((a, b) => {
      const pendienteA = a.verificacion.estado === "Pendiente" ? 0 : 1;
      const pendienteB = b.verificacion.estado === "Pendiente" ? 0 : 1;
      if (pendienteA !== pendienteB) {
        return pendienteA - pendienteB;
      }
      const diferencia = new Date(a.fechaDeRegistro).getTime() - new Date(b.fechaDeRegistro).getTime();
      return pendienteA === 0 ? diferencia : -diferencia;
    });

     // Botones de filtro con el número de clientes de cada estado. El de pendientes se resalta si hay alguno.
  const opcionesDeFiltro: { valor: FiltroDeVerificacion; etiqueta: string; cantidad: number }[] = [
    ...SECCIONES_DE_VERIFICACION.map(({ estado, etiqueta }) => ({ valor: estado as FiltroDeVerificacion, etiqueta: `INE ${etiqueta.toLowerCase()}`, cantidad: conteo[estado] })),
    { valor: "Todos", etiqueta: "Todos", cantidad: clientes.length },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-extrabold text-navy">Gestión de clientes</h1>
        <InsigniaDeDatosDeDemostracion />
      </div>
      <p className="mt-2 max-w-3xl text-sm text-slate">Clientes registrados en la app. Al crear su cuenta envían el frente y el reverso de su INE; aquí se revisa y se aprueba o rechaza.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaDeIndicador etiqueta="Clientes registrados" valor={clientes.length} />
        <TarjetaDeIndicador etiqueta="INE por validar" valor={conteo.Pendiente} descripcion="Esperando revisión." />
        <TarjetaDeIndicador etiqueta="INE aprobadas" valor={conteo.Verificada} />
        <TarjetaDeIndicador etiqueta="INE rechazadas" valor={conteo.Rechazada} descripcion="El cliente debe enviarla de nuevo." />
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por validación de INE">
          {opcionesDeFiltro.map(({ valor, etiqueta, cantidad }) => {
            const requiereAtencion = valor === "Pendiente" && cantidad > 0;
            return (
              <button key={valor} onClick={() => setFiltro(valor)} aria-pressed={filtro === valor} className={claseDelFiltro(filtro === valor)}>
                {etiqueta}
                <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] ${requiereAtencion ? "bg-ochre text-white" : filtro === valor ? "bg-white/20" : "bg-moon text-clay"}`}>{cantidad}</span>
              </button>
            );
          })}
        </div>
        <div className="relative flex-1 lg:max-w-sm lg:ml-auto">
          <Icono nombre="buscar" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input type="search" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Buscar por nombre, correo o teléfono" aria-label="Buscar clientes" className="field pl-11" />
        </div>
      </div>

      <p className="mt-4 text-sm text-slate" aria-live="polite">
        Mostrando <strong className="text-navy">{clientesVisibles.length}</strong> de {clientes.length} clientes
      </p>

      {clientesVisibles.length === 0 && <p className="mt-4 rounded-2xl bg-white p-10 text-center text-sm text-slate">{filtro === "Pendiente" && busqueda.trim() === "" ? "No hay INE por validar." : "No hay clientes que coincidan con la búsqueda o el filtro."}</p>}

      {clientesVisibles.length > 0 && (
        <>
          <div className="surface leaf-sm mt-4 hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-moon/60 text-xs uppercase tracking-wider text-slate">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">Cliente</th>
                  <th scope="col" className="px-4 py-4 font-bold">Contacto</th>
                  <th scope="col" className="hidden px-4 py-4 font-bold lg:table-cell">INE enviada</th>
                  <th scope="col" className="px-4 py-4 font-bold">INE</th>
                  <th scope="col" className="px-6 py-4 font-bold">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist/70">
                {clientesVisibles.map((cliente) => {
                  const esPendiente = cliente.verificacion.estado === "Pendiente";
                  return (
                    <tr key={cliente.id} className="transition duration-300 hover:bg-sky/25">
                      <td className={`border-l-4 px-6 py-4 ${esPendiente ? "border-ochre" : "border-transparent"}`}>
                        <span className="block font-bold text-navy">{cliente.nombre}</span>
                        <span className="block text-xs text-slate">{cliente.id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="block">{cliente.correo}</span>
                        <span className="block text-xs text-slate">{cliente.telefono}</span>
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-4 text-slate lg:table-cell">{formatearFechaNumerica(cliente.documentos[0]?.fechaDeEnvio ?? cliente.fechaDeRegistro)}</td>
                      <td className="px-4 py-4">
                        <InsigniaDeEstado estado={cliente.verificacion.estado} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex justify-end gap-2">
                          <button onClick={() => onRevisarIne(cliente.id)} className={`btn ${esPendiente ? "btn-primary" : "btn-quiet"}`}>
                            {esPendiente ? "Revisar INE" : "Ver INE"}
                          </button>
                          <button onClick={() => onAbrirCliente(cliente.id)} className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-bold text-lagoon transition duration-300 hover:bg-sky/50">
                            Ver detalles
                          </button>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="mt-4 space-y-3 md:hidden">
            {clientesVisibles.map((cliente) => {
              const esPendiente = cliente.verificacion.estado === "Pendiente";
              return (
                <li key={cliente.id} className={`surface leaf-sm p-5 ${esPendiente ? "border-l-4 border-ochre" : ""}`}>
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-bold text-navy">{cliente.nombre}</span>
                    <InsigniaDeEstado estado={cliente.verificacion.estado} />
                  </span>
                  <span className="mt-1 block text-sm text-slate">{cliente.correo}</span>
                  <span className="block text-xs text-slate">{cliente.telefono}</span>
                  <span className="mt-3 flex gap-2">
                    <button onClick={() => onRevisarIne(cliente.id)} className={`btn flex-1 ${esPendiente ? "btn-primary" : "btn-quiet"}`}>
                      {esPendiente ? "Revisar INE" : "Ver INE"}
                    </button>
                    <button onClick={() => onAbrirCliente(cliente.id)} className="btn btn-quiet flex-1">
                      Ver detalles
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

// Clientes: lista, detalle y revisión de INE
//lista - "Ver detalles" abre al cliente, o "Revisar INE" abre directo la ventana de revisión - ahí se aprueba o se rechaza - el resultado sale en el aviso temporal.
// Al aprobar o rechazar en la ventana de revisión, la lista y el detalle se actualizan solos porque leen del mismo almacén.
export function ClientesPage({ apertura }: { apertura: AperturaDelPanel }) {
  const { clientes } = useClientes();
  // Cliente cuyo detalle está abierto (null = se ve la lista).
  const [idDelClienteAbierto, setIdDelClienteAbierto] = useState<string | null>(apertura.idDelCliente ?? null);
  // Cliente cuya INE se está revisando (null = ventana cerrada).
  const [idDelClienteEnRevision, setIdDelClienteEnRevision] = useState<string | null>(null);
  // Resultado de la última aprobación o rechazo, para el aviso temporal.
  const [aviso, setAviso] = useState<ResultadoDeOperacion | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [idDelClienteAbierto]);

  const clienteAbierto = clientes.find((cliente) => cliente.id === idDelClienteAbierto);

  return (
    <>
      <div key={clienteAbierto ? clienteAbierto.id : "lista"} className="fade">
        {clienteAbierto && <DetalleDelCliente cliente={clienteAbierto} onVolver={() => setIdDelClienteAbierto(null)} onRevisarIne={() => setIdDelClienteEnRevision(clienteAbierto.id)} />}
        {!clienteAbierto && <ListaDeClientes filtroInicial={apertura.filtroDeVerificacion ?? "Todos"} onAbrirCliente={setIdDelClienteAbierto} onRevisarIne={setIdDelClienteEnRevision} />}
      </div>
      {/* Ventana de revisión de INE. Al decidir devuelve el resultado, que se muestra en el aviso temporal. */}
      {idDelClienteEnRevision && <VentanaDeRevisionDeIne key={idDelClienteEnRevision} idDelCliente={idDelClienteEnRevision} onCerrar={() => setIdDelClienteEnRevision(null)} onResultado={setAviso} />}
      {aviso && <AvisoTemporal aviso={aviso} onTerminar={() => setAviso(null)} />}
    </>
  );
}
