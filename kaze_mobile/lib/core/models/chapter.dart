class Chapter {
  final String id;
  final String courseId;
  final String title;
  final String? contentBody;
  final String? videoUrl;
  final String? fileUrl;
  final String? fileName;
  final String? materialType;
  final int orderIndex;
  final bool isFree;

  Chapter({
    required this.id,
    required this.courseId,
    required this.title,
    this.contentBody,
    this.videoUrl,
    this.fileUrl,
    this.fileName,
    this.materialType,
    required this.orderIndex,
    this.isFree = false,
  });

  factory Chapter.fromJson(Map<String, dynamic> json) {
    return Chapter(
      id: json['id'],
      courseId: json['course_id'],
      title: json['title'],
      contentBody: json['content_body'],
      videoUrl: json['video_url'],
      fileUrl: json['file_url'],
      fileName: json['file_name'],
      materialType: json['material_type'],
      orderIndex: json['order_index'] ?? 0,
      isFree: json['is_free'] ?? false,
    );
  }
}
