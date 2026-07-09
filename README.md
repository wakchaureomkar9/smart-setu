🏛️ Smart Setu — Digital Governance Portal

Smart Setu is a full-stack web application that digitizes access to government welfare schemes for citizens. It provides a secure document vault, AI-powered document validation, scheme discovery, application management, and an admin dashboard for processing applications — all in one platform.


Built as a portfolio project using the MERN-adjacent stack: React + Node.js/Express + MySQL + Cloudinary + Google Gemini AI.




🚀 Features

Citizen


Secure Registration with OTP-based email verification (5-minute expiry, resend support)
Forgot Password flow via OTP reset code sent to registered email
Document Vault — upload documents once, reuse across multiple scheme applications
AI Document Validation — OCR (Tesseract.js) + Gemini AI checks that uploaded files match the selected document type before saving
Scheme Discovery — browse and apply for government schemes; auto-matches required documents from vault
Application Tracking — real-time status updates (Pending → In Progress → Approved/Rejected)
Result Download — download admin-uploaded result certificates via signed Cloudinary URLs


Admin


Application Management — view all citizen applications, update status, add notes
Result Upload — upload result documents per application, stored securely on Cloudinary
Document Review — view all citizen documents linked to a specific application
User Management — view registered citizens and their application counts
Dashboard Stats — total users, applications by status, active schemes



🛠️ Tech Stack

LayerTechnologyFrontendReact (Vite), Tailwind CSS, React Router, AxiosBackendNode.js, Express.jsDatabaseMySQL (raw queries via mysql2)File StorageCloudinary (authenticated/signed delivery)AI ValidationGoogle Gemini API (gemini-3.1-flash-lite) + Tesseract.js OCRAuthJWT (JSON Web Tokens), bcryptjsEmailNodemailer (OTP verification, notifications)Securityexpress-rate-limit, Cloudinary signed URLs, input validation


🔐 Security Features


OTP-based email verification — users cannot log in until email is confirmed
JWT authentication with hardened random secret
Cloudinary authenticated delivery — documents stored as private assets, accessible only via short-lived signed URLs (5-minute expiry)
Rate limiting on upload endpoints (10 requests per 15 minutes per IP)
AI-powered document type pre-screening — mismatched uploads are rejected and cleaned up before reaching the database
Parameterized SQL queries throughout (no raw string concatenation, prevents SQL injection)
.env excluded from git, secrets never committed to repository history



📁 Project Structure

smart-setu/
├── frontend/                  # React (Vite) frontend
│   └── src/
│       ├── pages/             # Login, Register, Dashboard, DocumentVault,
│       │                      # Applications, AdminDashboard, ForgotPassword, etc.
│       ├── components/        # Layout, ProtectedRoute, shared UI
│       └── context/           # AuthContext (global auth state)
│
└── server/                    # Node.js/Express backend
    ├── controllers/           # authController, documentController, applicationController
    ├── routes/                # authRoutes, documentRoutes, applicationRoutes, schemeRoutes
    ├── middleware/            # authMiddleware, roleMiddleware, uploadMiddleware, rateLimiter
    ├── config/                # db.js, cloudinary.js
    ├── utils/                 # sendEmail.js, getSignedUrl.js, emailTemplates.js
    └── scripts/               # seedAdmin.js


⚙️ Environment Variables

Create a .env file in the server/ directory with the following:

env# Database
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=digital_setu

# JWT
JWT_SECRET=your_random_64_byte_hex_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Nodemailer (email)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Admin seed
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
ADMIN_NAME=Admin Name


⚠️ Never commit your .env file. It is gitignored by default in this project.




🏃 Getting Started

Prerequisites


Node.js v18+
MySQL 8+
A Cloudinary account (free tier)
A Google AI Studio account (free tier, for Gemini API key)
A Gmail account with App Password enabled (for Nodemailer)


Installation

bash# Clone the repository
git clone https://github.com/wakchaureomkar9/smart-setu.git
cd smart-setu

# Install backend dependencies
cd server
npm install

# Seed the admin account (after configuring .env)
node scripts/seedAdmin.js

# Install frontend dependencies
cd ../frontend
npm install

Running Locally

bash# Start backend (from server/)
npm start

# Start frontend (from frontend/)
npm run dev

Frontend runs on http://localhost:5173, backend on http://localhost:5000.


🗄️ Database Schema (Key Tables)

TablePurposeusersCitizen and admin accounts, OTP/verification fieldsdocumentsCitizen uploaded documents with Cloudinary public IDsschemesGovernment schemes with required document typesapplicationsCitizen scheme applications with status trackingapplication_documentsLinks applications to matched documents


📌 Known Limitations / Future Improvements


Signed Cloudinary URLs expire in 5 minutes — a "refresh URL" mechanism could improve UX for long admin sessions
Gemini free tier has limited daily quota (500 RPD for gemini-3.1-flash-lite) — a fallback/retry strategy would improve reliability
No deployment yet — cloud database hosting (Railway/Render) and frontend deployment (Vercel) planned
SMS-based OTP (Twilio) could replace email OTP for faster verification in a production context



👨‍💻 Author

Omkar Wakchaure
MCA Graduate | Full Stack Developer (MERN)
GitHub


📄 License

This project is for educational and portfolio purposes.
