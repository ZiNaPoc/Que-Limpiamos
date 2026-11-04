import 'package:flutter/material.dart';

import 'package:quelimpiamos/screens/login_screen.dart';
import 'package:quelimpiamos/screens/signup_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  static const Color _panelColor = Color(0xFFBBD9E6);
  static const Color _panelBackColor = Color(0xFFCAE2EC);
  static const Color _loginButtonColor = Color(0xFF7AABD6);
  static const Color _signupButtonColor = Color(0xFFEEF6F9);

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.white,
                    Colors.white,
                    _panelBackColor.withValues(alpha: 0.35),
                  ],
                  stops: const [0.0, 0.6, 1.0],
                ),
              ),
            ),
          ),

          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              height: size.height * 0.57,
              decoration: const BoxDecoration(
                color: _panelBackColor,
                borderRadius: BorderRadius.vertical(top: Radius.circular(40)),
              ),
            ),
          ),

          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              height: size.height * 0.54,
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(32, 0, 32, 40),
              decoration: const BoxDecoration(
                color: _panelColor,
                borderRadius: BorderRadius.vertical(top: Radius.circular(40)),
              ),
              child: Column(
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        const Expanded(
                          flex: 5,
                          child: Align(
                            alignment: Alignment.centerLeft,
                            child: Text(
                              'Bienvenido',
                              style: TextStyle(
                                fontSize: 40,
                                fontWeight: FontWeight.w800,
                                color: Colors.black,
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          flex: 4,
                          child: Align(
                            alignment: Alignment.centerRight,
                            child: Image.asset(
                              'assets/images/logo.png',
                              height: 170,
                              fit: BoxFit.contain,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: _PillButton(
                          label: 'Iniciar sesión',
                          backgroundColor: _loginButtonColor,
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const LoginScreen(),
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _PillButton(
                          label: 'Crear cuenta',
                          backgroundColor: _signupButtonColor,
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const SignUpScreen(),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PillButton extends StatelessWidget {
  const _PillButton({
    required this.label,
    required this.backgroundColor,
    required this.onPressed,
  });

  final String label;
  final Color backgroundColor;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 76,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor,
          foregroundColor: Colors.black,
          elevation: 0,
          shape: const StadiumBorder(),
        ),
        child: Text(
          label,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
        ),
      ),
    );
  }
}