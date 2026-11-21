import { useEffect, useState, type FormEvent } from "react";
import {
  BORRADOR_DE_SERVICIO_VACIO,
  crearBorradorDesdeServicio,
  useCatalogo,
  validarServicio,
  type BorradorDeServicio,
  type ErroresDelServicio,
} from "../data/CatalogoContext";
import type { EstadoDeServicio, ResultadoDeOperacion, ServicioDelCatalogo } from "../data/tipos";
import { useSolicitudes } from "../hooks/useSolicitudes";
import { useTrabajadores } from "../data/TrabajadoresContext";
import { formatearPrecio, normalizarTexto } from "../utils/formato";
import { AvisoTemporal } from "../components/comunes/AvisoTemporal";
import { CampoDeFormulario } from "../components/comunes/CampoDeFormulario";
import { Icono } from "../components/comunes/Icono";
import { InsigniaDeDatosDeDemostracion, InsigniaDeEstado } from "../components/comunes/Insignias";
import { TarjetaDeIndicador } from "../components/comunes/TarjetaDeIndicador";
import { VentanaDeConfirmacion } from "../components/comunes/VentanasModales";

// Indica si se muestra la lista de servicios, el formulario para crear uno o el de edición.
type VistaDelCatalogo = { tipo: "lista" } | { tipo: "nuevo" } | { tipo: "editar"; idDelServicio: string };

// Estados disponibles para filtrar los servicios.
const FILTROS_DE_ESTADO_DEL_SERVICIO = ["Todos", "Activo", "Inactivo"];

// Separa los servicios disponibles en la app de los que están desactivados.
const GRUPOS_DEL_CATALOGO: { estado: EstadoDeServicio; titulo: string; descripcion: string }[] = [
  { estado: "Activo", titulo: "Disponibles en la app", descripcion: "Los clientes pueden verlos y solicitarlos." },
  { estado: "Inactivo", titulo: "Desactivados", descripcion: "No se muestran en la app." },
];

// Cambia el estilo del filtro seleccionado para distinguirlo de los demás.
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

// Campo numérico que muestra el precio y, si hace falta, su mensaje de error.
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

// Este formulario sirve tanto para registrar un servicio como para editar uno existente.
// Antes de guardar, revisa que los datos sean válidos y avisa si falta corregir algo.
// Si no se modificó ningún dato, informa que no hay cambios pendientes.
function FormularioDeServicio({ servicioEditado, onCancelar, onTerminar }: FormularioDeServicioProps) {
  const { servicios, registrarServicio, editarServicio } = useCatalogo();
  // Guarda los datos del formulario. Al editar, carga primero la información del servicio seleccionado.
  const [borrador, setBorrador] = useState<BorradorDeServicio>(() => (servicioEditado ? crearBorradorDesdeServicio(servicioEditado) : BORRADOR_DE_SERVICIO_VACIO));
  const [errores, setErrores] = useState<ErroresDelServicio>({});
  const [mensajeGeneral, setMensajeGeneral] = useState("");

  // Actualiza el borrador cada vez que cambia un campo del formulario.
  function cambiarCampo(campo: keyof BorradorDeServicio, valor: string) {
    setBorrador({ ...borrador, [campo]: valor });
  }

  // Comprueba los datos antes de guardar el servicio.
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

  // Agrega los atributos necesarios para que el error también sea identificado por lectores de pantalla.
  function propiedadesDeError(campo: keyof BorradorDeServicio) {
    return {
      "aria-invalid": Boolean(errores[campo]),
      "aria-describedby": errores[campo] ? `servicio-${campo}-error` : undefined,
    };
  }

  // Ajusta el título, el icono y el botón según se esté creando o editando un servicio.
  // Textos que cambian si se crea o se edita.
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
        <div className="sm:max-w-xs">
          <CampoNumerico id="precioBase" etiqueta="Precio «desde» (MXN)" valor={borrador.precioBase} error={errores.precioBase} onCambiar={(valor) => cambiarCampo("precioBase", valor)} />
          <p className="mt-1.5 text-xs text-slate">Se muestra en la app como «Desde $…», como referencia.</p>
        </div>
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
  onResultado: (resultado: ResultadoDeOperacion) => void;
};

