import { fechaIsoDeHaceHoras } from "../utils/fechas";
import type { ArchivoDeDocumento, Cliente, DocumentoDeCliente, EstadoDeDocumento, TipoDeDocumentoDeCliente } from "./tipos";
import { calcularEstadoDeVerificacion } from "../utils/documentosDeClientes";

// DATOS DE DEMOSTRACIÓN.
// Los archivos están en public/documentos-demo y llevan la leyenda «Documento de demostración ·
// no es una identificación real». No son documentos de clientes reales. Cuando exista el backend,
// la lista de clientes y sus documentos deberá llegar de la API con esta misma forma.

const CARPETA_DE_DOCUMENTOS_DEMO = `${import.meta.env.BASE_URL}documentos-demo/`;

const ARCHIVOS_DEMO: Record<string, ArchivoDeDocumento> = {
  frentePng: { url: `${CARPETA_DE_DOCUMENTOS_DEMO}ine-frente-demo.png`, formato: "imagen", esDeDemostracion: true },
  frenteJpg: { url: `${CARPETA_DE_DOCUMENTOS_DEMO}ine-frente-demo.jpg`, formato: "imagen", esDeDemostracion: true },
  reversoPng: { url: `${CARPETA_DE_DOCUMENTOS_DEMO}ine-reverso-demo.png`, formato: "imagen", esDeDemostracion: true },
  reversoPdf: { url: `${CARPETA_DE_DOCUMENTOS_DEMO}ine-reverso-demo.pdf`, formato: "pdf", esDeDemostracion: true },
};

type DocumentoDemo = {
  archivo: keyof typeof ARCHIVOS_DEMO;
  estado: EstadoDeDocumento;
  motivoDeRechazo?: string;
};

type DatosDeClienteDemo = {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  horasDesdeElRegistro: number;
  frente: DocumentoDemo;
  reverso: DocumentoDemo;
};

const CLIENTES: DatosDeClienteDemo[] = [
  { id: "U-201", nombre: "Valeria Moo", telefono: "998 210 4401", correo: "valeria.moo@ejemplo.com", horasDesdeElRegistro: 24 * 40, frente: { archivo: "frenteJpg", estado: "Aprobado" }, reverso: { archivo: "reversoPng", estado: "Aprobado" } },
  { id: "U-202", nombre: "Mateo Pérez", telefono: "998 210 4402", correo: "mateo.perez@ejemplo.com", horasDesdeElRegistro: 24 * 32, frente: { archivo: "frentePng", estado: "Aprobado" }, reverso: { archivo: "reversoPdf", estado: "Aprobado" } },
  { id: "U-203", nombre: "Carlos Ek", telefono: "998 210 4403", correo: "carlos.ek@ejemplo.com", horasDesdeElRegistro: 5, frente: { archivo: "frenteJpg", estado: "Pendiente" }, reverso: { archivo: "reversoPng", estado: "Pendiente" } },
  { id: "U-204", nombre: "Andrea Cetina", telefono: "998 210 4404", correo: "andrea.cetina@ejemplo.com", horasDesdeElRegistro: 24 * 20, frente: { archivo: "frentePng", estado: "Aprobado" }, reverso: { archivo: "reversoPng", estado: "Aprobado" } },
  { id: "U-205", nombre: "Nicte Miranda", telefono: "998 210 4405", correo: "nicte.miranda@ejemplo.com", horasDesdeElRegistro: 24 * 60, frente: { archivo: "frenteJpg", estado: "Aprobado" }, reverso: { archivo: "reversoPdf", estado: "Aprobado" } },
  { id: "U-206", nombre: "Lucía Pool", telefono: "998 210 4406", correo: "lucia.pool@ejemplo.com", horasDesdeElRegistro: 30, frente: { archivo: "frentePng", estado: "Pendiente" }, reverso: { archivo: "reversoPdf", estado: "Pendiente" } },
  {
    id: "U-207",
    nombre: "Marina Can",
    telefono: "998 210 4407",
    correo: "marina.can@ejemplo.com",
    horasDesdeElRegistro: 24 * 6,
    frente: { archivo: "frenteJpg", estado: "Aprobado" },
    reverso: { archivo: "reversoPng", estado: "Rechazado", motivoDeRechazo: "La fotografía del reverso está borrosa y no se leen los datos." },
  },
];

function crearDocumento(datos: DatosDeClienteDemo, tipo: TipoDeDocumentoDeCliente, documento: DocumentoDemo, ahora: Date): DocumentoDeCliente {
  // En el registro de la app la INE se envía junto con la cuenta.
  const fechaDeEnvio = fechaIsoDeHaceHoras(ahora, datos.horasDesdeElRegistro);
  const yaRevisado = documento.estado !== "Pendiente";
  return {
    id: `${datos.id}-${tipo === "INE · Frente" ? "frente" : "reverso"}`,
    idDelCliente: datos.id,
    tipo,
    archivo: ARCHIVOS_DEMO[documento.archivo],
    fechaDeEnvio,
    estado: documento.estado,
    fechaDeRevision: yaRevisado ? fechaIsoDeHaceHoras(ahora, datos.horasDesdeElRegistro - 3) : null,
    motivoDeRechazo: documento.motivoDeRechazo ?? "",
  };
}

export function crearClientesDeDemostracion(ahora: Date): Cliente[] {
  return CLIENTES.map((datos) => {
    const documentos = [crearDocumento(datos, "INE · Frente", datos.frente, ahora), crearDocumento(datos, "INE · Reverso", datos.reverso, ahora)];
    return {
      id: datos.id,
      nombre: datos.nombre,
      telefono: datos.telefono,
      correo: datos.correo,
      fechaDeRegistro: fechaIsoDeHaceHoras(ahora, datos.horasDesdeElRegistro),
      documentos,
      verificacion: { estado: calcularEstadoDeVerificacion(documentos) },
    };
  });
}
