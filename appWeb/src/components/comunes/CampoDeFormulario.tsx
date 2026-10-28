import type { ReactNode } from "react";

type CampoDeFormularioProps = {
  id: string;
  etiqueta: string;
  error?: string;
  children: ReactNode;
};

export function CampoDeFormulario({ id, etiqueta, error, children }: CampoDeFormularioProps) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {etiqueta}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-semibold text-err">
          {error}
        </p>
      )}
    </div>
  );
}
