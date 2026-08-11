import React, { useState } from 'react'
import { API } from '../services/api'
import { toast } from 'react-toastify'

const RatingModal = ({ isOpen, onClose, doctor, appointmentId = null, onRatingSubmitted }) => {
    const [rating, setRating] = useState(5)
    const [hoverRating, setHoverRating] = useState(0)
    const [review, setReview] = useState('')
    const [wouldRecommend, setWouldRecommend] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    if (!isOpen || !doctor) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setSubmitting(true)
            await API.rateDoctor({
                doctor_id: doctor.id || doctor.doctor_id,
                appointment_id: appointmentId,
                rating: rating,
                review: review,
                would_recommend: wouldRecommend,
            })
            toast.success('Thank you for rating your doctor!')
            if (onRatingSubmitted) onRatingSubmitted()
            onClose()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit rating')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm'>
            <div className='bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl'>
                <div className='flex justify-between items-center mb-4 pb-2 border-b border-gray-100'>
                    <h3 className='text-lg font-bold text-gray-900'>⭐ Rate Your Consultation</h3>
                    <button onClick={onClose} className='text-gray-400 hover:text-gray-600 font-bold text-lg'>✕</button>
                </div>

                <div className='text-center mb-6'>
                    <p className='text-sm text-gray-500'>How was your visit with</p>
                    <p className='font-bold text-gray-900 text-lg mt-0.5'>
                        {doctor.name || doctor.user?.name || 'Dr. Specialist'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className='space-y-5'>
                    {/* Star Rating Picker */}
                    <div className='flex flex-col items-center gap-2'>
                        <div className='flex items-center gap-2'>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type='button'
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className='text-3xl transition-transform transform hover:scale-125 focus:outline-none'
                                >
                                    <span className={(hoverRating || rating) >= star ? 'text-amber-400' : 'text-gray-200'}>
                                        ★
                                    </span>
                                </button>
                            ))}
                        </div>
                        <p className='text-xs font-semibold text-amber-600'>
                            {rating === 5 ? '🌟 Excellent' : rating === 4 ? '👍 Very Good' : rating === 3 ? '😐 Average' : rating === 2 ? '👎 Poor' : '😡 Terrible'}
                        </p>
                    </div>

                    {/* Review Text */}
                    <div>
                        <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2'>
                            Share Your Experience (Optional)
                        </label>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder='Describe your consultation, doctor friendliness, treatment quality...'
                            rows='3'
                            className='w-full px-4 py-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none'
                        ></textarea>
                    </div>

                    {/* Would Recommend Toggle */}
                    <label className='flex items-center gap-2.5 cursor-pointer select-none bg-blue-50/50 p-3 rounded-xl border border-blue-100'>
                        <input
                            type='checkbox'
                            checked={wouldRecommend}
                            onChange={(e) => setWouldRecommend(e.target.checked)}
                            className='w-4 h-4 text-primary rounded focus:ring-primary'
                        />
                        <span className='text-xs font-medium text-gray-700'>
                            I would recommend this doctor to friends and family
                        </span>
                    </label>

                    {/* Actions */}
                    <div className='flex gap-3 pt-2'>
                        <button
                            type='submit'
                            disabled={submitting}
                            className='flex-1 bg-primary text-white py-3 rounded-xl font-bold text-xs hover:bg-blue-700 transition disabled:opacity-50 shadow-xs'
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                        <button
                            type='button'
                            onClick={onClose}
                            className='flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-xs hover:bg-gray-200 transition'
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RatingModal
