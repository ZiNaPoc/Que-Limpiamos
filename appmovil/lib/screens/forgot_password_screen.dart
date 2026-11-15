import 'package:flutter/material.dart';

import 'auth_widgets.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key, this.initialEmail = ''});

  /// Si el usuario ya escribió su correo en el login, se rellena solo.
  final String initialEmail;

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  static const Color navy = Color.fromARGB(255, 28, 43, 64);

  late final TextEditingController emailController;

  @override
  void initState() {
    super.initState();
    emailController = TextEditingController(text: widget.initialEmail);
  }

  @override
  void dispose() {
    emailController.dispose();
    super.dispose();
  }

  void enviarEnlace() {
    FocusScope.of(context).unfocus();
    final correo = emailController.text.trim();

    if (correo.isEmpty) {
      _aviso('Ingresa tu correo electrónico');
      return;
    }
    if (!correo.contains('@') || !correo.contains('.')) {
      _aviso('Escribe un correo válido');
      return;
    }

    // TODO: pedir al servidor que envíe el enlace de recuperación a `correo`
    _aviso('Te enviamos un enlace a tu correo');
    Navigator.maybePop(context);
  }

  void _aviso(String mensaje) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(mensaje)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0EFEC),
      body: Stack(
        children: [
          // Degradado superior que se desvanece en el fondo
          Container(
            height: 240,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xFFB9D0E0), Color(0xFFF0EFEC)],
              ),
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 24),
                    IconButton(
                      padding: EdgeInsets.zero,
                      alignment: Alignment.centerLeft,
                      onPressed: () => Navigator.maybePop(context),
                      icon: const Icon(
                        Icons.chevron_left,
                        size: 30,
                        color: Color(0xFF536B7C),
                      ),
                    ),
                    const SizedBox(height: 40),
                    const Text(
                      'Recuperar contraseña',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Te enviaremos un enlace a tu correo para crear una nueva contraseña.',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF666666),
                      ),
                    ),
                    const SizedBox(height: 28),
                    AuthTextField(
                      label: 'Correo electrónico',
                      hint: 'abcde@ejemplo.com',
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.done,
                      controller: emailController,
                    ),
                    const SizedBox(height: 24),
                    AuthPrimaryButton(
                      label: 'Enviar enlace',
                      onPressed: enviarEnlace,
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}