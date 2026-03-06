import 'package:flutter/material.dart';
import '../../core/app_colors.dart';
import '../../shared/widgets/glass_card.dart';

class QuestionnairesScreen extends StatelessWidget {
  const QuestionnairesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        title: const Text('TES_KOMPETENSI',
            style: TextStyle(
                fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 2)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            _buildTestCard(
                'Evaluasi Fundamental React', 'Frontend', '80/100', true),
            const SizedBox(height: 16),
            _buildTestCard('Tes Keamanan Server level 1', 'DevOps', '-', false),
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildTestCard(
      String title, String category, String score, bool isCompleted) {
    return GlassCard(
      padding: const EdgeInsets.all(24),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.quiz_outlined, color: AppColors.primary),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(category.toUpperCase(),
                    style: const TextStyle(
                        color: AppColors.secondary,
                        fontSize: 9,
                        fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(title,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
          ),
          Column(
            children: [
              Text(isCompleted ? 'SKOR' : 'SIAP',
                  style: const TextStyle(
                      fontSize: 10, color: AppColors.textSecondary)),
              Text(score,
                  style: TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 18,
                      color: isCompleted ? AppColors.accent : Colors.white)),
            ],
          ),
        ],
      ),
    );
  }
}
