import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useAhora } from "../hooks/useAhora";
import { useCatalogo } from "../data/CatalogoContext";
import { buscarCliente, useClientes } from "../data/ClientesContext";
import { useSolicitudes } from "../hooks/useSolicitudes";
import { useTrabajadores, validarTrabajador, type ErroresDeTrabajador } from "../data/TrabajadoresContext";
import { buscarServiciosActivosDelTrabajador } from "../utils/reglasDeSolicitudes";
import { DOCUMENTOS_REQUERIDOS, HORARIO_PREDETERMINADO } from "../data/trabajadores";
import type { DatosDeTrabajador, HorarioDeTrabajo, Navegar, ResultadoDeOperacion, ServicioDelCatalogo, Trabajador } from "../data/tipos";
import { describirTiposPermitidos, formatearTamanoDeArchivo, TAMANO_MAXIMO_DE_ARCHIVO_EN_BYTES, TIPOS_DE_DOCUMENTO_PERMITIDOS, validarArchivo } from "../utils/archivos";

import { 
  calcularEstadoDelTrabajador, 
  //calcularReputacion,  por lo mismo de que hace falta lo del fuckin coso este que se me olvido xd
  contarServiciosDeHoy, 
  describirReputacion, 
  obtenerServiciosActivos, 
  type EstadoDelTrabajador 
} from "../utils/consultasDeTrabajadores";

import { obtenerClaveDeFecha } from "../utils/fechas";
import { describirHorario, formatearFechaNumerica } from "../utils/formato";
import { DIAS_DE_LA_SEMANA, describirHorarioDeTrabajo } from "../utils/horarios";
import { AvisoTemporal } from "../components/comunes/AvisoTemporal";
import { CampoDeFormulario } from "../components/comunes/CampoDeFormulario";
import { Icono, type NombreDeIcono } from "../components/comunes/Icono";
import { InsigniaDeDatosDeDemostracion, InsigniaDeEstado, Puntuacion } from "../components/comunes/Insignias";
import { TarjetaDeIndicador } from "../components/comunes/TarjetaDeIndicador";
import { VentanaModal } from "../components/comunes/VentanasModales";

// Qué se ve en la pantalla: la lista, el formulario de colaborador nuevo o el formulario para editar uno (con su id).
type VistaDeTrabajadores = { tipo: "lista" } | { tipo: "nuevo" } | { tipo: "editar"; idDelTrabajador: string };

// Convierte los ids de especialidades (C-01...) en los nombres de los servicios del catálogo.
function nombresDeEspecialidades(trabajador: Trabajador, servicios: ServicioDelCatalogo[]): string[] {
  return trabajador.especialidades.map((idDelServicio) => servicios.find((servicio) => servicio.id === idDelServicio)?.nombre ?? idDelServicio);
}

// Renglón de la ficha con ícono, etiqueta y valor.
function DatoDelTrabajador({ icono, etiqueta, children }: { icono: NombreDeIcono; etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-beige px-5 py-4">
      <Icono nombre={icono} className="mt-0.5 text-lagoon" />
      <div className="min-w-0">
        <dt className="text-xs font-bold uppercase tracking-wider text-slate">{etiqueta}</dt>
        <dd className="mt-0.5 break-words text-base font-bold text-navy">{children}</dd>
      </div>
    </div>
  );
}

type VentanaDeDetalleProps = {
  trabajador: Trabajador;
  onCerrar: () => void;
  onEditar: () => void;
  onNavegar: Navegar;
  onResultado: (resultado: ResultadoDeOperacion) => void;
};

