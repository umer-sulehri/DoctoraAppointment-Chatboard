import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { API } from '../services/api'
import ChatModal from '../components/ChatModal'

const DoctorDashboard = () => {
    const navigate = useNavigate()
    const { user } = useContext(AppContext)
    const [activeTab, setActiveTab] = useState('overview')
    const [dashboardData, setDashboardData] = useState(null)
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [availability, setAvailability] = useState(null)
    const [editingAvailability, setEditingAvailability] = useState(false)
    const [completeModal, setCompleteModal] = useState(null)
    const [consultationNotes, setConsultationNotes] = useState('')
    const [rejectModal, setRejectModal] = useState(null)
    const [rejectReason, setRejectReason] = useState('')
    const [reportsModal, setReportsModal] = useState(null)   // { appointmentId, patientName }
    const [patientReports, setPatientReports] = useState([])
    const [reportsModalLoading, setReportsModalLoading] = useState(false)
    const [chatPartner, setChatPartner] = useState(null)
    const [doctorReviews, setDoctorReviews] = useState(null)
    const [acceptsOnlinePayment, setAcceptsOnlinePayment] = useState(false)
    const [paymentToggleLoading, setPaymentToggleLoading] = useState(false)
    const [verifyModal, setVerifyModal] = useState(null) // { appointment, action }

    const [formData, setFormData] = useState({
        available_from_time: '09:00',
        available_to_time: '17:00',
        break_start_time: '',
        break_end_time: '',
        available_days: [1, 2, 3, 4, 5],
        slot_duration: 30
    })

    useEffect(() => {
        if (!user || user.role !== 'doctor') {
            navigate('/login')
            return
        }
        fetchDashboardData()
    }, [user, navigate])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const dashRes = await API.getDoctorDashboard()
            setDashboardData(dashRes.data)

            const apptsRes = await API.getDoctorAppointments()
            const apptsList = apptsRes.data?.data || apptsRes.data?.appointments || apptsRes.data || []
            setAppointments(Array.isArray(apptsList) ? apptsList : [])

            const availRes = await API.getDoctorAvailability()
            const availData = availRes.data || {}
            let days = availData.available_days
            if (typeof days === 'string') {
                try { days = JSON.parse(days) } catch { days = [1, 2, 3, 4, 5] }
            }
            if (!Array.isArray(days)) days = [1, 2, 3, 4, 5]

            const normalizedAvail = {
                available_from_time: availData.available_from_time || '09:00',
                available_to_time: availData.available_to_time || '17:00',
                break_start_time: availData.break_start_time || '',
                break_end_time: availData.break_end_time || '',
                available_days: days,
                slot_duration: availData.slot_duration || 30
            }

            setAvailability(normalizedAvail)
            setFormData(normalizedAvail)

            // Fetch reviews if doctor has doctor object
            if (dashRes.data?.doctor?.id) {
                try {
                    const revRes = await API.getDoctorRatings(dashRes.data.doctor.id)
                    setDoctorReviews(revRes.data)
                } catch (e) { }
            }

            // Load payment preference
            if (dashRes.data?.doctor) {
                setAcceptsOnlinePayment(dashRes.data.doctor.accepts_online_payment || false)
            }
        } catch (error) {
            console.error('Error fetching doctor dashboard:', error)
            toast.error('Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    const handleAcceptAppointment = async (appointmentId) => {
        try {
            await API.acceptAppointment(appointmentId)
            toast.success('Appointment accepted successfully')
            fetchDashboardData()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to accept appointment')
        }
    }

    const handleRejectSubmit = async (e) => {
        e.preventDefault()
        if (!rejectReason.trim()) {
            toast.error('Please provide a rejection reason')
            return
        }
        try {
            await API.rejectAppointment(rejectModal, rejectReason)
            toast.success('Appointment rejected')
            setRejectModal(null)
            setRejectReason('')
            fetchDashboardData()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject appointment')
        }
    }

    const handleCompleteSubmit = async (e) => {
        e.preventDefault()
        if (!consultationNotes.trim()) {
            toast.error('Please enter consultation notes')
            return
        }
        try {
            await API.completeAppointment(completeModal, consultationNotes)
            toast.success('Appointment marked as completed')
            setCompleteModal(null)
            setConsultationNotes('')
            fetchDashboardData()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete appointment')
        }
    }

    const handleFetchAttachedReports = async (appointmentId, patientName) => {
        try {
            setReportsModalLoading(true)
            setReportsModal({ appointmentId, patientName })
            const res = await API.getAppointmentReports(appointmentId)
            setPatientReports(res.data.reports || [])
        } catch (error) {
            toast.error('Failed to load patient reports')
        } finally {
            setReportsModalLoading(false)
        }
    }

    const handleSaveAvailability = async () => {
        try {
            await API.updateDoctorAvailability(formData)
            toast.success('Availability updated successfully')
            setEditingAvailability(false)
            fetchDashboardData()
        } catch (error) {
            toast.error('Failed to update availability')
        }
    }

    const toggleDayAvailability = (dayIndex) => {
        setFormData(prev => {
            const days = Array.isArray(prev.available_days) ? prev.available_days : []
            return {
                ...prev,
                available_days: days.includes(dayIndex)
                    ? days.filter(d => d !== dayIndex)
                    : [...days, dayIndex]
            }
        })
    }

    const handleTogglePayment = async () => {
        try {
            setPaymentToggleLoading(true)
            const res = await API.toggleDoctorPayment()
            setAcceptsOnlinePayment(res.data.accepts_online_payment)
            toast.success(res.data.message)
        } catch (error) {
            toast.error('Failed to update payment setting')
        } finally {
            setPaymentToggleLoading(false)
        }
    }

    const handleVerifyPayment = async (appointmentId, action, notes = '') => {
        try {
            await API.verifyPayment(appointmentId, { action, notes })
            toast.success(action === 'verify' ? 'Payment verified ✅' : 'Payment rejected')
            setVerifyModal(null)
            fetchDashboardData()
        } catch (error) {
            toast.error('Failed to update payment status')
        }
    }

    if (loading) {
        return (
            <div className='py-12 max-w-7xl mx-auto px-4'>
                <div className='bg-gray-100 h-10 w-48 rounded-xl animate-pulse mb-6'></div>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className='bg-gray-100 h-28 rounded-2xl animate-pulse'></div>
                    ))}
                </div>
                <div className='bg-gray-100 h-64 rounded-2xl animate-pulse'></div>
            </div>
        )
    }

    const stats = dashboardData?.stats || {}
    const today_appointments = dashboardData?.today_appointments || []
    const pending_approvals = dashboardData?.pending_approvals || []
    const week_appointments = dashboardData?.week_appointments || []
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    return (
        <div className='min-h-screen py-6 max-w-7xl mx-auto'>
            {/* Header */}
            <div className='bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 mb-8 text-white shadow-lg'>
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                    <div>
                        <h1 className='text-3xl font-bold'>Doctor Dashboard</h1>
                        <p className='text-blue-100 mt-1'>Welcome back, Dr. {user?.name} 👋</p>
                    </div>
                    <span className='bg-white/20 text-white px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md'>
                        🩺 Practicing Specialist
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className='flex gap-1 mb-8 bg-gray-100 rounded-xl p-1 overflow-x-auto'>
                {[
                    { id: 'overview', label: '📊 Overview' },
                    { id: 'appointments', label: '📅 All Appointments' },
                    { id: 'availability', label: '⏰ Schedule & Availability' },
                    { id: 'reviews', label: '⭐ Patient Reviews' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm whitespace-nowrap transition ${activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'overview' && (
                <div className='space-y-8'>
                    {/* Stats Grid */}
                    <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
                        <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100'>
                            <p className='text-gray-400 text-xs font-semibold uppercase'>Total Appointments</p>
                            <p className='text-3xl font-extrabold text-gray-900 mt-1'>{stats.total_appointments || 0}</p>
                        </div>
                        <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100'>
                            <p className='text-gray-400 text-xs font-semibold uppercase'>Completed</p>
                            <p className='text-3xl font-extrabold text-green-600 mt-1'>{stats.completed_appointments || 0}</p>
                        </div>
                        <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100'>
                            <p className='text-gray-400 text-xs font-semibold uppercase'>Cancelled</p>
                            <p className='text-3xl font-extrabold text-red-500 mt-1'>{stats.cancelled_appointments || 0}</p>
                        </div>
                        <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100'>
                            <p className='text-gray-400 text-xs font-semibold uppercase'>Pending Approvals</p>
                            <p className='text-3xl font-extrabold text-amber-500 mt-1'>{stats.pending_approvals || 0}</p>
                        </div>
                        <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 col-span-2 sm:col-span-1'>
                            <p className='text-gray-400 text-xs font-semibold uppercase'>Rating</p>
                            <p className='text-3xl font-extrabold text-primary mt-1'>⭐ {Number(stats.average_rating || 0).toFixed(1)}</p>
                        </div>
                    </div>

                    {/* Payment Settings Card */}
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                            <div>
                                <h3 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
                                    <span>💳</span> Online Payment Setting
                                </h3>
                                <p className='text-gray-500 text-sm mt-1'>
                                    {acceptsOnlinePayment
                                        ? 'Patients can pay online before their appointment.'
                                        : 'Patients pay in cash at the clinic.'}
                                </p>
                            </div>
                            <div className='flex items-center gap-3'>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${acceptsOnlinePayment ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {acceptsOnlinePayment ? '✅ Online Payment ON' : '⛔ Pay at Clinic'}
                                </span>
                                <button
                                    onClick={handleTogglePayment}
                                    disabled={paymentToggleLoading}
                                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${acceptsOnlinePayment ? 'bg-primary' : 'bg-gray-300'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${acceptsOnlinePayment ? 'translate-x-7' : ''}`}></span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                        {/* Today's Appointments */}
                        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                            <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center gap-2'>
                                <span>📅</span> Today's Appointments ({today_appointments.length})
                            </h3>
                            {today_appointments.length > 0 ? (
                                <div className='space-y-3'>
                                    {today_appointments.map(apt => (
                                        <div key={apt.id} className='p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between'>
                                            <div>
                                                <p className='font-bold text-gray-800'>{apt.user?.name || 'Patient'}</p>
                                                <p className='text-xs text-gray-500 mt-0.5'>
                                                    ⏰ {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                {apt.notes && <p className='text-xs text-gray-600 mt-1 bg-white p-2 rounded border border-gray-100'>Notes: {apt.notes}</p>}
                                            </div>
                                            <span className='px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full capitalize'>
                                                {apt.acceptance_status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='text-center py-8 text-gray-400 text-sm'>No appointments scheduled for today</div>
                            )}
                        </div>

                        {/* Pending Approvals */}
                        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                            <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center gap-2'>
                                <span>⏳</span> Pending Request Approvals ({pending_approvals.length})
                            </h3>
                            {pending_approvals.length > 0 ? (
                                <div className='space-y-3'>
                                    {pending_approvals.map(apt => (
                                        <div key={apt.id} className='p-4 bg-yellow-50/50 rounded-xl border border-yellow-100'>
                                            <div className='flex justify-between items-start mb-2'>
                                                <div>
                                                    <p className='font-bold text-gray-800'>{apt.user?.name || 'Patient'}</p>
                                                    <p className='text-xs text-gray-500 mt-0.5'>
                                                        📅 {new Date(apt.appointment_date).toLocaleString()}
                                                    </p>
                                                </div>
                                                <span className='bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full'>
                                                    Pending
                                                </span>
                                            </div>
                                            {apt.notes && <p className='text-xs text-gray-600 bg-white p-2 rounded border border-gray-100 mb-3'>"{apt.notes}"</p>}
                                            <div className='flex gap-2'>
                                                <button
                                                    onClick={() => handleAcceptAppointment(apt.id)}
                                                    className='flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-lg transition'
                                                >
                                                    ✓ Accept
                                                </button>
                                                <button
                                                    onClick={() => setRejectModal(apt.id)}
                                                    className='flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg transition'
                                                >
                                                    ✕ Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='text-center py-8 text-gray-400 text-sm'>No pending approval requests</div>
                            )}
                        </div>
                    </div>

                    {/* Week Schedule */}
                    <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                        <h3 className='text-lg font-bold text-gray-900 mb-4'>This Week's Schedule</h3>
                        {week_appointments.length > 0 ? (
                            <div className='overflow-x-auto'>
                                <table className='w-full text-sm'>
                                    <thead className='bg-gray-50'>
                                        <tr>
                                            <th className='px-4 py-3 text-left font-semibold text-gray-600'>Patient</th>
                                            <th className='px-4 py-3 text-left font-semibold text-gray-600'>Date & Time</th>
                                            <th className='px-4 py-3 text-left font-semibold text-gray-600'>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {week_appointments.map(apt => (
                                            <tr key={apt.id} className='border-t border-gray-50 hover:bg-gray-50/50 transition'>
                                                <td className='px-4 py-3 font-medium text-gray-800'>{apt.user?.name || 'N/A'}</td>
                                                <td className='px-4 py-3 text-gray-600'>{new Date(apt.appointment_date).toLocaleString()}</td>
                                                <td className='px-4 py-3'>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : apt.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className='text-center py-8 text-gray-400 text-sm'>No appointments scheduled for this week</div>
                        )}
                    </div>
                </div>
            )}

            {/* All Appointments Tab */}
            {activeTab === 'appointments' && (
                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                    <h3 className='text-xl font-bold text-gray-900 mb-6'>All Patient Appointments</h3>
                    {appointments.length > 0 ? (
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        <th className='px-4 py-3 text-left font-semibold text-gray-600'>Patient Name</th>
                                        <th className='px-4 py-3 text-left font-semibold text-gray-600'>Date & Time</th>
                                        <th className='px-4 py-3 text-left font-semibold text-gray-600'>Status</th>
                                        <th className='px-4 py-3 text-left font-semibold text-gray-600'>Approval</th>
                                        <th className='px-4 py-3 text-left font-semibold text-gray-600'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map(apt => (
                                        <tr key={apt.id} className='border-t border-gray-50 hover:bg-gray-50/50 transition'>
                                            <td className='px-4 py-3 font-medium text-gray-800'>{apt.user?.name || 'N/A'}</td>
                                            <td className='px-4 py-3 text-gray-600'>{new Date(apt.appointment_date).toLocaleString()}</td>
                                            <td className='px-4 py-3'>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : apt.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {apt.status?.charAt(0).toUpperCase() + apt.status?.slice(1)}
                                                </span>
                                            </td>
                                            <td className='px-4 py-3'>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${apt.acceptance_status === 'accepted' ? 'bg-green-100 text-green-800' : apt.acceptance_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {apt.acceptance_status?.charAt(0).toUpperCase() + apt.acceptance_status?.slice(1)}
                                                </span>
                                            </td>
                                            <td className='px-4 py-3 flex gap-2 flex-wrap'>
                                                {apt.user && (
                                                    <button
                                                        onClick={() => setChatPartner(apt.user)}
                                                        className='px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition'
                                                    >
                                                        💬 Chat
                                                    </button>
                                                )}
                                                {apt.attached_report_ids && apt.attached_report_ids.length > 0 && (
                                                    <button
                                                        onClick={() => handleFetchAttachedReports(apt.id, apt.user?.name)}
                                                        className='px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition'
                                                    >
                                                        📁 View Reports ({apt.attached_report_ids.length})
                                                    </button>
                                                )}
                                                {apt.acceptance_status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAcceptAppointment(apt.id)}
                                                            className='px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium'
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectModal(apt.id)}
                                                            className='px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium'
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {apt.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => setCompleteModal(apt.id)}
                                                        className='px-3 py-1 bg-primary hover:bg-blue-700 text-white rounded-lg text-xs font-medium'
                                                    >
                                                        Complete Consultation
                                                    </button>
                                                )}
                                                {/* Payment Verification */}
                                                {apt.payment_verification_status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleVerifyPayment(apt.id, 'verify')}
                                                            className='px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1'
                                                        >
                                                            ✅ Verify Payment
                                                        </button>
                                                        <button
                                                            onClick={() => handleVerifyPayment(apt.id, 'reject', 'Payment proof invalid')}
                                                            className='px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-medium flex items-center gap-1'
                                                        >
                                                            ❌ Reject
                                                        </button>
                                                    </>
                                                )}
                                                {apt.payment_status === 'paid' && (
                                                    <span className='px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-medium'>
                                                        💰 Paid
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className='text-center py-12 text-gray-400'>No appointments found</div>
                    )}
                </div>
            )}

            {/* Availability Tab */}
            {activeTab === 'availability' && (
                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-3xl'>
                    <div className='flex justify-between items-center mb-6'>
                        <h3 className='text-xl font-bold text-gray-900'>Manage Working Hours & Availability</h3>
                        {!editingAvailability && (
                            <button
                                onClick={() => setEditingAvailability(true)}
                                className='bg-primary text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition'
                            >
                                ✏️ Edit Availability
                            </button>
                        )}
                    </div>

                    {editingAvailability ? (
                        <div className='space-y-6'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Available From</label>
                                    <input
                                        type='time'
                                        value={formData.available_from_time}
                                        onChange={(e) => setFormData({ ...formData, available_from_time: e.target.value })}
                                        className='w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Available To</label>
                                    <input
                                        type='time'
                                        value={formData.available_to_time}
                                        onChange={(e) => setFormData({ ...formData, available_to_time: e.target.value })}
                                        className='w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'
                                    />
                                </div>
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Break Start (Optional)</label>
                                    <input
                                        type='time'
                                        value={formData.break_start_time || ''}
                                        onChange={(e) => setFormData({ ...formData, break_start_time: e.target.value })}
                                        className='w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Break End (Optional)</label>
                                    <input
                                        type='time'
                                        value={formData.break_end_time || ''}
                                        onChange={(e) => setFormData({ ...formData, break_end_time: e.target.value })}
                                        className='w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Slot Duration</label>
                                <select
                                    value={formData.slot_duration}
                                    onChange={(e) => setFormData({ ...formData, slot_duration: parseInt(e.target.value) })}
                                    className='w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white'
                                >
                                    <option value={15}>15 minutes</option>
                                    <option value={30}>30 minutes</option>
                                    <option value={45}>45 minutes</option>
                                    <option value={60}>60 minutes</option>
                                </select>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-3'>Available Days</label>
                                <div className='grid grid-cols-7 gap-2'>
                                    {dayNames.map((day, index) => {
                                        const isSelected = Array.isArray(formData.available_days) && formData.available_days.includes(index)
                                        return (
                                            <button
                                                key={index}
                                                type='button'
                                                onClick={() => toggleDayAvailability(index)}
                                                className={`px-3 py-2.5 rounded-xl text-center text-xs font-semibold transition ${isSelected ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                {day.substring(0, 3)}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className='flex gap-3 pt-2'>
                                <button
                                    onClick={handleSaveAvailability}
                                    className='bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition'
                                >
                                    Save Schedule
                                </button>
                                <button
                                    onClick={() => { setEditingAvailability(false); setFormData(availability) }}
                                    className='bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200 transition'
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className='space-y-5'>
                            <div className='grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl'>
                                <div>
                                    <p className='text-xs text-gray-400 font-medium mb-1'>Available Hours</p>
                                    <p className='text-gray-900 font-bold'>{formData.available_from_time} – {formData.available_to_time}</p>
                                </div>
                                <div>
                                    <p className='text-xs text-gray-400 font-medium mb-1'>Slot Duration</p>
                                    <p className='text-gray-900 font-bold'>{formData.slot_duration} mins per visit</p>
                                </div>
                            </div>

                            {formData.break_start_time && (
                                <div className='p-4 bg-gray-50 rounded-xl'>
                                    <p className='text-xs text-gray-400 font-medium mb-1'>Break Time</p>
                                    <p className='text-gray-900 font-bold'>{formData.break_start_time} – {formData.break_end_time}</p>
                                </div>
                            )}

                            <div>
                                <p className='text-xs text-gray-400 font-medium mb-2'>Active Working Days</p>
                                <div className='flex flex-wrap gap-2'>
                                    {dayNames.map((day, index) => (
                                        Array.isArray(formData.available_days) && formData.available_days.includes(index) && (
                                            <span key={index} className='bg-blue-100 text-primary px-3 py-1 rounded-full text-xs font-semibold'>
                                                ✓ {day}
                                            </span>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                    <div className='flex justify-between items-center mb-6'>
                        <div>
                            <h3 className='text-xl font-bold text-gray-900'>Patient Reviews & Ratings</h3>
                            <p className='text-xs text-gray-500 mt-1'>Feedback submitted by patients after completed consultations</p>
                        </div>
                        {doctorReviews?.statistics && (
                            <div className='bg-blue-50 px-4 py-2 rounded-xl text-center border border-blue-100'>
                                <p className='text-xs text-gray-500 font-medium'>Overall Rating</p>
                                <p className='text-2xl font-bold text-amber-500'>⭐ {doctorReviews.statistics.average_rating} / 5.0</p>
                            </div>
                        )}
                    </div>

                    {doctorReviews?.data?.data?.length > 0 ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {doctorReviews.data.data.map(review => (
                                <div key={review.id} className='p-4 bg-gray-50/60 rounded-xl border border-gray-100'>
                                    <div className='flex justify-between items-start mb-2'>
                                        <div>
                                            <p className='font-bold text-gray-800 text-sm'>{review.patient?.name || 'Patient'}</p>
                                            <div className='text-amber-400 text-xs mt-0.5'>
                                                {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                                            </div>
                                        </div>
                                        <span className='text-[10px] text-gray-400'>{new Date(review.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {review.review && <p className='text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-100 mt-2'>"{review.review}"</p>}
                                    {review.would_recommend && (
                                        <p className='text-[10px] text-green-600 font-semibold mt-2'>👍 Recommends this doctor</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='text-center py-12 text-gray-400 text-sm'>No patient reviews recorded yet.</div>
                    )}
                </div>
            )}

            {/* Complete Consultation Modal */}
            {completeModal && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm'>
                    <div className='bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl'>
                        <h3 className='text-xl font-bold text-gray-900 mb-4'>Complete Consultation</h3>
                        <form onSubmit={handleCompleteSubmit}>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Consultation & Medical Notes *</label>
                                <textarea
                                    value={consultationNotes}
                                    onChange={(e) => setConsultationNotes(e.target.value)}
                                    required
                                    rows='4'
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none'
                                    placeholder='Enter diagnosis, treatment plan, and prescription details...'
                                ></textarea>
                            </div>
                            <div className='flex gap-3'>
                                <button type='submit' className='flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-sm transition'>
                                    Complete Visit
                                </button>
                                <button type='button' onClick={() => setCompleteModal(null)} className='flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 transition'>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm'>
                    <div className='bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl'>
                        <h3 className='text-xl font-bold text-gray-900 mb-4'>Reject Appointment</h3>
                        <form onSubmit={handleRejectSubmit}>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Reason for Rejection *</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    required
                                    rows='3'
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none'
                                    placeholder='State reason for rejecting this appointment...'
                                ></textarea>
                            </div>
                            <div className='flex gap-3'>
                                <button type='submit' className='flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold text-sm transition'>
                                    Reject Request
                                </button>
                                <button type='button' onClick={() => setRejectModal(null)} className='flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 transition'>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Patient Attached Reports Modal */}
            {reportsModal && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm'>
                    <div className='bg-white rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl'>
                        <div className='flex justify-between items-center mb-5 pb-3 border-b border-gray-100'>
                            <div>
                                <h3 className='text-xl font-bold text-gray-900'>📂 Patient Medical Reports</h3>
                                <p className='text-xs text-gray-500 mt-0.5'>Uploaded by: <span className='font-semibold text-gray-800'>{reportsModal.patientName}</span></p>
                            </div>
                            <button onClick={() => setReportsModal(null)} className='text-gray-400 hover:text-gray-600 text-xl font-bold'>✕</button>
                        </div>

                        {reportsModalLoading ? (
                            <div className='py-8 text-center text-gray-400 text-sm'>Loading medical reports...</div>
                        ) : patientReports.length > 0 ? (
                            <div className='space-y-3'>
                                {patientReports.map(report => (
                                    <div key={report.id} className='p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start justify-between gap-3'>
                                        <div>
                                            <p className='font-bold text-gray-800 text-sm'>{report.title}</p>
                                            <span className='inline-block bg-blue-100 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded mt-1'>
                                                {report.report_type?.replace('_', ' ')}
                                            </span>
                                            {report.description && <p className='text-xs text-gray-600 mt-1 bg-white p-2 rounded border border-gray-100'>"{report.description}"</p>}
                                            <p className='text-[11px] text-gray-400 mt-1'>Report Date: {report.report_date || new Date(report.created_at).toLocaleDateString()}</p>
                                        </div>
                                        {report.file_url ? (
                                            <a
                                                href={report.file_url}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-1 flex-shrink-0'
                                            >
                                                👁️ View
                                            </a>
                                        ) : (
                                            <span className='text-xs text-gray-400 italic'>No file attached</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='py-8 text-center text-gray-400 text-sm'>No medical reports attached to this appointment.</div>
                        )}

                        <div className='mt-6 pt-3 border-t border-gray-100 text-right'>
                            <button onClick={() => setReportsModal(null)} className='bg-gray-100 text-gray-700 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition'>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Modal */}
            <ChatModal
                isOpen={!!chatPartner}
                onClose={() => setChatPartner(null)}
                initialPartner={chatPartner}
            />
        </div>
    )
}

export default DoctorDashboard
