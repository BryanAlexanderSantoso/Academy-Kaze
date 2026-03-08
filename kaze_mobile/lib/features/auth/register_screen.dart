import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/app_colors.dart';
import '../../core/user_provider.dart';
import '../../shared/widgets/glass_card.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _handleRegister() async {
    if (_nameController.text.isEmpty ||
        _emailController.text.isEmpty ||
        _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Mohon isi semua field')));
      return;
    }

    setState(() => _isLoading = true);
    try {
      await ref.read(userProvider.notifier).register(
            _emailController.text.trim(),
            _passwordController.text.trim(),
            _nameController.text.trim(),
          );
      if (mounted) Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Registrasi Gagal: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      body: Stack(
        children: [
          _buildGlowBackground(),
          SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 80),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildBackButton(),
                const SizedBox(height: 40),
                Text(
                  'INISIALISASI_AKUN',
                  style: Theme.of(context)
                      .textTheme
                      .displayLarge
                      ?.copyWith(fontSize: 32, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Buat identitas baru untuk memulai riset teknologi.',
                  style:
                      TextStyle(color: AppColors.textSecondary, fontSize: 14),
                ),
                const SizedBox(height: 48),
                GlassCard(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    children: [
                      _buildTextField(_nameController, 'FULL_NAME',
                          Icons.person_outline_rounded),
                      const SizedBox(height: 24),
                      _buildTextField(_emailController, 'EMAIL_ADDRESS',
                          Icons.alternate_email_rounded),
                      const SizedBox(height: 24),
                      _buildTextField(_passwordController, 'PASSWORD',
                          Icons.lock_outline_rounded,
                          obscureText: true),
                      const SizedBox(height: 48),
                      _buildSubmitButton(),
                      const SizedBox(height: 16),
                      _buildOAuthButtons(),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBackButton() {
    return GestureDetector(
      onTap: () => Navigator.pop(context),
      child: const GlassCard(
        padding: EdgeInsets.all(12),
        borderRadius: 16,
        child: Icon(Icons.arrow_back_ios_new_rounded,
            color: Colors.white, size: 20),
      ),
    );
  }

  Widget _buildGlowBackground() {
    return Positioned(
      bottom: -150,
      right: -150,
      child: Container(
        width: 500,
        height: 500,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: AppColors.secondary.withOpacity(0.1),
              blurRadius: 150,
              spreadRadius: 50,
            ),
          ],
        ),
      ),
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
      height: 66,
      child: ElevatedButton(
        onPressed: _isLoading ? null : _handleRegister,
        style: ElevatedButton.styleFrom(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          padding: EdgeInsets.zero,
        ),
        child: Ink(
          decoration: BoxDecoration(
            gradient: AppColors.primaryGradient,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Container(
            alignment: Alignment.center,
            child: _isLoading
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                        color: Colors.white, strokeWidth: 2))
                : const Text('CREATE_IDENTITY',
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
}
