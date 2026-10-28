import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useSolicitudes } from "../../data/SolicitudesContext";
import type { EvidenciaFotografica, ResultadoDeOperacion, Solicitud } from "../../data/tipos";
import { describirTiposPermitidos, formatearTamanoDeArchivo, prepararFotografia, TAMANO_MAXIMO_DE_ARCHIVO_EN_BYTES, TIPOS_DE_FOTOGRAFIA_PERMITIDOS } from "../../utils/archivos";
import { CANTIDAD_MAXIMA_DE_EVIDENCIAS, estaActiva, evaluarIncorporacionDeEvidencias } from "../../utils/reglasDeSolicitudes";
import { Icono } from "../comunes/Icono";
import { VentanaModal } from "../comunes/VentanasModales";

function VentanaDeFotografiaAmpliada({ evidencias, indiceInicial, onCerrar }: { evidencias: EvidenciaFotografica[]; indiceInicial: number; onCerrar: () => void }) {
  const [indiceActual, setIndiceActual] = useState(indiceInicial);
  const evidencia = evidencias[indiceActual];
  const hayVarias = evidencias.length > 1;

  function mostrarOtra(desplazamiento: number) {
    setIndiceActual((indiceAnterior) => (indiceAnterior + desplazamiento + evidencias.length) % evidencias.length);
  }

  return (
    <VentanaModal idDelTitulo="titulo-de-fotografia" onCerrar={onCerrar} claseDeAncho="max-w-4xl">
      <div className="flex items-start justify-between gap-4 pr-12">
        <div className="min-w-0">
          <h2 id="titulo-de-fotografia" className="truncate text-xl font-extrabold text-navy">
            {evidencia.nombreDelArchivo}
          </h2>
          <p className="mt-1 text-xs text-slate">
            Fotografía {indiceActual + 1} de {evidencias.length} · {formatearTamanoDeArchivo(evidencia.tamanoEnBytes)}
          </p>
        </div>
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

type EvidenciasDelLugarProps = {
  solicitud: Solicitud;
  onResultado: (resultado: ResultadoDeOperacion) => void;
};

export function EvidenciasDelLugar({ solicitud, onResultado }: EvidenciasDelLugarProps) {
  const { incorporarEvidencias } = useSolicitudes();
  const selectorDeArchivosRef = useRef<HTMLInputElement>(null);
  const [fotografiasPorAgregar, setFotografiasPorAgregar] = useState<EvidenciaFotografica[]>([]);
  const [erroresDeSeleccion, setErroresDeSeleccion] = useState<string[]>([]);
  const [estaRevisandoArchivos, setEstaRevisandoArchivos] = useState(false);
  const [indiceAmpliado, setIndiceAmpliado] = useState<number | null>(null);
  const fotografiasPorAgregarRef = useRef(fotografiasPorAgregar);
  fotografiasPorAgregarRef.current = fotografiasPorAgregar;

  useEffect(() => {
    return () => {
      fotografiasPorAgregarRef.current.forEach((fotografia) => URL.revokeObjectURL(fotografia.url));
    };
  }, []);

  const solicitudAdmiteFotografias = estaActiva(solicitud);
  const espaciosDisponibles = CANTIDAD_MAXIMA_DE_EVIDENCIAS - solicitud.evidencias.length - fotografiasPorAgregar.length;
  const idDeLaAyuda = `ayuda-de-fotografias-${solicitud.id}`;

  async function handleSeleccionDeArchivos(evento: ChangeEvent<HTMLInputElement>) {
    const archivosSeleccionados = Array.from(evento.target.files ?? []);
    evento.target.value = "";
    if (archivosSeleccionados.length === 0) {
      return;
    }
    setEstaRevisandoArchivos(true);
    const errores: string[] = [];
    const fotografiasValidas: EvidenciaFotografica[] = [];
    let espaciosRestantes = espaciosDisponibles;

    for (const [indice, archivo] of archivosSeleccionados.entries()) {
      if (espaciosRestantes <= 0) {
        errores.push(`«${archivo.name}» no se agregó: cada solicitud admite como máximo ${CANTIDAD_MAXIMA_DE_EVIDENCIAS} fotografías.`);
        continue;
      }
      const yaEstabaSeleccionada = fotografiasPorAgregar.some((fotografia) => fotografia.nombreDelArchivo === archivo.name && fotografia.tamanoEnBytes === archivo.size);
      if (yaEstabaSeleccionada) {
        errores.push(`«${archivo.name}» ya estaba seleccionada.`);
        continue;
      }
      const resultado = await prepararFotografia(archivo);
      if ("error" in resultado) {
        errores.push(resultado.error);
        continue;
      }
      fotografiasValidas.push({
        id: `${solicitud.id}-${Date.now().toString(36)}-${indice}`,
        nombreDelArchivo: archivo.name,
        tipoDeArchivo: archivo.type,
        tamanoEnBytes: archivo.size,
        url: resultado.url,
        fechaDeIncorporacion: new Date().toISOString(),
      });
      espaciosRestantes -= 1;
    }

    setFotografiasPorAgregar((fotografiasAnteriores) => [...fotografiasAnteriores, ...fotografiasValidas]);
    setErroresDeSeleccion(errores);
    setEstaRevisandoArchivos(false);
  }

  function quitarFotografia(idDeLaFotografia: string) {
    const fotografia = fotografiasPorAgregar.find((fotografiaBuscada) => fotografiaBuscada.id === idDeLaFotografia);
    if (fotografia) {
      URL.revokeObjectURL(fotografia.url);
    }
    setFotografiasPorAgregar(fotografiasPorAgregar.filter((fotografiaBuscada) => fotografiaBuscada.id !== idDeLaFotografia));
  }

  function descartarSeleccion() {
    fotografiasPorAgregar.forEach((fotografia) => URL.revokeObjectURL(fotografia.url));
    setFotografiasPorAgregar([]);
    setErroresDeSeleccion([]);
  }

  function agregarALaSolicitud() {
    const resultado = incorporarEvidencias(solicitud.id, fotografiasPorAgregar);
    if (resultado.exito) {
      setFotografiasPorAgregar([]);
      setErroresDeSeleccion([]);
    }
    onResultado(resultado);
  }

  let textoDelBotonDeAgregar = `Agregar ${fotografiasPorAgregar.length} fotografías a la solicitud`;
  if (fotografiasPorAgregar.length === 1) {
    textoDelBotonDeAgregar = "Agregar 1 fotografía a la solicitud";
  }

  return (
    <section aria-labelledby={`titulo-de-evidencias-${solicitud.id}`} className="mt-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={`titulo-de-evidencias-${solicitud.id}`} className="font-display text-lg font-extrabold text-navy">
          Fotografías del lugar
        </h3>
        <span className="text-xs font-bold text-slate">Opcionales · {solicitud.evidencias.length} de {CANTIDAD_MAXIMA_DE_EVIDENCIAS}</span>
      </div>

      {solicitud.evidencias.length === 0 && (
        <p className="mt-3 flex items-center gap-2 rounded-2xl bg-beige p-5 text-sm text-slate">
          <Icono nombre="imagen" className="text-lagoon" />
          Esta solicitud no tiene fotografías. Puede continuar su proceso sin ellas.
        </p>
      )}

      {solicitud.evidencias.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {solicitud.evidencias.map((evidencia, indice) => (
            <li key={evidencia.id}>
              <button onClick={() => setIndiceAmpliado(indice)} aria-label={`Ampliar fotografía ${indice + 1} de ${solicitud.evidencias.length}: ${evidencia.nombreDelArchivo}`} className="group block w-full cursor-pointer overflow-hidden rounded-2xl bg-moon shadow-card">
                <img src={evidencia.url} alt="" className="aspect-square w-full object-cover transition duration-500 ease-soft group-hover:scale-105" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {solicitudAdmiteFotografias && (
        <div className="mt-5 rounded-2xl border border-dashed border-frost p-4">
          <input ref={selectorDeArchivosRef} type="file" accept={TIPOS_DE_FOTOGRAFIA_PERMITIDOS.join(",")} multiple onChange={handleSeleccionDeArchivos} className="hidden" tabIndex={-1} aria-hidden />
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => selectorDeArchivosRef.current?.click()} disabled={estaRevisandoArchivos || espaciosDisponibles <= 0} aria-describedby={idDeLaAyuda} className="btn btn-quiet">
              <Icono nombre="imagen" className="h-4 w-4" />
              {estaRevisandoArchivos ? "Revisando archivos…" : "Seleccionar fotografías"}
            </button>
            <p id={idDeLaAyuda} className="text-xs text-slate">
              {espaciosDisponibles > 0 && `${describirTiposPermitidos(TIPOS_DE_FOTOGRAFIA_PERMITIDOS)} · hasta ${formatearTamanoDeArchivo(TAMANO_MAXIMO_DE_ARCHIVO_EN_BYTES)} cada una · máximo ${CANTIDAD_MAXIMA_DE_EVIDENCIAS} por solicitud.`}
              {espaciosDisponibles <= 0 && `Ya se alcanzó el máximo de ${CANTIDAD_MAXIMA_DE_EVIDENCIAS} fotografías para esta solicitud.`}
            </p>
          </div>
          <p className="mt-3 text-xs text-clay">En producción el cliente las adjunta desde la app. Aquí solo se conservan mientras esta pestaña siga abierta; no se envían a ningún servidor.</p>

          {erroresDeSeleccion.length > 0 && (
            <ul role="alert" className="mt-3 space-y-1 rounded-2xl bg-moon p-3 text-xs font-semibold text-err">
              {erroresDeSeleccion.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}

          {fotografiasPorAgregar.length > 0 && (
            <div className="fade mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate">Vista previa · todavía no forman parte de la solicitud</p>
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {fotografiasPorAgregar.map((fotografia) => (
                  <li key={fotografia.id} className="relative overflow-hidden rounded-2xl bg-moon">
                    <img src={fotografia.url} alt={`Vista previa de ${fotografia.nombreDelArchivo}`} className="aspect-square w-full object-cover" />
                    <span className="block truncate px-3 py-2 text-xs text-slate">
                      {fotografia.nombreDelArchivo} · {formatearTamanoDeArchivo(fotografia.tamanoEnBytes)}
                    </span>
                    <button onClick={() => quitarFotografia(fotografia.id)} aria-label={`Quitar ${fotografia.nombreDelArchivo}`} className="absolute right-2 top-2 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/90 text-storm shadow-card transition duration-300 hover:bg-white">
                      <Icono nombre="cerrar" className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap justify-end gap-3">
                <button onClick={descartarSeleccion} className="btn btn-quiet">
                  Descartar
                </button>
                <button onClick={agregarALaSolicitud} className="btn btn-primary">
                  {textoDelBotonDeAgregar}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!solicitudAdmiteFotografias && <p className="mt-4 rounded-2xl bg-moss/30 p-3 text-xs text-storm">{evaluarIncorporacionDeEvidencias(solicitud, 1).mensaje}</p>}

      {indiceAmpliado !== null && <VentanaDeFotografiaAmpliada evidencias={solicitud.evidencias} indiceInicial={indiceAmpliado} onCerrar={() => setIndiceAmpliado(null)} />}
    </section>
  );
}
