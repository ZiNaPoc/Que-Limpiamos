// Tipos compartidos del panel administrativo.
// Reflejan la información que el cliente genera desde la app móvil (mockups de ¿Qué limpiamos?)
// y la que el administrador necesita para supervisarla. Mientras no exista backend,
// los datos viven en los contextos de React (memoria de la pestaña).

export type ResultadoDeOperacion = {
  exito: boolean;
  mensaje: string;
};

// ───────────── Clientes (registro desde la app móvil) ─────────────

// Estado de la INE del cliente en conjunto. Se calcula a partir de sus documentos.
export type EstadoDeVerificacion = "Por verificar" | "Verificada" | "Rechazada";

// En el registro de la app el cliente sube el frente y el reverso de su INE.
export type TipoDeDocumentoDeCliente = "INE · Frente" | "INE · Reverso";

export type EstadoDeDocumento = "Pendiente" | "Aprobado" | "Rechazado";

export type FormatoDeArchivo = "pdf" | "imagen";

export type ArchivoDeDocumento = {
  url: string;
  formato: FormatoDeArchivo;
  // true mientras los archivos salgan de public/documentos-demo y no del almacenamiento real.
  esDeDemostracion: boolean;
};

export type DocumentoDeCliente = {
  id: string;
  idDelCliente: string;
  tipo: TipoDeDocumentoDeCliente;
  archivo: ArchivoDeDocumento | null;
  fechaDeEnvio: string | null;
  estado: EstadoDeDocumento;
  fechaDeRevision: string | null;
  motivoDeRechazo: string;
};

// Decisión del administrador sobre un documento. Es lo que hoy se guarda en localStorage
// y lo que después deberá enviarse al backend.
export type RevisionDeDocumento = {
  estado: Exclude<EstadoDeDocumento, "Pendiente">;
  fechaDeRevision: string;
  motivoDeRechazo: string;
};

export type Cliente = {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  fechaDeRegistro: string;
  documentos: DocumentoDeCliente[];
  verificacion: {
    estado: EstadoDeVerificacion;
  };
};

// ───────────── Solicitudes ─────────────

export type EstadoDeSolicitud = "Pendiente" | "Confirmado" | "Realizado" | "Cancelado";

// En la app el cliente decide: «Elegir personalmente» o «Que se elija en automático».
export type ModoDeEleccionDelColaborador = "Cliente" | "Automática";

export type AcuerdoDePrecio = {
  precio: number;
  fechaDeRegistro: string;
};

export type EvidenciaFotografica = {
  id: string;
  nombreDelArchivo: string;
  tipoDeArchivo: string;
  tamanoEnBytes: number;
  url: string;
  fechaDeIncorporacion: string;
};

// «Califica tu servicio»: de 1 a 5 escobas y un comentario opcional.
export type Calificacion = {
  puntuacion: number;
  comentario: string;
  fecha: string;
};

export type Cancelacion = {
  canceladaPor: "Cliente" | "Administración";
  motivo: string;
  fecha: string;
};

export type Solicitud = {
  id: string;
  idDelCliente: string;
  idDelServicio: string;
  // Nombre del servicio al momento de solicitarlo: si el catálogo cambia, la solicitud conserva sus condiciones.
  servicio: string;
  descripcion: string;
  direccion: string;
  latitud: number;
  longitud: number;
  fechaDeCreacion: string;
  fechaProgramada: string;
  precioEstimado: number;
  acuerdoDePrecio: AcuerdoDePrecio | null;
  modoDeEleccion: ModoDeEleccionDelColaborador;
  idDelTrabajador: string | null;
  estado: EstadoDeSolicitud;
  evidencias: EvidenciaFotografica[];
  calificacion: Calificacion | null;
  cancelacion: Cancelacion | null;
};

// ───────────── Trabajadores (colaboradores) ─────────────

// Días con la convención de Date.getDay(): 0 = domingo … 6 = sábado.
export type HorarioDeTrabajo = {
  dias: number[];
  horaDeInicio: string;
  horaDeFin: string;
};

export type Trabajador = {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string;
  // Ids de servicios del catálogo. La app los muestra como «Especialidades».
  especialidades: string[];
  horario: HorarioDeTrabajo;
  documentosEntregados: string[];
};

export type DatosDeTrabajador = Omit<Trabajador, "id">;

// ───────────── Catálogo ─────────────

export type CategoriaDeServicio = "Principal" | "Extra";
export type EstadoDeServicio = "Activo" | "Inactivo";

export type ServicioDelCatalogo = {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  costoPorMetroCuadrado: number;
  costoPorHabitacion: number;
  categoria: CategoriaDeServicio;
  estado: EstadoDeServicio;
};

export type DatosDeServicio = Omit<ServicioDelCatalogo, "id" | "estado">;

// ───────────── Reportes («Reportar» en el historial de la app) ─────────────

export type EstadoDeReporte = "Pendiente" | "En revisión" | "Resuelto";

export type Reporte = {
  folio: string;
  idDeSolicitud: string;
  descripcion: string;
  fechaDeCreacion: string;
  estado: EstadoDeReporte;
  solucion: string;
};

// ───────────── Filtros y navegación del panel ─────────────

export type FiltroDeEstado = "todos" | EstadoDeSolicitud;
export type FiltroDeFechaDelTrabajo = "todas" | "hoy" | "manana" | "despues" | "anteriores";
export type FiltroDeFechaDeSolicitud = "todas" | "hoy" | "7dias";
export type FiltroDeAsignacion = "todas" | "sinAsignar" | "asignadas";

export type FiltrosDeSolicitudes = {
  busqueda: string;
  estado: FiltroDeEstado;
  fechaDelTrabajo: FiltroDeFechaDelTrabajo;
  fechaDeSolicitud: FiltroDeFechaDeSolicitud;
  asignacion: FiltroDeAsignacion;
};

export type FiltroDeVerificacion = "Todos" | EstadoDeVerificacion;
export type FiltroDeEstadoDeReporte = "Todos" | EstadoDeReporte;

// Permite abrir un módulo ya filtrado o con un registro abierto (por ejemplo, desde el inicio).
export type AperturaDelPanel = {
  filtrosDeSolicitudes?: FiltrosDeSolicitudes;
  idDeSolicitud?: string | null;
  idDelCliente?: string | null;
  filtroDeVerificacion?: FiltroDeVerificacion;
  seccionDeDocumentos?: EstadoDeDocumento;
  filtroDeReportes?: FiltroDeEstadoDeReporte;
  folioDeReporte?: string | null;
};

export type VistaDelPanel = "inicio" | "perfil" | "solicitudes" | "trabajadores" | "catalogo" | "clientes" | "reportes" | "resenas";

export type Navegar = (vista: VistaDelPanel, apertura?: AperturaDelPanel) => void;

export type Sesion = {
  nombre: string;
  nombreDeUsuario: string;
  correo: string;
};
