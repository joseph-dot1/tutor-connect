# TutorConnect

> **Connecting Quality Education with Eager Learners in Lagos, Nigeria**

A modern tutoring platform connecting students with qualified tutors. Built with React, TypeScript, Node.js/Express, and Supabase.

## ✨ Features

- 🔍 **Tutor Search** - Browse and filter tutors by subject, location, and rating
- 📅 **Session Booking** - Book tutoring sessions with calendar integration
- 📊 **Dashboards** - Role-specific dashboards for tutors and parents
- 📧 **Email Notifications** - Automated booking confirmations via Resend
- 👤 **User Profiles** - Comprehensive profiles for tutors and parents/children
- ⭐ **Reviews & Ratings** - Rate and review tutoring sessions
- 🎨 **Modern UI** - Beautiful design with glassmorphism effects

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript + Vite
- TailwindCSS for styling
- React Router for navigation
- Lucide React for icons

**Backend:**
- Node.js + Express + TypeScript
- Supabase (PostgreSQL database)
- Resend for email notifications
- Row Level Security (RLS)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Resend API key (for emails)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/ai-capstone-project.git
cd ai-capstone-project
```

2. **Install dependencies:**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

3. **Set up environment variables:**

Create `.env` in project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create `backend/.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=TutorConnect <onboarding@resend.dev>
EMAIL_REPLY_TO=support@yourdomain.com
PORT=3000
```

4. **Set up the database:**

Run these SQL scripts in your Supabase SQL Editor:
- `database/schema.sql` - Creates tables
- `database/fix_parent_rls_v2.sql` - Parent RLS policies
- `database/fix_children_rls.sql` - Children RLS policies  
- `database/fix_sessions_rls.sql` - Sessions RLS policies

### Running Locally

1. **Start backend:**
```bash
cd backend
npm run dev
```

2. **Start frontend** (new terminal):
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
ai-capstone-project/
├── backend/              # Express API
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── lib/         # Utilities (email, etc.)
│   │   └── server.ts
│   └── package.json
├── src/                 # React frontend
│   ├── components/      # UI components
│   ├── contexts/        # React contexts
│   ├── lib/            # API client
│   └── pages/          # Page components
├── database/           # SQL scripts
└── package.json
```

## 🎨 Design Philosophy

- Modern, responsive UI with glassmorphism
- Purple/blue gradient primary colors
- Warm amber accent colors
- Mobile-first approach
- Smooth animations and transitions

## 📄 License

MIT

## 🤝 Contributing

This is a capstone project. Contributions welcome!

## 📧 Contact

For questions, open an issue on GitHub.

