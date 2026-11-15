import 'package:flutter/material.dart';

import 'app_bottom_nav.dart';
import 'package:appmovil/models/collaborator.dart';

class CalificarScreen extends StatefulWidget {
  const CalificarScreen({super.key, this.colaborador});

  final Collaborator? colaborador;

  @override
  State<CalificarScreen> createState() => _CalificarScreenState();
}

class _CalificarScreenState extends State<CalificarScreen> {
  static const Color navy = Color(0xFF293B53);

  int calificacion = 0; // 0 a 5 escobas
  final TextEditingController comentario = TextEditingController();

  @override
  void dispose() {
    comentario.dispose();
    super.dispose();
  }

  void _enviar() {
    if (calificacion == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Elige una calificación primero')),
      );
      return;
    }

    // TODO: guardar calificacion y comentario.text en la base de datos
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('¡Gracias por tu calificación!')),
    );
    Navigator.maybePop(context);
  }

  @override
  Widget build(BuildContext context) {
    final nombre = widget.colaborador?.name ?? 'Colaborador';

    return Scaffold(
      backgroundColor: const Color(0xFFE8EEE6),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFFB9D0E0),
              Color(0xFFF4F1E9),
              Color(0xFFDCE5D0),
            ],
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
                        const SizedBox(height: 24),
                        IconButton(
                          padding: EdgeInsets.zero,
                          alignment: Alignment.centerLeft,
                          onPressed: () => Navigator.maybePop(context),
                          icon: const Icon(Icons.chevron_left,
                              size: 30, color: navy),
                        ),

                        // FOTO Y NOMBRE
                        Center(
                          child: Container(
                            width: 130,
                            height: 130,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Color(0xFFCDE8C9),
                            ),
                          ),
                        ),
                        const SizedBox(height: 18),
                        Center(
                          child: Text(
                            nombre,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.black,
                            ),
                          ),
                        ),
                        const SizedBox(height: 28),

                        // ESCOBAS
                        const Text(
                          'Califica tu servicio',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                        const SizedBox(height: 14),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            for (var i = 1; i <= 5; i++)
                              GestureDetector(
                                behavior: HitTestBehavior.opaque,
                                onTap: () => setState(() => calificacion = i),
                                child: Padding(
                                  padding: const EdgeInsets.all(6),
                                  child: Icon(
                                    i <= calificacion
                                        ? Icons.cleaning_services
                                        : Icons.cleaning_services_outlined,
                                    size: 30,
                                    color: i <= calificacion
                                        ? navy
                                        : const Color(0xFF555555),
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 22),

                        // COMENTARIO
                        const Text(
                          'Cuéntanos cómo fue',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Container(
                          height: 130,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFCFDAEA),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: const Color(0xFF5E7CA6),
                              width: 2.5,
                            ),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x40000000),
                                blurRadius: 10,
                                offset: Offset(0, 6),
                              ),
                            ],
                          ),
                          child: TextField(
                            controller: comentario,
                            maxLines: null,
                            expands: true,
                            textAlignVertical: TextAlignVertical.top,
                            style: const TextStyle(fontSize: 10),
                            decoration: const InputDecoration(
                              border: InputBorder.none,
                              hintText: 'Escribe aquí tu comentario...',
                              hintStyle: TextStyle(
                                fontSize: 10,
                                color: Color(0xFF7A8AA3),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 18),

                        // BOTÓN ENVIAR
                        Align(
                          alignment: Alignment.centerRight,
                          child: GestureDetector(
                            onTap: _enviar,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 18, vertical: 9),
                              decoration: BoxDecoration(
                                color: navy,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: const Text(
                                'Enviar calificación',
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                    ),
                  ),
                ),
              ),
              const AppBottomNav(currentIndex: 2),
            ],
          ),
        ),
      ),
    );
  }
}