import { useState } from "react";
import { useClientes, nombreDelCliente } from "../data/ClientesContext";
import { useSolicitudes } from "../data/SolicitudesContext";
import { useTrabajadores } from "../data/TrabajadoresContext";
import { buscarTrabajador } from "../data/trabajadores";
import type { Navegar } from "../data/tipos";
import { calcularReputacion } from "../utils/consultasDeTrabajadores";
import { formatearFechaNumerica, normalizarTexto } from "../utils/formato";
import { CampoDeFormulario } from "../components/comunes/CampoDeFormulario";
import { Icono } from "../components/comunes/Icono";
import { InsigniaDeDatosDeDemostracion, Puntuacion } from "../components/comunes/Insignias";

// Las reseñas son las calificaciones de «Califica tu servicio» (1 a 5 escobas y un comentario).
// Se consultan aquí; el administrador no las edita ni las borra, porque forman la reputación
// que el cliente ve al elegir colaborador.

const OPCIONES_DE_PUNTUACION = ["Todas", "5", "4", "3", "2", "1"];

export function ResenasPage({ onNavegar }: { onNavegar: Navegar }) {
  const { solicitudes } = useSolicitudes();
  const { trabajadores } = useTrabajadores();
  const { clientes } = useClientes();
  const [busqueda, setBusqueda] = useState("");
  const [puntuacion, setPuntuacion] = useState("Todas");
  const [idDelTrabajador, setIdDelTrabajador] = useState("todos");

  const resenas = solicitudes
    .filter((solicitud) => solicitud.calificacion)
    .map((solicitud) => ({ solicitud, calificacion: solicitud.calificacion!, trabajador: buscarTrabajador(trabajadores, solicitud.idDelTrabajador), cliente: nombreDelCliente(clientes, solicitud.idDelCliente) }))
    .sort((a, b) => new Date(b.calificacion.fecha).getTime() - new Date(a.calificacion.fecha).getTime());

  const textoBuscado = normalizarTexto(busqueda);
  const resenasVisibles = resenas.filter(({ solicitud, calificacion, trabajador, cliente }) => {
    const coincidePuntuacion = puntuacion === "Todas" || calificacion.puntuacion === Number(puntuacion);
    const coincideTrabajador = idDelTrabajador === "todos" || solicitud.idDelTrabajador === idDelTrabajador;
    const coincideTexto = normalizarTexto(`${solicitud.id} ${cliente} ${trabajador?.nombre ?? ""} ${calificacion.comentario}`).includes(textoBuscado);
    return coincidePuntuacion && coincideTrabajador && coincideTexto;
  });

  const promedioGeneral = resenas.length > 0 ? resenas.reduce((total, { calificacion }) => total + calificacion.puntuacion, 0) / resenas.length : null;
  const reputaciones = trabajadores
    .map((trabajador) => ({ trabajador, reputacion: calcularReputacion(solicitudes, trabajador.id) }))
    .sort((a, b) => (b.reputacion.promedio ?? -1) - (a.reputacion.promedio ?? -1));
  const hayFiltros = busqueda.trim() !== "" || puntuacion !== "Todas" || idDelTrabajador !== "todos";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-extrabold text-navy">Reseñas y reputación</h1>
        <InsigniaDeDatosDeDemostracion />
      </div>
      <p className="mt-2 max-w-3xl text-sm text-slate">Calificaciones que los clientes dan desde «Califica tu servicio» al terminar cada limpieza. Forman la reputación de cada colaborador.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="surface leaf-sm p-5 sm:p-6">
          <p className="flex items-center gap-3 font-display text-3xl font-extrabold text-navy">
            {promedioGeneral !== null ? promedioGeneral.toFixed(1) : "—"}
            {promedioGeneral !== null && <Puntuacion valor={promedioGeneral} tamano="h-5 w-5" />}
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate">Calificación promedio</p>
        </div>
        <div className="surface leaf-sm p-5 sm:p-6">
          <p className="font-display text-3xl font-extrabold text-navy">{resenas.length}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate">Reseñas totales</p>
        </div>
      </div>

      <section aria-labelledby="titulo-de-reputacion" className="mt-10">
        <h2 id="titulo-de-reputacion" className="font-display text-2xl font-extrabold text-navy">
          Reputación por colaborador
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {reputaciones.map(({ trabajador, reputacion }) => (
            <li key={trabajador.id}>
              <button onClick={() => setIdDelTrabajador(trabajador.id)} aria-pressed={idDelTrabajador === trabajador.id} className={`surface leaf-sm w-full cursor-pointer p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:shadow-lift ${idDelTrabajador === trabajador.id ? "ring-2 ring-lagoon" : ""}`}>
                <span className="block truncate text-sm font-bold text-navy">{trabajador.nombre}</span>
                {reputacion.promedio !== null && (
                  <span className="mt-2 flex items-center gap-2">
                    <Puntuacion valor={reputacion.promedio} />
                    <span className="text-sm font-bold text-navy">{reputacion.promedio.toFixed(1)}</span>
                    <span className="text-xs text-slate">({reputacion.cantidad})</span>
                  </span>
                )}
                {reputacion.promedio === null && <span className="mt-2 block text-xs text-slate">Sin calificaciones</span>}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-de-resenas" className="mt-10">
        <h2 id="titulo-de-resenas" className="font-display text-2xl font-extrabold text-navy">
          Reseñas
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_12rem_14rem] md:items-end">
          <div className="relative">
            <Icono nombre="buscar" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
            <input type="search" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Buscar por cliente, colaborador o comentario" aria-label="Buscar reseñas" className="field pl-11" />
          </div>
          <CampoDeFormulario id="filtro-de-puntuacion" etiqueta="Puntuación">
            <select id="filtro-de-puntuacion" value={puntuacion} onChange={(evento) => setPuntuacion(evento.target.value)} className="field cursor-pointer">
              {OPCIONES_DE_PUNTUACION.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion === "Todas" ? "Todas" : `${opcion} de 5`}
                </option>
              ))}
            </select>
          </CampoDeFormulario>
          <CampoDeFormulario id="filtro-de-colaborador" etiqueta="Colaborador">
            <select id="filtro-de-colaborador" value={idDelTrabajador} onChange={(evento) => setIdDelTrabajador(evento.target.value)} className="field cursor-pointer">
              <option value="todos">Todos</option>
              {trabajadores.map((trabajador) => (
                <option key={trabajador.id} value={trabajador.id}>
                  {trabajador.nombre}
                </option>
              ))}
            </select>
          </CampoDeFormulario>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate" aria-live="polite">
            Mostrando <strong className="text-navy">{resenasVisibles.length}</strong> de {resenas.length} reseñas
          </p>
          {hayFiltros && (
            <button
              onClick={() => {
                setBusqueda("");
                setPuntuacion("Todas");
                setIdDelTrabajador("todos");
              }}
              className="btn btn-quiet"
            >
              <Icono nombre="restablecer" className="h-4 w-4" />
              Restablecer filtros
            </button>
          )}
        </div>

        {resenasVisibles.length === 0 && <p className="mt-4 rounded-2xl bg-white p-10 text-center text-sm text-slate">No hay reseñas que coincidan.</p>}
        <ul className="mt-4 space-y-3">
          {resenasVisibles.map(({ solicitud, calificacion, trabajador, cliente }) => (
            <li key={solicitud.id}>
              <button onClick={() => onNavegar("solicitudes", { idDeSolicitud: solicitud.id })} className="surface leaf-sm grid w-full cursor-pointer gap-3 px-5 py-4 text-left transition duration-300 ease-soft hover:-translate-y-0.5 hover:shadow-lift md:grid-cols-[9rem_1fr_11rem] md:items-center md:gap-6">
                <span>
                  <Puntuacion valor={calificacion.puntuacion} />
                  <span className="mt-1 block text-xs text-slate">{formatearFechaNumerica(calificacion.fecha)}</span>
                </span>
                <span className="min-w-0">
                  <span className="block text-sm text-storm">{calificacion.comentario ? `“${calificacion.comentario}”` : "Sin comentario"}</span>
                  <span className="mt-1 block text-xs text-slate">
                    {cliente} · {solicitud.id} · {solicitud.servicio}
                  </span>
                </span>
                <span className="text-sm font-bold text-navy">{trabajador ? trabajador.nombre : "Sin colaborador"}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
