// Aquí se define la forma de todo lo que maneja la web. Son el "contrato" que el back debe respetar al responder.
// Respuesta estándar de toda acción (guardar, confirmar, cancelar, aprobar...).
// exito: salió bien (true) o no (false). mensaje: el texto que verá el usuario.
// Ese texto se muestra en el AvisoTemporal (el cartelito de abajo que se quita solo).
export type ResultadoDeOperacion = {
  exito: boolean;
  mensaje: string;
};

// Estado de la INE de un cliente. 

export type EstadoDeVerificacion = "Pendiente" | "Verificada" | "Rechazada";

// Lado de la INE. 
export type TipoDeDocumentoDeCliente = "INE · Frente" | "INE · Reverso";

export type FormatoDeArchivo = "pdf" | "imagen";

// Archivo subido. esDeDemostracion es true cuando es un archivo de ejemplo.
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

// Resultado de la revisión del administrador sobre la INE.
export type VerificacionDeIne = {
  estado: EstadoDeVerificacion;
  fechaDeRevision: string | null;
  motivoDeRechazo: string;
};

// Cliente y su verificación de INE. 
// Los clientes se registran desde la app móvil; aquí el administrador solo los consulta y revisa su INE.
export type Cliente = {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  fechaDeRegistro: string;
  documentos: DocumentoDeCliente[];
  verificacion: VerificacionDeIne;
};

// Estado interno de la solicitud. Avanza: Pendiente - Confirmado - Realizado; en cualquier momento antes de finalizar puede pasar a Cancelado.
export type EstadoDeSolicitud = 
"Pendiente" | 
"Confirmado" | 
"Realizado" | 
"Cancelado" |
"En proceso" |
"Rechazado";

// Etapa que ve el administrador. No se guarda: se calcula con obtenerEtapa() usando el estado y si ya hay colaborador.
// Pendiente sin colaborador = "Solicitud enviada"; Pendiente con colaborador = "Asignando colaborador".
export type EtapaDeSolicitud = 
"Solicitud enviada" 
| "Asignando colaborador" 
| "Servicio confirmado" 
| "Servicio en proceso"
| "Servicio finalizado" 
| "Cancelada"
| "Solicitud rechazada";

export type FiltroDeEtapa = 
|   "todas" 
| "activas" 
| EtapaDeSolicitud;

// Quién eligió al colaborador: el Cliente (manual) o el sistema (Automática). 
export type ModoDeEleccionDelColaborador = "Cliente" | "Automática";

// Foto de evidencia del servicio. 
export type EvidenciaFotografica = {
  id: string;
  nombreDelArchivo: string;
  tipoDeArchivo: string;
  tamanoEnBytes: number;
  url: string;
  fechaDeIncorporacion: string;
};

// Reseña del cliente al terminar el servicio. 
export type Calificacion = {
  puntuacion: number;
  comentario: string;
  fecha: string;
};

// Quién canceló y por qué. 
export type Cancelacion = {
  canceladaPor: "Cliente" | "Administración";
  motivo: string;
  fecha: string;
};

// Solicitud de servicio: es el dato central de todo el flujo.
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

// Días y horas en que trabaja un colaborador. dias: 0 = domingo ... 6 = sábado.
export type HorarioDeTrabajo = {
  dias: number[];
  horaDeInicio: string;
  horaDeFin: string;
};

export type EstadoDeTrabajador = "Activo" | "Inactivo";

// Colaborador que atiende los servicios.
// especialidades guarda los ids de servicios del catálogo.
// documentosEntregados guarda solo el nombre de los documentos que ya entregó ("Identificación oficial", ...). 
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

// Los datos que se escriben en el formulario de colaborador (todo menos el id y el estado, que los pone el sistema).
export type DatosDeTrabajador = Omit<Trabajador, "id" | "estado">;

export type EstadoDeServicio = "Activo" | "Inactivo";

// Servicio que ofrece el negocio. 
export type ServicioDelCatalogo = {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  estado: EstadoDeServicio;
};

// Los datos que se escriben en el formulario de servicio (sin id ni estado).
export type DatosDeServicio = Omit<ServicioDelCatalogo, "id" | "estado">;


export type FiltroDeFechaDelTrabajo = "todas" | "hoy" | "manana" | "despues" | "anteriores";
export type FiltroDeFechaDeSolicitud = "todas" | "hoy" | "7dias";
export type FiltroDeEleccion = "todas" | ModoDeEleccionDelColaborador;

export type FiltroDeVerificacion = "Todos" | EstadoDeVerificacion;

// Datos extra para abrir una pantalla del panel ya preparada.
// abrir Solicitudes con filtros puestos, abrir el detalle de una solicitud,
// abrir el detalle de un cliente (idDelCliente) o Clientes filtrado por INE.
export type AperturaDelPanel = {
  filtrosDeSolicitudes?: FiltrosDeSolicitudes;
  idDeSolicitud?: string | null;
  idDelCliente?: string | null;
  filtroDeVerificacion?: FiltroDeVerificacion;
};

// Pantallas del panel de administración (cada una es un botón del menú lateral; "perfil" se abre desde la foto).
export type VistaDelPanel = "inicio" | "perfil" | "solicitudes" | "trabajadores" | "catalogo" | "clientes" | "resenas";

// Función para cambiar de pantalla dentro del panel. La define DashboardPage y la reciben las demás pantallas como onNavegar.
export type Navegar = (vista: VistaDelPanel, apertura?: AperturaDelPanel) => void;

// Datos del usuario que inició sesión. Es lo que devuelve el login.
// Trae id, nombre, correo y rol.
export type Sesion = {
  id?: number;
  nombre: string;
  correo: string;
  rol?: string;
};

export type SolicitudListado = {
  id: string;
  idCliente: string;
  idServicio: string;
  idTrabajador: string | null;

  servicio:string;
  direccion: string;
  estado: EstadoDeSolicitud;

  fechaCreacion:string;
  fechaProgramada:string;

  precioReferencia: number;

  cliente: {
    id: string;
    nombre: string;
    correo:string;
    telefono:string|null;
  };

  trabajador: {
    id:string;
    nombre:string;
    estado: 'ACTIVO' | 'INACTIVO';
  } | null;
};

export type FiltrosDeSolicitudes ={
  busqueda:string;
  etapa:FiltroDeEtapa;
  fechaDelTrabajo: FiltroDeFechaDelTrabajo;
  fechaDeSolicitud: FiltroDeFechaDeSolicitud;
}