import { useEffect, useState, type MouseEvent } from "react";
import { IDS_DE_SECCIONES_DE_LA_LANDING, SECCIONES_DE_LA_LANDING } from "../data/configuracion";
import { Icono } from "./comunes/Icono";
import { Logotipo } from "./comunes/FormasOrganicas";

function useSeccionVisible(idsDeSecciones: string[]) {
  const [idDeSeccionActiva, setIdDeSeccionActiva] = useState(idsDeSecciones[0]);
  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            setIdDeSeccionActiva(entrada.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    idsDeSecciones.forEach((idDeSeccion) => {
      const seccion = document.getElementById(idDeSeccion);
      if (seccion) {
        observador.observe(seccion);
      }
    });
    return () => observador.disconnect();
  }, [idsDeSecciones]);
  return idDeSeccionActiva;
}

function claseDelEnlace(estaActivo: boolean) {
  const claseBase = "rounded-full px-4 py-2 text-sm font-semibold transition duration-300";
  if (estaActivo) {
    return `${claseBase} bg-navy text-white`;
  }
  return `${claseBase} text-navy hover:bg-sky/60`;
}

type BarraDeNavegacionProps = {
  onAcceder: () => void;
  onIrASeccion: (idDeSeccion: string) => void;
  textoDelBotonDeAcceso: string;
  estaEnLaLanding: boolean;
  laPaginaDeAccesoEstaActiva?: boolean;
};

export function BarraDeNavegacion({ onAcceder, onIrASeccion, textoDelBotonDeAcceso, estaEnLaLanding, laPaginaDeAccesoEstaActiva = false }: BarraDeNavegacionProps) {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const idDeSeccionActiva = useSeccionVisible(IDS_DE_SECCIONES_DE_LA_LANDING);

  function abrirAcceso() {
    setMenuMovilAbierto(false);
    onAcceder();
  }

  function irASeccion(idDeSeccion: string) {
    setMenuMovilAbierto(false);
    onIrASeccion(idDeSeccion);
  }

  function handleClicEnEnlaceDeSeccion(evento: MouseEvent<HTMLAnchorElement>, idDeSeccion: string) {
    evento.preventDefault();
    irASeccion(idDeSeccion);
  }

  function seccionEstaActiva(idDeSeccion: string) {
    return estaEnLaLanding && idDeSeccionActiva === idDeSeccion;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6">
      <nav className="leaf-sm mx-auto flex max-w-6xl items-center justify-between bg-beige/85 px-4 py-2 shadow-card backdrop-blur-md" aria-label="Principal">
        <a href="#inicio" onClick={(evento) => handleClicEnEnlaceDeSeccion(evento, "inicio")} aria-label="¿Qué limpiamos? Ir al inicio">
          <Logotipo />
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {SECCIONES_DE_LA_LANDING.map((seccion) => (
            <a key={seccion.id} href={`#${seccion.id}`} onClick={(evento) => handleClicEnEnlaceDeSeccion(evento, seccion.id)} aria-current={seccionEstaActiva(seccion.id) ? "true" : undefined} className={claseDelEnlace(seccionEstaActiva(seccion.id))}>
              {seccion.etiqueta}
            </a>
          ))}
          <button className={`btn btn-primary ml-2 ${laPaginaDeAccesoEstaActiva ? "ring-2 ring-moss ring-offset-2" : ""}`} onClick={abrirAcceso}>
            {textoDelBotonDeAcceso}
          </button>
        </div>

        <button className="grid h-11 w-11 cursor-pointer place-items-center rounded-full text-navy hover:bg-sky/60 md:hidden" aria-expanded={menuMovilAbierto} aria-controls="menu-movil" aria-label="Abrir o cerrar menú" onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}>
          <Icono nombre={menuMovilAbierto ? "cerrar" : "menu"} />
        </button>
      </nav>

      {menuMovilAbierto && (
        <div id="menu-movil" className="pop leaf-sm mx-auto mt-2 grid max-w-6xl gap-1 bg-beige p-3 shadow-lift md:hidden">
          {SECCIONES_DE_LA_LANDING.map((seccion) => (
            <a key={seccion.id} href={`#${seccion.id}`} onClick={(evento) => handleClicEnEnlaceDeSeccion(evento, seccion.id)} className={claseDelEnlace(seccionEstaActiva(seccion.id))}>
              {seccion.etiqueta}
            </a>
          ))}
          <button className="btn btn-primary mt-2" onClick={abrirAcceso}>
            {textoDelBotonDeAcceso}
          </button>
        </div>
      )}
    </header>
  );
}
