import { useState, useEffect, useCallback, type ReactNode } from "react";

import { apiFetch } from "./api";
import { SolicitudesContext } from "./SolicitudesContext";

import type { ResultadoDeOperacion, SolicitudListado } from "./tipos";

type RespuestaDeSolicitudes = {
  total: number;
  solicitudes: SolicitudListado[];
};

export function SolicitudesProvider({ children }: { children: ReactNode }) {
  const [solicitudes, setSolicitudes] = useState<SolicitudListado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const recargarSolicitudes = useCallback(async () => {
    setCargando(true);
    setErrorCarga(null);

    try {
      const datos = await apiFetch<RespuestaDeSolicitudes>(
        "/api/admin/solicitudes",
      );

      setSolicitudes(datos.solicitudes);
    } catch (error) {
      setErrorCarga(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las solicitudes",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      if (!activo) return;
      await recargarSolicitudes();
    };
    void cargar();
    return () => {
      activo = false;
    };
  }, [recargarSolicitudes]);

  const cambiarTrabajadorAsignado = useCallback(
    async (
      idSolicitud: string,
      idTrabajadorNuevo: string | null,
    ): Promise<ResultadoDeOperacion> => {
      try {
        let trabajadorId: number | null = null;

        if (idTrabajadorNuevo !== null) {
          trabajadorId = Number(idTrabajadorNuevo);

          if (!Number.isSafeInteger(trabajadorId) || trabajadorId <= 0) {
            return {
              exito: false,
              mensaje: "El ID del trabajador no es valido",
            };
          }
        }

        await apiFetch(
          `/api/admin/solicitudes/${encodeURIComponent(idSolicitud)}/asignacion`,
          {
            method: "PATCH",
            body: JSON.stringify({
              trabajadorId,
            }),
          },
        );

        await recargarSolicitudes();

        return {
          exito: true,
          mensaje: "Trabajador actualizado correctamente",
        };
      } catch (error) {
        return {
          exito: false,
          mensaje:
            error instanceof Error
              ? error.message
              : "No se pudo actualizar el trabajador",
        };
      }
    },
    [recargarSolicitudes],
  );

  return (
    <SolicitudesContext.Provider
      value={{
        solicitudes,
        cargando,
        errorCarga,
        recargarSolicitudes,
        cambiarTrabajadorAsignado,
      }}
    >
      {children}
    </SolicitudesContext.Provider>
  );
}
