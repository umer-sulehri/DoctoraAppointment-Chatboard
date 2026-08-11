import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import API from '../services/api'

const ForgotPassword = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [showResetToken, setShowResetToken] = useState(false)
    const [resetToken, setResetToken] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email) {
            toast.error('Please enter your email')
            return
        }

        try {
            setLoading(true)
            const response = await API.forgotPassword({ email })
            
            setResetToken(response.reset_token)
            setShowResetToken(true)
            toast.success('Reset link sent to your email. Token is also displayed below.')
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.errors?.email?.[0] || 'Failed to send reset link'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const copyToken = () => {
        navigator.clipboard.writeText(resetToken)
        toast.success('Token copied to clipboard')
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='w-full max-w-md bg-white rounded-lg shadow-md p-8'>
                <div className='mb-6'>
                    <h2 className='text-3xl font-bold text-gray-900 text-center'>Forgot Password?</h2>
                    <p className='text-gray-600 text-center mt-2'>
                        Enter your email address and we'll send you a password reset link
                    </p>
                </div>

                {!showResetToken ? (
                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div>
                            <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                                Email Address
                            </label>
                            <input
                                id='email'
                                type='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                placeholder='your@email.com'
                                required
                            />
                        </div>

                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium'
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <div className='space-y-6'>
                        <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                            <p className='text-green-800 text-sm'>
                                ✓ Reset link has been sent to your email. Check your inbox (and spam folder).
                            </p>
                        </div>

                        <div className='bg-gray-50 border border-gray-300 rounded-lg p-4'>
                            <p className='text-sm text-gray-600 mb-2'>Reset Token (for development/testing):</p>
                            <div className='flex gap-2'>
                                <input
                                    type='text'
                                    value={resetToken}
                                    readOnly
                                    className='flex-1 px-3 py-2 border border-gray-300 rounded text-xs font-mono bg-white'
                                />
                                <button
                                    onClick={copyToken}
                                    className='px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700'
                                >
                                    Copy
                                </button>
                            </div>
                            <p className='text-xs text-gray-500 mt-2'>
                                Keep this token safe. You'll need it to reset your password.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate(`/reset-password?email=${email}`)}
                            className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium'
                        >
                            Go to Reset Password
                        </button>

                        <button
                            onClick={() => {
                                setShowResetToken(false)
                                setEmail('')
                                setResetToken('')
                            }}
                            className='w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition font-medium'
                        >
                            Send to Another Email
                        </button>
                    </div>
                )}

                <div className='mt-6 text-center'>
                    <p className='text-gray-600'>
                        Remember your password?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className='text-blue-600 hover:underline font-medium'
                        >
                            Back to Login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
