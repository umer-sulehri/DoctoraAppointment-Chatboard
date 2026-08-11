import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { API } from '../services/api'
import ChatModal from '../components/ChatModal'
import PaymentModal from '../components/PaymentModal'

const StarRating = ({ rating, onRate }) => {
    const [hover, setHover] = useState(0)
    return (
        <div className='flex gap-1'>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => onRate(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className='text-2xl transition-transform hover:scale-125'
                >
                    {star <= (hover || rating) ? '⭐' : '☆'}
                </button>
            ))}
        </div>
    )
}

const MyAppointments = () => {
    const navigate = useNavigate()
    const { appointments, fetchMyAppointments, loading, currencySymbol, isAuthenticated } = useContext(AppContext)
    const [notesModal, setNotesModal] = useState(null)
    const [ratingModal, setRatingModal] = useState(null)
    const [ratingData, setRatingData] = useState({ rating: 0, review: '' })
    const [ratingLoading, setRatingLoading] = useState(false)
    const [rescheduleModal, setRescheduleModal] = useState(null)
    const [newDate, setNewDate] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [chatPartner, setChatPartner] = useState(null)
    const [paymentModal, setPaymentModal] = useState(null)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        fetchMyAppointments()
    }, [isAuthenticated, navigate])

    const handleCancelAppointment = async (appointmentId) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                await API.cancelAppointment(appointmentId, 'User requested cancellation')
                toast.success('Appointment cancelled successfully')
                fetchMyAppointments()
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to cancel appointment')
            }
        }
    }

    const handleReschedule = async (e) => {
        e.preventDefault()
        if (!newDate) return
        try {
            await API.rescheduleAppointment(rescheduleModal, newDate)
            toast.success('Appointment rescheduled successfully')
            fetchMyAppointments()
            setRescheduleModal(null)
            setNewDate('')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reschedule appointment')
        }
    }

    const handleSubmitRating = async (e) => {
        e.preventDefault()
        if (ratingData.rating === 0) {
            toast.error('Please select a star rating')
            return
        }
        try {
            setRatingLoading(true)
            await API.rateDoctor({
                appointment_id: ratingModal.id,
                doctor_id: ratingModal.doctor?.id,
                rating: ratingData.rating,
                review: ratingData.review
            })
            toast.success('Thank you for your review!')
            setRatingModal(null)
            setRatingData({ rating: 0, review: '' })
            fetchMyAppointments()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit rating')
        } finally {
            setRatingLoading(false)
        }
    }

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    }

    const filteredAppointments = appointments
        ? (filterStatus === 'all' ? appointments : appointments.filter(a => a.status === filterStatus))
        : []

    if (loading) {
        return (
            <div className='py-8'>
                <h1 className='text-3xl font-bold mb-8'>My Appointments</h1>
                <div className='space-y-4'>
                    {[1, 2, 3].map(i => (
                        <div key={i} className='border border-gray-200 rounded-2xl p-6 animate-pulse'>
                            <div className='h-4 bg-gray-200 rounded w-1/3 mb-4'></div>
                            <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className='py-8'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
                <div>
                    <h1 className='text-3xl font-bold text-gray-800'>My Appointments</h1>
                    <p className='text-gray-500 mt-1'>{appointments?.length || 0} total appointments</p>
                </div>
                <button
                    onClick={() => navigate('/doctors')}
                    className='bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition text-sm'
                >
                    + Book New Appointment
                </button>
            </div>

            {/* Filter Tabs */}
            <div className='flex gap-2 mb-6 overflow-x-auto'>
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition ${filterStatus === status
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {status}
                        {status === 'all' && appointments ? ` (${appointments.length})` : ''}
                        {status !== 'all' && appointments ? ` (${appointments.filter(a => a.status === status).length})` : ''}
                    </button>
                ))}
            </div>

            {filteredAppointments && filteredAppointments.length > 0 ? (
                <div className='space-y-4'>
                    {filteredAppointments.map((appointment) => (
                        <div key={appointment.id} className='border border-gray-100 rounded-2xl p-6 bg-white hover:shadow-md transition-shadow'>
                            <div className='flex flex-col md:flex-row md:items-start gap-4'>
                                {/* Doctor Info */}
                                <div className='flex items-center gap-4 flex-1'>
                                    <div className='w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0'>
                                        {appointment.doctor?.user?.name?.charAt(0) || 'D'}
                                    </div>
                                    <div>
                                        <p className='font-bold text-gray-900 text-lg'>{appointment.doctor?.user?.name || 'Doctor'}</p>
                                        <p className='text-gray-500 text-sm'>{appointment.doctor?.specialty?.name || 'Specialist'}</p>
                                        <div className='flex items-center gap-3 mt-1'>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[appointment.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                                            </span>
                                            {appointment.acceptance_status && appointment.acceptance_status !== 'pending' && (
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${appointment.acceptance_status === 'accepted' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    {appointment.acceptance_status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Appointment Details */}
                                <div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-sm flex-1'>
                                    <div>
                                        <p className='text-gray-400 text-xs mb-1'>📅 Date & Time</p>
                                        <p className='font-medium text-gray-800'>
                                            {new Date(appointment.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </p>
                                        <p className='text-gray-500 text-xs'>
                                            {new Date(appointment.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-gray-400 text-xs mb-1'>💰 Fee</p>
                                        <p className='font-bold text-primary'>{currencySymbol}{appointment.amount}</p>
                                        <p className={`text-xs ${appointment.payment_status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                                            {appointment.payment_status === 'paid' ? '✓ Paid'
                                                : appointment.payment_verification_status === 'pending' ? '⏳ Pending Verification'
                                                : appointment.payment_verification_status === 'rejected' ? '❌ Payment Rejected'
                                                : 'Unpaid'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Notes from patient */}
                            {appointment.notes && (
                                <div className='mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-100'>
                                    <p className='text-xs text-gray-500 mb-1 font-medium'>📝 Your Notes</p>
                                    <p className='text-sm text-gray-700'>{appointment.notes}</p>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {appointment.acceptance_status === 'rejected' && appointment.rejection_reason && (
                                <div className='mt-4 p-3 bg-red-50 rounded-xl border border-red-100'>
                                    <p className='text-xs text-red-500 mb-1 font-medium'>❌ Rejection Reason</p>
                                    <p className='text-sm text-red-700'>{appointment.rejection_reason}</p>
                                </div>
                            )}

                            {/* Consultation Notes from Doctor */}
                            {appointment.status === 'completed' && appointment.consultation_notes && (
                                <div className='mt-4 p-3 bg-green-50 rounded-xl border border-green-100'>
                                    <p className='text-xs text-green-600 mb-1 font-medium'>🩺 Doctor's Consultation Notes</p>
                                    <p className='text-sm text-gray-700 line-clamp-2'>{appointment.consultation_notes}</p>
                                    <button
                                        onClick={() => setNotesModal(appointment)}
                                        className='text-primary text-xs font-medium mt-1 hover:underline'
                                    >
                                        Read more →
                                    </button>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className='flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100'>
                                {appointment.doctor?.user && (
                                    <button
                                        onClick={() => setChatPartner(appointment.doctor.user)}
                                        className='px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium text-sm transition flex items-center gap-1'
                                    >
                                        💬 Chat with Doctor
                                    </button>
                                )}
                                {/* Pay Now Button – show if doctor accepts online payment and payment is not submitted */}
                                {appointment.doctor?.accepts_online_payment &&
                                    appointment.payment_status !== 'paid' &&
                                    appointment.payment_verification_status !== 'pending' &&
                                    (appointment.status === 'pending' || appointment.status === 'confirmed') && (
                                    <button
                                        onClick={() => setPaymentModal(appointment)}
                                        className='px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-1'
                                        style={{ background: 'linear-gradient(135deg,#6c63ff,#4ecdc4)', color: '#fff' }}
                                    >
                                        💳 Pay Now
                                    </button>
                                )}
                                {appointment.payment_verification_status === 'pending' && (
                                    <span className='px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg text-xs font-medium'>
                                        ⏳ Payment Under Review
                                    </span>
                                )}
                                {appointment.payment_status === 'paid' && (
                                    <span className='px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg text-xs font-medium'>
                                        ✅ Payment Verified
                                    </span>
                                )}
                                {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                                    <>
                                        <button
                                            onClick={() => setRescheduleModal(appointment.id)}
                                            className='px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium text-sm transition flex items-center gap-1'
                                        >
                                            📅 Reschedule
                                        </button>
                                        <button
                                            onClick={() => handleCancelAppointment(appointment.id)}
                                            className='px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm transition flex items-center gap-1'
                                        >
                                            ✕ Cancel
                                        </button>
                                    </>
                                )}
                                {appointment.status === 'completed' && (
                                    <>
                                        {appointment.consultation_notes && (
                                            <button
                                                onClick={() => setNotesModal(appointment)}
                                                className='px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium text-sm transition flex items-center gap-1'
                                            >
                                                📋 View Notes
                                            </button>
                                        )}
                                        {!appointment.user_rating && (
                                            <button
                                                onClick={() => { setRatingModal(appointment); setRatingData({ rating: 0, review: '' }) }}
                                                className='px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg font-medium text-sm transition flex items-center gap-1'
                                            >
                                                ⭐ Rate Doctor
                                            </button>
                                        )}
                                        {appointment.user_rating && (
                                            <span className='px-4 py-2 bg-gray-50 text-gray-500 rounded-lg text-sm flex items-center gap-1'>
                                                ⭐ Rated {appointment.user_rating}/5
                                            </span>
                                        )}
                                        <button
                                            onClick={() => navigate(`/appointment/${appointment.doctor?.id}`)}
                                            className='px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-medium text-sm transition'
                                        >
                                            Book Again
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='text-center py-16 bg-gray-50 rounded-2xl'>
                    <div className='text-6xl mb-4'>📅</div>
                    <p className='text-gray-700 text-xl font-semibold mb-2'>
                        {filterStatus === 'all' ? 'No appointments yet' : `No ${filterStatus} appointments`}
                    </p>
                    <p className='text-gray-400 mb-6'>
                        {filterStatus === 'all' ? 'Book an appointment with a trusted doctor to get started.' : 'Try a different filter.'}
                    </p>
                    <button
                        onClick={() => navigate('/doctors')}
                        className='bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition'
                    >
                        Browse Doctors
                    </button>
                </div>
            )}

            {/* Notes Modal */}
            {notesModal && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl'>
                        <div className='flex justify-between items-start mb-4'>
                            <div>
                                <h3 className='text-xl font-bold text-gray-900'>Consultation Notes</h3>
                                <p className='text-sm text-gray-500'>From Dr. {notesModal.doctor?.user?.name}</p>
                            </div>
                            <button onClick={() => setNotesModal(null)} className='text-gray-400 hover:text-gray-600 text-2xl'>×</button>
                        </div>
                        <div className='bg-green-50 rounded-xl p-4'>
                            <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>{notesModal.consultation_notes}</p>
                        </div>
                        <div className='flex justify-between items-center mt-4 text-sm text-gray-500'>
                            <span>📅 {new Date(notesModal.appointment_date).toLocaleDateString()}</span>
                            <button
                                onClick={() => setNotesModal(null)}
                                className='bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition'
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {ratingModal && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-2xl p-6 max-w-md w-full shadow-xl'>
                        <div className='flex justify-between items-start mb-4'>
                            <h3 className='text-xl font-bold text-gray-900'>Rate Your Doctor</h3>
                            <button onClick={() => setRatingModal(null)} className='text-gray-400 hover:text-gray-600 text-2xl'>×</button>
                        </div>

                        <div className='text-center mb-5'>
                            <div className='w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-2 font-bold text-primary'>
                                {ratingModal.doctor?.user?.name?.charAt(0)}
                            </div>
                            <p className='font-semibold text-gray-800'>Dr. {ratingModal.doctor?.user?.name}</p>
                            <p className='text-sm text-gray-500'>{ratingModal.doctor?.specialty?.name}</p>
                        </div>

                        <form onSubmit={handleSubmitRating}>
                            <div className='mb-4 text-center'>
                                <p className='text-sm font-medium text-gray-700 mb-3'>How was your experience?</p>
                                <StarRating rating={ratingData.rating} onRate={(r) => setRatingData(prev => ({ ...prev, rating: r }))} />
                                {ratingData.rating > 0 && (
                                    <p className='text-xs text-gray-500 mt-1'>
                                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][ratingData.rating]}
                                    </p>
                                )}
                            </div>

                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>Write a review (optional)</label>
                                <textarea
                                    value={ratingData.review}
                                    onChange={(e) => setRatingData(prev => ({ ...prev, review: e.target.value }))}
                                    placeholder='Share your experience with other patients...'
                                    rows='3'
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-sm'
                                ></textarea>
                            </div>

                            <div className='flex gap-3'>
                                <button
                                    type='submit'
                                    disabled={ratingLoading || ratingData.rating === 0}
                                    className='flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60'
                                >
                                    {ratingLoading ? 'Submitting...' : 'Submit Rating'}
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setRatingModal(null)}
                                    className='flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition'
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {rescheduleModal && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-2xl p-6 max-w-md w-full shadow-xl'>
                        <div className='flex justify-between items-start mb-4'>
                            <h3 className='text-xl font-bold text-gray-900'>Reschedule Appointment</h3>
                            <button onClick={() => setRescheduleModal(null)} className='text-gray-400 hover:text-gray-600 text-2xl'>×</button>
                        </div>

                        <form onSubmit={handleReschedule}>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>New Date & Time</label>
                                <input
                                    type='datetime-local'
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    required
                                    min={new Date().toISOString().slice(0, 16)}
                                    className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30'
                                />
                            </div>
                            <div className='flex gap-3'>
                                <button
                                    type='submit'
                                    className='flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition'
                                >
                                    Reschedule
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setRescheduleModal(null)}
                                    className='flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition'
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Chat Modal */}
            <ChatModal
                isOpen={!!chatPartner}
                onClose={() => setChatPartner(null)}
                initialPartner={chatPartner}
            />

            {/* Payment Modal */}
            <PaymentModal
                isOpen={!!paymentModal}
                onClose={() => setPaymentModal(null)}
                appointment={paymentModal}
                onPaymentSubmitted={fetchMyAppointments}
            />
        </div>
    )
}

export default MyAppointments