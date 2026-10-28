export type EstadoDeSolicitud = "Pendiente" | "Confirmado" | "Realizado" | "Cancelado";

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

export type Solicitud = {
  id: string;
  nombreDelCliente: string;
  usuarioDelCliente: string;
  servicio: string;
  descripcion: string;
  direccion: string;
  latitud: number;
  longitud: number;
  fechaDeCreacion: string;
  fechaProgramada: string;
  precioEstimado: number;
  acuerdoDePrecio: AcuerdoDePrecio | null;
  idDelTrabajador: string | null;
  estado: EstadoDeSolicitud;
  evidencias: EvidenciaFotografica[];
};

export type ResultadoDeOperacion = {
  exito: boolean;
  mensaje: string;
};

export type EstadoDeTrabajador = "Disponible" | "Ocupado";

export type Trabajador = {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string;
  calificacion: number | null;
  estado: EstadoDeTrabajador;
  documentosEntregados: string[];
};

export type DatosDeNuevoTrabajador = {
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string;
  documentosEntregados: string[];
};

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

export type EstadoDeReporte = "Pendiente" | "En revisión" | "Resuelto";

export type Reporte = {
  folio: string;
  idDeSolicitud: string;
  descripcion: string;
  fechaDeCreacion: string;
  estado: EstadoDeReporte;
  solucion: string;
};

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

export type AperturaDeSolicitudes = {
  filtros: FiltrosDeSolicitudes;
  idDeSolicitud: string | null;
};

export type VistaDelPanel = "inicio" | "perfil" | "solicitudes" | "trabajadores" | "catalogo" | "clientes" | "reportes" | "resenas";

export type Sesion = {
  nombre: string;
  nombreDeUsuario: string;
  correo: string;
};

export type FilaDeSeccion = Record<string, string>;
export type ColumnaDeSeccion = { clave: string; etiqueta: string };
export type IdDeSeccionDeDatos = "clientes" | "resenas";
export type SeccionDeDatos = {
  titulo: string;
  subtitulo: string;
  columnas: ColumnaDeSeccion[];
  filas: FilaDeSeccion[];
};
