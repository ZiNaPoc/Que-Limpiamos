import 'package:flutter/material.dart';

import 'auth_widgets.dart';
import 'register_screen.dart';
import 'home_screen.dart';
import 'forgot_password_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController emailController = TextEditingController();

  final TextEditingController passwordController = TextEditingController();

  void iniciarSesion() {
    String correo = emailController.text.trim();
    String contrasena = passwordController.text.trim();

    if (correo.isEmpty || contrasena.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ingresa tu correo y contraseña')),
      );
      return;
    }

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const HomeScreen()),
    );
  }

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AuthScaffold(
      title: 'Iniciar sesión',
      subtitle: 'Qué bueno verte de nuevo.',
      children: [
        AuthTextField(
          label: 'Correo electrónico',
          hint: '123@ejemplo.com',
          keyboardType: TextInputType.emailAddress,
          controller: emailController,
        ),

        AuthTextField(
          label: 'Contraseña',
          hint: 'Mínimo 8 caracteres',
          obscureText: true,
          textInputAction: TextInputAction.done,
          controller: passwordController,
        ),

        Align(
          alignment: Alignment.centerRight,
          child: AuthLink(
            text: '¿Olvidaste tu contraseña?',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ForgotPasswordScreen(
                    initialEmail: emailController.text.trim(),
                  ),
                ),
              );
            },
          ),
        ),

        AuthPrimaryButton(label: 'Iniciar Sesión', onPressed: iniciarSesion),

        const SizedBox(height: 12),

        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.max,
          children: [
            const Text(
              '¿No tienes cuenta? ',
              style: TextStyle(
                color: AuthColors.textDark,
                fontSize: 11,
                fontWeight: FontWeight.w700,
              ),
            ),

            AuthLink(
              text: 'Crear cuenta',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const RegisterScreen(),
                  ),
                );
              },
            ),
          ],
        ),
      ],
    );
  }
}
