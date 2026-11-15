import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AuthColors {
  static const Color navy = Color(0xFF2E4054);
  static const Color blue = Color(0xFFB7CEDD);
  static const Color beige = Color(0xFFF0EFED);
  static const Color green = Color(0xFF5B8C5A);
  static const Color uploadFill = Color(0xFFB4D5B1);
  static const Color fieldFill = Color(0xFFE8EAEF);
  static const Color textDark = Color(0xFF1C1C1C);
  static const Color textGrey = Color(0xFF7A7A7A);
  static const Color hintGrey = Color(0xFF9A9FA8);
  static const Color chevron = Color(0xFF5C7384);
}


class AuthScaffold extends StatelessWidget {
  const AuthScaffold({
    super.key,
    required this.title,
    required this.subtitle,
    required this.children,
    this.footer,
  });

  final String title;
  final String subtitle;
  final List<Widget> children;
  final Widget? footer;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [AuthColors.blue, AuthColors.beige, AuthColors.beige],
            stops: [0.0, 0.28, 1.0],
          ),
        ),
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              return SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: constraints.maxHeight),
                  child: IntrinsicHeight(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 16),

                      
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            InkResponse(
                              onTap: () => Navigator.maybePop(context),
                              radius: 24,
                              child: const Icon(
                                Icons.chevron_left,
                                size: 38,
                                color: AuthColors.chevron,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 6),

                        
                        Text(
                          title,
                          style: const TextStyle(
                            color: AuthColors.textDark,
                            fontSize: 26,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          subtitle,
                          style: const TextStyle(
                            color: AuthColors.textGrey,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),

                        const SizedBox(height: 28),

                        ...children,

                        const Spacer(),

                        if (footer != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 24, bottom: 18),
                            child: Center(child: footer!),
                          )
                        else
                          const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

class AuthTextField extends StatelessWidget {
  const AuthTextField({
    super.key,
    required this.label,
    required this.hint,
    this.keyboardType,
    this.obscureText = false,
    this.textInputAction = TextInputAction.next,
    this.textCapitalization = TextCapitalization.none,
    this.inputFormatters,
    this.controller,
  });

  final String label;
  final String hint;
  final TextInputType? keyboardType;
  final bool obscureText;
  final TextInputAction textInputAction;
  final TextCapitalization textCapitalization;
  final List<TextInputFormatter>? inputFormatters;
  final TextEditingController? controller;

  OutlineInputBorder _border(Color color, [double width = 1]) {
    return OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: BorderSide(color: color, width: width),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: AuthColors.textDark,
            fontSize: 13,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 6),
        TextField(
          keyboardType: keyboardType,
          obscureText: obscureText,
          textInputAction: textInputAction,
          textCapitalization: textCapitalization,
          inputFormatters: inputFormatters,
          controller: controller,
          cursorColor: AuthColors.navy,
          style: const TextStyle(fontSize: 13, color: AuthColors.textDark),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(
              fontSize: 11.5,
              color: AuthColors.hintGrey,
            ),
            filled: true,
            fillColor: AuthColors.fieldFill,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            enabledBorder: _border(AuthColors.navy),
            focusedBorder: _border(AuthColors.navy, 1.6),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}

class AuthPrimaryButton extends StatelessWidget {
  const AuthPrimaryButton({
    super.key,
    required this.label,
    required this.onPressed,
  });

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 46,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AuthColors.navy,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30),
          ),
        ),
        child: Text(
          label,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
        ),
      ),
    );
  }
}


class AuthLink extends StatelessWidget {
  const AuthLink({super.key, required this.text, required this.onTap});

  final String text;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Text(
        text,
        style: const TextStyle(
          color: AuthColors.green,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          decoration: TextDecoration.underline,
          decorationColor: AuthColors.green,
        ),
      ),
    );
  }
}


class UploadBox extends StatelessWidget {
  const UploadBox({super.key, required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AuthColors.uploadFill,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AuthColors.navy, width: 1),
      ),
      child: InkWell(
        onTap: onTap,
        child: SizedBox(
          height: 92,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.arrow_upward,
                size: 24,
                color: Color(0xFF5A5A5A),
              ),
              const SizedBox(height: 8),
              Text(
                label,
                style: const TextStyle(
                  color: AuthColors.textDark,
                  fontSize: 11,
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