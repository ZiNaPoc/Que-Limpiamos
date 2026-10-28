import { createContext, useContext, useState, type ReactNode } from "react";
import { crearReportesDeDemostracion } from "./reportesDemo";
import { useSolicitudes } from "./SolicitudesContext";
import type { EstadoDeReporte, Reporte, ResultadoDeOperacion } from "./tipos";

export const ESTADOS_DE_REPORTE: EstadoDeReporte[] = ["Pendiente", "En revisión", "Resuelto"];
export const LONGITUD_MAXIMA_DE_LA_SOLUCION = 1000;

function rechazar(mensaje: string): ResultadoDeOperacion {
  return { exito: false, mensaje };
}

export function validarSolucion(reporte: Reporte, solucion: string): ResultadoDeOperacion {
  if (reporte.estado === "Resuelto") {
    return rechazar("El reporte ya está cerrado y no se puede modificar.");
  }
  const solucionLimpia = solucion.trim();
  if (solucionLimpia === "") {
    return rechazar("Escribe la solución o el seguimiento del reporte.");
  }
  if (solucionLimpia.length > LONGITUD_MAXIMA_DE_LA_SOLUCION) {
    return rechazar(`Usa como máximo ${LONGITUD_MAXIMA_DE_LA_SOLUCION} caracteres.`);
  }
  return { exito: true, mensaje: "" };
}

type ValorDelContextoDeReportes = {
  reportes: Reporte[];
  guardarSolucion: (folio: string, solucion: string) => ResultadoDeOperacion;
  cerrarReporte: (folio: string, solucion: string) => ResultadoDeOperacion;
};

const ReportesContext = createContext<ValorDelContextoDeReportes | null>(null);

export function ReportesProvider({ children }: { children: ReactNode }) {
  const { solicitudes } = useSolicitudes();
  const [reportes, setReportes] = useState<Reporte[]>(() => crearReportesDeDemostracion(solicitudes));

  function actualizarReporte(reporteActualizado: Reporte) {
    setReportes((reportesActuales) => reportesActuales.map((reporte) => (reporte.folio === reporteActualizado.folio ? reporteActualizado : reporte)));
  }

  function guardarSolucion(folio: string, solucion: string): ResultadoDeOperacion {
    const reporte = reportes.find((reporteBuscado) => reporteBuscado.folio === folio);
    if (!reporte) {
      return rechazar("No se encontró el reporte.");
    }
    const validacion = validarSolucion(reporte, solucion);
    if (!validacion.exito) {
      return validacion;
    }
    const solucionLimpia = solucion.trim();
    if (solucionLimpia === reporte.solucion && reporte.estado !== "Pendiente") {
      return rechazar("No había cambios por guardar.");
    }
    actualizarReporte({ ...reporte, solucion: solucionLimpia, estado: "En revisión" });
    return { exito: true, mensaje: "Seguimiento guardado en esta sesión. El reporte quedó en revisión." };
  }

  function cerrarReporte(folio: string, solucion: string): ResultadoDeOperacion {
    const reporte = reportes.find((reporteBuscado) => reporteBuscado.folio === folio);
    if (!reporte) {
      return rechazar("No se encontró el reporte.");
    }
    const validacion = validarSolucion(reporte, solucion);
    if (!validacion.exito) {
      return validacion;
    }
    actualizarReporte({ ...reporte, solucion: solucion.trim(), estado: "Resuelto" });
    return { exito: true, mensaje: "Reporte cerrado en esta sesión de demostración." };
  }

  return <ReportesContext.Provider value={{ reportes, guardarSolucion, cerrarReporte }}>{children}</ReportesContext.Provider>;
}

export function useReportes(): ValorDelContextoDeReportes {
  const valor = useContext(ReportesContext);
  if (!valor) {
    throw new Error("useReportes debe usarse dentro de ReportesProvider");
  }
  return valor;
}
