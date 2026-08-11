import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const API = {
    // Auth
    register: (data) => axiosInstance.post('/auth/register', data),
    login: (data) => axiosInstance.post('/auth/login', data),
    logout: () => axiosInstance.post('/auth/logout'),
    getMe: () => axiosInstance.get('/auth/me'),
    refreshToken: () => axiosInstance.post('/auth/refresh-token'),

    // Password reset
    forgotPassword: (data) => axiosInstance.post('/auth/forgot-password', data),
    resetPassword: (data) => axiosInstance.post('/auth/reset-password', data),
    verifyResetToken: (email, token) => axiosInstance.get(`/auth/verify-reset-token/${token}`, { params: { email } }),

    // Email verification
    sendOtp: (data) => axiosInstance.post('/auth/send-otp', data),
    verifyOtp: (data) => axiosInstance.post('/auth/verify-otp', data),
    resendOtp: (data) => axiosInstance.post('/auth/resend-otp', data),

    // User
    getProfile: () => axiosInstance.get('/users/profile'),
    updateProfile: (data) => axiosInstance.put('/users/profile', data),
    changePassword: (data) => axiosInstance.post('/users/change-password', data),
    uploadProfileImage: (file) => {
        const formData = new FormData();
        formData.append('profile_image', file);
        return axiosInstance.post('/users/upload-profile-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    // Doctors
    getDoctors: (filters = {}) => axiosInstance.get('/doctors', { params: filters }),
    getTopDoctors: (limit = 10) => axiosInstance.get(`/doctors/top?limit=${limit}`),
    getDoctorById: (id) => axiosInstance.get(`/doctors/${id}`),
    getDoctorsBySpecialty: (specialtyId, page = 1) =>
        axiosInstance.get(`/doctors/specialty/${specialtyId}?page=${page}`),
    getAvailableSlots: (doctorId, date) =>
        axiosInstance.get(`/doctors/${doctorId}/available-slots?date=${date}`),

    // Specialties
    getSpecialties: () => axiosInstance.get('/specialties'),
    getSpecialtyById: (id) => axiosInstance.get(`/specialties/${id}`),

    // Appointments
    getMyAppointments: (page = 1) => axiosInstance.get(`/appointments/my?page=${page}`),
    bookAppointment: (data) => axiosInstance.post('/appointments/book', data),
    getAppointmentById: (id) => axiosInstance.get(`/appointments/${id}`),
    cancelAppointment: (id, reason) => axiosInstance.post(`/appointments/${id}/cancel`, { reason }),
    rescheduleAppointment: (id, date) => axiosInstance.post(`/appointments/${id}/reschedule`, { appointment_date: date }),
    updateAppointmentStatus: (id, data) => axiosInstance.put(`/appointments/${id}/status`, data),

    // Doctor Dashboard
    getDoctorDashboard: () => axiosInstance.get('/doctor/dashboard'),
    getDoctorAppointments: (filters = {}) => axiosInstance.get('/doctor/appointments', { params: filters }),
    getDoctorAppointmentDetail: (id) => axiosInstance.get(`/doctor/appointments/${id}`),
    acceptAppointment: (id) => axiosInstance.post(`/doctor/appointments/${id}/accept`),
    rejectAppointment: (id, reason) => axiosInstance.post(`/doctor/appointments/${id}/reject`, { reason }),
    completeAppointment: (id, notes) => axiosInstance.post(`/doctor/appointments/${id}/complete`, { consultation_notes: notes }),
    getDoctorAvailability: () => axiosInstance.get('/doctor/availability'),
    updateDoctorAvailability: (data) => axiosInstance.put('/doctor/availability', data),
    getDoctorWeekSchedule: () => axiosInstance.get('/doctor/schedule/week'),

    // Patient Reports
    getMyReports: () => axiosInstance.get('/reports/my'),
    uploadReport: (formData) => axiosInstance.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getReport: (reportId) => axiosInstance.get(`/reports/${reportId}`),
    updateReport: (reportId, data) => axiosInstance.put(`/reports/${reportId}`, data),
    deleteReport: (reportId) => axiosInstance.delete(`/reports/${reportId}`),
    toggleShareReport: (reportId) => axiosInstance.post(`/reports/${reportId}/share`),
    getAppointmentReports: (appointmentId) => axiosInstance.get(`/appointments/${appointmentId}/reports`),

    // Consultation Notes
    getMyNotes: () => axiosInstance.get('/notes/my'),
    getDoctorNotes: () => axiosInstance.get('/notes/doctor'),
    createNote: (data) => axiosInstance.post('/notes/create', data),
    getNote: (noteId) => axiosInstance.get(`/notes/${noteId}`),
    updateNote: (noteId, data) => axiosInstance.put(`/notes/${noteId}`, data),
    deleteNote: (noteId) => axiosInstance.delete(`/notes/${noteId}`),
    getAppointmentNotes: (appointmentId) => axiosInstance.get(`/notes/appointment/${appointmentId}`),

    // Ratings
    getDoctorRatings: (doctorId) => axiosInstance.get(`/ratings/doctor/${doctorId}`),
    getMyRatings: () => axiosInstance.get('/ratings/my'),
    rateDoctor: (data) => axiosInstance.post('/ratings/rate', data),
    getRating: (ratingId) => axiosInstance.get(`/ratings/${ratingId}`),
    updateRating: (ratingId, data) => axiosInstance.put(`/ratings/${ratingId}`, data),
    deleteRating: (ratingId) => axiosInstance.delete(`/ratings/${ratingId}`),

    // Messages / Chat
    getConversations: () => axiosInstance.get('/messages/conversations'),
    getUnreadCount: () => axiosInstance.get('/messages/unread-count'),
    getMessages: (otherUserId) => axiosInstance.get(`/messages/${otherUserId}`),
    sendMessage: (data) => axiosInstance.post('/messages/send', data),

    // Admin CRUD
    getDashboardStats: () => axiosInstance.get('/admin/dashboard'),
    getAdminUsers: (page = 1, search = '') =>
        axiosInstance.get(`/admin/users?page=${page}&search=${search}`),
    deleteAdminUser: (id) => axiosInstance.delete(`/admin/users/${id}`),
    getAdminDoctors: (page = 1, filters = {}) =>
        axiosInstance.get(`/admin/doctors?page=${page}`, { params: filters }),
    createDoctor: (data) => axiosInstance.post('/admin/doctors', data),
    updateDoctor: (id, data) => axiosInstance.put(`/admin/doctors/${id}`, data),
    deleteAdminDoctor: (id) => axiosInstance.delete(`/admin/doctors/${id}`),
    deactivateUser: (id) => axiosInstance.post(`/admin/users/${id}/deactivate`),
    activateUser: (id) => axiosInstance.post(`/admin/users/${id}/activate`),
    getAdminAppointments: (page = 1, filters = {}) =>
        axiosInstance.get(`/admin/appointments?page=${page}`, { params: filters }),
    deleteAdminAppointment: (id) => axiosInstance.delete(`/admin/appointments/${id}`),
    createSpecialty: (data) => axiosInstance.post('/admin/specialties', data),
    updateSpecialty: (id, data) => axiosInstance.put(`/admin/specialties/${id}`, data),
    deleteSpecialty: (id) => axiosInstance.delete(`/admin/specialties/${id}`),
    getSettings: () => axiosInstance.get('/admin/settings'),
    updateSetting: (key, value) => axiosInstance.post('/admin/settings', { key, value }),
    updateSettings: async (settingsObj) => {
        // Batch update multiple settings
        const promises = Object.entries(settingsObj).map(([key, value]) =>
            axiosInstance.post('/admin/settings', { key, value: String(value) })
        );
        return Promise.all(promises);
    },

    // Payment Gateway
    getPaymentConfig: () => axiosInstance.get('/payment/config'),
    submitPayment: (appointmentId, data) => axiosInstance.post(`/payment/appointments/${appointmentId}/submit`, data),
    verifyPayment: (appointmentId, data) => axiosInstance.post(`/payment/appointments/${appointmentId}/verify`, data),
    getPaymentStatus: (appointmentId) => axiosInstance.get(`/payment/appointments/${appointmentId}/status`),
    toggleDoctorPayment: () => axiosInstance.post('/payment/doctor/toggle'),
};

export default axiosInstance;
