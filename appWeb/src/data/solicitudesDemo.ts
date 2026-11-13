import { construirFechaIso, fechaIsoDeHaceHoras, obtenerClaveDeFecha, sumarDiasALaClaveDeFecha } from "../utils/fechas";
import type { Solicitud } from "./tipos";

// Solicitudes de demostración que recorren el flujo de los mockups:
// elegir servicio → elegir colaborador (personalmente o en automático) → confirmación
// del colaborador → servicio realizado → calificación, además de cancelaciones.
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

  const base = { evidencias: [], calificacion: null, cancelacion: null, acuerdoDePrecio: null };

  return [
    {
      ...base,
      id: "S-1031",
      idDelCliente: "U-205",
      idDelServicio: "C-02",
      servicio: "Limpieza profunda",
      descripcion: "Departamento de 2 recámaras y 2 baños. Prioridad en cocina y baños.",
      direccion: "SM 15, Av. Tulum, Cancún",
      latitud: 21.1585,
      longitud: -86.8259,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 24 * 13),
      fechaProgramada: programadaS1031,
      precioEstimado: 780,
      acuerdoDePrecio: { precio: 600, fechaDeRegistro: fechaIsoDeHaceHoras(ahora, 24 * 11) },
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
      descripcion: "Casa de 90 m², 2 recámaras y 1 baño. Pisos, baños y cocina.",
      direccion: "Supermanzana 21, Av. Bonampak, Cancún",
      latitud: 21.1628,
      longitud: -86.8275,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 96),
      fechaProgramada: programadaS1034,
      precioEstimado: 880,
      acuerdoDePrecio: { precio: 880, fechaDeRegistro: fechaIsoDeHaceHoras(ahora, 90) },
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
      descripcion: "Departamento con 8 ventanas y un ventanal de terraza. Vidrios interiores y exteriores.",
      direccion: "Blvd. Kukulcán km 9, Zona Hotelera, Cancún",
      latitud: 21.1345,
      longitud: -86.7592,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 72),
      fechaProgramada: programadaS1035,
      precioEstimado: 650,
      acuerdoDePrecio: { precio: 650, fechaDeRegistro: fechaIsoDeHaceHoras(ahora, 60) },
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
      descripcion: "Casa de 3 recámaras después de una fiesta. Sala, comedor y terraza.",
      direccion: "Residencial Lagos del Sol, Cancún",
      latitud: 21.1301,
      longitud: -86.8512,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 50),
      fechaProgramada: programarParaElDia(-1, "10:00"),
      precioEstimado: 1150,
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
      descripcion: "Departamento de 1 recámara. Cocina completa, campana y refrigerador.",
      direccion: "Puerto Cancún, Torre Marina, Cancún",
      latitud: 21.1442,
      longitud: -86.8012,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 8),
      fechaProgramada: programarParaElDia(0, "11:00"),
      precioEstimado: 450,
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
      descripcion: "Casa de 120 m², 3 recámaras y 2 baños. Hay una mascota pequeña.",
      direccion: "Supermanzana 21, calle 16, Cancún",
      latitud: 21.1671,
      longitud: -86.8302,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 2),
      fechaProgramada: programarParaElDia(0, "13:00"),
      precioEstimado: 1060,
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
      descripcion: "Local de 60 m² recién remodelado. Polvo de yeso y restos de pintura.",
      direccion: "Av. Nichupté, SM 19, Cancún",
      latitud: 21.1532,
      longitud: -86.8401,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 20),
      fechaProgramada: programarParaElDia(1, "10:00"),
      precioEstimado: 1130,
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
      descripcion: "Departamento de 70 m², 2 recámaras. Incluir clósets y ventanas.",
      direccion: "Malecón Tajamar, Cancún",
      latitud: 21.1489,
      longitud: -86.8155,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 26),
      fechaProgramada: programarParaElDia(3, "09:00"),
      precioEstimado: 1200,
      modoDeEleccion: "Automática",
      idDelTrabajador: null,
      estado: "Pendiente",
    },
  ];
}
