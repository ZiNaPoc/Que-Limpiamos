class Validators {
  static final RegExp _correo = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
  static final RegExp _telefono = RegExp(r'^\d{10}$');

  static String? nombre(String valor) {
    final v = valor.trim();
    if (v.isEmpty) return 'Ingresa tu nombre';
    if (v.length < 2) return 'El nombre es demasiado corto';
    if (v.length > 120) return 'El nombre es demasiado largo';
    return null;
  }

  static String? telefono(String valor) {
    if (valor.trim().isEmpty) return 'Ingresa tu número telefónico';
    if (!_telefono.hasMatch(valor.trim())) {
      return 'El teléfono debe tener 10 dígitos';
    }
    return null;
  }

  static String? correo(String valor) {
    final v = valor.trim();
    if (v.isEmpty) return 'Ingresa tu correo electrónico';
    if (!_correo.hasMatch(v)) return 'El correo electrónico no es válido';
    return null;
  }

  static String? password(String valor) {
    if (valor.isEmpty) return 'Ingresa tu contraseña';
    if (valor.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (valor.length > 72) return 'La contraseña es demasiado larga';
    return null;
  }

  static String? confirmarPassword(String password, String confirmacion) {
    if (confirmacion.isEmpty) return 'Repite tu contraseña';
    if (password != confirmacion) return 'Las contraseñas no coinciden';
    return null;
  }
}