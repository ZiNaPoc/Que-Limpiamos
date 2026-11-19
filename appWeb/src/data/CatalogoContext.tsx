import { createContext, useContext, useState, type ReactNode } from "react";
import { crearSiguienteId, normalizarTexto } from "../utils/formato";
import { SERVICIOS_DE_DEMOSTRACION } from "./catalogoDemo";
import type { DatosDeServicio, ResultadoDeOperacion, ServicioDelCatalogo } from "./tipos";

// Lo que se está escribiendo en el formulario. El precio es texto porque así lo entrega la caja de texto; se convierte a número al guardar.
export type BorradorDeServicio = {
  nombre: string;
  descripcion: string;
  precioBase: string;
};

// Un mensaje de error por campo del formulario.
export type ErroresDelServicio = Partial<Record<keyof BorradorDeServicio, string>>;

// Formulario en blanco para "Agregar servicio".
export const BORRADOR_DE_SERVICIO_VACIO: BorradorDeServicio = {
  nombre: "",
  descripcion: "",
  precioBase: "",
};

// Límites que acepta el formulario: nombre, descripción y precio.
const LONGITUD_MAXIMA_DEL_NOMBRE = 60;
const LONGITUD_MAXIMA_DE_LA_DESCRIPCION = 240;
const MONTO_MAXIMO = 100000;
// Ojo: en CatalogoPage las cajas de texto dejan escribir hasta 80 caracteres (nombre) y 300 (descripción), pero los límites que de verdad se validan son los de arriba (60 y 240). El back debe usar estos.

// Convierte un servicio existente en el formulario de "Editar" (el precio pasa a texto).
export function crearBorradorDesdeServicio(servicio: ServicioDelCatalogo): BorradorDeServicio {
  return {
    nombre: servicio.nombre,
    descripcion: servicio.descripcion,
    precioBase: String(servicio.precioBase),
  };
}

// Revisa el precio: número, mayor a 0, máximo $100,000 y hasta 2 decimales. Devuelve el error o undefined si está bien.
function validarMonto(texto: string): string | undefined {
  const textoLimpio = texto.trim();
  const monto = Number(textoLimpio);
  if (textoLimpio === "" || !Number.isFinite(monto)) {
    return "Escribe una cantidad en pesos.";
  }
  if (monto < 0) {
    return "La cantidad no puede ser negativa.";
  }
  if (monto === 0) {
    return "La cantidad debe ser mayor a cero.";
  }
  if (monto > MONTO_MAXIMO) {
    return "La cantidad no puede superar $100,000.";
  }
  if (Math.round(monto * 100) !== monto * 100) {
    return "Usa como máximo dos decimales.";
  }
  return undefined;
}

// Revisa el formulario del servicio. El nombre no puede repetirse (ni con otras mayúsculas o acentos)
export function validarServicio(borrador: BorradorDeServicio, servicios: ServicioDelCatalogo[], idDelServicioEditado: string | null): ErroresDelServicio {
  const errores: ErroresDelServicio = {};
  const nombre = borrador.nombre.trim();
  const descripcion = borrador.descripcion.trim();

  if (nombre.length < 3) {
    errores.nombre = "Escribe el nombre del servicio.";
  } else if (nombre.length > LONGITUD_MAXIMA_DEL_NOMBRE) {
    errores.nombre = `Usa como máximo ${LONGITUD_MAXIMA_DEL_NOMBRE} caracteres.`;
  } else {
    const nombreNormalizado = normalizarTexto(nombre);
    const servicioConElMismoNombre = servicios.find((servicio) => servicio.id !== idDelServicioEditado && normalizarTexto(servicio.nombre) === nombreNormalizado);
    if (servicioConElMismoNombre) {
      errores.nombre = `Ya existe un servicio con este nombre (${servicioConElMismoNombre.id}).`;
    }
  }

  if (descripcion.length < 5) {
    errores.descripcion = "Escribe una descripción breve del servicio.";
  } else if (descripcion.length > LONGITUD_MAXIMA_DE_LA_DESCRIPCION) {
    errores.descripcion = `Usa como máximo ${LONGITUD_MAXIMA_DE_LA_DESCRIPCION} caracteres.`;
  }

  const errorDelPrecioBase = validarMonto(borrador.precioBase);
  if (errorDelPrecioBase) {
    errores.precioBase = errorDelPrecioBase;
  }
  return errores;
}

// Limpia espacios y convierte el precio a número para guardar.
function convertirBorradorEnDatos(borrador: BorradorDeServicio): DatosDeServicio {
  return {
    nombre: borrador.nombre.replace(/\s+/g, " ").trim(),
    descripcion: borrador.descripcion.replace(/\s+/g, " ").trim(),
    precioBase: Number(borrador.precioBase),
  };
}

