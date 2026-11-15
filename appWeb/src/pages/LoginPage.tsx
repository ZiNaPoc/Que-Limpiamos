import { useState, type FormEvent } from "react";
import { CUENTA_DE_DEMOSTRACION, IMAGENES } from "../data/configuracion";
import type { Sesion } from "../data/tipos";
import { FormaOrganica } from "../components/comunes/FormasOrganicas";
import { Icono } from "../components/comunes/Icono";
import { ImagenOIlustracion } from "../components/comunes/Ilustraciones";

export function LoginPage({ onAccesoExitoso }: { onAccesoExitoso: (sesion: Sesion) => void }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensajeDeError, setMensajeDeError] = useState("");
  const [formularioVibrando, setFormularioVibrando] = useState(false);
  const [ayudaVisible, setAyudaVisible] = useState(false);
  const [contrasenaVisible, setContrasenaVisible] = useState(false);

  function mostrarErrorDeAcceso(mensaje: string) {
    setMensajeDeError(mensaje);
    setFormularioVibrando(true);
  }

  function rellenarCuentaDeDemostracion() {
    setCorreo(CUENTA_DE_DEMOSTRACION.correo);
    setContrasena(CUENTA_DE_DEMOSTRACION.contrasena);
    setMensajeDeError("");
  }

  function handleEnvioDelFormulario(evento: FormEvent) {
    evento.preventDefault();
    if (!correo.trim() || !contrasena) {
      mostrarErrorDeAcceso("Completa tu correo y la contraseña.");
      return;
    }
    const identificadorEscrito = correo.trim().toLowerCase();
    const identificadorCoincide = identificadorEscrito === CUENTA_DE_DEMOSTRACION.correo;
    if (!identificadorCoincide || contrasena !== CUENTA_DE_DEMOSTRACION.contrasena) {
      mostrarErrorDeAcceso("Correo o contraseña incorrectos.");
      return;
    }
    onAccesoExitoso({ nombre: CUENTA_DE_DEMOSTRACION.nombre, nombreDeUsuario: CUENTA_DE_DEMOSTRACION.nombreDeUsuario, correo: CUENTA_DE_DEMOSTRACION.correo });
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
              {ayudaVisible && (
                <p role="status" className="pop mt-3 text-xs leading-relaxed text-sky">
                  La recuperación se hará desde la app móvil cuando la cuenta esté conectada a la API. En esta demostración usa la cuenta de prueba.
                </p>
              )}
            </div>
          </form>

          <div className="mt-8 rounded-2xl bg-white/10 p-4 text-xs leading-relaxed text-sky">
            <p className="font-bold text-white">Cuenta de demostración (simulación, sin seguridad real)</p>
            <p className="mt-1 break-all">{CUENTA_DE_DEMOSTRACION.correo}</p>
            <p>{CUENTA_DE_DEMOSTRACION.contrasena}</p>
            <button type="button" onClick={rellenarCuentaDeDemostracion} className="mt-2 cursor-pointer font-bold text-moss underline underline-offset-4">
              Rellenar datos
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}