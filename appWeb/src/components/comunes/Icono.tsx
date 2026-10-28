const TRAZOS_DE_ICONOS = {
  inicio: "M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6",
  bandeja: "M4 13l2-8h12l2 8v6H4zM4 13h5l1 2h4l1-2h5",
  trabajadores: "M3 5h18v14H3zM9 11a2 2 0 100-4 2 2 0 000 4zM6 16c0-2 6-2 6 0M14 9h4M14 13h4",
  catalogo: "M4 5h16v4H4zM4 11h16v4H4zM4 17h16v3H4z",
  clientes: "M4 14v-2a8 8 0 0116 0v2M4 14h3v5H4zM17 14h3v5h-3z",
  reportes: "M6 3h9l4 4v14H6zM9 12h7M9 16h7",
  estrella: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  informacion: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v6M12 8h.01",
  salir: "M9 4H5v16h4M16 8l4 4-4 4M20 12H9",
  menu: "M4 7h16M4 12h10M4 17h16",
  chevronDerecho: "M9 6l6 6-6 6",
  flechaAbajo: "M6 9l6 6 6-6",
  buscar: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
  calendario: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  reloj: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
  ubicacion: "M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  usuario: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.6-6 8-6s8 2 8 6",
  telefono: "M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z",
  correo: "M3 6h18v12H3zM3 7l9 7 9-7",
  cerrar: "M6 6l12 12M18 6L6 18",
  palomita: "M5 12.5l4.5 4.5L19 7.5",
  editar: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4",
  alerta: "M12 3l10 18H2zM12 10v5M12 18h.01",
  volver: "M19 12H5M11 6l-6 6 6 6",
  flecha: "M5 12h14M13 6l6 6-6 6",
  restablecer: "M3 12a9 9 0 109-9M3 4v5h5",
  filtros: "M4 7h10M18 7h2M4 17h2M10 17h10M16 4v6M8 14v6",
  ojo: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z",
  descargar: "M12 4v11M7 11l5 5 5-5M5 20h14",
  imagen: "M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15.5 9.5h.01",
  mas: "M12 5v14M5 12h14",
  chevronIzquierdo: "M15 6l-6 6 6 6",
  subir: "M12 20V9M7 13l5-5 5 5M5 4h14",
} as const;

export type NombreDeIcono = keyof typeof TRAZOS_DE_ICONOS;

export function Icono({ nombre, className = "" }: { nombre: NombreDeIcono; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 shrink-0 ${className}`} aria-hidden>
      <path d={TRAZOS_DE_ICONOS[nombre]} />
    </svg>
  );
}
