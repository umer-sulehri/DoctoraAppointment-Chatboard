import React, { useContext, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useContext(AppContext)
  
  const roleCredentials = {
    patient: { email: 'patient@doctorappt.com', password: 'password', label: 'Patient / User', icon: '👤' },
    doctor: { email: 'dr.sarah@doctorappt.com', password: 'password', label: 'Doctor', icon: '🩺' },
    admin: { email: 'admin@doctorappt.com', password: 'password', label: 'Admin', icon: '👑' },
  }

  const [selectedRole, setSelectedRole] = useState('patient')
  const [formData, setFormData] = useState({
    email: roleCredentials.patient.email,
    password: roleCredentials.patient.password
  })

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey)
    const creds = roleCredentials[roleKey]
    setFormData({
      email: creds.email,
      password: creds.password
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = await login(formData.email, formData.password)
      toast.success('Login successful!')
      
      const loggedUser = data.user
      if (location.state?.from?.pathname) {
        navigate(location.state.from.pathname)
      } else if (loggedUser?.role === 'admin') {
        navigate('/admin-dashboard')
      } else if (loggedUser?.role === 'doctor') {
        navigate('/doctor-dashboard')
      } else {
        navigate('/user-dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4'>
      <div className='w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100'>
        <h2 className='text-3xl font-bold text-center mb-2 text-gray-800'>Welcome Back</h2>
        <p className='text-center text-sm text-gray-500 mb-6'>Select your role or enter credentials to log in</p>
        
        {/* Role Selector Tabs */}
        <div className='mb-6'>
          <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 text-center'>Select Role to Autofill</p>
          <div className='grid grid-cols-3 gap-2 bg-gray-100 p-1.5 rounded-xl'>
            {Object.keys(roleCredentials).map((key) => {
              const role = roleCredentials[key]
              const isSelected = selectedRole === key
              return (
                <button
                  key={key}
                  type='button'
                  onClick={() => handleRoleSelect(key)}
                  className={`py-2 px-2 rounded-lg font-semibold text-xs transition flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'bg-primary text-white shadow-md scale-102'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                  }`}
                >
                  <span className='text-base'>{role.icon}</span>
                  <span>{role.label}</span>
                </button>
              )
            })}
          </div>
          <p className='text-center text-xs text-primary/80 mt-2 font-medium'>
            ✨ Autofilled demo credentials for <span className='capitalize font-bold'>{selectedRole}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address</label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'
              placeholder='your@email.com'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
            <input
              type='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              required
              className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'
              placeholder='Enter your password'
            />
            <div className='text-right mt-2'>
              <Link to='/forgot-password' className='text-sm text-primary hover:underline font-medium'>
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-primary hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition duration-200 shadow-md text-base mt-2'
          >
            {loading ? 'Signing In...' : `Sign In as ${roleCredentials[selectedRole].label}`}
          </button>
        </form>

        <p className='text-center text-sm text-gray-600 mt-6'>
          Don't have an account?{' '}
          <Link to='/register' className='text-primary hover:underline font-semibold'>
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login