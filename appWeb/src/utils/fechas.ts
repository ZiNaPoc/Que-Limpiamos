export const ZONA_HORARIA_DE_LA_APP = "America/Cancun";
const DESFASE_UTC_DE_LA_APP = "-05:00";
export const MILISEGUNDOS_POR_MINUTO = 60 * 1000;
const MILISEGUNDOS_POR_HORA = 60 * MILISEGUNDOS_POR_MINUTO;
const MILISEGUNDOS_POR_DIA = 24 * MILISEGUNDOS_POR_HORA;

export function obtenerClaveDeFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA_DE_LA_APP,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(fecha);
}

export function claveDeFechaDesdeIso(fechaIso: string): string {
  return obtenerClaveDeFecha(new Date(fechaIso));
}

export function horaParaCampoDeTiempo(fechaIso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONA_HORARIA_DE_LA_APP,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(fechaIso));
}

export function construirFechaIso(claveDeFecha: string, hora: string): string {
  return `${claveDeFecha}T${hora}:00${DESFASE_UTC_DE_LA_APP}`;
}

function claveDeFechaAMilisegundosUtc(claveDeFecha: string): number {
  const [anio, mes, dia] = claveDeFecha.split("-").map(Number);
  return Date.UTC(anio, mes - 1, dia);
}

export function sumarDiasALaClaveDeFecha(claveDeFecha: string, dias: number): string {
  const fechaDesplazada = new Date(claveDeFechaAMilisegundosUtc(claveDeFecha) + dias * MILISEGUNDOS_POR_DIA);
  return fechaDesplazada.toISOString().slice(0, 10);
}

export function diasEntre(claveMasReciente: string, claveMasAntigua: string): number {
  const diferenciaEnMilisegundos = claveDeFechaAMilisegundosUtc(claveMasReciente) - claveDeFechaAMilisegundosUtc(claveMasAntigua);
  return Math.round(diferenciaEnMilisegundos / MILISEGUNDOS_POR_DIA);
}

export function fechaIsoDeHaceHoras(ahora: Date, horas: number): string {
  return new Date(ahora.getTime() - horas * MILISEGUNDOS_POR_HORA).toISOString();
}
