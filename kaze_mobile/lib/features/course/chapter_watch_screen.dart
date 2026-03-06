import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:path/path.dart' as p;
import '../../core/app_colors.dart';
import '../../core/models/chapter.dart';
import '../../shared/widgets/glass_card.dart';

class ChapterWatchScreen extends StatefulWidget {
  final Chapter chapter;

  const ChapterWatchScreen({super.key, required this.chapter});

  @override
  State<ChapterWatchScreen> createState() => _ChapterWatchScreenState();
}

class _ChapterWatchScreenState extends State<ChapterWatchScreen> {
  // Flag untuk debugging
  final bool _showDebug = false; // Set to true if you want to see debug info

  Future<void> _openFile() async {
    // Prioritas: fileUrl -> videoUrl (Compatibility)
    final url = widget.chapter.fileUrl ?? widget.chapter.videoUrl;
    if (url == null || url.isEmpty) return;

    final uri = Uri.parse(url);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        // Fallback: Langsung launch (terkadang canLaunchUrl gagal di web)
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Gunakan fileUrl sebagai data utama
    final actualUrl = widget.chapter.fileUrl ?? widget.chapter.videoUrl;
    final hasFile = actualUrl != null && actualUrl.trim().isNotEmpty;
    final isImage = _isImageUrl(actualUrl);

    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        title: Text(
          widget.chapter.title,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // DEBUG INFO (Only shows if _showDebug is true)
            if (_showDebug)
              Container(
                margin: const EdgeInsets.bottom(16),
                padding: const EdgeInsets.all(8),
                color: hasFile
                    ? Colors.green.withOpacity(0.1)
                    : Colors.red.withOpacity(0.1),
                child: Text(
                  'DEBUG: chapter.fileUrl: ${widget.chapter.fileUrl}\nDEBUG: chapter.videoUrl: ${widget.chapter.videoUrl}',
                  style: TextStyle(
                      color: hasFile ? Colors.green : Colors.red, fontSize: 10),
                ),
              ),

            // File Preview / Action Area
            if (hasFile)
              isImage
                  ? _buildImagePreview(actualUrl!)
                  : _buildFileActionCard(actualUrl!)
            else
              _buildEmptyState(),

            const SizedBox(height: 32),

            // Content Body
            const Text(
              'DESKRIPSI_MATERI',
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w900,
                fontSize: 10,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 16),
            GlassCard(
              padding: const EdgeInsets.all(24),
              child: (widget.chapter.contentBody != null &&
                      widget.chapter.contentBody!.isNotEmpty)
                  ? MarkdownBody(
                      data: widget.chapter.contentBody!,
                      selectable: true,
                      styleSheet: MarkdownStyleSheet(
                        p: const TextStyle(
                            color: Colors.white70, fontSize: 16, height: 1.6),
                        h1: const TextStyle(
                            color: Colors.white, fontWeight: FontWeight.bold),
                        h2: const TextStyle(
                            color: Colors.white, fontWeight: FontWeight.bold),
                        code: const TextStyle(
                            backgroundColor: Colors.black26,
                            color: AppColors.accent),
                        blockquote: const TextStyle(color: Colors.white60),
                        listBullet: const TextStyle(color: AppColors.primary),
                      ),
                    )
                  : const Text(
                      'Konten materi belum ditambahkan oleh instruktur.',
                      style: TextStyle(
                          fontSize: 16, height: 1.6, color: Colors.white70),
                    ),
            ).animate().fadeIn(duration: 600.ms).slideY(begin: 0.1),

            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildImagePreview(String url) {
    return Column(
      children: [
        GestureDetector(
          onTap: _openFile,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: GlassCard(
              padding: EdgeInsets.zero,
              child: Image.network(
                url,
                fit: BoxFit.cover,
                loadingBuilder: (context, child, progress) {
                  if (progress == null) return child;
                  return Container(
                    height: 200,
                    alignment: Alignment.center,
                    child: CircularProgressIndicator(
                      value: progress.expectedTotalBytes != null
                          ? progress.cumulativeBytesLoaded /
                              progress.expectedTotalBytes!
                          : null,
                    ),
                  );
                },
                errorBuilder: (context, error, stackTrace) => Container(
                  height: 200,
                  color: Colors.white10,
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.broken_image,
                          color: Colors.white24, size: 40),
                      const SizedBox(height: 12),
                      const Text(
                        'Gambar tidak dapat dimuat (Masalah CORS)',
                        style: TextStyle(color: Colors.white24, fontSize: 12),
                        textAlign: TextAlign.center,
                      ),
                      TextButton(
                        onPressed: _openFile,
                        child: const Text('Buka di Tab Baru'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        TextButton.icon(
          onPressed: _openFile,
          icon: const Icon(Icons.open_in_new),
          label: const Text('Buka Gambar Penuh'),
          style: TextButton.styleFrom(foregroundColor: AppColors.accent),
        ),
      ],
    ).animate().fadeIn().scale();
  }

  Widget _buildFileActionCard(String url) {
    // Gunakan fileName dari model jika ada, kalau nggak ada parsing dari URL
    final fileName = widget.chapter.fileName ?? p.basename(Uri.parse(url).path);
    final ext = p.extension(fileName).replaceAll('.', '').toUpperCase();

    return GlassCard(
      padding: const EdgeInsets.all(32),
      borderRadius: 24,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              _getFileIcon(ext),
              size: 48,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            fileName.isEmpty ? 'File Materi' : fileName,
            textAlign: TextAlign.center,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
          if (ext.isNotEmpty)
            Text(
              'Format: $ext',
              style:
                  const TextStyle(color: AppColors.textSecondary, fontSize: 12),
            ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _openFile,
            icon: const Icon(Icons.launch_rounded),
            label: const Text('BUKA MATERI'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              minimumSize: const Size(200, 50),
            ),
          ),
        ],
      ),
    ).animate().fadeIn().slideY(begin: 0.1);
  }

  Widget _buildEmptyState() {
    return const GlassCard(
      padding: EdgeInsets.all(40),
      child: Center(
        child: Column(
          children: [
            Icon(Icons.insert_drive_file_outlined,
                size: 48, color: Colors.white24),
            SizedBox(height: 16),
            Text(
              'Tidak ada file materi',
              style:
                  TextStyle(color: Colors.white24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text(
              'Pastikan admin sudah mengunggah file materi di Dashboard Admin.',
              style: TextStyle(color: Colors.white10, fontSize: 11),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  bool _isImageUrl(String? url) {
    if (url == null) return false;
    final path = url.toLowerCase();
    return path.endsWith('.jpg') ||
        path.endsWith('.jpeg') ||
        path.endsWith('.png') ||
        path.endsWith('.gif') ||
        path.endsWith('.webp') ||
        path.contains('image');
  }

  IconData _getFileIcon(String ext) {
    switch (ext) {
      case 'PDF':
        return Icons.picture_as_pdf_rounded;
      case 'DOC':
      case 'DOCX':
        return Icons.description_rounded;
      case 'PPT':
      case 'PPTX':
        return Icons.slideshow_rounded;
      case 'XLS':
      case 'XLSX':
        return Icons.table_chart_rounded;
      case 'TXT':
        return Icons.text_snippet_rounded;
      case 'MP4':
        return Icons.play_circle_fill_rounded;
      case 'ZIP':
        return Icons.archive_rounded;
      default:
        return Icons.insert_drive_file_rounded;
    }
  }
}
