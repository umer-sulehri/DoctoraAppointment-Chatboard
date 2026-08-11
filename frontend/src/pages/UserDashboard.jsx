import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { API } from '../services/api'
import { useNavigate } from 'react-router-dom'

const UserDashboard = () => {
    const navigate = useNavigate()
    const { user, fetchMyAppointments, appointments, loading, currencySymbol, fetchUserProfile } = useContext(AppContext)
    const [activeTab, setActiveTab] = useState('overview')
    const [reports, setReports] = useState([])
    const [reportsLoading, setReportsLoading] = useState(false)
    const [uploadingReport, setUploadingReport] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [uploadForm, setUploadForm] = useState({ title: '', report_type: 'general', description: '', report_date: '' })
    const [selectedFile, setSelectedFile] = useState(null)
    const [profileData, setProfileData] = useState({
        name: '', email: '', phone: '', address: '', gender: '', dob: ''
    })
    const [editMode, setEditMode] = useState(false)
    const [profileLoading, setProfileLoading] = useState(false)

    useEffect(() => {
        fetchMyAppointments()
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                gender: user.gender || '',
                dob: user.dob || ''
            })
        }
    }, [user])

    useEffect(() => {
        if (activeTab === 'reports') loadReports()
    }, [activeTab])

    const loadReports = async () => {
        try {
            setReportsLoading(true)
            const res = await API.getMyReports()
            setReports(res.data.reports || [])
        } catch (error) {
            console.error('Failed to load reports:', error)
        } finally {
            setReportsLoading(false)
        }
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
        if (!allowed.includes(file.type)) {
            toast.error('Only PDF, JPG, and PNG files are allowed')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File must be less than 5MB')
            return
        }
        setSelectedFile(file)
        // Auto-fill title if empty
        if (!uploadForm.title) {
            setUploadForm(prev => ({ ...prev, title: file.name.replace(/\.[^.]+$/, '') }))
        }
    }

    const handleReportUpload = async (e) => {
        e.preventDefault()
        if (!selectedFile) {
            toast.error('Please select a file')
            return
        }

        try {
            setUploadingReport(true)
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('title', uploadForm.title || selectedFile.name)
            formData.append('report_type', uploadForm.report_type)
            if (uploadForm.description) formData.append('description', uploadForm.description)
            if (uploadForm.report_date) formData.append('report_date', uploadForm.report_date)
            await API.uploadReport(formData)
            toast.success('Report uploaded successfully')
            setShowUploadModal(false)
            setSelectedFile(null)
            setUploadForm({ title: '', report_type: 'general', description: '', report_date: '' })
            loadReports()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed')
        } finally {
            setUploadingReport(false)
        }
    }

    const handleDeleteReport = async (reportId) => {
        if (window.confirm('Delete this report?')) {
            try {
                await API.deleteReport(reportId)
                toast.success('Report deleted')
                loadReports()
            } catch (error) {
                toast.error('Failed to delete report')
            }
        }
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        try {
            setProfileLoading(true)
            await API.updateProfile(profileData)
            await fetchUserProfile()
            toast.success('Profile updated successfully!')
            setEditMode(false)
        } catch (error) {
            toast.error('Failed to update profile')
        } finally {
            setProfileLoading(false)
        }
    }

    const handleCancelAppointment = async (appointmentId) => {
        if (window.confirm('Cancel this appointment?')) {
            try {
                await API.cancelAppointment(appointmentId, 'User requested cancellation')
                toast.success('Appointment cancelled')
                fetchMyAppointments()
            } catch (error) {
                toast.error('Failed to cancel appointment')
            }
        }
    }

    const stats = [
        { label: 'Total Appointments', value: appointments?.length || 0, color: 'blue', icon: '📅' },
        { label: 'Completed', value: appointments?.filter(a => a.status === 'completed').length || 0, color: 'green', icon: '✅' },
        { label: 'Upcoming', value: appointments?.filter(a => a.status === 'pending' || a.status === 'confirmed').length || 0, color: 'yellow', icon: '⏰' },
        { label: 'Cancelled', value: appointments?.filter(a => a.status === 'cancelled').length || 0, color: 'red', icon: '❌' },
    ]

    const colorMap = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        yellow: 'from-yellow-500 to-yellow-600',
        red: 'from-red-500 to-red-600',
    }

    const tabs = [
        { id: 'overview', label: '📅 Appointments' },
        { id: 'reports', label: '📁 Medical Reports' },
        { id: 'profile', label: '👤 Profile' },
    ]

    return (
        <div className='py-6 max-w-6xl mx-auto'>
            {/* Welcome Banner */}
            <div className='bg-gradient-to-r from-primary to-blue-500 rounded-2xl p-6 mb-8 text-white'>
                <h1 className='text-2xl font-bold'>Welcome back, {user?.name?.split(' ')[0] || 'Patient'}! 👋</h1>
                <p className='text-blue-100 mt-1'>Manage your health journey from your personal dashboard.</p>
                <button
                    onClick={() => navigate('/doctors')}
                    className='mt-3 bg-white text-primary px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-50 transition'
                >
                    Book New Appointment →
                </button>
            </div>

            {/* Stats Grid */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
                {stats.map((stat, i) => (
                    <div key={i} className={`bg-gradient-to-br ${colorMap[stat.color]} rounded-2xl p-5 text-white`}>
                        <div className='text-3xl mb-1'>{stat.icon}</div>
                        <p className='text-3xl font-bold'>{stat.value}</p>
                        <p className='text-xs opacity-80 mt-1'>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className='flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 overflow-x-auto'>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm whitespace-nowrap transition ${activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Appointments Tab */}
            {activeTab === 'overview' && (
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100'>
                    <div className='p-6 border-b border-gray-100'>
                        <h2 className='text-xl font-bold text-gray-800'>My Appointments</h2>
                    </div>
                    {loading ? (
                        <div className='p-6 text-center text-gray-500'>Loading appointments...</div>
                    ) : appointments && appointments.length > 0 ? (
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        <th className='px-5 py-3 text-left font-semibold text-gray-600'>Doctor</th>
                                        <th className='px-5 py-3 text-left font-semibold text-gray-600'>Specialty</th>
                                        <th className='px-5 py-3 text-left font-semibold text-gray-600'>Date & Time</th>
                                        <th className='px-5 py-3 text-left font-semibold text-gray-600'>Status</th>
                                        <th className='px-5 py-3 text-left font-semibold text-gray-600'>Fee</th>
                                        <th className='px-5 py-3 text-left font-semibold text-gray-600'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.slice(0, 10).map(apt => (
                                        <tr key={apt.id} className='border-t border-gray-50 hover:bg-blue-50/30 transition'>
                                            <td className='px-5 py-3 font-medium text-gray-800'>{apt.doctor?.user?.name || 'N/A'}</td>
                                            <td className='px-5 py-3 text-gray-500'>{apt.doctor?.specialty?.name || 'N/A'}</td>
                                            <td className='px-5 py-3 text-gray-600'>{new Date(apt.appointment_date).toLocaleString()}</td>
                                            <td className='px-5 py-3'>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                                                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className='px-5 py-3 font-bold text-primary'>{currencySymbol}{apt.amount}</td>
                                            <td className='px-5 py-3'>
                                                {(apt.status === 'pending' || apt.status === 'confirmed') && (
                                                    <button
                                                        onClick={() => handleCancelAppointment(apt.id)}
                                                        className='text-red-500 hover:text-red-700 text-xs font-medium'
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                {apt.status === 'completed' && (
                                                    <button
                                                        onClick={() => navigate('/my-appontments')}
                                                        className='text-primary hover:underline text-xs font-medium'
                                                    >
                                                        View →
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className='p-8 text-center'>
                            <div className='text-5xl mb-3'>📅</div>
                            <p className='text-gray-600 font-medium mb-1'>No appointments yet</p>
                            <p className='text-gray-400 text-sm mb-4'>Book your first appointment with a trusted doctor</p>
                            <button onClick={() => navigate('/doctors')} className='bg-primary text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition'>
                                Browse Doctors
                            </button>
                        </div>
                    )}
                    {appointments && appointments.length > 0 && (
                        <div className='p-4 border-t border-gray-100 text-center'>
                            <button onClick={() => navigate('/my-appontments')} className='text-primary font-medium text-sm hover:underline'>
                                View All Appointments →
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100'>
                    <div className='p-6 border-b border-gray-100 flex justify-between items-center'>
                        <h2 className='text-xl font-bold text-gray-800'>Medical Reports</h2>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className='bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2'
                        >
                            📤 Upload Report
                        </button>
                    </div>
                    <div className='p-6'>
                        {reportsLoading ? (
                            <div className='text-center py-8 text-gray-500'>Loading reports...</div>
                        ) : reports.length > 0 ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {reports.map(report => (
                                    <div key={report.id} className='border border-gray-100 rounded-xl p-4 flex items-start justify-between gap-3 hover:bg-gray-50 transition'>
                                        <div className='flex items-start gap-3'>
                                            <div className='w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0'>
                                                {report.report_type === 'lab_test' ? '🧪' : report.report_type === 'imaging' ? '🔬' : report.report_type === 'prescription' ? '💊' : report.file_url?.includes('.pdf') ? '📄' : '🖼️'}
                                            </div>
                                            <div>
                                                <p className='font-semibold text-gray-800 text-sm'>{report.title}</p>
                                                <p className='text-xs text-gray-400 mt-0.5 capitalize'>{report.report_type?.replace('_', ' ')} • {new Date(report.created_at).toLocaleDateString()}</p>
                                                {report.description && <p className='text-xs text-gray-500 mt-1'>{report.description}</p>}
                                                {report.report_date && <p className='text-xs text-gray-400'>Date: {report.report_date}</p>}
                                            </div>
                                        </div>
                                        <div className='flex gap-2 flex-shrink-0'>
                                            {report.file_url ? (
                                                <a
                                                    href={report.file_url}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition text-xs'
                                                    title='View Report'
                                                >
                                                    👁️
                                                </a>
                                            ) : null}
                                            <button
                                                onClick={() => handleDeleteReport(report.id)}
                                                className='p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition text-xs'
                                                title='Delete'
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='text-center py-12'>
                                <div className='text-5xl mb-3'>📂</div>
                                <p className='text-gray-600 font-medium mb-1'>No medical reports</p>
                                <p className='text-gray-400 text-sm'>Upload your medical reports, lab results, or prescriptions to keep them organized</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
                    <div className='flex justify-between items-center mb-6'>
                        <h2 className='text-xl font-bold text-gray-800'>Personal Information</h2>
                        {!editMode && (
                            <button
                                onClick={() => setEditMode(true)}
                                className='bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition'
                            >
                                ✏️ Edit Profile
                            </button>
                        )}
                    </div>

                    {editMode ? (
                        <form onSubmit={handleProfileUpdate} className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                            {[
                                { label: 'Full Name', name: 'name', type: 'text' },
                                { label: 'Phone', name: 'phone', type: 'tel' },
                                { label: 'Address', name: 'address', type: 'text' },
                                { label: 'Date of Birth', name: 'dob', type: 'date' },
                            ].map(field => (
                                <div key={field.name}>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>{field.label}</label>
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={profileData[field.name]}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
                                    />
                                </div>
                            ))}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Gender</label>
                                <select
                                    name='gender'
                                    value={profileData.gender}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white'
                                >
                                    <option value=''>Select Gender</option>
                                    <option value='male'>Male</option>
                                    <option value='female'>Female</option>
                                    <option value='other'>Other</option>
                                </select>
                            </div>
                            <div className='md:col-span-2 flex gap-3'>
                                <button
                                    type='submit'
                                    disabled={profileLoading}
                                    className='bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-60'
                                >
                                    {profileLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setEditMode(false)}
                                    className='bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-medium hover:bg-gray-200 transition'
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {[
                                { label: 'Full Name', value: user?.name, icon: '👤' },
                                { label: 'Email Address', value: user?.email, icon: '📧' },
                                { label: 'Phone Number', value: user?.phone || 'Not provided', icon: '📱' },
                                { label: 'Gender', value: user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not provided', icon: '⚧' },
                                { label: 'Date of Birth', value: user?.dob || 'Not provided', icon: '🎂' },
                                { label: 'Address', value: user?.address || 'Not provided', icon: '📍' },
                            ].map((item, i) => (
                                <div key={i} className='flex items-start gap-3 p-4 bg-gray-50 rounded-xl'>
                                    <span className='text-lg'>{item.icon}</span>
                                    <div>
                                        <p className='text-xs text-gray-400 font-medium mb-0.5'>{item.label}</p>
                                        <p className='text-gray-800 font-semibold text-sm'>{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Upload Report Modal */}
            {showUploadModal && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm'>
                    <div className='bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl'>
                        <div className='flex justify-between items-center mb-5'>
                            <h3 className='text-xl font-bold text-gray-900'>📤 Upload Medical Report</h3>
                            <button onClick={() => { setShowUploadModal(false); setSelectedFile(null) }} className='text-gray-400 hover:text-gray-600 text-xl'>✕</button>
                        </div>
                        <form onSubmit={handleReportUpload} className='space-y-4'>
                            {/* File Picker */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Report File *</label>
                                <label className='flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary hover:bg-blue-50/30 transition'>
                                    <input type='file' accept='.pdf,.jpg,.jpeg,.png' onChange={handleFileSelect} className='hidden' />
                                    {selectedFile ? (
                                        <div className='text-center'>
                                            <div className='text-3xl mb-1'>{selectedFile.name.endsWith('.pdf') ? '📄' : '🖼️'}</div>
                                            <p className='text-sm font-medium text-gray-700'>{selectedFile.name}</p>
                                            <p className='text-xs text-gray-400'>{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    ) : (
                                        <div className='text-center'>
                                            <div className='text-3xl mb-1'>📂</div>
                                            <p className='text-sm text-gray-500'>Click to select file</p>
                                            <p className='text-xs text-gray-400 mt-1'>PDF, JPG, PNG — max 5MB</p>
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Report Title *</label>
                                <input
                                    type='text'
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                    placeholder='e.g. Blood Test Results, X-Ray'
                                    required
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Report Type</label>
                                <select
                                    value={uploadForm.report_type}
                                    onChange={(e) => setUploadForm({ ...uploadForm, report_type: e.target.value })}
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30'
                                >
                                    <option value='general'>General</option>
                                    <option value='lab_test'>🧪 Lab Test</option>
                                    <option value='prescription'>💊 Prescription</option>
                                    <option value='diagnosis'>📋 Diagnosis</option>
                                    <option value='imaging'>🔬 Imaging / X-Ray / MRI</option>
                                    <option value='other'>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Report Date (Optional)</label>
                                <input
                                    type='date'
                                    value={uploadForm.report_date}
                                    onChange={(e) => setUploadForm({ ...uploadForm, report_date: e.target.value })}
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Notes (Optional)</label>
                                <textarea
                                    value={uploadForm.description}
                                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                    placeholder='Additional context about this report...'
                                    rows='2'
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30'
                                ></textarea>
                            </div>

                            <div className='flex gap-3 pt-2'>
                                <button
                                    type='submit'
                                    disabled={uploadingReport || !selectedFile}
                                    className='flex-1 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-60'
                                >
                                    {uploadingReport ? '⏳ Uploading...' : '📤 Upload Report'}
                                </button>
                                <button type='button' onClick={() => { setShowUploadModal(false); setSelectedFile(null) }} className='flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 transition'>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserDashboard
