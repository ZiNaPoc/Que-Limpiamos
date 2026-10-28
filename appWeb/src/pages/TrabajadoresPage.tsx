import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useTrabajadores, validarNuevoTrabajador, type ErroresDeNuevoTrabajador } from "../data/TrabajadoresContext";
import { DOCUMENTOS_DEL_REGISTRO, DOCUMENTOS_REQUERIDOS } from "../data/trabajadores";
import type { DatosDeNuevoTrabajador, ResultadoDeOperacion, Trabajador } from "../data/tipos";
import { describirTiposPermitidos, formatearTamanoDeArchivo, TAMANO_MAXIMO_DE_ARCHIVO_EN_BYTES, TIPOS_DE_DOCUMENTO_PERMITIDOS, validarArchivo } from "../utils/archivos";
import { AvisoTemporal } from "../components/comunes/AvisoTemporal";
import { CampoDeFormulario } from "../components/comunes/CampoDeFormulario";
import { Icono, type NombreDeIcono } from "../components/comunes/Icono";
import { InsigniaDeDatosDeDemostracion, InsigniaDeEstado } from "../components/comunes/Insignias";
import { VentanaModal } from "../components/comunes/VentanasModales";

function describirReputacion(trabajador: Trabajador): string {
  if (trabajador.calificacion === null) {
    return "Sin reseñas todavía";
  }
  return `${trabajador.calificacion.toFixed(1)} de 5`;
}

function DatoDelTrabajador({ icono, etiqueta, children }: { icono: NombreDeIcono; etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-beige px-4 py-3">
      <Icono nombre={icono} className="mt-0.5 text-lagoon" />
      <div className="min-w-0">
        <dt className="text-xs font-bold uppercase tracking-wider text-slate">{etiqueta}</dt>
        <dd className="mt-0.5 break-words text-sm font-bold text-navy">{children}</dd>
      </div>
    </div>
  );
}

