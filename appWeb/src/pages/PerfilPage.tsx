import type { Sesion } from "../data/tipos";

export function PerfilPage({ sesion }: { sesion: Sesion }) {
  const datosDelPerfil = [
    ["Usuario", `@${sesion.nombreDeUsuario}`],
    ["Correo", sesion.correo],
    ["Rol", "Administrador"],
  ];
  return (
    <div>
      <h1 className="text-4xl font-extrabold text-navy">Perfil</h1>
      <div className="surface leaf mt-8 max-w-md p-8">
        <span className="pebble grid h-20 w-20 place-items-center bg-navy font-display text-3xl font-extrabold text-moss">{sesion.nombre.charAt(0)}</span>
        <p className="mt-5 font-display text-2xl font-extrabold text-navy">{sesion.nombre}</p>
        <dl className="mt-5 divide-y divide-mist text-sm">
          {datosDelPerfil.map(([etiqueta, valor]) => (
            <div key={etiqueta} className="flex justify-between gap-4 py-3.5">
              <dt className="text-slate">{etiqueta}</dt>
              <dd className="break-all font-bold text-navy">{valor}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 rounded-2xl bg-moon p-4 text-xs text-clay">Sesión de demostración guardada solo en esta pestaña. No es un sistema de autenticación seguro.</p>
      </div>
    </div>
  );
}
