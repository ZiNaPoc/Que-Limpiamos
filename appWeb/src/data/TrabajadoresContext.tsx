import { createContext, useContext, useState, type ReactNode } from "react";
import { crearSiguienteId } from "../utils/formato";
import { TRABAJADORES_DE_DEMOSTRACION } from "./trabajadores";
import type { DatosDeNuevoTrabajador, ResultadoDeOperacion, Trabajador } from "./tipos";

export type ErroresDeNuevoTrabajador = Partial<Record<"nombre" | "telefono" | "correo" | "direccion", string>>;

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

export function validarNuevoTrabajador(datos: DatosDeNuevoTrabajador, trabajadores: Trabajador[]): ErroresDeNuevoTrabajador {
  const errores: ErroresDeNuevoTrabajador = {};
  const nombre = datos.nombre.trim();
  const correo = datos.correo.trim().toLowerCase();
  const direccion = datos.direccion.trim();
  const digitosDelTelefono = soloDigitos(datos.telefono);

  if (nombre.length < 3) {
    errores.nombre = "Escribe el nombre completo del trabajador.";
  } else if (nombre.length > LONGITUD_MAXIMA_DE_TEXTO) {
    errores.nombre = `Usa como máximo ${LONGITUD_MAXIMA_DE_TEXTO} caracteres.`;
  }

  if (digitosDelTelefono.length !== 10) {
    errores.telefono = "Escribe un teléfono de 10 dígitos.";
  } else if (trabajadores.some((trabajador) => soloDigitos(trabajador.telefono) === digitosDelTelefono)) {
    errores.telefono = "Ya hay un trabajador registrado con este teléfono.";
  }

  if (!PATRON_DE_CORREO.test(correo)) {
    errores.correo = "Escribe un correo válido, por ejemplo nombre@ejemplo.com.";
  } else if (trabajadores.some((trabajador) => trabajador.correo.toLowerCase() === correo)) {
    errores.correo = "Ya hay un trabajador registrado con este correo.";
  }

  if (direccion.length < 5) {
    errores.direccion = "Escribe la dirección del trabajador.";
  } else if (direccion.length > LONGITUD_MAXIMA_DE_TEXTO) {
    errores.direccion = `Usa como máximo ${LONGITUD_MAXIMA_DE_TEXTO} caracteres.`;
  }

  return errores;
}

type ValorDelContextoDeTrabajadores = {
  trabajadores: Trabajador[];
  agregarTrabajador: (datos: DatosDeNuevoTrabajador) => ResultadoDeOperacion;
};

const TrabajadoresContext = createContext<ValorDelContextoDeTrabajadores | null>(null);

export function TrabajadoresProvider({ children }: { children: ReactNode }) {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>(TRABAJADORES_DE_DEMOSTRACION);

  function agregarTrabajador(datos: DatosDeNuevoTrabajador): ResultadoDeOperacion {
    const errores = validarNuevoTrabajador(datos, trabajadores);
    if (Object.keys(errores).length > 0) {
      return { exito: false, mensaje: "Revisa los datos marcados antes de añadir al trabajador." };
    }
    const nuevoTrabajador: Trabajador = {
      id: crearSiguienteId(
        trabajadores.map((trabajador) => trabajador.id),
        "W",
        2,
      ),
      nombre: normalizarEspacios(datos.nombre),
      telefono: formatearTelefono(datos.telefono),
      correo: datos.correo.trim().toLowerCase(),
      direccion: normalizarEspacios(datos.direccion),
      calificacion: null,
      estado: "Disponible",
      documentosEntregados: [...datos.documentosEntregados],
    };
    setTrabajadores((trabajadoresActuales) => [...trabajadoresActuales, nuevoTrabajador]);
    return { exito: true, mensaje: `${nuevoTrabajador.nombre} se añadió como ${nuevoTrabajador.id} en esta sesión de demostración.` };
  }

  return <TrabajadoresContext.Provider value={{ trabajadores, agregarTrabajador }}>{children}</TrabajadoresContext.Provider>;
}

export function useTrabajadores(): ValorDelContextoDeTrabajadores {
  const valor = useContext(TrabajadoresContext);
  if (!valor) {
    throw new Error("useTrabajadores debe usarse dentro de TrabajadoresProvider");
  }
  return valor;
}
