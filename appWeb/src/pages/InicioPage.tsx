import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useAhora } from "../hooks/useAhora";
import { nombreDelCliente, useClientes } from "../data/ClientesContext";
import { useSolicitudes } from "../hooks/useSolicitudes";
import { useTrabajadores } from "../data/TrabajadoresContext";
import { buscarTrabajador } from "../data/trabajadores";
import type { Navegar, Sesion, Solicitud } from "../data/tipos";
import { FILTROS_ACTIVAS, FILTROS_ENVIADAS_DE_HOY, obtenerPendientesDeAsignarHoy, obtenerServiciosEnProcesoHoy, obtenerSolicitudesActivas, obtenerSolicitudesRecientes } from "../utils/consultasDeSolicitudes";
import { calcularEstadoDelTrabajador } from "../utils/consultasDeTrabajadores";
import { contarClientesPorVerificacion } from "../utils/documentosDeClientes";
import { obtenerEtapa } from "../utils/reglasDeSolicitudes";
import { obtenerClaveDeFecha } from "../utils/fechas";
import { describirHorario, describirTiempoDesdeCreacion, formatearFechaDeHoy, formatearHora } from "../utils/formato";
import { Icono } from "../components/comunes/Icono";
import { InsigniaDeDatosDeDemostracion, InsigniaDeEstado } from "../components/comunes/Insignias";
import { OlasDeFondo } from "../components/comunes/FormasOrganicas";

// Cuántos elementos se muestran en cada bloque del Inicio (son vistas previas; el resto está en Solicitudes).
const CANTIDAD_DE_SOLICITUDES_RECIENTES = 5;
const CANTIDAD_DE_PENDIENTES_EN_VISTA_PREVIA = 3;
const CANTIDAD_DE_SERVICIOS_EN_VISTA_PREVIA = 4;

// Hace que un número "suba" con animación hasta su valor final. Si la persona prefiere menos movimiento, lo muestra directo.
function useContadorAnimado(valorFinal: number, duracionEnMilisegundos = 700) {
  const [valorMostrado, setValorMostrado] = useState(0);
  const ultimoValorMostrado = useRef(0);
  useEffect(() => {
    const usuarioPrefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (usuarioPrefiereMenosMovimiento || ultimoValorMostrado.current === valorFinal) {
      ultimoValorMostrado.current = valorFinal;
      setValorMostrado(valorFinal);
      return;
    }
    const valorInicial = ultimoValorMostrado.current;
    const momentoDeInicio = performance.now();
    let idDelCuadro = 0;
    function avanzarAnimacion(momentoActual: number) {
      const progreso = Math.min((momentoActual - momentoDeInicio) / duracionEnMilisegundos, 1);
      const valorSiguiente = Math.round(valorInicial + (valorFinal - valorInicial) * progreso);
      ultimoValorMostrado.current = valorSiguiente;
      setValorMostrado(valorSiguiente);
      if (progreso < 1) {
        idDelCuadro = requestAnimationFrame(avanzarAnimacion);
      }
    }
    idDelCuadro = requestAnimationFrame(avanzarAnimacion);
    return () => cancelAnimationFrame(idDelCuadro);
  }, [valorFinal, duracionEnMilisegundos]);
  return valorMostrado;
}

type TarjetaPendientesDeAsignarProps = {
  solicitudes: Solicitud[];
  onVerTodas: () => void;
  onAbrirSolicitud: (idDeSolicitud: string) => void;
};

