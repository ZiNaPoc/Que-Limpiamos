import { useState, type FocusEvent } from "react";
import { useAtrapaFoco } from "../hooks/useAtrapaFoco";
import type { Sesion, VistaDelPanel } from "../data/tipos";
import { Icono, type NombreDeIcono } from "./comunes/Icono";
import { Logotipo } from "./comunes/FormasOrganicas";

const OPCIONES_DE_NAVEGACION: { idDeVista: VistaDelPanel; etiqueta: string; icono: NombreDeIcono }[] = [
  { idDeVista: "inicio", etiqueta: "Inicio", icono: "inicio" },
  { idDeVista: "solicitudes", etiqueta: "Solicitudes", icono: "bandeja" },
  { idDeVista: "trabajadores", etiqueta: "Trabajadores", icono: "trabajadores" },
  { idDeVista: "catalogo", etiqueta: "Catálogo", icono: "catalogo" },
  { idDeVista: "clientes", etiqueta: "Clientes", icono: "clientes" },
  { idDeVista: "reportes", etiqueta: "Reportes", icono: "reportes" },
  { idDeVista: "resenas", etiqueta: "Reseñas", icono: "estrella" },
];

const ALTURA_DE_CADA_OPCION_EN_REM = 3.5;

function claseDeLaEtiquetaAnimada(estaExpandido: boolean) {
  if (estaExpandido) {
    return "translate-x-0 opacity-100";
  }
  return "-translate-x-3 opacity-0";
}

type BotonDelMenuProps = {
  icono: NombreDeIcono;
  etiqueta: string;
  estaExpandido: boolean;
  estaActivo?: boolean;
  onClick: () => void;
};

function BotonDelMenu({ icono, etiqueta, estaExpandido, estaActivo = false, onClick }: BotonDelMenuProps) {
  let claseDeColor = "text-sky hover:bg-white/10 hover:text-white";
  if (estaActivo) {
    claseDeColor = "text-oxford";
  }
  return (
    <button onClick={onClick} aria-label={etiqueta} aria-current={estaActivo ? "page" : undefined} className={`relative z-10 flex h-12 w-full cursor-pointer items-center gap-3 rounded-2xl text-left text-sm font-bold transition-colors duration-300 ${claseDeColor}`}>
      <span className="grid h-12 w-12 shrink-0 place-items-center">
        <Icono nombre={icono} />
      </span>
      <span aria-hidden className={`whitespace-nowrap transition duration-300 ease-soft ${claseDeLaEtiquetaAnimada(estaExpandido)}`}>
        {etiqueta}
      </span>
    </button>
  );
}

type MenuLateralProps = {
  sesion: Sesion;
  vistaActiva: VistaDelPanel;
  esCompacto: boolean;
  cajonAbierto: boolean;
  onNavegar: (vista: VistaDelPanel) => void;
  onCerrarCajon: () => void;
  onIrAQuienesSomos: () => void;
  onCerrarSesion: () => void;
};

