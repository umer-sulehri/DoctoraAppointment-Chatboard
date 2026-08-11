import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        // Simulate sending (no backend endpoint for contact form, show success)
        setTimeout(() => {
            setLoading(false)
            setSubmitted(true)
            toast.success('Your message has been sent! We\'ll get back to you soon.')
        }, 1200)
    }

    return (
        <div className='py-10'>
            {/* Hero Section */}
            <div className='text-center mb-14'>
                <p className='text-primary font-semibold tracking-wider uppercase text-sm mb-3'>Get In Touch</p>
                <h1 className='text-4xl font-bold text-gray-900 mb-4'>Contact Us</h1>
                <p className='text-gray-500 max-w-xl mx-auto'>Have a question or need help? We're here for you 24/7. Send us a message and we'll get back to you as soon as possible.</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-start'>
                {/* Contact Info */}
                <div>
                    <img
                        className='w-full rounded-2xl shadow-lg mb-8 object-cover h-64'
                        src={assets.contact_image}
                        alt='Contact Us'
                    />

                    <div className='space-y-5'>
                        {[
                            {
                                icon: '📍',
                                title: 'Our Office',
                                lines: ['123 Medical Center Drive', 'Lahore, Punjab, Pakistan']
                            },
                            {
                                icon: '📞',
                                title: 'Phone & WhatsApp',
                                lines: ['+92 300 000 0000', 'Mon - Sat, 9 AM to 6 PM']
                            },
                            {
                                icon: '📧',
                                title: 'Email Address',
                                lines: ['sulehriumer83@gmail.com', 'support@prescripto.pk']
                            },
                            {
                                icon: '🕐',
                                title: 'Working Hours',
                                lines: ['Monday – Friday: 8 AM – 8 PM', 'Saturday: 9 AM – 4 PM']
                            }
                        ].map((item, i) => (
                            <div key={i} className='flex items-start gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition'>
                                <div className='w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-xl flex-shrink-0'>
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className='font-semibold text-gray-900 mb-1'>{item.title}</h3>
                                    {item.lines.map((line, j) => (
                                        <p key={j} className='text-gray-600 text-sm'>{line}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Form */}
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-8'>
                    {submitted ? (
                        <div className='text-center py-12'>
                            <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                                <svg className='w-10 h-10 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                                </svg>
                            </div>
                            <h3 className='text-2xl font-bold text-gray-900 mb-2'>Message Sent!</h3>
                            <p className='text-gray-600 mb-6'>Thank you for reaching out. We'll respond within 24 hours.</p>
                            <button
                                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: '', message: '' }) }}
                                className='bg-primary text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-medium'
                            >
                                Send Another Message
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2 className='text-2xl font-bold text-gray-900 mb-6'>Send Us a Message</h2>
                            <form onSubmit={handleSubmit} className='space-y-5'>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>Full Name *</label>
                                        <input
                                            type='text'
                                            name='name'
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'
                                            placeholder='John Doe'
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address *</label>
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
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Phone Number</label>
                                    <input
                                        type='tel'
                                        name='phone'
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'
                                        placeholder='+92 300 0000000'
                                    />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Subject *</label>
                                    <select
                                        name='subject'
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-white'
                                    >
                                        <option value=''>Select a subject</option>
                                        <option value='appointment'>Appointment Inquiry</option>
                                        <option value='technical'>Technical Support</option>
                                        <option value='billing'>Billing Question</option>
                                        <option value='feedback'>Feedback</option>
                                        <option value='other'>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>Message *</label>
                                    <textarea
                                        name='message'
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows='5'
                                        className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none'
                                        placeholder='How can we help you?'
                                    ></textarea>
                                </div>

                                <button
                                    type='submit'
                                    disabled={loading}
                                    className='w-full bg-primary hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2'
                                >
                                    {loading ? (
                                        <>
                                            <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                                            Sending...
                                        </>
                                    ) : 'Send Message'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Contact