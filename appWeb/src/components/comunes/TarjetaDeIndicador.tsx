type TarjetaDeIndicadorProps = {
  etiqueta: string;
  valor: number;
  descripcion?: string;
};

export function TarjetaDeIndicador({ etiqueta, valor, descripcion }: TarjetaDeIndicadorProps) {
  return (
    <div className="surface leaf-sm p-5 sm:p-6">
      <p className="font-display text-3xl font-extrabold text-navy">{valor}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate">{etiqueta}</p>
      {descripcion && <p className="mt-1 text-xs text-slate">{descripcion}</p>}
    </div>
  );
}
