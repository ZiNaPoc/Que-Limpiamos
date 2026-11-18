import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { CatalogoProvider } from "./data/CatalogoContext";
import { ClientesProvider } from "./data/ClientesContext";
import { SolicitudesProvider } from "./data/SolicitudesContext";
import { TrabajadoresProvider } from "./data/TrabajadoresContext";
import "./index.css";

// Arranque de la app: los datos se comparten con estos proveedores (contextos)
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClientesProvider>
      <TrabajadoresProvider>
        <SolicitudesProvider>
          <CatalogoProvider>
            <App />
          </CatalogoProvider>
        </SolicitudesProvider>
      </TrabajadoresProvider>
    </ClientesProvider>
  </StrictMode>,
);
