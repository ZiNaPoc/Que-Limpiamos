import { useEffect, useState } from "react";
import { DATOS_DE_SECCIONES } from "../data/seccionesDeDemostracion";
import type { AperturaDeSolicitudes, Sesion, VistaDelPanel } from "../data/tipos";
import { FILTROS_VACIOS } from "../utils/consultasDeSolicitudes";
import { MenuLateral } from "../components/MenuLateral";
import { Icono } from "../components/comunes/Icono";
import { FormaOrganica, Logotipo } from "../components/comunes/FormasOrganicas";
import { InicioPage } from "./InicioPage";
import { PerfilPage } from "./PerfilPage";
import { SeccionDeDatosPage } from "./SeccionDeDatosPage";
import { CatalogoPage } from "./CatalogoPage";
import { ReportesPage } from "./ReportesPage";
import { SolicitudesPage } from "./SolicitudesPage";
import { TrabajadoresPage } from "./TrabajadoresPage";

const CONSULTA_DE_PANTALLA_DE_ESCRITORIO = "(min-width: 1024px) and (hover: hover)";

function useMenuLateralCompacto() {
  const [esCompacto, setEsCompacto] = useState(() => window.matchMedia(CONSULTA_DE_PANTALLA_DE_ESCRITORIO).matches);
  useEffect(() => {
    const consulta = window.matchMedia(CONSULTA_DE_PANTALLA_DE_ESCRITORIO);
    function actualizarModo() {
      setEsCompacto(consulta.matches);
    }
    consulta.addEventListener("change", actualizarModo);
    return () => consulta.removeEventListener("change", actualizarModo);
  }, []);
  return esCompacto;
}

const APERTURA_PREDETERMINADA: AperturaDeSolicitudes = { filtros: FILTROS_VACIOS, idDeSolicitud: null };

type DashboardPageProps = {
  sesion: Sesion;
  onCerrarSesion: () => void;
  onIrAQuienesSomos: () => void;
};

export function DashboardPage({ sesion, onCerrarSesion, onIrAQuienesSomos }: DashboardPageProps) {
  const menuLateralEsCompacto = useMenuLateralCompacto();
  const [vistaActual, setVistaActual] = useState<VistaDelPanel>("inicio");
  const [cajonAbierto, setCajonAbierto] = useState(false);
  const [aperturaDeSolicitudes, setAperturaDeSolicitudes] = useState<AperturaDeSolicitudes>(APERTURA_PREDETERMINADA);
  const [cantidadDeNavegaciones, setCantidadDeNavegaciones] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [vistaActual, cantidadDeNavegaciones]);

  useEffect(() => {
    if (menuLateralEsCompacto) {
      setCajonAbierto(false);
    }
  }, [menuLateralEsCompacto]);

  function navegarA(vista: VistaDelPanel, apertura: AperturaDeSolicitudes = APERTURA_PREDETERMINADA) {
    setVistaActual(vista);
    setAperturaDeSolicitudes(apertura);
    setCantidadDeNavegaciones((cantidad) => cantidad + 1);
    setCajonAbierto(false);
  }

  function mostrarVistaActual() {
    if (vistaActual === "inicio") {
      return <InicioPage sesion={sesion} onNavegar={navegarA} />;
    }
    if (vistaActual === "perfil") {
      return <PerfilPage sesion={sesion} />;
    }
    if (vistaActual === "solicitudes") {
      return <SolicitudesPage filtrosIniciales={aperturaDeSolicitudes.filtros} idDeSolicitudAbierta={aperturaDeSolicitudes.idDeSolicitud} />;
    }
    if (vistaActual === "trabajadores") {
      return <TrabajadoresPage />;
    }
    if (vistaActual === "catalogo") {
      return <CatalogoPage />;
    }
    if (vistaActual === "reportes") {
      return <ReportesPage />;
    }
    return <SeccionDeDatosPage seccion={DATOS_DE_SECCIONES[vistaActual]} />;
  }

  let claseDelContenidoPrincipal = "px-5 pb-20 pt-6 sm:px-10";
  if (menuLateralEsCompacto) {
    claseDelContenidoPrincipal = "pb-20 pl-32 pr-12 pt-10";
  }

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <FormaOrganica className="-right-40 -top-40 h-[34rem] w-[34rem] text-sky/60" />
      <FormaOrganica className="-bottom-48 left-1/3 h-[30rem] w-[30rem] text-moss/20" />

      <MenuLateral sesion={sesion} vistaActiva={vistaActual} esCompacto={menuLateralEsCompacto} cajonAbierto={cajonAbierto} onNavegar={navegarA} onCerrarCajon={() => setCajonAbierto(false)} onIrAQuienesSomos={onIrAQuienesSomos} onCerrarSesion={onCerrarSesion} />
      {cajonAbierto && !menuLateralEsCompacto && <div aria-hidden onClick={() => setCajonAbierto(false)} className="fade fixed inset-0 z-40 bg-oxford/50 backdrop-blur-sm" />}

      <main className={`relative min-w-0 ${claseDelContenidoPrincipal}`}>
        {!menuLateralEsCompacto && (
          <header className="mb-8 flex items-center gap-4">
            <button onClick={() => setCajonAbierto(true)} aria-label="Abrir menú" aria-expanded={cajonAbierto} aria-controls="menu-lateral" className="leaf-sm grid h-12 w-12 cursor-pointer place-items-center bg-navy text-white shadow-card transition duration-300 hover:bg-oxford">
              <Icono nombre="menu" />
            </button>
            <Logotipo />
          </header>
        )}
        <div key={`${vistaActual}-${cantidadDeNavegaciones}`} className="rise mx-auto max-w-6xl">
          {mostrarVistaActual()}
        </div>
      </main>
    </div>
  );
}
