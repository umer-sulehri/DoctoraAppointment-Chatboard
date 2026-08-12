import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../services/api'
import { assets } from '../assets/assets'

const RelatedDoctors = ({ speciality, docId }) => {
    const navigate = useNavigate()
    const [relDoc, setRelDoc] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (speciality) {
            loadRelatedDoctors()
        }
    }, [speciality, docId])

    const loadRelatedDoctors = async () => {
        try {
            setLoading(true)
            const response = await API.getDoctors()
            const doctorsList = response.data.doctors.data || response.data.doctors || []
            const filtered = doctorsList.filter(doc =>
                doc.specialty?.id === speciality && doc.id !== parseInt(docId)
            )
            setRelDoc(filtered.slice(0, 5))
        } catch (error) {
            console.error('Failed to load related doctors:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading || relDoc.length === 0) return null

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10'>
            <h1 className='text-3xl font-medium'>Related Doctors</h1>
            <p className='sm:w-1/3 text-center text-sm'>Simply browse through our extensive list of trusted doctors.</p>
            <div className="w-full grid grid-cols-auto gap-4 gap-y-6 px-3 sm:px-0">
                {relDoc.map((doctor, index) => (
                    <div
                        onClick={() => { navigate(`/appointment/${doctor.id}`); scrollTo(0, 0) }}
                        className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500 bg-white"
                        key={doctor.id || index}
                    >
                        <img
                            className='bg-blue-50 w-full h-48 object-cover object-top'
                            src={doctor.user?.profile_image || assets.doc1}
                            alt={doctor.user?.name}
                            onError={(e) => { e.target.src = assets.doc1 }}
                        />
                        <div className="p-4">
                            <div className="flex items-center gap-2 text-sm text-center text-green-500 mb-1">
                                <p className='w-2 h-2 bg-green-500 rounded-full'></p>
                                <p>{doctor.is_available ? 'Available' : 'Unavailable'}</p>
                            </div>
                            <p className='text-gray-900 text-base font-semibold'>{doctor.user?.name}</p>
                            <p className='text-gray-600 text-sm'>{doctor.specialty?.name}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={() => { navigate('/doctors'); scrollTo(0, 0) }}
                className='bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10 hover:bg-blue-100 transition'
            >
                more
            </button>
        </div>
    )
}

export default RelatedDoctors