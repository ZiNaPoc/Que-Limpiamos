import { useState, type FormEvent } from "react";
import { CUENTA_DE_DEMOSTRACION, IMAGENES } from "../data/configuracion";
import type { Sesion } from "../data/tipos";
import { FormaOrganica } from "../components/comunes/FormasOrganicas";
import { Icono } from "../components/comunes/Icono";
import { ImagenOIlustracion } from "../components/comunes/Ilustraciones";

const REGLAS_DE_CONTRASENA = [
  { etiqueta: "Al menos 8 caracteres", seCumple: (contrasena: string) => contrasena.length >= 8 },
  { etiqueta: "Mayúscula y minúscula", seCumple: (contrasena: string) => /[a-z]/.test(contrasena) && /[A-Z]/.test(contrasena) },
  { etiqueta: "Al menos un número", seCumple: (contrasena: string) => /\d/.test(contrasena) },
];

function quitarSeparadoresDelTelefono(telefono: string) {
  return telefono.replace(/[\s()-]/g, "");
}

export function LoginPage({ onAccesoExitoso }: { onAccesoExitoso: (sesion: Sesion) => void }) {
  const [correoOTelefono, setCorreoOTelefono] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensajeDeError, setMensajeDeError] = useState("");
  const [formularioVibrando, setFormularioVibrando] = useState(false);
  const [ayudaVisible, setAyudaVisible] = useState(false);
  const [contrasenaVisible, setContrasenaVisible] = useState(false);

  const reglasCumplidas = REGLAS_DE_CONTRASENA.filter((regla) => regla.seCumple(contrasena)).length;

  function mostrarErrorDeAcceso(mensaje: string) {
    setMensajeDeError(mensaje);
    setFormularioVibrando(true);
  }

  function rellenarCuentaDeDemostracion() {
    setCorreoOTelefono(CUENTA_DE_DEMOSTRACION.correo);
    setContrasena(CUENTA_DE_DEMOSTRACION.contrasena);
    setMensajeDeError("");
  }

  function handleEnvioDelFormulario(evento: FormEvent) {
    evento.preventDefault();
    if (!correoOTelefono.trim() || !contrasena) {
      mostrarErrorDeAcceso("Completa tu correo o teléfono y la contraseña.");
      return;
    }
    const identificadorEscrito = correoOTelefono.trim().toLowerCase();
    const identificadorCoincide = identificadorEscrito === CUENTA_DE_DEMOSTRACION.correo || quitarSeparadoresDelTelefono(identificadorEscrito) === CUENTA_DE_DEMOSTRACION.telefono;
    if (!identificadorCoincide || contrasena !== CUENTA_DE_DEMOSTRACION.contrasena) {
      mostrarErrorDeAcceso("Correo, teléfono o contraseña incorrectos.");
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
              <label htmlFor="correo-o-telefono" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sky">
                Correo electrónico o teléfono
              </label>
              <input id="correo-o-telefono" type="text" autoComplete="username" value={correoOTelefono} onChange={(evento) => setCorreoOTelefono(evento.target.value)} className="field" />
            </div>

            <div>
              <label htmlFor="contrasena" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sky">
                Contraseña
              </label>
              <div className="relative">
                <input id="contrasena" type={contrasenaVisible ? "text" : "password"} autoComplete="current-password" value={contrasena} onChange={(evento) => setContrasena(evento.target.value)} aria-describedby="ayuda-de-contrasena" className="field pr-12" />
                <button type="button" onClick={() => setContrasenaVisible(!contrasenaVisible)} aria-label={contrasenaVisible ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={contrasenaVisible} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-slate transition duration-300 hover:bg-sky/50">
                  <Icono nombre="ojo" className="h-4 w-4" />
                </button>
              </div>

              <div id="ayuda-de-contrasena" className="mt-3">
                <p className="text-xs text-sky">La contraseña debe tener al menos 8 caracteres. Esta guía es solo orientativa.</p>
                <div className="mt-2 flex gap-1.5" aria-hidden>
                  {REGLAS_DE_CONTRASENA.map((regla, indice) => (
                    <span key={regla.etiqueta} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${indice < reglasCumplidas ? "bg-moss" : "bg-white/20"}`} />
                  ))}
                </div>
                <ul className="mt-2 space-y-1 text-xs">
                  {REGLAS_DE_CONTRASENA.map((regla) => {
                    const reglaCumplida = regla.seCumple(contrasena);
                    return (
                      <li key={regla.etiqueta} className={`flex items-center gap-2 transition-colors duration-300 ${reglaCumplida ? "text-moss" : "text-frost"}`}>
                        <Icono nombre={reglaCumplida ? "palomita" : "cerrar"} className="h-3.5 w-3.5" />
                        {regla.etiqueta}
                      </li>
                    );
                  })}
                </ul>
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
