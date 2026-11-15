import 'package:flutter/material.dart';
import 'app_bottom_nav.dart';
import 'package:appmovil/models/collaborator.dart';
import 'collaborator_profile_screen.dart';


class CollaboratorsScreen extends StatefulWidget {
  const CollaboratorsScreen({super.key, this.serviceTitle});

  final String? serviceTitle;

  @override
  State<CollaboratorsScreen> createState() => _CollaboratorsScreenState();
}

class _CollaboratorsScreenState extends State<CollaboratorsScreen> {
  static const Color navy = Color(0xFF293B53);
  static const Color avatarGreen = Color(0xFFCDE8C9);

  HorarioFiltro filtro = HorarioFiltro.cualquiera;

  @override
  Widget build(BuildContext context) {
    final lista =
        sampleCollaborators.where((c) => c.matches(filtro)).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFE8EEE6),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFFB9D0E0),
              Color(0xFFF4F1E9),
              Color(0xFFDCE5D0),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 24, 20, 0),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.maybePop(context),
                      icon: const Icon(Icons.chevron_left,
                          size: 30, color: navy),
                    ),
                    const SizedBox(width: 2),
                    const Text(
                      'Colaboradores',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                  ],
                ),
              ),
              const Padding(
                padding: EdgeInsets.only(left: 64, top: 0),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Elige a tu colaborador',
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF555555),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // FILTROS
              SizedBox(
                height: 32,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: HorarioFiltro.values.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, i) {
                    final f = HorarioFiltro.values[i];
                    return _chip(f);
                  },
                ),
              ),
              const SizedBox(height: 14),

              // LISTA
              Expanded(
                child: lista.isEmpty
                    ? const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(horizontal: 40),
                          child: Text(
                            'No hay colaboradores disponibles en este horario.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF555555),
                            ),
                          ),
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        itemCount: lista.length,
                        separatorBuilder: (_, __) =>
                            const SizedBox(height: 16),
                        itemBuilder: (context, i) => _card(lista[i]),
                      ),
              ),

              AppBottomNav(
                currentIndex: 1,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _chip(HorarioFiltro f) {
    final selected = f == filtro;
    return GestureDetector(
      onTap: () => setState(() => filtro = f),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? navy : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: navy, width: 1.2),
        ),
        child: Text(
          f.label,
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.bold,
            color: selected ? Colors.white : navy,
          ),
        ),
      ),
    );
  }

  Widget _card(Collaborator c) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => CollaboratorProfileScreen(collaborator: c),
          ),
        );
      },
      child: Container(
        height: 80,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: const Color(0xFFF7F8F8),
          borderRadius: BorderRadius.circular(22),
          boxShadow: const [
            BoxShadow(
              color: Color(0x2E000000),
              blurRadius: 14,
              offset: Offset(0, 7),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: avatarGreen,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    c.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Horario: ${c.scheduleText}',
                    style: const TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF555555),
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, size: 22, color: Colors.black),
          ],
        ),
      ),
    );
  }
}