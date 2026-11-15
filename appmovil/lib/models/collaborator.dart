

enum HorarioFiltro {
  cualquiera('Cualquier horario'),
  manana('Mañana'),
  tarde('Tarde'),
  sabado('Sábado');

  const HorarioFiltro(this.label);
  final String label;
}

class Collaborator {
  const Collaborator({
    required this.name,
    required this.startHour,
    required this.endHour,
    required this.days,
    required this.daysLabel,
    required this.specialties,
  });

  final String name;
  final int startHour; // formato 24h, ej. 8
  final int endHour; // formato 24h, ej. 15
  final List<int> days; // 1 = lunes ... 7 = domingo
  final String daysLabel;
  final List<String> specialties;

  static String _fmt(int h) {
    final h12 = h % 12 == 0 ? 12 : h % 12;
    return '$h12:00${h < 12 ? 'am' : 'pm'}';
  }

  String get scheduleText => '${_fmt(startHour)}-${_fmt(endHour)}';

  bool matches(HorarioFiltro filtro) {
    switch (filtro) {
      case HorarioFiltro.cualquiera:
        return true;
      case HorarioFiltro.manana:
        return startHour < 12;
      case HorarioFiltro.tarde:
        return endHour > 13;
      case HorarioFiltro.sabado:
        return days.contains(6);
    }
  }
}

// TODO: reemplazar por los datos de la base de datos
const List<Collaborator> sampleCollaborators = [
  Collaborator(
    name: 'María Fernanda López',
    startHour: 8,
    endHour: 15,
    days: [1, 2, 3, 4, 5],
    daysLabel: 'Lunes-Viernes',
    specialties: ['Limpieza regular', 'Baños'],
  ),
  Collaborator(
    name: 'Carlos Hernández',
    startHour: 9,
    endHour: 18,
    days: [1, 2, 3, 4, 5, 6],
    daysLabel: 'Lunes-Sábado',
    specialties: ['Limpieza profunda', 'Cocina'],
  ),
  Collaborator(
    name: 'Ana Sofía Martínez',
    startHour: 12,
    endHour: 20,
    days: [1, 2, 3, 4, 5],
    daysLabel: 'Lunes-Viernes',
    specialties: ['Limpieza post-obra', 'Ventanas'],
  ),
  Collaborator(
    name: 'José Luis Ramírez',
    startHour: 7,
    endHour: 13,
    days: [1, 2, 3, 4, 5, 6],
    daysLabel: 'Lunes-Sábado',
    specialties: ['Limpieza regular', 'Lavandería'],
  ),
  Collaborator(
    name: 'Lucía Torres',
    startHour: 10,
    endHour: 17,
    days: [3, 4, 5, 6],
    daysLabel: 'Miércoles-Sábado',
    specialties: ['Limpieza profunda', 'Baños', 'Cocina'],
  ),
  Collaborator(
    name: 'Diego Castillo',
    startHour: 13,
    endHour: 21,
    days: [2, 3, 4, 5, 6],
    daysLabel: 'Martes-Sábado',
    specialties: ['Limpieza post-obra', 'Limpieza profunda'],
  ),
  Collaborator(
    name: 'Valeria Chan',
    startHour: 8,
    endHour: 14,
    days: [6, 7],
    daysLabel: 'Sábado-Domingo',
    specialties: ['Limpieza regular', 'Ventanas'],
  ),
];