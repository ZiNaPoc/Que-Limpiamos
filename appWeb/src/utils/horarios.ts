import { horaParaCampoDeTiempo, ZONA_HORARIA_DE_LA_APP } from "./fechas";
import type { HorarioDeTrabajo } from "../data/tipos";

// Orden de lunes a domingo, con la numeración de Date.getDay().
export const DIAS_DE_LA_SEMANA = [
  { numero: 1, corto: "Lun", largo: "Lunes" },
  { numero: 2, corto: "Mar", largo: "Martes" },
  { numero: 3, corto: "Mié", largo: "Miércoles" },
  { numero: 4, corto: "Jue", largo: "Jueves" },
  { numero: 5, corto: "Vie", largo: "Viernes" },
  { numero: 6, corto: "Sáb", largo: "Sábado" },
  { numero: 0, corto: "Dom", largo: "Domingo" },
];

const NUMERO_POR_DIA_EN_INGLES: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function diaDeLaSemanaEnCancun(fechaIso: string): number {
  const nombre = new Intl.DateTimeFormat("en-US", { timeZone: ZONA_HORARIA_DE_LA_APP, weekday: "short" }).format(new Date(fechaIso));
  return NUMERO_POR_DIA_EN_INGLES[nombre];
}

function formatearHoraDelCampo(hora: string): string {
  const [horas, minutos] = hora.split(":").map(Number);
  const sufijo = horas < 12 ? "a. m." : "p. m.";
  const horasEn12 = horas % 12 === 0 ? 12 : horas % 12;
  return `${horasEn12}:${String(minutos).padStart(2, "0")} ${sufijo}`;
}

function describirDias(dias: number[]): string {
  const ordenados = DIAS_DE_LA_SEMANA.filter((dia) => dias.includes(dia.numero));
  if (ordenados.length === 7) {
    return "Todos los días";
  }
  if (ordenados.length === 0) {
    return "Sin días";
  }
  const posiciones = ordenados.map((dia) => DIAS_DE_LA_SEMANA.indexOf(dia));
  const sonConsecutivos = posiciones.every((posicion, indice) => indice === 0 || posicion === posiciones[indice - 1] + 1);
  if (sonConsecutivos && ordenados.length > 2) {
    return `${ordenados[0].largo}–${ordenados[ordenados.length - 1].largo}`;
  }
  return ordenados.map((dia) => dia.corto).join(", ");
}

export function describirHorarioDeTrabajo(horario: HorarioDeTrabajo): string {
  return `${describirDias(horario.dias)} · ${formatearHoraDelCampo(horario.horaDeInicio)} – ${formatearHoraDelCampo(horario.horaDeFin)}`;
}

// El servicio debe empezar en un día y una hora dentro del horario del trabajador.
export function horarioCubreLaFecha(horario: HorarioDeTrabajo, fechaIso: string): boolean {
  if (!horario.dias.includes(diaDeLaSemanaEnCancun(fechaIso))) {
    return false;
  }
  const hora = horaParaCampoDeTiempo(fechaIso);
  return hora >= horario.horaDeInicio && hora < horario.horaDeFin;
}

export function validarHorario(horario: HorarioDeTrabajo): string | undefined {
  if (horario.dias.length === 0) {
    return "Elige al menos un día de trabajo.";
  }
  const patronDeHora = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!patronDeHora.test(horario.horaDeInicio) || !patronDeHora.test(horario.horaDeFin)) {
    return "Escribe la hora de inicio y la de fin.";
  }
  if (horario.horaDeInicio >= horario.horaDeFin) {
    return "La hora de fin debe ser posterior a la de inicio.";
  }
  return undefined;
}
