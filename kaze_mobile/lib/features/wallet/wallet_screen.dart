import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';

class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context) {
    const Color bgColor = Color(0xFFC7F0D9);
    const Color cardColor = Color(0xFF98E5B6);
    const Color darkColor = Color(0xFF1A1A1A);

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 20),
                    // Header
                    Text(
                      'Hello',
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        color: Colors.black54,
                        fontWeight: FontWeight.w400,
                      ),
                    ).animate().fadeIn(duration: 400.ms).slideX(begin: -0.2),
                    Text(
                      'Nishar',
                      style: GoogleFonts.outfit(
                        fontSize: 48,
                        color: Colors.black,
                        fontWeight: FontWeight.bold,
                        letterSpacing: -1.5,
                        height: 1.1,
                      ),
                    )
                        .animate()
                        .fadeIn(duration: 500.ms, delay: 100.ms)
                        .slideX(begin: -0.1),
                    const SizedBox(height: 32),

                    // Main Wallet Card
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: darkColor,
                        borderRadius: BorderRadius.circular(44),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(32),
                            decoration: BoxDecoration(
                              color: cardColor,
                              borderRadius: BorderRadius.circular(40),
                              border: Border.all(color: Colors.black, width: 2),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(
                                            Icons
                                                .account_balance_wallet_outlined,
                                            size: 24),
                                        const SizedBox(width: 10),
                                        Text(
                                          "Subscription's wallet",
                                          style: GoogleFonts.outfit(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w600,
                                            color:
                                                Colors.black.withOpacity(0.8),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const MastercardLogo(),
                                  ],
                                ),
                                const SizedBox(height: 40),
                                Text(
                                  '\$324.25',
                                  style: GoogleFonts.outfit(
                                    fontSize: 56,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: -2,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'Monthly expenses: \$69',
                                      style: GoogleFonts.outfit(
                                        fontSize: 16,
                                        color: Colors.black.withOpacity(0.5),
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                            color:
                                                Colors.black.withOpacity(0.1)),
                                      ),
                                      child: const Icon(
                                          Icons.visibility_outlined,
                                          size: 20),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(
                                vertical: 24, horizontal: 20),
                            child: Row(
                              children: [
                                Expanded(
                                  child: _buildActionButton(
                                    icon: Icons.add,
                                    label: 'Add funds',
                                    onPressed: () {},
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: _buildActionButton(
                                    icon: Icons.arrow_downward,
                                    label: 'Withdraw',
                                    onPressed: () {},
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ).animate().scale(
                        delay: 200.ms,
                        duration: 400.ms,
                        curve: Curves.easeOutBack),
                    const SizedBox(height: 48),

                    // Transactions Section
                    Text(
                      'Today',
                      style: GoogleFonts.outfit(
                        fontSize: 20,
                        color: Colors.black45,
                        fontWeight: FontWeight.w500,
                      ),
                    ).animate().fadeIn(delay: 400.ms),
                    const SizedBox(height: 20),
                    _buildTransactionItem(
                      icon: Icons.shopping_bag_outlined,
                      title: 'Nike Store',
                      category: 'Clothing',
                      amount: '-\$734.00',
                      tax: 'Tax: \$60.35',
                      iconColor: const Color(0xFFB8E6CB),
                    ).animate().fadeIn(delay: 450.ms).slideY(begin: 0.1),
                    const SizedBox(height: 32),
                    Text(
                      '08 April',
                      style: GoogleFonts.outfit(
                        fontSize: 20,
                        color: Colors.black45,
                        fontWeight: FontWeight.w500,
                      ),
                    ).animate().fadeIn(delay: 500.ms),
                    const SizedBox(height: 20),
                    _buildTransactionItem(
                      icon: Icons.apple,
                      title: 'Apple Store',
                      category: 'Electronics',
                      amount: '-\$25.00',
                      tax: 'Tax: \$4.50',
                      iconColor: const Color(0xFFB8E6CB),
                    ).animate().fadeIn(delay: 550.ms).slideY(begin: 0.1),
                    const SizedBox(height: 20),
                    _buildTransactionItem(
                      icon: Icons.directions_car_outlined,
                      title: 'Uber',
                      category: 'Transport',
                      amount: '-\$4.99',
                      tax: 'Tax: \$0.80',
                      iconColor: const Color(0xFFB8E6CB),
                    ).animate().fadeIn(delay: 600.ms).slideY(begin: 0.1),
                    const SizedBox(height: 20),
                    _buildTransactionItem(
                      icon: Icons.local_gas_station_outlined,
                      title: 'Fuel',
                      category: 'Transport',
                      amount: '-\$10.99',
                      tax: 'Tax: \$1.20',
                      iconColor: const Color(0xFFB8E6CB),
                    ).animate().fadeIn(delay: 650.ms).slideY(begin: 0.1),
                    const SizedBox(height: 120), // Space for bottom bar
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNavBar()
          .animate()
          .slideY(begin: 1, duration: 500.ms, delay: 300.ms),
      extendBody: true,
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onPressed,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 18),
      decoration: BoxDecoration(
        color: const Color(0xFF2E2E2E),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: const BoxDecoration(
              color: Color(0xFFB8E6CB),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 16, color: Colors.black),
          ),
          const SizedBox(width: 10),
          Text(
            label,
            style: GoogleFonts.outfit(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionItem({
    required IconData icon,
    required String title,
    required String category,
    required String amount,
    required String tax,
    required Color iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.4),
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.black.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: iconColor,
              borderRadius: BorderRadius.circular(18),
            ),
            child: Icon(icon, color: Colors.black, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  category,
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    color: Colors.black54,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                amount,
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                tax,
                style: GoogleFonts.outfit(
                  fontSize: 12,
                  color: Colors.black38,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNavBar() {
    return Container(
      margin: const EdgeInsets.fromLTRB(24, 0, 24, 30),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(44),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            decoration: BoxDecoration(
              color: const Color(0xFFB8E6CB),
              borderRadius: BorderRadius.circular(32),
            ),
            child: Row(
              children: [
                const Icon(Icons.explore, color: Colors.black),
                const SizedBox(width: 8),
                Text(
                  'Discover',
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
              ],
            ),
          ),
          const _NavItem(icon: Icons.description_outlined),
          const _NavItem(icon: Icons.bar_chart_outlined),
          const _NavItem(icon: Icons.person_outline),
        ],
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  const _NavItem({required this.icon});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Icon(icon, color: Colors.white, size: 28),
    );
  }
}

class MastercardLogo extends StatelessWidget {
  const MastercardLogo({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 44,
      height: 28,
      child: Stack(
        children: [
          Positioned(
            left: 0,
            child: Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.black.withOpacity(0.1),
                border: Border.all(color: Colors.black, width: 2),
              ),
            ),
          ),
          Positioned(
            right: 0,
            child: Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.black.withOpacity(0.05),
                border: Border.all(color: Colors.black, width: 2),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
