import 'package:flutter/material.dart';
import 'app_bottom_nav.dart';
import 'package:appmovil/models/collaborator.dart';
import 'avisos_screen.dart';
import '../avisos_store.dart';

class CollaboratorProfileScreen extends StatelessWidget {
  const CollaboratorProfileScreen({
    super.key,
    required this.collaborator,
  });

  final Collaborator collaborator;

  static const Color navy = Color(0xFF293B53);
  static const Color chipGreen = Color(0xFFCDE8C9);

  @override
  Widget build(BuildContext context) {
    final c = collaborator;

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
              Expanded(
                child: SingleChildScrollView(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      children: [
                        const SizedBox(height: 24),

                        Align(
                          alignment: Alignment.centerLeft,
                          child: IconButton(
                            padding: EdgeInsets.zero,
                            onPressed: () =>
                                Navigator.maybePop(context),
                            icon: const Icon(
                              Icons.chevron_left,
                              size: 30,
                              color: navy,
                            ),
                          ),
                        ),

                        const SizedBox(height: 4),

                        // FOTO
                        Container(
                          width: 110,
                          height: 110,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: chipGreen,
                          ),
                        ),

                        const SizedBox(height: 22),

                        Text(
                          c.name,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),

                        const SizedBox(height: 24),

                        // ESPECIALIDADES
                        _infoCard(
                          title: 'Especialidades',
                          child: Wrap(
                            spacing: 6,
                            runSpacing: 6,
                            children: [
                              for (final s in c.specialties)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 3,
                                  ),
                                  decoration: BoxDecoration(
                                    color: chipGreen,
                                    borderRadius:
                                        BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    s,
                                    style: const TextStyle(
                                      fontSize: 7,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF2F4F2A),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 16),

                        // HORARIOS
                        _infoCard(
                          title: 'Horarios',
                          child: Row(
                            mainAxisAlignment:
                                MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                c.daysLabel,
                                style: const TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  color: navy,
                                ),
                              ),
                              Text(
                                c.scheduleText,
                                style: const TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  color: navy,
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 40),

                        // BOTÓN CONTACTAR
                        Align(
                          alignment: Alignment.centerRight,
                          child: GestureDetector(
                            onTap: () {
                              AvisosStore.instance.confirmarManual(
                                collaborator,
                              );

                              Navigator.pushAndRemoveUntil(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => const AvisosScreen(),
                                ),
                                (route) => false,
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 22,
                                vertical: 10,
                              ),
                              decoration: BoxDecoration(
                                color: navy,
                                borderRadius:
                                    BorderRadius.circular(20),
                              ),
                              child: const Text(
                                'Contactar',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
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

  Widget _infoCard({
    required String title,
    required Widget child,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
      decoration: BoxDecoration(
        color: const Color(0xFFF7F8F8),
        borderRadius: BorderRadius.circular(18),
        boxShadow: const [
          BoxShadow(
            color: Color(0x2E000000),
            blurRadius: 14,
            offset: Offset(0, 7),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }
}
