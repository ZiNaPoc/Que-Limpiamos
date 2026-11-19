import { createContext, useContext, useState, type ReactNode } from "react";
import { crearSiguienteId } from "../utils/formato";
import { validarHorario } from "../utils/horarios";
import { buscarServiciosActivosDelTrabajador, buscarServiciosFueraDelHorario } from "../utils/reglasDeSolicitudes";
import { TRABAJADORES_DE_DEMOSTRACION } from "./trabajadores";
import type { DatosDeTrabajador, ResultadoDeOperacion, Solicitud, Trabajador } from "./tipos";

// Un mensaje de error por campo del formulario (solo trae los campos que tienen error).
export type ErroresDeTrabajador = Partial<Record<"nombre" | "telefono" | "correo" | "direccion" | "especialidades" | "horario", string>>;

const LONGITUD_MAXIMA_DE_TEXTO = 120;

const PATRON_DE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Deja solo los números de un texto (útil para comparar teléfonos sin espacios).
function soloDigitos(texto: string): string {
  return texto.replace(/\D/g, "");
}

// Quita espacios repetidos y los de los lados.
function normalizarEspacios(texto: string): string {
  return texto.replace(/\s+/g, " ").trim();
}

// Escribe el teléfono como "998 123 4567".
export function formatearTelefono(texto: string): string {
  const digitos = soloDigitos(texto);
  return `${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6)}`;
}

