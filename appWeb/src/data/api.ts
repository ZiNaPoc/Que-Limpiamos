const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost/3000';

export async function apiFetch<T>(
    ruta:string,
    opciones: RequestInit= {},
): Promise<T> {
    const headers = new Headers(opciones.headers);

    if(opciones.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const respuesta = await fetch(`${API_URL}${ruta}`, {
        ...opciones,
        headers,
        credentials: "include",
    });

    const texto = await respuesta.text();

    let datos: Record<string, unknown> = {};

    try{
        datos = texto.trim() ? JSON.parse(texto) as Record<string, unknown> : {};
    } catch {
        const mensaje =
        typeof datos.mensaje === "string"
            ? datos.mensaje
            : 'No se pudo completar la operacion';
        throw new Error(mensaje)
    }

    return datos as T;
}