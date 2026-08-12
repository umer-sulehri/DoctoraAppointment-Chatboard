# System Architecture & Design

## Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT (BROWSER)                       │
│                    React 18 + Vite Frontend                     │
│                     http://localhost:5173                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    REACT COMPONENTS                      │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ Pages: Home, Doctors, Login, Register, etc.     │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ Components: Navbar, Footer, TopDoctors, etc.   │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ Context API (Global State Management)           │   │  │
│  │  │ - User Authentication                            │   │  │
│  │  │ - Doctors & Appointments                         │   │  │
│  │  │ - Loading/Error States                          │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓↑ (HTTP/REST)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           API Service Layer (Axios)                     │  │
│  │  src/services/api.js                                    │  │
│  │  - Centralized API calls                               │  │
│  │  - Request/Response interceptors                       │  │
│  │  - Token management (localStorage)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↓↑ HTTP/REST
        ┌───────────────────────────────────────────────┐
        │                                               │
┌───────────────────────────────────────────────────────────────┐
│                   WEB SERVER (localhost:8000)                 │
│                   Laravel 11 REST API                         │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │             API ROUTES (routes/api.php)               │ │
│  │  /auth/* - Authentication endpoints                 │ │
│  │  /doctors/* - Doctor listing & details               │ │
│  │  /appointments/* - Booking & management              │ │
│  │  /specialties/* - Specialty management               │ │
│  │  /admin/* - Admin operations                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            ↓↑                                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │         API CONTROLLERS (app/Http/Controllers)        │ │
│  │  AuthController      - Login, Register, Logout       │ │
│  │  DoctorController    - List, Search, Details         │ │
│  │  AppointmentController - Book, Cancel, Reschedule    │ │
│  │  AdminController     - Dashboard, User Mgmt          │ │
│  │  UserController      - Profile Management            │ │
│  │  SpecialtyController - Specialty CRUD                │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            ↓↑                                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │          ELOQUENT MODELS (app/Models)                │ │
│  │  User         - System users (patient/doctor/admin) │ │
│  │  Doctor       - Doctor profiles                     │ │
│  │  Appointment  - Booking records                     │ │
│  │  Specialty    - Doctor specialties                  │ │
│  │  AdminSetting - System configuration               │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            ↓↑                                 │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │        AUTHENTICATION (Laravel Sanctum)              │ │
│  │  Token-based API authentication                      │ │
│  │  Personal access tokens                              │ │
│  │  Stateless (JWT-like)                                │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            ↓↑                                 │
└───────────────────────────────────────────────────────────────┘
                            ↓↑
        ┌───────────────────────────────────────────────┐
        │         DATABASE LAYER (MySQL)                │
        │   doctor_appointment (Database)               │
        │                                               │
        │  Tables:                                      │
        │  - users (Patients, Doctors, Admins)         │
        │  - doctors (Doctor profiles)                 │
        │  - appointments (Bookings)                   │
        │  - specialties (Doctor specialties)          │
        │  - admin_settings (Configuration)            │
        │  - personal_access_tokens (Auth)             │
        │                                               │
        └───────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### User Registration & Login Flow
```
┌─────────────────────────────────────────────────────────────┐
│ User fills registration form on /register page              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  POST /api/auth/register                                    │
│  - Frontend validates input                                │
│  - Sends to backend with encrypted password               │
│                                                             │
│                          ↓                                   │
│  Backend receives request                                   │
│  - AuthController.register()                               │
│  - Validates email uniqueness                              │
│  - Hashes password (bcrypt)                                │
│  - Creates User record in database                         │
│  - Generates API token (Sanctum)                           │
│                                                             │
│                          ↓                                   │
│  Returns response with token                               │
│  - User data                                               │
│  - API token (stored in localStorage)                      │
│                                                             │
│                          ↓                                   │
│  Frontend stores token & user info                         │
│  - localStorage.authToken                                  │
│  - localStorage.user                                       │
│  - Updates AppContext                                      │
│                                                             │
│                          ↓                                   │
│  User redirected to dashboard                             │
│  - All subsequent requests include token in header        │
│  - Authorization: Bearer {token}                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Appointment Booking Flow
```
┌──────────────────────────────────────────────────────────┐
│ User clicks on doctor card → /appointment/:doctorId      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend loads doctor details                          │
│  GET /api/doctors/{id}                                  │
│  Response: Doctor info + specialty + consultation fee   │
│                                                          │
│                       ↓                                  │
│  Generate available dates (7 days)                      │
│  Generate time slots from API:                          │
│  GET /api/doctors/{id}/available-slots?date=YYYY-MM-DD │
│  Response: Array of available time slots for that date  │
│                                                          │
│                       ↓                                  │
│  User fills form:                                       │
│  - Select date & time                                  │
│  - Add optional notes                                  │
│  - Click "Confirm Booking"                             │
│                                                          │
│                       ↓                                  │
│  Frontend validates selection                          │
│  POST /api/appointments/book                           │
│  {                                                      │
│    doctor_id: 1,                                       │
│    appointment_date: "2026-02-15 14:30",              │
│    notes: "Follow-up visit"                           │
│  }                                                      │
│  Headers: Authorization: Bearer {token}                │
│                                                          │
│                       ↓                                  │
│  Backend AppointmentController.book()                 │
│  - Check doctor exists                                 │
│  - Verify slot not already booked                      │
│  - Create Appointment record                           │
│  - Return created appointment                          │
│                                                          │
│                       ↓                                  │
│  Frontend receives confirmation                         │
│  - Show success toast                                  │
│  - Redirect to /my-appontments                         │
│  - Fetch updated appointments list                     │
│                                                          │
│                       ↓                                  │
│  User can now see appointment in dashboard             │
│  - View appointment details                            │
│  - Cancel or reschedule if pending                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Database Schema Relationships

```
┌─────────────────────────┐
│        USERS            │
├─────────────────────────┤
│ id (PK)                 │
│ name                    │
│ email (UNIQUE)          │
│ password (hashed)       │
│ phone                   │
│ address                 │
│ gender                  │
│ dob                     │
│ role (user/doctor/admin)│
│ is_active               │
│ bio                     │
│ profile_image           │
│ timestamps              │
└──────────┬──────────────┘
           │ 1:1
           ├────────────────────────┐
           │                        │
    ┌──────▼────────────┐   ┌───────▼──────────┐
    │    DOCTORS        │   │  (other users)   │
    ├───────────────────┤   └──────────────────┘
    │ id (PK)           │
    │ user_id (FK)    ◄─┘
    │ specialty_id (FK)─┐
    │ license_number    │   ┌─────────────────┐
    │ experience        │   │   SPECIALTIES   │
    │ consultation_fee  │   ├─────────────────┤
    │ years_of_exp      │   │ id (PK)         │
    │ is_available      │   │ name (UNIQUE)   │
    │ qualifications    │   │ description     │
    │ appointment_       │   │ icon            │
    │   duration        │   │ is_active       │
    │ timestamps        │   │ timestamps      │
    └───────┬───────────┘   └────────┬────────┘
            │ 1:Many                 │ 1:Many
            │                        │
            │           ┌────────────┘
            │           │
    ┌───────▼──────────────────┐
    │    APPOINTMENTS          │
    ├──────────────────────────┤
    │ id (PK)                  │
    │ user_id (FK)    ─────────┐ (Patient)
    │ doctor_id (FK)   ────────┐ (Doctor)
    │ appointment_date          │
    │ status                    │
    │ notes                     │
    │ prescription              │
    │ slot_duration             │
    │ is_paid                   │
    │ payment_method            │
    │ payment_status            │
    │ amount                    │
    │ cancellation_reason       │
    │ timestamps                │
    └──────────────────────────┘
           │
           └──────────────────────────────────────┐
                                                  │
                        ┌─────────────────────────┘
                        │
            ┌───────────▼────────────┐
            │  ADMIN_SETTINGS        │
            ├────────────────────────┤
            │ id (PK)                │
            │ key (UNIQUE)           │
            │ value                  │
            │ type                   │
            │ description            │
            │ timestamps             │
            └────────────────────────┘
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────┐
│          CLIENT                                      │
│  (Stores token in localStorage)                    │
└────────────────┬──────────────────────────────────┘
                 │
                 │ 1. POST /auth/login
                 │ {email, password}
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│          BACKEND                                     │
│  AuthController::login()                           │
│  - Find user by email                              │
│  - Hash.check(password, user.password)             │
│  - Create personal access token (Sanctum)          │
└────────────────┬──────────────────────────────────┘
                 │
                 │ 2. Response with token
                 │ {token, user}
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│          CLIENT                                      │
│  localStorage['authToken'] = token                 │
└────────────────┬──────────────────────────────────┘
                 │
                 │ 3. Protected Request
                 │ GET /api/users/profile
                 │ Headers: {
                 │   Authorization: 'Bearer {token}'
                 │ }
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│          BACKEND                                     │
│  Middleware: auth:sanctum                          │
│  - Verify token in personal_access_tokens table    │
│  - Attach User to request                          │
│  - If invalid → 401 Unauthorized                   │
└────────────────┬──────────────────────────────────┘
                 │
                 │ 4. Success Response
                 │ {user profile data}
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│          CLIENT                                      │
│  Update AppContext with new data                   │
│  Display user information                          │
└─────────────────────────────────────────────────────┘
```

---

## Admin Dashboard Features

```
┌──────────────────────────────────────────────────┐
│         ADMIN DASHBOARD                          │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────────┐│
│  │ Dashboard Tab                              ││
│  │ - Total Users              [Count]         ││
│  │ - Total Doctors            [Count]         ││
│  │ - Total Appointments       [Count]         ││
│  │ - Pending Appointments     [Count]         ││
│  │ - Completed Appointments   [Count]         ││
│  │ - Total Revenue            [Amount]        ││
│  └────────────────────────────────────────────┘│
│                                                  │
│  ┌────────────────────────────────────────────┐│
│  │ Users Tab                                  ││
│  │ - List all users                           ││
│  │ - Search & filter                          ││
│  │ - Activate/Deactivate users               ││
│  │ - View user details                        ││
│  └────────────────────────────────────────────┘│
│                                                  │
│  ┌────────────────────────────────────────────┐│
│  │ Doctors Tab                                ││
│  │ - List all doctors                         ││
│  │ - Add new doctor (Form)                    ││
│  │ - Edit doctor details                      ││
│  │ - Manage availability                      ││
│  │ - View doctor appointments                 ││
│  └────────────────────────────────────────────┘│
│                                                  │
│  ┌────────────────────────────────────────────┐│
│  │ Appointments Tab                           ││
│  │ - View all appointments                    ││
│  │ - Filter by status                         ││
│  │ - Update appointment status                ││
│  │ - Add prescription notes                   ││
│  │ - Manage payment status                    ││
│  └────────────────────────────────────────────┘│
│                                                  │
│  ┌────────────────────────────────────────────┐│
│  │ Specialties Tab                            ││
│  │ - Add new specialty                        ││
│  │ - Edit specialty details                   ││
│  │ - Toggle active/inactive                   ││
│  └────────────────────────────────────────────┘│
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## File Structure Overview

```
BACKEND (Laravel 11)
backend/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/
│   │           ├── AuthController.php       [Login/Register]
│   │           ├── UserController.php       [Profile Mgmt]
│   │           ├── DoctorController.php     [Doctor Listing]
│   │           ├── AppointmentController.php [Booking Mgmt]
│   │           ├── SpecialtyController.php  [Specialties]
│   │           └── AdminController.php      [Admin Panel]
│   ├── Models/
│   │   ├── User.php
│   │   ├── Doctor.php
│   │   ├── Appointment.php
│   │   ├── Specialty.php
│   │   └── AdminSetting.php
│   └── Providers/
│       └── AppServiceProvider.php
├── database/
│   ├── migrations/          [Database schema]
│   └── seeders/             [Sample data]
├── routes/
│   └── api.php              [All API endpoints]
├── config/
│   └── sanctum.php          [Token auth config]
├── .env                     [Environment config] ⚙️
└── composer.json            [PHP dependencies]

FRONTEND (React 18 + Vite)
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       [Top navigation]
│   │   ├── Footer.jsx       [Footer]
│   │   ├── Header.jsx
│   │   ├── SpecialityMenu.jsx
│   │   ├── TopDoctors.jsx
│   │   ├── Banner.jsx
│   │   └── RelatedDoctors.jsx
│   ├── pages/
│   │   ├── Home.jsx         [Landing page]
│   │   ├── Doctors.jsx      [Doctor listing]
│   │   ├── Appointment.jsx  [Booking page]
│   │   ├── Login.jsx        [Authentication]
│   │   ├── Register.jsx     [Registration]
│   │   ├── MyAppointments.jsx [User appts]
│   │   ├── MyProfile.jsx    [User profile]
│   │   ├── UserDashboard.jsx [User dashboard]
│   │   ├── AdminDashboard.jsx [Admin control]
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   └── context/
│   │   └── AppContext.jsx   [Global state]
│   ├── services/
│   │   └── api.js           [API calls] 🔌
│   ├── assets/              [Images & icons]
│   ├── App.jsx              [Routes]
│   ├── main.jsx             [Entry point]
│   └── index.css            [Styles]
├── public/                  [Static files]
├── package.json             [Dependencies]
├── vite.config.js
├── tailwind.config.js
└── index.html

DOCUMENTATION
├── PROJECT_README.md        [Full documentation]
├── QUICK_START.md           [Setup guide]
└── ARCHITECTURE.md          [This file]
```

---

## Security Considerations

```
┌─────────────────────────────────────────────────────┐
│           SECURITY LAYERS                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 1. FRONTEND VALIDATION                             │
│    - Input validation (email, password length)     │
│    - Type checking                                 │
│    - XSS prevention (React escapes by default)    │
│                                                     │
│ 2. AUTHENTICATION                                  │
│    - Token-based (Laravel Sanctum)                │
│    - No credentials in URLs                        │
│    - Tokens stored in localStorage                 │
│    - Stateless authentication                      │
│                                                     │
│ 3. BACKEND VALIDATION                              │
│    - Laravel validation rules                      │
│    - Database constraint enforcement               │
│    - Type casting in models                        │
│                                                     │
│ 4. AUTHORIZATION                                   │
│    - Role-based access control (RBAC)             │
│    - user, doctor, admin roles                     │
│    - Protected routes (auth:sanctum)              │
│                                                     │
│ 5. DATA PROTECTION                                 │
│    - Password hashing (bcrypt)                     │
│    - Token expiration (configurable)              │
│    - HTTPS recommended for production              │
│                                                     │
│ 6. CSRF PROTECTION                                 │
│    - Sanctum handles stateless API CSRF            │
│    - Token validation in requests                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Performance Optimization

```
Frontend Optimizations:
├── Code splitting (Vite automatic)
├── Lazy loading with React.lazy()
├── Image optimization
├── CSS minification
└── Build output: npm run build

Backend Optimizations:
├── Database indexing on foreign keys
├── Query optimization with eager loading
├── API response pagination
├── Caching (configurable in .env)
├── Route caching: php artisan route:cache
└── Compiled classes: php artisan optimize
```

---

## Deployment Checklist

```
Before Production:
├── [ ] Set APP_ENV=production in .env
├── [ ] Set APP_DEBUG=false in .env
├── [ ] Run php artisan config:cache
├── [ ] Run php artisan route:cache
├── [ ] Frontend: npm run build
├── [ ] Setup PostgreSQL (optional, more robust)
├── [ ] Configure proper database backup
├── [ ] Setup Email notifications
├── [ ] Enable HTTPS
├── [ ] Setup rate limiting
├── [ ] Configure CORS properly
└── [ ] Monitor logs and performance
```

---

This architecture provides a scalable, maintainable, and secure foundation for the doctor appointment system.
