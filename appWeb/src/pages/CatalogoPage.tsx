import { useEffect, useState, type FormEvent } from "react";
import {
  BORRADOR_DE_SERVICIO_VACIO,
  CATEGORIAS_DE_SERVICIO,
  crearBorradorDesdeServicio,
  useCatalogo,
  validarServicio,
  type BorradorDeServicio,
  type ErroresDelServicio,
} from "../data/CatalogoContext";
import type { CategoriaDeServicio, ResultadoDeOperacion, ServicioDelCatalogo } from "../data/tipos";
import { normalizarTexto } from "../utils/formato";
import { AvisoTemporal } from "../components/comunes/AvisoTemporal";
import { CampoDeFormulario } from "../components/comunes/CampoDeFormulario";
import { Icono } from "../components/comunes/Icono";
import { InsigniaDeDatosDeDemostracion, InsigniaDeEstado } from "../components/comunes/Insignias";
import { TarjetaDeIndicador } from "../components/comunes/TarjetaDeIndicador";

type VistaDelCatalogo = { tipo: "lista" } | { tipo: "nuevo" } | { tipo: "editar"; idDelServicio: string };

const FILTROS_DE_ESTADO_DEL_SERVICIO = ["Todos", "Activo", "Inactivo"];

const TITULO_POR_CATEGORIA: Record<CategoriaDeServicio, string> = {
  Principal: "Servicios principales",
  Extra: "Servicios extras",
};

function claseDelFiltroDeEstado(estaActivo: boolean) {
  const claseBase = "cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition duration-300";
  if (estaActivo) {
    return `${claseBase} bg-navy text-white`;
  }
  return `${claseBase} bg-white text-storm hover:bg-sky/50`;
}

type CampoNumericoProps = {
  id: keyof BorradorDeServicio;
  etiqueta: string;
  valor: string;
  error?: string;
  onCambiar: (valor: string) => void;
};

