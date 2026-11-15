import 'package:flutter/foundation.dart';
import 'package:appmovil/models/collaborator.dart';

enum AvisosEstado { vacio, manual, automatica }

/// Guarda temporalmente el estado de los avisos.
/// TODO: reemplazar por la base de datos.
class AvisosStore extends ChangeNotifier {
  AvisosStore._();
  static final AvisosStore instance = AvisosStore._();

  AvisosEstado estado = AvisosEstado.vacio; // primera vez: sin avisos
  Collaborator? colaborador;

  void confirmarManual(Collaborator c) {
    estado = AvisosEstado.manual;
    colaborador = c;
    notifyListeners();
  }

  void asignarAutomatico(Collaborator c) {
    estado = AvisosEstado.automatica;
    colaborador = c;
    notifyListeners();
  }

  void limpiar() {
    estado = AvisosEstado.vacio;
    colaborador = null;
    notifyListeners();
  }
}