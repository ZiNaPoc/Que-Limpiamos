import type { ServicioDelCatalogo } from "./tipos";

export const SERVICIOS_DE_DEMOSTRACION: ServicioDelCatalogo[] = [
  {
    id: "C-01",
    nombre: "Limpieza general",
    descripcion: "Pisos, baños, cocina y polvo en superficies.",
    precioBase: 450,
    costoPorMetroCuadrado: 6,
    costoPorHabitacion: 80,
    categoria: "Principal",
    estado: "Activo",
  },
  {
    id: "C-04",
    nombre: "Limpieza de ventanas",
    descripcion: "Vidrios interiores y exteriores accesibles.",
    precioBase: 300,
    costoPorMetroCuadrado: 0,
    costoPorHabitacion: 0,
    categoria: "Extra",
    estado: "Activo",
  },
  {
    id: "C-05",
    nombre: "Limpieza de cocina",
    descripcion: "Cocina completa, campana y estufa.",
    precioBase: 400,
    costoPorMetroCuadrado: 0,
    costoPorHabitacion: 0,
    categoria: "Extra",
    estado: "Activo",
  },
  {
    id: "C-08",
    nombre: "Limpieza de cajonera",
    descripcion: "Cajones por dentro y por fuera.",
    precioBase: 150,
    costoPorMetroCuadrado: 0,
    costoPorHabitacion: 0,
    categoria: "Extra",
    estado: "Inactivo",
  },
];
