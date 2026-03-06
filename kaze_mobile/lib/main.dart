import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/app_theme.dart';
import 'core/supabase_service.dart';
import 'core/user_provider.dart';
import 'features/dashboard/home_screen.dart';
import 'features/auth/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Immersive UI
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );

  // Initialize Supabase
  await SupabaseConfig.initialize();

  runApp(
    const ProviderScope(
      child: KazeApp(),
    ),
  );
}

class KazeApp extends ConsumerWidget {
  const KazeApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);

    return MaterialApp(
      title: 'Kaze Developer',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      // If user is logged in, show HomeScreen, else show LoginScreen
      home: user != null ? const HomeScreen() : const LoginScreen(),
    );
  }
}
