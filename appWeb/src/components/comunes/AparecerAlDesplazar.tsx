import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

function useElementoVisible<T extends HTMLElement>() {
  const elementoRef = useRef<T>(null);
  const [fueVisto, setFueVisto] = useState(false);
  useEffect(() => {
    const elemento = elementoRef.current;
    if (!elemento) {
      return;
    }
    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) {
        setFueVisto(true);
        observador.disconnect();
      }
    }, { threshold: 0.15 });
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);
  return { elementoRef, fueVisto };
}

type AparecerAlDesplazarProps = {
  children: ReactNode;
  retrasoEnMilisegundos?: number;
  className?: string;
};

export function AparecerAlDesplazar({ children, retrasoEnMilisegundos = 0, className = "" }: AparecerAlDesplazarProps) {
  const { elementoRef, fueVisto } = useElementoVisible<HTMLDivElement>();
  const estilo = { "--delay": `${retrasoEnMilisegundos}ms` } as CSSProperties;
  let clases = `reveal ${className}`;
  if (fueVisto) {
    clases += " visible";
  }
  return (
    <div ref={elementoRef} style={estilo} className={clases}>
      {children}
    </div>
  );
}
