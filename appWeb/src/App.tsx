import { useState } from "react";
import type { Sesion } from "./data/tipos";
import { BarraDeNavegacion } from "./components/BarraDeNavegacion";
import { PiePagina } from "./components/PiePagina";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { borrarSesion, guardarSesion, leerSesionGuardada } from "./utils/sesion";

type PaginaActual = "landing" | "login" | "dashboard";

export default function App() {
  const [sesionActual, setSesionActual] = useState<Sesion | null>(leerSesionGuardada);
  const [paginaActual, setPaginaActual] = useState<PaginaActual>("landing");

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

  function abrirPanelOAcceso() {
    if (sesionActual) {
      setPaginaActual("dashboard");
      return;
    }
    setPaginaActual("login");
    window.scrollTo({ top: 0 });
  }

  function handleAccesoExitoso(nuevaSesion: Sesion) {
    guardarSesion(nuevaSesion);
    setSesionActual(nuevaSesion);
    setPaginaActual("dashboard");
    window.scrollTo({ top: 0 });
  }

  function handleCerrarSesion() {
    borrarSesion();
    setSesionActual(null);
    irALaLanding("inicio");
  }

  if (paginaActual === "dashboard" && sesionActual) {
    return <DashboardPage sesion={sesionActual} onCerrarSesion={handleCerrarSesion} onIrAQuienesSomos={() => irALaLanding("quienes-somos")} />;
  }

  let textoDelBotonDeAcceso = "Acceder";
  if (sesionActual) {
    textoDelBotonDeAcceso = "Mi panel";
  }

  return (
    <>
      <BarraDeNavegacion onAcceder={abrirPanelOAcceso} onIrASeccion={irALaLanding} textoDelBotonDeAcceso={textoDelBotonDeAcceso} estaEnLaLanding={paginaActual === "landing"} laPaginaDeAccesoEstaActiva={paginaActual === "login"} />
      {paginaActual === "landing" && <LandingPage onAcceder={abrirPanelOAcceso} onIrASeccion={irALaLanding} />}
      {paginaActual === "login" && <LoginPage onAccesoExitoso={handleAccesoExitoso} />}
      <PiePagina onIrASeccion={irALaLanding} onAcceder={abrirPanelOAcceso} />
    </>
  );
}
