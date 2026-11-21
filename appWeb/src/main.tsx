import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { CatalogoProvider } from "./data/CatalogoContext";
import { ClientesProvider } from "./data/ClientesContext";
import { SolicitudesProvider } from "./data/SolicitudesProvider";
import { TrabajadoresProvider } from "./data/TrabajadoresContext";
import "./index.css";

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
