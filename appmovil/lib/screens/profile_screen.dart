import 'package:flutter/material.dart';

import 'app_bottom_nav.dart';
import '../avisos_store.dart';
import 'historial_screen.dart';
import 'package:appmovil/services/historial_store.dart';
import 'welcome_screen.dart';

class PerfilScreen extends StatefulWidget {
  const PerfilScreen({super.key});

  @override
  State<PerfilScreen> createState() => _PerfilScreenState();
}

class _PerfilScreenState extends State<PerfilScreen> {
  static const Color navy = Color(0xFF293B53);

  // TODO: cargar estos datos desde el registro / base de datos
  final TextEditingController nombre = TextEditingController(text: 'Usuario');
  final TextEditingController telefono =
      TextEditingController(text: '1234567891');
  final TextEditingController correo =
      TextEditingController(text: 'abcd@ejemplo.com');

  String nombreMostrado = 'Uusario';

  @override
  void dispose() {
    nombre.dispose();
    telefono.dispose();
    correo.dispose();
    super.dispose();
  }

  void _guardar() {
    FocusScope.of(context).unfocus();

    if (nombre.text.trim().isEmpty ||
        telefono.text.trim().isEmpty ||
        correo.text.trim().isEmpty) {
      _aviso('Completa todos los campos');
      return;
    }
    if (!correo.text.contains('@')) {
      _aviso('Escribe un correo válido');
      return;
    }

    // TODO: guardar los cambios en la base de datos
    setState(() => nombreMostrado = nombre.text.trim());
    _aviso('Cambios guardados');
  }

  void _aviso(String mensaje) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(mensaje)),
    );
  }

  void _cerrarSesion() {
    // TODO: cerrar la sesión real (token, usuario, etc.)
    AvisosStore.instance.limpiar();
    HistorialStore.instance.limpiar();

    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => WelcomeScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
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
                        const SizedBox(height: 40),

                        // BOTÓN HISTORIAL
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Mi perfil',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.black,
                              ),
                            ),
                            GestureDetector(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const HistorialScreen(),
                                  ),
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: navy,
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.history,
                                        size: 11, color: Colors.white),
                                    SizedBox(width: 4),
                                    Text(
                                      'Historial',
                                      style: TextStyle(
                                        fontSize: 8,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),

                        // FOTO Y NOMBRE
                        Center(
                          child: Container(
                            width: 110,
                            height: 110,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Color(0xFF9BC59A),
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        Center(
                          child: Text(
                            nombreMostrado,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: Colors.black,
                            ),
                          ),
                        ),
                        const SizedBox(height: 18),

                        // CAMPOS
                        _campo('Nombre', nombre, TextInputType.name),
                        const SizedBox(height: 12),
                        _campo('Número telefónico', telefono,
                            TextInputType.phone),
                        const SizedBox(height: 12),
                        _campo('Correo electrónico', correo,
                            TextInputType.emailAddress),
                        const SizedBox(height: 14),

                        // INE
                        _barraIne(),
                        const SizedBox(height: 30),

                        // GUARDAR
                        GestureDetector(
                          onTap: _guardar,
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: const Color(0xFF2F4565),
                              borderRadius: BorderRadius.circular(22),
                              boxShadow: const [
                                BoxShadow(
                                  color: Color(0x40000000),
                                  blurRadius: 10,
                                  offset: Offset(0, 5),
                                ),
                              ],
                            ),
                            child: const Text(
                              'Guardar cambios',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),

                        // CERRAR SESIÓN
                        Center(
                          child: GestureDetector(
                            onTap: _cerrarSesion,
                            child: const Text(
                              'Cerrar sesión',
                              style: TextStyle(
                                fontSize: 8,
                                fontWeight: FontWeight.bold,
                                color: navy,
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ),
              ),
              const AppBottomNav(currentIndex: 3),
            ],
          ),
        ),
      ),
    );
  }

  Widget _campo(
    String etiqueta,
    TextEditingController controller,
    TextInputType tipo,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          etiqueta,
          style: const TextStyle(
            fontSize: 8,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
        const SizedBox(height: 5),
        Container(
          height: 36,
          decoration: BoxDecoration(
            color: const Color(0xFFE6EBF3),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: navy, width: 1.2),
          ),
          child: TextField(
            controller: controller,
            keyboardType: tipo,
            style: const TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w600,
              color: Color(0xFF4A6FA5),
            ),
            decoration: const InputDecoration(
              border: InputBorder.none,
              isDense: true,
              contentPadding:
                  EdgeInsets.symmetric(horizontal: 12, vertical: 11),
            ),
          ),
        ),
      ],
    );
  }

  Widget _barraIne() {
    return Container(
      height: 40,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF5B7D88),
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [
          BoxShadow(
            color: Color(0x33000000),
            blurRadius: 8,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          const Icon(Icons.badge_outlined, size: 14, color: Colors.white),
          const SizedBox(width: 8),
          const Text(
            'INE',
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: const Color(0xFFA9D6A0),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text(
              'Verificada',
              style: TextStyle(
                fontSize: 7,
                fontWeight: FontWeight.w700,
                color: Color(0xFF2F4F2A),
              ),
            ),
          ),
        ],
      ),
    );
  }
}