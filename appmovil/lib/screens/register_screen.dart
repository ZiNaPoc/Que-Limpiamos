import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'auth_widgets.dart';
import 'home_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final TextEditingController nameController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmController = TextEditingController();

  @override
  void dispose() {
    nameController.dispose();
    phoneController.dispose();
    emailController.dispose();
    passwordController.dispose();
    confirmController.dispose();
    super.dispose();
  }

  void _aviso(String mensaje) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(mensaje)),
    );
  }

  void crearCuenta() {
    FocusScope.of(context).unfocus();

    final nombre = nameController.text.trim();
    final telefono = phoneController.text.trim();
    final correo = emailController.text.trim();
    final contrasena = passwordController.text;
    final confirmar = confirmController.text;

    if (nombre.isEmpty ||
        telefono.isEmpty ||
        correo.isEmpty ||
        contrasena.isEmpty ||
        confirmar.isEmpty) {
      _aviso('Completa todos los campos');
      return;
    }
    if (telefono.length != 10) {
      _aviso('El número telefónico debe tener 10 dígitos');
      return;
    }
    if (!correo.contains('@') || !correo.contains('.')) {
      _aviso('Escribe un correo válido');
      return;
    }
    if (contrasena.length < 8) {
      _aviso('La contraseña debe tener mínimo 8 caracteres');
      return;
    }
    if (contrasena != confirmar) {
      _aviso('Las contraseñas no coinciden');
      return;
    }

    // TODO: registrar usuario cuando exista la base de datos

    // Va al inicio y quita Welcome, Login y Registro de la pila,
    // para que el botón atrás no regrese a ellas.
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(
        builder: (_) => HomeScreen(userName: nombre),
      ),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return AuthScaffold(
      title: 'Crear cuenta',
      subtitle: 'Ingrese su información personal.',
      children: [
        AuthTextField(
          label: 'Nombre',
          hint: 'Tu nombre',
          textCapitalization: TextCapitalization.words,
          controller: nameController,
        ),
        AuthTextField(
          label: 'Número telefónico',
          hint: '10 dígitos',
          keyboardType: TextInputType.phone,
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(10),
          ],
          controller: phoneController,
        ),
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
          controller: passwordController,
        ),
        AuthTextField(
          label: 'Confirmar contraseña',
          hint: 'Repite tu contraseña',
          obscureText: true,
          textInputAction: TextInputAction.done,
          controller: confirmController,
        ),
        const Text(
          'Identificación oficial (INE)',
          style: TextStyle(
            color: AuthColors.textDark,
            fontSize: 13,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: UploadBox(
                label: 'Subir frente',
                onTap: () {
                  // TODO: elegir foto (image_picker)
                },
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: UploadBox(
                label: 'Subir reverso',
                onTap: () {
                  // TODO: elegir foto (image_picker)
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 28),
        AuthPrimaryButton(
          label: 'Crear cuenta',
          onPressed: crearCuenta,
        ),
      ],
    );
  }
}