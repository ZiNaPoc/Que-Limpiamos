import { useState } from "react";
import type { Sesion } from "./data/tipos";
import { BarraDeNavegacion } from "./components/BarraDeNavegacion";
import { PiePagina } from "./components/PiePagina";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import {
  borrarSesion,
  guardarSesion,
  leerSesionGuardada,
} from "./utils/sesion";

// App decide qué pantalla se ve.

type PaginaActual = "landing" | "login" | "dashboard";

export default function App() {
  // Datos de quien inició sesión (id, nombre, correo, rol). Se leen de sessionStorage al abrir.
  // Si es null no hay sesión y el panel no se puede abrir.
  const [sesionActual, setSesionActual] = useState<Sesion | null>(
    leerSesionGuardada,
  );
  // Pantalla visible ahora: landing, login o dashboard.
  const [paginaActual, setPaginaActual] = useState<PaginaActual>("landing");

  // Vuelve a la landing y baja a la sección pedida (por su id).
  // El setTimeout de 0 espera a que la landing ya esté dibujada para poder encontrar la sección.
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

  // Botón "Acceder" / "Mi panel": con sesión abre el panel; sin sesión abre el login.
  function abrirPanelOAcceso() {
    if (sesionActual) {
      setPaginaActual("dashboard");
      return;
    }
    setPaginaActual("login");
    window.scrollTo({ top: 0 });
  }

  // El login avisa aquí cuando el servidor aceptó el acceso: se guarda la sesión y se abre el panel.
  function handleAccesoExitoso(nuevaSesion: Sesion) {
    guardarSesion(nuevaSesion);
    setSesionActual(nuevaSesion);
    setPaginaActual("dashboard");
    window.scrollTo({ top: 0 });
  }

  // Cierra sesión y regresa al inicio.
  // lo ideal es esperar la respuesta del logout y, pase lo que pase, cerrar la sesión en la web.
  function handleCerrarSesion() {
    borrarSesion();
    setSesionActual(null);
    irALaLanding("inicio");
  }

  // El panel solo se muestra si hay sesión. El panel ocupa toda la pantalla, por eso no lleva la barra ni el pie públicos.
  if (paginaActual === "dashboard" && sesionActual) {
    return (
      <DashboardPage
        sesion={sesionActual}
        onCerrarSesion={handleCerrarSesion}
        onIrAQuienesSomos={() => irALaLanding("quienes-somos")}
      />
    );
  }

  // El botón de la barra dice "Mi panel" si hay sesión y "Acceder" si no.
  let textoDelBotonDeAcceso = "Acceder";
  if (sesionActual) {
    textoDelBotonDeAcceso = "Mi panel";
  }

  return (
    <>
      <BarraDeNavegacion
        onAcceder={abrirPanelOAcceso}
        onIrASeccion={irALaLanding}
        textoDelBotonDeAcceso={textoDelBotonDeAcceso}
        estaEnLaLanding={paginaActual === "landing"}
        laPaginaDeAccesoEstaActiva={paginaActual === "login"}
      />
      {/* Solo se muestra una página pública a la vez: landing o login. La barra y el pie se quedan siempre. */}
      {paginaActual === "landing" && (
        <LandingPage
          onAcceder={abrirPanelOAcceso}
          onIrASeccion={irALaLanding}
        />
      )}
      {paginaActual === "login" && (
        <LoginPage onAccesoExitoso={handleAccesoExitoso} />
      )}
      <PiePagina onIrASeccion={irALaLanding} onAcceder={abrirPanelOAcceso} />
    </>
  );
}
