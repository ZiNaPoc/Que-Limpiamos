export const TAMANO_MAXIMO_DE_ARCHIVO_EN_BYTES = 5 * 1024 * 1024;

export const TIPOS_DE_FOTOGRAFIA_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
export const TIPOS_DE_DOCUMENTO_PERMITIDOS = ["application/pdf", "image/jpeg", "image/png"];

const NOMBRE_LEGIBLE_POR_TIPO: Record<string, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "application/pdf": "PDF",
};

function empiezaCon(bytes: Uint8Array, firma: number[], desplazamiento = 0): boolean {
  return firma.every((valor, indice) => bytes[desplazamiento + indice] === valor);
}

const COMPROBACION_DE_CONTENIDO_POR_TIPO: Record<string, (bytes: Uint8Array) => boolean> = {
  "image/jpeg": (bytes) => empiezaCon(bytes, [0xff, 0xd8, 0xff]),
  "image/png": (bytes) => empiezaCon(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  "image/webp": (bytes) => empiezaCon(bytes, [0x52, 0x49, 0x46, 0x46]) && empiezaCon(bytes, [0x57, 0x45, 0x42, 0x50], 8),
  "application/pdf": (bytes) => empiezaCon(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]),
};

export function describirTiposPermitidos(tiposPermitidos: string[]): string {
  const nombres = tiposPermitidos.map((tipo) => NOMBRE_LEGIBLE_POR_TIPO[tipo]);
  if (nombres.length === 1) {
    return nombres[0];
  }
  return `${nombres.slice(0, -1).join(", ")} o ${nombres[nombres.length - 1]}`;
}

export function formatearTamanoDeArchivo(tamanoEnBytes: number): string {
  if (tamanoEnBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(tamanoEnBytes / 1024))} KB`;
  }
  return `${(tamanoEnBytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function leerPrimerosBytes(archivo: File, cantidad: number): Promise<Uint8Array> {
  const fragmento = await archivo.slice(0, cantidad).arrayBuffer();
  return new Uint8Array(fragmento);
}

function comprobarQueLaImagenSePuedeAbrir(url: string): Promise<boolean> {
  return new Promise((resolver) => {
    const imagen = new Image();
    imagen.onload = () => resolver(imagen.naturalWidth > 0 && imagen.naturalHeight > 0);
    imagen.onerror = () => resolver(false);
    imagen.src = url;
  });
}

export async function validarArchivo(archivo: File, tiposPermitidos: string[]): Promise<string | null> {
  const tiposLegibles = describirTiposPermitidos(tiposPermitidos);
  if (!tiposPermitidos.includes(archivo.type)) {
    return `«${archivo.name}» no es un archivo ${tiposLegibles}.`;
  }
  if (archivo.size === 0) {
    return `«${archivo.name}» está vacío.`;
  }
  if (archivo.size > TAMANO_MAXIMO_DE_ARCHIVO_EN_BYTES) {
    return `«${archivo.name}» pesa ${formatearTamanoDeArchivo(archivo.size)}. El máximo es ${formatearTamanoDeArchivo(TAMANO_MAXIMO_DE_ARCHIVO_EN_BYTES)}.`;
  }
  try {
    const primerosBytes = await leerPrimerosBytes(archivo, 16);
    if (!COMPROBACION_DE_CONTENIDO_POR_TIPO[archivo.type](primerosBytes)) {
      return `El contenido de «${archivo.name}» no corresponde a un archivo ${NOMBRE_LEGIBLE_POR_TIPO[archivo.type]}.`;
    }
  } catch {
    return `No se pudo leer «${archivo.name}».`;
  }
  return null;
}

export async function prepararFotografia(archivo: File): Promise<{ url: string } | { error: string }> {
  const error = await validarArchivo(archivo, TIPOS_DE_FOTOGRAFIA_PERMITIDOS);
  if (error) {
    return { error };
  }
  const url = URL.createObjectURL(archivo);
  const sePuedeAbrir = await comprobarQueLaImagenSePuedeAbrir(url);
  if (!sePuedeAbrir) {
    URL.revokeObjectURL(url);
    return { error: `«${archivo.name}» no se pudo procesar como imagen.` };
  }
  return { url };
}
