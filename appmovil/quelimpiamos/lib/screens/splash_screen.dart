import 'dart:async';

import 'package:flutter/material.dart';

// import 'home_screen.dart'; // <- cuando tengas tu HomeScreen

// pubspec.yaml:
//   flutter:
//     assets:
//       - assets/images/
//
// Imágenes que necesitas en assets/images/:
//   fondo.png  -> la página completa (manchas + rayitas), SIN logo ni texto
//   logo.png   -> el logo de la escoba (PNG con fondo transparente)

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  Timer? _timer;

  static const Color _azul = Color(0xFF9DB9D3);
  static const Color _textoOscuro = Color(0xFF1E1E1E);

  @override
  void initState() {
    super.initState();
    _timer = Timer(const Duration(seconds: 4), () {
      if (!mounted) return;
      // Navigator.pushReplacement(
      //   context,
      //   MaterialPageRoute(builder: (context) => const HomeScreen()),
      // );
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Fondo completo: manchas + rayitas ya juntas
          Positioned.fill(
            child: Image.asset(
              'assets/images/fondo.png',
              fit: BoxFit.cover,
            ),
          ),

          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset('assets/images/logo.png', width: 140),
                const SizedBox(height: 12),
                const Text(
                  '¿Qué limpiamos?',
                  style: TextStyle(
                    color: _textoOscuro,
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 24),
                const CircularProgressIndicator(color: _azul),
              ],
            ),
          ),
        ],
      ),
    );
  }
}