// Lo que ofrece este almacén: la lista de servicios y las 3 acciones para gestionarlos.
type ValorDelContextoDelCatalogo = {
  servicios: ServicioDelCatalogo[];
  registrarServicio: (borrador: BorradorDeServicio) => ResultadoDeOperacion;
  editarServicio: (idDelServicio: string, borrador: BorradorDeServicio) => ResultadoDeOperacion;
  cambiarEstadoDelServicio: (idDelServicio: string) => ResultadoDeOperacion;
};

const CatalogoContext = createContext<ValorDelContextoDelCatalogo | null>(null);

// Respuesta lista para cuando el formulario tiene errores.
const MENSAJE_DE_DATOS_INVALIDOS: ResultadoDeOperacion = { exito: false, mensaje: "Revisa los datos marcados antes de guardar." };

// Guarda el catálogo de servicios, que es lo que el cliente ve en la app móvil (solo los Activos).
// Un servicio nunca se borra, solo se desactiva, porque las solicitudes que ya existen lo siguen usando.
// Editar el precio de un servicio no debe cambiar el de las solicitudes que ya existen
export function CatalogoProvider({ children }: { children: ReactNode }) {
  const [servicios, setServicios] = useState<ServicioDelCatalogo[]>(SERVICIOS_DE_DEMOSTRACION);

  // valida, crea el id siguiente (C-07...) y lo deja Activo.
  function registrarServicio(borrador: BorradorDeServicio): ResultadoDeOperacion {
    if (Object.keys(validarServicio(borrador, servicios, null)).length > 0) {
      return MENSAJE_DE_DATOS_INVALIDOS;
    }
    const nuevoServicio: ServicioDelCatalogo = {
      id: crearSiguienteId(
        servicios.map((servicio) => servicio.id),
        "C",
        2,
      ),
      ...convertirBorradorEnDatos(borrador),
      estado: "Activo",
    };
    setServicios((serviciosActuales) => [...serviciosActuales, nuevoServicio]);
    return { exito: true, mensaje: `«${nuevoServicio.nombre}» se registró en el catálogo.` };
  }

  // cambia nombre, descripción o precio. Las solicitudes que ya existen conservan su precio y condiciones.
  function editarServicio(idDelServicio: string, borrador: BorradorDeServicio): ResultadoDeOperacion {
    const servicioOriginal = servicios.find((servicio) => servicio.id === idDelServicio);
    if (!servicioOriginal) {
      return { exito: false, mensaje: "No se encontró el servicio." };
    }
    if (Object.keys(validarServicio(borrador, servicios, idDelServicio)).length > 0) {
      return MENSAJE_DE_DATOS_INVALIDOS;
    }
    const servicioActualizado: ServicioDelCatalogo = { ...servicioOriginal, ...convertirBorradorEnDatos(borrador) };
    setServicios((serviciosActuales) => serviciosActuales.map((servicio) => (servicio.id === idDelServicio ? servicioActualizado : servicio)));
    return { exito: true, mensaje: "Cambios aplicados al catálogo. Las solicitudes existentes conservan sus condiciones." };
  }

  // ACTIVAR / DESACTIVAR: un servicio inactivo deja de mostrarse en la app, pero las solicitudes que ya lo usan no cambian.
  function cambiarEstadoDelServicio(idDelServicio: string): ResultadoDeOperacion {
    const servicio = servicios.find((servicioBuscado) => servicioBuscado.id === idDelServicio);
    if (!servicio) {
      return { exito: false, mensaje: "No se encontró el servicio." };
    }
    const estadoNuevo = servicio.estado === "Activo" ? "Inactivo" : "Activo";
    setServicios((serviciosActuales) => serviciosActuales.map((servicioActual) => (servicioActual.id === idDelServicio ? { ...servicioActual, estado: estadoNuevo } : servicioActual)));
    if (estadoNuevo === "Activo") {
      return { exito: true, mensaje: `«${servicio.nombre}» vuelve a mostrarse en la app.` };
    }
    return { exito: true, mensaje: `«${servicio.nombre}» ya no se mostrará en la app.` };
  }

  return <CatalogoContext.Provider value={{ servicios, registrarServicio, editarServicio, cambiarEstadoDelServicio }}>{children}</CatalogoContext.Provider>;
}

// Hook para usar el catálogo en cualquier pantalla.
export function useCatalogo(): ValorDelContextoDelCatalogo {
  const valor = useContext(CatalogoContext);
  if (!valor) {
    throw new Error("useCatalogo debe usarse dentro de CatalogoProvider");
  }
  return valor;
}
