import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const About = () => {
    const navigate = useNavigate()

    const stats = [
        { number: '500+', label: 'Verified Doctors' },
        { number: '50K+', label: 'Happy Patients' },
        { number: '10+', label: 'Specialties' },
        { number: '24/7', label: 'Support Available' },
    ]

    const features = [
        {
            icon: '🏥',
            title: 'Easy Appointment Booking',
            desc: 'Browse verified doctors, check availability, and book your appointment in just a few clicks — no phone calls needed.'
        },
        {
            icon: '👨‍⚕️',
            title: 'Trusted & Verified Doctors',
            desc: 'All our doctors are thoroughly vetted, licensed professionals with proven expertise in their specialties.'
        },
        {
            icon: '📋',
            title: 'Complete Medical History',
            desc: 'Keep all your medical records, prescriptions, and consultation notes in one secure, accessible place.'
        },
        {
            icon: '🔔',
            title: 'Smart Reminders',
            desc: 'Never miss an appointment with automated email and SMS reminders sent before your scheduled visit.'
        },
        {
            icon: '⭐',
            title: 'Patient Reviews',
            desc: 'Make informed decisions with genuine patient reviews and ratings for every doctor on our platform.'
        },
        {
            icon: '🔒',
            title: 'Privacy & Security',
            desc: 'Your health data is protected with industry-standard encryption and strict privacy practices.'
        }
    ]

    return (
        <div className='py-10'>
            {/* Hero */}
            <div className='text-center mb-14'>
                <p className='text-primary font-semibold tracking-wider uppercase text-sm mb-3'>About Us</p>
                <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>Your Trusted Healthcare <br />Partner</h1>
                <p className='text-gray-500 max-w-2xl mx-auto text-lg'>At Prescripto, we believe that quality healthcare should be accessible to everyone. We bridge the gap between patients and doctors.</p>
            </div>

            {/* Story Section */}
            <div className='flex flex-col md:flex-row items-center gap-12 mb-20'>
                <div className='md:w-1/2'>
                    <img
                        className='w-full rounded-2xl shadow-xl object-cover h-80'
                        src={assets.about_image}
                        alt='About Prescripto'
                    />
                </div>
                <div className='md:w-1/2 space-y-5'>
                    <div>
                        <h2 className='text-3xl font-bold text-gray-900 mb-4'>Our Story</h2>
                        <p className='text-gray-600 leading-relaxed mb-4'>
                            Welcome to Prescripto, your trusted partner in managing your healthcare needs conveniently and efficiently.
                            We understand the challenges individuals face when scheduling doctor appointments and managing their health records.
                        </p>
                        <p className='text-gray-600 leading-relaxed'>
                            Prescripto is committed to excellence in healthcare technology. We continuously strive to enhance our platform,
                            integrating the latest advancements to improve user experience and deliver superior service.
                        </p>
                    </div>
                    <div className='bg-blue-50 rounded-xl p-5'>
                        <h3 className='text-lg font-bold text-gray-900 mb-2'>Our Vision</h3>
                        <p className='text-gray-600'>
                            To create a seamless healthcare experience for every user by bridging the gap between patients and
                            healthcare providers — making it easier to access the care you need, when you need it. testing
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6 mb-20'>
                {stats.map((stat, i) => (
                    <div key={i} className='text-center bg-gradient-to-br from-primary to-blue-500 rounded-2xl p-6 text-white'>
                        <p className='text-4xl font-bold mb-1'>{stat.number}</p>
                        <p className='text-blue-100 text-sm font-medium'>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Features */}
            <div className='mb-20'>
                <div className='text-center mb-10'>
                    <h2 className='text-3xl font-bold text-gray-900 mb-3'>Why Choose Prescripto?</h2>
                    <p className='text-gray-500 max-w-xl mx-auto'>Everything you need for a seamless healthcare experience, all in one place.</p>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {features.map((feature, i) => (
                        <div key={i} className='p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300'>
                            <div className='w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4'>
                                {feature.icon}
                            </div>
                            <h3 className='text-lg font-bold text-gray-900 mb-2'>{feature.title}</h3>
                            <p className='text-gray-500 text-sm leading-relaxed'>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className='bg-gradient-to-r from-primary to-blue-500 rounded-2xl p-10 text-center text-white'>
                <h2 className='text-3xl font-bold mb-3'>Ready to Get Started?</h2>
                <p className='text-blue-100 mb-6 max-w-xl mx-auto'>Join thousands of patients who trust Prescripto for their healthcare needs. Book your first appointment today — it's free!</p>
                <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                    <button
                        onClick={() => navigate('/doctors')}
                        className='bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition'
                    >
                        Find a Doctor
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        className='border-2 border-white/50 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition'
                    >
                        Create Account
                    </button>
                </div>
            </div>
        </div>
    )
}

export default About