// Revisa los datos del formulario y devuelve un error por campo. 
// Reglas: nombre (3 a 120 letras), teléfono de 10 dígitos sin repetir, correo válido sin repetir, dirección (5 a 120), al menos una especialidad y horario válido.
export function validarTrabajador(datos: DatosDeTrabajador, trabajadores: Trabajador[], idDelTrabajadorEditado: string | null): ErroresDeTrabajador {
  const errores: ErroresDeTrabajador = {};
  const nombre = datos.nombre.trim();
  const correo = datos.correo.trim().toLowerCase();
  const direccion = datos.direccion.trim();
  const digitosDelTelefono = soloDigitos(datos.telefono);
  const otrosTrabajadores = trabajadores.filter((trabajador) => trabajador.id !== idDelTrabajadorEditado);

  if (nombre.length < 3) {
    errores.nombre = "Escribe el nombre completo del colaborador.";
  } else if (nombre.length > LONGITUD_MAXIMA_DE_TEXTO) {
    errores.nombre = `Usa como máximo ${LONGITUD_MAXIMA_DE_TEXTO} caracteres.`;
  }

  if (digitosDelTelefono.length !== 10) {
    errores.telefono = "Escribe un teléfono de 10 dígitos.";
  } else if (otrosTrabajadores.some((trabajador) => soloDigitos(trabajador.telefono) === digitosDelTelefono)) {
    errores.telefono = "Ya hay un colaborador registrado con este teléfono.";
  }

  if (!PATRON_DE_CORREO.test(correo)) {
    errores.correo = "Escribe un correo válido, por ejemplo nombre@ejemplo.com.";
  } else if (otrosTrabajadores.some((trabajador) => trabajador.correo.toLowerCase() === correo)) {
    errores.correo = "Ya hay un colaborador registrado con este correo.";
  }

  if (direccion.length < 5) {
    errores.direccion = "Escribe la dirección del colaborador.";
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

// Limpia espacios y formato antes de guardar (nombre, teléfono, correo en minúsculas, días ordenados).
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

// Lo que ofrece este almacén: la lista de colaboradores y las 3 acciones para gestionarlos.
type ValorDelContextoDeTrabajadores = {
  trabajadores: Trabajador[];
  agregarTrabajador: (datos: DatosDeTrabajador) => ResultadoDeOperacion;
  editarTrabajador: (idDelTrabajador: string, datos: DatosDeTrabajador, solicitudes: Solicitud[]) => ResultadoDeOperacion;
  cambiarEstadoDelTrabajador: (idDelTrabajador: string, solicitudes: Solicitud[]) => ResultadoDeOperacion;
};

const TrabajadoresContext = createContext<ValorDelContextoDeTrabajadores | null>(null);

// Respuesta lista para cuando el formulario tiene errores.
const DATOS_INVALIDOS: ResultadoDeOperacion = { exito: false, mensaje: "Revisa los datos marcados antes de guardar." };

// Guarda la lista de colaboradores.
export function TrabajadoresProvider({ children }: { children: ReactNode }) {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>(TRABAJADORES_DE_DEMOSTRACION);

  // valida, crea el id siguiente (W-05, W-06...) y lo deja Activo.
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
      estado: "Activo",
    };
    setTrabajadores((trabajadoresActuales) => [...trabajadoresActuales, nuevoTrabajador]);
    return { exito: true, mensaje: `${nuevoTrabajador.nombre} se añadió como ${nuevoTrabajador.id}.` };
  }

  // valida los datos y revisa que el nuevo horario no deje fuera servicios ya acordados (pendientes o confirmados).
  function editarTrabajador(idDelTrabajador: string, datos: DatosDeTrabajador, solicitudes: Solicitud[]): ResultadoDeOperacion {
    const trabajadorOriginal = trabajadores.find((trabajador) => trabajador.id === idDelTrabajador);
    if (!trabajadorOriginal) {
      return { exito: false, mensaje: "No se encontró al colaborador." };
    }
    if (Object.keys(validarTrabajador(datos, trabajadores, idDelTrabajador)).length > 0) {
      return DATOS_INVALIDOS;
    }
    const serviciosAfectados = buscarServiciosFueraDelHorario(solicitudes, idDelTrabajador, datos.horario);
    if (serviciosAfectados.length > 0) {
      const ids = serviciosAfectados.map((solicitud) => solicitud.id).join(", ");
      return { exito: false, mensaje: `El nuevo horario deja fuera servicios ya acordados (${ids}). Reasígnalos o cancélalos primero.` };
    }
    const trabajadorActualizado: Trabajador = { id: idDelTrabajador, ...normalizarDatos(datos), estado: trabajadorOriginal.estado };
    setTrabajadores((trabajadoresActuales) => trabajadoresActuales.map((trabajador) => (trabajador.id === idDelTrabajador ? trabajadorActualizado : trabajador)));
    return { exito: true, mensaje: `Datos de ${trabajadorActualizado.nombre} actualizados.` };
  }

  // ACTIVAR / DESACTIVAR: un colaborador con servicios por atender no se puede desactivar.
  // Un colaborador inactivo no recibe solicitudes ni aparece en la app del cliente.
  function cambiarEstadoDelTrabajador(idDelTrabajador: string, solicitudes: Solicitud[]): ResultadoDeOperacion {
    const trabajador = trabajadores.find((trabajadorBuscado) => trabajadorBuscado.id === idDelTrabajador);
    if (!trabajador) {
      return { exito: false, mensaje: "No se encontró al colaborador." };
    }
    if (trabajador.estado === "Activo") {
      const serviciosActivos = buscarServiciosActivosDelTrabajador(solicitudes, idDelTrabajador);
      if (serviciosActivos.length > 0) {
        const ids = serviciosActivos.map((solicitud) => solicitud.id).join(", ");
        return { exito: false, mensaje: `${trabajador.nombre} tiene servicios por atender (${ids}). Reasígnalos o cancélalos antes de desactivarlo.` };
      }
    }
    const estadoNuevo = trabajador.estado === "Activo" ? "Inactivo" : "Activo";
    setTrabajadores((trabajadoresActuales) => trabajadoresActuales.map((trabajadorActual) => (trabajadorActual.id === idDelTrabajador ? { ...trabajadorActual, estado: estadoNuevo } : trabajadorActual)));
    if (estadoNuevo === "Activo") {
      return { exito: true, mensaje: `${trabajador.nombre} vuelve a recibir solicitudes.` };
    }
    return { exito: true, mensaje: `${trabajador.nombre} ya no recibirá solicitudes ni aparecerá en la app.` };
  }

  return <TrabajadoresContext.Provider value={{ trabajadores, agregarTrabajador, editarTrabajador, cambiarEstadoDelTrabajador }}>{children}</TrabajadoresContext.Provider>;
}

// Hook para usar los colaboradores en cualquier pantalla 
export function useTrabajadores(): ValorDelContextoDeTrabajadores {
  const valor = useContext(TrabajadoresContext);
  if (!valor) {
    throw new Error("useTrabajadores debe usarse dentro de TrabajadoresProvider");
  }
  return valor;
}
