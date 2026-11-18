import { useEffect, useRef } from "react";
import type { ResultadoDeOperacion } from "../../data/tipos";
import { Icono } from "./Icono";

type AvisoTemporalProps = {
  aviso: ResultadoDeOperacion;
  onTerminar: () => void;
};

// Mensaje breve de éxito o error que se quita solo
//la pantalla guarda el ResultadoDeOperacion en un estado (aviso), lo dibuja aquí y, en onTerminar, lo vuelve a poner en null.
export function AvisoTemporal({ aviso, onTerminar }: AvisoTemporalProps) {
  // Se guarda la última función onTerminar para que el temporizador siempre llame a la más reciente
  const onTerminarRef = useRef(onTerminar);
  onTerminarRef.current = onTerminar;

  useEffect(() => {
    // Cuenta 4.5s y avisa que ya terminó. Si llega un aviso nuevo, el contador empieza de cero (depende de [aviso]).
    const temporizador = window.setTimeout(() => onTerminarRef.current(), 4500);
    return () => window.clearTimeout(temporizador);
  }, [aviso]);

  let icono: "palomita" | "alerta" = "palomita";
  let claseDelIcono = "text-moss";
  if (!aviso.exito) {
    icono = "alerta";
    claseDelIcono = "text-ochre";
  }

  // role="status" (éxito) o "alert" (error) hace que los lectores de pantalla lo anuncien solos
  return (
    <div role={aviso.exito ? "status" : "alert"} className="pop fixed bottom-6 left-1/2 z-[70] flex max-w-[90vw] -translate-x-1/2 items-center gap-2 rounded-full bg-oxford px-5 py-3 text-sm font-bold text-white shadow-lift">
      <Icono nombre={icono} className={`h-4 w-4 ${claseDelIcono}`} />
      {aviso.mensaje}
    </div>
  );
}
