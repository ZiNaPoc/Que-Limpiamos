import type { MouseEvent } from "react";
import { SECCIONES_DE_LA_LANDING } from "../data/configuracion";
import { Logotipo } from "./comunes/FormasOrganicas";

type PiePaginaProps = {
  onIrASeccion: (idDeSeccion: string) => void;
  onAcceder: () => void;
};

export function PiePagina({ onIrASeccion, onAcceder }: PiePaginaProps) {
  function handleClicEnEnlaceDeSeccion(evento: MouseEvent<HTMLAnchorElement>, idDeSeccion: string) {
    evento.preventDefault();
    onIrASeccion(idDeSeccion);
  }

  return (
    <footer className="bg-oxford px-5 pb-8 text-sm text-sky">
      <div className="mx-auto max-w-6xl border-t border-white/10 pt-10">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <Logotipo claro />
          <nav aria-label="Pie de página" className="flex flex-wrap justify-center gap-6 font-semibold">
            {SECCIONES_DE_LA_LANDING.map((seccion) => (
              <a key={seccion.id} href={`#${seccion.id}`} onClick={(evento) => handleClicEnEnlaceDeSeccion(evento, seccion.id)} className="transition duration-300 hover:text-white">
                {seccion.etiqueta}
              </a>
            ))}
            <button onClick={onAcceder} className="cursor-pointer font-semibold transition duration-300 hover:text-white">
              Acceder
            </button>
          </nav>
          <p className="text-center md:text-right">Cancún, Quintana Roo<br />contacto@quelimpiamos.example (provisional)</p>
        </div>
        <p className="mt-10 text-center text-xs text-frost">© 2026 ¿Qué limpiamos? · Proyecto académico de la UT Cancún. Los precios en la app son estimaciones.</p>
      </div>
    </footer>
  );
}
