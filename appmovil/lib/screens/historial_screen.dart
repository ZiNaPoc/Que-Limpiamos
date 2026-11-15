import 'package:flutter/material.dart';

import 'package:appmovil/services/historial_store.dart';

class HistorialScreen extends StatelessWidget {
  const HistorialScreen({super.key});

  static const Color navy = Color(0xFF293B53);
  static const Color cardNavy = Color(0xFF2F4565);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE8EEE6),
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFB9D0E0), Color(0xFFF4F1E9), Color(0xFFDCE5D0)],
          ),
        ),
        child: SafeArea(
          child: AnimatedBuilder(
            animation: HistorialStore.instance,
            builder: (context, _) {
              final store = HistorialStore.instance;

              return SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 30),
                      Row(
                        children: [
                          IconButton(
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            onPressed: () => Navigator.maybePop(context),
                            icon: const Icon(
                              Icons.chevron_left,
                              size: 30,
                              color: navy,
                            ),
                          ),
                          const SizedBox(width: 12),
                          const Text(
                            'Historial',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.black,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 28),

                      if (store.vacio) _vacio(context),

                      if (store.actual != null) _tarjetaActual(context, store),

                      if (store.pasadas.isNotEmpty) ...[
                        const SizedBox(height: 26),
                        const Text(
                          'Pasadas',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                        const SizedBox(height: 12),
                        for (final r in store.pasadas) ...[
                          _tarjetaPasada(r),
                          const SizedBox(height: 12),
                        ],
                      ],
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  // ───────────────────────── SIN SERVICIOS ─────────────────────────
  Widget _vacio(BuildContext context) {
    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.5,
      child: const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.history, size: 56, color: Color(0xFF9AA8B5)),
            SizedBox(height: 12),
            Text(
              'Todavía no tienes servicios',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            SizedBox(height: 4),
            Text(
              'Cuando solicites una limpieza aparecerá aquí.',
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w700,
                color: Color(0xFF777777),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ───────────────────── SERVICIO ACTUAL (tarjeta azul) ─────────────────────
  Widget _tarjetaActual(BuildContext context, HistorialStore store) {
    final r = store.actual!;
    final c = r.colaborador;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(14, 16, 14, 14),
      decoration: BoxDecoration(
        color: cardNavy,
        borderRadius: BorderRadius.circular(26),
        boxShadow: const [
          BoxShadow(
            color: Color(0x40000000),
            blurRadius: 16,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 68,
                height: 68,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFFC5D2DC),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      c?.name ?? 'Colaborador',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Horario: ${c?.scheduleText ?? 'Por definir'}',
                      style: const TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFC8D4E0),
              borderRadius: BorderRadius.circular(22),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Servicio: ${r.servicio}', style: _datoStyle),
                const SizedBox(height: 3),
                Text(
                  'Fecha: ${r.fecha} | Horario: ${r.horario}',
                  style: _datoStyle,
                ),
                const SizedBox(height: 3),
                Text('Precio: ${r.precio}', style: _datoStyle),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              GestureDetector(
                onTap: () => _confirmarEliminar(context, store),
                child: _boton(
                  'Eliminar limpieza',
                  fondo: const Color(0xFF4B7380),
                  colorTexto: Colors.white,
                ),
              ),

              const SizedBox(width: 8),

              GestureDetector(
                onTap: () {
                  // TODO: editar fecha / horario de la limpieza
                },
                child: _boton(
                  'Editar limpieza',
                  fondo: Colors.white,
                  colorTexto: navy,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  static const TextStyle _datoStyle = TextStyle(
    fontSize: 8.5,
    fontWeight: FontWeight.bold,
    color: Color(0xFF1F2D40),
  );

  Widget _boton(
    String etiqueta, {
    required Color fondo,
    required Color colorTexto,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: fondo,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        etiqueta,
        style: TextStyle(
          fontSize: 7,
          fontWeight: FontWeight.bold,
          color: colorTexto,
        ),
      ),
    );
  }

  void _confirmarEliminar(BuildContext context, HistorialStore store) {
    showDialog(
      context: context,
      barrierColor: const Color(0x99000000),
      builder: (dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(22),
          ),
          title: const Text(
            '¿Eliminar limpieza?',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
          ),
          content: const Text(
            'Se cancelará tu servicio programado.',
            style: TextStyle(fontSize: 11),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancelar'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext);
                store.eliminarActual();
              },
              child: const Text('Eliminar'),
            ),
          ],
        );
      },
    );
  }

  // ───────────────────── SERVICIOS PASADOS ─────────────────────
  Widget _tarjetaPasada(Reserva r) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF7F8F8),
        borderRadius: BorderRadius.circular(22),
        boxShadow: const [
          BoxShadow(
            color: Color(0x2E000000),
            blurRadius: 12,
            offset: Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Color(0xFF4E7A55),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  r.servicio,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Text(
                      r.fecha,
                      style: const TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF9A9A9A),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Text(
                      r.horario,
                      style: const TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF9A9A9A),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Column(
            children: [
              GestureDetector(
                onTap: () {
                  // TODO: reagendar esta limpieza
                },
                child: _botonContorno('Reagendar'),
              ),
              const SizedBox(height: 5),
              GestureDetector(
                onTap: () {
                  // TODO: reportar un problema con este servicio
                },
                child: _botonContorno('Reportar'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _botonContorno(String texto) {
    return Container(
      width: 62,
      padding: const EdgeInsets.symmetric(vertical: 4),
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: navy, width: 1),
      ),
      child: Text(
        texto,
        style: const TextStyle(
          fontSize: 7,
          fontWeight: FontWeight.w700,
          color: navy,
        ),
      ),
    );
  }
}
