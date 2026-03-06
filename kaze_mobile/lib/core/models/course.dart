class Course {
  final String id;
  final String title;
  final String description;
  final String category;
  final String? thumbnailUrl;
  final String authorName;

  Course({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    this.thumbnailUrl,
    required this.authorName,
  });

  factory Course.fromJson(Map<String, dynamic> json) {
    return Course(
      id: json['id'],
      title: json['title'],
      description: json['description'] ?? '',
      category: json['category'] ?? 'fe',
      thumbnailUrl: json['thumbnail_url'],
      authorName: json['author_name'] ?? 'KazeTeam',
    );
  }
}
