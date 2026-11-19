class ApiExcepcion implements Exception {
  final String message;
  final int? statusCode;

  const ApiExcepcion(this.message, {this.statusCode});

  @override
  String toString() => message;
}