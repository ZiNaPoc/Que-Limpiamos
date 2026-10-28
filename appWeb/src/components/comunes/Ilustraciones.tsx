import type { ReactNode } from "react";

export type NombreDeIlustracion = "casa" | "equipo" | "app" | "intuitiva" | "confianza" | "cotizacion" | "reputacion";

function Destello({ x, y, escala = 1, className = "fill-moss" }: { x: number; y: number; escala?: number; className?: string }) {
  return <path transform={`translate(${x} ${y}) scale(${escala})`} className={className} d="M0 -22L5 -5L22 0L5 5L0 22L-5 5L-22 0L-5 -5Z" />;
}

function Burbuja({ x, y, radio }: { x: number; y: number; radio: number }) {
  return <circle cx={x} cy={y} r={radio} className="fill-white/40 stroke-white" strokeWidth="2" />;
}

function MarcoDeIlustracion({ children, colorDeFondo }: { children: ReactNode; colorDeFondo: string }) {
  return (
    <svg viewBox="0 0 400 480" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <rect width="400" height="480" className={colorDeFondo} />
      {children}
    </svg>
  );
}

function IlustracionCasa() {
  return (
    <MarcoDeIlustracion colorDeFondo="fill-sky">
      <circle cx="285" cy="150" r="82" className="fill-moon" />
      <rect x="62" y="96" width="150" height="230" rx="75" className="fill-white/70" />
      <path d="M137 96V326M62 200H212" className="stroke-sky" strokeWidth="5" fill="none" />
      <path d="M0 360C80 330 160 390 250 358C320 334 360 340 400 352V480H0Z" className="fill-teal" />
      <path d="M0 410C90 384 180 436 280 408C340 392 370 396 400 404V480H0Z" className="fill-navy" />
      <path d="M170 292H262L248 380H184Z" className="fill-lagoon" />
      <path d="M182 292C182 250 250 250 250 292" className="stroke-navy" strokeWidth="6" fill="none" />
      <rect x="164" y="282" width="108" height="14" rx="7" className="fill-moss" />
      <rect x="296" y="268" width="56" height="112" rx="20" className="fill-sage" />
      <rect x="312" y="238" width="24" height="38" rx="8" className="fill-storm" />
      <path d="M336 244H368" className="stroke-storm" strokeWidth="8" strokeLinecap="round" />
      <path d="M44 372C40 330 70 300 96 300C98 340 76 372 44 372Z" className="fill-sage" />
      <path d="M96 372C100 336 130 316 150 322C146 354 126 374 96 372Z" className="fill-moss" />
      <Burbuja x={210} y={236} radio={14} />
      <Burbuja x={238} y={210} radio={9} />
      <Burbuja x={196} y={196} radio={6} />
      <Destello x={338} y={86} escala={1.2} />
      <Destello x={104} y={60} escala={0.8} className="fill-white" />
      <Destello x={52} y={238} escala={0.6} className="fill-moon" />
    </MarcoDeIlustracion>
  );
}

function IlustracionEquipo() {
  return (
    <MarcoDeIlustracion colorDeFondo="fill-moon">
      <circle cx="200" cy="230" r="150" className="fill-sky" />
      <path d="M110 250L200 150L290 250V350H110Z" className="fill-white" />
      <path d="M92 258L200 138L308 258" className="stroke-navy" strokeWidth="14" strokeLinejoin="round" strokeLinecap="round" fill="none" />
      <rect x="176" y="288" width="48" height="62" rx="24" className="fill-lagoon" />
      <rect x="128" y="262" width="34" height="34" rx="9" className="fill-sky" />
      <rect x="238" y="262" width="34" height="34" rx="9" className="fill-sky" />
      <path d="M200 215C190 203 178 197 178 187C178 178 186 174 192 176C196 177 199 180 200 183C201 180 204 177 208 176C214 174 222 178 222 187C222 197 210 203 200 215Z" className="fill-moss" />
      <path d="M0 380C100 350 200 410 300 376C350 360 380 364 400 372V480H0Z" className="fill-teal" />
      <path d="M0 430C110 406 220 456 320 428C360 418 384 420 400 424V480H0Z" className="fill-navy" />
      <Destello x={330} y={110} escala={1.1} className="fill-sage" />
      <Destello x={70} y={150} escala={0.8} className="fill-moss" />
    </MarcoDeIlustracion>
  );
}

function IlustracionApp() {
  return (
    <MarcoDeIlustracion colorDeFondo="fill-sky">
      <circle cx="90" cy="110" r="60" className="fill-moon" />
      <rect x="110" y="60" width="180" height="360" rx="34" className="fill-navy" />
      <rect x="122" y="76" width="156" height="328" rx="24" className="fill-beige" />
      <rect x="140" y="104" width="86" height="12" rx="6" className="fill-storm" />
      <rect x="140" y="130" width="120" height="8" rx="4" className="fill-teal/50" />
      <rect x="140" y="168" width="120" height="58" rx="16" className="fill-white" />
      <circle cx="166" cy="197" r="12" className="fill-moss" />
      <rect x="188" y="186" width="56" height="8" rx="4" className="fill-steel/60" />
      <rect x="188" y="202" width="40" height="8" rx="4" className="fill-mist" />
      <rect x="140" y="238" width="120" height="58" rx="16" className="fill-white" />
      <circle cx="166" cy="267" r="12" className="fill-sky" />
      <rect x="188" y="256" width="56" height="8" rx="4" className="fill-steel/60" />
      <rect x="188" y="272" width="40" height="8" rx="4" className="fill-mist" />
      <rect x="140" y="336" width="120" height="40" rx="14" className="fill-lagoon" />
      <rect x="168" y="352" width="64" height="8" rx="4" className="fill-white" />
      <path d="M318 250C318 226 346 226 346 250C346 266 332 282 332 282C332 282 318 266 318 250Z" className="fill-teal" />
      <circle cx="332" cy="248" r="6" className="fill-white" />
      <path d="M0 440C100 416 200 460 300 438C350 428 380 430 400 436V480H0Z" className="fill-teal" />
      <Destello x={320} y={110} escala={1} />
    </MarcoDeIlustracion>
  );
}

