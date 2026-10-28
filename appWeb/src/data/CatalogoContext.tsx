import { createContext, useContext, useState, type ReactNode } from "react";
import { crearSiguienteId, normalizarTexto } from "../utils/formato";
import { SERVICIOS_DE_DEMOSTRACION } from "./catalogoDemo";
import type { CategoriaDeServicio, DatosDeServicio, ResultadoDeOperacion, ServicioDelCatalogo } from "./tipos";

export const CATEGORIAS_DE_SERVICIO: { valor: CategoriaDeServicio; etiqueta: string }[] = [
  { valor: "Principal", etiqueta: "Servicio principal" },
  { valor: "Extra", etiqueta: "Servicio extra" },
];

export type BorradorDeServicio = {
  nombre: string;
  descripcion: string;
  precioBase: string;
  costoPorMetroCuadrado: string;
  costoPorHabitacion: string;
  categoria: string;
};

export type ErroresDelServicio = Partial<Record<keyof BorradorDeServicio, string>>;

export const BORRADOR_DE_SERVICIO_VACIO: BorradorDeServicio = {
  nombre: "",
  descripcion: "",
  precioBase: "",
  costoPorMetroCuadrado: "",
  costoPorHabitacion: "",
  categoria: "",
};

const LONGITUD_MAXIMA_DEL_NOMBRE = 60;
const LONGITUD_MAXIMA_DE_LA_DESCRIPCION = 240;
const MONTO_MAXIMO = 100000;

export function crearBorradorDesdeServicio(servicio: ServicioDelCatalogo): BorradorDeServicio {
  return {
    nombre: servicio.nombre,
    descripcion: servicio.descripcion,
    precioBase: String(servicio.precioBase),
    costoPorMetroCuadrado: String(servicio.costoPorMetroCuadrado),
    costoPorHabitacion: String(servicio.costoPorHabitacion),
    categoria: servicio.categoria,
  };
}

function validarMonto(texto: string, puedeSerCero: boolean): string | undefined {
  const textoLimpio = texto.trim();
  const monto = Number(textoLimpio);
  if (textoLimpio === "" || !Number.isFinite(monto)) {
    return "Escribe una cantidad en pesos.";
  }
  if (monto < 0) {
    return "La cantidad no puede ser negativa.";
  }
  if (monto === 0 && !puedeSerCero) {
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

function esCategoriaValida(categoria: string): categoria is CategoriaDeServicio {
  return CATEGORIAS_DE_SERVICIO.some((opcion) => opcion.valor === categoria);
}

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

  const errorDelPrecioBase = validarMonto(borrador.precioBase, false);
  if (errorDelPrecioBase) {
    errores.precioBase = errorDelPrecioBase;
  }
  const errorDelCostoPorMetro = validarMonto(borrador.costoPorMetroCuadrado, true);
  if (errorDelCostoPorMetro) {
    errores.costoPorMetroCuadrado = errorDelCostoPorMetro;
  }
  const errorDelCostoPorHabitacion = validarMonto(borrador.costoPorHabitacion, true);
  if (errorDelCostoPorHabitacion) {
    errores.costoPorHabitacion = errorDelCostoPorHabitacion;
  }

  if (!esCategoriaValida(borrador.categoria)) {
    errores.categoria = "Elige una categoría.";
  }
  return errores;
}

function convertirBorradorEnDatos(borrador: BorradorDeServicio): DatosDeServicio {
  let categoria: CategoriaDeServicio = "Principal";
  if (esCategoriaValida(borrador.categoria)) {
    categoria = borrador.categoria;
  }
  return {
    nombre: borrador.nombre.replace(/\s+/g, " ").trim(),
    descripcion: borrador.descripcion.replace(/\s+/g, " ").trim(),
    precioBase: Number(borrador.precioBase),
    costoPorMetroCuadrado: Number(borrador.costoPorMetroCuadrado),
    costoPorHabitacion: Number(borrador.costoPorHabitacion),
    categoria,
  };
}

type ValorDelContextoDelCatalogo = {
  servicios: ServicioDelCatalogo[];
  registrarServicio: (borrador: BorradorDeServicio) => ResultadoDeOperacion;
  editarServicio: (idDelServicio: string, borrador: BorradorDeServicio) => ResultadoDeOperacion;
};

const CatalogoContext = createContext<ValorDelContextoDelCatalogo | null>(null);

const MENSAJE_DE_DATOS_INVALIDOS: ResultadoDeOperacion = { exito: false, mensaje: "Revisa los datos marcados antes de guardar." };

export function CatalogoProvider({ children }: { children: ReactNode }) {
  const [servicios, setServicios] = useState<ServicioDelCatalogo[]>(SERVICIOS_DE_DEMOSTRACION);

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
    return { exito: true, mensaje: `«${nuevoServicio.nombre}» se registró en el catálogo de esta sesión de demostración.` };
  }

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
    return { exito: true, mensaje: "Cambios aplicados al catálogo de esta sesión. Las solicitudes existentes conservan sus condiciones." };
  }

  return <CatalogoContext.Provider value={{ servicios, registrarServicio, editarServicio }}>{children}</CatalogoContext.Provider>;
}

export function useCatalogo(): ValorDelContextoDelCatalogo {
  const valor = useContext(CatalogoContext);
  if (!valor) {
    throw new Error("useCatalogo debe usarse dentro de CatalogoProvider");
  }
  return valor;
}
