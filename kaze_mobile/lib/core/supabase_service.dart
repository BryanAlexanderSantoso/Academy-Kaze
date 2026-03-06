import 'package:supabase_flutter/supabase_flutter.dart';
import 'models/course.dart';
import 'models/chapter.dart';

class SupabaseConfig {
  static const String url = 'https://yomunkvvidnwousinhgv.supabase.co';
  static const String anonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbXVua3Z2aWRud291c2luaGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDI5NzIsImV4cCI6MjA4NTUxODk3Mn0.8G2ChmdBTkG9i6WFTf1eLtc_QpdzbUizOj2471TnN1M';

  static Future<void> initialize() async {
    await Supabase.initialize(
      url: url,
      anonKey: anonKey,
    );
  }
}

class SupabaseService {
  final client = Supabase.instance.client;

  // Real data fetching for courses
  Future<List<Course>> getCourses() async {
    try {
      final response = await client
          .from('courses')
          .select('*')
          .eq('is_published', true)
          .order('created_at', ascending: false);

      return (response as List).map((json) => Course.fromJson(json)).toList();
    } catch (e) {
      print('Supabase Error: $e');
      return [];
    }
  }

  // Fetch Chapters for a course
  Future<List<Chapter>> getChapters(String courseId) async {
    try {
      final response = await client
          .from('course_chapters')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', ascending: true);

      return (response as List).map((json) => Chapter.fromJson(json)).toList();
    } catch (e) {
      print('Supabase Error: $e');
      return [];
    }
  }

  // Get User Profile Data
  Future<Map<String, dynamic>?> getProfile(String userId) async {
    try {
      final response =
          await client.from('profiles').select().eq('id', userId).maybeSingle();
      return response;
    } catch (e) {
      print('Error fetching profile: $e');
      return null;
    }
  }

  // Check if User is Premium
  Future<bool> isPremium(String userId) async {
    final profile = await getProfile(userId);
    if (profile == null) return false;

    final isPremiumField = profile['is_premium'] ?? false;
    final premiumUntil = profile['premium_until'];

    if (isPremiumField && premiumUntil != null) {
      final expiry = DateTime.parse(premiumUntil);
      return expiry.isAfter(DateTime.now());
    }

    return false;
  }
}
