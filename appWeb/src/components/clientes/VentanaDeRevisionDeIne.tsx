import { useEffect, useState, type ReactNode } from "react";
import { useClientes } from "../../data/ClientesContext";
import type { ArchivoDeDocumento, ResultadoDeOperacion } from "../../data/tipos";
import { evaluarAprobacionDeIne, evaluarRevisionDeIne, LONGITUD_MAXIMA_DEL_MOTIVO_DE_RECHAZO, validarMotivoDeRechazo } from "../../utils/documentosDeClientes";
import { formatearFechaNumerica, formatearHora } from "../../utils/formato";
import { CampoDeFormulario } from "../comunes/CampoDeFormulario";
import { Icono } from "../comunes/Icono";
import { InsigniaDeEstado } from "../comunes/Insignias";
import { VentanaModal } from "../comunes/VentanasModales";

// Si el archivo de la INE se puede abrir: comprobando, disponible o no disponible.
type Disponibilidad = "comprobando" | "disponible" | "no-disponible";

// Comprueba que el archivo exista y sea del tipo correcto (consulta rápida solo de encabezados). Así se evita mostrar un visor roto.
function useDisponibilidadDelArchivo(archivo: ArchivoDeDocumento | null): [Disponibilidad, () => void] {
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad>(archivo ? "comprobando" : "no-disponible");

  useEffect(() => {
    if (!archivo) {
      return;
    }
    let sigueMontado = true;
    fetch(archivo.url, { method: "HEAD" })
      .then((respuesta) => {
        const tipo = respuesta.headers.get("content-type") ?? "";
        const formatoCorrecto = archivo.formato === "pdf" ? tipo.includes("application/pdf") : tipo.startsWith("image/");
        if (sigueMontado) {
          setDisponibilidad(respuesta.ok && formatoCorrecto ? "disponible" : "no-disponible");
        }
      })
      .catch(() => {
        if (sigueMontado) {
          setDisponibilidad("no-disponible");
        }
      });
    return () => {
      sigueMontado = false;
    };
  }, [archivo]);

  return [disponibilidad, () => setDisponibilidad("no-disponible")];
}

function MensajeDelVisor({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div role="status" className="grid min-h-[16rem] place-items-center rounded-2xl border border-dashed border-frost bg-beige p-8 text-center">
      <div>
        <Icono nombre="alerta" className="mx-auto h-7 w-7 text-ochre" />
        <p className="mt-3 font-bold text-navy">{titulo}</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate">{children}</p>
      </div>
    </div>
  );
}

// Muestra la imagen o el PDF de la INE. Si no hay archivo o no se puede abrir, muestra un mensaje que lo explica.
function VisorDeDocumento({ archivo, descripcion, estaAmpliado }: { archivo: ArchivoDeDocumento | null; descripcion: string; estaAmpliado: boolean }) {
  const [disponibilidad, marcarNoDisponible] = useDisponibilidadDelArchivo(archivo);

  if (!archivo) {
    return <MensajeDelVisor titulo="Sin archivo">El cliente no ha enviado este documento.</MensajeDelVisor>;
  }
  if (disponibilidad === "comprobando") {
    return (
      <div role="status" className="grid min-h-[16rem] place-items-center rounded-2xl bg-beige text-sm text-slate">
        Cargando documento…
      </div>
    );
  }
  if (disponibilidad === "no-disponible") {
    return <MensajeDelVisor titulo="No se puede mostrar el archivo">El archivo no está disponible o su formato no se puede visualizar. Pide al cliente que lo envíe de nuevo.</MensajeDelVisor>;
  }
  if (archivo.formato === "pdf") {
    return <iframe src={archivo.url} title={descripcion} className={`w-full rounded-2xl border border-mist bg-moon ${estaAmpliado ? "h-[80vh]" : "h-[60vh]"}`} />;
  }
  return (
    <div className={`overflow-auto rounded-2xl bg-moon ${estaAmpliado ? "max-h-[80vh]" : ""}`}>
      <img src={archivo.url} alt={descripcion} onError={marcarNoDisponible} className={estaAmpliado ? "max-w-none" : "max-h-[60vh] w-full object-contain"} />
    </div>
  );
}

