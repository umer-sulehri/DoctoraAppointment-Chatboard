import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { API } from '../services/api'
import { assets } from '../assets/assets'

const Doctors = () => {
  const { speciality } = useParams()
  const navigate = useNavigate()
  const { specialties, currencySymbol } = useContext(AppContext)

  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSpecialty, setSelectedSpecialty] = useState(speciality || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')

  useEffect(() => {
    loadDoctors()
  }, [])

  useEffect(() => {
    setSelectedSpecialty(speciality || '')
  }, [speciality])

  useEffect(() => {
    applyFilter()
  }, [doctors, selectedSpecialty, searchQuery, availabilityFilter])

  const loadDoctors = async () => {
    try {
      setLoading(true)
      const response = await API.getDoctors()
      const data = response.data?.doctors?.data || response.data?.doctors || response.data || []
      setDoctors(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load doctors:', error)
      setDoctors([])
    } fontFinally: {
      setLoading(false)
    }
  }

  // Handle finally block safely
  const safeLoadDoctors = async () => {
    try {
      setLoading(true)
      const response = await API.getDoctors()
      const data = response.data?.doctors?.data || response.data?.doctors || []
      setDoctors(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load doctors:', error)
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    safeLoadDoctors()
  }, [])

  const applyFilter = () => {
    let result = Array.isArray(doctors) ? [...doctors] : []

    if (selectedSpecialty) {
      const target = String(selectedSpecialty).trim().toLowerCase()
      result = result.filter(doc => {
        const specId = String(doc.specialty?.id || '').toLowerCase()
        const specName = String(doc.specialty?.name || '').toLowerCase()
        return specId === target || specName === target || specName.includes(target)
      })
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(doc =>
        String(doc.user?.name || '').toLowerCase().includes(q) ||
        String(doc.specialty?.name || '').toLowerCase().includes(q)
      )
    }

    if (availabilityFilter === 'available') {
      result = result.filter(doc => doc.is_available)
    }

    setFilteredDoctors(result)
  }

  const handleSpecialtyChange = (specialtyId) => {
    const targetId = String(specialtyId)
    const newSpecialty = String(selectedSpecialty) === targetId ? '' : targetId
    setSelectedSpecialty(newSpecialty)
    navigate(newSpecialty ? `/doctors/${newSpecialty}` : '/doctors')
  }

  return (
    <div className='py-8 min-h-[60vh]'>
      {/* Header */}
      <div className='mb-8 text-center sm:text-left'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Browse Doctor Specialists</h1>
        <p className='text-gray-500'>Find expert medical professionals and schedule your appointment instantly.</p>
      </div>

      {/* Search & Quick Filter Bar */}
      <div className='bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center'>
        <div className='relative w-full md:w-96'>
          <input
            type='text'
            placeholder='Search doctor name or specialty...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm'
          />
          <span className='absolute left-3.5 top-3 text-gray-400 text-sm'>🔍</span>
        </div>

        <div className='flex gap-2 w-full md:w-auto overflow-x-auto'>
          <button
            onClick={() => setAvailabilityFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition ${availabilityFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All Doctors ({doctors.length})
          </button>
          <button
            onClick={() => setAvailabilityFilter('available')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition ${availabilityFilter === 'available' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
          >
            Available Now ({doctors.filter(d => d.is_available).length})
          </button>
        </div>
      </div>

      <div className='flex flex-col md:flex-row gap-6 items-start'>
        {/* Specialty Sidebar */}
        <div className='w-full md:w-64 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex-shrink-0'>
          <h3 className='font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider'>Specialties</h3>
          <div className='space-y-1.5'>
            <button
              onClick={() => handleSpecialtyChange('')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition flex justify-between items-center ${
                !selectedSpecialty ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>All Specialties</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${!selectedSpecialty ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {doctors.length}
              </span>
            </button>
            {specialties && specialties.map(specialty => {
              const count = doctors.filter(d => String(d.specialty?.id) === String(specialty.id) || String(d.specialty?.name).toLowerCase() === String(specialty.name).toLowerCase()).length
              const isSelected = String(selectedSpecialty) === String(specialty.id) || String(selectedSpecialty).toLowerCase() === String(specialty.name).toLowerCase()
              return (
                <button
                  key={specialty.id}
                  onClick={() => handleSpecialtyChange(specialty.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition flex justify-between items-center ${
                    isSelected ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{specialty.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Doctors Grid */}
        <div className='w-full flex-1'>
          {loading ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className='border border-gray-100 rounded-2xl p-4 bg-white animate-pulse'>
                  <div className='w-full h-48 bg-gray-200 rounded-xl mb-4'></div>
                  <div className='h-4 bg-gray-200 rounded w-2/3 mb-2'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/3'></div>
                </div>
              ))}
            </div>
          ) : filteredDoctors.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredDoctors.map(doctor => (
                <div
                  key={doctor.id}
                  className='border border-gray-100 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white group flex flex-col justify-between'
                >
                  <div>
                    <div className='relative overflow-hidden bg-blue-50/50'>
                      <img
                        onClick={() => navigate(`/appointment/${doctor.id}`)}
                        className='w-full h-52 object-cover object-top group-hover:scale-105 transition-transform duration-500'
                        src={doctor.user?.profile_image || assets.doc1}
                        alt={doctor.user?.name || 'Doctor'}
                        onError={(e) => { e.target.src = assets.doc1 }}
                      />
                      <div className='absolute top-3 right-3'>
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full shadow-sm backdrop-blur-md ${doctor.is_available ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-white animate-pulse`}></span>
                          {doctor.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>

                    <div className='p-5'>
                      <div className='flex justify-between items-start mb-1'>
                        <p className='text-gray-900 text-lg font-bold group-hover:text-primary transition-colors'>
                          {doctor.user?.name || 'Dr. Specialist'}
                        </p>
                      </div>
                      <p className='text-primary text-xs font-semibold uppercase tracking-wider mb-2'>
                        {doctor.specialty?.name || 'General'}
                      </p>
                      <p className='text-gray-500 text-xs line-clamp-2 mb-3'>
                        {doctor.user?.bio || `${doctor.years_of_experience || 5}+ years of dedicated experience in providing medical care.`}
                      </p>
                      
                      <div className='flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-500'>
                        <span>⭐ 4.9 (120+ reviews)</span>
                        <span>🎓 {doctor.qualifications || 'MBBS'}</span>
                      </div>
                    </div>
                  </div>

                  <div className='px-5 pb-5 pt-2 flex items-center justify-between gap-3'>
                    <div>
                      <p className='text-xs text-gray-400'>Fee</p>
                      <p className='text-primary font-extrabold text-base'>{currencySymbol}{doctor.consultation_fee}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/appointment/${doctor.id}`)}
                      className='bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-xs transition shadow-sm hover:shadow'
                    >
                      Book Visit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='bg-white p-12 rounded-2xl border border-gray-100 text-center'>
              <div className='text-5xl mb-4'>👨‍⚕️</div>
              <h3 className='text-lg font-bold text-gray-800 mb-1'>No Doctors Found</h3>
              <p className='text-gray-500 text-sm mb-4'>No doctors matching specialty "{selectedSpecialty}".</p>
              <button
                onClick={() => { setSelectedSpecialty(''); setSearchQuery(''); setAvailabilityFilter('all'); navigate('/doctors') }}
                className='bg-primary text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition'
              >
                View All Doctors ({doctors.length})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Doctors