// Ficha del colaborador (ventana flotante): contacto, horario, especialidades, reputación, documentos, servicios por atender y últimas 3 calificaciones.
// el colaborador + solicitudes (para reputación, estado y servicios) + catálogo (nombres de especialidades) + clientes (nombre en las calificaciones).
// Activar o Desactivar (con confirmación), Editar, y cada servicio por atender abre su detalle en Solicitudes.
// Desactivar no se puede si tiene servicios por atender; hay que reasignarlos o cancelarlos antes.
function VentanaDeDetalleDelTrabajador({ trabajador, onCerrar, onEditar, onNavegar, onResultado }: VentanaDeDetalleProps) {
  const { solicitudes } = useSolicitudes();
  const { cambiarEstadoDelTrabajador } = useTrabajadores();
  // Si se está preguntando "¿seguro?" antes de activar o desactivar.
  const [confirmandoCambioDeEstado, setConfirmandoCambioDeEstado] = useState(false);
  // Motivo por el que no se pudo cambiar el estado (se muestra en la ficha).
  const [errorDelCambioDeEstado, setErrorDelCambioDeEstado] = useState("");
  const { servicios } = useCatalogo();
  const { clientes } = useClientes();
  const ahora = useAhora();
  const claveDeHoy = obtenerClaveDeFecha(ahora);
  // Datos que se calculan para la ficha: reputación, estado de ahora, servicios por atender y las 3 calificaciones más recientes.
  //const reputacion = calcularReputacion(solicitudes:, trabajador.id);
  const estado = calcularEstadoDelTrabajador(solicitudes, trabajador, ahora);
  const serviciosActivos = obtenerServiciosActivos(solicitudes, trabajador.id);

  /*
  const calificaciones = solicitudes
    .filter((solicitud) => solicitud.idTrabajador === trabajador.id && solicitud.calificacion)
    //.sort((a, b) => new Date(b.calificacion!.fecha).getTime() - new Date(a.calificacion!.fecha).getTime())
    .slice(0, 3);
*/

  const estaActivo = trabajador.estado === "Activo";
  // Servicios por atender que impiden desactivarlo (vacío si ya está inactivo).
  const serviciosQueImpidenDesactivar = estaActivo ? buscarServiciosActivosDelTrabajador(solicitudes, trabajador.id) : [];

  // Activa o desactiva al colaborador y avisa el resultado con el aviso temporal.
  // Aquí sale el cambio de estado. Si el colaborador tiene servicios pendientes o confirmados.
  function aplicarCambioDeEstado() {
    const resultado = cambiarEstadoDelTrabajador(trabajador.id, solicitudes);
    setConfirmandoCambioDeEstado(false);
    setErrorDelCambioDeEstado(resultado.exito ? "" : resultado.mensaje);
    onResultado(resultado);
  }

  return (
    <VentanaModal idDelTitulo="titulo-del-trabajador" onCerrar={onCerrar} claseDeAncho="max-w-4xl">
      <button onClick={onCerrar} aria-label="Cerrar detalle del colaborador" className="absolute right-4 top-4 grid h-10 w-10 cursor-pointer place-items-center rounded-full text-slate transition duration-300 hover:bg-sky/50">
        <Icono nombre="cerrar" />
      </button>

      <div className="flex flex-wrap items-center gap-5 pr-10">
        <span className="pebble grid h-20 w-20 shrink-0 place-items-center bg-navy font-display text-3xl font-extrabold text-moss">{trabajador.nombre.charAt(0)}</span>
        <div className="min-w-0 flex-1">
          <h2 id="titulo-del-trabajador" className="break-words text-3xl font-extrabold leading-tight text-navy">
            {trabajador.nombre}
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-bold text-lagoon">
            #{trabajador.id}
            <InsigniaDeEstado estado={estado} />
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setConfirmandoCambioDeEstado(true)} className="btn btn-quiet">
            <Icono nombre={estaActivo ? "prohibido" : "palomita"} className="h-4 w-4" />
            {estaActivo ? "Desactivar" : "Activar"}
          </button>
          <button onClick={onEditar} className="btn btn-quiet">
            <Icono nombre="editar" className="h-4 w-4" />
            Editar
          </button>
        </div>
      </div>

      {confirmandoCambioDeEstado && (
        <div role="alertdialog" aria-labelledby="titulo-de-cambio-de-estado" className="fade mt-5 rounded-2xl border border-frost p-4">
          <p id="titulo-de-cambio-de-estado" className="font-bold text-navy">
            {estaActivo ? `¿Desactivar a ${trabajador.nombre}?` : `¿Activar a ${trabajador.nombre}?`}
          </p>
          <p className="mt-1 text-sm text-slate">
            {estaActivo ? "Dejará de aparecer en «Elige a tu colaborador» de la app y no se le podrán asignar solicitudes." : "Volverá a aparecer en la app y se le podrán asignar solicitudes en su horario."}
          </p>
          {serviciosQueImpidenDesactivar.length > 0 && (
            <p className="mt-2 rounded-xl bg-moon p-3 text-xs text-clay">
              Tiene servicios por atender ({serviciosQueImpidenDesactivar.map((solicitud) => solicitud.id).join(", ")}). Reasígnalos o cancélalos antes de desactivarlo.
            </p>
          )}
          <div className="mt-4 flex justify-end gap-3">
            <button onClick={() => setConfirmandoCambioDeEstado(false)} className="btn btn-quiet">
              Volver
            </button>
            <button onClick={aplicarCambioDeEstado} disabled={serviciosQueImpidenDesactivar.length > 0} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50">
              {estaActivo ? "Sí, desactivar" : "Sí, activar"}
            </button>
          </div>
        </div>
      )}
      {errorDelCambioDeEstado && !confirmandoCambioDeEstado && <p className="mt-4 rounded-2xl bg-moon p-3 text-sm text-clay">{errorDelCambioDeEstado}</p>}

      <div className="mt-7 grid gap-6 md:grid-cols-5">
        <dl className="space-y-2 md:col-span-3">
          <DatoDelTrabajador icono="telefono" etiqueta="Teléfono">{trabajador.telefono}</DatoDelTrabajador>
          <DatoDelTrabajador icono="correo" etiqueta="Correo">{trabajador.correo}</DatoDelTrabajador>
          <DatoDelTrabajador icono="ubicacion" etiqueta="Dirección">{trabajador.direccion}</DatoDelTrabajador>
          <DatoDelTrabajador icono="reloj" etiqueta="Horario (visible en la app)">{describirHorarioDeTrabajo(trabajador.horario)}</DatoDelTrabajador>
          <DatoDelTrabajador icono="catalogo" etiqueta="Especialidades (visibles en la app)">
            <span className="mt-1 flex flex-wrap gap-1.5">
              {nombresDeEspecialidades(trabajador, servicios).map((nombre) => (
                <span key={nombre} className="rounded-full bg-moss/45 px-3 py-1 text-xs font-bold text-storm">
                  {nombre}
                </span>
              ))}
            </span>
          </DatoDelTrabajador>
          <DatoDelTrabajador icono="estrella" etiqueta="Reputación">{describirReputacion(reputacion)}</DatoDelTrabajador>
        </dl>

        <div className="space-y-4 md:col-span-2">
          <section aria-labelledby="titulo-de-documentacion" className="rounded-2xl bg-moon p-5">
            <h3 id="titulo-de-documentacion" className="font-display text-base font-bold text-navy">
              Documentación
            </h3>
            <ul className="mt-3 space-y-2.5">
              {DOCUMENTOS_REQUERIDOS.map((documento) => {
                const entregado = trabajador.documentosEntregados.includes(documento);
                return (
                  <li key={documento} className="flex items-start gap-2 text-sm">
                    <Icono nombre={entregado ? "palomita" : "alerta"} className={`mt-0.5 h-4 w-4 ${entregado ? "text-sage" : "text-ochre"}`} />
                    <span>
                      <span className="block font-bold text-navy">{documento}</span>
                      <span className="block text-xs text-slate">{entregado ? "Entregado" : "Pendiente"}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="titulo-de-servicios-activos" className="rounded-2xl bg-beige p-5">
            <h3 id="titulo-de-servicios-activos" className="font-display text-base font-bold text-navy">
              Servicios por atender
            </h3>
            {serviciosActivos.length === 0 && <p className="mt-2 text-sm text-slate">No tiene servicios pendientes ni confirmados.</p>}
            <ul className="mt-2 space-y-1.5">
              {serviciosActivos.map((solicitud) => (
                <li key={solicitud.id}>
                  <button onClick={() => onNavegar("solicitudes", { idDeSolicitud: solicitud.id })} className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-left text-sm transition duration-300 hover:bg-sky/40">
                    <span className="min-w-0 truncate">
                      <span className="font-bold text-lagoon">{solicitud.id}</span> · {describirHorario(solicitud.fechaProgramada, claveDeHoy)}
                    </span>
                    <InsigniaDeEstado estado={solicitud.estado} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {calificaciones.length > 0 && (
        <section aria-labelledby="titulo-de-ultimas-calificaciones" className="mt-6">
          <h3 id="titulo-de-ultimas-calificaciones" className="font-display text-base font-bold text-navy">
            Últimas calificaciones
          </h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {calificaciones.map((solicitud) => (
              <li key={solicitud.id} className="rounded-2xl bg-beige p-4 text-sm">
                <Puntuacion valor={solicitud.calificacion!.puntuacion} />
                {solicitud.calificacion!.comentario && <p className="mt-2 text-storm">“{solicitud.calificacion!.comentario}”</p>}
                <p className="mt-2 text-xs text-slate">
                  {buscarCliente(clientes, solicitud.idDelCliente)?.nombre ?? solicitud.idDelCliente} · {formatearFechaNumerica(solicitud.calificacion!.fecha)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </VentanaModal>
  );
}

// Opciones del filtro por estado.
const FILTROS_DE_ESTADO: ("Todos" | EstadoDelTrabajador)[] = ["Todos", "Disponible", "En servicio", "Fuera de horario", "Inactivo"];

type ListaDeTrabajadoresProps = {
  onAnadir: () => void;
  onEditar: (idDelTrabajador: string) => void;
  onNavegar: Navegar;
  onResultado: (resultado: ResultadoDeOperacion) => void;
};

// Lista de colaboradores con búsqueda y filtro por estado (Disponible, En servicio, Fuera de horario, Inactivo).
// colaboradores + solicitudes. Por cada uno se calcula su estado de ahora, su reputación y cuántos servicios tiene hoy.
function ListaDeTrabajadores({ onAnadir, onEditar, onNavegar, onResultado }: ListaDeTrabajadoresProps) {
  const { trabajadores } = useTrabajadores();
  const { solicitudes } = useSolicitudes();
  const ahora = useAhora();
  const [busqueda, setBusqueda] = useState("");
  const [filtroDeEstado, setFiltroDeEstado] = useState<"Todos" | EstadoDelTrabajador>("Todos");
  // Colaborador cuya ficha está abierta (null = cerrada).
  const [idDelTrabajadorAbierto, setIdDelTrabajadorAbierto] = useState<string | null>(null);

  // Una fila por colaborador con sus datos calculados.
  const filas = trabajadores.map((trabajador) => ({
    trabajador,
    estado: calcularEstadoDelTrabajador(solicitudes, trabajador, ahora),
    reputacion: calcularReputacion(solicitudes, trabajador.id),
    serviciosDeHoy: contarServiciosDeHoy(solicitudes, trabajador.id, ahora),
  }));
  // Filas que cumplen el filtro de estado y la búsqueda (por id, nombre o teléfono).
  const filasVisibles = filas.filter(({ trabajador, estado }) => {
    const coincideConElEstado = filtroDeEstado === "Todos" || estado === filtroDeEstado;
    const textoDelTrabajador = `${trabajador.id} ${trabajador.nombre} ${trabajador.telefono}`.toLowerCase();
    return coincideConElEstado && textoDelTrabajador.includes(busqueda.trim().toLowerCase());
  });
  const trabajadorAbierto = trabajadores.find((trabajador) => trabajador.id === idDelTrabajadorAbierto);
  // Colaboradores a los que les falta entregar algún documento requerido.
  const sinDocumentacionCompleta = trabajadores.filter((trabajador) => DOCUMENTOS_REQUERIDOS.some((documento) => !trabajador.documentosEntregados.includes(documento))).length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-extrabold text-navy">Gestión de colaboradores</h1>
        <InsigniaDeDatosDeDemostracion />
      </div>
      <p className="mt-2 max-w-3xl text-sm text-slate">Colaboradores que atienden los servicios. Su horario y sus especialidades son lo que el cliente ve cuando elige personalmente en la app. Solo los activos reciben solicitudes; la reputación sale de las calificaciones de los clientes.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <TarjetaDeIndicador etiqueta="Colaboradores activos" valor={trabajadores.filter((trabajador) => trabajador.estado === "Activo").length} descripcion={`De ${trabajadores.length} registrados.`} />
        <TarjetaDeIndicador etiqueta="Disponibles ahora" valor={filas.filter((fila) => fila.estado === "Disponible").length} descripcion="Pueden recibir solicitudes en este momento." />
        <TarjetaDeIndicador etiqueta="Documentación incompleta" valor={sinDocumentacionCompleta} />
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Icono nombre="buscar" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input type="search" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Buscar por ID, nombre o teléfono" aria-label="Buscar colaboradores" className="field pl-11" />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
          {FILTROS_DE_ESTADO.map((estado) => (
            <button key={estado} onClick={() => setFiltroDeEstado(estado)} aria-pressed={filtroDeEstado === estado} className={`cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition duration-300 ${filtroDeEstado === estado ? "bg-navy text-white" : "bg-white text-storm hover:bg-sky/50"}`}>
              {estado}
            </button>
          ))}
        </div>
      </div>

      {filasVisibles.length === 0 && <p className="mt-6 rounded-2xl bg-white p-10 text-center text-sm text-slate">No hay colaboradores que coincidan.</p>}

      <ul className="mt-6 space-y-3">
        {filasVisibles.map(({ trabajador, estado, reputacion, serviciosDeHoy }) => (
          <li key={trabajador.id}>
            <button onClick={() => setIdDelTrabajadorAbierto(trabajador.id)} aria-label={`Ver perfil de ${trabajador.nombre}`} className="surface leaf-sm grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 text-left transition duration-300 ease-soft hover:-translate-y-0.5 hover:shadow-lift lg:grid-cols-[auto_1.3fr_1.5fr_8rem_auto_auto]">
              <span className="pebble grid h-11 w-11 place-items-center bg-sky font-display text-lg font-extrabold text-navy">{trabajador.nombre.charAt(0)}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-navy">{trabajador.nombre}</span>
                <span className="block text-xs text-slate">
                  #{trabajador.id} · {trabajador.telefono}
                </span>
              </span>
              <span className="hidden min-w-0 text-xs text-slate lg:block">
                <span className="block truncate font-bold text-storm">{describirHorarioDeTrabajo(trabajador.horario)}</span>
                <span className="block">{serviciosDeHoy === 1 ? "1 servicio hoy" : `${serviciosDeHoy} servicios hoy`}</span>
              </span>
              <span className="hidden text-xs lg:block">
                {reputacion.promedio !== null && (
                  <span className="flex items-center gap-1.5 font-bold text-navy">
                    <Icono nombre="estrella" className="h-4 w-4 text-lagoon" />
                    {reputacion.promedio.toFixed(1)}
                    <span className="font-normal text-slate">({reputacion.cantidad})</span>
                  </span>
                )}
                {reputacion.promedio === null && <span className="text-slate">Sin calificaciones</span>}
              </span>
              <InsigniaDeEstado estado={estado} />
              <Icono nombre="chevronDerecho" className="hidden text-slate lg:block" />
            </button>
          </li>
        ))}
      </ul>

      <button onClick={onAnadir} className="btn btn-primary mt-6 w-full">
        <Icono nombre="mas" className="h-4 w-4" />
        Añadir colaborador
      </button>

      {trabajadorAbierto && (
        <VentanaDeDetalleDelTrabajador
          trabajador={trabajadorAbierto}
          onCerrar={() => setIdDelTrabajadorAbierto(null)}
          onEditar={() => {
            setIdDelTrabajadorAbierto(null);
            onEditar(trabajadorAbierto.id);
          }}
          onNavegar={onNavegar}
          onResultado={onResultado}
        />
      )}
    </div>
  );
}

// Archivo elegido para un documento: solo se recuerdan su nombre y su tamaño.
type DocumentoSeleccionado = { nombreDelArchivo: string; tamanoEnBytes: number };

type FilaDeDocumentoProps = {
  documento: string;
  yaEntregado: boolean;
  seleccionado: DocumentoSeleccionado | undefined;
  error: string | undefined;
  estaRevisando: boolean;
  onSeleccionar: (archivo: File) => void;
  onQuitar: () => void;
};

// Fila para adjuntar un documento requerido (identificación o comprobante de domicilio).
// Al elegir un archivo primero se revisa (tipo, tamaño y contenido). Si ya estaba entregado no se vuelve a pedir.
function FilaDeDocumento({ documento, yaEntregado, seleccionado, error, estaRevisando, onSeleccionar, onQuitar }: FilaDeDocumentoProps) {
  const selectorRef = useRef<HTMLInputElement>(null);
  const idDelError = `documento-${documento.replace(/\s+/g, "-")}-error`;

  function handleCambio(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (archivo) {
      onSeleccionar(archivo);
    }
  }

  let detalle = yaEntregado ? "Entregado" : "Sin archivo";
  if (estaRevisando) {
    detalle = "Revisando archivo…";
  } else if (seleccionado) {
    detalle = `${seleccionado.nombreDelArchivo} · ${formatearTamanoDeArchivo(seleccionado.tamanoEnBytes)}`;
  }

  return (
    <li className="rounded-2xl bg-beige px-4 py-3">
      <div className="flex items-center gap-3">
        <Icono nombre={yaEntregado || seleccionado ? "palomita" : "reportes"} className={`h-6 w-6 ${yaEntregado || seleccionado ? "text-sage" : "text-lagoon"}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-navy">{documento}</p>
          <p className="truncate text-xs text-slate">{detalle}</p>
        </div>
        <input ref={selectorRef} type="file" accept={TIPOS_DE_DOCUMENTO_PERMITIDOS.join(",")} onChange={handleCambio} className="hidden" tabIndex={-1} aria-hidden />
        {seleccionado && (
          <button type="button" onClick={onQuitar} aria-label={`Quitar ${documento}`} className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-slate transition duration-300 hover:bg-sky/50">
            <Icono nombre="cerrar" className="h-4 w-4" />
          </button>
        )}
        {!yaEntregado && (
          <button type="button" onClick={() => selectorRef.current?.click()} disabled={estaRevisando} aria-label={`${seleccionado ? "Cambiar" : "Adjuntar"} ${documento}`} aria-describedby={error ? idDelError : undefined} className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-navy transition duration-300 hover:bg-sky/50 disabled:cursor-not-allowed disabled:opacity-50">
            <Icono nombre="subir" />
          </button>
        )}
      </div>
      {error && (
        <p id={idDelError} role="alert" className="mt-1.5 text-xs font-semibold text-err">
          {error}
        </p>
      )}
    </li>
  );
}

// Selector de días y horas de trabajo. Es el horario que ve el cliente en la app; solo se le asignan servicios que empiecen dentro de él.
function SelectorDeHorario({ horario, error, onCambiar }: { horario: HorarioDeTrabajo; error?: string; onCambiar: (horario: HorarioDeTrabajo) => void }) {
  function alternarDia(numero: number) {
    const dias = horario.dias.includes(numero) ? horario.dias.filter((dia) => dia !== numero) : [...horario.dias, numero];
    onCambiar({ ...horario, dias });
  }

  return (
    <fieldset aria-describedby={error ? "trabajador-horario-error" : undefined}>
      <legend className="label">Horario de trabajo</legend>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Días de trabajo">
        {DIAS_DE_LA_SEMANA.map((dia) => {
          const estaElegido = horario.dias.includes(dia.numero);
          return (
            <button key={dia.numero} type="button" onClick={() => alternarDia(dia.numero)} aria-pressed={estaElegido} aria-label={dia.largo} className={`h-10 w-12 cursor-pointer rounded-full text-xs font-bold transition duration-300 ${estaElegido ? "bg-navy text-white" : "bg-beige text-storm hover:bg-sky/50"}`}>
              {dia.corto}
            </button>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:max-w-sm">
        <div>
          <label htmlFor="trabajador-hora-inicio" className="text-xs font-bold text-slate">
            Desde
          </label>
          <input id="trabajador-hora-inicio" type="time" step="1800" value={horario.horaDeInicio} onChange={(evento) => onCambiar({ ...horario, horaDeInicio: evento.target.value })} className="field mt-1" />
        </div>
        <div>
          <label htmlFor="trabajador-hora-fin" className="text-xs font-bold text-slate">
            Hasta
          </label>
          <input id="trabajador-hora-fin" type="time" step="1800" value={horario.horaDeFin} onChange={(evento) => onCambiar({ ...horario, horaDeFin: evento.target.value })} className="field mt-1" />
        </div>
      </div>
      <p className="mt-2 text-xs text-slate">Se muestra en la app como «{describirHorarioDeTrabajo(horario)}». Solo se le pueden asignar servicios que empiecen dentro de este horario.</p>
      {error && (
        <p id="trabajador-horario-error" role="alert" className="mt-1.5 text-xs font-semibold text-err">
          {error}
        </p>
      )}
    </fieldset>
  );
}

// Formulario en blanco para un colaborador nuevo (con el horario predeterminado).
const DATOS_DE_TRABAJADOR_VACIOS: DatosDeTrabajador = { nombre: "", telefono: "", correo: "", direccion: "", especialidades: [], horario: HORARIO_PREDETERMINADO, documentosEntregados: [] };

type FormularioDeTrabajadorProps = {
  trabajadorEditado: Trabajador | null;
  onCancelar: () => void;
  onTerminar: (resultado: ResultadoDeOperacion) => void;
};

// Formulario para dar de alta o editar un colaborador: nombre, teléfono, correo, dirección, especialidades, horario y documentos.
// Al guardar: se valida; si hay errores se marcan; si todo está bien se llama a agregarTrabajador o editarTrabajador.
// Si se edita, el nuevo horario no puede dejar fuera servicios ya acordados.
function FormularioDeTrabajador({ trabajadorEditado, onCancelar, onTerminar }: FormularioDeTrabajadorProps) {
  const { trabajadores, agregarTrabajador, editarTrabajador } = useTrabajadores();
  const { solicitudes } = useSolicitudes();
  const { servicios } = useCatalogo();
  // Lo que se está escribiendo. Si se edita, empieza con los datos actuales.
  const [datos, setDatos] = useState<DatosDeTrabajador>(() => (trabajadorEditado ? { ...trabajadorEditado } : DATOS_DE_TRABAJADOR_VACIOS));
  // Errores por campo, error general y estado de los documentos (elegidos, con error y el que se está revisando).
  const [errores, setErrores] = useState<ErroresDeTrabajador>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [documentosSeleccionados, setDocumentosSeleccionados] = useState<Record<string, DocumentoSeleccionado>>({});
  const [erroresDeDocumentos, setErroresDeDocumentos] = useState<Record<string, string>>({});
  const [documentoEnRevision, setDocumentoEnRevision] = useState<string | null>(null);

  // Documentos que ya estaban entregados (al editar).
  const documentosYaEntregados = trabajadorEditado ? trabajadorEditado.documentosEntregados : [];
  // Servicios que se pueden elegir como especialidad: los activos y los que el colaborador ya tiene aunque estén inactivos.
  const serviciosParaEspecialidad = servicios.filter((servicio) => servicio.estado === "Activo" || datos.especialidades.includes(servicio.id));

  // Guarda lo que se va escribiendo en un campo de texto.
  function cambiarCampo(campo: "nombre" | "telefono" | "correo" | "direccion", valor: string) {
    setDatos({ ...datos, [campo]: valor });
  }

  // Agrega o quita una especialidad.
  function alternarEspecialidad(idDelServicio: string) {
    const especialidades = datos.especialidades.includes(idDelServicio) ? datos.especialidades.filter((id) => id !== idDelServicio) : [...datos.especialidades, idDelServicio];
    setDatos({ ...datos, especialidades });
  }

  // Valida el archivo elegido antes de aceptarlo.
  // Aquí solo se guardan el nombre y el tamaño del archivo. 
  async function seleccionarDocumento(documento: string, archivo: File) {
    setDocumentoEnRevision(documento);
    const error = await validarArchivo(archivo, TIPOS_DE_DOCUMENTO_PERMITIDOS);
    setDocumentoEnRevision(null);
    if (error) {
      setErroresDeDocumentos((anteriores) => ({ ...anteriores, [documento]: error }));
      return;
    }
    setErroresDeDocumentos((anteriores) => ({ ...anteriores, [documento]: "" }));
    setDocumentosSeleccionados((anteriores) => ({ ...anteriores, [documento]: { nombreDelArchivo: archivo.name, tamanoEnBytes: archivo.size } }));
  }

  // Quita el archivo elegido de un documento.
  function quitarDocumento(documento: string) {
    setDocumentosSeleccionados((anteriores) => {
      const restantes = { ...anteriores };
      delete restantes[documento];
      return restantes;
    });
  }

  // Valida y guarda; si hay errores se marcan en el formulario. Un documento cuenta como entregado si ya lo estaba o si se acaba de elegir.
  // Aquí sale la petición de alta o de edición. Si hay documentos nuevos, se enviarían junto con los datos como multipart/form-data.
  function handleEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datosCompletos: DatosDeTrabajador = {
      ...datos,
      documentosEntregados: DOCUMENTOS_REQUERIDOS.filter((documento) => documentosYaEntregados.includes(documento) || documentosSeleccionados[documento]),
    };
    const idDelTrabajadorEditado = trabajadorEditado ? trabajadorEditado.id : null;
    const erroresEncontrados = validarTrabajador(datosCompletos, trabajadores, idDelTrabajadorEditado);
    setErrores(erroresEncontrados);
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrorGeneral("Revisa los campos marcados.");
      return;
    }
    const resultado = trabajadorEditado ? editarTrabajador(trabajadorEditado.id, datosCompletos, solicitudes) : agregarTrabajador(datosCompletos);
    if (!resultado.exito) {
      setErrorGeneral(resultado.mensaje);
      return;
    }
    onTerminar(resultado);
  }

  // Marca el campo con error para lectores de pantalla (aria-invalid) y lo enlaza con su mensaje.
  function propiedadesDeError(campo: keyof ErroresDeTrabajador) {
    return {
      "aria-invalid": Boolean(errores[campo]),
      "aria-describedby": errores[campo] ? `trabajador-${campo}-error` : undefined,
    };
  }

  return (
    <div>
      <button onClick={onCancelar} className="btn btn-quiet">
        <Icono nombre="volver" className="h-4 w-4" />
        Volver a colaboradores
      </button>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Icono nombre={trabajadorEditado ? "editar" : "mas"} className="h-7 w-7 text-navy" />
        <h1 className="text-4xl font-extrabold text-navy">{trabajadorEditado ? "Editar colaborador" : "Nuevo colaborador"}</h1>
        {trabajadorEditado && <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">{trabajadorEditado.id}</span>}
      </div>
      {trabajadorEditado && <p className="mt-2 text-sm text-slate">Los servicios ya acordados conservan su fecha y hora. El horario no puede dejar fuera servicios pendientes o confirmados.</p>}

      <form onSubmit={handleEnviar} noValidate className="surface leaf mt-8 max-w-3xl space-y-5 p-7 sm:p-9">
        <CampoDeFormulario id="trabajador-nombre" etiqueta="Nombre completo" error={errores.nombre}>
          <input id="trabajador-nombre" type="text" autoComplete="name" maxLength={140} value={datos.nombre} onChange={(evento) => cambiarCampo("nombre", evento.target.value)} {...propiedadesDeError("nombre")} className="field" />
        </CampoDeFormulario>
        <div className="grid gap-5 sm:grid-cols-2">
          <CampoDeFormulario id="trabajador-telefono" etiqueta="Teléfono" error={errores.telefono}>
            <input id="trabajador-telefono" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} placeholder="998 123 4567" value={datos.telefono} onChange={(evento) => cambiarCampo("telefono", evento.target.value)} {...propiedadesDeError("telefono")} className="field" />
          </CampoDeFormulario>
          <CampoDeFormulario id="trabajador-correo" etiqueta="Correo electrónico" error={errores.correo}>
            <input id="trabajador-correo" type="email" autoComplete="email" maxLength={140} value={datos.correo} onChange={(evento) => cambiarCampo("correo", evento.target.value)} {...propiedadesDeError("correo")} className="field" />
          </CampoDeFormulario>
        </div>
        <CampoDeFormulario id="trabajador-direccion" etiqueta="Dirección" error={errores.direccion}>
          <input id="trabajador-direccion" type="text" autoComplete="street-address" maxLength={140} value={datos.direccion} onChange={(evento) => cambiarCampo("direccion", evento.target.value)} {...propiedadesDeError("direccion")} className="field" />
        </CampoDeFormulario>

        <fieldset aria-describedby={errores.especialidades ? "trabajador-especialidades-error" : undefined}>
          <legend className="label">Especialidades</legend>
          <div className="flex flex-wrap gap-2">
            {serviciosParaEspecialidad.map((servicio) => {
              const estaElegida = datos.especialidades.includes(servicio.id);
              return (
                <button key={servicio.id} type="button" onClick={() => alternarEspecialidad(servicio.id)} aria-pressed={estaElegida} className={`cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition duration-300 ${estaElegida ? "bg-navy text-white" : "bg-beige text-storm hover:bg-sky/50"}`}>
                  {servicio.nombre}
                  {servicio.estado === "Inactivo" ? " (inactivo)" : ""}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate">Salen del catálogo de servicios. La app las muestra en el perfil del colaborador.</p>
          {errores.especialidades && (
            <p id="trabajador-especialidades-error" role="alert" className="mt-1.5 text-xs font-semibold text-err">
              {errores.especialidades}
            </p>
          )}
        </fieldset>

        <SelectorDeHorario horario={datos.horario} error={errores.horario} onCambiar={(horario) => setDatos({ ...datos, horario })} />

        <fieldset>
          <legend className="label">Documentación</legend>
          <ul className="space-y-2">
            {DOCUMENTOS_REQUERIDOS.map((documento) => (
              <FilaDeDocumento
                key={documento}
                documento={documento}
                yaEntregado={documentosYaEntregados.includes(documento)}
                seleccionado={documentosSeleccionados[documento]}
                error={erroresDeDocumentos[documento] || undefined}
                estaRevisando={documentoEnRevision === documento}
                onSeleccionar={(archivo) => seleccionarDocumento(documento, archivo)}
                onQuitar={() => quitarDocumento(documento)}
              />
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate">
            {describirTiposPermitidos(TIPOS_DE_DOCUMENTO_PERMITIDOS)} · hasta {formatearTamanoDeArchivo(TAMANO_MAXIMO_DE_ARCHIVO_EN_BYTES)}. Sin backend, los archivos solo se revisan en el navegador y se registra que se entregaron; no se guardan.
          </p>
        </fieldset>

        {errorGeneral && (
          <p role="alert" className="rounded-2xl bg-moon p-3 text-sm font-semibold text-err">
            {errorGeneral}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancelar} className="btn btn-quiet">
            Cancelar
          </button>
          <button type="submit" disabled={documentoEnRevision !== null} className="btn btn-primary">
            {trabajadorEditado ? "Guardar cambios" : "Añadir colaborador"}
          </button>
        </div>
      </form>
    </div>
  );
}

// lista - clic en un colaborador abre su ficha - desde ahí se activa, desactiva o se edita. "Añadir colaborador" abre el formulario.
// Cada guardado devuelve un ResultadoDeOperacion que se muestra en el aviso temporal; si salió bien, se vuelve a la lista.
export function TrabajadoresPage({ onNavegar }: { onNavegar: Navegar }) {
  const { trabajadores } = useTrabajadores();
  // Qué se ve: la lista o un formulario.
  const [vista, setVista] = useState<VistaDeTrabajadores>({ tipo: "lista" });
  // Resultado de la última acción; mientras tiene valor se muestra el aviso temporal (se quita solo).
  const [aviso, setAviso] = useState<ResultadoDeOperacion | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [vista]);

  // Muestra el aviso y vuelve a la lista si salió bien. Si falló, se queda en el formulario.
  function terminarFormulario(resultado: ResultadoDeOperacion) {
    setAviso(resultado);
    if (resultado.exito) {
      setVista({ tipo: "lista" });
    }
  }

  // Elige qué mostrar: la lista o el formulario.
  let contenido = <ListaDeTrabajadores onAnadir={() => setVista({ tipo: "nuevo" })} onEditar={(idDelTrabajador) => setVista({ tipo: "editar", idDelTrabajador })} onNavegar={onNavegar} onResultado={setAviso} />;
  if (vista.tipo === "nuevo") {
    contenido = <FormularioDeTrabajador trabajadorEditado={null} onCancelar={() => setVista({ tipo: "lista" })} onTerminar={terminarFormulario} />;
  }
  if (vista.tipo === "editar") {
    const trabajadorEditado = trabajadores.find((trabajador) => trabajador.id === vista.idDelTrabajador);
    if (trabajadorEditado) {
      contenido = <FormularioDeTrabajador key={trabajadorEditado.id} trabajadorEditado={trabajadorEditado} onCancelar={() => setVista({ tipo: "lista" })} onTerminar={terminarFormulario} />;
    }
  }

  return (
    <>
      <div key={vista.tipo} className="fade">
        {contenido}
      </div>
      {/* Aviso temporal con el resultado de guardar, activar o desactivar. */}
      {aviso && <AvisoTemporal aviso={aviso} onTerminar={() => setAviso(null)} />}
    </>
  );
}