// Muestra los servicios del catálogo y permite buscarlos, filtrarlos, agregarlos o modificarlos.
// También indica cuántas solicitudes tiene cada servicio y cuántos colaboradores lo ofrecen.
function ListaDelCatalogo({ onAgregar, onEditar, onResultado }: ListaDelCatalogoProps) {
  const { servicios, cambiarEstadoDelServicio } = useCatalogo();
  const { solicitudes } = useSolicitudes();
  const { trabajadores } = useTrabajadores();
  // Servicio al que se le va a cambiar el estado- mientras tiene valor se muestra la ventana de confirmación.
  const [servicioPorCambiar, setServicioPorCambiar] = useState<ServicioDelCatalogo | null>(null);

  // Cuenta las solicitudes relacionadas con el servicio.
  function contarSolicitudes(idDelServicio: string) {
    return solicitudes.filter((solicitud) => solicitud.idDelServicio === idDelServicio).length;
  }

  // Cuenta los colaboradores que ofrecen este servicio.
  function contarEspecialistas(idDelServicio: string) {
    return trabajadores.filter((trabajador) => trabajador.especialidades.includes(idDelServicio)).length;
  }

  // Prepara los detalles que se mostrarán antes de activar o desactivar el servicio.
  // Si ningún colaborador lo ofrece, también muestra una advertencia.
  function describirCambioDeEstado(servicio: ServicioDelCatalogo): string[] {
    const lineas = [`Estado: ${servicio.estado} → ${servicio.estado === "Activo" ? "Inactivo" : "Activo"}`];
    if (servicio.estado === "Activo") {
      lineas.push("Dejará de aparecer en «Servicios» y en «Paquetes más populares» de la app.");
      lineas.push("Las solicitudes que ya lo usan conservan su servicio, horario y precio.");
    } else {
      lineas.push("Volverá a aparecer en la app para que los clientes lo soliciten.");
      if (contarEspecialistas(servicio.id) === 0) {
        lineas.push("Ningún colaborador lo tiene como especialidad; la asignación automática no encontrará a quién asignarlo.");
      }
    }
    return lineas;
  }
  // Guarda el texto de búsqueda y el estado seleccionado en los filtros.
  const [busqueda, setBusqueda] = useState("");
  const [filtroDeEstado, setFiltroDeEstado] = useState("Todos");

  const textoBuscado = normalizarTexto(busqueda);
  // Filtra los servicios por estado y por coincidencias en su ID, nombre o descripción.
  const serviciosVisibles = servicios.filter((servicio) => {
    const coincideConElEstado = filtroDeEstado === "Todos" || servicio.estado === filtroDeEstado;
    const textoDelServicio = normalizarTexto(`${servicio.id} ${servicio.nombre} ${servicio.descripcion}`);
    return coincideConElEstado && textoDelServicio.includes(textoBuscado);
  });
  // Cuenta los servicios que siguen disponibles en la app.
  const serviciosDisponibles = servicios.filter((servicio) => servicio.estado === "Activo").length;
  const hayFiltrosActivos = busqueda.trim() !== "" || filtroDeEstado !== "Todos";

  // Deja la búsqueda vacía y vuelve a mostrar todos los estados.
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
      <p className="mt-2 max-w-3xl text-sm text-slate">Tipos de limpieza que el cliente ve en «Servicios» de la app, con su precio «Desde $…». Solo los servicios activos se muestran en la app. Editar el catálogo no cambia las solicitudes existentes.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <TarjetaDeIndicador etiqueta="Servicios registrados" valor={servicios.length} />
        <TarjetaDeIndicador etiqueta="Servicios disponibles" valor={serviciosDisponibles} descripcion="Con estado activo." />
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Icono nombre="buscar" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input type="search" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Buscar por nombre o descripción" aria-label="Buscar servicios" className="field pl-11" />
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

      {GRUPOS_DEL_CATALOGO.map(({ estado, titulo, descripcion }) => {
        const serviciosDelGrupo = serviciosVisibles.filter((servicio) => servicio.estado === estado);
        if (serviciosDelGrupo.length === 0) {
          return null;
        }
        return (
          <section key={estado} aria-labelledby={`titulo-de-grupo-${estado}`} className="mt-6">
            <h3 id={`titulo-de-grupo-${estado}`} className="text-xs font-bold uppercase tracking-widest text-slate">
              {titulo} · {serviciosDelGrupo.length}
            </h3>
            <p className="mt-1 text-xs text-slate">{descripcion}</p>
            <ul className="mt-3 space-y-3">
              {serviciosDelGrupo.map((servicio) => (
                <li key={servicio.id} className={`surface leaf-sm flex flex-wrap items-center gap-4 px-4 py-4 sm:flex-nowrap sm:px-5 ${servicio.estado === "Inactivo" ? "opacity-70" : ""}`}>
                  <span className={`pebble grid h-11 w-11 shrink-0 place-items-center ${servicio.estado === "Activo" ? "bg-moss/60 text-navy" : "bg-mist text-slate"}`}>
                    <Icono nombre="catalogo" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm font-bold text-navy">{servicio.nombre}</span>
                    <span className="block text-xs text-slate">
                      {servicio.id} · Desde {formatearPrecio(servicio.precioBase)} · {contarSolicitudes(servicio.id)} {contarSolicitudes(servicio.id) === 1 ? "solicitud" : "solicitudes"} · {contarEspecialistas(servicio.id)} {contarEspecialistas(servicio.id) === 1 ? "colaborador" : "colaboradores"}
                    </span>
                  </span>
                  <InsigniaDeEstado estado={servicio.estado} />
                  <button onClick={() => setServicioPorCambiar(servicio)} className="cursor-pointer rounded-full px-3 py-2 text-sm font-bold text-storm transition duration-300 hover:bg-sky/50">
                    {servicio.estado === "Activo" ? "Desactivar" : "Activar"}
                  </button>
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
      {servicioPorCambiar && (
        <VentanaDeConfirmacion
          titulo={servicioPorCambiar.estado === "Activo" ? `¿Desactivar «${servicioPorCambiar.nombre}»?` : `¿Activar «${servicioPorCambiar.nombre}»?`}
          lineasDeCambios={describirCambioDeEstado(servicioPorCambiar)}
          etiquetaDeConfirmar={servicioPorCambiar.estado === "Activo" ? "Sí, desactivar" : "Sí, activar"}
          onConfirmar={() => {
            // Confirmado: cambia el estado, muestra el resultado en el aviso temporal y cierra la ventana
            onResultado(cambiarEstadoDelServicio(servicioPorCambiar.id));
            setServicioPorCambiar(null);
          }}
          onCancelar={() => setServicioPorCambiar(null)}
        />
      )}
    </div>
  );
}

// Página principal del catálogo, desde donde se pueden consultar, crear y editar servicios.
// Los servicios activos también son los que aparecen disponibles en la app móvil.
export function CatalogoPage() {
  const { servicios } = useCatalogo();
  // Controla si se muestra la lista o alguno de los formularios.
  const [vista, setVista] = useState<VistaDelCatalogo>({ tipo: "lista" });
  // Guarda el resultado de la última operación para mostrarlo en un aviso temporal.
  const [aviso, setAviso] = useState<ResultadoDeOperacion | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [vista]);

  // Muestra el resultado y regresa a la lista cuando el guardado se completa correctamente.
  function terminarFormulario(resultado: ResultadoDeOperacion) {
    setAviso(resultado);
    if (resultado.exito) {
      setVista({ tipo: "lista" });
    }
  }

  // Según la vista seleccionada, muestra la lista, el formulario nuevo o el de edición.
  let contenido = <ListaDelCatalogo onAgregar={() => setVista({ tipo: "nuevo" })} onEditar={(idDelServicio) => setVista({ tipo: "editar", idDelServicio })} onResultado={setAviso} />;
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
      {/* Muestra el resultado de la última acción realizada en el catálogo. */}
      {aviso && <AvisoTemporal aviso={aviso} onTerminar={() => setAviso(null)} />}
    </>
  );
}
