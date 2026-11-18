import { construirFechaIso, fechaIsoDeHaceHoras, obtenerClaveDeFecha, sumarDiasALaClaveDeFecha } from "../utils/fechas";
import type { Solicitud } from "./tipos";

// Solicitudes de ejemplo; las fechas se calculan desde hoy
export function crearSolicitudesDeDemostracion(ahora: Date): Solicitud[] {
  const claveDeHoy = obtenerClaveDeFecha(ahora);

  function programarParaElDia(diasDesdeHoy: number, hora: string) {
    return construirFechaIso(sumarDiasALaClaveDeFecha(claveDeHoy, diasDesdeHoy), hora);
  }

  function horasDespuesDe(fechaIso: string, horas: number) {
    return new Date(new Date(fechaIso).getTime() + horas * 60 * 60 * 1000).toISOString();
  }

  const programadaS1031 = programarParaElDia(-10, "15:00");
  const programadaS1034 = programarParaElDia(-3, "09:00");
  const programadaS1035 = programarParaElDia(-2, "12:00");

  const base = { evidencias: [], calificacion: null, cancelacion: null };

  return [
    {
      ...base,
      id: "S-1031",
      idDelCliente: "U-205",
      idDelServicio: "C-02",
      servicio: "Limpieza profunda",
      direccion: "SM 15, Av. Tulum, Cancún",
      latitud: 21.1585,
      longitud: -86.8259,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 24 * 13),
      fechaProgramada: programadaS1031,
      precioDeReferencia: 600,
      modoDeEleccion: "Cliente",
      idDelTrabajador: "W-01",
      estado: "Realizado",
      calificacion: { puntuacion: 5, comentario: "Rosa dejó todo impecable y llegó puntual.", fecha: horasDespuesDe(programadaS1031, 5) },
    },
    {
      ...base,
      id: "S-1034",
      idDelCliente: "U-201",
      idDelServicio: "C-01",
      servicio: "Limpieza regular",
      direccion: "Supermanzana 21, Av. Bonampak, Cancún",
      latitud: 21.1628,
      longitud: -86.8275,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 96),
      fechaProgramada: programadaS1034,
      precioDeReferencia: 400,
      modoDeEleccion: "Automática",
      idDelTrabajador: "W-01",
      estado: "Realizado",
      calificacion: { puntuacion: 3, comentario: "Faltó terminar la estufa y la tarja.", fecha: horasDespuesDe(programadaS1034, 6) },
    },
    {
      ...base,
      id: "S-1035",
      idDelCliente: "U-202",
      idDelServicio: "C-04",
      servicio: "Limpieza de ventanas",
      direccion: "Blvd. Kukulcán km 9, Zona Hotelera, Cancún",
      latitud: 21.1345,
      longitud: -86.7592,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 72),
      fechaProgramada: programadaS1035,
      precioDeReferencia: 300,
      modoDeEleccion: "Automática",
      idDelTrabajador: "W-02",
      estado: "Realizado",
      calificacion: { puntuacion: 4, comentario: "Buen trabajo en las ventanas, aunque llegó tarde.", fecha: horasDespuesDe(programadaS1035, 4) },
    },
    {
      ...base,
      id: "S-1036",
      idDelCliente: "U-204",
      idDelServicio: "C-02",
      servicio: "Limpieza profunda",
      direccion: "Residencial Lagos del Sol, Cancún",
      latitud: 21.1301,
      longitud: -86.8512,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 50),
      fechaProgramada: programarParaElDia(-1, "10:00"),
      precioDeReferencia: 600,
      modoDeEleccion: "Cliente",
      idDelTrabajador: "W-03",
      estado: "Cancelado",
      cancelacion: { canceladaPor: "Cliente", motivo: "Eliminó la limpieza desde su historial en la app.", fecha: fechaIsoDeHaceHoras(ahora, 30) },
    },
    {
      ...base,
      id: "S-1038",
      idDelCliente: "U-204",
      idDelServicio: "C-05",
      servicio: "Limpieza de cocina",
      direccion: "Puerto Cancún, Torre Marina, Cancún",
      latitud: 21.1442,
      longitud: -86.8012,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 8),
      fechaProgramada: programarParaElDia(0, "11:00"),
      precioDeReferencia: 400,
      modoDeEleccion: "Automática",
      idDelTrabajador: "W-03",
      estado: "Confirmado",
    },
    {
      ...base,
      id: "S-1040",
      idDelCliente: "U-203",
      idDelServicio: "C-01",
      servicio: "Limpieza regular",
      direccion: "Supermanzana 21, calle 16, Cancún",
      latitud: 21.1671,
      longitud: -86.8302,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 2),
      fechaProgramada: programarParaElDia(0, "13:00"),
      precioDeReferencia: 400,
      modoDeEleccion: "Automática",
      idDelTrabajador: null,
      estado: "Pendiente",
    },
    {
      ...base,
      id: "S-1041",
      idDelCliente: "U-205",
      idDelServicio: "C-03",
      servicio: "Limpieza post-obra",
      direccion: "Av. Nichupté, SM 19, Cancún",
      latitud: 21.1532,
      longitud: -86.8401,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 20),
      fechaProgramada: programarParaElDia(1, "10:00"),
      precioDeReferencia: 650,
      modoDeEleccion: "Cliente",
      idDelTrabajador: "W-04",
      estado: "Pendiente",
    },
    {
      ...base,
      id: "S-1042",
      idDelCliente: "U-206",
      idDelServicio: "C-02",
      servicio: "Limpieza profunda",
      direccion: "Malecón Tajamar, Cancún",
      latitud: 21.1489,
      longitud: -86.8155,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 26),
      fechaProgramada: programarParaElDia(3, "09:00"),
      precioDeReferencia: 600,
      modoDeEleccion: "Automática",
      idDelTrabajador: null,
      estado: "Pendiente",
    },
  ];
}
