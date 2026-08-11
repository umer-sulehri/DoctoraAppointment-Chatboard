import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Header = () => {
    const navigate = useNavigate()
    return (
        <div className="flex flex-col md:flex-row flex-wrap bg-primary rounded-2xl px-6 md:px-14 overflow-hidden shadow-xl">
            {/*------------ left side-------- */}
            <div className='md:w-1/2 flex flex-col items-start justify-center gap-5 py-12 m-auto md:py-[10vw] md:mb-[-30px]'>
                <p className='text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-tight md:leading-tight lg:leading-tight'>
                    Book Appointment <br className='hidden sm:block' />
                    <span className='text-blue-200'>With Trusted Doctors</span>
                </p>
                <div className="flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light">
                    <img className='w-28 rounded-full' src={assets.group_profiles} alt="Patients" />
                    <div>
                        <p className='font-semibold text-white'>Join 50,000+ satisfied patients</p>
                        <p className='text-blue-100'>Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.</p>
                    </div>
                </div>

                <div className='flex flex-col sm:flex-row gap-3 w-full'>
                    <a
                        href="#speciality"
                        className='flex items-center justify-center gap-2 bg-white px-8 py-3.5 rounded-full text-primary font-semibold text-sm hover:scale-105 transition-all duration-300 shadow-lg'
                    >
                        Book Appointment
                        <img className='w-3' src={assets.arrow_icon} alt="" />
                    </a>
                    <button
                        onClick={() => navigate('/doctors')}
                        className='flex items-center justify-center gap-2 border-2 border-white/40 text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-white/10 transition-all duration-300'
                    >
                        Browse Doctors
                    </button>
                </div>

                {/* Quick Stats */}
                <div className='flex gap-6 mt-2'>
                    <div className='text-center'>
                        <p className='text-white font-bold text-xl'>500+</p>
                        <p className='text-blue-200 text-xs'>Doctors</p>
                    </div>
                    <div className='w-px bg-white/20'></div>
                    <div className='text-center'>
                        <p className='text-white font-bold text-xl'>50K+</p>
                        <p className='text-blue-200 text-xs'>Patients</p>
                    </div>
                    <div className='w-px bg-white/20'></div>
                    <div className='text-center'>
                        <p className='text-white font-bold text-xl'>10+</p>
                        <p className='text-blue-200 text-xs'>Specialties</p>
                    </div>
                </div>
            </div>

            {/*------------ right side-------- */}
            <div className="md:w-1/2 relative flex items-end justify-center">
                <img
                    className='w-full md:absolute bottom-0 h-auto rounded-lg max-h-96 object-cover object-top'
                    src={assets.header_img}
                    alt="Doctor"
                />
            </div>
        </div>
    )
}

export default Header