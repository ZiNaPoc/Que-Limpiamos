import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useAhora } from "../hooks/useAhora";
import { useSolicitudes } from "../data/SolicitudesContext";
import { useTrabajadores } from "../data/TrabajadoresContext";
import { buscarTrabajador } from "../data/trabajadores";
import type { AperturaDeSolicitudes, Sesion, Solicitud, VistaDelPanel } from "../data/tipos";
import { FILTROS_PENDIENTES_DE_HOY, FILTROS_VACIOS, obtenerPendientesDeAsignarHoy, obtenerServiciosEnProcesoHoy, obtenerSolicitudesRecientes } from "../utils/consultasDeSolicitudes";
import { obtenerClaveDeFecha } from "../utils/fechas";
import { describirHorario, describirTiempoDesdeCreacion, formatearFechaDeHoy, formatearHora } from "../utils/formato";
import { Icono } from "../components/comunes/Icono";
import { InsigniaDeDatosDeDemostracion, InsigniaDeEstado } from "../components/comunes/Insignias";
import { OlasDeFondo } from "../components/comunes/FormasOrganicas";

const CANTIDAD_DE_SOLICITUDES_RECIENTES = 5;
const CANTIDAD_DE_PENDIENTES_EN_VISTA_PREVIA = 3;
const CANTIDAD_DE_SERVICIOS_EN_VISTA_PREVIA = 4;

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

function TarjetaPendientesDeAsignarHoy({ solicitudes, onVerTodas, onAbrirSolicitud }: TarjetaPendientesDeAsignarProps) {
  const total = solicitudes.length;
  const totalMostrado = useContadorAnimado(total);
  const vistaPrevia = solicitudes.slice(0, CANTIDAD_DE_PENDIENTES_EN_VISTA_PREVIA);

  return (
    <section aria-labelledby="titulo-de-pendientes" className="leaf relative flex h-full flex-col overflow-hidden bg-navy p-7 text-white shadow-lift sm:p-9">
      <OlasDeFondo />
      <div className="relative flex flex-1 flex-col">
        <h3 id="titulo-de-pendientes" className="text-xs font-bold uppercase tracking-widest text-moss">
          Pendientes de asignar hoy
        </h3>
        <p className="mt-5 font-display text-8xl font-extrabold leading-none" aria-hidden>
          {totalMostrado}
        </p>
        <p className="sr-only">{total} solicitudes de hoy sin trabajador asignado</p>
        {total > 0 && <p className="mt-3 max-w-xs text-sm text-sky">{total === 1 ? "solicitud de hoy espera" : "solicitudes de hoy esperan"} un trabajador.</p>}
        {total === 0 && (
          <p className="mt-3 flex max-w-xs items-center gap-2 text-sm text-sky">
            <Icono nombre="palomita" />
            Todo lo de hoy ya tiene trabajador.
          </p>
        )}

        {vistaPrevia.length > 0 && (
          <ul className="mt-6 space-y-2">
            {vistaPrevia.map((solicitud) => (
              <li key={solicitud.id}>
                <button onClick={() => onAbrirSolicitud(solicitud.id)} className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3 text-left text-sm transition duration-300 hover:bg-white/20">
                  <span className="min-w-0 truncate">
                    <span className="font-bold text-moss">{solicitud.id}</span> · {solicitud.nombreDelCliente}
                  </span>
                  <span className="shrink-0 text-xs text-sky">{formatearHora(solicitud.fechaProgramada)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button onClick={onVerTodas} className="btn btn-moss mt-auto self-start" style={{ marginTop: "2rem" }}>
          {total > 0 ? "Asignar trabajadores" : "Ver solicitudes de hoy"}
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

function TarjetaServiciosEnProceso({ solicitudes, onAbrirSolicitud }: TarjetaServiciosEnProcesoProps) {
  const { trabajadores } = useTrabajadores();
  const vistaPrevia = solicitudes.slice(0, CANTIDAD_DE_SERVICIOS_EN_VISTA_PREVIA);
  return (
    <section aria-labelledby="titulo-de-servicios-en-proceso" className="leaf-r surface h-full p-7 sm:p-9">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="titulo-de-servicios-en-proceso" className="text-xs font-bold uppercase tracking-widest text-slate">
          Servicios en proceso
        </h3>
        <span className="font-display text-3xl font-extrabold text-navy">{solicitudes.length}</span>
      </div>
      <p className="mt-1 text-xs text-slate">Confirmados con trabajador y programados para hoy.</p>

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
                  <span className="block truncate text-xs text-slate">{trabajador ? trabajador.nombre : "Sin trabajador"}</span>
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

function FranjaDelEquipo({ onVerTrabajadores }: { onVerTrabajadores: () => void }) {
  const { trabajadores } = useTrabajadores();
  return (
    <section aria-labelledby="titulo-del-equipo">
      <div className="flex items-center justify-between gap-3">
        <h2 id="titulo-del-equipo" className="text-xs font-bold uppercase tracking-widest text-slate">
          Equipo de hoy
        </h2>
        <button onClick={onVerTrabajadores} className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-bold text-lagoon transition duration-300 hover:bg-sky/50">
          Ver trabajadores
        </button>
      </div>
      <ul className="mt-4 flex gap-6 overflow-x-auto pb-2">
        {trabajadores.map((trabajador) => {
          const estaDisponible = trabajador.estado === "Disponible";
          return (
            <li key={trabajador.id} className="flex w-20 shrink-0 flex-col items-center text-center">
              <span className="relative">
                <span className="pebble grid h-16 w-16 place-items-center bg-sky font-display text-xl font-extrabold text-navy">{trabajador.nombre.charAt(0)}</span>
                <span className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-beige ${estaDisponible ? "bg-sage" : "bg-ochre"}`} aria-hidden />
              </span>
              <span className="mt-2 w-full truncate text-xs font-bold text-navy">{trabajador.nombre.split(" ")[0]}</span>
              <span className="text-xs text-slate">{trabajador.estado}</span>
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

function ListaDeSolicitudesRecientes({ solicitudes, ahora, onAbrirSolicitud, onVerTodas }: ListaDeSolicitudesRecientesProps) {
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
                  {solicitud.usuarioDelCliente} · {solicitud.servicio}
                </span>
                <span className="block truncate text-xs text-slate">{solicitud.descripcion}</span>
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
              <InsigniaDeEstado estado={solicitud.estado} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

type InicioPageProps = {
  sesion: Sesion;
  onNavegar: (vista: VistaDelPanel, apertura?: AperturaDeSolicitudes) => void;
};

export function InicioPage({ sesion, onNavegar }: InicioPageProps) {
  const { solicitudes } = useSolicitudes();
  const ahora = useAhora();
  const claveDeHoy = obtenerClaveDeFecha(ahora);
  const pendientesDeAsignarHoy = obtenerPendientesDeAsignarHoy(solicitudes, claveDeHoy);
  const serviciosEnProcesoHoy = obtenerServiciosEnProcesoHoy(solicitudes, claveDeHoy);
  const solicitudesRecientes = obtenerSolicitudesRecientes(solicitudes, CANTIDAD_DE_SOLICITUDES_RECIENTES);

  function abrirSolicitud(idDeSolicitud: string) {
    onNavegar("solicitudes", { filtros: FILTROS_VACIOS, idDeSolicitud });
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

      <div className="rise" style={{ animationDelay: "80ms" }}>
        <FranjaDelEquipo onVerTrabajadores={() => onNavegar("trabajadores")} />
      </div>

      <section aria-labelledby="titulo-del-resumen" className="rise" style={{ animationDelay: "140ms" }}>
        <h2 id="titulo-del-resumen" className="font-display text-2xl font-extrabold text-navy">
          Resumen del día
        </h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <TarjetaPendientesDeAsignarHoy solicitudes={pendientesDeAsignarHoy} onVerTodas={() => onNavegar("solicitudes", { filtros: FILTROS_PENDIENTES_DE_HOY, idDeSolicitud: null })} onAbrirSolicitud={abrirSolicitud} />
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
