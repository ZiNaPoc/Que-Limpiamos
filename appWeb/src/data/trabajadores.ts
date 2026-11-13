import type { HorarioDeTrabajo, Trabajador } from "./tipos";

export const DOCUMENTOS_REQUERIDOS = ["Identificación oficial", "Comprobante de domicilio", "Carta de antecedentes"];

const LUNES_A_SABADO = [1, 2, 3, 4, 5, 6];
const LUNES_A_VIERNES = [1, 2, 3, 4, 5];

export const HORARIO_PREDETERMINADO: HorarioDeTrabajo = { dias: LUNES_A_SABADO, horaDeInicio: "09:00", horaDeFin: "18:00" };

export const TRABAJADORES_DE_DEMOSTRACION: Trabajador[] = [
  {
    id: "W-01",
    nombre: "Rosa Chan Pool",
    telefono: "998 123 4501",
    correo: "rosa.chan@ejemplo.com",
    direccion: "SM 63, Av. Chichén Itzá, Cancún",
    especialidades: ["C-02", "C-05"],
    horario: { dias: LUNES_A_SABADO, horaDeInicio: "09:00", horaDeFin: "18:00" },
    documentosEntregados: ["Identificación oficial", "Comprobante de domicilio", "Carta de antecedentes"],
  },
  {
    id: "W-02",
    nombre: "Luis May Canul",
    telefono: "998 123 4502",
    correo: "luis.may@ejemplo.com",
    direccion: "Región 100, Calle 48 Norte, Cancún",
    especialidades: ["C-01", "C-04"],
    horario: { dias: LUNES_A_VIERNES, horaDeInicio: "08:00", horaDeFin: "15:00" },
    documentosEntregados: ["Identificación oficial", "Comprobante de domicilio", "Carta de antecedentes"],
  },
  {
    id: "W-03",
    nombre: "Elena Pech Dzul",
    telefono: "998 123 4503",
    correo: "elena.pech@ejemplo.com",
    direccion: "SM 509, Av. Huayacán, Cancún",
    especialidades: ["C-01", "C-02", "C-05"],
    horario: { dias: [0, 1, 2, 3, 4, 5, 6], horaDeInicio: "08:00", horaDeFin: "16:00" },
    documentosEntregados: ["Identificación oficial", "Comprobante de domicilio"],
  },
  {
    id: "W-04",
    nombre: "Jorge Canul Uc",
    telefono: "998 123 4504",
    correo: "jorge.canul@ejemplo.com",
    direccion: "SM 91, Calle Ceiba, Cancún",
    especialidades: ["C-01", "C-03"],
    horario: { dias: [0, 1, 2, 3, 4, 5, 6], horaDeInicio: "10:00", horaDeFin: "19:00" },
    documentosEntregados: ["Identificación oficial", "Comprobante de domicilio", "Carta de antecedentes"],
  },
];

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
