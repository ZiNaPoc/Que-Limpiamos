import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  TokenStorage._();
  static final TokenStorage instance = TokenStorage._();

  static const String _clave = 'auth_token';
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<String?> leer() => _storage.read(key: _clave);

  Future<void> guardar(String token) => _storage.write(key: _clave, value: token);

  Future<void> borrar() => _storage.delete(key: _clave);
}