function VentanaDeDetalleDelTrabajador({ trabajador, onCerrar }: { trabajador: Trabajador; onCerrar: () => void }) {
  return (
    <VentanaModal idDelTitulo="titulo-del-trabajador" onCerrar={onCerrar} claseDeAncho="max-w-2xl">
      <button onClick={onCerrar} aria-label="Cerrar detalle del trabajador" className="absolute right-4 top-4 grid h-10 w-10 cursor-pointer place-items-center rounded-full text-slate transition duration-300 hover:bg-sky/50">
        <Icono nombre="cerrar" />
      </button>

      <div className="flex items-center gap-5">
        <span className="pebble grid h-20 w-20 shrink-0 place-items-center bg-navy font-display text-3xl font-extrabold text-moss">{trabajador.nombre.charAt(0)}</span>
        <div>
          <h2 id="titulo-del-trabajador" className="text-3xl font-extrabold uppercase leading-tight text-navy">
            {trabajador.nombre}
          </h2>
          <p className="mt-1 text-sm font-bold text-lagoon">#{trabajador.id}</p>
        </div>
      </div>

      <div className="mt-7 grid gap-6 sm:grid-cols-5">
        <dl className="space-y-2 sm:col-span-3">
          <DatoDelTrabajador icono="telefono" etiqueta="Teléfono">{trabajador.telefono}</DatoDelTrabajador>
          <DatoDelTrabajador icono="correo" etiqueta="Correo">{trabajador.correo}</DatoDelTrabajador>
          <DatoDelTrabajador icono="ubicacion" etiqueta="Dirección">{trabajador.direccion}</DatoDelTrabajador>
          <DatoDelTrabajador icono="estrella" etiqueta="Reputación">{describirReputacion(trabajador)}</DatoDelTrabajador>
          <DatoDelTrabajador icono="usuario" etiqueta="Estatus">
            <InsigniaDeEstado estado={trabajador.estado} />
          </DatoDelTrabajador>
        </dl>

        <section aria-labelledby="titulo-de-documentacion" className="rounded-2xl bg-moon p-5 sm:col-span-2">
          <h3 id="titulo-de-documentacion" className="text-center font-display text-base font-bold text-navy">
            Documentación subida
          </h3>
          <ul className="mt-4 space-y-3">
            {DOCUMENTOS_REQUERIDOS.map((documento) => {
              const documentoEntregado = trabajador.documentosEntregados.includes(documento);
              return (
                <li key={documento} className="flex items-start gap-2 text-sm">
                  <Icono nombre={documentoEntregado ? "palomita" : "alerta"} className={`mt-0.5 h-4 w-4 ${documentoEntregado ? "text-sage" : "text-ochre"}`} />
                  <span>
                    <span className="block font-bold text-navy">{documento}</span>
                    <span className="block text-xs text-slate">{documentoEntregado ? "Entregado" : "Pendiente"}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </VentanaModal>
  );
}

const FILTROS_DE_ESTADO_DEL_TRABAJADOR = ["Todos", "Disponible", "Ocupado"];

function ListaDeTrabajadores({ onAnadir }: { onAnadir: () => void }) {
  const { trabajadores } = useTrabajadores();
  const [busqueda, setBusqueda] = useState("");
  const [filtroDeEstado, setFiltroDeEstado] = useState("Todos");
  const [idsDeTrabajadoresSeleccionados, setIdsDeTrabajadoresSeleccionados] = useState<string[]>([]);
  const [trabajadorAbierto, setTrabajadorAbierto] = useState<Trabajador | null>(null);

  const trabajadoresVisibles = trabajadores.filter((trabajador) => {
    const coincideConElEstado = filtroDeEstado === "Todos" || trabajador.estado === filtroDeEstado;
    const textoDelTrabajador = `${trabajador.id} ${trabajador.nombre} ${trabajador.telefono}`.toLowerCase();
    return coincideConElEstado && textoDelTrabajador.includes(busqueda.trim().toLowerCase());
  });

  function alternarSeleccion(idDelTrabajador: string) {
    if (idsDeTrabajadoresSeleccionados.includes(idDelTrabajador)) {
      setIdsDeTrabajadoresSeleccionados(idsDeTrabajadoresSeleccionados.filter((id) => id !== idDelTrabajador));
    } else {
      setIdsDeTrabajadoresSeleccionados([...idsDeTrabajadoresSeleccionados, idDelTrabajador]);
    }
  }

  const cantidadSeleccionada = idsDeTrabajadoresSeleccionados.length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-extrabold text-navy">Gestión de trabajadores</h1>
        <InsigniaDeDatosDeDemostracion />
      </div>
      <p className="mt-2 text-sm text-slate">Consulta los datos, la reputación y la documentación de cada trabajador.</p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icono nombre="buscar" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input type="search" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Buscar por ID, nombre o teléfono" aria-label="Buscar trabajadores" className="field pl-11" />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
          {FILTROS_DE_ESTADO_DEL_TRABAJADOR.map((estado) => (
            <button key={estado} onClick={() => setFiltroDeEstado(estado)} aria-pressed={filtroDeEstado === estado} className={`cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition duration-300 ${filtroDeEstado === estado ? "bg-navy text-white" : "bg-white text-storm hover:bg-sky/50"}`}>
              {estado}
            </button>
          ))}
        </div>
      </div>

      {cantidadSeleccionada > 0 && (
        <div role="status" className="pop mt-5 flex items-center justify-between gap-3 rounded-2xl bg-moss/40 px-5 py-3 text-sm font-bold text-storm">
          {cantidadSeleccionada} {cantidadSeleccionada === 1 ? "trabajador seleccionado" : "trabajadores seleccionados"}
          <button onClick={() => setIdsDeTrabajadoresSeleccionados([])} className="cursor-pointer underline underline-offset-4">
            Quitar selección
          </button>
        </div>
      )}

      {trabajadoresVisibles.length === 0 && <p className="mt-6 rounded-2xl bg-white p-10 text-center text-sm text-slate">No hay trabajadores que coincidan.</p>}

      <ul className="mt-6 space-y-3">
        {trabajadoresVisibles.map((trabajador) => (
          <li key={trabajador.id} className={`surface leaf-sm flex items-center gap-2 pl-4 pr-2 transition duration-300 ${idsDeTrabajadoresSeleccionados.includes(trabajador.id) ? "ring-2 ring-moss" : ""}`}>
            <input type="checkbox" checked={idsDeTrabajadoresSeleccionados.includes(trabajador.id)} onChange={() => alternarSeleccion(trabajador.id)} aria-label={`Seleccionar a ${trabajador.nombre}`} className="h-5 w-5 shrink-0 cursor-pointer accent-navy" />
            <button onClick={() => setTrabajadorAbierto(trabajador)} aria-label={`Ver perfil de ${trabajador.nombre}`} className="grid min-w-0 flex-1 cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl px-3 py-4 text-left transition duration-300 hover:bg-sky/25 md:grid-cols-[auto_4.5rem_1fr_9rem_auto_auto]">
              <span className="pebble grid h-11 w-11 place-items-center bg-sky font-display text-lg font-extrabold text-navy">{trabajador.nombre.charAt(0)}</span>
              <span className="hidden text-sm font-bold text-lagoon md:block">#{trabajador.id}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-navy">{trabajador.nombre}</span>
                <span className="block text-xs text-slate md:hidden">{trabajador.telefono}</span>
              </span>
              <span className="hidden text-sm text-slate md:block">{trabajador.telefono}</span>
              <InsigniaDeEstado estado={trabajador.estado} />
              <Icono nombre="chevronDerecho" className="hidden text-slate md:block" />
            </button>
          </li>
        ))}
      </ul>

      <button onClick={onAnadir} className="btn btn-primary mt-6 w-full">
        <Icono nombre="mas" className="h-4 w-4" />
        Añadir trabajador
      </button>

      {trabajadorAbierto && <VentanaDeDetalleDelTrabajador trabajador={trabajadorAbierto} onCerrar={() => setTrabajadorAbierto(null)} />}
    </div>
  );
}

type DocumentoSeleccionado = { nombreDelArchivo: string; tamanoEnBytes: number };

type FilaDeDocumentoProps = {
  documento: string;
  icono: NombreDeIcono;
  seleccionado: DocumentoSeleccionado | undefined;
  error: string | undefined;
  estaRevisando: boolean;
  onSeleccionar: (archivo: File) => void;
  onQuitar: () => void;
};

function FilaDeDocumento({ documento, icono, seleccionado, error, estaRevisando, onSeleccionar, onQuitar }: FilaDeDocumentoProps) {
  const selectorRef = useRef<HTMLInputElement>(null);
  const idDelError = `documento-${documento}-error`;

  function handleCambio(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (archivo) {
      onSeleccionar(archivo);
    }
  }

  let detalle = "Sin archivo";
  if (estaRevisando) {
    detalle = "Revisando archivo…";
  } else if (seleccionado) {
    detalle = `${seleccionado.nombreDelArchivo} · ${formatearTamanoDeArchivo(seleccionado.tamanoEnBytes)}`;
  }

  return (
    <li className="rounded-2xl bg-beige px-4 py-3">
      <div className="flex items-center gap-3">
        <Icono nombre={icono} className="h-7 w-7 text-lagoon" />
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
        <button type="button" onClick={() => selectorRef.current?.click()} disabled={estaRevisando} aria-label={`${seleccionado ? "Cambiar" : "Adjuntar"} ${documento}`} aria-describedby={error ? idDelError : undefined} className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-navy transition duration-300 hover:bg-sky/50 disabled:cursor-not-allowed disabled:opacity-50">
          <Icono nombre="subir" />
        </button>
      </div>
      {error && (
        <p id={idDelError} role="alert" className="mt-1.5 text-xs font-semibold text-err">
          {error}
        </p>
      )}
    </li>
  );
}

const DATOS_DE_TRABAJADOR_VACIOS: DatosDeNuevoTrabajador = { nombre: "", telefono: "", correo: "", direccion: "", documentosEntregados: [] };
const ICONO_POR_DOCUMENTO: Record<string, NombreDeIcono> = {
  "Identificación oficial": "reportes",
  "Comprobante de domicilio": "ubicacion",
};

function FormularioDeNuevoTrabajador({ onCancelar, onTerminar }: { onCancelar: () => void; onTerminar: (resultado: ResultadoDeOperacion) => void }) {
  const { trabajadores, agregarTrabajador } = useTrabajadores();
  const [datos, setDatos] = useState<DatosDeNuevoTrabajador>(DATOS_DE_TRABAJADOR_VACIOS);
  const [errores, setErrores] = useState<ErroresDeNuevoTrabajador>({});
  const [documentosSeleccionados, setDocumentosSeleccionados] = useState<Record<string, DocumentoSeleccionado>>({});
  const [erroresDeDocumentos, setErroresDeDocumentos] = useState<Record<string, string>>({});
  const [documentoEnRevision, setDocumentoEnRevision] = useState<string | null>(null);

  function cambiarCampo(campo: keyof ErroresDeNuevoTrabajador, valor: string) {
    setDatos({ ...datos, [campo]: valor });
  }

  async function seleccionarDocumento(documento: string, archivo: File) {
    setDocumentoEnRevision(documento);
    const error = await validarArchivo(archivo, TIPOS_DE_DOCUMENTO_PERMITIDOS);
    setDocumentoEnRevision(null);
    if (error) {
      setErroresDeDocumentos((erroresAnteriores) => ({ ...erroresAnteriores, [documento]: error }));
      return;
    }
    setErroresDeDocumentos((erroresAnteriores) => ({ ...erroresAnteriores, [documento]: "" }));
    setDocumentosSeleccionados((anteriores) => ({ ...anteriores, [documento]: { nombreDelArchivo: archivo.name, tamanoEnBytes: archivo.size } }));
  }

  function quitarDocumento(documento: string) {
    setDocumentosSeleccionados((anteriores) => {
      const restantes = { ...anteriores };
      delete restantes[documento];
      return restantes;
    });
  }

  function handleEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datosCompletos = { ...datos, documentosEntregados: DOCUMENTOS_DEL_REGISTRO.filter((documento) => documentosSeleccionados[documento]) };
    const erroresEncontrados = validarNuevoTrabajador(datosCompletos, trabajadores);
    setErrores(erroresEncontrados);
    if (Object.keys(erroresEncontrados).length > 0) {
      return;
    }
    onTerminar(agregarTrabajador(datosCompletos));
  }

  function propiedadesDeError(campo: keyof ErroresDeNuevoTrabajador) {
    return {
      "aria-invalid": Boolean(errores[campo]),
      "aria-describedby": errores[campo] ? `trabajador-${campo}-error` : undefined,
    };
  }

  return (
    <div>
      <button onClick={onCancelar} className="btn btn-quiet">
        <Icono nombre="volver" className="h-4 w-4" />
        Volver a trabajadores
      </button>
      <div className="mt-8 flex items-center gap-3">
        <Icono nombre="mas" className="h-7 w-7 text-navy" />
        <h1 className="text-4xl font-extrabold text-navy">Nuevo trabajador</h1>
      </div>

      <form onSubmit={handleEnviar} noValidate className="surface leaf mt-8 max-w-3xl space-y-5 p-7 sm:p-9">
        <CampoDeFormulario id="trabajador-nombre" etiqueta="Nombre del trabajador" error={errores.nombre}>
          <input id="trabajador-nombre" type="text" autoComplete="name" maxLength={140} value={datos.nombre} onChange={(evento) => cambiarCampo("nombre", evento.target.value)} {...propiedadesDeError("nombre")} className="field" />
        </CampoDeFormulario>
        <CampoDeFormulario id="trabajador-telefono" etiqueta="Teléfono" error={errores.telefono}>
          <input id="trabajador-telefono" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} placeholder="998 123 4567" value={datos.telefono} onChange={(evento) => cambiarCampo("telefono", evento.target.value)} {...propiedadesDeError("telefono")} className="field" />
        </CampoDeFormulario>
        <CampoDeFormulario id="trabajador-correo" etiqueta="Correo electrónico" error={errores.correo}>
          <input id="trabajador-correo" type="email" autoComplete="email" maxLength={140} value={datos.correo} onChange={(evento) => cambiarCampo("correo", evento.target.value)} {...propiedadesDeError("correo")} className="field" />
        </CampoDeFormulario>
        <CampoDeFormulario id="trabajador-direccion" etiqueta="Dirección" error={errores.direccion}>
          <input id="trabajador-direccion" type="text" autoComplete="street-address" maxLength={140} value={datos.direccion} onChange={(evento) => cambiarCampo("direccion", evento.target.value)} {...propiedadesDeError("direccion")} className="field" />
        </CampoDeFormulario>

        <fieldset>
          <legend className="label">Documentación</legend>
          <ul className="space-y-2">
            {DOCUMENTOS_DEL_REGISTRO.map((documento) => (
              <FilaDeDocumento
                key={documento}
                documento={documento}
                icono={ICONO_POR_DOCUMENTO[documento]}
                seleccionado={documentosSeleccionados[documento]}
                error={erroresDeDocumentos[documento] || undefined}
                estaRevisando={documentoEnRevision === documento}
                onSeleccionar={(archivo) => seleccionarDocumento(documento, archivo)}
                onQuitar={() => quitarDocumento(documento)}
              />
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate">
            {describirTiposPermitidos(TIPOS_DE_DOCUMENTO_PERMITIDOS)} · hasta {formatearTamanoDeArchivo(TAMANO_MAXIMO_DE_ARCHIVO_EN_BYTES)}. Los archivos se revisan en el navegador y no se envían a ningún servidor; solo se registra que se entregaron.
          </p>
        </fieldset>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancelar} className="btn btn-quiet">
            Cancelar
          </button>
          <button type="submit" disabled={documentoEnRevision !== null} className="btn btn-primary">
            Añadir trabajador
          </button>
        </div>
      </form>
    </div>
  );
}

export function TrabajadoresPage() {
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [aviso, setAviso] = useState<ResultadoDeOperacion | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [formularioAbierto]);

  function terminarRegistro(resultado: ResultadoDeOperacion) {
    setAviso(resultado);
    if (resultado.exito) {
      setFormularioAbierto(false);
    }
  }

  return (
    <>
      <div key={String(formularioAbierto)} className="fade">
        {formularioAbierto && <FormularioDeNuevoTrabajador onCancelar={() => setFormularioAbierto(false)} onTerminar={terminarRegistro} />}
        {!formularioAbierto && <ListaDeTrabajadores onAnadir={() => setFormularioAbierto(true)} />}
      </div>
      {aviso && <AvisoTemporal aviso={aviso} onTerminar={() => setAviso(null)} />}
    </>
  );
}
