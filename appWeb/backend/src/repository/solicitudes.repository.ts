import { prisma } from "../config/prisma";

export function obtenerTodas() {
  return prisma.solicitudes.findMany({
    orderBy: {
      created_at: "desc",
    },
    include: {
      usuarios: {
        select: {
          id: true,
          nombre_completo: true,
          correo: true,
          telefono: true,
        },
      },

      servicios: {
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          precio_base: true,
          duracion_estimada_min: true,
          estado: true,
        },
      },

      trabajadores: {
        select: {
          id: true,
          nombre_completo: true,
          telefono: true,
          correo: true,
          estado: true,
        },
      },

      evidencias_solicitud: true,
      resenas: true,
    },
  });
}

export function buscarPorId(id: number) {
  return prisma.solicitudes.findUnique({
    where: { id },
  });
}

export function buscarTrabajadorConServicio(
  trabajadorId: number,
  servicioId: number,
) {
  return prisma.trabajadores.findUnique({
    where: { id: trabajadorId },
    include: {
      trabajador_servicios: {
        where: { servicio_id: servicioId },
      },
    },
  });
}

export function actualizarTrabajador(
  idSolicitud: number,
  trabajadorId: number | null,
) {
  return prisma.solicitudes.update({
    where: { id: idSolicitud },
    data: {
      trabajador_id: trabajadorId,
      updated_at: new Date(),
    },
  });
}