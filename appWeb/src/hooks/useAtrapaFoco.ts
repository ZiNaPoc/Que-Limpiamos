import { useEffect, useRef } from "react";

const SELECTOR_DE_ELEMENTOS_ENFOCABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useAtrapaFoco<T extends HTMLElement>(estaActivo: boolean, alCerrar: () => void) {
  const contenedorRef = useRef<T>(null);
  const alCerrarRef = useRef(alCerrar);
  alCerrarRef.current = alCerrar;

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!estaActivo || !contenedor) {
      return;
    }
    const elementoConFocoPrevio = document.activeElement as HTMLElement | null;
    const temporizadorDelFoco = window.setTimeout(() => {
      const primerElemento = contenedor.querySelector<HTMLElement>(SELECTOR_DE_ELEMENTOS_ENFOCABLES);
      if (primerElemento) {
        primerElemento.focus();
      }
    }, 60);

    function handleTeclaPresionada(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        alCerrarRef.current();
        return;
      }
      if (evento.key !== "Tab" || !contenedor) {
        return;
      }
      const elementosEnfocables = Array.from(contenedor.querySelectorAll<HTMLElement>(SELECTOR_DE_ELEMENTOS_ENFOCABLES));
      if (elementosEnfocables.length === 0) {
        return;
      }
      const primerElemento = elementosEnfocables[0];
      const ultimoElemento = elementosEnfocables[elementosEnfocables.length - 1];
      const elementoActivo = document.activeElement;
      if (evento.shiftKey && (elementoActivo === primerElemento || !contenedor.contains(elementoActivo))) {
        evento.preventDefault();
        ultimoElemento.focus();
      } else if (!evento.shiftKey && (elementoActivo === ultimoElemento || !contenedor.contains(elementoActivo))) {
        evento.preventDefault();
        primerElemento.focus();
      }
    }

    document.addEventListener("keydown", handleTeclaPresionada);
    return () => {
      window.clearTimeout(temporizadorDelFoco);
      document.removeEventListener("keydown", handleTeclaPresionada);
      if (elementoConFocoPrevio) {
        elementoConFocoPrevio.focus();
      }
    };
  }, [estaActivo]);

  return contenedorRef;
}
