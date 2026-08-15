# 🎓 FullStack Pro LMS — 12-Week Web Development Training Program

A full-stack, enterprise-grade Learning Management System (LMS) designed for a 12-week intensive full-stack web development training program. Built with Next.js App Router, Express, and MongoDB Atlas.

---

## 🚀 Key Features

- **High-Impact Landing Page**: 12-week curriculum roadmap, technology category pills (Vanilla JS, React, Next.js, Node.js, MongoDB, DevOps), bootcamp highlights, and FAQs.
- **Sequential Progression System**:
  - Week 1 is unlocked for all students by default.
  - Week $N+1$ unlocks only after Week $N$ satisfies all 3 milestone criteria:
    1. 100% of video lessons checked off.
    2. Weekly GitHub Project Assignment submitted.
    3. Weekly Knowledge Test passed ($\ge 70\%$).
- **Interactive Cinema Video Player**: Embedded responsive YouTube video lectures for all 12 weeks with real-time lesson checkmarks and progress tracking.
- **Weekly Project Assignments**:
  - Project briefs, requirements checklist, copyable starter code boilerplate, and ZIP file downloads.
  - GitHub repository URL submission form (`https://github.com/username/repository`) with instant API validation.
- **Weekly Knowledge Tests**:
  - 4 questions per week featuring Multiple Choice Questions (MCQs) and Code Snippet Debugging Exercises (`JetBrains Mono`).
  - Instant automated grading, pass/fail status ($\ge 70\%$), and detailed answer review with explanations.
- **Student Dashboard**:
  - Circular progress completion meter, 7-day study streak, student rank progression ("Full-Stack Specialist"), and unlocked week cards.
- **Student Profile & Settings**:
  - Direct file pickers for profile photo avatar and resume PDF uploads.
  - Read-only Email ID protection.
  - Password update form with `bcryptjs` verification.
- **Apple / Notion Design System**: Modern light mode aesthetic with Plus Jakarta Sans typography, soft shadows, and indigo/emerald accents.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router, Client Components)
- **UI Library**: React 18
- **Styling**: Tailwind CSS, Custom Design System (`globals.css`)
- **Icons**: Lucide React
- **Typography**: Plus Jakarta Sans & JetBrains Mono

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas Cloud Database (Mongoose ORM)
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt Password Hashing
- **CORS & Body Parser**: 50MB payload limit for base64 photo and document uploads

---

## 📂 Project Structure

```
LMS/
├── client/                     # Next.js 14 Frontend Application
│   ├── app/
│   │   ├── page.js             # High-Impact Landing Page
│   │   ├── login/              # Student Login Page
│   │   ├── register/           # Student Registration Page
│   │   ├── dashboard/
│   │   │   ├── page.js         # Executive Student Dashboard
│   │   │   ├── profile/        # My Profile & Settings Page
│   │   │   └── modules/[id]/
│   │   │       ├── page.js     # Video Player & Lesson Checklist
│   │   │       ├── assignment/ # Weekly Project Assignment Submission Page
│   │   │       └── test/       # Weekly Test (MCQ & Code Fix) Page
│   │   ├── globals.css         # Design System Tokens & Light Mode Styling
│   │   └── layout.js           # Root Layout with AuthProvider
│   ├── components/
│   │   └── Navbar.js           # Header with Interactive User Dropdown Menu
│   └── lib/
│       ├── api.js              # Fetch API helper with error handling
│       └── authContext.js      # React Auth Context Provider
│
└── server/                     # Express.js Backend REST API
    ├── models/
    │   ├── User.js             # User Mongoose Schema
    │   ├── CourseModule.js     # CourseModule Schema (Lessons, Assignment, Quiz)
    │   ├── Progress.js         # Student Lesson Progress Schema
    │   ├── Submission.js       # GitHub Assignment Submissions Schema
    │   └── QuizResult.js       # Weekly Quiz Scores Schema
    ├── routes/
    │   ├── auth.js             # Register, Login, Me, Profile, Password API
    │   ├── modules.js          # Curriculum Modules API
    │   ├── progress.js         # Lesson Progress API
    │   ├── assignments.js      # GitHub Assignment Submissions API
    │   └── quizzes.js          # Quiz Grading & Evaluation API
    ├── seed.js                 # 12-Week Curriculum Database Seed Script
    └── server.js               # Express Server Entrypoint
```

---

## 🚦 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: 9.0.0 or higher
- **MongoDB Atlas Connection URI**

### 2. Backend Setup
```bash
cd server
npm install

# Create .env file with MongoDB URI and JWT Secret
echo "PORT=5001" > .env
echo "MONGODB_URI=your_mongodb_connection_string" >> .env
echo "JWT_SECRET=your_jwt_secret_key" >> .env

# Seed 12-week curriculum data into MongoDB
npm run seed

# Start Express server
node server.js
```
The Express server will start on `http://localhost:5001`.

### 3. Frontend Setup
```bash
cd client
npm install

# Start Next.js development server
npm run dev
```
The Next.js application will run on `http://localhost:3000`.

---

## 🗺️ 12-Week Curriculum Syllabus

| Week | Module Title | Primary Category |
| :--- | :--- | :--- |
| **Week 1** | Vanilla JS Fundamentals | Vanilla JS |
| **Week 2** | Advanced JavaScript & Async Programming | Vanilla JS |
| **Week 3** | React Fundamentals | React |
| **Week 4** | Advanced React & Architecture | React |
| **Week 5** | Next.js App Router Architecture | Next.js |
| **Week 6** | Next.js Data Fetching & Server Actions | Next.js |
| **Week 7** | Node.js & Express Fundamentals | Node.js |
| **Week 8** | RESTful API Design & Error Handling | Node.js |
| **Week 9** | MongoDB & Mongoose ODM | MongoDB |
| **Week 10** | Authentication & Security | Node.js |
| **Week 11** | Full-Stack Integration | Next.js |
| **Week 12** | DevOps, Deployment & CI/CD | DevOps |

---

## 📝 License

This project is open-source and built for educational full-stack software development training.
