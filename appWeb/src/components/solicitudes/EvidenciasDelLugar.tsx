import { useState } from "react";
import type { EvidenciaFotografica, Solicitud } from "../../data/tipos";
import { formatearTamanoDeArchivo } from "../../utils/archivos";
import { Icono } from "../comunes/Icono";
import { VentanaModal } from "../comunes/VentanasModales";

// Las fotografías las adjunta el cliente desde la app para facilitar la estimación.
// El administrador solo las consulta: no puede agregarlas ni quitarlas.

function VentanaDeFotografiaAmpliada({ evidencias, indiceInicial, onCerrar }: { evidencias: EvidenciaFotografica[]; indiceInicial: number; onCerrar: () => void }) {
  const [indiceActual, setIndiceActual] = useState(indiceInicial);
  const evidencia = evidencias[indiceActual];
  const hayVarias = evidencias.length > 1;

  function mostrarOtra(desplazamiento: number) {
    setIndiceActual((indiceAnterior) => (indiceAnterior + desplazamiento + evidencias.length) % evidencias.length);
  }

  return (
    <VentanaModal idDelTitulo="titulo-de-fotografia" onCerrar={onCerrar} claseDeAncho="max-w-4xl">
      <div className="min-w-0 pr-12">
        <h2 id="titulo-de-fotografia" className="truncate text-xl font-extrabold text-navy">
          {evidencia.nombreDelArchivo}
        </h2>
        <p className="mt-1 text-xs text-slate">
          Fotografía {indiceActual + 1} de {evidencias.length} · {formatearTamanoDeArchivo(evidencia.tamanoEnBytes)}
        </p>
      </div>
      <button onClick={onCerrar} aria-label="Cerrar fotografía" className="absolute right-4 top-4 grid h-10 w-10 cursor-pointer place-items-center rounded-full text-slate transition duration-300 hover:bg-sky/50">
        <Icono nombre="cerrar" />
      </button>
      <div className="mt-5 grid place-items-center overflow-hidden rounded-2xl bg-moon">
        <img src={evidencia.url} alt={`Fotografía del lugar: ${evidencia.nombreDelArchivo}`} className="max-h-[70vh] w-full object-contain" />
      </div>
      {hayVarias && (
        <div className="mt-5 flex justify-between gap-3">
          <button onClick={() => mostrarOtra(-1)} className="btn btn-quiet">
            <Icono nombre="chevronIzquierdo" className="h-4 w-4" />
            Anterior
          </button>
          <button onClick={() => mostrarOtra(1)} className="btn btn-quiet">
            Siguiente
            <Icono nombre="chevronDerecho" className="h-4 w-4" />
          </button>
        </div>
      )}
    </VentanaModal>
  );
}

export function EvidenciasDelLugar({ solicitud }: { solicitud: Solicitud }) {
  const [indiceAmpliado, setIndiceAmpliado] = useState<number | null>(null);
  const cantidad = solicitud.evidencias.length;

  return (
    <section aria-labelledby={`titulo-de-evidencias-${solicitud.id}`} className="mt-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={`titulo-de-evidencias-${solicitud.id}`} className="font-display text-lg font-extrabold text-navy">
          Fotografías del lugar
        </h3>
        <span className="text-xs font-bold text-slate">Adjuntadas por el cliente · {cantidad}</span>
      </div>

      {cantidad === 0 && (
        <p className="mt-3 flex items-center gap-2 rounded-2xl bg-beige p-5 text-sm text-slate">
          <Icono nombre="imagen" className="text-lagoon" />
          El cliente no adjuntó fotografías. Son opcionales; la solicitud sigue su proceso sin ellas.
        </p>
      )}

      {cantidad > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {solicitud.evidencias.map((evidencia, indice) => (
            <li key={evidencia.id}>
              <button onClick={() => setIndiceAmpliado(indice)} aria-label={`Ampliar fotografía ${indice + 1} de ${cantidad}: ${evidencia.nombreDelArchivo}`} className="group block w-full cursor-pointer overflow-hidden rounded-2xl bg-moon shadow-card">
                <img src={evidencia.url} alt="" className="aspect-square w-full object-cover transition duration-500 ease-soft group-hover:scale-105" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {indiceAmpliado !== null && <VentanaDeFotografiaAmpliada evidencias={solicitud.evidencias} indiceInicial={indiceAmpliado} onCerrar={() => setIndiceAmpliado(null)} />}
    </section>
  );
}