function IlustracionIntuitiva() {
  return (
    <MarcoDeIlustracion colorDeFondo="fill-moss/60">
      <circle cx="200" cy="230" r="120" className="fill-white/60" />
      <rect x="130" y="130" width="140" height="210" rx="26" className="fill-navy" />
      <rect x="140" y="146" width="120" height="178" rx="16" className="fill-beige" />
      <rect x="154" y="166" width="92" height="24" rx="12" className="fill-lagoon" />
      <rect x="154" y="204" width="92" height="24" rx="12" className="fill-sky" />
      <rect x="154" y="242" width="92" height="24" rx="12" className="fill-sky" />
      <circle cx="250" cy="290" r="22" className="fill-moss" />
      <path d="M240 290L248 298L262 282" className="stroke-oxford" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Destello x={80} y={120} escala={0.9} className="fill-white" />
    </MarcoDeIlustracion>
  );
}

function IlustracionConfianza() {
  return (
    <MarcoDeIlustracion colorDeFondo="fill-sky">
      <circle cx="200" cy="240" r="130" className="fill-moon" />
      <path d="M200 120L290 156V250C290 306 250 342 200 362C150 342 110 306 110 250V156Z" className="fill-navy" />
      <path d="M200 144L268 172V250C268 292 238 320 200 336C162 320 132 292 132 250V172Z" className="fill-lagoon" />
      <path d="M164 246L192 274L240 214" className="stroke-white" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Destello x={310} y={110} escala={0.9} className="fill-sage" />
      <Destello x={86} y={330} escala={0.7} className="fill-teal" />
    </MarcoDeIlustracion>
  );
}

function IlustracionCotizacion() {
  return (
    <MarcoDeIlustracion colorDeFondo="fill-moon">
      <circle cx="200" cy="240" r="130" className="fill-sky" />
      <rect x="120" y="130" width="160" height="220" rx="24" className="fill-white" />
      <rect x="140" y="152" width="120" height="48" rx="12" className="fill-navy" />
      <text x="250" y="186" textAnchor="end" className="fill-moss" fontSize="28" fontWeight="700">$850</text>
      <circle cx="162" cy="238" r="12" className="fill-sky" />
      <circle cx="200" cy="238" r="12" className="fill-sky" />
      <circle cx="238" cy="238" r="12" className="fill-sky" />
      <circle cx="162" cy="278" r="12" className="fill-sky" />
      <circle cx="200" cy="278" r="12" className="fill-sky" />
      <circle cx="238" cy="278" r="12" className="fill-lagoon" />
      <rect x="146" y="308" width="108" height="20" rx="10" className="fill-moss" />
      <Destello x={300} y={120} escala={0.9} className="fill-teal" />
    </MarcoDeIlustracion>
  );
}

function IlustracionReputacion() {
  return (
    <MarcoDeIlustracion colorDeFondo="fill-frost/60">
      <circle cx="200" cy="240" r="130" className="fill-white/60" />
      <path d="M200 120L226 188L298 194L242 240L260 310L200 272L140 310L158 240L102 194L174 188Z" className="fill-navy" />
      <path d="M200 148L216 192L262 196L226 226L238 270L200 246L162 270L174 226L138 196L184 192Z" className="fill-moss" />
      <Destello x={316} y={120} escala={0.9} className="fill-white" />
      <Destello x={84} y={320} escala={0.7} className="fill-moon" />
    </MarcoDeIlustracion>
  );
}

const ILUSTRACIONES: Record<NombreDeIlustracion, () => ReactNode> = {
  casa: IlustracionCasa,
  equipo: IlustracionEquipo,
  app: IlustracionApp,
  intuitiva: IlustracionIntuitiva,
  confianza: IlustracionConfianza,
  cotizacion: IlustracionCotizacion,
  reputacion: IlustracionReputacion,
};

type ImagenOIlustracionProps = {
  rutaDeImagen: string;
  textoAlternativo: string;
  ilustracionDeRespaldo: NombreDeIlustracion;
  className?: string;
};

export function ImagenOIlustracion({ rutaDeImagen, textoAlternativo, ilustracionDeRespaldo, className = "" }: ImagenOIlustracionProps) {
  if (rutaDeImagen) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img src={rutaDeImagen} alt={textoAlternativo} className="absolute inset-0 h-full w-full object-cover" />
      </div>
    );
  }
  const Ilustracion = ILUSTRACIONES[ilustracionDeRespaldo];
  return (
    <div role="img" aria-label={textoAlternativo} className={`relative overflow-hidden ${className}`}>
      <Ilustracion />
    </div>
  );
}
