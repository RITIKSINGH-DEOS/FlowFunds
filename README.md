# 💸 FlowFunds

A modern AI-powered personal finance tracker built with **Next.js**, **MongoDB**, and **Google OAuth**. Easily manage your income, expenses, budgets, debts, and investments with an intuitive interface and AI-assisted financial insights.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

- 🔐 Secure Google Authentication (NextAuth)
- 💰 Income & Expense Tracking
- 📊 Interactive Dashboard & Analytics
- 🎯 Monthly Budget Management
- 🤝 Debt Tracking
- 📈 Investment Portfolio Tracking
- 🧾 Receipt Image Upload (Cloudinary)
- 🤖 AI-powered Transaction Parsing
- 🎤 Voice & Natural Language Input
- 🌙 Dark Mode Support
- 📱 Responsive UI

---

## 🛠️ Tech Stack

### Frontend
- Next.js 15
- React
- TypeScript
- Tailwind CSS

### Backend
- Next.js API Routes
- MongoDB
- Mongoose

### Authentication
- NextAuth.js
- Google OAuth

### AI
- Groq API
- Google Gemini API

### Cloud Storage
- Cloudinary

---

## 📸 Screenshots

> Add screenshots here after deployment.

| Dashboard | Transactions |
|-----------|--------------|
| Screenshot | Screenshot |

| Budgets | Investments |
|----------|-------------|
| Screenshot | Screenshot |

---

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/RITIKSINGH-DEOS/FlowFunds.git
cd FlowFunds
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env.local` file and add:

```env
MONGODB_URI=
NEXTAUTH_URL=
NEXTAUTH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GROQ_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Run Development Server

```bash
npm run dev
```

Visit:

```
http://localhost:3000
```

---

## 📂 Project Structure

```
src/
│
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── login/
│   ├── privacy/
│   └── terms/
│
├── components/
├── hooks/
├── lib/
├── models/
├── services/
└── styles/
```

---

## 🔒 Security

- Google OAuth Authentication
- Protected API Routes
- MongoDB Secure Storage
- Environment Variable Protection
- Cloudinary Secure Uploads

---

## 🤖 AI Features

FlowFunds integrates AI to provide:

- Natural language transaction parsing
- Voice expense input
- Financial insights
- Smart categorization

Powered by:

- Google Gemini
- Groq

---

## 📈 Future Improvements

- Expense Forecasting
- CSV Import & Export
- Multi-Currency Support
- Financial Reports
- Notifications
- Recurring Transactions
- Mobile App

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

**Ritik Singh**

GitHub:
https://github.com/RITIKSINGH-DEOS

LinkedIn:
https://www.linkedin.com/in/ritiksingh/

---

⭐ If you found this project helpful, consider giving it a star!