const ESTILOS_POR_ESTADO: Record<string, { fondo: string; punto: string }> = {
  Pendiente: { fondo: "bg-moon text-clay", punto: "bg-ochre" },
  Abierto: { fondo: "bg-moon text-clay", punto: "bg-ochre" },
  "Por validar": { fondo: "bg-moon text-clay", punto: "bg-ochre" },
  "Por verificar": { fondo: "bg-moon text-clay", punto: "bg-ochre" },
  "Fuera de horario": { fondo: "bg-mist text-slate", punto: "bg-slate" },
  "En servicio": { fondo: "bg-sky text-storm", punto: "bg-steel" },
  Verificada: { fondo: "bg-moss/45 text-storm", punto: "bg-sage" },
  Rechazada: { fondo: "bg-mist text-slate", punto: "bg-err" },
  Aprobado: { fondo: "bg-moss/45 text-storm", punto: "bg-sage" },
  Rechazado: { fondo: "bg-mist text-slate", punto: "bg-err" },
  Confirmado: { fondo: "bg-sky text-storm", punto: "bg-steel" },
  "En seguimiento": { fondo: "bg-sky text-storm", punto: "bg-steel" },
  Ocupado: { fondo: "bg-sky text-storm", punto: "bg-steel" },
  Realizado: { fondo: "bg-moss/45 text-storm", punto: "bg-sage" },
  Cerrado: { fondo: "bg-moss/45 text-storm", punto: "bg-sage" },
  Verificado: { fondo: "bg-moss/45 text-storm", punto: "bg-sage" },
  Disponible: { fondo: "bg-moss/45 text-storm", punto: "bg-sage" },
  Activo: { fondo: "bg-moss/45 text-storm", punto: "bg-sage" },
  Resuelto: { fondo: "bg-moss/45 text-storm", punto: "bg-sage" },
  "En revisión": { fondo: "bg-sky text-storm", punto: "bg-steel" },
  Inactivo: { fondo: "bg-mist text-slate", punto: "bg-slate" },
  Cancelado: { fondo: "bg-mist text-slate", punto: "bg-err" },
};

export function InsigniaDeEstado({ estado }: { estado: string }) {
  const estilo = ESTILOS_POR_ESTADO[estado] ?? { fondo: "bg-sky text-storm", punto: "bg-steel" };
  return (
    <span className={`inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${estilo.fondo}`}>
      <span className={`h-2 w-2 rounded-full ${estilo.punto}`} aria-hidden />
      {estado}
    </span>
  );
}

export function InsigniaDeDatosDeDemostracion() {
  return (
    <span title="Aún no hay backend: los datos son de demostración y los cambios se pierden al cerrar la pestaña." className="cursor-help rounded-full bg-moon px-3 py-1 text-xs font-bold text-clay">
      Datos de demostración
    </span>
  );
}

// Calificación de «Califica tu servicio» (1 a 5). La app la representa con escobas.
export function Puntuacion({ valor, tamano = "h-4 w-4" }: { valor: number; tamano?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${valor} de 5`}>
      {[1, 2, 3, 4, 5].map((posicion) => (
        <svg key={posicion} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`${tamano} ${posicion <= Math.round(valor) ? "text-lagoon" : "text-mist"}`} aria-hidden>
          <path d="M14.5 3.5l-4 7M7.5 10.5l6 3.4-2.6 6.6c-2.4-.3-5.3-2-6.9-4.1z" />
        </svg>
      ))}
    </span>
  );
}
