import 'package:flutter/material.dart';

import 'app_bottom_nav.dart';
import 'services_screen.dart';
import 'historial_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, this.userName = 'Usuario'});

  final String userName;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int selectedIndex = 0;

  static const Color navy = Color(0xFF293B53);

  void openServices() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const ServicesScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE8EEE6),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFB9D0E0), Color(0xFFF4F1E9), Color(0xFFDCE5D0)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 17),

                        // BUSCADOR
                        Container(
                          height: 43,
                          decoration: BoxDecoration(
                            color: const Color(0xFFC6D6E3),
                            borderRadius: BorderRadius.circular(30),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x1F000000),
                                blurRadius: 15,
                                offset: Offset(0, 7),
                              ),
                            ],
                          ),
                          child: const TextField(
                            decoration: InputDecoration(
                              hintText: 'Buscar',
                              hintStyle: TextStyle(
                                fontSize: 10,
                                color: Colors.black54,
                              ),
                              prefixIcon: Icon(
                                Icons.search,
                                size: 18,
                                color: Colors.grey,
                              ),
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.only(top: 12),
                            ),
                          ),
                        ),

                        const SizedBox(height: 20),

                        // HISTORIAL
                        GestureDetector(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const HistorialScreen(),
                              ),
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 9,
                              vertical: 5,
                            ),
                            decoration: BoxDecoration(
                              color: navy,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.history,
                                  color: Colors.white,
                                  size: 12,
                                ),
                                SizedBox(width: 3),
                                Text(
                                  'Historial',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 18),

                        Container(
                          height: 120,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: navy,
                            borderRadius: BorderRadius.circular(15),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x38000000),
                                blurRadius: 12,
                                offset: Offset(0, 7),
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(15),
                            child: Stack(
                              children: [
                                Positioned(
                                  right: 15,
                                  top: 7,
                                  child: bubble(37),
                                ),
                                Positioned(
                                  right: 57,
                                  top: 43,
                                  child: bubble(25),
                                ),
                                Positioned(
                                  right: -3,
                                  bottom: 5,
                                  child: bubble(37),
                                ),
                                Positioned(
                                  right: 53,
                                  bottom: -7,
                                  child: bubble(40),
                                ),
                                Positioned(
                                  right: 25,
                                  bottom: -8,
                                  child: bubble(23),
                                ),

                                Padding(
                                  padding: const EdgeInsets.all(14),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Hola, ${widget.userName}',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      const Text(
                                        '¿Qué deseas\nlimpiar?',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 16,
                                          height: 1.15,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const Spacer(),
                                      GestureDetector(
                                        onTap: openServices,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 7,
                                            vertical: 4,
                                          ),
                                          decoration: BoxDecoration(
                                            color: Colors.white,
                                            borderRadius: BorderRadius.circular(
                                              20,
                                            ),
                                          ),
                                          child: const Text(
                                            'Solicitar una limpieza',
                                            style: TextStyle(
                                              color: navy,
                                              fontSize: 8,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 17),

                        const Text(
                          'Paquetes más populares',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),

                        const SizedBox(height: 12),

                        SizedBox(
                          height: 170,
                          child: ListView(
                            scrollDirection: Axis.horizontal,

                            clipBehavior: Clip.none,
                            padding: const EdgeInsets.only(top: 4, bottom: 18),
                            children: [
                              packageCard(
                                'Limpieza regular',
                                '\$400',
                                'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500',
                              ),
                              const SizedBox(width: 12),
                              packageCard(
                                'Limpieza profunda',
                                '\$600',
                                'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500',
                              ),
                              const SizedBox(width: 12),
                              packageCard(
                                'Limpieza post-obra',
                                '\$650',
                                'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500',
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ),
              ),

              const AppBottomNav(currentIndex: 0),
            ],
          ),
        ),
      ),
    );
  }

  Widget bubble(double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: const RadialGradient(
          colors: [Color(0x8CB9D0E8), Color(0x80738BAF), Color(0x33293B53)],
        ),
        border: Border.all(color: const Color(0x40FFFFFF), width: 1.5),
        boxShadow: const [BoxShadow(color: Color(0x2640C4FF), blurRadius: 5)],
      ),
    );
  }

  Widget packageCard(String title, String price, String image) {
    return Container(
      width: 215,
      decoration: BoxDecoration(
        color: const Color(0xFFB5CCDC),
        borderRadius: BorderRadius.circular(15),
        boxShadow: const [
          BoxShadow(
            color: Color(0x2E000000),
            blurRadius: 9,
            offset: Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(15),
              ),
              child: Image.network(
                image,
                width: double.infinity,
                height: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: double.infinity,
                    height: double.infinity,
                    color: const Color(0xFF8FAABD),
                    child: const Icon(
                      Icons.cleaning_services,
                      color: Colors.white,
                      size: 30,
                    ),
                  );
                },
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(10, 5, 5, 5),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    color: navy,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  price,
                  style: const TextStyle(
                    fontSize: 10,
                    color: Color(0xFF294D7A),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
