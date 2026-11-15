import 'package:flutter/material.dart';

import 'app_bottom_nav.dart';
import '../avisos_store.dart';
import 'collaborator_profile_screen.dart';
import 'rate_screen.dart';

class AvisosScreen extends StatelessWidget {
  const AvisosScreen({super.key});

  static const Color navy = Color(0xFF293B53);
  static const Color softGreen = Color(0xFFCDE8C9);
  static const Color darkGreen = Color(0xFF2F4F2A);

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
          child: AnimatedBuilder(
            animation: AvisosStore.instance,
            builder: (context, _) {
              final store = AvisosStore.instance;

              return Column(
                children: [
                  Expanded(
                    child: SingleChildScrollView(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 50),
                            const Text(
                              'Avisos',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.black,
                              ),
                            ),
                            const SizedBox(height: 18),
                            if (store.estado == AvisosEstado.vacio)
                              _estadoVacio(context)
                            else ...[
                              _tarjetaConfirmado(context, store),
                              const SizedBox(height: 20),
                              _tarjetaCalificar(context, store),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                  AppBottomNav(currentIndex: 2),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  // ───────────────────────── ESTADO VACÍO ─────────────────────────
  Widget _estadoVacio(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.5,
      child: const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.notifications_none, size: 56, color: Color(0xFF9AA8B5)),
            SizedBox(height: 12),
            Text(
              'Todavía no tienes avisos',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            SizedBox(height: 4),
            Text(
              'Aquí aparecerán las confirmaciones de tus servicios.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w700,
                color: Color(0xFF777777),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─────────────────── TARJETA: SERVICIO CONFIRMADO ───────────────────
  Widget _tarjetaConfirmado(BuildContext context, AvisosStore store) {
    final esAutomatica = store.estado == AvisosEstado.automatica;
    final colaborador = store.colaborador;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(12, 12, 14, 12),
      decoration: _cardDecoration(),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: softGreen,
                ),
                child: const Icon(
                  Icons.check,
                  size: 24,
                  color: Color(0xFF4A5A4A),
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Tu servicio fue confirmado',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      'Se aceptó tu servicio',
                      style: TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF9A9A9A),
                      ),
                    ),
                  ],
                ),
              ),
              // Puntito de "no leído"
              Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFF3E6B45),
                ),
              ),
            ],
          ),

          // Solo cuando la app asignó al colaborador
          if (esAutomatica && colaborador != null) ...[
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                color: const Color(0xFFD8EBD3),
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info, size: 12, color: darkGreen),
                  SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Ponte en contacto con tu colaborador para acordar los detalles.',
                      style: TextStyle(
                        fontSize: 7,
                        fontWeight: FontWeight.w700,
                        color: darkGreen,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 6),
            GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) =>
                        CollaboratorProfileScreen(collaborator: colaborador),
                  ),
                );
              },
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: softGreen,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          colaborador.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                        const SizedBox(height: 3),
                        const Text(
                          'Ver perfil',
                          style: TextStyle(
                            fontSize: 8,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF9A9A9A),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(
                    Icons.chevron_right,
                    size: 22,
                    color: Colors.black,
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ─────────────────── TARJETA: CALIFICA TU SERVICIO ───────────────────
  Widget _tarjetaCalificar(BuildContext context, AvisosStore store) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => CalificarScreen(colaborador: store.colaborador),
          ),
        );
      },

      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.fromLTRB(12, 12, 14, 12),
        decoration: _cardDecoration(),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0xFFB5CCE0),
              ),
              child: const Icon(Icons.star_border, size: 24, color: navy),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Califica tu servicio',
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  SizedBox(height: 3),
                  Text(
                    'Cuéntanos cómo fue',
                    style: TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF9A9A9A),
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, size: 22, color: Colors.black),
          ],
        ),
      ),
    );
  }

  BoxDecoration _cardDecoration() {
    return BoxDecoration(
      color: const Color(0xFFF7F8F8),
      borderRadius: BorderRadius.circular(20),
      boxShadow: const [
        BoxShadow(
          color: Color(0x2E000000),
          blurRadius: 14,
          offset: Offset(0, 7),
        ),
      ],
    );
  }
}