// Tarjeta "Por asignar hoy": solicitudes de hoy que todavía no tienen colaborador.
// DATOS: la lista ya filtrada que le pasa InicioPage (obtenerPendientesDeAsignarHoy). Muestra el total y las primeras 3, con cliente y hora.
// BOTONES: una solicitud abre su detalle; el botón principal abre Solicitudes con el filtro "Solicitud enviada + hoy".
function TarjetaPendientesDeAsignarHoy({ solicitudes, onVerTodas, onAbrirSolicitud }: TarjetaPendientesDeAsignarProps) {
  const { clientes } = useClientes();
  const total = solicitudes.length;
  const totalMostrado = useContadorAnimado(total);
  const vistaPrevia = solicitudes.slice(0, CANTIDAD_DE_PENDIENTES_EN_VISTA_PREVIA);

  return (
    <section aria-labelledby="titulo-de-pendientes" className="leaf relative flex h-full flex-col overflow-hidden bg-navy p-7 text-white shadow-lift sm:p-9">
      <OlasDeFondo />
      <div className="relative flex flex-1 flex-col">
        <h3 id="titulo-de-pendientes" className="text-xs font-bold uppercase tracking-widest text-moss">
          Por asignar hoy
        </h3>
        <p className="mt-5 font-display text-8xl font-extrabold leading-none" aria-hidden>
          {totalMostrado}
        </p>
        <p className="sr-only">{total} solicitudes de hoy sin colaborador asignado</p>
        {total > 0 && <p className="mt-3 max-w-xs text-sm text-sky">{total === 1 ? "solicitud para hoy espera" : "solicitudes para hoy esperan"} que se le asigne colaborador.</p>}
        {total === 0 && (
          <p className="mt-3 flex max-w-xs items-center gap-2 text-sm text-sky">
            <Icono nombre="palomita" />
            Todo lo de hoy ya tiene colaborador.
          </p>
        )}

        {vistaPrevia.length > 0 && (
          <ul className="mt-6 space-y-2">
            {vistaPrevia.map((solicitud) => (
              <li key={solicitud.id}>
                <button onClick={() => onAbrirSolicitud(solicitud.id)} className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3 text-left text-sm transition duration-300 hover:bg-white/20">
                  <span className="min-w-0 truncate">
                    <span className="font-bold text-moss">{solicitud.id}</span> · {nombreDelCliente(clientes, solicitud.idDelCliente)}
                  </span>
                  <span className="shrink-0 text-xs text-sky">{formatearHora(solicitud.fechaProgramada)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button onClick={onVerTodas} className="btn btn-moss mt-auto self-start" style={{ marginTop: "2rem" }}>
          {total > 0 ? "Asignar colaboradores" : "Ver solicitudes de hoy"}
          <Icono nombre="flecha" className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

type TarjetaServiciosEnProcesoProps = {
  solicitudes: Solicitud[];
  onAbrirSolicitud: (idDeSolicitud: string) => void;
};

// Tarjeta "Servicios confirmados para hoy": servicios de hoy ya confirmados que están por realizarse.
// DATOS: la lista que le pasa InicioPage (obtenerServiciosEnProcesoHoy) y el colaborador de cada una. Muestra las primeras 4.
// Desde aquí el administrador abre la solicitud y la marca como finalizada cuando termina el servicio.
function TarjetaServiciosEnProceso({ solicitudes, onAbrirSolicitud }: TarjetaServiciosEnProcesoProps) {
  const { trabajadores } = useTrabajadores();
  const vistaPrevia = solicitudes.slice(0, CANTIDAD_DE_SERVICIOS_EN_VISTA_PREVIA);
  return (
    <section aria-labelledby="titulo-de-servicios-en-proceso" className="leaf-r surface h-full p-7 sm:p-9">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="titulo-de-servicios-en-proceso" className="text-xs font-bold uppercase tracking-widest text-slate">
          Servicios confirmados para hoy
        </h3>
        <span className="font-display text-3xl font-extrabold text-navy">{solicitudes.length}</span>
      </div>
      <p className="mt-1 text-xs text-slate">Márcalos como finalizados al terminar para que el cliente pueda calificarlos.</p>

      {vistaPrevia.length === 0 && <p className="mt-6 rounded-2xl bg-beige p-5 text-center text-sm text-slate">No hay servicios confirmados para hoy.</p>}

      <ul className="mt-5 space-y-2">
        {vistaPrevia.map((solicitud) => {
          const trabajador = buscarTrabajador(trabajadores, solicitud.idDelTrabajador);
          return (
            <li key={solicitud.id}>
              <button onClick={() => onAbrirSolicitud(solicitud.id)} className="group flex w-full cursor-pointer items-center gap-4 rounded-2xl bg-beige px-4 py-3 text-left transition duration-300 hover:bg-sky/40">
                <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">{solicitud.id}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-navy">{solicitud.servicio}</span>
                  <span className="block truncate text-xs text-slate">{trabajador ? trabajador.nombre : "Sin colaborador"}</span>
                </span>
                <span className="shrink-0 text-xs font-bold text-lagoon">{formatearHora(solicitud.fechaProgramada)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// Fila de colaboradores con su estado de este momento (Disponible, En servicio, Fuera de horario o Inactivo).
// DATOS: lista de colaboradores + solicitudes + hora actual. El estado se calcula, no se guarda (calcularEstadoDelTrabajador).
function FranjaDelEquipo({ onVerTrabajadores }: { onVerTrabajadores: () => void }) {
  const { trabajadores } = useTrabajadores();
  const { solicitudes } = useSolicitudes();
  const ahora = useAhora();
  return (
    <section aria-labelledby="titulo-del-equipo">
      <div className="flex items-center justify-between gap-3">
        <h2 id="titulo-del-equipo" className="text-xs font-bold uppercase tracking-widest text-slate">
          Disponibilidad de colaboradores
        </h2>
        <button onClick={onVerTrabajadores} className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-bold text-lagoon transition duration-300 hover:bg-sky/50">
          Ver colaboradores
        </button>
      </div>
      <ul className="mt-4 flex gap-6 overflow-x-auto pb-2">
        {trabajadores.map((trabajador) => {
          const estado = calcularEstadoDelTrabajador(solicitudes, trabajador, ahora);
          const colorDelPunto = estado === "Disponible" ? "bg-sage" : estado === "En servicio" ? "bg-steel" : estado === "Inactivo" ? "bg-frost" : "bg-slate";
          return (
            <li key={trabajador.id} className="flex w-20 shrink-0 flex-col items-center text-center">
              <span className="relative">
                <span className="pebble grid h-16 w-16 place-items-center bg-sky font-display text-xl font-extrabold text-navy">{trabajador.nombre.charAt(0)}</span>
                <span className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-beige ${colorDelPunto}`} aria-hidden />
              </span>
              <span className="mt-2 w-full truncate text-xs font-bold text-navy">{trabajador.nombre.split(" ")[0]}</span>
              <span className="text-xs text-slate">{estado}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

type ListaDeSolicitudesRecientesProps = {
  solicitudes: Solicitud[];
  ahora: Date;
  onAbrirSolicitud: (idDeSolicitud: string) => void;
  onVerTodas: () => void;
};

// Las últimas solicitudes que ingresaron, de la más nueva a la más vieja (sin importar para qué fecha son).
// DATOS: la lista que le pasa InicioPage (5 solicitudes) y el nombre del cliente de cada una. Al hacer clic se abre el detalle.
function ListaDeSolicitudesRecientes({ solicitudes, ahora, onAbrirSolicitud, onVerTodas }: ListaDeSolicitudesRecientesProps) {
  const { clientes } = useClientes();
  const claveDeHoy = obtenerClaveDeFecha(ahora);
  return (
    <section aria-labelledby="titulo-de-solicitudes-recientes">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="titulo-de-solicitudes-recientes" className="font-display text-2xl font-extrabold text-navy">
            Solicitudes recientes
          </h2>
          <p className="mt-1 text-sm text-slate">Ordenadas por el momento en que ingresaron, sin importar para cuándo son.</p>
        </div>
        <button onClick={onVerTodas} className="inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-lagoon transition duration-300 hover:bg-sky/50">
          Ver todas
          <Icono nombre="flecha" className="h-4 w-4" />
        </button>
      </div>

      {solicitudes.length === 0 && <p className="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-slate">Aún no hay solicitudes.</p>}

      <ul className="mt-6 space-y-3">
        {solicitudes.map((solicitud, indice) => (
          <li key={solicitud.id} className="rise" style={{ "--delay": `${indice * 60}ms` } as CSSProperties}>
            <button onClick={() => onAbrirSolicitud(solicitud.id)} className="surface leaf-sm grid w-full cursor-pointer gap-3 px-5 py-4 text-left transition duration-300 ease-soft hover:-translate-y-0.5 hover:shadow-lift md:grid-cols-[5.5rem_1fr_14rem_auto] md:items-center md:gap-6">
              <span className="w-fit rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">{solicitud.id}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-navy">
                  {nombreDelCliente(clientes, solicitud.idDelCliente)} · {solicitud.servicio}
                </span>
                <span className="block truncate text-xs text-slate">{solicitud.direccion}</span>
              </span>
              <span className="flex flex-col gap-1 text-xs">
                <span className="flex items-center gap-1.5 text-slate">
                  <Icono nombre="reloj" className="h-3.5 w-3.5" />
                  Ingresó {describirTiempoDesdeCreacion(solicitud.fechaDeCreacion, ahora)}
                </span>
                <span className="flex items-center gap-1.5 font-bold text-navy">
                  <Icono nombre="calendario" className="h-3.5 w-3.5" />
                  {describirHorario(solicitud.fechaProgramada, claveDeHoy)}
                </span>
              </span>
              <InsigniaDeEstado estado={obtenerEtapa(solicitud)} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Datos de una tarjeta de indicador: etiqueta, número, detalle, ícono, si pide atención (resalta con borde) y a dónde lleva.
type IndicadorPrincipal = {
  etiqueta: string;
  valor: number;
  detalle: string;
  icono: "bandeja" | "trabajadores" | "identificacion";
  requiereAtencion: boolean;
  textoDelBoton: string;
  onAbrir: () => void;
};

// Las 3 tarjetas con los números clave. Cada una es un botón que abre su pantalla.
function IndicadoresPrincipales({ indicadores }: { indicadores: IndicadorPrincipal[] }) {
  return (
    <section aria-labelledby="titulo-de-indicadores">
      <h2 id="titulo-de-indicadores" className="font-display text-2xl font-extrabold text-navy">
        Indicadores principales
      </h2>
      <ul className="mt-5 grid gap-4 md:grid-cols-3">
        {indicadores.map((indicador) => (
          <li key={indicador.etiqueta}>
            <button onClick={indicador.onAbrir} className={`surface leaf-sm flex h-full w-full cursor-pointer flex-col p-6 text-left transition duration-300 ease-soft hover:-translate-y-0.5 hover:shadow-lift ${indicador.requiereAtencion ? "ring-1 ring-ochre/50" : ""}`}>
              <span className="flex items-center justify-between gap-3">
                <span className={`pebble grid h-11 w-11 place-items-center ${indicador.requiereAtencion ? "bg-moon text-clay" : "bg-moss/40 text-storm"}`}>
                  <Icono nombre={indicador.icono} className="h-5 w-5" />
                </span>
                <span className="font-display text-5xl font-extrabold text-navy">{indicador.valor}</span>
              </span>
              <span className="mt-4 block text-base font-bold text-navy">{indicador.etiqueta}</span>
              <span className="mt-1 block flex-1 text-xs text-slate">{indicador.detalle}</span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-lagoon">
                {indicador.textoDelBoton}
                <Icono nombre="flecha" className="h-4 w-4" />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

type InicioPageProps = {
  sesion: Sesion;
  onNavegar: Navegar;
};

// INICIO: resumen del día y atajos a las demás pantallas.
// DATOS QUE LLENAN LA PANTALLA (hoy todo se calcula en el navegador con las listas completas):
// - Saludo: el nombre de la sesión (el que devolvió el login).
// - Indicadores: solicitudes activas por etapa, colaboradores activos y disponibles, e INE pendientes de validar.
// - Disponibilidad de colaboradores, servicios de hoy (por asignar y confirmados) y las 5 solicitudes más recientes.
// CONSULTAS QUE NECESITA: solicitudes con su cliente, servicio y colaborador; colaboradores con horario; y el conteo de clientes con INE pendiente.
// ATAJOS: cada tarjeta usa onNavegar para abrir otra pantalla ya filtrada o con una solicitud abierta.
// PARA EL BACK: no hace falta una consulta propia; con las listas de solicitudes, clientes y colaboradores se calcula todo aquí.
// Si las listas llegan paginadas o son muy grandes, convendría una consulta de resumen con los conteos por etapa, los colaboradores disponibles, las INE pendientes, las solicitudes de hoy y las 5 más recientes.
export function InicioPage({ sesion, onNavegar }: InicioPageProps) {
  const { solicitudes } = useSolicitudes();
  const { clientes } = useClientes();
  const { trabajadores } = useTrabajadores();
  const ahora = useAhora();
  const claveDeHoy = obtenerClaveDeFecha(ahora);
  // Solicitudes en curso y cuántas hay en cada etapa (porEtapa).
  const solicitudesActivas = obtenerSolicitudesActivas(solicitudes);
  const porEtapa = (etapa: string) => solicitudesActivas.filter((solicitud) => obtenerEtapa(solicitud) === etapa).length;
  // Colaboradores activos y cuántos están disponibles justo ahora.
  const colaboradoresActivos = trabajadores.filter((trabajador) => trabajador.estado === "Activo");
  const colaboradoresDisponibles = colaboradoresActivos.filter((trabajador) => calcularEstadoDelTrabajador(solicitudes, trabajador, ahora) === "Disponible").length;
  // Clientes con la INE pendiente de revisión.
  const inePorValidar = contarClientesPorVerificacion(clientes).Pendiente;
  // Números clave; cada uno abre su pantalla ya filtrada.
  const indicadores: IndicadorPrincipal[] = [
    {
      etiqueta: "Solicitudes activas",
      valor: solicitudesActivas.length,
      detalle: `${porEtapa("Solicitud enviada")} por asignar · ${porEtapa("Asignando colaborador")} por confirmar · ${porEtapa("Servicio confirmado")} confirmadas`,
      icono: "bandeja",
      requiereAtencion: porEtapa("Solicitud enviada") > 0,
      textoDelBoton: "Ver solicitudes",
      onAbrir: () => onNavegar("solicitudes", { filtrosDeSolicitudes: FILTROS_ACTIVAS }),
    },
    {
      etiqueta: "Colaboradores",
      valor: colaboradoresActivos.length,
      detalle: `Activos · ${colaboradoresDisponibles} ${colaboradoresDisponibles === 1 ? "disponible" : "disponibles"} en este momento`,
      icono: "trabajadores",
      requiereAtencion: false,
      textoDelBoton: "Ver colaboradores",
      onAbrir: () => onNavegar("trabajadores"),
    },
    {
      etiqueta: "Validaciones de INE pendientes",
      valor: inePorValidar,
      detalle: inePorValidar === 0 ? "No hay INE esperando revisión." : "Clientes nuevos esperando la revisión de su INE.",
      icono: "identificacion",
      requiereAtencion: inePorValidar > 0,
      textoDelBoton: "Revisar INE",
      onAbrir: () => onNavegar("clientes", { filtroDeVerificacion: "Pendiente" }),
    },
  ];
  // Listas de los bloques de "Resumen del día" y de "Solicitudes recientes".
  const pendientesDeAsignarHoy = obtenerPendientesDeAsignarHoy(solicitudes, claveDeHoy);
  const serviciosEnProcesoHoy = obtenerServiciosEnProcesoHoy(solicitudes, claveDeHoy);
  const solicitudesRecientes = obtenerSolicitudesRecientes(solicitudes, CANTIDAD_DE_SOLICITUDES_RECIENTES);

  // Abre una solicitud directo en su detalle (va a Solicitudes con el id).
  function abrirSolicitud(idDeSolicitud: string) {
    onNavegar("solicitudes", { idDeSolicitud });
  }

  return (
    <div className="space-y-14">
      <header className="leaf rise relative overflow-hidden bg-storm px-7 pb-10 pt-8 text-white shadow-lift sm:px-12 sm:pb-14 sm:pt-10">
        <OlasDeFondo />
        <div className="relative max-w-xl">
          <p className="text-sm font-semibold text-moss first-letter:uppercase">{formatearFechaDeHoy(ahora)}</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">
            ¡Bienvenido de nuevo, <span className="text-moss">{sesion.nombre}</span>!
          </h1>
          <div className="mt-5">
            <InsigniaDeDatosDeDemostracion />
          </div>
        </div>
      </header>

      <div className="rise" style={{ animationDelay: "60ms" }}>
        <IndicadoresPrincipales indicadores={indicadores} />
      </div>

      <div className="rise" style={{ animationDelay: "100ms" }}>
        <FranjaDelEquipo onVerTrabajadores={() => onNavegar("trabajadores")} />
      </div>

      <section aria-labelledby="titulo-del-resumen" className="rise" style={{ animationDelay: "140ms" }}>
        <h2 id="titulo-del-resumen" className="font-display text-2xl font-extrabold text-navy">
          Resumen del día
        </h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <TarjetaPendientesDeAsignarHoy solicitudes={pendientesDeAsignarHoy} onVerTodas={() => onNavegar("solicitudes", { filtrosDeSolicitudes: FILTROS_ENVIADAS_DE_HOY })} onAbrirSolicitud={abrirSolicitud} />
          </div>
          <div className="lg:col-span-6">
            <TarjetaServiciosEnProceso solicitudes={serviciosEnProcesoHoy} onAbrirSolicitud={abrirSolicitud} />
          </div>
        </div>
      </section>

      <div className="rise" style={{ animationDelay: "200ms" }}>
        <ListaDeSolicitudesRecientes solicitudes={solicitudesRecientes} ahora={ahora} onAbrirSolicitud={abrirSolicitud} onVerTodas={() => onNavegar("solicitudes")} />
      </div>
    </div>
  );
}
