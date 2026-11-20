import { useEffect, useState } from "react";
import type { AperturaDelPanel, Sesion, VistaDelPanel } from "../data/tipos";
import { MenuLateral } from "../components/MenuLateral";
import { Icono } from "../components/comunes/Icono";
import { FormaOrganica, Logotipo } from "../components/comunes/FormasOrganicas";
import { InicioPage } from "./InicioPage";
import { PerfilPage } from "./PerfilPage";
import { CatalogoPage } from "./CatalogoPage";
import { ClientesPage } from "./ClientesPage";
import { ResenasPage } from "./ResenasPage";
import { SolicitudesPage } from "./SolicitudesPage";
import { TrabajadoresPage } from "./TrabajadoresPage";
import { SolicitudesProvider } from "../data/SolicitudesProvider";

// "Escritorio" = pantalla de al menos 1024 px y con ratón. Ahí el menú es una barra delgada que se expande; en celular o tableta es un cajón que se abre con el botón.
const CONSULTA_DE_PANTALLA_DE_ESCRITORIO =
  "(min-width: 1024px) and (hover: hover)";

// Detecta si la pantalla es de escritorio o no y se actualiza sola si cambia (por ejemplo, al girar la tableta).
function useMenuLateralCompacto() {
  const [esCompacto, setEsCompacto] = useState(
    () => window.matchMedia(CONSULTA_DE_PANTALLA_DE_ESCRITORIO).matches,
  );
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

// Apertura vacía: abrir una pantalla sin filtros ni registros abiertos.
const APERTURA_PREDETERMINADA: AperturaDelPanel = {};

type DashboardPageProps = {
  sesion: Sesion;
  onCerrarSesion: () => void;
  onIrAQuienesSomos: () => void;
};

// Marco con menú lateral y la pantalla elegida. Solo se llega aquí con sesión iniciada.
// El estado vistaActual dice qué pantalla se ve (no hay URLs por pantalla).
// Inicio - resumen del día y atajos / Solicitudes - lista y detalle, aquí se avanza el flujo / Clientes - revisar INE /
// Colaboradores - alta, edición y reputación / Catálogo - servicios que ve el cliente / Reseñas - calificaciones / Perfil - datos de la sesión.
// Todas las pantallas cambian de vista con navegarA (la reciben como onNavegar).
// aquí es donde se cargan las listas al abrir: solicitudes, clientes, colaboradores y servicios.
// Si alguna petición responde 401, la cookie venció: hay que llamar a onCerrarSesion para volver al login.
export function DashboardPage({
  sesion,
  onCerrarSesion,
  onIrAQuienesSomos,
}: DashboardPageProps) {
  const menuLateralEsCompacto = useMenuLateralCompacto();
  // Pantalla abierta en el panel. Empieza en Inicio.
  const [vistaActual, setVistaActual] = useState<VistaDelPanel>("inicio");
  // En celular, si el menú (cajón) está abierto o cerrado.
  const [cajonSolicitado, setCajonAbierto] = useState(false);
  const cajonAbierto = cajonSolicitado && !menuLateralEsCompacto;
  // Datos extra con los que se abrió la pantalla (filtros ya puestos o el id de algo que debe abrirse).
  // Ejemplo: desde Inicio, "Revisar INE" abre Clientes ya filtrado por INE pendiente.
  const [apertura, setApertura] = useState<AperturaDelPanel>(
    APERTURA_PREDETERMINADA,
  );
  // Cuenta cada vez que se navega, aunque sea a la misma pantalla. Sirve para reiniciar la pantalla y subir al inicio.
  const [cantidadDeNavegaciones, setCantidadDeNavegaciones] = useState(0);

  useEffect(() => {
    // Cada vez que se cambia de pantalla, la página sube al inicio.
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [vistaActual, cantidadDeNavegaciones]);

  // Cambia de pantalla. Guarda la nueva vista y su apertura, cuenta la navegación y cierra el cajón del menú.
  function navegarA(
    vista: VistaDelPanel,
    aperturaNueva: AperturaDelPanel = APERTURA_PREDETERMINADA,
  ) {
    setVistaActual(vista);
    setApertura(aperturaNueva);
    setCantidadDeNavegaciones((cantidad) => cantidad + 1);
    setCajonAbierto(false);
  }

  // Elige qué pantalla dibujar según vistaActual y le pasa lo que necesita (sesión, apertura, onNavegar).
  function mostrarVistaActual() {
    if (vistaActual === "inicio") {
      return <InicioPage sesion={sesion} onNavegar={navegarA} />;
    }
    if (vistaActual === "perfil") {
      return <PerfilPage sesion={sesion} />;
    }
    if (vistaActual === "solicitudes") {
      return <SolicitudesPage apertura={apertura} />;
    }
    if (vistaActual === "trabajadores") {
      return <TrabajadoresPage onNavegar={navegarA} />;
    }
    if (vistaActual === "catalogo") {
      return <CatalogoPage />;
    }
    if (vistaActual === "clientes") {
      return <ClientesPage apertura={apertura} />;
    }
    return <ResenasPage onNavegar={navegarA} />;
  }

  let claseDelContenidoPrincipal = "px-5 pb-20 pt-6 sm:px-10";
  if (menuLateralEsCompacto) {
    claseDelContenidoPrincipal = "pb-20 pl-32 pr-12 pt-10";
  }

  return (
    <SolicitudesProvider>
      <div className="relative min-h-screen overflow-x-clip">
        <FormaOrganica className="-right-40 -top-40 h-[34rem] w-[34rem] text-sky/60" />
        <FormaOrganica className="-bottom-48 left-1/3 h-[30rem] w-[30rem] text-moss/20" />

        <MenuLateral
          sesion={sesion}
          vistaActiva={vistaActual}
          esCompacto={menuLateralEsCompacto}
          cajonAbierto={cajonAbierto}
          onNavegar={navegarA}
          onCerrarCajon={() => setCajonAbierto(false)}
          onIrAQuienesSomos={onIrAQuienesSomos}
          onCerrarSesion={onCerrarSesion}
        />
        {cajonAbierto && !menuLateralEsCompacto && (
          <div
            aria-hidden
            onClick={() => setCajonAbierto(false)}
            className="fade fixed inset-0 z-40 bg-oxford/50 backdrop-blur-sm"
          />
        )}

        <main className={`relative min-w-0 ${claseDelContenidoPrincipal}`}>
          {!menuLateralEsCompacto && (
            <header className="mb-8 flex items-center gap-4">
              <button
                onClick={() => setCajonAbierto(true)}
                aria-label="Abrir menú"
                aria-expanded={cajonAbierto}
                aria-controls="menu-lateral"
                className="leaf-sm grid h-12 w-12 cursor-pointer place-items-center bg-navy text-white shadow-card transition duration-300 hover:bg-oxford"
              >
                <Icono nombre="menu" />
              </button>
              <Logotipo />
            </header>
          )}
          {/* La key cambia en cada navegación: React reconstruye la pantalla, repite su animación y borra lo que tenía escrito (filtros, detalles abiertos). */}
          <div
            key={`${vistaActual}-${cantidadDeNavegaciones}`}
            className="rise mx-auto max-w-6xl"
          >
            {mostrarVistaActual()}
          </div>
        </main>
      </div>
    </SolicitudesProvider>
  );
}
