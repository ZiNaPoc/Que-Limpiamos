import 'package:flutter/foundation.dart';
import 'package:appmovil/models/collaborator.dart';

class Reserva {
  const Reserva({
    required this.servicio,
    required this.precio,
    required this.fecha,
    required this.horario,
    this.colaborador,
  });

  final String servicio;
  final String precio;
  final String fecha;
  final String horario;
  final Collaborator? colaborador;
}

/// TODO: reemplazar por la base de datos.
class HistorialStore extends ChangeNotifier {
  HistorialStore._();
  static final HistorialStore instance = HistorialStore._();

  String? _servicioSeleccionado;
  String? _precioSeleccionado;

  Reserva? actual; // null = todavía no ha cotizado nada
  final List<Reserva> pasadas = [];

  bool get vacio => actual == null && pasadas.isEmpty;

  /// Se llama al tocar un servicio en la pantalla de Servicios.
  void seleccionarServicio(String titulo, String precio) {
    _servicioSeleccionado = titulo;
    _precioSeleccionado = precio;
  }

  /// Se llama cuando ya hay colaborador (manual o automático).
  void confirmarReserva(Collaborator c) {
    // TODO: la fecha y el horario deben venir de lo que elija el usuario.
    // Por ahora se pone mañana a las 3:00pm como ejemplo.
    final manana = DateTime.now().add(const Duration(days: 1));

    actual = Reserva(
      servicio: _servicioSeleccionado ?? 'Limpieza regular',
      precio: (_precioSeleccionado ?? '').replaceFirst('Desde ', ''),
      fecha: _fecha(manana),
      horario: '3:00pm',
      colaborador: c,
    );
    notifyListeners();
  }

  void eliminarActual() {
    actual = null;
    notifyListeners();
  }

  /// Para probar cómo se ve la lista de "Pasadas".
  void cargarEjemplo() {
    pasadas
      ..clear()
      ..addAll(const [
        Reserva(
          servicio: 'Limpieza simple',
          precio: '\$400',
          fecha: '31/10/26',
          horario: '4:00pm',
        ),
        Reserva(
          servicio: 'Limpieza después de un evento',
          precio: '\$650',
          fecha: '27/10/26',
          horario: '12:00pm',
        ),
        Reserva(
          servicio: 'Limpieza profunda',
          precio: '\$600',
          fecha: '12/10/26',
          horario: '10:00am',
        ),
      ]);
    notifyListeners();
  }

  void limpiar() {
    actual = null;
    pasadas.clear();
    notifyListeners();
  }

  static String _dos(int n) => n.toString().padLeft(2, '0');

  static String _fecha(DateTime d) =>
      '${_dos(d.day)}/${_dos(d.month)}/${_dos(d.year % 100)}';
}