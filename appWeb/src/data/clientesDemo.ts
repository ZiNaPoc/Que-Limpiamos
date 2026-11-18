import { fechaIsoDeHaceHoras } from "../utils/fechas";
import type { ArchivoDeDocumento, Cliente, EstadoDeVerificacion } from "./tipos";

const CARPETA_DE_DOCUMENTOS_DEMO = `${import.meta.env.BASE_URL}documentos-demo/`;

const ARCHIVOS_DEMO = {
  frentePng: { url: `${CARPETA_DE_DOCUMENTOS_DEMO}ine-frente-demo.png`, formato: "imagen", esDeDemostracion: true },
  frenteJpg: { url: `${CARPETA_DE_DOCUMENTOS_DEMO}ine-frente-demo.jpg`, formato: "imagen", esDeDemostracion: true },
  reversoPng: { url: `${CARPETA_DE_DOCUMENTOS_DEMO}ine-reverso-demo.png`, formato: "imagen", esDeDemostracion: true },
  reversoPdf: { url: `${CARPETA_DE_DOCUMENTOS_DEMO}ine-reverso-demo.pdf`, formato: "pdf", esDeDemostracion: true },
} satisfies Record<string, ArchivoDeDocumento>;

type DatosDeClienteDemo = {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  horasDesdeElRegistro: number;
  frente: keyof typeof ARCHIVOS_DEMO;
  reverso: keyof typeof ARCHIVOS_DEMO;
  estado: EstadoDeVerificacion;
  motivoDeRechazo?: string;
};

const CLIENTES: DatosDeClienteDemo[] = [
  { id: "U-201", nombre: "Valeria Moo", telefono: "998 210 4401", correo: "valeria.moo@ejemplo.com", horasDesdeElRegistro: 24 * 40, frente: "frenteJpg", reverso: "reversoPng", estado: "Verificada" },
  { id: "U-202", nombre: "Mateo Pérez", telefono: "998 210 4402", correo: "mateo.perez@ejemplo.com", horasDesdeElRegistro: 24 * 32, frente: "frentePng", reverso: "reversoPdf", estado: "Verificada" },
  { id: "U-203", nombre: "Carlos Ek", telefono: "998 210 4403", correo: "carlos.ek@ejemplo.com", horasDesdeElRegistro: 5, frente: "frenteJpg", reverso: "reversoPng", estado: "Pendiente" },
  { id: "U-204", nombre: "Andrea Cetina", telefono: "998 210 4404", correo: "andrea.cetina@ejemplo.com", horasDesdeElRegistro: 24 * 20, frente: "frentePng", reverso: "reversoPng", estado: "Verificada" },
  { id: "U-205", nombre: "Nicte Miranda", telefono: "998 210 4405", correo: "nicte.miranda@ejemplo.com", horasDesdeElRegistro: 24 * 60, frente: "frenteJpg", reverso: "reversoPdf", estado: "Verificada" },
  { id: "U-206", nombre: "Lucía Pool", telefono: "998 210 4406", correo: "lucia.pool@ejemplo.com", horasDesdeElRegistro: 30, frente: "frentePng", reverso: "reversoPdf", estado: "Pendiente" },
  { id: "U-207", nombre: "Marina Can", telefono: "998 210 4407", correo: "marina.can@ejemplo.com", horasDesdeElRegistro: 24 * 6, frente: "frenteJpg", reverso: "reversoPng", estado: "Rechazada", motivoDeRechazo: "La fotografía del reverso está borrosa y no se leen los datos." },
];

// Clientes de ejemplo con INE en distintos estados
export function crearClientesDeDemostracion(ahora: Date): Cliente[] {
  return CLIENTES.map((datos) => {
    const fechaDeRegistro = fechaIsoDeHaceHoras(ahora, datos.horasDesdeElRegistro);
    const yaRevisada = datos.estado !== "Pendiente";
    return {
      id: datos.id,
      nombre: datos.nombre,
      telefono: datos.telefono,
      correo: datos.correo,
      fechaDeRegistro,
      documentos: [
        { id: `${datos.id}-frente`, tipo: "INE · Frente", archivo: ARCHIVOS_DEMO[datos.frente], fechaDeEnvio: fechaDeRegistro },
        { id: `${datos.id}-reverso`, tipo: "INE · Reverso", archivo: ARCHIVOS_DEMO[datos.reverso], fechaDeEnvio: fechaDeRegistro },
      ],
      verificacion: {
        estado: datos.estado,
        fechaDeRevision: yaRevisada ? fechaIsoDeHaceHoras(ahora, datos.horasDesdeElRegistro - 3) : null,
        motivoDeRechazo: datos.motivoDeRechazo ?? "",
      },
    };
  });
}
