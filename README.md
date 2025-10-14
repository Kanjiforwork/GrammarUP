# 🐬 GrammarUP

> An interactive English grammar learning platform with AI-powered tutoring, gamified exercises, and beautiful ocean-themed UI.

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8)
![Prisma](https://img.shields.io/badge/Prisma-6.16.3-2D3748)
![Supabase](https://img.shields.io/badge/Supabase-Auth-00c48d)

## ✨ Features

### 📚 Interactive Learning
- **Lessons**: Step-by-step grammar lessons with interactive blocks
  - Introduction blocks with explanations
  - Text area exercises for practice
  - Quiz blocks for assessment
- **Exercises**: Multiple question types for comprehensive practice
  - **Multiple Choice (MCQ)**: Select the correct answer
  - **Fill-in-the-Blank (CLOZE)**: Complete sentences with missing words
  - **Word Order (ORDER)**: Rearrange words to form correct sentences
  - **Translation (TRANSLATE)**: Translate sentences between languages

### 🤖 AI-Powered Features
- **AI Tutor**: Real-time assistance powered by OpenAI GPT-4
  - Contextual explanations
  - Grammar tips and corrections
  - Natural conversation flow
- **AI Feedback**: Instant feedback on translation exercises
  - Detailed error analysis
  - Improvement suggestions
  - Alternative translations

### 🎨 Beautiful UI/UX
  - Customizable in settings (can toggle on/off)
  - Smooth CSS animations
  - Responsive design
- **Gamification**: 
  - Progress tracking with visual progress bars
  - Completion modals with confetti animations
  - Streak tracking and statistics
  - Achievement system

### 🔐 Authentication & User Management
- **Supabase Auth**: Secure authentication with Google OAuth
- **User Profiles**: Track learning progress and statistics
- **Protected Routes**: Secure access to learning content

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4.1** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### Backend
- **Prisma 6.16.3** - ORM for database management
- **Supabase** - PostgreSQL database and authentication
- **OpenAI API** - AI tutoring and feedback

### Animation & Effects
- **Canvas Confetti** - Celebration animations

## 📁 Project Structure

```
grammar-up/
├── app/
│   ├── (fullscreen)/          # Fullscreen layouts (exercises, lessons)
│   │   ├── exercise/
│   │   │   └── 1/page.tsx    # Exercise detail page
│   │   └── lesson/
│   │       └── [id]/page.tsx # Lesson detail page
│   │
│   ├── (with-sidebar)/        # Pages with sidebar navigation
│   │   ├── exercise/page.tsx # Exercise list
│   │   ├── lessons/page.tsx  # Lesson list
│   │   ├── settings/page.tsx # User settings
│   │   └── account/page.tsx  # User account
│   │
│   └── api/                   # API routes
│       ├── ai-tutor/         # AI tutor endpoints
│       ├── exercises/        # Exercise CRUD
│       ├── lessons/          # Lesson CRUD
│       └── auth/             # Authentication
│
├── components/
│   ├── MultipleChoice.tsx    # MCQ component
│   ├── ClozeQuestion.tsx     # Fill-in-blank component
│   ├── OrderQuestion.tsx     # Word order component
│   ├── TranslateQuestion.tsx # Translation component
│   ├── app-sidebar.tsx       # Sidebar navigation
│   └── ui/                   # Reusable UI components
│
├── lib/
│   ├── prisma.ts             # Prisma client
│   ├── supabase/             # Supabase clients
│   └── data/                 # Static data (questions, exercises)
│
└── prisma/
    ├── schema.prisma         # Database schema
    ├── seed.ts               # Database seeding
    └── migrations/           # Database migrations
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ 
- npm or yarn
- PostgreSQL database (via Supabase)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/grammar-up.git
   cd grammar-up
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

   # OpenAI
   OPENAI_API_KEY="sk-..."
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # Seed the database with sample data
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Main Tables

**User**
- `id`, `email`, `name`, `created_at`, `updated_at`

**Lesson**
- `id`, `title`, `description`, `level`, `topic`, `blocks` (JSON)
- Blocks can be: `intro`, `textarea`, `quiz`

**Exercise**
- `id`, `title`, `description`, `difficulty`, `topic`, `questions` (JSON)

**UserProgress**
- Tracks completion status for lessons and exercises
- `user_id`, `lesson_id`, `exercise_id`, `completed`, `score`

**AttemptHistory**
- Detailed attempt records with timestamps and scores
- `user_id`, `exercise_id`, `score`, `total_questions`, `time_spent`

## 🎮 Question Types

### 1. Multiple Choice (MCQ)
```json
{
  "id": "mcq-1",
  "type": "MCQ",
  "prompt": "Choose the correct verb form:",
  "choices": ["go", "goes", "went"],
  "answerIndex": 1
}
```

### 2. Fill-in-the-Blank (CLOZE)
```json
{
  "id": "cloze-1",
  "type": "CLOZE",
  "prompt": "Complete the sentence:",
  "template": "I {{1}} to school every day.",
  "answers": ["go"]
}
```

### 3. Word Order (ORDER)
```json
{
  "id": "order-1",
  "type": "ORDER",
  "prompt": "Arrange the words in the correct order:",
  "tokens": ["I", "am", "a", "student"]
}
```

### 4. Translation (TRANSLATE)
```json
{
  "id": "translate-1",
  "type": "TRANSLATE",
  "prompt": "Translate to English:",
  "sentence": "Tôi đang học tiếng Anh.",
  "correctAnswer": "I am learning English."
}
```

## 🎨 Customization


The setting is saved to:
- **localStorage** for quick access
- **Supabase** (optional) for cross-device sync

### Theme Colors

Main color palette:
- **Primary**: Teal (`#14b8a6`)
- **Ocean Deep**: Navy Blue (`#1e3a8a`)
- **Ocean Light**: Sky Blue (`#60a5fa`)
- **Success**: Green (`#10b981`)
- **Danger**: Red (`#ef4444`)

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack

# Build & Deploy
npm run build           # Build for production
npm start               # Start production server

# Database
npm run db:seed         # Seed database with all data
npm run db:reset        # Reset and reseed database

# Linting
npm run lint            # Run ESLint
```

## 🧪 Testing

Test individual lessons:
```bash
node test-lesson.js
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Authors

- **Bao** - Initial work

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [OpenAI](https://openai.com/) - AI capabilities
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [Lucide](https://lucide.dev/) - Beautiful icons

## 🐛 Known Issues

- AI tutor responses require active internet connection

## 🗺️ Roadmap

- [ ] Add more grammar topics (Present Perfect, Past Perfect, etc.)
- [ ] Mobile app version (React Native)
- [ ] Multiplayer challenges
- [ ] Voice recognition for pronunciation practice
- [ ] Offline mode
- [ ] Achievement badges and leaderboards
- [ ] Social features (study groups, forums)

## 📞 Support

For support, email support@grammarup.com or open an issue on GitHub.

---

Made with ❤️ and 🐬 by the GrammarUP Team
