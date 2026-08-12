import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import { API } from '../services/api'
import { toast } from 'react-toastify'
import RelatedDoctors from '../components/RelatedDoctors'
import ChatModal from '../components/ChatModal'

const Appointment = () => {
  const { docId } = useParams()
  const navigate = useNavigate()
  const { currencySymbol, isAuthenticated, bookAppointment, fetchMyAppointments, user } = useContext(AppContext)

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const [docInfo, setDocInfo] = useState(null)
  const [availableDates, setAvailableDates] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // Medical reports
  const [myReports, setMyReports] = useState([])
  const [selectedReportIds, setSelectedReportIds] = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)

  // Ratings
  const [ratingsData, setRatingsData] = useState(null)
  const [chatPartner, setChatPartner] = useState(null)

  useEffect(() => {
    fetchDoctorInfo()
    fetchDoctorRatings()
  }, [docId])

  const fetchDoctorRatings = async () => {
    try {
      const res = await API.getDoctorRatings(docId)
      setRatingsData(res.data)
    } catch (e) {
      console.error('Failed to fetch doctor ratings:', e)
    }
  }

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots()
    }
  }, [selectedDate])

  useEffect(() => {
    // Fetch patient's medical reports if logged in as patient
    if (isAuthenticated && user?.role === 'user') {
      fetchMyReports()
    }
  }, [isAuthenticated, user])

  const fetchDoctorInfo = async () => {
    try {
      const response = await API.getDoctorById(docId)
      setDocInfo(response.data.doctor)

      const dates = []
      for (let i = 0; i < 7; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        dates.push(date)
      }
      setAvailableDates(dates)
      if (dates.length > 0) {
        setSelectedDate(dates[0])
      }
    } catch (error) {
      toast.error('Failed to load doctor information')
      navigate('/doctors')
    }
  }

  const fetchAvailableSlots = async () => {
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0]
      const response = await API.getAvailableSlots(docId, formattedDate)
      setAvailableSlots(response.data.slots || [])
      setSelectedTime(null)
    } catch (error) {
      toast.error('Failed to load available slots')
    }
  }

  const fetchMyReports = async () => {
    try {
      setReportsLoading(true)
      const res = await API.getMyReports()
      setMyReports(res.data.reports || [])
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setReportsLoading(false)
    }
  }

  const toggleReportSelection = (reportId) => {
    setSelectedReportIds(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    )
  }

  const handleBookAppointment = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book an appointment')
      navigate('/login')
      return
    }

    if (!selectedTime) {
      toast.error('Please select a time slot')
      return
    }

    try {
      setLoading(true)
      const appointmentDateTime = `${selectedDate.toISOString().split('T')[0]} ${selectedTime}`

      await bookAppointment({
        doctor_id: docId,
        appointment_date: appointmentDateTime,
        notes: notes,
        attached_report_ids: selectedReportIds,
      })

      toast.success('Appointment booked successfully!')
      fetchMyAppointments()
      navigate('/my-appontments')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  const reportTypeIcon = (type) => {
    const icons = { lab_test: '🧪', prescription: '💊', diagnosis: '📋', imaging: '🔬', general: '📄', other: '📁' }
    return icons[type] || '📄'
  }

  if (!docInfo) {
    return (
      <div className='py-16 flex flex-col items-center justify-center gap-3 text-gray-400'>
        <div className='w-10 h-10 border-4 border-blue-200 border-t-primary rounded-full animate-spin'></div>
        <p>Loading doctor information...</p>
      </div>
    )
  }

  return (
    <div className='py-8 max-w-5xl mx-auto'>
      {/* Doctor Details Card */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-8'>
        <div className='md:col-span-1'>
          <div className='rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100'>
            <img
              className='w-full h-64 object-cover'
              src={docInfo.user?.profile_image || assets.doc1}
              alt={docInfo.user?.name}
            />
          </div>
        </div>

        <div className='md:col-span-2 border border-gray-100 rounded-2xl p-8 bg-white shadow-sm'>
          <p className='text-3xl font-bold text-gray-900 flex items-center gap-2'>
            {docInfo.user?.name}
            <img className='w-5' src={assets.verified_icon} alt='' />
          </p>

          <div className='flex flex-wrap items-center gap-2 mt-2'>
            <span className='bg-blue-100 text-primary px-3 py-1 rounded-full text-xs font-semibold'>{docInfo.specialty?.name}</span>
            <span className='text-gray-400 text-sm'>• {docInfo.years_of_experience} yrs experience</span>
          </div>

          {docInfo.qualifications && (
            <p className='text-sm text-gray-500 mt-3'>
              <strong className='text-gray-700'>Qualifications:</strong> {docInfo.qualifications}
            </p>
          )}

          {docInfo.user?.bio && (
            <div className='mt-4'>
              <p className='text-sm font-semibold text-gray-700 flex items-center gap-1'>
                About <img src={assets.info_icon} alt='' className='w-4' />
              </p>
              <p className='text-sm text-gray-600 mt-1 leading-relaxed'>{docInfo.user.bio}</p>
            </div>
          )}

          <div className='mt-5 p-4 bg-blue-50 rounded-xl flex items-center justify-between gap-4'>
            <div>
              <p className='text-xs text-gray-500 font-medium'>Consultation Fee</p>
              <p className='text-2xl font-bold text-primary'>{currencySymbol}{docInfo.consultation_fee}</p>
            </div>
            {ratingsData?.statistics && (
              <div className='text-center border-x border-blue-200 px-4'>
                <p className='text-xs text-gray-500 font-medium'>Rating</p>
                <p className='text-xl font-bold text-amber-500'>⭐ {ratingsData.statistics.average_rating} <span className='text-xs text-gray-400'>({ratingsData.statistics.total_ratings})</span></p>
              </div>
            )}
            <div className='flex items-center gap-2'>
              {isAuthenticated && user?.role === 'user' && docInfo.user && (
                <button
                  onClick={() => setChatPartner(docInfo.user)}
                  className='bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold text-xs transition flex items-center gap-1 shadow-xs'
                >
                  💬 Chat Direct
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <div className='bg-white border border-gray-100 rounded-2xl p-8 shadow-sm mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-6'>📅 Book an Appointment</h2>

        {/* Date Selection */}
        <div className='mb-8'>
          <p className='text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4'>Select Date</p>
          <div className='flex gap-3 overflow-x-auto pb-2'>
            {availableDates.map((date, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 text-center py-4 px-5 rounded-xl font-medium transition ${selectedDate && selectedDate.toDateString() === date.toDateString()
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-100'
                  }`}
              >
                <p className='text-xs mb-1 font-semibold opacity-70'>{daysOfWeek[date.getDay()]}</p>
                <p className='text-xl font-bold'>{date.getDate()}</p>
                <p className='text-xs opacity-70 mt-1'>{date.toLocaleString('default', { month: 'short' })}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slot Selection */}
        <div className='mb-8'>
          <p className='text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4'>Select Time Slot</p>
          <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3'>
            {availableSlots.length > 0 ? (
              availableSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className={`py-3 px-4 border-2 rounded-xl text-sm font-medium transition ${!slot.available
                      ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                      : selectedTime === slot.time
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-gray-800 border-gray-200 hover:border-primary hover:text-primary'
                    }`}
                >
                  {slot.time}
                </button>
              ))
            ) : (
              <p className='text-gray-400 col-span-full text-sm'>No available slots for this date</p>
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div className='mb-8'>
          <p className='text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4'>Appointment Notes (Optional)</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder='Describe your symptoms, concerns, or any relevant information for the doctor...'
            className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none'
            rows='3'
          />
        </div>

        {/* Medical Reports Attachment */}
        {isAuthenticated && user?.role === 'user' && (
          <div className='mb-8'>
            <div className='flex justify-between items-center mb-4'>
              <div>
                <p className='text-sm font-semibold text-gray-500 uppercase tracking-wider'>Attach Medical Reports (Optional)</p>
                <p className='text-xs text-gray-400 mt-0.5'>Doctor will see these reports when reviewing your appointment</p>
              </div>
              <button
                type='button'
                onClick={() => navigate('/user-dashboard')}
                className='text-xs text-primary hover:underline font-medium'
              >
                Upload new →
              </button>
            </div>

            {reportsLoading ? (
              <div className='text-sm text-gray-400 py-4 text-center'>Loading your reports...</div>
            ) : myReports.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {myReports.map(report => {
                  const isSelected = selectedReportIds.includes(report.id)
                  return (
                    <button
                      key={report.id}
                      type='button'
                      onClick={() => toggleReportSelection(report.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition ${isSelected
                          ? 'border-primary bg-blue-50 shadow-sm'
                          : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                        }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${isSelected ? 'bg-blue-100' : 'bg-white'}`}>
                        {reportTypeIcon(report.report_type)}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                          {report.title}
                        </p>
                        <p className='text-xs text-gray-400 capitalize'>{report.report_type?.replace('_', ' ')} • {new Date(report.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                        {isSelected && <span className='text-white text-xs font-bold'>✓</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className='bg-gray-50 rounded-xl p-4 flex items-center gap-3 border border-gray-100'>
                <span className='text-2xl'>📂</span>
                <div>
                  <p className='text-sm font-medium text-gray-700'>No medical reports uploaded yet</p>
                  <p className='text-xs text-gray-400'>
                    You can upload reports from your{' '}
                    <button onClick={() => navigate('/user-dashboard')} className='text-primary font-medium hover:underline'>
                      Patient Dashboard
                    </button>
                  </p>
                </div>
              </div>
            )}

            {selectedReportIds.length > 0 && (
              <p className='text-xs text-primary font-medium mt-2'>
                ✓ {selectedReportIds.length} report{selectedReportIds.length > 1 ? 's' : ''} selected to attach
              </p>
            )}
          </div>
        )}

        {/* Booking Summary */}
        {selectedTime && (
          <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-6'>
            <h3 className='font-bold text-gray-800 mb-3 flex items-center gap-2'>📋 Appointment Summary</h3>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div className='text-gray-500'>Doctor</div>
              <div className='font-semibold text-gray-800'>{docInfo.user?.name}</div>
              <div className='text-gray-500'>Specialty</div>
              <div className='font-semibold text-gray-800'>{docInfo.specialty?.name}</div>
              <div className='text-gray-500'>Date & Time</div>
              <div className='font-semibold text-gray-800'>{selectedDate?.toLocaleDateString()} at {selectedTime}</div>
              <div className='text-gray-500'>Consultation Fee</div>
              <div className='font-bold text-primary'>{currencySymbol}{docInfo.consultation_fee}</div>
              {selectedReportIds.length > 0 && (
                <>
                  <div className='text-gray-500'>Attached Reports</div>
                  <div className='font-semibold text-green-700'>{selectedReportIds.length} report(s)</div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Book Button */}
        <button
          onClick={handleBookAppointment}
          disabled={!selectedTime || loading}
          className={`w-full py-4 rounded-xl font-bold text-white text-lg transition ${!selectedTime || loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200'
            }`}
        >
          {loading ? '⏳ Booking...' : '✓ Confirm Appointment Booking'}
        </button>
      </div>

      {/* Patient Reviews & Star Rating Section */}
      {ratingsData && (
        <div className='bg-white border border-gray-100 rounded-2xl p-8 shadow-sm mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>⭐ Patient Reviews & Ratings</h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 items-center bg-gray-50/60 p-6 rounded-2xl border border-gray-100'>
            {/* Score Summary */}
            <div className='text-center md:border-r border-gray-200 pr-4'>
              <p className='text-5xl font-extrabold text-amber-500'>{ratingsData.statistics?.average_rating || 0}</p>
              <div className='text-amber-400 text-lg my-1'>
                {'★'.repeat(Math.round(ratingsData.statistics?.average_rating || 0)) + '☆'.repeat(5 - Math.round(ratingsData.statistics?.average_rating || 0))}
              </div>
              <p className='text-xs font-semibold text-gray-500'>Based on {ratingsData.statistics?.total_ratings || 0} reviews</p>
              <p className='text-xs text-green-600 font-bold mt-2 bg-green-100/60 py-1 px-3 rounded-full inline-block'>
                👍 {ratingsData.statistics?.would_recommend_count || 0} patients recommend
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className='md:col-span-2 space-y-1.5'>
              {[5, 4, 3, 2, 1].map(stars => {
                const count = ratingsData.statistics?.rating_breakdown?.[stars] || 0
                const pct = ratingsData.statistics?.total_ratings > 0
                  ? Math.round((count / ratingsData.statistics.total_ratings) * 100)
                  : 0
                return (
                  <div key={stars} className='flex items-center gap-3 text-xs'>
                    <span className='w-12 font-medium text-gray-600 flex items-center gap-1'>{stars} ★</span>
                    <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                      <div className='h-full bg-amber-400 rounded-full transition-all duration-500' style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className='w-8 text-right text-gray-400 font-mono'>{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Review List */}
          <div className='space-y-4'>
            {ratingsData.data?.data?.length > 0 ? (
              ratingsData.data.data.map(review => (
                <div key={review.id} className='p-4 bg-white border border-gray-100 rounded-xl shadow-2xs'>
                  <div className='flex justify-between items-start mb-2'>
                    <div>
                      <p className='font-bold text-gray-800 text-sm'>{review.patient?.name || 'Anonymous Patient'}</p>
                      <div className='text-amber-400 text-xs mt-0.5'>
                        {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <span className='text-[10px] text-gray-400'>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.review && <p className='text-xs text-gray-600 leading-relaxed bg-gray-50/50 p-2.5 rounded-lg border border-gray-100'>"{review.review}"</p>}
                  {review.would_recommend && (
                    <span className='text-[10px] text-green-600 font-semibold mt-2 inline-block'>
                      ✓ Recommends this doctor
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className='text-center py-8 text-gray-400 text-sm'>No patient reviews yet for this doctor.</div>
            )}
          </div>
        </div>
      )}

      {/* Related Doctors */}
      <div className='mt-12'>
        <RelatedDoctors docId={docId} speciality={docInfo.specialty?.id} />
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={!!chatPartner}
        onClose={() => setChatPartner(null)}
        initialPartner={chatPartner}
      />
    </div>
  )
}

export default Appointment