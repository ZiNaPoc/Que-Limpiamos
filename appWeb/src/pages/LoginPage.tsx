import { useState } from "react";
import {  IMAGENES } from "../data/configuracion";
import type { Sesion } from "../data/tipos";
import { FormaOrganica } from "../components/comunes/FormasOrganicas";
import { Icono } from "../components/comunes/Icono";
import { ImagenOIlustracion } from "../components/comunes/Ilustraciones";

// Se escriben correo y contraseña - se envían al servidor - si son correctos, App guarda la sesión y abre el panel.

export function LoginPage({ onAccesoExitoso }: { onAccesoExitoso: (sesion: Sesion) => void }) {
  // Lo que se escribe en el formulario y el estado de la pantalla: mensaje de error, sacudida del formulario, ayuda de contraseña y ver/ocultar contraseña.
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensajeDeError, setMensajeDeError] = useState("");
  const [formularioVibrando, setFormularioVibrando] = useState(false);
  const [ayudaVisible, setAyudaVisible] = useState(false);
  const [contrasenaVisible, setContrasenaVisible] = useState(false);

  // Muestra el error y sacude el formulario (la sacudida se apaga sola al terminar la animación).
  function mostrarErrorDeAcceso(mensaje: string) {
    setMensajeDeError(mensaje);
    setFormularioVibrando(true);
  }

  // Valida los campos y envía el login al servidor.
  async function handleEnvioDelFormulario(evento: React.SubmitEvent<HTMLFormElement> ) {
    evento.preventDefault();
    setMensajeDeError("");

    // Campos vacíos: no se envía nada al servidor.
    if(!correo.trim() || !contrasena) {
      mostrarErrorDeAcceso("Completa tu correo y contraseña.");
      return;
    }

    try {
      // Petición al servidor con correo y contraseña. credentials: "include" permite que el navegador reciba y guarde la cookie de sesión.
      const respuesta = await fetch (
        `${import.meta.env.VITE_API_URL}/api/auth/admin/login`,
        {
          method: 'POST',
          headers: {
            "Content-Type" : "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            correo: correo.trim(),
            password: contrasena,
          }),
        }
      );

      // Si el servidor responde algo que no es JSON, esta línea falla y se cae al catch con el mensaje genérico.
      const datos = await respuesta.json();

      // Si el servidor rechaza el acceso (400, 401 o 403), se muestra el mensaje que mandó.
      if(!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se puedo iniciar sesion.');
      }

      // Acceso correcto: avisa a App con los datos del usuario; App guarda la sesión y abre el panel.
      onAccesoExitoso(datos.usuario);
    } catch(error) {
      mostrarErrorDeAcceso(
        error instanceof Error
        ? error.message
        : 'Ocurrio un error al iniciar sesion'
      );
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-5 pb-16 pt-32 sm:px-8">
      <FormaOrganica className="-left-40 top-20 h-[30rem] w-[30rem] text-sky/70" />
      <FormaOrganica className="-bottom-40 -right-32 h-[26rem] w-[26rem] text-moss/30" />

      <div className="relative mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
        <div className="rise hidden lg:block">
          <ImagenOIlustracion rutaDeImagen={IMAGENES.inicioDeSesion} textoAlternativo="Ilustración de un hogar limpio" ilustracionDeRespaldo="casa" className="arch mx-auto aspect-[3/4] max-w-sm shadow-lift" />
        </div>

        <div className={`rise leaf bg-navy p-7 text-white shadow-lift sm:p-10 ${formularioVibrando ? "shake" : ""}`} onAnimationEnd={() => setFormularioVibrando(false)} style={{ animationDelay: "100ms" }}>
          <h1 className="text-4xl font-extrabold">Acceso</h1>
          <p className="mt-2 text-sm text-sky">Entra al panel de administración con tu cuenta de la app.</p>

          <form onSubmit={handleEnvioDelFormulario} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="correo" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sky">
                Correo electrónico
              </label>
              <input id="correo" type="text" autoComplete="username" value={correo} onChange={(evento) => setCorreo(evento.target.value)} className="field" />
            </div>

            <div>
              <label htmlFor="contrasena" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sky">
                Contraseña
              </label>
              <div className="relative">
                <input id="contrasena" type={contrasenaVisible ? "text" : "password"} autoComplete="current-password" value={contrasena} onChange={(evento) => setContrasena(evento.target.value)} className="field pr-12" />
                <button type="button" onClick={() => setContrasenaVisible(!contrasenaVisible)} aria-label={contrasenaVisible ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={contrasenaVisible} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-slate transition duration-300 hover:bg-sky/50">
                  <Icono nombre="ojo" className="h-4 w-4" />
                </button>
              </div>
            </div>

            {mensajeDeError && (
              <p role="alert" className="pop rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-err">
                {mensajeDeError}
              </p>
            )}

            <button type="submit" className="btn btn-moss w-full">
              Acceder
            </button>

            <div className="text-center">
              <button type="button" onClick={() => setAyudaVisible(!ayudaVisible)} aria-expanded={ayudaVisible} className="cursor-pointer text-xs font-semibold text-sky underline underline-offset-4 transition duration-300 hover:text-white">
                Olvidé mi contraseña
              </button>
              {/* Olvidé mi contraseña: por ahora solo muestra un texto de ayuda; no se envía nada al servidor. */}
              {/* El texto de ayuda todavía habla de una «cuenta de prueba» que ya no existe; hay que cambiarlo cuando se decida cómo se recupera la contraseña del panel (si el back la ofrece, aquí se llamaría). */}
              {ayudaVisible && (
                <p role="status" className="pop mt-3 text-xs leading-relaxed text-sky">
                  La recuperación se hará desde la app móvil cuando la cuenta esté conectada a la API. En esta demostración usa la cuenta de prueba.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}