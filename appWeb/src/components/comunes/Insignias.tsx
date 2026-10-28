const ESTILOS_POR_ESTADO: Record<string, { fondo: string; punto: string }> = {
  Pendiente: { fondo: "bg-moon text-clay", punto: "bg-ochre" },
  Abierto: { fondo: "bg-moon text-clay", punto: "bg-ochre" },
  "Por validar": { fondo: "bg-moon text-clay", punto: "bg-ochre" },
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
  return <span className="rounded-full bg-moon px-3 py-1 text-xs font-bold text-clay">Datos de demostración</span>;
}
