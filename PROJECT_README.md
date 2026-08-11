# Doctor Appointment Booking System

A complete full-stack web application for booking doctor appointments with separate dashboards for patients, doctors, and administrators.

## Project Structure

```
doctor-appointment/
├── backend/          # Laravel REST API
└── frontend/         # React SPA with Vite
```

## Features

### For Users (Patients)
- ✅ User registration and login
- ✅ View all doctors with filters by specialty
- ✅ Book appointments with available time slots
- ✅ View appointment history
- ✅ Cancel/reschedule appointments
- ✅ User dashboard with appointment management
- ✅ Profile management

### For Doctors
- ✅ Doctor profile with specialty and experience
- ✅ View booked appointments
- ✅ Update appointment status
- ✅ View patient information

### For Administrators
- ✅ Complete dashboard with statistics
- ✅ User management (activate/deactivate)
- ✅ Doctor management (create/update)
- ✅ Appointment management
- ✅ Specialty management
- ✅ System settings

## Backend Setup (Laravel)

### Prerequisites
- PHP 8.3+
- Composer
- MySQL 5.7+

### Installation

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
composer install
```

3. **Configure environment**
```bash
cp .env.example .env
php artisan key:generate
```

4. **Set up database in `.env`**
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=doctor_appointment
DB_USERNAME=root
DB_PASSWORD=
```

5. **Run migrations and seeders**
```bash
php artisan migrate:fresh
php artisan db:seed
```

6. **Publish Sanctum configuration**
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

7. **Start the development server**
```bash
php artisan serve
```

The API will be available at `http://localhost:8000/api`

### Test Credentials

**Admin User:**
- Email: `admin@doctorappt.com`
- Password: `password`

**Sample Doctors:**
- Email: `dr.sarah@doctorappt.com` (General Physician)
- Email: `dr.michael@doctorappt.com` (Gynecologist)
- Password: `password` (for all)

## Frontend Setup (React + Vite)

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure API URL** (in `src/services/api.js`)
```javascript
baseURL: 'http://localhost:8000/api'
```

4. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh-token` - Refresh authentication token

### Doctors
- `GET /api/doctors` - Get all doctors with pagination and filters
- `GET /api/doctors/top` - Get top doctors
- `GET /api/doctors/{id}` - Get doctor details
- `GET /api/doctors/specialty/{specialtyId}` - Get doctors by specialty
- `GET /api/doctors/{id}/available-slots` - Get available appointment slots

### Specialties
- `GET /api/specialties` - Get all specialties
- `GET /api/specialties/{id}` - Get specialty details

### Appointments
- `GET /api/appointments/my` - Get user's appointments (Protected)
- `POST /api/appointments/book` - Book new appointment (Protected)
- `GET /api/appointments/{id}` - Get appointment details (Protected)
- `POST /api/appointments/{id}/cancel` - Cancel appointment (Protected)
- `POST /api/appointments/{id}/reschedule` - Reschedule appointment (Protected)
- `PUT /api/appointments/{id}/status` - Update status (Protected)

### User Profile
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update profile (Protected)
- `POST /api/users/change-password` - Change password (Protected)
- `POST /api/users/upload-profile-image` - Upload profile image (Protected)

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics (Protected - Admin only)
- `GET /api/admin/users` - Get all users (Protected - Admin only)
- `GET /api/admin/doctors` - Get all doctors (Protected - Admin only)
- `GET /api/admin/appointments` - Get all appointments (Protected - Admin only)
- `POST /api/admin/doctors` - Create doctor (Protected - Admin only)
- `PUT /api/admin/doctors/{id}` - Update doctor (Protected - Admin only)
- `POST /api/admin/users/{id}/deactivate` - Deactivate user (Protected - Admin only)
- `POST /api/admin/users/{id}/activate` - Activate user (Protected - Admin only)
- `POST /api/admin/specialties` - Create specialty (Protected - Admin only)
- `GET/POST /api/admin/settings` - Get/Update settings (Protected - Admin only)

## Database Schema

### Users Table
- id, name, email, password, phone, address, gender, dob, role, is_active, bio, profile_image

### Doctors Table
- id, user_id, specialty_id, license_number, experience, consultation_fee, years_of_experience, is_available, qualifications, appointment_duration

### Specialties Table
- id, name, description, icon, is_active

### Appointments Table
- id, user_id, doctor_id, appointment_date, status, notes, prescription, slot_duration, is_paid, payment_method, payment_status, amount, cancellation_reason

### AdminSettings Table
- id, key, value, type, description

## Technology Stack

### Backend
- **Framework**: Laravel 11
- **Authentication**: Laravel Sanctum (API Tokens)
- **Database**: MySQL
- **API Style**: RESTful

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router v7
- **UI Notifications**: React Toastify
- **State Management**: Context API

## Folder Structure

### Backend
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── AuthController.php
│   │   │       ├── UserController.php
│   │   │       ├── DoctorController.php
│   │   │       ├── AppointmentController.php
│   │   │       ├── SpecialtyController.php
│   │   │       └── AdminController.php
│   │   └── Middleware/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Doctor.php
│   │   ├── Specialty.php
│   │   ├── Appointment.php
│   │   └── AdminSetting.php
│   └── Providers/
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
└── config/

```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── SpecialityMenu.jsx
│   │   ├── TopDoctors.jsx
│   │   ├── Banner.jsx
│   │   ├── RelatedDoctors.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Doctors.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Appointment.jsx
│   │   ├── MyAppointments.jsx
│   │   ├── MyProfile.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── UserDashboard.jsx
│   │   └── AdminDashboard.jsx
│   ├── context/
│   │   └── AppContext.jsx
│   ├── services/
│   │   └── api.js
│   ├── assets/
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── vite.config.js
```

## Running the Application

### Terminal 1: Backend
```bash
cd backend
php artisan serve
# Runs on http://localhost:8000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

## Features in Detail

### User Features
- **Registration**: Simple sign-up with email and password
- **Login**: Secure login with JWT tokens
- **Browse Doctors**: Filter by specialty
- **Book Appointment**: Real-time slot availability
- **Manage Appointments**: View, cancel, or reschedule
- **Profile Management**: Update personal information

### Admin Features
- **Dashboard**: View key metrics and statistics
- **User Management**: Activate/deactivate users
- **Doctor Management**: Add and manage doctors
- **Appointment Tracking**: Monitor all appointments
- **Specialty Management**: Add and manage specialties
- **Settings**: Configure system settings

## Security Features
- Input validation on both frontend and backend
- Password hashing (bcrypt)
- API token authentication (Sanctum)
- Protected routes (role-based access)
- CORS configuration
- XSS protection

## Future Enhancements
- Payment integration (Stripe/Razorpay)
- Email notifications
- SMS notifications
- Video consultation
- Doctor ratings and reviews
- Prescription management
- Medical reports storage
- Calendar view for appointments
- SMS/Email verification
- Two-factor authentication
- Doctor availability schedule

## Troubleshooting

### Laravel Errors
1. **Key not generated**
   ```bash
   php artisan key:generate
   ```

2. **Database connection error**
   - Check `.env` file database credentials
   - Ensure MySQL is running
   - Create database: `doctor_appointment`

3. **Sanctum token issues**
   ```bash
   php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
   ```

### React Errors
1. **Module not found**
   ```bash
   npm install
   ```

2. **Port already in use**
   ```bash
   npm run dev -- --port 5174
   ```

3. **API connection issues**
   - Ensure backend server is running
   - Check API URL in `src/services/api.js`
   - Check CORS configuration in Laravel

## Contributing
1. Create a new branch for features
2. Commit changes with clear messages
3. Push to the remote repository
4. Create a pull request

## License
MIT License - Feel free to use this project for personal and commercial purposes.

## Support
For issues or questions, please create an issue in the repository.

---

**Created with ❤️ for better healthcare appointment management**
