import { createContext, useContext, useState, type ReactNode } from "react";
import { crearSiguienteId } from "../utils/formato";
import { validarHorario } from "../utils/horarios";
import { buscarServiciosFueraDelHorario } from "../utils/reglasDeSolicitudes";
import { TRABAJADORES_DE_DEMOSTRACION } from "./trabajadores";
import type { DatosDeTrabajador, ResultadoDeOperacion, Solicitud, Trabajador } from "./tipos";

// El administrador da de alta a los colaboradores y mantiene lo que la app muestra de ellos:
// especialidades y horario («Horario: 8:00am-3:00pm», «Lunes-Sábado 9:00am-6:00pm»).
// La reputación y el estado del día no se capturan: se calculan a partir de las solicitudes.

export type ErroresDeTrabajador = Partial<Record<"nombre" | "telefono" | "correo" | "direccion" | "especialidades" | "horario", string>>;

const LONGITUD_MAXIMA_DE_TEXTO = 120;
const PATRON_DE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function soloDigitos(texto: string): string {
  return texto.replace(/\D/g, "");
}

function normalizarEspacios(texto: string): string {
  return texto.replace(/\s+/g, " ").trim();
}

export function formatearTelefono(texto: string): string {
  const digitos = soloDigitos(texto);
  return `${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6)}`;
}

export function validarTrabajador(datos: DatosDeTrabajador, trabajadores: Trabajador[], idDelTrabajadorEditado: string | null): ErroresDeTrabajador {
  const errores: ErroresDeTrabajador = {};
  const nombre = datos.nombre.trim();
  const correo = datos.correo.trim().toLowerCase();
  const direccion = datos.direccion.trim();
  const digitosDelTelefono = soloDigitos(datos.telefono);
  const otrosTrabajadores = trabajadores.filter((trabajador) => trabajador.id !== idDelTrabajadorEditado);

  if (nombre.length < 3) {
    errores.nombre = "Escribe el nombre completo del trabajador.";
  } else if (nombre.length > LONGITUD_MAXIMA_DE_TEXTO) {
    errores.nombre = `Usa como máximo ${LONGITUD_MAXIMA_DE_TEXTO} caracteres.`;
  }

  if (digitosDelTelefono.length !== 10) {
    errores.telefono = "Escribe un teléfono de 10 dígitos.";
  } else if (otrosTrabajadores.some((trabajador) => soloDigitos(trabajador.telefono) === digitosDelTelefono)) {
    errores.telefono = "Ya hay un trabajador registrado con este teléfono.";
  }

  if (!PATRON_DE_CORREO.test(correo)) {
    errores.correo = "Escribe un correo válido, por ejemplo nombre@ejemplo.com.";
  } else if (otrosTrabajadores.some((trabajador) => trabajador.correo.toLowerCase() === correo)) {
    errores.correo = "Ya hay un trabajador registrado con este correo.";
  }

  if (direccion.length < 5) {
    errores.direccion = "Escribe la dirección del trabajador.";
  } else if (direccion.length > LONGITUD_MAXIMA_DE_TEXTO) {
    errores.direccion = `Usa como máximo ${LONGITUD_MAXIMA_DE_TEXTO} caracteres.`;
  }

  if (datos.especialidades.length === 0) {
    errores.especialidades = "Elige al menos una especialidad; la app las muestra en el perfil del colaborador.";
  }

  const errorDelHorario = validarHorario(datos.horario);
  if (errorDelHorario) {
    errores.horario = errorDelHorario;
  }

  return errores;
}

function normalizarDatos(datos: DatosDeTrabajador): DatosDeTrabajador {
  return {
    nombre: normalizarEspacios(datos.nombre),
    telefono: formatearTelefono(datos.telefono),
    correo: datos.correo.trim().toLowerCase(),
    direccion: normalizarEspacios(datos.direccion),
    especialidades: [...datos.especialidades],
    horario: { ...datos.horario, dias: [...datos.horario.dias].sort() },
    documentosEntregados: [...datos.documentosEntregados],
  };
}

type ValorDelContextoDeTrabajadores = {
  trabajadores: Trabajador[];
  agregarTrabajador: (datos: DatosDeTrabajador) => ResultadoDeOperacion;
  editarTrabajador: (idDelTrabajador: string, datos: DatosDeTrabajador, solicitudes: Solicitud[]) => ResultadoDeOperacion;
};

const TrabajadoresContext = createContext<ValorDelContextoDeTrabajadores | null>(null);

const DATOS_INVALIDOS: ResultadoDeOperacion = { exito: false, mensaje: "Revisa los datos marcados antes de guardar." };

export function TrabajadoresProvider({ children }: { children: ReactNode }) {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>(TRABAJADORES_DE_DEMOSTRACION);

  function agregarTrabajador(datos: DatosDeTrabajador): ResultadoDeOperacion {
    if (Object.keys(validarTrabajador(datos, trabajadores, null)).length > 0) {
      return DATOS_INVALIDOS;
    }
    const nuevoTrabajador: Trabajador = {
      id: crearSiguienteId(
        trabajadores.map((trabajador) => trabajador.id),
        "W",
        2,
      ),
      ...normalizarDatos(datos),
    };
    setTrabajadores((trabajadoresActuales) => [...trabajadoresActuales, nuevoTrabajador]);
    return { exito: true, mensaje: `${nuevoTrabajador.nombre} se añadió como ${nuevoTrabajador.id}.` };
  }

  function editarTrabajador(idDelTrabajador: string, datos: DatosDeTrabajador, solicitudes: Solicitud[]): ResultadoDeOperacion {
    const trabajadorOriginal = trabajadores.find((trabajador) => trabajador.id === idDelTrabajador);
    if (!trabajadorOriginal) {
      return { exito: false, mensaje: "No se encontró al trabajador." };
    }
    if (Object.keys(validarTrabajador(datos, trabajadores, idDelTrabajador)).length > 0) {
      return DATOS_INVALIDOS;
    }
    const serviciosAfectados = buscarServiciosFueraDelHorario(solicitudes, idDelTrabajador, datos.horario);
    if (serviciosAfectados.length > 0) {
      const ids = serviciosAfectados.map((solicitud) => solicitud.id).join(", ");
      return { exito: false, mensaje: `El nuevo horario deja fuera servicios ya acordados (${ids}). Reasígnalos o cancélalos primero.` };
    }
    const trabajadorActualizado: Trabajador = { id: idDelTrabajador, ...normalizarDatos(datos) };
    setTrabajadores((trabajadoresActuales) => trabajadoresActuales.map((trabajador) => (trabajador.id === idDelTrabajador ? trabajadorActualizado : trabajador)));
    return { exito: true, mensaje: `Datos de ${trabajadorActualizado.nombre} actualizados.` };
  }

  return <TrabajadoresContext.Provider value={{ trabajadores, agregarTrabajador, editarTrabajador }}>{children}</TrabajadoresContext.Provider>;
}

export function useTrabajadores(): ValorDelContextoDeTrabajadores {
  const valor = useContext(TrabajadoresContext);
  if (!valor) {
    throw new Error("useTrabajadores debe usarse dentro de TrabajadoresProvider");
  }
  return valor;
}
