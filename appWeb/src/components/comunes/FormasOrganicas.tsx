import { MARCA } from "../../data/configuracion";

export function FormaOrganica({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-100 -100 200 200" className={`pointer-events-none absolute ${className}`} aria-hidden>
      <path fill="currentColor" d="M42 -48C58 -34 66 -12 62 8C58 28 42 46 20 56C-2 66 -28 62 -46 46C-64 30 -72 4 -64 -20C-56 -44 -34 -64 -8 -66C18 -68 26 -62 42 -48Z" />
    </svg>
  );
}

export function OlaDivisoria({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={`pointer-events-none block h-12 w-full sm:h-20 ${className}`} aria-hidden>
      <path fill="currentColor" d="M0 64C160 112 320 112 520 72C720 32 900 8 1100 40C1260 66 1360 88 1440 72V120H0Z" />
    </svg>
  );
}

export function OlasDeFondo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 240" preserveAspectRatio="none" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden>
      <path fill="#46707e" fillOpacity="0.45" d="M0 150C120 110 220 190 360 150C500 110 620 70 800 120V240H0Z" />
      <path fill="#567c8d" fillOpacity="0.4" d="M0 190C140 150 260 220 400 190C540 160 660 140 800 175V240H0Z" />
    </svg>
  );
}

export function Logotipo() {
  return (
    <span className="inline-flex shrink-0">
      <img src={MARCA.logo} alt="Logotipo de ¿Qué limpiamos?" className="h-12 w-auto" />
    </span>
  );
}

export function TituloDeMarca({ className = "" }: { className?: string }) {
  return <img src={MARCA.titulo} alt="¿Qué limpiamos?" className={className} />;
}
