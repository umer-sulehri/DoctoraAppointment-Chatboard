import React, { useContext, useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { AppContext } from './context/AppContext'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import HospitalChatbot from './components/HospitalChatbot'

function ProtectedRoute({ element, requiredRole = null }) {
  const { isAuthenticated, user } = useContext(AppContext)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user) {
    return (
      <div className='flex items-center justify-center py-20 min-h-[50vh]'>
        <div className='w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
      </div>
    )
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return element
}

function App() {
  const { fetchSpecialties, isAuthenticated, fetchUserProfile } = useContext(AppContext)

  useEffect(() => {
    fetchSpecialties()
    if (isAuthenticated) {
      fetchUserProfile()
    }
  }, [isAuthenticated])

  return (
    <div className='mx-4 sm:mx-[10%]'>
      <Navbar />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/doctors' element={<Doctors />} />
        <Route path='/doctors/:speciality' element={<Doctors />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/my-profile' element={<ProtectedRoute element={<MyProfile />} />} />
        <Route path='/my-appontments' element={<ProtectedRoute element={<MyAppointments />} />} />
        <Route path='/user-dashboard' element={<ProtectedRoute element={<UserDashboard />} />} />
        <Route path='/doctor-dashboard' element={<ProtectedRoute element={<DoctorDashboard />} requiredRole="doctor" />} />
        <Route path='/appointment/:docId' element={<ProtectedRoute element={<Appointment />} />} />
        <Route path='/admin-dashboard' element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} />
      </Routes>
      <Footer />
      <HospitalChatbot />
    </div>
  )
}

export default App