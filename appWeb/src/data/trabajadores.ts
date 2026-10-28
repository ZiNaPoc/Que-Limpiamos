import type { Trabajador } from "./tipos";

export const DOCUMENTOS_REQUERIDOS = ["Identificación oficial", "Comprobante de domicilio", "Carta de antecedentes"];

export const TRABAJADORES_DE_DEMOSTRACION: Trabajador[] = [
  {
    id: "W-01",
    nombre: "Rosa Chan Pool",
    telefono: "998 123 4501",
    correo: "rosa.chan@ejemplo.com",
    direccion: "SM 63, Av. Chichén Itzá, Cancún",
    calificacion: 4.9,
    estado: "Disponible",
    documentosEntregados: ["Identificación oficial", "Comprobante de domicilio", "Carta de antecedentes"],
  },
  {
    id: "W-02",
    nombre: "Luis May Canul",
    telefono: "998 123 4502",
    correo: "luis.may@ejemplo.com",
    direccion: "Región 100, Calle 48 Norte, Cancún",
    calificacion: 4.7,
    estado: "Ocupado",
    documentosEntregados: ["Identificación oficial", "Comprobante de domicilio", "Carta de antecedentes"],
  },
  {
    id: "W-03",
    nombre: "Elena Pech Dzul",
    telefono: "998 123 4503",
    correo: "elena.pech@ejemplo.com",
    direccion: "SM 509, Av. Huayacán, Cancún",
    calificacion: 4.8,
    estado: "Disponible",
    documentosEntregados: ["Identificación oficial", "Comprobante de domicilio"],
  },
  {
    id: "W-04",
    nombre: "Jorge Canul Uc",
    telefono: "998 123 4504",
    correo: "jorge.canul@ejemplo.com",
    direccion: "SM 91, Calle Ceiba, Cancún",
    calificacion: 4.6,
    estado: "Ocupado",
    documentosEntregados: ["Identificación oficial", "Comprobante de domicilio", "Carta de antecedentes"],
  },
  {
    id: "W-05",
    nombre: "Marta Uc Balam",
    telefono: "998 123 4505",
    correo: "marta.uc@ejemplo.com",
    direccion: "SM 230, Av. Kabah, Cancún",
    calificacion: 4.8,
    estado: "Disponible",
    documentosEntregados: ["Identificación oficial"],
  },
];

export const DOCUMENTOS_DEL_REGISTRO = ["Identificación oficial", "Comprobante de domicilio"];

export function buscarTrabajador(trabajadores: Trabajador[], idDelTrabajador: string | null): Trabajador | undefined {
  if (!idDelTrabajador) {
    return undefined;
  }
  return trabajadores.find((trabajador) => trabajador.id === idDelTrabajador);
}

export function describirTrabajador(trabajadores: Trabajador[], idDelTrabajador: string | null): string {
  const trabajador = buscarTrabajador(trabajadores, idDelTrabajador);
  if (!trabajador) {
    return "Sin asignar";
  }
  return `${trabajador.id} · ${trabajador.nombre}`;
}
