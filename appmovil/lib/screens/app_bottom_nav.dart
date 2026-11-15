import 'package:flutter/material.dart';

import 'avisos_screen.dart';
import 'home_screen.dart';
import 'profile_screen.dart';
import 'services_screen.dart';

class AppBottomNav extends StatelessWidget {
  const AppBottomNav({
    super.key,
    required this.currentIndex,
    // Ya no se usa: el menú navega solo. Se deja para que las pantallas
    // que todavía lo pasan no marquen error.
    this.onTap,
  });

  final int currentIndex;
  final ValueChanged<int>? onTap;

  static const List<_NavEntry> _items = [
    _NavEntry(Icons.home_outlined, 'Inicio'),
    _NavEntry(Icons.auto_awesome, 'Solicitar'),
    _NavEntry(Icons.notifications_none, 'Avisos'),
    _NavEntry(Icons.person_outline, 'Perfil'),
  ];

  void _navegar(BuildContext context, int destino) {
    if (destino == currentIndex) return;

    switch (destino) {
      case 0:
        _ir(context, const HomeScreen());
        break;
      case 1:
        _ir(context, const ServicesScreen());
        break;
      case 2:
        _ir(context, const AvisosScreen());
        break;
      case 3:
        _ir(context, const PerfilScreen());
        break;
    }
  }

  // Cambia de pestaña quitando todo lo anterior, así Welcome ya no queda debajo
  void _ir(BuildContext context, Widget pantalla) {
    Navigator.of(context).pushAndRemoveUntil(
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => pantalla,
        transitionDuration: Duration.zero,
        reverseTransitionDuration: Duration.zero,
      ),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 5, 24, 15),
      child: Container(
        height: 51,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(30),
          boxShadow: const [
            BoxShadow(
              color: Color(0x21000000),
              blurRadius: 14,
              offset: Offset(0, 5),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            for (var i = 0; i < _items.length; i++)
              _NavItem(
                entry: _items[i],
                selected: i == currentIndex,
                onTap: () => _navegar(context, i),
              ),
          ],
        ),
      ),
    );
  }
}

class _NavEntry {
  const _NavEntry(this.icon, this.label);

  final IconData icon;
  final String label;
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.entry,
    required this.selected,
    required this.onTap,
  });

  final _NavEntry entry;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final Color color = selected ? const Color(0xFF536B7C) : Colors.grey;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 2),
            decoration: BoxDecoration(
              color: selected ? const Color(0xFFDCE5E8) : Colors.transparent,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(entry.icon, size: 19, color: color),
          ),
          Text(entry.label, style: TextStyle(fontSize: 7, color: color)),
        ],
      ),
    );
  }
}