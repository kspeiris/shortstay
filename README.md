# 🏠 ShortStay - Modern Short-Term Accommodation Marketplace

[![ShortStay](https://img.shields.io/badge/ShortStay-Premium-blue?style=for-the-badge&logo=react)](https://github.com/kavindup20010305/shortstay)

**ShortStay** is a sophisticated, full-stack web application designed to streamline the short-term accommodation experience. Built with a focus on security, premium UI/UX, and robust role-based access control, it provides a seamless marketplace for both hosts and guests.

![Hero image](hero.png)
---

## ✨ Key Features

| 🛡️ Security First | 💎 Premium Design | 📊 Powerful Admin |
| :--- | :--- | :--- |
| **Role Escalation Protection**: Core registration restricted for safety. | **Glassmorphism UI**: Modern, sleek interface with blur effects. | **Real-time Analytics**: Monthly revenue & booking stats. |
| **Secure Bookings**: Backend price verification & capacity checks. | **Dynamic Dark Mode**: Seamlessly transition between themes. | **Property Moderation**: Dedicated workflow for listing audits. |
| **JWT Authentication**: Industry-standard secure session management. | **Micro-animations**: Smooth transitions and hover effects. | **User Management**: Full control over roles and verification. |

---

## 👥 User Roles & Workflows

- **👤 Guest**: Explore properties, view maps, read reviews, and book stays with ease.
- **🏠 Host**: List properties, manage bookings, track earnings, and respond to guest inquiries.
- **🛠️ Admin**: Oversee the entire ecosystem, approve/reject property listings, and manage user roles.
- **💳 Payment Manager**: Specialized role for overseeing financial transactions and revenue via a dedicated dashboard.
- **🔍 Field Inspector**: Verifies property authenticity through inspections and manages the "Verified" badge for listings.

---

## 🛠️ Technology Stack

### **Frontend**
- ![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB) **React.js v18.2**
- ![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white) **Tailwind CSS v3.4**
- ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat&logo=react-router&logoColor=white) **React Router v6.14**
- ![Chart.js](https://img.shields.io/badge/chart.js-F5788D.svg?style=flat&logo=chart.js&logoColor=white) **Chart.js v4.3**

### **Backend**
- ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white) **Node.js v16+** with **Express.js v4.18**
- ![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=flat&logo=mysql&logoColor=white) **MySQL 8.x** with **Sequelize ORM v6.32**
- ![JSON Web Tokens](https://img.shields.io/badge/JWT-black?style=flat&logo=JSON%20web%20tokens) **JWT Auth** (Secure sessions)
- ![Multer](https://img.shields.io/badge/Multer-orange?style=flat) **Multer** (File handling)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16.x or higher)
- MySQL Server 8.x

### Installation

1. **Clone the Project**
   ```bash
   git clone https://github.com/kavindup20010305/shortstay.git
   cd shortstay
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Configure your .env file with your local MySQL credentials
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

---

## 🛡️ Recent Security & Functional Audit
The project recently underwent a comprehensive audit, resulting in:
- **✅ Role Injection Fix**: Eliminated vulnerabilities allowing users to self-assign admin roles.
- **✅ Price Integrity**: Secured the booking flow from client-side price manipulation.
- **✅ Property Moderation**: Enforced re-moderation for sensitive property updates by hosts.
- **✅ Data Integrity**: Implemented database-level cascade rules for clean deletions.
- **✅ Standardized Mappings**: Fixed all "Unknown" data display issues across dashboards.

---

<p align="center">Made with ❤️ for a better travel experience</p>
