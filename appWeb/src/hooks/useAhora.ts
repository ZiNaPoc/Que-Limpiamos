import { useEffect, useState } from "react";

// Hora actual que se actualiza sola cada minuto
export function useAhora(intervaloEnMilisegundos = 60000) {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const temporizador = window.setInterval(() => setAhora(new Date()), intervaloEnMilisegundos);
    return () => window.clearInterval(temporizador);
  }, [intervaloEnMilisegundos]);
  return ahora;
}
