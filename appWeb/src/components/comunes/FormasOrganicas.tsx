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

export function Logotipo({ claro = false, mostrarTexto = true }: { claro?: boolean; mostrarTexto?: boolean }) {
  let colorDelTexto = "text-navy";
  let claseDelSimbolo = "bg-navy text-moss";
  if (claro) {
    colorDelTexto = "text-moon";
    claseDelSimbolo = "bg-moss text-oxford";
  }
  return (
    <span className="flex items-center gap-3">
      <span className={`pebble grid h-11 w-11 shrink-0 place-items-center ${claseDelSimbolo}`} aria-hidden>
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8zM19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9z" />
        </svg>
      </span>
      {mostrarTexto && (
        <span className={`font-display text-lg font-extrabold leading-[1.05] ${colorDelTexto}`}>
          ¿Qué
          <span className="ml-3 block">limpiamos?</span>
        </span>
      )}
    </span>
  );
}
