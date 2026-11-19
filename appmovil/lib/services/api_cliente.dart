import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import 'api_excepcion.dart';
import 'token_storage.dart';

class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  void Function()? onSesionExpirada;

  final http.Client _http = http.Client();

  Uri _uri(String path) => Uri.parse('${ApiConfig.baseUrl}$path');

  Future<Map<String, String>> _headers({
    required bool auth,
    bool json = false,
  }) async {
    final headers = <String, String>{'Accept': 'application/json'};
    if (json) headers['Content-Type'] = 'application/json';

    if (auth) {
      final token = await TokenStorage.instance.leer();
      if (token != null) headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Future<Map<String, dynamic>> get(String path, {bool auth = true}) async {
    final headers = await _headers(auth: auth);
    return _ejecutar(() => _http.get(_uri(path), headers: headers), auth: auth);
  }

  Future<Map<String, dynamic>> postJson(
    String path,
    Map<String, dynamic> body, {
    bool auth = true,
  }) async {
    final headers = await _headers(auth: auth, json: true);
    return _ejecutar(
      () => _http.post(_uri(path), headers: headers, body: jsonEncode(body)),
      auth: auth,
    );
  }

  Future<Map<String, dynamic>> postMultipart(
    String path, {
    required Map<String, String> fields,
    required Map<String, String> files,
    bool auth = false,
  }) async {
    final headers = await _headers(auth: auth);
    final request = http.MultipartRequest('POST', _uri(path))
      ..headers.addAll(headers)
      ..fields.addAll(fields);

    for (final entry in files.entries) {
      request.files.add(await http.MultipartFile.fromPath(entry.key, entry.value));
    }

    return _ejecutar(
      () async => http.Response.fromStream(await _http.send(request)),
      auth: auth,
      timeout: ApiConfig.timeoutSubida,
    );
  }

  Future<Map<String, dynamic>> _ejecutar(
    Future<http.Response> Function() peticion, {
    required bool auth,
    Duration? timeout,
  }) async {
    try {
      final respuesta = await peticion().timeout(timeout ?? ApiConfig.timeout);
      return await _procesar(respuesta, auth);
    } on TimeoutException {
      throw const ApiExcepcion(
        'El servidor tardó demasiado en responder. Intenta de nuevo.',
      );
    } on SocketException {
      throw const ApiExcepcion(
        'No se pudo conectar con el servidor. Revisa tu conexión.',
      );
    } on http.ClientException {
      throw const ApiExcepcion(
        'No se pudo conectar con el servidor. Revisa tu conexión.',
      );
    }
  }

  Future<Map<String, dynamic>> _procesar(http.Response r, bool auth) async {
    Map<String, dynamic> cuerpo = {};
    try {
      final decodificado = jsonDecode(utf8.decode(r.bodyBytes));
      if (decodificado is Map<String, dynamic>) cuerpo = decodificado;
    } catch (_) {
    }

    if (r.statusCode >= 200 && r.statusCode < 300) return cuerpo;

    if (r.statusCode == 401 && auth) {
      await TokenStorage.instance.borrar();
      onSesionExpirada?.call();
    }

    final mensaje = cuerpo['mensaje'];
    throw ApiExcepcion(
      mensaje is String ? mensaje : 'Error del servidor (${r.statusCode}).',
      statusCode: r.statusCode,
    );
  }
}