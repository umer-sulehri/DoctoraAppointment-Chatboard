import React, { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const Register = () => {
  const navigate = useNavigate()
  const { register, loading } = useContext(AppContext)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.password_confirmation) {
      toast.error('Passwords do not match')
      return
    }

    try {
      await register(formData)
      toast.success('Registration successful! Logging you in...')
      navigate('/user-dashboard')
    } catch (error) {
      const errors = error.response?.data?.errors
      if (errors) {
        Object.values(errors).forEach(err => toast.error(err[0]))
      } else {
        toast.error(error.response?.data?.message || 'Registration failed')
      }
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white py-12'>
      <div className='w-full max-w-md p-8 bg-white rounded-lg shadow-lg'>
        <h2 className='text-3xl font-bold text-center mb-6 text-gray-800'>Create Account</h2>
        
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Full Name</label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleChange}
              required
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Your full name'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address</label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='your@email.com'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Phone Number</label>
            <input
              type='tel'
              name='phone'
              value={formData.phone}
              onChange={handleChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='+1234567890'
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
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter password (min 6 characters)'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Confirm Password</label>
            <input
              type='password'
              name='password_confirmation'
              value={formData.password_confirmation}
              onChange={handleChange}
              required
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Confirm password'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition duration-200'
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className='text-center text-sm text-gray-600 mt-6'>
          Already have an account?{' '}
          <Link to='/login' className='text-blue-500 hover:text-blue-600 font-medium'>
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
