type MapaDeUbicacionProps = {
  latitud: number;
  longitud: number;
  direccion: string;
};

const ANCHO_DEL_MAPA = 600;
const ALTO_DEL_MAPA = 380;
const LONGITUD_MINIMA = -86.9;
const LONGITUD_MAXIMA = -86.74;
const LATITUD_MINIMA = 21.04;
const LATITUD_MAXIMA = 21.21;

function calcularPosicionDelPin(latitud: number, longitud: number) {
  const x = ((longitud - LONGITUD_MINIMA) / (LONGITUD_MAXIMA - LONGITUD_MINIMA)) * ANCHO_DEL_MAPA;
  const y = ((LATITUD_MAXIMA - latitud) / (LATITUD_MAXIMA - LATITUD_MINIMA)) * ALTO_DEL_MAPA;
  return { x: Math.min(Math.max(x, 24), ANCHO_DEL_MAPA - 24), y: Math.min(Math.max(y, 40), ALTO_DEL_MAPA - 24) };
}

export function MapaDeUbicacion({ latitud, longitud, direccion }: MapaDeUbicacionProps) {
  const posicionDelPin = calcularPosicionDelPin(latitud, longitud);
  return (
    <div className="relative h-full min-h-64 overflow-hidden bg-moon">
      <svg viewBox={`0 0 ${ANCHO_DEL_MAPA} ${ALTO_DEL_MAPA}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Mapa ilustrativo con la ubicación: ${direccion}`} className="absolute inset-0 h-full w-full">
        <rect width={ANCHO_DEL_MAPA} height={ALTO_DEL_MAPA} className="fill-moon" />
        <path d="M430 0C470 60 520 110 505 190C490 270 560 320 600 380L600 0Z" className="fill-sky" />
        <path d="M60 250C110 220 200 240 230 300C250 340 180 380 90 380L0 380L0 290Z" className="fill-moss/50" />
        <path d="M250 60C300 40 360 70 350 120C340 160 280 170 240 140C215 120 220 80 250 60Z" className="fill-moss/50" />
        <g className="stroke-white" strokeWidth="9" strokeLinecap="round" fill="none">
          <path d="M0 110H560" />
          <path d="M0 215H600" />
          <path d="M0 320H520" />
          <path d="M120 0V380" />
          <path d="M255 0V380" />
          <path d="M380 0V300" />
          <path d="M20 40L420 380" strokeWidth="6" />
        </g>
        <g className="stroke-white/70" strokeWidth="4" fill="none">
          <path d="M0 160H450" />
          <path d="M190 0V380" />
          <path d="M320 0V380" />
          <path d="M0 270H480" />
        </g>
        <g transform={`translate(${posicionDelPin.x} ${posicionDelPin.y})`}>
          <circle r="16" className="pin-ring fill-lagoon/50" />
          <path d="M0 0C-14 -16 -20 -26 -20 -36A20 20 0 0 1 20 -36C20 -26 14 -16 0 0Z" className="fill-navy stroke-white" strokeWidth="3" />
          <circle cy="-36" r="7" className="fill-moss" />
        </g>
      </svg>
      <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate">Mapa ilustrativo</span>
    </div>
  );
}
