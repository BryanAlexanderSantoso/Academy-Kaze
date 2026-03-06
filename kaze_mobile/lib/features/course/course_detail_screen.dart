import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/app_colors.dart';
import '../../core/supabase_service.dart';
import '../../core/models/course.dart';
import '../../core/models/chapter.dart';
import 'chapter_watch_screen.dart';
import '../../shared/widgets/glass_card.dart';

class CourseDetailScreen extends StatefulWidget {
  final Course course;
  final bool isPremium;

  const CourseDetailScreen({
    super.key,
    required this.course,
    required this.isPremium,
  });

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  final SupabaseService _api = SupabaseService();
  List<Chapter> _chapters = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchChapters();
  }

  Future<void> _fetchChapters() async {
    final chapters = await _api.getChapters(widget.course.id);
    if (mounted) {
      setState(() {
        _chapters = chapters;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      body: CustomScrollView(
        slivers: [
          _buildSliverAppBar(),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildCourseHeader(),
                  const SizedBox(height: 32),
                  _buildSectionTitle('CURRICULUM', 'CHAPTERS'),
                  const SizedBox(height: 16),
                  _buildChaptersList(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar() {
    return SliverAppBar(
      expandedHeight: 300,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            CachedNetworkImage(
              imageUrl: widget.course.thumbnailUrl ?? '',
              fit: BoxFit.cover,
              errorWidget: (context, url, error) => Container(
                color: AppColors.cardBg,
                child: const Icon(Icons.code, size: 80, color: Colors.white10),
              ),
            ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    AppColors.scaffoldBg.withOpacity(0.8),
                    AppColors.scaffoldBg,
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      leading: Padding(
        padding: const EdgeInsets.all(8.0),
        child: CircleAvatar(
          backgroundColor: Colors.black38,
          child: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
        ),
      ),
    );
  }

  Widget _buildCourseHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.2),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            widget.course.category.toUpperCase(),
            style: const TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
                fontSize: 10,
                letterSpacing: 1),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          widget.course.title,
          style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              letterSpacing: -0.5),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 24,
          runSpacing: 12,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.person_outline,
                    color: AppColors.textSecondary, size: 16),
                const SizedBox(width: 8),
                Flexible(
                  child: Text(
                    widget.course.authorName,
                    style: const TextStyle(color: AppColors.textSecondary),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.library_books_outlined,
                    color: AppColors.textSecondary, size: 16),
                const SizedBox(width: 8),
                Text('${_chapters.length} Modul',
                    style: const TextStyle(color: AppColors.textSecondary)),
              ],
            ),
          ],
        ),
        const SizedBox(height: 24),
        Text(
          widget.course.description,
          style: const TextStyle(
              color: AppColors.textSecondary, fontSize: 15, height: 1.5),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(String badge, String title) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          badge,
          style: const TextStyle(
              color: AppColors.accent,
              fontSize: 10,
              fontWeight: FontWeight.w900,
              letterSpacing: 2),
        ),
        Text(
          title,
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _buildChaptersList() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _chapters.length,
      separatorBuilder: (_, __) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        final chapter = _chapters[index];
        final isLocked = !widget.isPremium && !chapter.isFree;

        return GestureDetector(
          onTap: () {
            if (isLocked) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text('Konten ini khusus member Premium!')),
              );
              return;
            }
            Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => ChapterWatchScreen(chapter: chapter)),
            );
          },
          child: GlassCard(
            padding: const EdgeInsets.all(20),
            borderRadius: 20,
            opacity: isLocked ? 0.05 : 0.1,
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isLocked
                        ? const Color(0x0DFFFFFF)
                        : AppColors.primary.withOpacity(0.2),
                  ),
                  child: Center(
                    child: Text(
                      '${index + 1}',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: isLocked ? Colors.white24 : AppColors.primary,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        chapter.title,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: isLocked ? Colors.white38 : Colors.white,
                        ),
                      ),
                      if (chapter.isFree)
                        const Text(
                          'AKSES_GRATIS',
                          style: TextStyle(
                              color: AppColors.success,
                              fontSize: 10,
                              fontWeight: FontWeight.bold),
                        ),
                    ],
                  ),
                ),
                Icon(
                  isLocked
                      ? Icons.lock_outline_rounded
                      : Icons.play_circle_outline_rounded,
                  color: isLocked ? Colors.white24 : AppColors.accent,
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
