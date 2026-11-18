import { useState } from "react";
import type { Sesion } from "./data/tipos";
import { BarraDeNavegacion } from "./components/BarraDeNavegacion";
import { PiePagina } from "./components/PiePagina";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { borrarSesion, guardarSesion, leerSesionGuardada } from "./utils/sesion";

// Páginas públicas y el panel (dashboard)
type PaginaActual = "landing" | "login" | "dashboard";

export default function App() {
  // Sesión del usuario: se recupera del navegador al abrir
  const [sesionActual, setSesionActual] = useState<Sesion | null>(leerSesionGuardada);
  const [paginaActual, setPaginaActual] = useState<PaginaActual>("landing");

  // Vuelve a la landing y baja a la sección pedida
  function irALaLanding(idDeSeccion: string) {
    setPaginaActual("landing");
    window.setTimeout(() => {
      const seccion = document.getElementById(idDeSeccion);
      if (seccion) {
        seccion.scrollIntoView();
      } else {
        window.scrollTo({ top: 0 });
      }
    }, 0);
  }

  // Con sesión va al panel; sin sesión va al login
  function abrirPanelOAcceso() {
    if (sesionActual) {
      setPaginaActual("dashboard");
      return;
    }
    setPaginaActual("login");
    window.scrollTo({ top: 0 });
  }

  // Login correcto: guarda la sesión y abre el panel
  function handleAccesoExitoso(nuevaSesion: Sesion) {
    guardarSesion(nuevaSesion);
    setSesionActual(nuevaSesion);
    setPaginaActual("dashboard");
    window.scrollTo({ top: 0 });
  }

  // Cierra sesión y regresa al inicio
  function handleCerrarSesion() {
    borrarSesion();
    setSesionActual(null);
    irALaLanding("inicio");
  }

  // El panel solo se muestra si hay sesión
  if (paginaActual === "dashboard" && sesionActual) {
    return <DashboardPage sesion={sesionActual} onCerrarSesion={handleCerrarSesion} onIrAQuienesSomos={() => irALaLanding("quienes-somos")} />;
  }

  // El botón cambia según haya sesión o no
  let textoDelBotonDeAcceso = "Acceder";
  if (sesionActual) {
    textoDelBotonDeAcceso = "Mi panel";
  }

  return (
    <>
      <BarraDeNavegacion onAcceder={abrirPanelOAcceso} onIrASeccion={irALaLanding} textoDelBotonDeAcceso={textoDelBotonDeAcceso} estaEnLaLanding={paginaActual === "landing"} laPaginaDeAccesoEstaActiva={paginaActual === "login"} />
      {/* Solo se muestra una página pública a la vez */}
      {paginaActual === "landing" && <LandingPage onAcceder={abrirPanelOAcceso} onIrASeccion={irALaLanding} />}
      {paginaActual === "login" && <LoginPage onAccesoExitoso={handleAccesoExitoso} />}
      <PiePagina onIrASeccion={irALaLanding} onAcceder={abrirPanelOAcceso} />
    </>
  );
}
