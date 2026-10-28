import { useEffect, useState, type CSSProperties } from "react";
import { ENLACE_DE_DESCARGA, IMAGENES } from "../data/configuracion";
import { AparecerAlDesplazar } from "../components/comunes/AparecerAlDesplazar";
import { FormaOrganica, OlaDivisoria } from "../components/comunes/FormasOrganicas";
import { Icono } from "../components/comunes/Icono";
import { ImagenOIlustracion, type NombreDeIlustracion } from "../components/comunes/Ilustraciones";

type AccionesDeLaLanding = {
  onAcceder: () => void;
  onIrASeccion: (idDeSeccion: string) => void;
};

function SeccionDePortada({ onAcceder, onIrASeccion }: AccionesDeLaLanding) {
  return (
    <section id="inicio" className="relative overflow-hidden px-5 pb-24 pt-32 sm:px-8 lg:pt-40">
      <FormaOrganica className="-right-40 -top-32 h-[34rem] w-[34rem] text-sky/70" />
      <FormaOrganica className="-bottom-40 -left-32 h-[26rem] w-[26rem] text-moss/30" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="rise inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-lagoon shadow-card">
            <span className="h-2 w-2 rounded-full bg-moss" aria-hidden />
            Limpieza en Cancún
          </p>
          <h1 className="rise mt-8 text-6xl font-extrabold leading-[0.95] text-navy sm:text-8xl" style={{ animationDelay: "80ms" }}>
            ¿Qué
            <span className="ml-10 block text-lagoon sm:ml-24">limpiamos?</span>
          </h1>
          <p className="rise mt-8 max-w-md text-lg leading-relaxed text-slate" style={{ animationDelay: "180ms" }}>
            Un sitio web que agiliza el trabajo de contratar y gestionar servicios de limpieza: claro, con precio estimado y con personas de confianza.
          </p>
          <div className="rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "280ms" }}>
            <button className="btn btn-primary" onClick={onAcceder}>
              Acceder
              <Icono nombre="flecha" className="h-4 w-4" />
            </button>
            <button className="btn btn-quiet" onClick={() => onIrASeccion("quienes-somos")}>
              Conocer más
            </button>
          </div>
        </div>

        <div className="rise relative mx-auto w-full max-w-sm lg:col-span-5" style={{ animationDelay: "200ms" }}>
          <ImagenOIlustracion rutaDeImagen={IMAGENES.portada} textoAlternativo="Ilustración de un servicio de limpieza en casa" ilustracionDeRespaldo="casa" className="arch aspect-[4/5] shadow-lift" />
          <div className="float leaf-sm absolute -left-6 top-16 bg-white px-4 py-3 shadow-lift sm:-left-12" style={{ "--delay": "0ms" } as CSSProperties}>
            <p className="text-xs font-bold text-slate">Cotización</p>
            <p className="font-display text-xl font-extrabold text-navy">Estimada</p>
          </div>
          <div className="float leaf-sm absolute -right-4 bottom-20 bg-navy px-4 py-3 text-white shadow-lift sm:-right-10" style={{ "--delay": "1500ms" } as CSSProperties}>
            <p className="text-xs font-bold text-moss">Reputación</p>
            <p className="font-display text-xl font-extrabold">Verificable</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const DATOS_DE_LA_HISTORIA = [
  { titulo: "Nace de…", texto: "Un proyecto de la UT Cancún que aplica Design Thinking para entender a clientes y trabajadores de limpieza." },
  { titulo: "¿Qué resuelve?", texto: "Contratar limpieza sin depender de recomendaciones informales: servicio claro, precio estimado y reputación visible." },
  { titulo: "¿Cómo funciona?", texto: "Desde la app eliges servicio, dirección, fecha y horario. El precio final se acuerda directamente." },
  { titulo: "¿Para quiénes?", texto: "Clientes que buscan limpieza de confianza en Cancún y un administrador que gestiona trabajadores y solicitudes." },
];

function SeccionQuienesSomos() {
  return (
    <section id="quienes-somos" className="relative px-5 py-24 sm:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-12">
        <AparecerAlDesplazar className="lg:col-span-5">
          <div className="relative">
            <span className="pebble absolute -bottom-6 -right-6 h-full w-full bg-moss/40" aria-hidden />
            <ImagenOIlustracion rutaDeImagen={IMAGENES.quienesSomos} textoAlternativo="Ilustración de un hogar limpio y cuidado" ilustracionDeRespaldo="equipo" className="pebble relative aspect-square shadow-lift" />
          </div>
        </AparecerAlDesplazar>
        <div className="lg:col-span-7 lg:pl-8">
          <AparecerAlDesplazar>
            <p className="text-xs font-bold uppercase tracking-widest text-lagoon">Nuestra historia</p>
            <h2 className="mt-3 text-4xl font-extrabold text-navy sm:text-5xl">¿Quiénes somos?</h2>
          </AparecerAlDesplazar>
          <dl className="mt-10 space-y-8">
            {DATOS_DE_LA_HISTORIA.map((dato, indice) => (
              <AparecerAlDesplazar key={dato.titulo} retrasoEnMilisegundos={indice * 90}>
                <div className="flex gap-5">
                  <span className="pebble grid h-10 w-10 shrink-0 place-items-center bg-navy font-display text-sm font-bold text-moss">{indice + 1}</span>
                  <div>
                    <dt className="font-display text-xl font-bold text-navy">{dato.titulo}</dt>
                    <dd className="mt-1 leading-relaxed text-slate">{dato.texto}</dd>
                  </div>
                </div>
              </AparecerAlDesplazar>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

const OBJETIVOS: { titulo: string; texto: string; ilustracion: NombreDeIlustracion }[] = [
  { titulo: "Interfaz intuitiva", texto: "Registro, búsqueda y contratación en pocos pasos.", ilustracion: "intuitiva" },
  { titulo: "Confianza", texto: "Verificación de identidad para clientes y trabajadores.", ilustracion: "confianza" },
  { titulo: "Cotización estimada", texto: "Precio según medidas del lugar y tipo de limpieza.", ilustracion: "cotizacion" },
  { titulo: "Reputación", texto: "Reportes y calificaciones para cada trabajador.", ilustracion: "reputacion" },
];

function SeccionObjetivos() {
  return (
    <section id="objetivos" className="relative bg-navy text-white">
      <OlaDivisoria className="-mt-px rotate-180 text-beige" />
      <div className="mx-auto max-w-6xl px-5 pb-28 pt-10 sm:px-8">
        <AparecerAlDesplazar className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-moss">Lo que buscamos</p>
          <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl">Objetivos</h2>
        </AparecerAlDesplazar>
        <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {OBJETIVOS.map((objetivo, indice) => (
            <AparecerAlDesplazar key={objetivo.titulo} retrasoEnMilisegundos={indice * 100}>
              <article className={`group text-center ${indice % 2 === 1 ? "lg:mt-12" : ""}`}>
                <ImagenOIlustracion rutaDeImagen={IMAGENES.objetivos[indice]} textoAlternativo={objetivo.titulo} ilustracionDeRespaldo={objetivo.ilustracion} className="arch aspect-[3/4] transition duration-500 ease-soft group-hover:-translate-y-2 group-hover:shadow-lift" />
                <h3 className="mt-7 text-xl font-bold">{objetivo.titulo}</h3>
                <p className="mx-auto mt-2 max-w-[15rem] text-sm leading-relaxed text-sky">{objetivo.texto}</p>
              </article>
            </AparecerAlDesplazar>
          ))}
        </div>
      </div>
      <OlaDivisoria className="absolute inset-x-0 bottom-0 -mb-px text-moon" />
    </section>
  );
}

function BotonDeDescarga() {
  const [mensajeProvisional, setMensajeProvisional] = useState("");

  if (ENLACE_DE_DESCARGA) {
    return (
      <a className="btn btn-primary" href={ENLACE_DE_DESCARGA}>
        <Icono nombre="descargar" className="h-4 w-4" />
        Ir a / Descargar
      </a>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button className="btn btn-primary" onClick={() => setMensajeProvisional("Enlace provisional: la app aún no está publicada en tiendas.")}>
        <Icono nombre="descargar" className="h-4 w-4" />
        Ir a / Descargar
      </button>
      {mensajeProvisional && (
        <p role="status" className="pop rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-navy shadow-card">
          {mensajeProvisional}
        </p>
      )}
    </div>
  );
}

function SeccionDescargaDeLaApp() {
  return (
    <section id="app" className="relative overflow-hidden bg-moon px-5 py-28 sm:px-8">
      <FormaOrganica className="-left-32 top-10 h-96 w-96 text-sky/60" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-12">
        <AparecerAlDesplazar className="lg:col-span-6">
          <p className="text-xs font-bold uppercase tracking-widest text-lagoon">Dos formas de usarla</p>
          <h2 className="mt-3 text-4xl font-extrabold text-navy sm:text-5xl">Descarga nuestra aplicación</h2>
          <div className="mt-8 space-y-6 leading-relaxed text-slate">
            <p>
              <strong className="font-display text-lg text-navy">App móvil. </strong>Los clientes contratan, cotizan y califican desde su teléfono. Invitamos a descargarla para empezar.
            </p>
            <p>
              <strong className="font-display text-lg text-navy">App web. </strong>El administrador gestiona trabajadores, catálogo, solicitudes y reportes. Se necesita iniciar sesión con la cuenta creada en la app para entrar aquí.
            </p>
          </div>
          <div className="mt-10">
            <BotonDeDescarga />
          </div>
        </AparecerAlDesplazar>
        <AparecerAlDesplazar retrasoEnMilisegundos={150} className="lg:col-span-6">
          <ImagenOIlustracion rutaDeImagen={IMAGENES.descargaDeLaApp} textoAlternativo="Ilustración de la aplicación móvil" ilustracionDeRespaldo="app" className="leaf mx-auto aspect-[4/4.4] max-w-md shadow-lift" />
        </AparecerAlDesplazar>
      </div>
    </section>
  );
}

const ILUSTRACIONES_DE_ROTACION: NombreDeIlustracion[] = ["casa", "app"];

function SeccionAcceso({ onAcceder }: { onAcceder: () => void }) {
  const [indiceDeLaImagenVisible, setIndiceDeLaImagenVisible] = useState(0);
  const [cantidadDeGiros, setCantidadDeGiros] = useState(0);

  useEffect(() => {
    const usuarioPrefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (usuarioPrefiereMenosMovimiento) {
      return;
    }
    const temporizador = window.setInterval(() => {
      setIndiceDeLaImagenVisible((indiceActual) => (indiceActual + 1) % ILUSTRACIONES_DE_ROTACION.length);
      setCantidadDeGiros((girosActuales) => girosActuales + 1);
    }, 5000);
    return () => window.clearInterval(temporizador);
  }, []);

  return (
    <section id="acceder" className="bg-oxford px-5 pb-24 pt-24 text-white sm:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2">
        <AparecerAlDesplazar>
          <div key={cantidadDeGiros} className={`relative mx-auto aspect-square w-64 overflow-hidden rounded-full ring-8 ring-white/10 sm:w-80 ${cantidadDeGiros > 0 ? "turning" : ""}`}>
            {ILUSTRACIONES_DE_ROTACION.map((ilustracion, indice) => (
              <div key={ilustracion} className={`absolute inset-0 transition-opacity duration-1000 ${indiceDeLaImagenVisible === indice ? "opacity-100" : "opacity-0"}`}>
                <ImagenOIlustracion rutaDeImagen={IMAGENES.rotacionDeAcceso[indice]} textoAlternativo={`Imagen ${indice + 1} de la rotación`} ilustracionDeRespaldo={ilustracion} className="h-full w-full" />
              </div>
            ))}
          </div>
        </AparecerAlDesplazar>
        <AparecerAlDesplazar retrasoEnMilisegundos={150} className="text-center md:text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-moss">Panel de administración</p>
          <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl">Registrarse / Acceder</h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-sky md:max-w-sm">Accede a tu cuenta previamente creada en nuestra app. El registro de clientes se hace desde la app móvil.</p>
          <button onClick={onAcceder} className="btn btn-moss mt-9">
            Acceder
            <Icono nombre="flecha" className="h-4 w-4" />
          </button>
        </AparecerAlDesplazar>
      </div>
    </section>
  );
}

export function LandingPage({ onAcceder, onIrASeccion }: AccionesDeLaLanding) {
  return (
    <main>
      <SeccionDePortada onAcceder={onAcceder} onIrASeccion={onIrASeccion} />
      <SeccionQuienesSomos />
      <SeccionObjetivos />
      <SeccionDescargaDeLaApp />
      <SeccionAcceso onAcceder={onAcceder} />
    </main>
  );
}
