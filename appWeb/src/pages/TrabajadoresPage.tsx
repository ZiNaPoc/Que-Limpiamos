import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useAhora } from "../hooks/useAhora";
import { useCatalogo } from "../data/CatalogoContext";
import { buscarCliente, useClientes } from "../data/ClientesContext";
import { useSolicitudes } from "../data/SolicitudesContext";
import { useTrabajadores, validarTrabajador, type ErroresDeTrabajador } from "../data/TrabajadoresContext";
import { DOCUMENTOS_REQUERIDOS, HORARIO_PREDETERMINADO } from "../data/trabajadores";
import type { DatosDeTrabajador, HorarioDeTrabajo, Navegar, ResultadoDeOperacion, ServicioDelCatalogo, Trabajador } from "../data/tipos";
import { describirTiposPermitidos, formatearTamanoDeArchivo, TAMANO_MAXIMO_DE_ARCHIVO_EN_BYTES, TIPOS_DE_DOCUMENTO_PERMITIDOS, validarArchivo } from "../utils/archivos";
import { calcularEstadoDelTrabajador, calcularReputacion, contarServiciosDeHoy, describirReputacion, obtenerServiciosActivos, type EstadoDelTrabajador } from "../utils/consultasDeTrabajadores";
import { obtenerClaveDeFecha } from "../utils/fechas";
import { describirHorario, formatearFechaNumerica } from "../utils/formato";
import { DIAS_DE_LA_SEMANA, describirHorarioDeTrabajo } from "../utils/horarios";
import { AvisoTemporal } from "../components/comunes/AvisoTemporal";
import { CampoDeFormulario } from "../components/comunes/CampoDeFormulario";
import { Icono, type NombreDeIcono } from "../components/comunes/Icono";
import { InsigniaDeDatosDeDemostracion, InsigniaDeEstado, Puntuacion } from "../components/comunes/Insignias";
import { TarjetaDeIndicador } from "../components/comunes/TarjetaDeIndicador";
import { VentanaModal } from "../components/comunes/VentanasModales";

type VistaDeTrabajadores = { tipo: "lista" } | { tipo: "nuevo" } | { tipo: "editar"; idDelTrabajador: string };

function nombresDeEspecialidades(trabajador: Trabajador, servicios: ServicioDelCatalogo[]): string[] {
  return trabajador.especialidades.map((idDelServicio) => servicios.find((servicio) => servicio.id === idDelServicio)?.nombre ?? idDelServicio);
}

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
};

function VentanaDeDetalleDelTrabajador({ trabajador, onCerrar, onEditar, onNavegar }: VentanaDeDetalleProps) {
  const { solicitudes } = useSolicitudes();
  const { servicios } = useCatalogo();
  const { clientes } = useClientes();
  const ahora = useAhora();
  const claveDeHoy = obtenerClaveDeFecha(ahora);
  const reputacion = calcularReputacion(solicitudes, trabajador.id);
  const estado = calcularEstadoDelTrabajador(solicitudes, trabajador, ahora);
  const serviciosActivos = obtenerServiciosActivos(solicitudes, trabajador.id);
  const calificaciones = solicitudes
    .filter((solicitud) => solicitud.idDelTrabajador === trabajador.id && solicitud.calificacion)
    .sort((a, b) => new Date(b.calificacion!.fecha).getTime() - new Date(a.calificacion!.fecha).getTime())
    .slice(0, 3);

  return (
    <VentanaModal idDelTitulo="titulo-del-trabajador" onCerrar={onCerrar} claseDeAncho="max-w-4xl">
      <button onClick={onCerrar} aria-label="Cerrar detalle del trabajador" className="absolute right-4 top-4 grid h-10 w-10 cursor-pointer place-items-center rounded-full text-slate transition duration-300 hover:bg-sky/50">
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
        <button onClick={onEditar} className="btn btn-quiet">
          <Icono nombre="editar" className="h-4 w-4" />
          Editar
        </button>
      </div>

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

const FILTROS_DE_ESTADO: ("Todos" | EstadoDelTrabajador)[] = ["Todos", "Disponible", "En servicio", "Fuera de horario"];

type ListaDeTrabajadoresProps = {
  onAnadir: () => void;
  onEditar: (idDelTrabajador: string) => void;
  onNavegar: Navegar;
};

function ListaDeTrabajadores({ onAnadir, onEditar, onNavegar }: ListaDeTrabajadoresProps) {
  const { trabajadores } = useTrabajadores();
  const { solicitudes } = useSolicitudes();
  const ahora = useAhora();
  const [busqueda, setBusqueda] = useState("");
  const [filtroDeEstado, setFiltroDeEstado] = useState<"Todos" | EstadoDelTrabajador>("Todos");
  const [idDelTrabajadorAbierto, setIdDelTrabajadorAbierto] = useState<string | null>(null);

  const filas = trabajadores.map((trabajador) => ({
    trabajador,
    estado: calcularEstadoDelTrabajador(solicitudes, trabajador, ahora),
    reputacion: calcularReputacion(solicitudes, trabajador.id),
    serviciosDeHoy: contarServiciosDeHoy(solicitudes, trabajador.id, ahora),
  }));
  const filasVisibles = filas.filter(({ trabajador, estado }) => {
    const coincideConElEstado = filtroDeEstado === "Todos" || estado === filtroDeEstado;
    const textoDelTrabajador = `${trabajador.id} ${trabajador.nombre} ${trabajador.telefono}`.toLowerCase();
    return coincideConElEstado && textoDelTrabajador.includes(busqueda.trim().toLowerCase());
  });
  const trabajadorAbierto = trabajadores.find((trabajador) => trabajador.id === idDelTrabajadorAbierto);
  const sinDocumentacionCompleta = trabajadores.filter((trabajador) => DOCUMENTOS_REQUERIDOS.some((documento) => !trabajador.documentosEntregados.includes(documento))).length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-extrabold text-navy">Gestión de trabajadores</h1>
        <InsigniaDeDatosDeDemostracion />
      </div>
      <p className="mt-2 max-w-3xl text-sm text-slate">Colaboradores que atienden los servicios. Su horario y sus especialidades son lo que el cliente ve al elegir colaborador en la app; la reputación sale de las calificaciones de los clientes.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <TarjetaDeIndicador etiqueta="Trabajadores" valor={trabajadores.length} />
        <TarjetaDeIndicador etiqueta="Disponibles ahora" valor={filas.filter((fila) => fila.estado === "Disponible").length} descripcion="En horario y sin servicio en curso." />
        <TarjetaDeIndicador etiqueta="Documentación incompleta" valor={sinDocumentacionCompleta} />
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Icono nombre="buscar" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input type="search" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Buscar por ID, nombre o teléfono" aria-label="Buscar trabajadores" className="field pl-11" />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
          {FILTROS_DE_ESTADO.map((estado) => (
            <button key={estado} onClick={() => setFiltroDeEstado(estado)} aria-pressed={filtroDeEstado === estado} className={`cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition duration-300 ${filtroDeEstado === estado ? "bg-navy text-white" : "bg-white text-storm hover:bg-sky/50"}`}>
              {estado}
            </button>
          ))}
        </div>
      </div>

      {filasVisibles.length === 0 && <p className="mt-6 rounded-2xl bg-white p-10 text-center text-sm text-slate">No hay trabajadores que coincidan.</p>}

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
        Añadir trabajador
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
        />
      )}
    </div>
  );
}

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

