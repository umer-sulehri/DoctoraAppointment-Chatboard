import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { API } from '../services/api'
import { assets } from '../assets/assets'

const MyProfile = () => {
    const { user, fetchUserProfile } = useContext(AppContext)
    const [editMode, setEditMode] = useState(false)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')
    const [uploadingImage, setUploadingImage] = useState(false)
    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        address: '',
        gender: '',
        dob: ''
    })
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    })

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                gender: user.gender || '',
                dob: user.dob || ''
            })
        }
    }, [user])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setProfileData(prev => ({ ...prev, [name]: value }))
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            await API.updateProfile(profileData)
            await fetchUserProfile()
            toast.success('Profile updated successfully!')
            setEditMode(false)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            toast.error('New passwords do not match')
            return
        }
        try {
            setLoading(true)
            await API.changePassword(passwordData)
            toast.success('Password changed successfully!')
            setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' })
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password')
        } finally {
            setLoading(false)
        }
    }

    const handleProfileImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            toast.error('Only JPG, PNG, and GIF images are allowed')
            return
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size must be less than 2MB')
            return
        }

        try {
            setUploadingImage(true)
            await API.uploadProfileImage(file)
            await fetchUserProfile()
            toast.success('Profile image updated!')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload image')
        } finally {
            setUploadingImage(false)
        }
    }

    return (
        <div className='py-8 max-w-4xl mx-auto'>
            <h1 className='text-3xl font-bold mb-8 text-gray-800'>My Profile</h1>

            {/* Profile Header Card */}
            <div className='bg-gradient-to-r from-primary to-blue-500 rounded-2xl p-6 mb-6 text-white'>
                <div className='flex items-center gap-6'>
                    <div className='relative'>
                        <img
                            className='w-24 h-24 rounded-full object-cover border-4 border-white/30'
                            src={user?.profile_image || assets.profile_pic}
                            alt={user?.name}
                            onError={(e) => { e.target.src = assets.profile_pic }}
                        />
                        <label className='absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-100 transition'>
                            <input
                                type='file'
                                accept='image/*'
                                onChange={handleProfileImageUpload}
                                className='hidden'
                            />
                            {uploadingImage ? (
                                <div className='w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin'></div>
                            ) : (
                                <svg className='w-4 h-4 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' />
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 13a3 3 0 11-6 0 3 3 0 016 0z' />
                                </svg>
                            )}
                        </label>
                    </div>
                    <div>
                        <h2 className='text-2xl font-bold'>{user?.name || 'User'}</h2>
                        <p className='text-blue-100'>{user?.email}</p>
                        <span className='mt-2 inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full capitalize'>
                            {user?.role || 'Patient'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className='flex gap-1 mb-6 bg-gray-100 rounded-xl p-1'>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition ${activeTab === 'profile' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    Personal Info
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition ${activeTab === 'security' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    Security
                </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
                    <div className='flex justify-between items-center mb-6'>
                        <h3 className='text-xl font-bold text-gray-800'>Personal Information</h3>
                        {!editMode && (
                            <button
                                onClick={() => setEditMode(true)}
                                className='flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium'
                            >
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                                </svg>
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {editMode ? (
                        <form onSubmit={handleProfileUpdate} className='space-y-5'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Full Name</label>
                                    <input
                                        type='text'
                                        name='name'
                                        value={profileData.name}
                                        onChange={handleInputChange}
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'
                                        placeholder='Your full name'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address</label>
                                    <input
                                        type='email'
                                        value={user?.email || ''}
                                        disabled
                                        className='w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Phone Number</label>
                                    <input
                                        type='tel'
                                        name='phone'
                                        value={profileData.phone}
                                        onChange={handleInputChange}
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'
                                        placeholder='+92 300 0000000'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Gender</label>
                                    <select
                                        name='gender'
                                        value={profileData.gender}
                                        onChange={handleInputChange}
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-white'
                                    >
                                        <option value=''>Select Gender</option>
                                        <option value='male'>Male</option>
                                        <option value='female'>Female</option>
                                        <option value='other'>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Date of Birth</label>
                                    <input
                                        type='date'
                                        name='dob'
                                        value={profileData.dob}
                                        onChange={handleInputChange}
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Address</label>
                                    <input
                                        type='text'
                                        name='address'
                                        value={profileData.address}
                                        onChange={handleInputChange}
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'
                                        placeholder='Your address'
                                    />
                                </div>
                            </div>

                            <div className='flex gap-3 pt-2'>
                                <button
                                    type='submit'
                                    disabled={loading}
                                    className='bg-primary hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition disabled:opacity-60'
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setEditMode(false)}
                                    className='bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-medium transition'
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            {[
                                { label: 'Full Name', value: user?.name, icon: '👤' },
                                { label: 'Email Address', value: user?.email, icon: '📧' },
                                { label: 'Phone Number', value: user?.phone || 'Not provided', icon: '📱' },
                                { label: 'Gender', value: user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not provided', icon: '⚧' },
                                { label: 'Date of Birth', value: user?.dob || 'Not provided', icon: '🎂' },
                                { label: 'Address', value: user?.address || 'Not provided', icon: '📍' },
                            ].map((item, i) => (
                                <div key={i} className='flex items-start gap-3 p-4 bg-gray-50 rounded-xl'>
                                    <span className='text-lg mt-0.5'>{item.icon}</span>
                                    <div>
                                        <p className='text-xs text-gray-500 font-medium mb-1'>{item.label}</p>
                                        <p className='text-gray-800 font-semibold'>{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
                    <h3 className='text-xl font-bold text-gray-800 mb-6'>Change Password</h3>
                    <form onSubmit={handlePasswordChange} className='space-y-5 max-w-md'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Current Password</label>
                            <input
                                type='password'
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                                required
                                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'
                                placeholder='Enter current password'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>New Password</label>
                            <input
                                type='password'
                                value={passwordData.new_password}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                                required
                                minLength={8}
                                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'
                                placeholder='Min 8 characters'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Confirm New Password</label>
                            <input
                                type='password'
                                value={passwordData.new_password_confirmation}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, new_password_confirmation: e.target.value }))}
                                required
                                className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'
                                placeholder='Repeat new password'
                            />
                        </div>
                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full bg-primary hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition disabled:opacity-60'
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}

export default MyProfile