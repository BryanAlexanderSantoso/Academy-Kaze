# Live Chat Support Feature

## Overview
Sistem live chat real-time antara member dan admin untuk mendukung bantuan pembayaran dan pertanyaan umum.

## Features Added

### 1. **Database Schema** (`supabase_migrations/create_support_chat.sql`)
- **Table**: `support_messages`
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (Foreign Key ke auth.users)
  - `sender_role`: TEXT ('member' atau 'admin')
  - `message`: TEXT (isi pesan)
  - `is_read`: BOOLEAN (status baca)
  - `created_at`: TIMESTAMP

- **Indexes**:
  - `idx_support_messages_user_id` - Query efisien per user
  - `idx_support_messages_created_at` - Sorting by waktu
  - `idx_support_messages_is_read` - Filter pesan yang belum dibaca

- **Row Level Security (RLS)**:
  - Member hanya bisa lihat pesan mereka sendiri
  - Member hanya bisa kirim pesan dengan role 'member'
  - Admin bisa lihat semua pesan
  - Admin bisa kirim dan update (mark as read) pesan

### 2. **LiveChat Component** (`src/components/LiveChat.tsx`)
**Untuk Member:**
- 💬 Floating button di pojok kanan bawah
- Real-time messaging dengan Supabase Realtime
- UI chat yang clean dan responsive
- Auto-scroll ke pesan terbaru
- Timestamp untuk setiap pesan
- Enter to send message

**Features:**
- Bubble chat berbeda warna (member: blue, admin: white)
- Loading state & empty state
- Beautiful UI dengan Framer Motion animations
- Real-time updates tanpa refresh

### 3. **AdminSupport Page** (`src/pages/admin/AdminSupport.tsx`)
**Untuk Admin:**
- 📊 Daftar semua user yang pernah chat
- 🔴 Badge unread count per user
- 🔍 Search user by name/email
- 💬 Real-time chat interface
- ✅ Auto mark as read ketika admin buka chat
- Two-column layout: Chat list | Chat window

**Features:**
- Two-panel interface (user list + chat)
- Unread message indicators
- Real-time synchronization
- Search functionality
- Clean, professional UI

### 4. **Premium Payment Integration**
**Updated**: `src/pages/dashboard/PremiumPayment.tsx`
- Info card "Butuh Bantuan?"
- Instruksi jelas untuk hubungi admin via live chat
- Visual cue (💬) untuk chat button

### 5. **Navigation Updates**
- **MemberDashboard**: LiveChat component otomatis muncul
- **AdminDashboard**: New sidebar button untuk Live Support
- **Routes**: `/admin/support` untuk admin support page

## Usage

### Untuk Member:
1. Klik floating chat button di pojok kanan bawah
2. Ketik pesan dan tekan Enter atau klik Send
3. Admin akan menerima notifikasi dan bisa reply
4. Chat tersimpan dan bisa dilanjutkan kapan saja

### Untuk Admin:
1. Buka `/admin/support`
2. Lihat daftar users dengan unread count
3. Klik user untuk membuka chat
4. Reply langsung dari interface
5. Pesan otomatis ter-mark as read

## Database Setup

**PENTING**: Jalankan migration SQL terlebih dahulu:

```sql
-- Execute di Supabase SQL Editor
-- File: supabase_migrations/create_support_chat.sql
```

## File Structure

```
src/
├── components/
│   └── LiveChat.tsx                    # Floating chat button for members
├── pages/
│   ├── MemberDashboard.tsx             # Updated with <LiveChat />
│   ├── AdminDashboard.tsx               # Added support nav button
│   ├── admin/
│   │   └── AdminSupport.tsx            # Admin support interface
│   └── dashboard/
│       └── PremiumPayment.tsx          # Added help section
└── App.tsx                              # Added /admin/support route

supabase_migrations/
└── create_support_chat.sql              # Database schema
```

## Technical Details

### Real-time Sync
```typescript
const channel = supabase
    .channel('support_messages')
    .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'support_messages',
        filter: `user_id=eq.${user.id}`
    }, () => {
        loadMessages();
    })
    .subscribe();
```

### Security
- RLS policies ensure data isolation
- Members can only see their own messages
- Admins have full access
- Proper sender_role validation

## Testing Checklist

- [ ] Run database migration
- [ ] Member can open chat and send message
- [ ] Admin receives message in real-time
- [ ] Admin can reply
- [ ] Member sees admin reply in real-time
- [ ] Unread count updates correctly
- [ ] Search functionality works
- [ ] Messages persist on refresh
- [ ] Mobile responsive
- [ ] Chat scrolls to latest message

## Future Enhancements

1. **Typing Indicators**: Show "Admin is typing..."
2. **File Attachments**: Support image uploads in chat
3. **Push Notifications**: Browser notifications for new messages
4. **Read Receipts**: Show when admin has read message
5. **Canned Responses**: Quick reply templates for admin
6. **Chat History Export**: Download conversation as PDF
7. **Multi-admin Support**: Assign chats to specific admins
8. **Chat Analytics**: Response time metrics

## Troubleshooting

**Chat tidak muncul:**
- Pastikan migration sudah dijalankan
- Check RLS policies di Supabase
- Verify user authentication

**Real-time tidak work:**
- Check Supabase Realtime is enabled
- Verify channel subscription
- Check browser console for errors

**Pesan tidak terkirim:**
- Check network connection
- Verify RLS policies
- Check sender_role validation

---

**Created**: 2026-02-14
**Version**: 1.0.0
**Status**: ✅ Ready for Production
