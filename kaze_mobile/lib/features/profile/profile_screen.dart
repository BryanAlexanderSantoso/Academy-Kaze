import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/app_colors.dart';
import '../../core/user_provider.dart';
import '../../core/supabase_service.dart';
import '../../shared/widgets/glass_card.dart';
import '../premium/premium_payment_screen.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  final SupabaseService _api = SupabaseService();
  Map<String, dynamic>? _profile;
  bool _isPremium = false;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final user = ref.read(userProvider);
    if (user != null) {
      final profile = await _api.getProfile(user.id);
      final isPremium = await _api.isPremium(user.id);
      if (mounted) {
        setState(() {
          _profile = profile;
          _isPremium = isPremium;
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading)
      return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        title: const Text('PROFIL_USER',
            style: TextStyle(
                fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 2)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            _buildProfileHeader(),
            const SizedBox(height: 32),
            _buildPremiumStatus(),
            const SizedBox(height: 32),
            _buildMenuSection(),
            const SizedBox(height: 48),
            _buildLogoutButton(),
            const SizedBox(height: 100), // Space for dock
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader() {
    return Column(
      children: [
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: AppColors.primaryGradient,
            border: Border.all(color: Colors.white10, width: 4),
          ),
          child: const Center(
              child: Icon(Icons.person, size: 50, color: Colors.white)),
        ),
        const SizedBox(height: 20),
        Text(
          _profile?['full_name'] ?? 'Developer',
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
        Text(
          ref.read(userProvider)?.email ?? '',
          style: const TextStyle(color: AppColors.textSecondary),
        ),
      ],
    );
  }

  Widget _buildPremiumStatus() {
    return GlassCard(
      padding: const EdgeInsets.all(24),
      opacity: _isPremium ? 0.2 : 0.05,
      child: Row(
        children: [
          Icon(
            _isPremium ? Icons.verified_rounded : Icons.info_outline_rounded,
            color: _isPremium ? AppColors.accent : AppColors.textSecondary,
            size: 32,
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _isPremium ? 'AKSES_PREMIUM_AKTIF' : 'AKSES_GRATIS',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1,
                    color:
                        _isPremium ? AppColors.accent : AppColors.textSecondary,
                  ),
                ),
                Text(
                  _isPremium
                      ? 'Berlaku hingga: ${_profile?['premium_until']?.split('T')[0] ?? 'Selamanya'}'
                      : 'Upgrade untuk akses semua materi.',
                  style: const TextStyle(
                      fontSize: 11, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          if (!_isPremium)
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const PremiumPaymentScreen()),
                );
              },
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(80, 40),
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(horizontal: 16),
              ),
              child: const Text('UPGRADE',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
            ),
        ],
      ),
    );
  }

  Widget _buildMenuSection() {
    return Column(
      children: [
        _buildMenuItem(Icons.history_edu_rounded, 'Riwayat Belajar'),
        const SizedBox(height: 16),
        _buildMenuItem(Icons.workspace_premium_rounded, 'Kelola Langganan'),
        const SizedBox(height: 16),
        _buildMenuItem(Icons.settings_outlined, 'Pengaturan Akun'),
      ],
    );
  }

  Widget _buildMenuItem(IconData icon, String title) {
    return GlassCard(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      borderRadius: 16,
      child: Row(
        children: [
          Icon(icon, color: Colors.white70, size: 20),
          const SizedBox(width: 16),
          Expanded(
              child: Text(title,
                  style: const TextStyle(fontWeight: FontWeight.w600))),
          const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.white24),
        ],
      ),
    );
  }

  Widget _buildLogoutButton() {
    return TextButton.icon(
      onPressed: () => ref.read(userProvider.notifier).logout(),
      icon: const Icon(Icons.logout_rounded, color: AppColors.error),
      label: const Text('KELUAR_SESI',
          style:
              TextStyle(color: AppColors.error, fontWeight: FontWeight.bold)),
    );
  }
}
