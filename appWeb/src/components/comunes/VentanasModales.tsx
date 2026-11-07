import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useAtrapaFoco } from "../../hooks/useAtrapaFoco";

type VentanaModalProps = {
  idDelTitulo: string;
  onCerrar: () => void;
  children: ReactNode;
  claseDeAncho?: string;
};

let cantidadDeModalesAbiertos = 0;
let estiloPrevioDelBody = { overflow: "", paddingRight: "" };

function bloquearDesplazamientoDelFondo() {
  if (cantidadDeModalesAbiertos === 0) {
    const { style } = document.body;
    estiloPrevioDelBody = { overflow: style.overflow, paddingRight: style.paddingRight };
    const anchoDeLaBarraDeDesplazamiento = window.innerWidth - document.documentElement.clientWidth;
    if (anchoDeLaBarraDeDesplazamiento > 0) {
      style.paddingRight = `${anchoDeLaBarraDeDesplazamiento}px`;
    }
    style.overflow = "hidden";
  }
  cantidadDeModalesAbiertos += 1;
}

function liberarDesplazamientoDelFondo() {
  cantidadDeModalesAbiertos -= 1;
  if (cantidadDeModalesAbiertos === 0) {
    document.body.style.overflow = estiloPrevioDelBody.overflow;
    document.body.style.paddingRight = estiloPrevioDelBody.paddingRight;
  }
}

export function VentanaModal({ idDelTitulo, onCerrar, children, claseDeAncho = "max-w-md" }: VentanaModalProps) {
  const panelRef = useAtrapaFoco<HTMLDivElement>(true, onCerrar);

  useEffect(() => {
    bloquearDesplazamientoDelFondo();
    return liberarDesplazamientoDelFondo;
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto p-4">
      <div aria-hidden onClick={onCerrar} className="fade fixed inset-0 bg-oxford/60 backdrop-blur-sm" />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={idDelTitulo} className={`pop leaf relative w-full ${claseDeAncho} bg-white p-6 shadow-lift sm:p-8`}>
        {children}
      </div>
    </div>,
    document.body,
  );
}

type VentanaDeConfirmacionProps = {
  titulo: string;
  lineasDeCambios: string[];
  etiquetaDeConfirmar: string;
  onConfirmar: () => void;
  onCancelar: () => void;
};

export function VentanaDeConfirmacion({ titulo, lineasDeCambios, etiquetaDeConfirmar, onConfirmar, onCancelar }: VentanaDeConfirmacionProps) {
  return (
    <VentanaModal idDelTitulo="titulo-de-confirmacion" onCerrar={onCancelar}>
      <h2 id="titulo-de-confirmacion" className="text-2xl font-extrabold text-navy">
        {titulo}
      </h2>
      <ul className="mt-5 space-y-2">
        {lineasDeCambios.map((linea) => (
          <li key={linea} className="rounded-2xl bg-beige px-4 py-3 text-sm text-storm">
            {linea}
          </li>
        ))}
      </ul>
      <div className="mt-7 flex justify-end gap-3">
        <button onClick={onCancelar} className="btn btn-quiet">
          Volver
        </button>
        <button onClick={onConfirmar} className="btn btn-primary">
          {etiquetaDeConfirmar}
        </button>
      </div>
    </VentanaModal>
  );
}
