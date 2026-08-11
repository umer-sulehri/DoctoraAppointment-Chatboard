import React from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'

const Footer = () => {
    const navigate = useNavigate()

    return (
        <footer className='md:mx-10 mt-20'>
            <div className='bg-gray-50 rounded-2xl px-8 py-12'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8'>
                    {/* Brand Section */}
                    <div className='sm:col-span-2 lg:col-span-1'>
                        <img className='mb-4 w-36' src={assets.logo} alt="Prescripto" />
                        <p className='text-gray-500 text-sm leading-6 max-w-xs'>
                            Your trusted healthcare partner. Connecting patients with verified doctors for seamless, quality healthcare.
                        </p>
                        <div className='flex gap-3 mt-5'>
                            {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                                <button key={social} className='w-8 h-8 bg-primary/10 hover:bg-primary rounded-lg flex items-center justify-center transition group'>
                                    <span className='text-xs text-primary group-hover:text-white capitalize'>{social[0].toUpperCase()}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Company Links */}
                    <div>
                        <p className='text-gray-900 font-bold mb-4'>Company</p>
                        <ul className='space-y-3'>
                            {[
                                { label: 'Home', to: '/' },
                                { label: 'About Us', to: '/about' },
                                { label: 'All Doctors', to: '/doctors' },
                                { label: 'Contact', to: '/contact' },
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link to={item.to} className='text-gray-500 text-sm hover:text-primary transition flex items-center gap-1.5 group'>
                                        <span className='w-1 h-1 bg-gray-300 rounded-full group-hover:bg-primary transition'></span>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Patient Links */}
                    <div>
                        <p className='text-gray-900 font-bold mb-4'>For Patients</p>
                        <ul className='space-y-3'>
                            {[
                                { label: 'Book Appointment', to: '/doctors' },
                                { label: 'My Appointments', to: '/my-appontments' },
                                { label: 'My Profile', to: '/my-profile' },
                                { label: 'Dashboard', to: '/user-dashboard' },
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link to={item.to} className='text-gray-500 text-sm hover:text-primary transition flex items-center gap-1.5 group'>
                                        <span className='w-1 h-1 bg-gray-300 rounded-full group-hover:bg-primary transition'></span>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <p className='text-gray-900 font-bold mb-4'>Get In Touch</p>
                        <ul className='space-y-3'>
                            <li className='flex items-start gap-2'>
                                <span className='text-primary mt-0.5'>📞</span>
                                <span className='text-gray-500 text-sm'>+92 300 000 0000</span>
                            </li>
                            <li className='flex items-start gap-2'>
                                <span className='text-primary mt-0.5'>📧</span>
                                <span className='text-gray-500 text-sm break-all'>sulehriumer83@gmail.com</span>
                            </li>
                            <li className='flex items-start gap-2'>
                                <span className='text-primary mt-0.5'>📍</span>
                                <span className='text-gray-500 text-sm'>Lahore, Punjab, Pakistan</span>
                            </li>
                            <li className='flex items-start gap-2'>
                                <span className='text-primary mt-0.5'>🕐</span>
                                <span className='text-gray-500 text-sm'>Mon–Fri: 8 AM – 8 PM</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* CTA Banner */}
                <div className='bg-gradient-to-r from-primary to-blue-400 rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4'>
                    <div>
                        <p className='text-white font-bold text-lg'>Ready to book your appointment?</p>
                        <p className='text-blue-100 text-sm'>Trusted doctors, easy scheduling, quality care.</p>
                    </div>
                    <button
                        onClick={() => { navigate('/doctors'); scrollTo(0, 0) }}
                        className='bg-white text-primary px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-blue-50 transition flex-shrink-0'
                    >
                        Find Doctors →
                    </button>
                </div>

                {/* Bottom Bar */}
                <div className='border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3'>
                    <p className='text-gray-400 text-sm text-center'>
                        © {new Date().getFullYear()} Prescripto. All Rights Reserved. Built by <span className='text-primary font-medium'>@umersulehri</span>
                    </p>
                    <div className='flex gap-5'>
                        <a href='#' className='text-gray-400 hover:text-primary text-xs transition'>Privacy Policy</a>
                        <a href='#' className='text-gray-400 hover:text-primary text-xs transition'>Terms of Service</a>
                        <a href='#' className='text-gray-400 hover:text-primary text-xs transition'>Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer