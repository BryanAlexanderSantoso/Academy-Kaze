import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'auth_service.dart';

final authServiceProvider = Provider((ref) => AuthService());

final userProvider = StateNotifierProvider<UserNotifier, User?>((ref) {
  final authService = ref.watch(authServiceProvider);
  return UserNotifier(authService);
});

class UserNotifier extends StateNotifier<User?> {
  final AuthService _authService;

  UserNotifier(this._authService) : super(null) {
    _init();
  }

  void _init() {
    state = _authService.currentUser;
    _authService.authStateChanges.listen((event) {
      state = event.session?.user;
    });
  }

  Future<void> login(String email, String password) async {
    await _authService.signIn(email, password);
  }

  Future<void> register(String email, String password, String fullName) async {
    await _authService.signUp(email, password, fullName);
  }

  Future<void> logout() async {
    await _authService.signOut();
  }
}