export function MenuLateral({ sesion, vistaActiva, esCompacto, cajonAbierto, onNavegar, onCerrarCajon, onIrAQuienesSomos, onCerrarSesion }: MenuLateralProps) {
  const [cursorSobreElMenu, setCursorSobreElMenu] = useState(false);
  const [menuTieneFocoDeTeclado, setMenuTieneFocoDeTeclado] = useState(false);
  const menuRef = useAtrapaFoco<HTMLElement>(!esCompacto && cajonAbierto, onCerrarCajon);

  let estaExpandido = true;
  if (esCompacto) {
    estaExpandido = cursorSobreElMenu || menuTieneFocoDeTeclado;
  }

  function handleFocoEnElMenu(evento: FocusEvent<HTMLElement>) {
    if (evento.target.matches(":focus-visible")) {
      setMenuTieneFocoDeTeclado(true);
    }
  }

  function handlePerdidaDeFocoEnElMenu(evento: FocusEvent<HTMLElement>) {
    if (!evento.currentTarget.contains(evento.relatedTarget)) {
      setMenuTieneFocoDeTeclado(false);
    }
  }

  let claseDelPanel = "";
  let estiloDelPanel = {};
  if (esCompacto) {
    claseDelPanel = "transition-[width,box-shadow] duration-500 ease-soft";
    estiloDelPanel = { width: estaExpandido ? "17rem" : "5.5rem" };
    if (estaExpandido) {
      claseDelPanel += " shadow-lift";
    }
  } else {
    claseDelPanel = "w-72 transition-[transform,visibility] duration-500 ease-soft";
    if (cajonAbierto) {
      claseDelPanel += " visible translate-x-0";
    } else {
      claseDelPanel += " invisible -translate-x-full";
    }
  }

  const posicionDeLaVistaActiva = OPCIONES_DE_NAVEGACION.findIndex((opcion) => opcion.idDeVista === vistaActiva);
  let claseDelIndicador = "opacity-100";
  if (posicionDeLaVistaActiva < 0) {
    claseDelIndicador = "opacity-0";
  }
  const claseDeLaEtiqueta = claseDeLaEtiquetaAnimada(estaExpandido);
  const perfilEstaActivo = vistaActiva === "perfil";

  return (
    <aside
      ref={menuRef}
      id="menu-lateral"
      aria-label="Navegación del panel"
      className={`fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden bg-oxford px-3.5 py-5 text-moon ${claseDelPanel}`}
      style={{ borderRadius: "0 3rem 3rem 0", ...estiloDelPanel }}
      onMouseEnter={() => setCursorSobreElMenu(true)}
      onMouseLeave={() => setCursorSobreElMenu(false)}
      onFocus={handleFocoEnElMenu}
      onBlur={handlePerdidaDeFocoEnElMenu}
    >
      <span className="pebble pointer-events-none absolute -bottom-20 -right-24 h-64 w-64 bg-lagoon/25" aria-hidden />

      <div className="relative flex h-12 items-center">
        <div className="shrink-0 pl-0.5">
          <Logotipo claro mostrarTexto={false} />
        </div>
        <span aria-hidden className={`ml-3 whitespace-nowrap font-display text-lg font-extrabold leading-[1.05] transition duration-300 ease-soft ${claseDeLaEtiqueta}`}>
          ¿Qué
          <span className="ml-3 block">limpiamos?</span>
        </span>
        {!esCompacto && (
          <button onClick={onCerrarCajon} aria-label="Cerrar menú" className="ml-auto grid h-10 w-10 cursor-pointer place-items-center rounded-full text-sky transition duration-300 hover:bg-white/10">
            <Icono nombre="cerrar" />
          </button>
        )}
      </div>

      <button onClick={() => onNavegar("perfil")} aria-label={`Perfil de ${sesion.nombre}`} aria-current={perfilEstaActivo ? "page" : undefined} className={`relative mt-8 flex h-16 w-full cursor-pointer items-center gap-3 rounded-2xl text-left transition-colors duration-300 hover:bg-white/10 ${perfilEstaActivo ? "bg-white/10" : ""}`}>
        <span className="pebble grid h-12 w-12 shrink-0 place-items-center bg-sky font-display text-lg font-extrabold text-oxford">{sesion.nombre.charAt(0)}</span>
        <span aria-hidden className={`whitespace-nowrap transition duration-300 ease-soft ${claseDeLaEtiqueta}`}>
          <span className="block text-sm font-bold text-white">Perfil</span>
          <span className="block text-xs text-frost">@{sesion.nombreDeUsuario}</span>
        </span>
      </button>

      <nav className="relative mt-6 flex-1" aria-label="Secciones">
        <span aria-hidden className={`leaf-sm absolute left-0 top-0 h-12 w-full bg-moon transition duration-500 ease-soft ${claseDelIndicador}`} style={{ transform: `translateY(${Math.max(posicionDeLaVistaActiva, 0) * ALTURA_DE_CADA_OPCION_EN_REM}rem)` }} />
        <div className="space-y-2">
          {OPCIONES_DE_NAVEGACION.map((opcion) => (
            <BotonDelMenu key={opcion.idDeVista} icono={opcion.icono} etiqueta={opcion.etiqueta} estaExpandido={estaExpandido} estaActivo={vistaActiva === opcion.idDeVista} onClick={() => onNavegar(opcion.idDeVista)} />
          ))}
        </div>
      </nav>

      <div className="relative space-y-2 border-t border-white/10 pt-4">
        <BotonDelMenu icono="informacion" etiqueta="¿Quiénes somos?" estaExpandido={estaExpandido} onClick={onIrAQuienesSomos} />
        <BotonDelMenu icono="salir" etiqueta="Salir de la cuenta" estaExpandido={estaExpandido} onClick={onCerrarSesion} />
      </div>
    </aside>
  );
}
