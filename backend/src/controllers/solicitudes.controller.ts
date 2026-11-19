import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import * as solicitudesRepository from "../repository/solicitudes.repository";

function obtenerId(valor: string): number {
  const id = Number(valor);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError(400, "El ID de la solicitud no es valido");
  }

  return id;
}

export async function obtenerSolicitudes(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const solicitudes = await solicitudesRepository.obtenerTodas();

    const estadosFront = {
      PENDIENTE: "Pendiente",
      CONFIRMADO: "Confirmado",
      EN_PROCESO: "En proceso",
      REALIZADO: "Realizado",
      CANCELADO: "Cancelado",
      RECHAZADO: "Rechazado"
    } as const;

    const resultado = solicitudes.map((solicitud) => ({

      //IDS
      id: String(solicitud.id),
      idCliente: String(solicitud.cliente_id),
      idServicio: String(solicitud.servicio_id),
      idTrabajador: solicitud.trabajador_id === null
      ? null
      : String(solicitud.trabajador_id),

      //DATA DE LA SOLICITUD
      servicio: solicitud.servicios.nombre,
      direccion: solicitud.direccion_servicio,
      estado: solicitud.estado,
      precioEstimado: Number(solicitud.precio_estimado),

      //FECHAS
      fechaProgramada: solicitud.fecha_hora_programada.toISOString,
      fechaCreacion: solicitud.created_at.toISOString(),
      fechaActualizacion: solicitud.updated_at.toISOString(),

      //DATA DE INVOLUCRADOS
      cliente: {
        id: String(solicitud.usuarios.id),
        nombre: solicitud.usuarios.nombre_completo,
        correo: solicitud.usuarios.correo,
        telefono: solicitud.usuarios.telefono,
      },

      trabajador: solicitud.trabajadores
        ? {
            id: String(solicitud.trabajadores.id),
            nombre: solicitud.trabajadores.nombre_completo,
            estado: solicitud.trabajadores.estado,
          }
        : null,
    }));

    return res.status(200).json({
      total: resultado.length,
      solicitudes: resultado,
    });
  } catch (error) {
    next(error);
  }
}

export async function cambiarTrabajadorAsignado(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const idSolicitud = obtenerId(
      Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    );

    const valor = req.body?.trabajadorId;

    let trabajadorId: number | null = null;

    if (valor !== null) {
      trabajadorId = Number(valor);

      if (!Number.isSafeInteger(trabajadorId) || trabajadorId <= 0) {
        throw new AppError(400, "El ID del trabajador no es valido.");
      }
    }

    const solicitud = await solicitudesRepository.buscarPorId(idSolicitud);

    if (!solicitud) {
      throw new AppError(404, "No se encontro la solicitud");
    }

    if (solicitud.estado !== "PENDIENTE") {
      throw new AppError(
        409,
        "Solo se puede asignar trabajadores a solicitudes pendientes",
      );
    }

    if (trabajadorId !== null) {
      const trabajador = await solicitudesRepository.buscarTrabajadorConServicio(
        trabajadorId,
        solicitud.servicio_id,
      );

      if (!trabajador) {
        throw new AppError(404, "No se encontro el trabajador");
      }

      if (trabajador.estado !== "ACTIVO") {
        throw new AppError(409, "El trabajador no esta activo");
      }

      if (trabajador.trabajador_servicios.length === 0) {
        throw new AppError(
          400,
          "El trabajador no tiene asignada la especialidad de este servicio",
        );
      }
    }

    const actualizada = await solicitudesRepository.actualizarTrabajador(
      idSolicitud,
      trabajadorId,
    );

    return res.status(200).json({
      mensaje:
        trabajadorId === null
          ? "Se quito la asignacion del trabajador"
          : "Trabajador asignado correctamente",
      solicitudId: String(actualizada.id),
      trabajadorId:
        actualizada.trabajador_id === null
          ? null
          : String(actualizada.trabajador_id),
    });
  } catch (error) {
    next(error);
  }
}