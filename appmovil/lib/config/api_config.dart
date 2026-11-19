class ApiConfig {

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000/api',
  );

  static const Duration timeout = Duration(seconds: 15);
  static const Duration timeoutSubida = Duration(seconds: 60);
}