import '../models/usuario.dart';
import 'api_cliente.dart';
import 'api_excepcion.dart';
import 'token_storage.dart';

class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  Usuario? usuarioActual;

  Future<Usuario> login({
    required String correo,
    required String password,
  }) async {
    final data = await ApiClient.instance.postJson('/auth/cliente/login', {
      'correo': correo,
      'password': password,
    }, auth: false);
    return _guardarSesion(data);
  }

  Future<Usuario> registrar({
    required String nombre,
    required String telefono,
    required String correo,
    required String password,
    required String ineFrentePath,
    required String ineReversoPath,
  }) async {
    final data = await ApiClient.instance.postMultipart(
      '/auth/cliente/register',
      fields: {
        'nombre': nombre,
        'telefono': telefono,
        'correo': correo,
        'password': password,
      },
      files: {'ine_frente': ineFrentePath, 'ine_reverso': ineReversoPath},
    );
    return _guardarSesion(data);
  }

  Future<Usuario?> restaurarSesion() async {
    final token = await TokenStorage.instance.leer();
    if (token == null) return null;

    try {
      final data = await ApiClient.instance.get('/auth/cliente/session');
      final usuario = data['usuario'];
      if (usuario is! Map<String, dynamic>) return null;
      usuarioActual = Usuario.fromJson(usuario);
      return usuarioActual;
    } on ApiExcepcion catch (e) {
      if (e.statusCode == 401 || e.statusCode == 403) {
        await TokenStorage.instance.borrar();
      }
      return null;
    }
  }

  Future<void> cerrarSesion() async {
    usuarioActual = null;
    await TokenStorage.instance.borrar();
  }

  Future<Usuario> _guardarSesion(Map<String, dynamic> data) async {
    final token = data['token'];
    final usuario = data['usuario'];

    if (token is! String || usuario is! Map<String, dynamic>) {
      throw const ApiExcepcion('Respuesta inesperada del servidor.');
    }

    await TokenStorage.instance.guardar(token);
    final modelo = Usuario.fromJson(usuario);
    usuarioActual = modelo;
    return modelo;
  }
}