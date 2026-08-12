import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Banner = () => {
    const navigate = useNavigate()

    return (
        <div className='flex bg-primary rounded-2xl px-6 sm:px-10 md:px-14 lg:px-12 my-20 md:mx-10 overflow-hidden shadow-xl'>
            {/* ---------left side---------- */}
            <div className="flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5">
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-white">
                    <p>Book Appointment</p>
                    <p className='mt-2 text-blue-200'>With 500+ Trusted Doctors</p>
                </div>
                <p className='text-blue-100 mt-3 text-sm max-w-sm'>
                    Your health is our priority. Find the right specialist and book instantly — no waiting, no hassle.
                </p>
                <div className='flex flex-col sm:flex-row gap-3 mt-6'>
                    <button
                        onClick={() => { navigate('/register'); scrollTo(0, 0) }}
                        className='bg-white text-sm sm:text-base text-primary font-semibold px-8 py-3 rounded-full hover:scale-105 transition-all shadow-lg'
                    >
                        Create Free Account
                    </button>
                    <button
                        onClick={() => { navigate('/doctors'); scrollTo(0, 0) }}
                        className='border-2 border-white/40 text-white text-sm sm:text-base px-8 py-3 rounded-full hover:bg-white/10 transition-all font-medium'
                    >
                        Browse Doctors
                    </button>
                </div>

                <div className='flex gap-8 mt-8'>
                    <div>
                        <p className='text-2xl font-bold text-white'>500+</p>
                        <p className='text-blue-200 text-xs'>Verified Doctors</p>
                    </div>
                    <div className='w-px bg-white/20'></div>
                    <div>
                        <p className='text-2xl font-bold text-white'>50K+</p>
                        <p className='text-blue-200 text-xs'>Appointments</p>
                    </div>
                    <div className='w-px bg-white/20'></div>
                    <div>
                        <p className='text-2xl font-bold text-white'>4.9★</p>
                        <p className='text-blue-200 text-xs'>Patient Rating</p>
                    </div>
                </div>
            </div>
            {/* ---------right side---------- */}
            <div className="hidden md:block md:w-1/2 lg:w-[370px] relative">
                <img
                    className='w-full absolute bottom-0 right-0 max-w-md'
                    src={assets.appointment_img}
                    alt="Book Appointment"
                />
            </div>
        </div>
    )
}

export default Banner