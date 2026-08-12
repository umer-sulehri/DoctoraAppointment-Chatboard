import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import API from '../services/api'

const ResetPassword = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [verifying, setVerifying] = useState(true)
    const [tokenValid, setTokenValid] = useState(false)
    
    const [formData, setFormData] = useState({
        email: searchParams.get('email') || '',
        token: '',
        password: '',
        password_confirmation: '',
    })

    useEffect(() => {
        // If email is not in URL params, take user to forgot password page
        if (!formData.email) {
            navigate('/forgot-password')
        }
        setVerifying(false)
    }, [formData.email, navigate])

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const verifyToken = async () => {
        if (!formData.token) {
            toast.error('Please enter the reset token')
            return
        }

        try {
            setLoading(true)
            await API.verifyResetToken(formData.email, formData.token)
            setTokenValid(true)
            toast.success('Token verified! You can now reset your password.')
        } catch (error) {
            const message = error.response?.data?.message || 'Invalid or expired token'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation
        if (!formData.email || !formData.token || !formData.password || !formData.password_confirmation) {
            toast.error('All fields are required')
            return
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long')
            return
        }

        if (formData.password !== formData.password_confirmation) {
            toast.error('Passwords do not match')
            return
        }

        try {
            setLoading(true)
            const response = await API.resetPassword({
                email: formData.email,
                token: formData.token,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
            })

            toast.success(response.message)
            navigate('/login')
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to reset password'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    if (verifying) {
        return <div className='text-center py-10'>Loading...</div>
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='w-full max-w-md bg-white rounded-lg shadow-md p-8'>
                <div className='mb-6'>
                    <h2 className='text-3xl font-bold text-gray-900 text-center'>Reset Password</h2>
                    <p className='text-gray-600 text-center mt-2'>
                        Enter the reset token you received and create a new password
                    </p>
                </div>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    {/* Email Field (Read-only) */}
                    <div>
                        <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                            Email Address
                        </label>
                        <input
                            id='email'
                            type='email'
                            value={formData.email}
                            readOnly
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed'
                        />
                    </div>

                    {/* Reset Token Field */}
                    <div>
                        <div className='flex items-center justify-between mb-2'>
                            <label htmlFor='token' className='block text-sm font-medium text-gray-700'>
                                Reset Token
                            </label>
                            {!tokenValid && (
                                <span className='text-xs text-yellow-600'>Not verified yet</span>
                            )}
                            {tokenValid && (
                                <span className='text-xs text-green-600'>✓ Verified</span>
                            )}
                        </div>
                        <div className='flex gap-2'>
                            <input
                                id='token'
                                type='text'
                                name='token'
                                value={formData.token}
                                onChange={handleChange}
                                disabled={tokenValid}
                                className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100'
                                placeholder='Paste your reset token here'
                                required
                            />
                            {!tokenValid && (
                                <button
                                    type='button'
                                    onClick={verifyToken}
                                    disabled={loading || !formData.token}
                                    className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-medium whitespace-nowrap'
                                >
                                    {loading ? 'Verifying...' : 'Verify'}
                                </button>
                            )}
                        </div>
                        <p className='text-xs text-gray-500 mt-1'>
                            You received this token in the email or on the forgot password page
                        </p>
                    </div>

                    {tokenValid && (
                        <>
                            {/* Password Field */}
                            <div>
                                <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
                                    New Password
                                </label>
                                <input
                                    id='password'
                                    type='password'
                                    name='password'
                                    value={formData.password}
                                    onChange={handleChange}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    placeholder='Enter new password'
                                    required
                                    minLength={6}
                                />
                                <p className='text-xs text-gray-500 mt-1'>
                                    Minimum 6 characters
                                </p>
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor='confirm' className='block text-sm font-medium text-gray-700 mb-2'>
                                    Confirm Password
                                </label>
                                <input
                                    id='confirm'
                                    type='password'
                                    name='password_confirmation'
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    placeholder='Confirm your password'
                                    required
                                />
                            </div>

                            {/* Password Match Indicator */}
                            {formData.password && formData.password_confirmation && (
                                <div className={`px-3 py-2 rounded text-sm ${
                                    formData.password === formData.password_confirmation
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                    {formData.password === formData.password_confirmation
                                        ? '✓ Passwords match'
                                        : '✗ Passwords do not match'
                                    }
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type='submit'
                                disabled={loading || formData.password !== formData.password_confirmation}
                                className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium mt-4'
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </>
                    )}

                    {!tokenValid && (
                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4'>
                            <p className='text-blue-800 text-sm'>
                                ℹ️ First, verify your reset token by pasting it above and clicking "Verify", then you can set your new password.
                            </p>
                        </div>
                    )}
                </form>

                <div className='mt-6 text-center'>
                    <p className='text-gray-600'>
                        Don't have a reset token?{' '}
                        <button
                            onClick={() => navigate('/forgot-password')}
                            className='text-blue-600 hover:underline font-medium'
                        >
                            Request one
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword
