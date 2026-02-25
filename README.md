# Kaze For Developers 🎓

A high-end, modern coding learning platform built with React.js (Vite), Tailwind CSS, and Supabase. Features a clean, professional Apple-esque design with comprehensive admin and member functionalities.

## ✨ Features

### 🎨 Design & UI/UX
- **Theme**: Clean, modern, professional "Apple-esque" aesthetic
- **Colors**: Pure white background with soft gray borders
- **Accents**: Vibrant color coding
  - 💜 Indigo for Frontend path
  - 💚 Emerald for Backend path
  - 🔮 Violet for Fullstack path
- **Layout**: Dashboard-centric with responsive sidebar navigation
- **Animations**: Smooth Framer Motion transitions throughout
- **Icons**: Beautiful Lucide React icons

### 👥 User Roles & Permissions

#### 🛡️ ADMIN
- **Login**: Dedicated admin login with numeric password `159159` (no registration)
- **Dashboard**: Comprehensive overview with student statistics
- **Course Management**: Full CRUD for courses and materials
- **Assignment Grading**: Review student submissions and provide feedback
- **Student Tracking**: Monitor every student's progress in real-time
- **Personalization**: Assign specific materials and schedules to students
- **Questionnaires**: Create and distribute quizzes to students

#### 🧑‍💻 MEMBER (Students)
- **Authentication**: Email/Password signup and login via Supabase Auth
- **Onboarding**: Choose learning path after registration (Frontend, Backend, or Fullstack)
- **Filtered Content**: View courses tailored to chosen learning path
- **Progress Tracking**: Monitor own learning progress and grades
- **Assignments**: Submit work and receive grades/feedback
- **Questionnaires**: Complete quizzes assigned by admin

## 🗄️ Database Schema

### Tables
1. **profiles**
   - `id` (UUID, references auth.users)
   - `email` (TEXT)
   - `full_name` (TEXT)
   - `role` (admin/member)
   - `learning_path` (fe/be/fs)
   - `progress_percentage` (INTEGER)
   - `created_at` (TIMESTAMP)

2. **courses**
   - `id` (UUID)
   - `title` (TEXT)
   - `description` (TEXT)
   - `category` (fe/be/fs)
   - `content_body` (TEXT)
   - `schedule_date` (TIMESTAMP)
   - `thumbnail_url` (TEXT)
   - `duration_hours` (INTEGER)
   - `is_published` (BOOLEAN)
   - `created_at` (TIMESTAMP)

3. **assignments**
   - `id` (UUID)
   - `student_id` (UUID, FK to profiles)
   - `course_id` (UUID, FK to courses)
   - `submission_link` (TEXT)
   - `grade` (INTEGER 0-100)
   - `feedback` (TEXT)
   - `submitted_at` (TIMESTAMP)
   - `created_at` (TIMESTAMP)

4. **questionnaires**
   - `id` (UUID)
   - `title` (TEXT)
   - `questions_json` (JSONB)
   - `responses_json` (JSONB)
   - `due_date` (TIMESTAMP)
   - `created_at` (TIMESTAMP)

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- A Supabase account and project

### 1. Clone & Install

```bash
cd /Users/macbookair/Kaze-Developer
npm install --legacy-peer-deps
```

### 2. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Go to Project Settings → API
3. Copy your Project URL and Anon Key
4. Run the schema SQL:
   - Go to SQL Editor in Supabase dashboard
   - Copy contents from `supabase-schema.sql`
   - Execute the SQL to create all tables and policies

### 3. Environment Variables

Update `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ADMIN_PASSWORD=159159
```

### 4. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 🔐 Login Credentials

### Admin Access
1. Navigate to `/admin`
2. Enter password: `159159`
3. Access admin dashboard

### Member Access
1. Navigate to `/login` or `/signup`
2. Create account with email/password
3. Choose learning path during onboarding
4. Access member dashboard

## 📁 Project Structure

```
kaze-developer/
├── src/
│   ├── services/api/      # Unified API Service Layer (NEW)
│   │   └── ApiDocs.md     # Detailed API Documentation
│   ├── components/         # Reusable UI components
│   ├── contexts/          # React context providers
│   │   └── AuthContext.tsx
│   ├── lib/               # Utilities and configurations
│   │   ├── supabase.ts   # Supabase client & types
│   │   └── auth.ts       # Authentication functions
│   ├── pages/            # Page components
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── AdminLogin.tsx
│   │   ├── Onboarding.tsx
│   │   ├── MemberDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── dashboard/
│   │       └── DashboardOverview.tsx
│   ├── App.tsx           # Main app with routing
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── supabase-schema.sql   # Database schema
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
├── package.json
├── .env                  # Environment variables
└── README.md
```

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3
- **Database & Auth**: Supabase
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Routing**: React Router DOM

## 🎯 Key Features Implementation

### Authentication Flow
- Admin uses password-only login stored in localStorage
- Members use Supabase email/password authentication
- Protected routes based on user role
- Automatic redirect to onboarding for new members

### Learning Path System
- Three distinct paths: Frontend, Backend, Fullstack
- Dynamic color theming based on selected path
- Filtered course content per path category
- Progress tracking per student

### Admin Capabilities
- Real-time student progress monitoring
- Course creation with WYSIWYG content
- Assignment grading system with feedback
- Questionnaire builder with JSON storage
- Student performance analytics

### Member Experience
- Personalized dashboard based on learning path
- Course catalog filtered by category
- Assignment submission and grade viewing
- Progress tracking visualization
- Responsive mobile-friendly design

### API Service Layer
- **Centralized Abstraction**: All database interactions are managed via `api` object
- **Modules**: Auth, Profiles, Courses, Assignments, Payments, Questionnaires, and more
- **Type Safety**: Fully typed using TypeScript and Supabase schema types
- **Documentation**: Detailed guide available in [`src/services/api/ApiDocs.md`](src/services/api/ApiDocs.md)

## 📝 Next Steps & Extensions

To further enhance the platform, consider adding:

1. **Course Content Pages**: Detailed course viewing with rich media
2. **Rich Text Editor**: For course content creation (e.g., TipTap, Quill)
3. **File Upload**: For assignment submissions via Supabase Storage
4. **Notifications**: Real-time updates for new courses/grades
5. **Discussion Forums**: Student collaboration features
6. **Certificate Generation**: Upon course completion
7. **Analytics Dashboard**: Detailed charts and insights
8. **Dark Mode**: Theme switcher option
9. **Search & Filters**: Advanced course discovery
10. **Mobile App**: React Native version

## 🐛 Troubleshooting

### npm install fails
```bash
npm install --legacy-peer-deps
```

### Supabase connection issues
- Verify `.env` file has correct credentials
- Check Supabase project is active
- Ensure RLS policies are correctly set

### TypeScript errors
```bash
npm run build
```
Fix any type errors shown in the output

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👨‍💻 Author

Built with ❤️ for aspiring developers

---

**Ready to start learning? Visit `/signup` to begin your coding journey!** 🚀
