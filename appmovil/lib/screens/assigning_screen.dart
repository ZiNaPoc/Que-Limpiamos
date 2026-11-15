import 'package:flutter/material.dart';

import 'home_screen.dart';

class AssigningScreen extends StatelessWidget {
  const AssigningScreen({super.key, this.serviceTitle});

  final String? serviceTitle;

  static const Color navy = Color(0xFF293B53);

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
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: [
                const SizedBox(height: 70),

                // ÍCONO
                Container(
                  width: 110,
                  height: 110,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: navy,
                    boxShadow: [
                      BoxShadow(
                        color: Color(0x40000000),
                        blurRadius: 14,
                        offset: Offset(0, 7),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.check, size: 72, color: Colors.white),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Asignando a tu\ncolaborador',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                    height: 1.15,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Te avisaremos en Avisos cuando tu servicio esté\nconfirmado',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 8,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF555555),
                  ),
                ),
                const SizedBox(height: 22),

                // PASOS
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 16,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF7F8F8),
                    borderRadius: BorderRadius.circular(22),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x40000000),
                        blurRadius: 16,
                        offset: Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    children: const [
                      _StepRow(
                        label: 'Solicitud enviada',
                        state: _StepState.done,
                      ),
                      SizedBox(height: 14),
                      _StepRow(
                        label: 'Asignando colaborador',
                        state: _StepState.active,
                      ),
                      SizedBox(height: 14),
                      _StepRow(
                        label: 'Servicio confirmado',
                        state: _StepState.pending,
                      ),
                    ],
                  ),
                ),

                const Spacer(),

                const Text(
                  'Puedes salir de esta pantalla; el proceso continúa.',
                  style: TextStyle(
                    fontSize: 8,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF555555),
                  ),
                ),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () => Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const HomeScreen()),
                    (route) => false,
                  ),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: navy, width: 2),
                    ),
                    child: const Text(
                      'Volver al inicio',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: navy,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

enum _StepState { done, active, pending }

class _StepRow extends StatelessWidget {
  const _StepRow({required this.label, required this.state});

  final String label;
  final _StepState state;

  @override
  Widget build(BuildContext context) {
    late final Color circleColor;
    Widget? icon;

    switch (state) {
      case _StepState.done:
        circleColor = const Color(0xFF293B53);
        icon = const Icon(Icons.check, size: 12, color: Colors.white);
        break;
      case _StepState.active:
        circleColor = const Color(0xFF9BBF8F);
        break;
      case _StepState.pending:
        circleColor = const Color(0xFFE6EAEE);
        break;
    }

    return Row(
      children: [
        Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(shape: BoxShape.circle, color: circleColor),
          child: icon,
        ),
        const SizedBox(width: 12),
        Text(
          label,
          style: const TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.w700,
            color: Color(0xFF333333),
          ),
        ),
      ],
    );
  }
}
