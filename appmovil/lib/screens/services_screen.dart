import 'package:flutter/material.dart';

import 'assigning_screen.dart';
import 'app_bottom_nav.dart';
import 'collaborators_screen.dart';


class ServicesScreen extends StatefulWidget {
  const ServicesScreen({super.key});

  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _Service {
  const _Service({
    required this.title,
    required this.description,
    required this.price,
    required this.image,
  });

  final String title;
  final String description;
  final String price;
  final String image;
}

class _ServicesScreenState extends State<ServicesScreen> {
  int selectedIndex = 1;

  static const Color navy = Color(0xFF293B53);

  static const List<_Service> services = [
    _Service(
      title: 'Limpieza regular',
      description:
          'Limpieza de mantenimiento que incluye barrer, trapear y aspirar.',
      price: 'Desde \$400',
      image:
          'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500',
    ),
    _Service(
      title: 'Limpieza profunda',
      description: 'Limpieza detallada de todas las áreas del espacio, incluyendo zonas de difícil acceso.',
      price: 'Desde \$600',
      image:
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500',
    ),
    _Service(
      title: 'Limpieza post-obra',
      description: 'Limpieza después de una remodelación o construcción.',
      price: 'Desde \$650',
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE8EEE6),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFB9D0E0), Color(0xFFF4F1E9), Color(0xFFDCE5D0)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 40),

                        // TÍTULO
                        const Text(
                          'Servicios',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Elige el tipo de limpieza que necesitas.',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF555555),
                          ),
                        ),

                        const SizedBox(height: 18),

                        // TARJETAS DE SERVICIOS
                        for (final service in services) ...[
                          serviceCard(service),
                          const SizedBox(height: 22),
                        ],

                        const SizedBox(height: 4),
                      ],
                    ),
                  ),
                ),
              ),

              AppBottomNav(
                currentIndex: 1,
              ),
            ],
          ),
        ),
      ),
    );
  }

  //SERVICIO
  Widget serviceCard(_Service service) {
    return GestureDetector(
      onTap: () => _mostrarEleccionColaborador(service),
      child: Container(
        height: 90,
        decoration: BoxDecoration(
          color: const Color(0xFFF7F8F8),
          borderRadius: BorderRadius.circular(22),
          boxShadow: const [
            BoxShadow(
              color: Color(0x2E000000),
              blurRadius: 14,
              offset: Offset(0, 7),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Foto a la izquierda, difuminada hacia el borde derecho
            ClipRRect(
              borderRadius: const BorderRadius.horizontal(
                left: Radius.circular(22),
              ),
              child: SizedBox(
                width: 84,
                child: ShaderMask(
                  blendMode: BlendMode.dstIn,
                  shaderCallback: (rect) {
                    return const LinearGradient(
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                      colors: [Colors.black, Colors.black, Colors.transparent],
                      stops: [0.0, 0.7, 1.0],
                    ).createShader(rect);
                  },
                  child: Image.network(
                    service.image,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return const ColoredBox(
                        color: Color(0xFF8FAABD),
                        child: Icon(
                          Icons.cleaning_services,
                          color: Colors.white,
                          size: 28,
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),

            // Textos
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(4, 8, 0, 8),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      service.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      service.description,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF444444),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      service.price,
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: navy,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Flecha
            const SizedBox(
              width: 34,
              child: Center(
                child: Icon(Icons.chevron_right, size: 22, color: Colors.black),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─────────── DIÁLOGO CENTRADO: ¿CÓMO QUIERES ELEGIR? ───────────
  void _mostrarEleccionColaborador(_Service service) {
    showDialog(
      context: context,
      barrierDismissible: true,
      // Oscurece toda la pantalla de atrás
      barrierColor: const Color(0x99000000),
      builder: (context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          elevation: 0,
          insetPadding: const EdgeInsets.symmetric(horizontal: 22),
          child: Container(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(26),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x40000000),
                  blurRadius: 20,
                  offset: Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Encabezado: foto + título + precio
                Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: SizedBox(
                        width: 56,
                        height: 56,
                        child: Image.network(
                          service.image,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return const ColoredBox(
                              color: Color(0xFF8FAABD),
                              child: Icon(
                                Icons.cleaning_services,
                                color: Colors.white,
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          service.title,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: navy,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          service.price,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF777777),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Divider(height: 1, color: Color(0xFFDDDDDD)),
                const SizedBox(height: 14),

                const Text(
                  '¿Cómo quieres elegir a tu\ncolaborador?',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
                const SizedBox(height: 14),

                // Opción 1: Elegir personalmente
                _opcionColaborador(
                  icon: Icons.person_outline,
                  title: 'Elegir personalmente',
                  subtitle: 'Revisa perfiles y escoge a quien prefieras',
                  filled: false,
                  onTap: () {
                    Navigator.pop(context); // cierra el diálogo
                    Navigator.push(
                      this.context,
                      MaterialPageRoute(
                        builder: (_) =>
                            CollaboratorsScreen(serviceTitle: service.title),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 14),

                // Opción 2: Asignación automática
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    _opcionColaborador(
                      icon: Icons.auto_awesome,
                      title: 'Asignación automática',
                      subtitle: 'Te asignamos a alguien disponible',
                      filled: true,
                      onTap: () {
                        Navigator.pop(context); // cierra el diálogo
                        Navigator.push(
                          this.context,
                          MaterialPageRoute(
                            builder: (_) =>
                                AssigningScreen(serviceTitle: service.title),
                          ),
                        );
                      },
                    ),
                    Positioned(
                      top: -8,
                      right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFCFE8C8),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'Más rápido',
                          style: TextStyle(
                            fontSize: 8,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF3C6B35),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _opcionColaborador({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool filled,
    required VoidCallback onTap,
  }) {
    final Color textColor = filled ? Colors.white : navy;
    final Color subColor = filled ? Colors.white70 : const Color(0xFF777777);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: filled ? navy : Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: filled
              ? null
              : Border.all(color: const Color(0xFFC9D6E2), width: 2.5),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: filled
                    ? const Color(0xFF3B5272)
                    : const Color(0xFFC9D6E2),
              ),
              child: Icon(icon, size: 20, color: filled ? Colors.white : navy),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.w600,
                      color: subColor,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
