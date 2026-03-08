import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  final _client = Supabase.instance.client;

  // Sign Up
  Future<AuthResponse> signUp(
      String email, String password, String fullName) async {
    final response = await _client.auth.signUp(
      email: email,
      password: password,
      data: {'full_name': fullName},
    );

    // Create profile entry via RPC or direct insert if RLS allows
    // Usually handled by Supabase Trigger, but we make sure here
    return response;
  }

  // Sign In
  Future<AuthResponse> signIn(String email, String password) async {
    return await _client.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  // Google Sign In
  Future<bool> signInWithGoogle() async {
    return await _client.auth.signInWithOAuth(
      OAuthProvider.google,
      redirectTo: 'io.supabase.kazedev://login-callback/',
    );
  }

  // Facebook Sign In
  Future<bool> signInWithFacebook() async {
    return await _client.auth.signInWithOAuth(
      OAuthProvider.facebook,
      redirectTo: 'io.supabase.kazedev://login-callback/',
    );
  }

  // Sign Out
  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  // Get User Data
  User? get currentUser => _client.auth.currentUser;

  // Stream of Auth State
  Stream<AuthState> get authStateChanges => _client.auth.onAuthStateChange;
}
