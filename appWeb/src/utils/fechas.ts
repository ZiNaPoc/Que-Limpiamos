// FECHAS: toda la web usa la hora de Cancún, sin importar dónde esté la computadora.
// Las fechas viajan como texto ISO (ej. 2026-11-17T10:00:00-05:00). Quintana Roo no cambia de horario en verano (siempre UTC-5).
// Se debe guardar y devolver las fechas siempre con zona horaria (ISO con -05:00, o en UTC con la Z al final).
// La web convierte todo a hora de Cancún solo al mostrarlo; el back no tiene que mandar las fechas ya convertidas.
export const ZONA_HORARIA_DE_LA_APP = "America/Cancun";
const DESFASE_UTC_DE_LA_APP = "-05:00";
export const MILISEGUNDOS_POR_MINUTO = 60 * 1000;
const MILISEGUNDOS_POR_HORA = 60 * MILISEGUNDOS_POR_MINUTO;
const MILISEGUNDOS_POR_DIA = 24 * MILISEGUNDOS_POR_HORA;

// "Clave" de un día: texto AAAA-MM-DD en hora de Cancún. Sirve para saber si dos fechas son el mismo día.
export function obtenerClaveDeFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA_DE_LA_APP,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(fecha);
}

// La clave del día de una fecha ISO.
export function claveDeFechaDesdeIso(fechaIso: string): string {
  return obtenerClaveDeFecha(new Date(fechaIso));
}

// Hora en formato 24 h (HH:MM) en hora de Cancún. Sirve para comparar con el horario de trabajo.
export function horaParaCampoDeTiempo(fechaIso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONA_HORARIA_DE_LA_APP,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(fechaIso));
}

// Junta un día y una hora para crear una fecha ISO con la zona de Cancún.
export function construirFechaIso(claveDeFecha: string, hora: string): string {
  return `${claveDeFecha}T${hora}:00${DESFASE_UTC_DE_LA_APP}`;
}

function claveDeFechaAMilisegundosUtc(claveDeFecha: string): number {
  const [anio, mes, dia] = claveDeFecha.split("-").map(Number);
  return Date.UTC(anio, mes - 1, dia);
}

// Suma o resta días a una clave de fecha (para calcular "mañana" o "hace 3 días").
export function sumarDiasALaClaveDeFecha(claveDeFecha: string, dias: number): string {
  const fechaDesplazada = new Date(claveDeFechaAMilisegundosUtc(claveDeFecha) + dias * MILISEGUNDOS_POR_DIA);
  return fechaDesplazada.toISOString().slice(0, 10);
}

// Cuántos días hay entre dos claves de fecha (positivo si la primera es más reciente).
export function diasEntre(claveMasReciente: string, claveMasAntigua: string): number {
  const diferenciaEnMilisegundos = claveDeFechaAMilisegundosUtc(claveMasReciente) - claveDeFechaAMilisegundosUtc(claveMasAntigua);
  return Math.round(diferenciaEnMilisegundos / MILISEGUNDOS_POR_DIA);
}

// Fecha ISO de hace N horas. La usan los datos de demostración.
export function fechaIsoDeHaceHoras(ahora: Date, horas: number): string {
  return new Date(ahora.getTime() - horas * MILISEGUNDOS_POR_HORA).toISOString();
}
