# Quick Start Guide - Doctor Appointment System

## 🚀 Getting Started in 5 Minutes

### Prerequisites Check
- ✅ PHP 8.3+ installed (`php --version`)
- ✅ Composer installed (`composer --version`)
- ✅ MySQL running and accessible
- ✅ Node.js 16+ installed (`node --version`)
- ✅ npm installed (`npm --version`)

---

## Backend Setup (Laravel)

### Step 1: Configure Database
```bash
# Create MySQL database
mysql -u root -p
> CREATE DATABASE doctor_appointment;
> EXIT;
```

### Step 2: Setup Laravel
```bash
cd backend

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Install dependencies
composer install
```

### Step 3: Configure .env File
Edit `backend/.env` and set:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=doctor_appointment
DB_USERNAME=root
DB_PASSWORD=        # Your MySQL password
APP_URL=http://localhost:8000
```

### Step 4: Run Migrations & Seeders
```bash
# Create tables
php artisan migrate:fresh

# Populate sample data
php artisan db:seed
```

### Step 5: Start Backend Server
```bash
php artisan serve
```
✅ Backend running on: **http://localhost:8000**

---

## Frontend Setup (React + Vite)

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Configure API URL
File: `frontend/src/services/api.js` (Already configured)
```javascript
baseURL: 'http://localhost:8000/api'
```

### Step 3: Start Development Server
```bash
npm run dev
```
✅ Frontend running on: **http://localhost:5173**

---

## 🔐 Test Credentials

### Admin Access
```
Email:    admin@doctorappt.com
Password: password
```

### Doctor Accounts (Sample)
```
Email:    dr.sarah@doctorappt.com (General Physician)
Email:    dr.michael@doctorappt.com (Gynecologist)
Email:    dr.emily@doctorappt.com (Dermatologist)
Password: password (for all doctors)
```

### Create New User Account
Visit: http://localhost:5173/register

---

## 📋 Common Tasks

### Reset Database
```bash
cd backend
php artisan migrate:fresh
php artisan db:seed
```

### Clear Laravel Cache
```bash
php artisan cache:clear
php artisan config:clear
```

### View All Database Tables
```bash
mysql -u root doctor_appointment
SHOW TABLES;
```

### Run Frontend Build
```bash
cd frontend
npm run build
```

---

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Change Laravel port
php artisan serve --port=8001

# Change Vite port
npm run dev -- --port 5174
```

### Database Connection Error
1. Check MySQL is running: `mysql -u root -p`
2. Verify `.env` credentials
3. Database exists: `mysql -u root -p -e "SHOW DATABASES;" | grep doctor_appointment`

### CORS Error
- Backend is running on 8000
- Frontend is accessing http://localhost:8000/api
- Check Laravel middleware in `bootstrap/app.php`

### Sanctum Token Error
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

---

## 📚 API Testing with Postman

### 1. Register User
```
POST http://localhost:8000/api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password",
  "password_confirmation": "password"
}
```

### 2. Login
```
POST http://localhost:8000/api/auth/login
{
  "email": "john@example.com",
  "password": "password"
}
```

### 3. Get Doctors
```
GET http://localhost:8000/api/doctors
Headers: Authorization: Bearer {token}
```

### 4. Book Appointment
```
POST http://localhost:8000/api/appointments/book
Headers: Authorization: Bearer {token}
{
  "doctor_id": 1,
  "appointment_date": "2026-02-15 14:00",
  "notes": "Regular checkup"
}
```

---

## 🎯 Key Features to Test

### User Features
1. ✅ Register new account (`/register`)
2. ✅ Browse doctors (`/doctors`)
3. ✅ Filter by specialty
4. ✅ Book appointment (`/appointment/:id`)
5. ✅ View appointments (`/my-appontments`)
6. ✅ Cancel/reschedule appointment
7. ✅ Update profile (`/my-profile`)
8. ✅ User dashboard (`/user-dashboard`)

### Admin Features
1. ✅ View dashboard (`/admin-dashboard`)
2. ✅ Manage users (activate/deactivate)
3. ✅ Manage doctors (add/edit)
4. ✅ View all appointments
5. ✅ Manage specialties

---

## 📁 Project Structure at a Glance

```
doctor-appointment/
├── backend/
│   ├── app/Http/Controllers/Api/
│   ├── app/Models/
│   ├── database/migrations/
│   ├── database/seeders/
│   ├── routes/api.php
│   └── .env (Configure this)
│
└── frontend/
    ├── src/pages/
    ├── src/components/
    ├── src/services/api.js
    ├── src/context/AppContext.jsx
    └── package.json
```

---

## 🔄 Development Workflow

### Terminal 1: Backend
```bash
cd backend
php artisan serve
```

### Terminal 2: Frontend  
```bash
cd frontend
npm run dev
```

### Terminal 3: (Optional) MySQL
```bash
mysql -u root -p doctor_appointment
```

---

## 📱 Application Routes

### Public Routes
- `/` - Home page
- `/doctors` - Doctor listing
- `/doctors/:specialty` - By specialty
- `/about` - About page
- `/contact` - Contact page
- `/login` - User login
- `/register` - User registration

### Protected Routes (Login Required)
- `/my-appontments` - View appointments
- `/my-profile` - User profile
- `/appointment/:id` - Book appointment
- `/user-dashboard` - User dashboard

### Admin Routes (Admin Only)
- `/admin-dashboard` - Admin control panel

---

## 🛠️ Development Tips

### Hot Reload Enabled
- Frontend automatically reloads on file change
- Backend needs manual reload for PHP files

### Database Changes
- Create migration: `php artisan make:migration migration_name`
- Run migration: `php artisan migrate`

### Create New Component
```bash
# Better to create in src/components/ directory
```

### Add New Package
```bash
# Frontend
cd frontend && npm install package_name

# Backend
cd backend && composer require package/name
```

---

## 📞 Support & Help

### Documentation Links
- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

### Check Logs
```bash
# Laravel error log
tail -f backend/storage/logs/laravel.log

# Browser console
Press F12 -> Console tab
```

---

## ✅ Verification Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173
- [ ] Can login with admin@doctorappt.com / password
- [ ] Can browse doctors
- [ ] Can book appointment (as logged-in user)
- [ ] Can access admin dashboard
- [ ] No console errors in browser (F12)
- [ ] No errors in backend terminal

---

**🎉 You're all set! Start building!**

For detailed API documentation, see [PROJECT_README.md](./PROJECT_README.md)
