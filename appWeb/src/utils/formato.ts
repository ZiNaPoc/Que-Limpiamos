import { claveDeFechaDesdeIso, diasEntre, MILISEGUNDOS_POR_MINUTO, obtenerClaveDeFecha, ZONA_HORARIA_DE_LA_APP } from "./fechas";

const formateadorDePrecios = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function formatearPrecio(monto: number): string {
  return `${formateadorDePrecios.format(monto)} MXN`;
}

export function formatearHora(fechaIso: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: ZONA_HORARIA_DE_LA_APP,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(fechaIso));
}

export function formatearFechaNumerica(fechaIso: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: ZONA_HORARIA_DE_LA_APP,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(fechaIso));
}

function formatearFechaCorta(fechaIso: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: ZONA_HORARIA_DE_LA_APP,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(fechaIso));
}

export function formatearFechaDeHoy(ahora: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: ZONA_HORARIA_DE_LA_APP,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(ahora);
}

function describirDia(fechaIso: string, claveDeHoy: string): string {
  const diferenciaEnDias = diasEntre(claveDeFechaDesdeIso(fechaIso), claveDeHoy);
  if (diferenciaEnDias === 0) {
    return "Hoy";
  }
  if (diferenciaEnDias === 1) {
    return "Mañana";
  }
  if (diferenciaEnDias === -1) {
    return "Ayer";
  }
  return formatearFechaCorta(fechaIso);
}

export function describirHorario(fechaIso: string, claveDeHoy: string): string {
  return `${describirDia(fechaIso, claveDeHoy)} · ${formatearHora(fechaIso)}`;
}

export function describirTiempoDesdeCreacion(fechaDeCreacion: string, ahora: Date): string {
  const minutosTranscurridos = Math.floor((ahora.getTime() - new Date(fechaDeCreacion).getTime()) / MILISEGUNDOS_POR_MINUTO);
  if (minutosTranscurridos < 1) {
    return "hace un momento";
  }
  if (minutosTranscurridos < 60) {
    return `hace ${minutosTranscurridos} min`;
  }
  const horasTranscurridas = Math.floor(minutosTranscurridos / 60);
  if (horasTranscurridas < 24) {
    return `hace ${horasTranscurridas} h`;
  }
  const diasTranscurridos = diasEntre(obtenerClaveDeFecha(ahora), claveDeFechaDesdeIso(fechaDeCreacion));
  if (diasTranscurridos === 1) {
    return "ayer";
  }
  return formatearFechaCorta(fechaDeCreacion);
}

export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function crearSiguienteId(idsExistentes: string[], prefijo: string, digitos: number): string {
  const numerosUsados = idsExistentes.map((id) => Number(id.replace(`${prefijo}-`, ""))).filter((numero) => Number.isInteger(numero));
  const siguienteNumero = Math.max(0, ...numerosUsados) + 1;
  return `${prefijo}-${String(siguienteNumero).padStart(digitos, "0")}`;
}
