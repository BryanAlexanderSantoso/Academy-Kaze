import 'package:flutter/material.dart';
import '../../core/app_colors.dart';
import '../../shared/widgets/glass_card.dart';

class PremiumPaymentScreen extends StatefulWidget {
  const PremiumPaymentScreen({super.key});

  @override
  State<PremiumPaymentScreen> createState() => _PremiumPaymentScreenState();
}

class _PremiumPaymentScreenState extends State<PremiumPaymentScreen> {
  String _selectedTier = 'Premium';
  bool _isUploading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        title: const Text('UPGRADE_PREMIUM',
            style: TextStyle(
                fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 2)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildTierSelector(),
            const SizedBox(height: 32),
            _buildPaymentMethod(),
            const SizedBox(height: 32),
            _buildUploadSection(),
            const SizedBox(height: 48),
            _buildConfirmButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildTierSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('PILIH_PAKET',
            style: TextStyle(
                color: AppColors.accent,
                fontWeight: FontWeight.w900,
                fontSize: 10,
                letterSpacing: 2)),
        const SizedBox(height: 16),
        Row(
          children: [
            _buildTierCard('Premium', 'Rp 99.000', _selectedTier == 'Premium'),
            const SizedBox(width: 16),
            _buildTierCard(
                'Premium+', 'Rp 149.000', _selectedTier == 'Premium+'),
          ],
        ),
      ],
    );
  }

  Widget _buildTierCard(String name, String price, bool isSelected) {
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedTier = name),
        child: GlassCard(
          padding: const EdgeInsets.all(20),
          opacity: isSelected ? 0.2 : 0.05,
          borderRadius: 20,
          child: Column(
            children: [
              Text(name,
                  style: TextStyle(
                      fontWeight: FontWeight.w900,
                      color: isSelected ? AppColors.accent : Colors.white)),
              const SizedBox(height: 8),
              Text(price,
                  style: const TextStyle(
                      fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentMethod() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('TRANSFER_MANUAL',
            style: TextStyle(
                color: AppColors.accent,
                fontWeight: FontWeight.w900,
                fontSize: 10,
                letterSpacing: 2)),
        const SizedBox(height: 16),
        GlassCard(
          padding: const EdgeInsets.all(24),
          child: Row(
            children: [
              Container(
                width: 60,
                height: 40,
                decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8)),
                child: const Center(
                    child: Text('BCA',
                        style: TextStyle(
                            color: Colors.blue, fontWeight: FontWeight.bold))),
              ),
              const SizedBox(width: 20),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('8692138128',
                      style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1)),
                  Text('A/N Bryan Alexander S',
                      style: TextStyle(
                          color: AppColors.textSecondary, fontSize: 12)),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildUploadSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('BUKTI_TRANSFER',
            style: TextStyle(
                color: AppColors.accent,
                fontWeight: FontWeight.w900,
                fontSize: 10,
                letterSpacing: 2)),
        const SizedBox(height: 16),
        GestureDetector(
          onTap: () {
            // Logic for image picking
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                content: Text('Silakan pilih file bukti transfer.')));
          },
          child: Container(
            height: 150,
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(24),
              border:
                  Border.all(color: Colors.white10, style: BorderStyle.solid),
            ),
            child: const Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.cloud_upload_outlined,
                    size: 40, color: AppColors.textSecondary),
                SizedBox(height: 12),
                Text('Tap untuk Upload Bukti',
                    style: TextStyle(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildConfirmButton() {
    return SizedBox(
      width: double.infinity,
      height: 60,
      child: ElevatedButton(
        onPressed: () {
          setState(() => _isUploading = true);
          Future.delayed(const Duration(seconds: 2), () {
            if (mounted) {
              setState(() => _isUploading = false);
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                  content: Text(
                      'Pembayaran berhasil dikirim! Silakan tunggu verifikasi admin.')));
            }
          });
        },
        style: ElevatedButton.styleFrom(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          padding: EdgeInsets.zero,
        ),
        child: Ink(
          decoration: BoxDecoration(
            gradient: AppColors.primaryGradient,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Container(
            alignment: Alignment.center,
            child: _isUploading
                ? const CircularProgressIndicator(color: Colors.white)
                : const Text('KONFIRMASI_PEMBAYARAN',
                    style: TextStyle(
                        fontWeight: FontWeight.w900, letterSpacing: 1.5)),
          ),
        ),
      ),
    );
  }
}
