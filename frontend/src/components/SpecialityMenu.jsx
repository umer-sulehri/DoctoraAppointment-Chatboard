import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { specialityData } from '../assets/assets'

const SpecialityMenu = () => {
    const { specialties } = useContext(AppContext)

    // Use API specialties if available, else fallback to static data
    const displaySpecialties = specialties && specialties.length > 0
        ? specialties.map(s => ({
            id: s.id,
            speciality: s.name,
            image: specialityData.find(sd => sd.speciality.toLowerCase() === s.name.toLowerCase())?.image
                || specialityData[0]?.image
        }))
        : specialityData.map((s, i) => ({ ...s, id: i + 1 }))

    return (
        <div className='flex flex-col items-center gap-4 py-16 text-gray-800' id='speciality'>
            <h1 className='text-3xl font-medium'>Find by Speciality</h1>
            <p className='sm:w-1/3 text-center text-sm'>Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.</p>
            <div className="flex sm:justify-center gap-4 pt-4 w-full overflow-x-auto">
                {displaySpecialties.map((item, index) => (
                    <Link
                        onClick={() => scrollTo(0, 0)}
                        className='flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500 group'
                        key={item.id || index}
                        to={item.id ? `/doctors/${item.id}` : `/doctors/${item.speciality}`}
                    >
                        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-blue-50 flex items-center justify-center mb-2 group-hover:bg-blue-100 transition overflow-hidden">
                            {item.image ? (
                                <img className='w-12 h-12 sm:w-20 sm:h-20 object-contain' src={item.image} alt={item.speciality} />
                            ) : (
                                <span className="text-2xl">🏥</span>
                            )}
                        </div>
                        <p className="text-center font-medium text-gray-700 w-20 text-xs">{item.speciality}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default SpecialityMenu