function CampoNumerico({ id, etiqueta, valor, error, onCambiar }: CampoNumericoProps) {
  const idDelCampo = `servicio-${id}`;
  return (
    <CampoDeFormulario id={idDelCampo} etiqueta={etiqueta} error={error}>
      <input id={idDelCampo} type="number" inputMode="decimal" min="0" step="0.01" value={valor} onChange={(evento) => onCambiar(evento.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `${idDelCampo}-error` : undefined} className="field" />
    </CampoDeFormulario>
  );
}

type FormularioDeServicioProps = {
  servicioEditado: ServicioDelCatalogo | null;
  onCancelar: () => void;
  onTerminar: (resultado: ResultadoDeOperacion) => void;
};

function FormularioDeServicio({ servicioEditado, onCancelar, onTerminar }: FormularioDeServicioProps) {
  const { servicios, registrarServicio, editarServicio } = useCatalogo();
  const [borrador, setBorrador] = useState<BorradorDeServicio>(() => (servicioEditado ? crearBorradorDesdeServicio(servicioEditado) : BORRADOR_DE_SERVICIO_VACIO));
  const [errores, setErrores] = useState<ErroresDelServicio>({});
  const [mensajeGeneral, setMensajeGeneral] = useState("");

  function cambiarCampo(campo: keyof BorradorDeServicio, valor: string) {
    setBorrador({ ...borrador, [campo]: valor });
  }

  function handleEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const idDelServicioEditado = servicioEditado ? servicioEditado.id : null;
    const erroresEncontrados = validarServicio(borrador, servicios, idDelServicioEditado);
    setErrores(erroresEncontrados);
    if (Object.keys(erroresEncontrados).length > 0) {
      setMensajeGeneral("Revisa los campos marcados.");
      return;
    }
    if (servicioEditado) {
      const borradorOriginal = crearBorradorDesdeServicio(servicioEditado);
      const hayCambios = (Object.keys(borrador) as (keyof BorradorDeServicio)[]).some((campo) => borrador[campo].trim() !== borradorOriginal[campo]);
      if (!hayCambios) {
        onTerminar({ exito: true, mensaje: "No había cambios por guardar." });
        return;
      }
      onTerminar(editarServicio(servicioEditado.id, borrador));
      return;
    }
    onTerminar(registrarServicio(borrador));
  }

  function propiedadesDeError(campo: keyof BorradorDeServicio) {
    return {
      "aria-invalid": Boolean(errores[campo]),
      "aria-describedby": errores[campo] ? `servicio-${campo}-error` : undefined,
    };
  }

  let titulo = "Nuevo servicio";
  let icono: "mas" | "editar" = "mas";
  let textoDelBoton = "Registrar servicio";
  if (servicioEditado) {
    titulo = "Editar servicio";
    icono = "editar";
    textoDelBoton = "Guardar cambios";
  }

  return (
    <div>
      <button onClick={onCancelar} className="btn btn-quiet">
        <Icono nombre="volver" className="h-4 w-4" />
        Volver al catálogo
      </button>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Icono nombre={icono} className="h-7 w-7 text-navy" />
        <h1 className="text-4xl font-extrabold text-navy">{titulo}</h1>
        {servicioEditado && <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">{servicioEditado.id}</span>}
      </div>
      {servicioEditado && <p className="mt-2 text-sm text-slate">Los cambios solo afectan al catálogo. Las solicitudes existentes conservan su servicio, precio y horario.</p>}

      <form onSubmit={handleEnviar} noValidate className="surface leaf mt-8 max-w-3xl space-y-5 p-7 sm:p-9">
        <CampoDeFormulario id="servicio-nombre" etiqueta="Nombre del servicio" error={errores.nombre}>
          <input id="servicio-nombre" type="text" maxLength={80} value={borrador.nombre} onChange={(evento) => cambiarCampo("nombre", evento.target.value)} {...propiedadesDeError("nombre")} className="field" />
        </CampoDeFormulario>
        <CampoDeFormulario id="servicio-descripcion" etiqueta="Descripción" error={errores.descripcion}>
          <textarea id="servicio-descripcion" rows={3} maxLength={300} value={borrador.descripcion} onChange={(evento) => cambiarCampo("descripcion", evento.target.value)} {...propiedadesDeError("descripcion")} className="field resize-y" />
        </CampoDeFormulario>
        <div className="grid gap-5 sm:grid-cols-3">
          <CampoNumerico id="precioBase" etiqueta="Precio base (MXN)" valor={borrador.precioBase} error={errores.precioBase} onCambiar={(valor) => cambiarCampo("precioBase", valor)} />
          <CampoNumerico id="costoPorMetroCuadrado" etiqueta="Costo por m² (MXN)" valor={borrador.costoPorMetroCuadrado} error={errores.costoPorMetroCuadrado} onCambiar={(valor) => cambiarCampo("costoPorMetroCuadrado", valor)} />
          <CampoNumerico id="costoPorHabitacion" etiqueta="Costo por habitación (MXN)" valor={borrador.costoPorHabitacion} error={errores.costoPorHabitacion} onCambiar={(valor) => cambiarCampo("costoPorHabitacion", valor)} />
        </div>
        <CampoDeFormulario id="servicio-categoria" etiqueta="Categoría" error={errores.categoria}>
          <div className="relative">
            <select id="servicio-categoria" value={borrador.categoria} onChange={(evento) => cambiarCampo("categoria", evento.target.value)} {...propiedadesDeError("categoria")} className="field cursor-pointer appearance-none pr-10">
              <option value="">Elige una categoría</option>
              {CATEGORIAS_DE_SERVICIO.map((categoria) => (
                <option key={categoria.valor} value={categoria.valor}>
                  {categoria.etiqueta}
                </option>
              ))}
            </select>
            <Icono nombre="flechaAbajo" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          </div>
        </CampoDeFormulario>

        {mensajeGeneral && Object.keys(errores).length > 0 && (
          <p role="alert" className="text-sm font-semibold text-err">
            {mensajeGeneral}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancelar} className="btn btn-quiet">
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            {textoDelBoton}
          </button>
        </div>
      </form>
    </div>
  );
}

type ListaDelCatalogoProps = {
  onAgregar: () => void;
  onEditar: (idDelServicio: string) => void;
};

function ListaDelCatalogo({ onAgregar, onEditar }: ListaDelCatalogoProps) {
  const { servicios } = useCatalogo();
  const [busqueda, setBusqueda] = useState("");
  const [filtroDeEstado, setFiltroDeEstado] = useState("Todos");

  const textoBuscado = normalizarTexto(busqueda);
  const serviciosVisibles = servicios.filter((servicio) => {
    const coincideConElEstado = filtroDeEstado === "Todos" || servicio.estado === filtroDeEstado;
    const textoDelServicio = normalizarTexto(`${servicio.id} ${servicio.nombre} ${servicio.descripcion} ${TITULO_POR_CATEGORIA[servicio.categoria]}`);
    return coincideConElEstado && textoDelServicio.includes(textoBuscado);
  });
  const serviciosDisponibles = servicios.filter((servicio) => servicio.estado === "Activo").length;
  const hayFiltrosActivos = busqueda.trim() !== "" || filtroDeEstado !== "Todos";

  function restablecerFiltros() {
    setBusqueda("");
    setFiltroDeEstado("Todos");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-extrabold text-navy">Gestión de servicios</h1>
        <InsigniaDeDatosDeDemostracion />
      </div>
      <p className="mt-2 text-sm text-slate">Tipos de servicio que ofrece la empresa y sus parámetros de cotización. Editar el catálogo no cambia las solicitudes existentes.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <TarjetaDeIndicador etiqueta="Servicios registrados" valor={servicios.length} />
        <TarjetaDeIndicador etiqueta="Servicios disponibles" valor={serviciosDisponibles} descripcion="Con estado activo." />
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Icono nombre="buscar" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input type="search" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Buscar por nombre, descripción o categoría" aria-label="Buscar servicios" className="field pl-11" />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
          {FILTROS_DE_ESTADO_DEL_SERVICIO.map((estado) => (
            <button key={estado} onClick={() => setFiltroDeEstado(estado)} aria-pressed={filtroDeEstado === estado} className={claseDelFiltroDeEstado(filtroDeEstado === estado)}>
              {estado}
            </button>
          ))}
        </div>
        <button onClick={onAgregar} className="btn btn-primary">
          <Icono nombre="mas" className="h-4 w-4" />
          Agregar servicio
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate" aria-live="polite">
          Mostrando <strong className="text-navy">{serviciosVisibles.length}</strong> de {servicios.length} servicios
        </p>
        {hayFiltrosActivos && (
          <button onClick={restablecerFiltros} className="btn btn-quiet">
            <Icono nombre="restablecer" className="h-4 w-4" />
            Restablecer filtros
          </button>
        )}
      </div>

      <h2 className="mt-8 font-display text-2xl font-extrabold text-navy">Catálogo de servicios</h2>

      {serviciosVisibles.length === 0 && <p className="mt-6 rounded-2xl bg-white p-10 text-center text-sm text-slate">No hay servicios que coincidan con la búsqueda o el filtro.</p>}

      {CATEGORIAS_DE_SERVICIO.map(({ valor: categoria }) => {
        const serviciosDeLaCategoria = serviciosVisibles.filter((servicio) => servicio.categoria === categoria);
        if (serviciosDeLaCategoria.length === 0) {
          return null;
        }
        return (
          <section key={categoria} aria-labelledby={`titulo-de-categoria-${categoria}`} className="mt-6">
            <h3 id={`titulo-de-categoria-${categoria}`} className="text-xs font-bold uppercase tracking-widest text-slate">
              {TITULO_POR_CATEGORIA[categoria]}
            </h3>
            <ul className="mt-3 space-y-3">
              {serviciosDeLaCategoria.map((servicio) => (
                <li key={servicio.id} className="surface leaf-sm flex flex-wrap items-center gap-4 px-4 py-4 sm:flex-nowrap sm:px-5">
                  <span className="pebble grid h-11 w-11 shrink-0 place-items-center bg-sky text-navy">
                    <Icono nombre="catalogo" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm font-bold text-navy">{servicio.nombre}</span>
                    <span className="block text-xs text-slate">{servicio.id}</span>
                  </span>
                  <InsigniaDeEstado estado={servicio.estado} />
                  <button onClick={() => onEditar(servicio.id)} aria-label={`Editar ${servicio.nombre}`} className="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-2 text-sm font-bold text-lagoon transition duration-300 hover:bg-sky/50">
                    Editar
                    <Icono nombre="chevronDerecho" className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function CatalogoPage() {
  const { servicios } = useCatalogo();
  const [vista, setVista] = useState<VistaDelCatalogo>({ tipo: "lista" });
  const [aviso, setAviso] = useState<ResultadoDeOperacion | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [vista]);

  function terminarFormulario(resultado: ResultadoDeOperacion) {
    setAviso(resultado);
    if (resultado.exito) {
      setVista({ tipo: "lista" });
    }
  }

  let contenido = <ListaDelCatalogo onAgregar={() => setVista({ tipo: "nuevo" })} onEditar={(idDelServicio) => setVista({ tipo: "editar", idDelServicio })} />;
  if (vista.tipo === "nuevo") {
    contenido = <FormularioDeServicio servicioEditado={null} onCancelar={() => setVista({ tipo: "lista" })} onTerminar={terminarFormulario} />;
  }
  if (vista.tipo === "editar") {
    const servicioEditado = servicios.find((servicio) => servicio.id === vista.idDelServicio);
    if (servicioEditado) {
      contenido = <FormularioDeServicio key={servicioEditado.id} servicioEditado={servicioEditado} onCancelar={() => setVista({ tipo: "lista" })} onTerminar={terminarFormulario} />;
    }
  }

  return (
    <>
      <div key={vista.tipo} className="fade">
        {contenido}
      </div>
      {aviso && <AvisoTemporal aviso={aviso} onTerminar={() => setAviso(null)} />}
    </>
  );
}
