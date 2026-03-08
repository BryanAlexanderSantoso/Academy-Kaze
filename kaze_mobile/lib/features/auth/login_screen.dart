import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/app_colors.dart';
import '../../core/user_provider.dart';
import '../../shared/widgets/glass_card.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'register_screen.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _handleLogin() async {
    setState(() => _isLoading = true);
    try {
      await ref.read(userProvider.notifier).login(
            _emailController.text.trim(),
            _passwordController.text.trim(),
          );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Login Gagal: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      body: Stack(
        children: [
          _buildGlowBackground(),
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildLogo(),
                  const SizedBox(height: 48),
                  GlassCard(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      children: [
                        Text(
                          'AKSES_PROTOKOL',
                          style:
                              Theme.of(context).textTheme.titleLarge?.copyWith(
                                    letterSpacing: 4,
                                    fontSize: 12,
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w900,
                                  ),
                        ),
                        const SizedBox(height: 32),
                        _buildTextField(_emailController, 'EMAIL_ADDRESS',
                            Icons.alternate_email_rounded),
                        const SizedBox(height: 24),
                        _buildTextField(_passwordController, 'PASSWORD',
                            Icons.lock_outline_rounded,
                            obscureText: true),
                        const SizedBox(height: 40),
                        _buildSubmitButton(),
                        const SizedBox(height: 16),
                        _buildOAuthButtons(),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  _buildRegisterLink(context),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGlowBackground() {
    return Positioned(
      top: -150,
      left: -150,
      child: Container(
        width: 500,
        height: 500,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.15),
              blurRadius: 150,
              spreadRadius: 50,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLogo() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: AppColors.primaryGradient,
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.3),
                blurRadius: 30,
                spreadRadius: 10,
              ),
            ],
          ),
          child: const Icon(Icons.bolt_rounded, size: 48, color: Colors.white),
        ),
        const SizedBox(height: 24),
        const Text(
          'KAZE_DEV',
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w900,
            letterSpacing: -1,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildTextField(
      TextEditingController controller, String label, IconData icon,
      {bool obscureText = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: AppColors.textSecondary,
              letterSpacing: 1),
        ),
        const SizedBox(height: 8),
        Container(
          height: 60,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(16),
          ),
          child: TextField(
            controller: controller,
            obscureText: obscureText,
            style: const TextStyle(color: Colors.white, fontSize: 14),
            decoration: InputDecoration(
              prefixIcon: Icon(icon, color: Colors.white24, size: 20),
              border: InputBorder.none,
              contentPadding:
                  const EdgeInsets.symmetric(vertical: 20, horizontal: 20),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      height: 60,
      child: ElevatedButton(
        onPressed: _isLoading ? null : _handleLogin,
        style: ElevatedButton.styleFrom(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          padding: EdgeInsets.zero,
        ),
        child: Ink(
          decoration: BoxDecoration(
            gradient: AppColors.primaryGradient,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Container(
            alignment: Alignment.center,
            child: _isLoading
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                        color: Colors.white, strokeWidth: 2))
                : const Text('DEPLOY_SESSION',
                    style: TextStyle(
                        fontWeight: FontWeight.w900, letterSpacing: 2)),
          ),
        ),
      ),
    );
  }

  Widget _buildOAuthButtons() {
    return Row(
      children: [
        Expanded(
          child: SizedBox(
            height: 60,
            child: OutlinedButton.icon(
              onPressed: _isLoading
                  ? null
                  : () async {
                      setState(() => _isLoading = true);
                      try {
                        await ref.read(userProvider.notifier).loginWithGoogle();
                      } catch (e) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Google Login Gagal: $e')),
                        );
                      } finally {
                        if (mounted) setState(() => _isLoading = false);
                      }
                    },
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.white24, width: 1.5),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
              ),
              icon: const FaIcon(FontAwesomeIcons.google,
                  color: Colors.white, size: 20),
              label: const Text(
                'GOOGLE',
                style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2),
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: SizedBox(
            height: 60,
            child: OutlinedButton.icon(
              onPressed: _isLoading
                  ? null
                  : () async {
                      setState(() => _isLoading = true);
                      try {
                        await ref
                            .read(userProvider.notifier)
                            .loginWithFacebook();
                      } catch (e) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Facebook Login Gagal: $e')),
                        );
                      } finally {
                        if (mounted) setState(() => _isLoading = false);
                      }
                    },
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.white24, width: 1.5),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
              ),
              icon: const FaIcon(FontAwesomeIcons.facebook,
                  color: Colors.blueAccent, size: 20),
              label: const Text(
                'FACEBOOK',
                style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRegisterLink(BuildContext context) {
    return TextButton(
      onPressed: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const RegisterScreen()),
        );
      },
      child: RichText(
        text: const TextSpan(
          text: 'Belum terdaftar? ',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
          children: [
            TextSpan(
              text: 'Inisialisasi Akun',
              style: TextStyle(
                  color: AppColors.accent, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}
