import 'package:flutter/material.dart';
import '../../core/app_colors.dart';
import '../../shared/widgets/glass_card.dart';

class AssignmentsScreen extends StatelessWidget {
  const AssignmentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        title: const Text('TUGAS_&_PROYEK',
            style: TextStyle(
                fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 2)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            _buildAssignmentCard('Analisis Protokol Frontend', 'UI/UX Redesign',
                'Menunggu Review', AppColors.accent),
            const SizedBox(height: 16),
            _buildAssignmentCard('Backend Neural Network', 'Python Scripting',
                'Selesai', AppColors.success),
            const SizedBox(height: 16),
            _buildAssignmentCard('Security Audit X-1', 'Cyber Security',
                'Belum Dikerjakan', AppColors.textSecondary),
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildAssignmentCard(
      String title, String category, String status, Color statusColor) {
    return GlassCard(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(category.toUpperCase(),
                  style: const TextStyle(
                      color: AppColors.primary,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6)),
                child: Text(status,
                    style: TextStyle(
                        color: statusColor,
                        fontSize: 9,
                        fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(title,
              style:
                  const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          Row(
            children: [
              const Icon(Icons.calendar_today_outlined,
                  size: 14, color: AppColors.textSecondary),
              const SizedBox(width: 8),
              const Text('Deadline: 25 Des 2026',
                  style:
                      TextStyle(color: AppColors.textSecondary, fontSize: 12)),
              const Spacer(),
              const Text('Lihat Detail',
                  style: TextStyle(
                      color: AppColors.accent,
                      fontWeight: FontWeight.bold,
                      fontSize: 12)),
              const Icon(Icons.chevron_right,
                  size: 16, color: AppColors.accent),
            ],
          ),
        ],
      ),
    );
  }
}
