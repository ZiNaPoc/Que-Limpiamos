// Color de cada estado (de solicitud, INE, colaborador y servicio). Un estado que no esté aquí usa el color por defecto.
const ESTILOS_POR_ESTADO: Record<string, { fondo: string; punto: string }> = {
  "Solicitud enviada": { fondo: "bg-moon text-clay", punto: "bg-ochre" },
  "Asignando colaborador": { fondo: "bg-sky/70 text-storm", punto: "bg-lagoon" },
  "Servicio confirmado": { fondo: "bg-sky text-storm", punto: "bg-steel" },
  "Servicio finalizado": { fondo: "bg-moss/45 text-storm", punto: "bg-sage" },
  Cancelada: { fondo: "bg-mist text-slate", punto: "bg-err" },
  Pendiente: { fondo: "bg-moon text-clay", punto: "bg-ochre" },
  Verificada: { fondo: "bg-moss/45 text-storm", punto: "bg-sage" },
  Rechazada: { fondo: "bg-mist text-slate", punto: "bg-err" },
  Disponible: { fondo: "bg-moss/45 text-storm", punto: "bg-sage" },
  "En servicio": { fondo: "bg-sky text-storm", punto: "bg-steel" },
  "Fuera de horario": { fondo: "bg-mist text-slate", punto: "bg-slate" },
  Activo: { fondo: "bg-moss/45 text-storm", punto: "bg-sage" },
  Inactivo: { fondo: "bg-mist text-slate", punto: "bg-slate" },
};

// Etiqueta de color según el estado.
export function InsigniaDeEstado({ estado }: { estado: string }) {
  const estilo = ESTILOS_POR_ESTADO[estado] ?? { fondo: "bg-sky text-storm", punto: "bg-steel" };
  return (
    <span className={`inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${estilo.fondo}`}>
      <span className={`h-2 w-2 rounded-full ${estilo.punto}`} aria-hidden />
      {estado}
    </span>
  );
}

// Aviso "Datos de demostración".
// Se usa en Inicio, Solicitudes, Clientes, Catálogo, Colaboradores y Reseñas. Cuando una de esas pantallas ya lea del back, hay que quitarla de ahí.
export function InsigniaDeDatosDeDemostracion() {
  return (
    <span title="El backend todavía no ofrece esta información: los datos son de demostración y los cambios solo se guardan en este navegador." className="cursor-help rounded-full bg-moon px-3 py-1 text-xs font-bold text-clay">
      Datos de demostración
    </span>
  );
}

// Estrellas de 1 a 5. Un lector de pantalla lee "X de 5 estrellas".
export function Puntuacion({ valor, tamano = "h-4 w-4" }: { valor: number; tamano?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${valor.toFixed(1).replace(".0", "")} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((posicion) => (
        <svg key={posicion} viewBox="0 0 24 24" className={`${tamano} ${posicion <= Math.round(valor) ? "text-ochre" : "text-mist"}`} fill="currentColor" aria-hidden>
          <path d="M12 2.8l2.8 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17l-5.6 3 1.1-6.2-4.6-4.4 6.3-.9z" />
        </svg>
      ))}
    </span>
  );
}
