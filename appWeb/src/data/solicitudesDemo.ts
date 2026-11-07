import { construirFechaIso, fechaIsoDeHaceHoras, obtenerClaveDeFecha, sumarDiasALaClaveDeFecha } from "../utils/fechas";
import type { Solicitud } from "./tipos";

export function crearSolicitudesDeDemostracion(ahora: Date): Solicitud[] {
  const claveDeHoy = obtenerClaveDeFecha(ahora);

  function programarParaElDia(diasDesdeHoy: number, hora: string) {
    return construirFechaIso(sumarDiasALaClaveDeFecha(claveDeHoy, diasDesdeHoy), hora);
  }

  return [
    {
      id: "S-1034",
      nombreDelCliente: "Valeria Moo",
      usuarioDelCliente: "@valeria",
      servicio: "Limpieza general",
      descripcion: "Casa de 90 m², 2 recámaras y 1 baño. Pisos, baños y cocina.",
      direccion: "Supermanzana 21, Av. Bonampak, Cancún",
      latitud: 21.1628,
      longitud: -86.8275,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 96),
      fechaProgramada: programarParaElDia(-3, "09:00"),
      precioEstimado: 980,
      acuerdoDePrecio: null,
      idDelTrabajador: "W-01",
      estado: "Realizado",
      evidencias: [],
    },
    {
      id: "S-1035",
      nombreDelCliente: "Mateo Pérez",
      usuarioDelCliente: "@mateo",
      servicio: "Limpieza de ventanas",
      descripcion: "Departamento con 8 ventanas y un ventanal de terraza. Vidrios interiores y exteriores.",
      direccion: "Blvd. Kukulcán km 9, Zona Hotelera, Cancún",
      latitud: 21.1345,
      longitud: -86.7592,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 72),
      fechaProgramada: programarParaElDia(-2, "12:00"),
      precioEstimado: 650,
      acuerdoDePrecio: null,
      idDelTrabajador: "W-02",
      estado: "Realizado",
      evidencias: [],
    },
    {
      id: "S-1038",
      nombreDelCliente: "Andrea Cetina",
      usuarioDelCliente: "@andrea",
      servicio: "Limpieza de cocina",
      descripcion: "Departamento de 1 recámara. Cocina completa, campana y refrigerador.",
      direccion: "Puerto Cancún, Torre Marina, Cancún",
      latitud: 21.1442,
      longitud: -86.8012,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 8),
      fechaProgramada: programarParaElDia(0, "11:00"),
      precioEstimado: 780,
      acuerdoDePrecio: null,
      idDelTrabajador: "W-03",
      estado: "Confirmado",
      evidencias: [],
    },
    {
      id: "S-1040",
      nombreDelCliente: "Carlos Ek",
      usuarioDelCliente: "@carlos",
      servicio: "Limpieza general",
      descripcion: "Casa de 120 m², 3 recámaras y 2 baños. Hay una mascota pequeña.",
      direccion: "Supermanzana 21, calle 16, Cancún",
      latitud: 21.1671,
      longitud: -86.8302,
      fechaDeCreacion: fechaIsoDeHaceHoras(ahora, 2),
      fechaProgramada: programarParaElDia(0, "13:00"),
      precioEstimado: 1280,
      acuerdoDePrecio: null,
      idDelTrabajador: null,
      estado: "Pendiente",
      evidencias: [],
    },
  ];
}