function DatoDelDocumento({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-beige px-4 py-3">
      <dt className="text-xs font-bold uppercase tracking-wider text-slate">{etiqueta}</dt>
      <dd className="mt-1 break-words text-sm font-bold text-navy">{children}</dd>
    </div>
  );
}

// Escribe fecha y hora, o "No disponible" si no hay.
function describirFecha(fechaIso: string | null): string {
  if (!fechaIso) {
    return "No disponible";
  }
  return `${formatearFechaNumerica(fechaIso)} · ${formatearHora(fechaIso)}`;
}

// Pasos de la ventana: elegir acción = confirmar aprobación; o escribir motivo = confirmar rechazo.
type PasoDeLaRevision = "acciones" | "confirmar-aprobacion" | "motivo" | "confirmar-rechazo";

type VentanaDeRevisionDeIneProps = {
  idDelCliente: string;
  onCerrar: () => void;
  onResultado: (resultado: ResultadoDeOperacion) => void;
};

// REVISIÓN DE INE: ventana donde el administrador ve el frente y el reverso y decide.
// Datos: el cliente con sus 2 documentos (cada uno con url y formato: imagen o PDF) y su estado de verificación.
// Solo se decide si está Pendiente; para aprobar deben estar los dos lados. El resultado sale en el aviso temporal de ClientesPage.
//Con backend: actualizar el estado de verificación del cliente.
export function VentanaDeRevisionDeIne({ idDelCliente, onCerrar, onResultado }: VentanaDeRevisionDeIneProps) {
  const { clientes, aprobarIne, rechazarIne } = useClientes();
  const [indiceDelLado, setIndiceDelLado] = useState(0);
  const [estaAmpliado, setEstaAmpliado] = useState(false);
  const [paso, setPaso] = useState<PasoDeLaRevision>("acciones");
  const [motivo, setMotivo] = useState("");
  const [errorDelMotivo, setErrorDelMotivo] = useState("");

  const cliente = clientes.find((clienteBuscado) => clienteBuscado.id === idDelCliente);
  if (!cliente) {
    return null;
  }

  const documento = cliente.documentos[indiceDelLado] ?? cliente.documentos[0];
  const descripcion = documento ? `${documento.tipo} de ${cliente.nombre}` : "";
  // Reglas: solo se revisa si está pendiente y con ambos lados para aprobar.
  const sePuedeRevisar = evaluarRevisionDeIne(cliente).exito;
  const permisoDeAprobacion = evaluarAprobacionDeIne(cliente);
  const { verificacion } = cliente;

  // Valida el motivo antes de pedir confirmación.
  function continuarAlRechazo() {
    const error = validarMotivoDeRechazo(motivo);
    if (error) {
      setErrorDelMotivo(error);
      return;
    }
    setErrorDelMotivo("");
    setPaso("confirmar-rechazo");
  }

  // Aprueba la INE y avisa el resultado
  function confirmarAprobacion() {
    const resultado = aprobarIne(idDelCliente);
    setPaso("acciones");
    onResultado(resultado);
  }

  // Rechaza la INE con su motivo; si falla, regresa al paso del motivo.
  function confirmarRechazo() {
    const resultado = rechazarIne(idDelCliente, motivo);
    setPaso(resultado.exito ? "acciones" : "motivo");
    onResultado(resultado);
  }

  return (
    <VentanaModal idDelTitulo="titulo-de-revision" onCerrar={onCerrar} claseDeAncho="max-w-6xl">
      <button onClick={onCerrar} aria-label="Cerrar revisión de la INE" className="absolute right-4 top-4 grid h-10 w-10 cursor-pointer place-items-center rounded-full text-slate transition duration-300 hover:bg-sky/50">
        <Icono nombre="cerrar" />
      </button>

      <header className="flex flex-wrap items-center gap-3 pr-12">
        <Icono nombre="identificacion" className="h-6 w-6 text-lagoon" />
        <h2 id="titulo-de-revision" className="text-2xl font-extrabold text-navy">
          INE de {cliente.nombre}
        </h2>
        <InsigniaDeEstado estado={verificacion.estado} />
        {cliente.documentos.some((documentoDelCliente) => documentoDelCliente.archivo?.esDeDemostracion) && <span className="rounded-full bg-moon px-3 py-1 text-xs font-bold text-clay">Archivos de demostración</span>}
      </header>
      <p className="mt-1 text-sm text-slate">
        {cliente.id} · {cliente.correo}
      </p>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Lado de la INE">
        {cliente.documentos.map((documentoDelCliente, indice) => (
          <button
            key={documentoDelCliente.id}
            role="tab"
            aria-selected={indice === indiceDelLado}
            onClick={() => setIndiceDelLado(indice)}
            className={`cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition duration-300 ${indice === indiceDelLado ? "bg-navy text-white" : "bg-beige text-storm hover:bg-sky/50"}`}
          >
            {documentoDelCliente.tipo.replace("INE · ", "")}
            {documentoDelCliente.archivo ? ` · ${documentoDelCliente.archivo.formato === "pdf" ? "PDF" : "Imagen"}` : " · Sin archivo"}
          </button>
        ))}
      </div>

      <div className={`mt-4 grid gap-6 ${estaAmpliado ? "" : "lg:grid-cols-[minmax(0,1fr)_20rem]"}`}>
        <section aria-label={documento ? documento.tipo : "Documento"}>
          {documento && <VisorDeDocumento key={documento.id} archivo={documento.archivo} descripcion={descripcion} estaAmpliado={estaAmpliado} />}
          {documento?.archivo && (
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button onClick={() => setEstaAmpliado(!estaAmpliado)} aria-pressed={estaAmpliado} className="btn btn-quiet">
                <Icono nombre={estaAmpliado ? "cerrar" : "ojo"} className="h-4 w-4" />
                {estaAmpliado ? "Reducir" : "Ampliar"}
              </button>
              <a href={documento.archivo.url} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
                <Icono nombre="flecha" className="h-4 w-4" />
                Abrir en otra pestaña
              </a>
            </div>
          )}
        </section>

        <section aria-label="Datos y decisión">
          <dl className={`grid gap-2 ${estaAmpliado ? "sm:grid-cols-2 lg:grid-cols-4" : ""}`}>
            <DatoDelDocumento etiqueta="Cliente">
              {cliente.nombre}
              <span className="block text-xs font-semibold text-slate">{cliente.id}</span>
            </DatoDelDocumento>
            <DatoDelDocumento etiqueta="Documento">Identificación oficial (INE) · frente y reverso</DatoDelDocumento>
            <DatoDelDocumento etiqueta="Fecha de envío">{describirFecha(documento?.fechaDeEnvio ?? null)}</DatoDelDocumento>
            <DatoDelDocumento etiqueta="Estado de verificación">
              <InsigniaDeEstado estado={verificacion.estado} />
              {verificacion.fechaDeRevision && <span className="mt-1 block text-xs font-semibold text-slate">Revisada el {describirFecha(verificacion.fechaDeRevision)}</span>}
            </DatoDelDocumento>
          </dl>

          {verificacion.estado === "Rechazada" && (
            <div className="mt-3 rounded-2xl bg-mist/70 p-4 text-sm text-storm">
              <p className="font-bold text-navy">Motivo del rechazo</p>
              <p className="mt-1">{verificacion.motivoDeRechazo || "No se registró un motivo."}</p>
            </div>
          )}
          {verificacion.estado === "Verificada" && <p className="mt-3 rounded-2xl bg-moss/30 p-4 text-sm text-storm">INE aprobada. El cliente ve «Verificada» en su perfil de la app.</p>}

          {sePuedeRevisar && paso === "acciones" && (
            <div className="mt-5">
              <p className="mb-3 text-xs text-slate">Revisa los dos lados antes de decidir.</p>
              {!permisoDeAprobacion.exito && <p className="mb-3 rounded-2xl bg-moon p-3 text-xs text-clay">{permisoDeAprobacion.mensaje}</p>}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end lg:flex-col-reverse xl:flex-row">
                <button onClick={() => setPaso("motivo")} className="btn btn-quiet">
                  <Icono nombre="prohibido" className="h-4 w-4" />
                  Rechazar
                </button>
                <button onClick={() => setPaso("confirmar-aprobacion")} disabled={!permisoDeAprobacion.exito} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50">
                  <Icono nombre="palomita" className="h-4 w-4" />
                  Aprobar INE
                </button>
              </div>
            </div>
          )}

          {sePuedeRevisar && paso === "confirmar-aprobacion" && (
            <div role="alertdialog" aria-labelledby="titulo-de-confirmar-aprobacion" className="fade mt-5 rounded-2xl border border-frost p-4">
              <p id="titulo-de-confirmar-aprobacion" className="font-bold text-navy">
                ¿Aprobar la INE?
              </p>
              <p className="mt-1 text-sm text-slate">Confirma que ambos lados son legibles y que el nombre coincide con el registro de {cliente.nombre}.</p>
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setPaso("acciones")} className="btn btn-quiet">
                  Volver
                </button>
                <button onClick={confirmarAprobacion} className="btn btn-primary">
                  Sí, aprobar
                </button>
              </div>
            </div>
          )}

          {sePuedeRevisar && paso === "motivo" && (
            <div className="fade mt-5">
              <CampoDeFormulario id="motivo-de-rechazo" etiqueta="Motivo del rechazo (lo verá el cliente)" error={errorDelMotivo}>
                <textarea
                  id="motivo-de-rechazo"
                  rows={4}
                  maxLength={LONGITUD_MAXIMA_DEL_MOTIVO_DE_RECHAZO}
                  value={motivo}
                  onChange={(evento) => setMotivo(evento.target.value)}
                  aria-invalid={Boolean(errorDelMotivo)}
                  aria-describedby={errorDelMotivo ? "motivo-de-rechazo-error" : undefined}
                  placeholder="Por ejemplo: la fotografía del reverso está cortada y no se lee la clave."
                  className="field resize-y"
                />
              </CampoDeFormulario>
              <p className="mt-1.5 text-right text-xs text-slate">
                {motivo.trim().length}/{LONGITUD_MAXIMA_DEL_MOTIVO_DE_RECHAZO}
              </p>
              <div className="mt-3 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setPaso("acciones");
                    setErrorDelMotivo("");
                  }}
                  className="btn btn-quiet"
                >
                  Volver
                </button>
                <button onClick={continuarAlRechazo} className="btn btn-primary">
                  Continuar
                </button>
              </div>
            </div>
          )}

          {sePuedeRevisar && paso === "confirmar-rechazo" && (
            <div role="alertdialog" aria-labelledby="titulo-de-confirmar-rechazo" className="fade mt-5 rounded-2xl border border-frost p-4">
              <p id="titulo-de-confirmar-rechazo" className="font-bold text-navy">
                ¿Rechazar la INE?
              </p>
              <p className="mt-2 rounded-xl bg-beige p-3 text-sm text-storm">{motivo.trim()}</p>
              <p className="mt-2 text-xs text-slate">{cliente.nombre} tendrá que enviarla de nuevo desde la app.</p>
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setPaso("motivo")} className="btn btn-quiet">
                  Editar motivo
                </button>
                <button onClick={confirmarRechazo} className="btn btn-primary">
                  Sí, rechazar
                </button>
              </div>
            </div>
          )}

          <p className="mt-5 text-xs text-slate">La decisión se guarda solo en este navegador mientras el backend no ofrezca la validación de INE.</p>
        </section>
      </div>
    </VentanaModal>
  );
}
