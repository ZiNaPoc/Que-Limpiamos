NOMBRE DEL PROYECTO: ¿QUÉ LIMPIAMOS?
INTEGRANTES:
MARTÍN DZIB ANGIE MELINA
MIRANDA MANUEL ITZEL NICTE-HA
SÁNCHEZ MENA LEONARDO
SANTOS CHAY BRENDA NAOMY

PROBLEMA
En Cancún no existe una forma sencilla de conectar a trabajadores de servicios de limpieza con posibles clientes. La plataforma funciona como un “Uber” de limpieza en el que el cliente publica el servicio que necesita, indicando especificaciones como ubicación y detalles, los trabajadores disponibles responden la petición y acuerdan un trato de trabajo.

FLUJO SELECCIONADO
PASO	ACTOR	    ACCIÓN	                                                            ESTADO DE LA SOLICITUD
1	    Cliente	    Elegir el tipo de servicio entre los ofrecidos por la plataforma	Borrador
2	    Cliente	    Indica el tamaño de la propiedad.	                                Borrador
3	    Cliente	    Elegir la fecha en la que se quiere el servicio	                    Borrador
4	    Cliente	    Envía la solicitud	                                                Solicitada
5	    Sistema	    Recibe la solicitud	                                                Solicitada
6	    Sistema		Calcula el precio según las especificaciones brindadas              Solicitada
7	    Sistema	    ¿Hay trabajadores libres?	                                        Solicitada
7a	    Cliente	    No: se solicita la re-agendación de la cita	                        Re-agendación
7b	    Sistema	    Si: Se le muestra la solicitud a los trabajadores disponibles	    Lista de solicitudes
8	    Sistema	    Se establece contacto con el trabajador	                            Negociación
9	    Trabajador	¿Acepta la solicitud?	                                            Negociación
9a	    Trabajador	Si: Puede mandar una contraoferta	                                Negociación
9b	    Sistema	    No: Se le presenta a otro trabajador	                            Publicada
11	    Cliente	    ¿Acepta la oferta?	                                                Negociación
11a	    Cliente	    No se acepta: Se regresa al paso 9b	                                Publicada
11b	    Cliente	    Se acepta la oferta	                                                Aceptada
12	    Sistema	    Se elimina la oferta del registro de disponibles	                Asignada
13	    Cliente	    Pago del servicio por medio de la plataforma	                    Pago
14	    Trabajador	Realiza el servicio	                                                En proceso
15	    Trabajador	Sube pruebas del servicio dentro de la plataforma	                Completada
16	    Sistema	    El pago se manda al trabajador	                                    Completada
17	    Cliente	    Califica el servicio del trabajador	                                Calificación


LISTA DE INTERFACES
└── ./
    ├── appWeb
    │   ├── assets
    │   │   ├── index-DdhX5A-m.js
    │   │   └── index-x54zN-sA.css
    │   ├── docs
    │   │   ├── mockups(wireframes)
    │   │   │   ├── 1.png
    │   │   │   ├── 10.png
    │   │   │   ├── 11.png
    │   │   │   ├── 12.png
    │   │   │   ├── 13.png
    │   │   │   ├── 2.png
    │   │   │   ├── 3.png
    │   │   │   ├── 4.png
    │   │   │   ├── 5.png
    │   │   │   ├── 6.png
    │   │   │   ├── 7.png
    │   │   │   ├── 8.png
    │   │   │   └── 9.png
    │   │   ├── flujo-proceso.png
    │   │   └── mapa_navegacion.png
    │   ├── public
    │   │   ├── favicon.svg
    │   │   └── icons.svg
    │   ├── src
    │   │   ├── components
    │   │   │   ├── comunes
    │   │   │   │   ├── AparecerAlDesplazar.tsx
    │   │   │   │   ├── AvisoTemporal.tsx
    │   │   │   │   ├── CampoDeFormulario.tsx
    │   │   │   │   ├── FormasOrganicas.tsx
    │   │   │   │   ├── Icono.tsx
    │   │   │   │   ├── Ilustraciones.tsx
    │   │   │   │   ├── Insignias.tsx
    │   │   │   │   ├── TarjetaDeIndicador.tsx
    │   │   │   │   └── VentanasModales.tsx
    │   │   │   ├── solicitudes
    │   │   │   │   ├── BarraDeFiltrosDeSolicitudes.tsx
    │   │   │   │   ├── DetalleDeSolicitud.tsx
    │   │   │   │   ├── EvidenciasDelLugar.tsx
    │   │   │   │   ├── ListaDeSolicitudes.tsx
    │   │   │   │   └── MapaDeUbicacion.tsx
    │   │   │   ├── BarraDeNavegacion.tsx
    │   │   │   ├── MenuLateral.tsx
    │   │   │   └── PiePagina.tsx
    │   │   ├── data
    │   │   │   ├── CatalogoContext.tsx
    │   │   │   ├── catalogoDemo.ts
    │   │   │   ├── configuracion.ts
    │   │   │   ├── ReportesContext.tsx
    │   │   │   ├── reportesDemo.ts
    │   │   │   ├── seccionesDeDemostracion.ts
    │   │   │   ├── SolicitudesContext.tsx
    │   │   │   ├── solicitudesDemo.ts
    │   │   │   ├── tipos.ts
    │   │   │   ├── trabajadores.ts
    │   │   │   └── TrabajadoresContext.tsx
    │   │   ├── hooks
    │   │   │   ├── useAhora.ts
    │   │   │   └── useAtrapaFoco.ts
    │   │   ├── pages
    │   │   │   ├── CatalogoPage.tsx
    │   │   │   ├── DashboardPage.tsx
    │   │   │   ├── InicioPage.tsx
    │   │   │   ├── LandingPage.tsx
    │   │   │   ├── LoginPage.tsx
    │   │   │   ├── PerfilPage.tsx
    │   │   │   ├── ReportesPage.tsx
    │   │   │   ├── SeccionDeDatosPage.tsx
    │   │   │   ├── SolicitudesPage.tsx
    │   │   │   └── TrabajadoresPage.tsx
    │   │   ├── utils
    │   │   │   ├── archivos.ts
    │   │   │   ├── consultasDeSolicitudes.ts
    │   │   │   ├── fechas.ts
    │   │   │   ├── formato.ts
    │   │   │   ├── reglasDeSolicitudes.ts
    │   │   │   └── sesion.ts
    │   │   ├── App.css
    │   │   ├── App.tsx
    │   │   ├── index.css
    │   │   └── main.tsx
    │   ├── package.json
    │   └── vite.config.ts
    └── README.md

INSTRUCCIONES DE INSTALACIÓN
git clone URL
cd Que-Limpiamos
cd appWeb
npm install
npm run dev
cd ..