const DATOS_DE_TRABAJADOR_VACIOS: DatosDeTrabajador = { nombre: "", telefono: "", correo: "", direccion: "", especialidades: [], horario: HORARIO_PREDETERMINADO, documentosEntregados: [] };

type FormularioDeTrabajadorProps = {
  trabajadorEditado: Trabajador | null;
  onCancelar: () => void;
  onTerminar: (resultado: ResultadoDeOperacion) => void;
};

function FormularioDeTrabajador({ trabajadorEditado, onCancelar, onTerminar }: FormularioDeTrabajadorProps) {
  const { trabajadores, agregarTrabajador, editarTrabajador } = useTrabajadores();
  const { solicitudes } = useSolicitudes();
  const { servicios } = useCatalogo();
  const [datos, setDatos] = useState<DatosDeTrabajador>(() => (trabajadorEditado ? { ...trabajadorEditado } : DATOS_DE_TRABAJADOR_VACIOS));
  const [errores, setErrores] = useState<ErroresDeTrabajador>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [documentosSeleccionados, setDocumentosSeleccionados] = useState<Record<string, DocumentoSeleccionado>>({});
  const [erroresDeDocumentos, setErroresDeDocumentos] = useState<Record<string, string>>({});
  const [documentoEnRevision, setDocumentoEnRevision] = useState<string | null>(null);

  const documentosYaEntregados = trabajadorEditado ? trabajadorEditado.documentosEntregados : [];
  const serviciosParaEspecialidad = servicios.filter((servicio) => servicio.estado === "Activo" || datos.especialidades.includes(servicio.id));

  function cambiarCampo(campo: "nombre" | "telefono" | "correo" | "direccion", valor: string) {
    setDatos({ ...datos, [campo]: valor });
  }

  function alternarEspecialidad(idDelServicio: string) {
    const especialidades = datos.especialidades.includes(idDelServicio) ? datos.especialidades.filter((id) => id !== idDelServicio) : [...datos.especialidades, idDelServicio];
    setDatos({ ...datos, especialidades });
  }

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

  function quitarDocumento(documento: string) {
    setDocumentosSeleccionados((anteriores) => {
      const restantes = { ...anteriores };
      delete restantes[documento];
      return restantes;
    });
  }

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
        Volver a trabajadores
      </button>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Icono nombre={trabajadorEditado ? "editar" : "mas"} className="h-7 w-7 text-navy" />
        <h1 className="text-4xl font-extrabold text-navy">{trabajadorEditado ? "Editar trabajador" : "Nuevo trabajador"}</h1>
        {trabajadorEditado && <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white">{trabajadorEditado.id}</span>}
      </div>
      {trabajadorEditado && <p className="mt-2 text-sm text-slate">Los servicios ya acordados conservan su fecha, hora y precio. El horario no puede dejar fuera servicios pendientes o confirmados.</p>}

      <form onSubmit={handleEnviar} noValidate className="surface leaf mt-8 max-w-3xl space-y-5 p-7 sm:p-9">
        <CampoDeFormulario id="trabajador-nombre" etiqueta="Nombre del trabajador" error={errores.nombre}>
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
            {trabajadorEditado ? "Guardar cambios" : "Añadir trabajador"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function TrabajadoresPage({ onNavegar }: { onNavegar: Navegar }) {
  const { trabajadores } = useTrabajadores();
  const [vista, setVista] = useState<VistaDeTrabajadores>({ tipo: "lista" });
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

  let contenido = <ListaDeTrabajadores onAnadir={() => setVista({ tipo: "nuevo" })} onEditar={(idDelTrabajador) => setVista({ tipo: "editar", idDelTrabajador })} onNavegar={onNavegar} />;
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
      {aviso && <AvisoTemporal aviso={aviso} onTerminar={() => setAviso(null)} />}
    </>
  );
}
