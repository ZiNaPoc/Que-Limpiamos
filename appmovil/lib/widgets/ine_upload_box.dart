import 'dart:io';

import 'package:flutter/material.dart';

class IneUploadBox extends StatelessWidget {
  final String label;
  final String? imagePath;
  final VoidCallback onTap;

  const IneUploadBox({
    super.key,
    required this.label,
    required this.onTap,
    this.imagePath,
  });

  static const Color _fondo = Color(0xFFB8D6B8);
  static const Color _borde = Color(0xFF5A8060);
  static const Color _texto = Color(0xFF55775A);

  @override
  Widget build(BuildContext context) {
    final seleccionada = imagePath != null;

    return Material(
      color: _fondo,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(22),
        side: const BorderSide(color: _borde, width: 1.5),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: SizedBox(
          height: 96,
          child: seleccionada
              ? Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.file(File(imagePath!), fit: BoxFit.cover),
                    Positioned(
                      right: 6,
                      bottom: 6,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: const BoxDecoration(
                          color: _fondo,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.check_circle, color: _borde, size: 20),
                      ),
                    ),
                  ],
                )
              : Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.upload_outlined, color: Colors.black87, size: 26),
                    const SizedBox(height: 8),
                    Text(
                      label,
                      style: const TextStyle(
                        color: _texto,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}