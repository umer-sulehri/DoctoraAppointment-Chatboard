import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { API } from '../services/api'
import { assets } from '../assets/assets'

const TopDoctors = () => {
    const navigate = useNavigate()
    const { currencySymbol } = useContext(AppContext)
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadTopDoctors()
    }, [])

    const loadTopDoctors = async () => {
        try {
            const response = await API.getTopDoctors(10)
            const data = response.data?.doctors || response.data?.data || []
            setDoctors(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to load top doctors:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
                <h1 className='text-3xl font-medium'>Top Doctors to Book</h1>
                <div className="w-full grid grid-cols-auto gap-4 gap-y-6 px-3 sm:px-0">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="border border-blue-100 rounded-xl overflow-hidden animate-pulse">
                            <div className="w-full h-48 bg-gray-200"></div>
                            <div className="p-4">
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
            <h1 className='text-3xl font-medium'>Top Doctors to Book</h1>
            <p className='sm:w-1/3 text-center text-sm'>Simply browse through our extensive list of trusted doctors.</p>
            <div className="w-full grid grid-cols-auto gap-4 gap-y-6 px-3 sm:px-0">
                {doctors.slice(0, 10).map((doctor, index) => (
                    <div
                        onClick={() => { navigate(`/appointment/${doctor.id}`); scrollTo(0, 0) }}
                        className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500 bg-white shadow-sm hover:shadow-xl"
                        key={doctor.id || index}
                    >
                        <div className="relative">
                            <img
                                className='bg-blue-50 w-full h-48 object-cover object-top'
                                src={doctor.user?.profile_image || assets.doc1}
                                alt={doctor.user?.name}
                                onError={(e) => { e.target.src = assets.doc1 }}
                            />
                            <div className="absolute top-3 right-3">
                                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${doctor.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${doctor.is_available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    {doctor.is_available ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <p className='text-gray-900 text-base font-semibold'>{doctor.user?.name || 'Dr. Unknown'}</p>
                            <p className='text-gray-500 text-sm mt-0.5'>{doctor.specialty?.name || 'Specialist'}</p>
                            <div className="flex items-center justify-between mt-3">
                                <p className='text-primary font-bold text-sm'>{currencySymbol}{doctor.consultation_fee}</p>
                                <span className="text-xs text-gray-500">{doctor.years_of_experience} yrs exp</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={() => { navigate('/doctors'); scrollTo(0, 0) }}
                className='bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10 hover:bg-blue-100 transition font-medium'
            >
                View All Doctors
            </button>
        </div>
    )
}

export default TopDoctors