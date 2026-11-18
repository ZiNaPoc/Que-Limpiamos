// Respuesta de cada acción: si salió bien y el mensaje a mostrar
export type ResultadoDeOperacion = {
  exito: boolean;
  mensaje: string;
};

export type EstadoDeVerificacion = "Pendiente" | "Verificada" | "Rechazada";

export type TipoDeDocumentoDeCliente = "INE · Frente" | "INE · Reverso";

export type FormatoDeArchivo = "pdf" | "imagen";

export type ArchivoDeDocumento = {
  url: string;
  formato: FormatoDeArchivo;
  esDeDemostracion: boolean;
};

export type DocumentoDeCliente = {
  id: string;
  tipo: TipoDeDocumentoDeCliente;
  archivo: ArchivoDeDocumento | null;
  fechaDeEnvio: string | null;
};

export type VerificacionDeIne = {
  estado: EstadoDeVerificacion;
  fechaDeRevision: string | null;
  motivoDeRechazo: string;
};

// Cliente y su verificación de INE
export type Cliente = {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  fechaDeRegistro: string;
  documentos: DocumentoDeCliente[];
  verificacion: VerificacionDeIne;
};

// Estado interno de la solicitud
export type EstadoDeSolicitud = "Pendiente" | "Confirmado" | "Realizado" | "Cancelado";

// Etapa que ve el administrador (se calcula del estado)
export type EtapaDeSolicitud = "Solicitud enviada" | "Asignando colaborador" | "Servicio confirmado" | "Servicio finalizado" | "Cancelada";

export type ModoDeEleccionDelColaborador = "Cliente" | "Automática";

export type EvidenciaFotografica = {
  id: string;
  nombreDelArchivo: string;
  tipoDeArchivo: string;
  tamanoEnBytes: number;
  url: string;
  fechaDeIncorporacion: string;
};

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

// Solicitud de servicio: es el dato central del flujo
export type Solicitud = {
  id: string;
  idDelCliente: string;
  idDelServicio: string;
  servicio: string;
  direccion: string;
  latitud: number;
  longitud: number;
  fechaDeCreacion: string;
  fechaProgramada: string;
  precioDeReferencia: number;
  modoDeEleccion: ModoDeEleccionDelColaborador;
  idDelTrabajador: string | null;
  estado: EstadoDeSolicitud;
  evidencias: EvidenciaFotografica[];
  calificacion: Calificacion | null;
  cancelacion: Cancelacion | null;
};

export type HorarioDeTrabajo = {
  dias: number[];
  horaDeInicio: string;
  horaDeFin: string;
};

export type EstadoDeTrabajador = "Activo" | "Inactivo";

// Colaborador que atiende los servicios
export type Trabajador = {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string;
  especialidades: string[];
  horario: HorarioDeTrabajo;
  documentosEntregados: string[];
  estado: EstadoDeTrabajador;
};

export type DatosDeTrabajador = Omit<Trabajador, "id" | "estado">;

export type EstadoDeServicio = "Activo" | "Inactivo";

// Servicio que ofrece el negocio
export type ServicioDelCatalogo = {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  estado: EstadoDeServicio;
};

export type DatosDeServicio = Omit<ServicioDelCatalogo, "id" | "estado">;

export type FiltroDeEtapa = "todas" | "activas" | EtapaDeSolicitud;
export type FiltroDeFechaDelTrabajo = "todas" | "hoy" | "manana" | "despues" | "anteriores";
export type FiltroDeFechaDeSolicitud = "todas" | "hoy" | "7dias";
export type FiltroDeEleccion = "todas" | ModoDeEleccionDelColaborador;

// Filtros de la lista de solicitudes
export type FiltrosDeSolicitudes = {
  busqueda: string;
  etapa: FiltroDeEtapa;
  fechaDelTrabajo: FiltroDeFechaDelTrabajo;
  fechaDeSolicitud: FiltroDeFechaDeSolicitud;
  eleccion: FiltroDeEleccion;
};

export type FiltroDeVerificacion = "Todos" | EstadoDeVerificacion;

export type AperturaDelPanel = {
  filtrosDeSolicitudes?: FiltrosDeSolicitudes;
  idDeSolicitud?: string | null;
  idDelCliente?: string | null;
  filtroDeVerificacion?: FiltroDeVerificacion;
};

export type VistaDelPanel = "inicio" | "perfil" | "solicitudes" | "trabajadores" | "catalogo" | "clientes" | "resenas";

// Función para cambiar de vista dentro del panel
export type Navegar = (vista: VistaDelPanel, apertura?: AperturaDelPanel) => void;

// Datos del usuario que inició sesión
export type Sesion = {
  id?: number;
  nombre: string;
  correo: string;
  rol?: string;
};
