import { useState, type ReactNode } from "react";
import type { ColumnaDeSeccion, FilaDeSeccion, SeccionDeDatos } from "../data/tipos";
import { Icono } from "../components/comunes/Icono";
import { InsigniaDeDatosDeDemostracion, InsigniaDeEstado } from "../components/comunes/Insignias";

function mostrarCelda(claveDeColumna: string, valor: string): ReactNode {
  if (claveDeColumna === "estado") {
    return <InsigniaDeEstado estado={valor} />;
  }
  if (claveDeColumna === "id") {
    return <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">{valor}</span>;
  }
  return valor;
}

type TablaDeDatosProps = {
  columnas: ColumnaDeSeccion[];
  filas: FilaDeSeccion[];
  textoSinResultados: string;
};

function TablaDeDatos({ columnas, filas, textoSinResultados }: TablaDeDatosProps) {
  if (filas.length === 0) {
    return <div className="leaf-sm border border-dashed border-frost bg-white/60 p-10 text-center text-sm text-slate">{textoSinResultados}</div>;
  }
  return (
    <div className="surface leaf-sm overflow-x-auto">
      <table className="w-full min-w-[34rem] text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-slate">
          <tr>
            {columnas.map((columna) => (
              <th key={columna.clave} scope="col" className="px-6 py-4 font-bold">
                {columna.etiqueta}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-mist/70">
          {filas.map((fila) => (
            <tr key={fila.id} className="transition duration-300 hover:bg-moon/50">
              {columnas.map((columna) => (
                <td key={columna.clave} className="px-6 py-4">
                  {mostrarCelda(columna.clave, fila[columna.clave])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function claseDelFiltroDeEstado(estaActivo: boolean) {
  const claseBase = "cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition duration-300";
  if (estaActivo) {
    return `${claseBase} bg-navy text-white`;
  }
  return `${claseBase} bg-white text-storm hover:bg-sky/50`;
}

export function SeccionDeDatosPage({ seccion }: { seccion: SeccionDeDatos }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroDeEstado, setFiltroDeEstado] = useState("Todos");

  const estadosDisponibles = ["Todos"];
  seccion.filas.forEach((fila) => {
    if (fila.estado && !estadosDisponibles.includes(fila.estado)) {
      estadosDisponibles.push(fila.estado);
    }
  });

  const filasVisibles = seccion.filas.filter((fila) => {
    const coincideConElEstado = filtroDeEstado === "Todos" || fila.estado === filtroDeEstado;
    const coincideConLaBusqueda = Object.values(fila).join(" ").toLowerCase().includes(busqueda.trim().toLowerCase());
    return coincideConElEstado && coincideConLaBusqueda;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-extrabold text-navy">{seccion.titulo}</h1>
        <InsigniaDeDatosDeDemostracion />
      </div>
      <p className="mt-2 text-sm text-slate">{seccion.subtitulo}</p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Icono nombre="buscar" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input type="search" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Buscar…" aria-label={`Buscar en ${seccion.titulo}`} className="field pl-11" />
        </div>
        {estadosDisponibles.length > 1 &&
          estadosDisponibles.map((estado) => (
            <button key={estado} onClick={() => setFiltroDeEstado(estado)} aria-pressed={filtroDeEstado === estado} className={claseDelFiltroDeEstado(filtroDeEstado === estado)}>
              {estado}
            </button>
          ))}
      </div>

      <div className="mt-6">
        <TablaDeDatos columnas={seccion.columnas} filas={filasVisibles} textoSinResultados="No hay resultados para tu búsqueda." />
      </div>
    </div>
  );
}
