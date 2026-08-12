import React, { useEffect, useState } from 'react'
import { API } from '../services/api'
import { toast } from 'react-toastify'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Doctor Modals
  const [showCreateDoctorModal, setShowCreateDoctorModal] = useState(false)
  const [editDoctorModal, setEditDoctorModal] = useState(null)
  const [doctorForm, setDoctorForm] = useState({
    name: '', email: '', password: '', phone: '', specialty_id: '',
    license_number: '', consultation_fee: '', years_of_experience: '', qualifications: ''
  })

  // Specialty Modals
  const [showCreateSpecialtyModal, setShowCreateSpecialtyModal] = useState(false)
  const [editSpecialtyModal, setEditSpecialtyModal] = useState(null)
  const [specialtyForm, setSpecialtyForm] = useState({ name: '', description: '', icon: '' })

  useEffect(() => {
    loadDashboard()
    loadSpecialties()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const statsRes = await API.getDashboardStats()
      setStats(statsRes.data?.stats || {})

      const usersRes = await API.getAdminUsers()
      setUsers(usersRes.data?.users?.data || usersRes.data?.users || [])

      const doctorsRes = await API.getAdminDoctors()
      setDoctors(doctorsRes.data?.doctors?.data || doctorsRes.data?.doctors || [])

      const appointmentsRes = await API.getAdminAppointments()
      setAppointments(appointmentsRes.data?.appointments?.data || appointmentsRes.data?.appointments || [])
    } catch (error) {
      console.error('Admin dashboard load error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const loadSpecialties = async () => {
    try {
      const res = await API.getSpecialties()
      setSpecialties(res.data?.specialties || [])
    } catch (error) {
      console.error('Failed to load specialties:', error)
    }
  }

  // --- Doctor CRUD ---
  const handleCreateDoctor = async (e) => {
    e.preventDefault()
    try {
      await API.createDoctor(doctorForm)
      toast.success('Doctor created successfully')
      setShowCreateDoctorModal(false)
      setDoctorForm({ name: '', email: '', password: '', phone: '', specialty_id: '', license_number: '', consultation_fee: '', years_of_experience: '', qualifications: '' })
      loadDashboard()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create doctor')
    }
  }

  const handleUpdateDoctor = async (e) => {
    e.preventDefault()
    try {
      await API.updateDoctor(editDoctorModal.id, doctorForm)
      toast.success('Doctor updated successfully')
      setEditDoctorModal(null)
      loadDashboard()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update doctor')
    }
  }

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      try {
        await API.deleteAdminDoctor(doctorId)
        toast.success('Doctor deleted successfully')
        loadDashboard()
      } catch (error) {
        toast.error('Failed to delete doctor')
      }
    }
  }

  // --- User CRUD ---
  const handleDeactivateUser = async (userId) => {
    try {
      await API.deactivateUser(userId)
      toast.success('User deactivated')
      loadDashboard()
    } catch (error) {
      toast.error('Failed to deactivate user')
    }
  }

  const handleActivateUser = async (userId) => {
    try {
      await API.activateUser(userId)
      toast.success('User activated')
      loadDashboard()
    } catch (error) {
      toast.error('Failed to activate user')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Delete this user account permanently?')) {
      try {
        await API.deleteAdminUser(userId)
        toast.success('User deleted successfully')
        loadDashboard()
      } catch (error) {
        toast.error('Failed to delete user')
      }
    }
  }

  // --- Specialty CRUD ---
  const handleCreateSpecialty = async (e) => {
    e.preventDefault()
    try {
      await API.createSpecialty(specialtyForm)
      toast.success('Specialty created successfully')
      setShowCreateSpecialtyModal(false)
      setSpecialtyForm({ name: '', description: '', icon: '' })
      loadSpecialties()
      loadDashboard()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create specialty')
    }
  }

  const handleUpdateSpecialty = async (e) => {
    e.preventDefault()
    try {
      await API.updateSpecialty(editSpecialtyModal.id, specialtyForm)
      toast.success('Specialty updated')
      setEditSpecialtyModal(null)
      loadSpecialties()
    } catch (error) {
      toast.error('Failed to update specialty')
    }
  }

  const handleDeleteSpecialty = async (id) => {
    if (window.confirm('Delete this specialty?')) {
      try {
        await API.deleteSpecialty(id)
        toast.success('Specialty deleted')
        loadSpecialties()
      } catch (error) {
        toast.error('Failed to delete specialty')
      }
    }
  }

  // --- Appointment CRUD ---
  const handleDeleteAppointment = async (id) => {
    if (window.confirm('Delete this appointment record?')) {
      try {
        await API.deleteAdminAppointment(id)
        toast.success('Appointment deleted')
        loadDashboard()
      } catch (error) {
        toast.error('Failed to delete appointment')
      }
    }
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openEditDoctor = (doc) => {
    setEditDoctorModal(doc)
    setDoctorForm({
      name: doc.user?.name || '',
      email: doc.user?.email || '',
      phone: doc.user?.phone || '',
      specialty_id: doc.specialty_id || '',
      license_number: doc.license_number || '',
      consultation_fee: doc.consultation_fee || '',
      years_of_experience: doc.years_of_experience || '',
      qualifications: doc.qualifications || '',
    })
  }

  const openEditSpecialty = (spec) => {
    setEditSpecialtyModal(spec)
    setSpecialtyForm({ name: spec.name || '', description: spec.description || '', icon: spec.icon || '' })
  }

  if (loading) {
    return (
      <div className='py-8 max-w-7xl mx-auto px-4'>
        <div className='h-8 bg-gray-100 w-48 rounded-xl animate-pulse mb-6'></div>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className='bg-gray-100 h-28 rounded-2xl animate-pulse'></div>
          ))}
        </div>
        <div className='bg-gray-100 h-64 rounded-2xl animate-pulse'></div>
      </div>
    )
  }

  return (
    <div className='py-8 max-w-7xl mx-auto min-h-[60vh]'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Admin System Manager</h1>
          <p className='text-gray-500 text-sm mt-1'>Full CRUD control for Doctors, Patients, Specialties, and Appointments</p>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => {
              setDoctorForm({ name: '', email: '', password: '', phone: '', specialty_id: '', license_number: '', consultation_fee: '', years_of_experience: '', qualifications: '' })
              setShowCreateDoctorModal(true)
            }}
            className='bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition text-sm'
          >
            ➕ Add Doctor
          </button>
          <button
            onClick={() => {
              setSpecialtyForm({ name: '', description: '', icon: '' })
              setShowCreateSpecialtyModal(true)
            }}
            className='bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-900 transition text-sm'
          >
            🏥 Add Specialty
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex gap-1 mb-8 bg-gray-100 rounded-xl p-1 overflow-x-auto'>
        {[
          { id: 'dashboard', label: '📊 Stats' },
          { id: 'doctors', label: '🩺 Doctors CRUD' },
          { id: 'users', label: '👥 Patients CRUD' },
          { id: 'specialties', label: '🏥 Specialties CRUD' },
          { id: 'appointments', label: '📅 Appointments CRUD' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm whitespace-nowrap transition ${activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {activeTab === 'dashboard' && (
        <div className='space-y-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-sm'>
              <p className='text-blue-100 text-xs font-semibold uppercase tracking-wider'>Total Patients</p>
              <p className='text-4xl font-bold mt-2'>{stats.total_users || 0}</p>
            </div>
            <div className='bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-sm'>
              <p className='text-green-100 text-xs font-semibold uppercase tracking-wider'>Total Doctors</p>
              <p className='text-4xl font-bold mt-2'>{stats.total_doctors || 0}</p>
            </div>
            <div className='bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-sm'>
              <p className='text-purple-100 text-xs font-semibold uppercase tracking-wider'>Total Appointments</p>
              <p className='text-4xl font-bold mt-2'>{stats.total_appointments || 0}</p>
            </div>
            <div className='bg-gradient-to-br from-yellow-500 to-amber-600 p-6 rounded-2xl text-white shadow-sm'>
              <p className='text-yellow-100 text-xs font-semibold uppercase tracking-wider'>Total Revenue</p>
              <p className='text-4xl font-bold mt-2'>${Number(stats.revenue || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Doctors Tab (Full CRUD) */}
      {activeTab === 'doctors' && (
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl font-bold text-gray-800'>Doctor Management (CRUD)</h2>
            <button
              onClick={() => {
                setDoctorForm({ name: '', email: '', password: '', phone: '', specialty_id: '', license_number: '', consultation_fee: '', years_of_experience: '', qualifications: '' })
                setShowCreateDoctorModal(true)
              }}
              className='bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition'
            >
              + Create Doctor
            </button>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left font-semibold text-gray-600'>Doctor Name</th>
                  <th className='px-4 py-3 text-left font-semibold text-gray-600'>Specialty</th>
                  <th className='px-4 py-3 text-left font-semibold text-gray-600'>License</th>
                  <th className='px-4 py-3 text-left font-semibold text-gray-600'>Fee</th>
                  <th className='px-4 py-3 text-left font-semibold text-gray-600'>Status</th>
                  <th className='px-4 py-3 text-left font-semibold text-gray-600'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.length > 0 ? (
                  doctors.map(doctor => (
                    <tr key={doctor.id} className='border-t border-gray-50 hover:bg-gray-50/50 transition'>
                      <td className='px-4 py-3 font-medium text-gray-800'>{doctor.user?.name || 'N/A'}</td>
                      <td className='px-4 py-3 text-gray-600'>{doctor.specialty?.name || 'N/A'}</td>
                      <td className='px-4 py-3 text-gray-500 font-mono text-xs'>{doctor.license_number}</td>
                      <td className='px-4 py-3 font-bold text-primary'>${doctor.consultation_fee}</td>
                      <td className='px-4 py-3'>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${doctor.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {doctor.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className='px-4 py-3 flex gap-2'>
                        <button onClick={() => openEditDoctor(doctor)} className='text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs font-medium'>✏️ Edit</button>
                        <button onClick={() => handleDeleteDoctor(doctor.id)} className='text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-medium'>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className='px-4 py-8 text-center text-gray-400'>No doctors found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab (Full CRUD) */}
      {activeTab === 'users' && (
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
            <h2 className='text-xl font-bold text-gray-800'>Patient Management (CRUD)</h2>
            <input
              type='text'
              placeholder='Search patients...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full sm:w-64 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30'
            />
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left font-semibold text-gray-600'>Name</th>
                  <th className='px-4 py-3 text-left font-semibold text-gray-600'>Email</th>
                  <th className='px-4 py-3 text-left font-semibold text-gray-600'>Phone</th>
                  <th className='px-4 py-3 text-left font-semibold text-gray-600'>Status</th>
                  <th className='px-4 py-3 text-left font-semibold text-gray-600'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(u => (
                    <tr key={u.id} className='border-t border-gray-50 hover:bg-gray-50/50 transition'>
                      <td className='px-4 py-3 font-medium text-gray-800'>{u.name}</td>
                      <td className='px-4 py-3 text-gray-600'>{u.email}</td>
                      <td className='px-4 py-3 text-gray-500'>{u.phone || 'N/A'}</td>
                      <td className='px-4 py-3'>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className='px-4 py-3 flex gap-2'>
                        {u.is_active ? (
                          <button onClick={() => handleDeactivateUser(u.id)} className='text-yellow-600 hover:bg-yellow-50 px-2 py-1 rounded text-xs font-medium'>Deactivate</button>
                        ) : (
                          <button onClick={() => handleActivateUser(u.id)} className='text-green-600 hover:bg-green-50 px-2 py-1 rounded text-xs font-medium'>Activate</button>
                        )}
                        <button onClick={() => handleDeleteUser(u.id)} className='text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-medium'>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className='px-4 py-8 text-center text-gray-400'>No patients found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Specialties Tab (Full CRUD) */}
      {activeTab === 'specialties' && (
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl font-bold text-gray-800'>Specialty Management (CRUD)</h2>
            <button
              onClick={() => {
                setSpecialtyForm({ name: '', description: '', icon: '' })
                setShowCreateSpecialtyModal(true)
              }}
              className='bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-900 transition'
            >
              + Create Specialty
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {specialties.map(s => (
              <div key={s.id} className='p-4 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-between'>
                <div>
                  <p className='font-bold text-gray-800'>{s.name}</p>
                  <p className='text-xs text-gray-500 mt-0.5'>{s.description || 'Medical Specialty'}</p>
                </div>
                <div className='flex gap-1'>
                  <button onClick={() => openEditSpecialty(s)} className='p-1.5 hover:bg-blue-100 rounded text-xs'>✏️</button>
                  <button onClick={() => handleDeleteSpecialty(s.id)} className='p-1.5 hover:bg-red-100 rounded text-xs'>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appointments Tab (Full CRUD) */}
      {activeTab === 'appointments' && (
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
          <h2 className='text-xl font-bold text-gray-800 mb-6'>Clinic Appointments (CRUD)</h2>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left font-semibold text-gray-600'>Patient</th>
                  <th className='px-4 py-3 text-left font-semibold text-gray-600'>Doctor</th>
                  <th className='px-4 py-3 text-left font-semibold text-gray-600'>Date & Time</th>
                  <th className='px-4 py-3 text-left font-semibold text-gray-600'>Status</th>
                  <th className='px-4 py-3 text-left font-semibold text-gray-600'>Amount</th>
                  <th className='px-4 py-3 text-left font-semibold text-gray-600'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? (
                  appointments.map(apt => (
                    <tr key={apt.id} className='border-t border-gray-50 hover:bg-gray-50/50 transition'>
                      <td className='px-4 py-3 font-medium text-gray-800'>{apt.user?.name || 'N/A'}</td>
                      <td className='px-4 py-3 text-gray-600'>{apt.doctor?.user?.name || 'N/A'}</td>
                      <td className='px-4 py-3 text-gray-500'>{new Date(apt.appointment_date).toLocaleString()}</td>
                      <td className='px-4 py-3'>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${apt.status === 'completed' ? 'bg-green-100 text-green-800' : apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                          {apt.status?.charAt(0).toUpperCase() + apt.status?.slice(1)}
                        </span>
                      </td>
                      <td className='px-4 py-3 font-bold text-primary'>${apt.amount}</td>
                      <td className='px-4 py-3'>
                        <button onClick={() => handleDeleteAppointment(apt.id)} className='text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-medium'>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className='px-4 py-8 text-center text-gray-400'>No appointments recorded</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Doctor Modal */}
      {showCreateDoctorModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl'>
            <h3 className='text-2xl font-bold text-gray-900 mb-6'>Create Doctor Profile</h3>
            <form onSubmit={handleCreateDoctor} className='space-y-4'>
              <input type='text' placeholder='Full Name' value={doctorForm.name} onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })} required className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm' />
              <input type='email' placeholder='Email Address' value={doctorForm.email} onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })} required className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm' />
              <input type='password' placeholder='Password' value={doctorForm.password} onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })} required className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm' />
              <input type='tel' placeholder='Phone Number' value={doctorForm.phone} onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })} className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm' />
              <select value={doctorForm.specialty_id} onChange={(e) => setDoctorForm({ ...doctorForm, specialty_id: e.target.value })} required className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white'>
                <option value=''>Select Specialty</option>
                {specialties.map(specialty => (
                  <option key={specialty.id} value={specialty.id}>{specialty.name}</option>
                ))}
              </select>
              <input type='text' placeholder='License Number' value={doctorForm.license_number} onChange={(e) => setDoctorForm({ ...doctorForm, license_number: e.target.value })} required className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm' />
              <input type='number' placeholder='Consultation Fee ($)' value={doctorForm.consultation_fee} onChange={(e) => setDoctorForm({ ...doctorForm, consultation_fee: e.target.value })} required className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm' />
              <input type='number' placeholder='Years of Experience' value={doctorForm.years_of_experience} onChange={(e) => setDoctorForm({ ...doctorForm, years_of_experience: e.target.value })} className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm' />
              <div className='flex gap-3 pt-4'>
                <button type='submit' className='flex-1 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition'>Create</button>
                <button type='button' onClick={() => setShowCreateDoctorModal(false)} className='flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 transition'>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {editDoctorModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl'>
            <h3 className='text-2xl font-bold text-gray-900 mb-6'>Edit Doctor Profile</h3>
            <form onSubmit={handleUpdateDoctor} className='space-y-4'>
              <input type='text' placeholder='Full Name' value={doctorForm.name} onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })} required className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm' />
              <input type='email' placeholder='Email Address' value={doctorForm.email} onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })} required className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm' />
              <input type='tel' placeholder='Phone Number' value={doctorForm.phone} onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })} className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm' />
              <select value={doctorForm.specialty_id} onChange={(e) => setDoctorForm({ ...doctorForm, specialty_id: e.target.value })} required className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white'>
                <option value=''>Select Specialty</option>
                {specialties.map(specialty => (
                  <option key={specialty.id} value={specialty.id}>{specialty.name}</option>
                ))}
              </select>
              <input type='number' placeholder='Consultation Fee ($)' value={doctorForm.consultation_fee} onChange={(e) => setDoctorForm({ ...doctorForm, consultation_fee: e.target.value })} required className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm' />
              <input type='number' placeholder='Years of Experience' value={doctorForm.years_of_experience} onChange={(e) => setDoctorForm({ ...doctorForm, years_of_experience: e.target.value })} className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm' />
              <div className='flex gap-3 pt-4'>
                <button type='submit' className='flex-1 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition'>Save Changes</button>
                <button type='button' onClick={() => setEditDoctorModal(null)} className='flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 transition'>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Specialty Modal */}
      {showCreateSpecialtyModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl'>
            <h3 className='text-xl font-bold text-gray-900 mb-4'>Create Medical Specialty</h3>
            <form onSubmit={handleCreateSpecialty} className='space-y-4'>
              <input type='text' placeholder='Specialty Name (e.g. Cardiology)' value={specialtyForm.name} onChange={(e) => setSpecialtyForm({ ...specialtyForm, name: e.target.value })} required className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm' />
              <textarea placeholder='Description...' value={specialtyForm.description} onChange={(e) => setSpecialtyForm({ ...specialtyForm, description: e.target.value })} rows='3' className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none'></textarea>
              <div className='flex gap-3'>
                <button type='submit' className='flex-1 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition'>Create</button>
                <button type='button' onClick={() => setShowCreateSpecialtyModal(false)} className='flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 transition'>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Specialty Modal */}
      {editSpecialtyModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl'>
            <h3 className='text-xl font-bold text-gray-900 mb-4'>Edit Medical Specialty</h3>
            <form onSubmit={handleUpdateSpecialty} className='space-y-4'>
              <input type='text' placeholder='Specialty Name' value={specialtyForm.name} onChange={(e) => setSpecialtyForm({ ...specialtyForm, name: e.target.value })} required className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm' />
              <textarea placeholder='Description...' value={specialtyForm.description} onChange={(e) => setSpecialtyForm({ ...specialtyForm, description: e.target.value })} rows='3' className='w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none'></textarea>
              <div className='flex gap-3'>
                <button type='submit' className='flex-1 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition'>Save Changes</button>
                <button type='button' onClick={() => setEditSpecialtyModal(null)} className='flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 transition'>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
