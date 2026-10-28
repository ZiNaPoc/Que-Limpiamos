import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { CatalogoProvider } from "./data/CatalogoContext";
import { ReportesProvider } from "./data/ReportesContext";
import { SolicitudesProvider } from "./data/SolicitudesContext";
import { TrabajadoresProvider } from "./data/TrabajadoresContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TrabajadoresProvider>
      <SolicitudesProvider>
        <ReportesProvider>
          <CatalogoProvider>
            <App />
          </CatalogoProvider>
        </ReportesProvider>
      </SolicitudesProvider>
    </TrabajadoresProvider>
  </StrictMode>,
);
