'use client'

import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa'
import { db, auth, storage } from '@/firebase/clientApp'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

// Medical specialties array
const medicalSpecialties = [
  "Allergy and Immunology",
  "Anesthesiology",
  "Cardiothoracic Surgery",
  "Cardiology",
  "Child and Adolescent Psychiatry",
  "Dermatology",
  "Emergency Medicine",
  "Endocrinology",
  "Family Medicine",
  "Gastroenterology",
  "General Surgery",
  "General Practitioner",
  "Geriatric Psychiatry",
  "Geriatrics",
  "Gynecology",
  "Hematology",
  "Infectious Disease",
  "Internal Medicine",
  "Interventional Radiology",
  "Maternal-Fetal Medicine",
  "Medical Genetics",
  "Neonatology",
  "Nephrology",
  "Neurology",
  "Neurosurgery",
  "Nuclear Medicine",
  "Obstetrics",
  "Oncology",
  "Ophthalmology",
  "Orthopedic Surgery",
  "Otolaryngology",
  "Pain Management",
  "Pathology",
  "Pediatrics",
  "Pediatric Cardiology",
  "Pediatric Oncology",
  "Physical Medicine and Rehabilitation",
  "Plastic Surgery",
  "Preventive Medicine",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Reproductive Endocrinology and Infertility",
  "Rheumatology",
  "Sleep Medicine",
  "Sports Medicine",
  "Urology",
];

// Nigerian languages array
const nigerianLanguages = [
  "Hausa",
  "Igbo",
  "Yoruba",
  "Fulfulde",
  "Kanuri",
  "Ibibio",
  "Tiv",
  "Edo",
  "Nupe",
  "Gwari",
  "Ijaw",
  "Urhobo",
  "Efik",
  "Idoma",
  "Igala",
  "Ebira",
  "Berom",
  "Chokwe",
  "Mumuye",
  "Kambari",
  "Ukwuani",
  "Esan",
  "Isoko",
  "Etsako",
  "Okpe",
  "Itshekiri",
  "Kalabari",
  "Nembe",
  "Ogoni",
  "Ekpeye"
];

const Register = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    phoneNumber: '',
    gender: '',
    institution: '',
    graduation: '',
    housemanship: '',
    yearHousemanship: '',
    registrationDate: '',
    workAddress: '',
    homeAddress: '',
    maritalStatus: '',
    stateOfOrigin: '',
    specialization: '',
    bio: '',
    experience: '',
    currency: 'NGN', // Default to NGN
    otherLanguage: '',
    photoUrl: null as File | null,
    certificate: null as File | null,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [certificatePreview, setCertificatePreview] = useState<string | null>(null)
  const [photoUploadProgress, setPhotoUploadProgress] = useState<number | null>(null)
  const [certificateUploadProgress, setCertificateUploadProgress] = useState<number | null>(null)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)

  // Handle navigation after successful registration
  useEffect(() => {
    if (registrationSuccess) {
      router.push('/success');
    }
  }, [registrationSuccess, router]);

  // Email validation
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validatePassword = (password: string) => password.length >= 6

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages(prev => {
      const newSelection = prev.includes(language)
        ? prev.filter(lang => lang !== language)
        : [...prev, language]

      // Update formData with comma-separated string
      setFormData(prevForm => ({
        ...prevForm,
        otherLanguage: newSelection.join(',')
      }))

      return newSelection
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'certificate') => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit')
        return
      }
      setFormData(prev => ({ ...prev, [field]: file }))
      const previewUrl = URL.createObjectURL(file)
      if (field === 'photoUrl') setPhotoPreview(previewUrl)
      else setCertificatePreview(previewUrl)
    }
  }

  // Send OTP
  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error('Please enter your email')
      return false
    }
    if (!validateEmail(formData.email)) {
      toast.error('Invalid email')
      return false
    }

    setSendingOtp(true)
    try {
      const otp = Math.floor(10000 + Math.random() * 90000).toString()
      const response = await fetch(
        'https://us-central1-instant-doctor-a4e4c.cloudfunctions.net/api/mail/otp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, otp }),
        }
      )

      if (!response.ok) throw new Error('Failed to send OTP')
      toast.success('OTP sent to your email!')
      setOtpSent(true)
      sessionStorage.setItem('otp', otp)
      return true
    } catch (error) {
      console.error('Failed to send OTP:', error)
      toast.error('Failed to send OTP. Please try again.')
      return false
    } finally {
      setSendingOtp(false)
    }
  }

  const handleVerifyOTP = () => {
    const storedOtp = sessionStorage.getItem('otp')
    if (otp === storedOtp) {
      toast.success('OTP verified!')
      sessionStorage.removeItem('otp')
      return true
    } else {
      toast.error('Invalid OTP')
      return false
    }
  }

  // Upload file to storage
  const uploadFile = async (file: File, path: string, setProgress: (progress: number | null) => void) => {
    return new Promise<string>((resolve, reject) => {
      const storageRef = ref(storage, path)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setProgress(progress)
        },
        (error) => {
          setProgress(null)
          reject(error)
        },
        async () => {
          setProgress(null)
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(downloadURL)
          } catch (error) {
            reject(error)
          }
        }
      )
    })
  }

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form data
    if (!validateEmail(formData.email)) {
      toast.error('Invalid email')
      return
    }

    if (!validatePassword(formData.password)) {
      toast.error('Password must be at least 6 characters')
      return
    }

    // If OTP hasn't been sent yet, send it
    if (!otpSent) {
      await handleSendOTP()
      return
    }

    // If OTP has been sent but not verified, verify it
    if (!handleVerifyOTP()) {
      return
    }


    setIsLoading(true)

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const userId = userCredential.user.uid

      let photoUrl = ''
      let certificateUrl = ''

      // Upload profile photo if exists
      if (formData.photoUrl) {
        try {
          photoUrl = await uploadFile(
            formData.photoUrl,
            `profiles/${userId}/${formData.photoUrl.name}`,
            setPhotoUploadProgress
          )
        } catch (error) {
          console.error('Photo upload failed:', error)
          toast.error('Photo upload failed. Please try again.')
          setIsLoading(false)
          return
        }
      }

      // Upload certificate if exists
      if (formData.certificate) {
        try {
          certificateUrl = await uploadFile(
            formData.certificate,
            `certificates/${userId}/${formData.certificate.name}`,
            setCertificateUploadProgress
          )
        } catch (error) {
          console.error('Certificate upload failed:', error)
          toast.error('Certificate upload failed. Please try again.')
          setIsLoading(false)
          return
        }
      }

      // Prepare user data for Firestore
      const userData = {
        ...formData,
        experience: parseInt(formData.experience) || 0,
        id: userId,
        role: 'Doctor',
        accountStatus: 'pending',
        photoUrl,
        certificate: certificateUrl,
        isAvailable: false,
        workingHour: [],
        createdAt: new Date().toISOString(),
      }

      // Save user data to Firestore
      await setDoc(doc(db, 'Users', userId), userData)

      // Set cookies for user session
      document.cookie = `userId=${userId}; path=/; max-age=${7 * 24 * 60 * 60}`
      document.cookie = `userName=${formData.firstname} ${formData.lastname}; path=/; max-age=${7 * 24 * 60 * 60}`

      setRegistrationSuccess(true)

    } catch (error: unknown) {
      console.error('Registration error:', error)

      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string }
        if (firebaseError.code === 'auth/email-already-in-use') {
          toast.error('Email already registered. Please use a different email.')
        } else if (firebaseError.code === 'auth/weak-password') {
          toast.error('Password is too weak. Please use a stronger password.')
        } else {
          toast.error('Registration failed. Please try again.')
        }
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Cleanup previews
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
      if (certificatePreview) URL.revokeObjectURL(certificatePreview)
    }
  }, [photoPreview, certificatePreview])

  return (
    <div className='min-h-screen bg-gray-50'>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Main Content */}
        <div className='w-full lg:w-1/2 px-4 sm:px-6 md:px-8 lg:px-16 py-4 sm:py-6 md:py-8 lg:py-10'>
          {/* Header - Sticky on mobile */}
          <div className="sticky top-0 z-20 bg-gray-50 pb-4 mb-4 border-b border-gray-200 lg:border-b-0 lg:static lg:pb-0 lg:mb-8">
            <div className="flex justify-center lg:justify-start">
              <Image
                alt='logo'
                src={'/logo.png'}
                width={160}
                height={40}
                className='h-8 sm:h-10 w-auto'
                priority
              />
            </div>
            <div className='mt-4 sm:mt-6 lg:mt-8 text-center lg:text-left'>
              <h4 className='font-bold text-2xl sm:text-3xl text-gray-800'>Create Account</h4>
              <p className='text-gray-600 text-sm sm:text-base'>Please enter your details</p>
            </div>
          </div>

          {/* Registration Form */}
          <div className="flex-1 pb-20 lg:pb-0">
            <form onSubmit={handleRegister} className='space-y-4 sm:space-y-6'>
              {/* Personal Information Section */}
              <div className="space-y-4 sm:space-y-6">
                <h5 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h5>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                    <input
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base"
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      placeholder="First Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                    <input
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base"
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      placeholder="Last Name"
                      required
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email Address"
                      required
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                    <div className="relative">
                      <input
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent pr-10 text-sm sm:text-base"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                    <input
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base"
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Gender</label>
                    <select
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Marital Status</label>
                    <select
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base"
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Marital Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">State of Origin</label>
                    <input
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base"
                      type="text"
                      name="stateOfOrigin"
                      value={formData.stateOfOrigin}
                      onChange={handleInputChange}
                      placeholder="State of Origin"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="space-y-4 sm:space-y-6">
                <h5 className="text-lg font-semibold text-gray-800 border-b pb-2">Professional Information</h5>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Institution</label>
                    <input
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base"
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      placeholder="Medical Institution"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Graduation Year</label>
                    <input
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base"
                      type="text"
                      name="graduation"
                      value={formData.graduation}
                      onChange={handleInputChange}
                      placeholder="Graduation Year"
                      required
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Housemanship</label>
                    <input
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base"
                      type="text"
                      name="housemanship"
                      value={formData.housemanship}
                      onChange={handleInputChange}
                      placeholder="Housemanship Institution"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Year of Housemanship</label>
                    <input
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base"
                      type="text"
                      name="yearHousemanship"
                      value={formData.yearHousemanship}
                      onChange={handleInputChange}
                      placeholder="Year of Housemanship"
                      required
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Registration Date</label>
                    <input
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base"
                      type="date"
                      name="registrationDate"
                      value={formData.registrationDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Specialization</label>
                    <select
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Specialization</option>
                      {medicalSpecialties.map((specialty) => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Experience (Years)</label>
                  <input
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base"
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="Years of Experience"
                    required
                  />
                </div>
              </div>

              {/* Address Information Section */}
              <div className="space-y-4 sm:space-y-6">
                <h5 className="text-lg font-semibold text-gray-800 border-b pb-2">Address Information</h5>

                <div className='grid grid-cols-1 gap-4'>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Work Address</label>
                    <input
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base"
                      type="text"
                      name="workAddress"
                      value={formData.workAddress}
                      onChange={handleInputChange}
                      placeholder="Work Address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Home Address</label>
                    <input
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base"
                      type="text"
                      name="homeAddress"
                      value={formData.homeAddress}
                      onChange={handleInputChange}
                      placeholder="Home Address"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Languages Section */}
              <div className="space-y-4">
                <h5 className="text-lg font-semibold text-gray-800 border-b pb-2">Languages</h5>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Other Languages</label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-left bg-white flex justify-between items-center text-sm sm:text-base"
                      onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                    >
                      <span className={selectedLanguages.length > 0 ? "text-gray-800" : "text-gray-500"}>
                        {selectedLanguages.length > 0
                          ? `${selectedLanguages.length} language(s) selected`
                          : 'Select Languages'
                        }
                      </span>
                      <svg
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {languageDropdownOpen && (
                      <div className="absolute z-30 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 sm:max-h-60 overflow-y-auto">
                        {nigerianLanguages.map((language) => (
                          <label
                            key={language}
                            className="flex items-center px-3 sm:px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm sm:text-base"
                          >
                            <input
                              type="checkbox"
                              checked={selectedLanguages.includes(language)}
                              onChange={() => handleLanguageToggle(language)}
                              className="mr-2 sm:mr-3 text-primary focus:ring-primary"
                            />
                            <span className="text-gray-700">{language}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedLanguages.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedLanguages.map((language) => (
                        <span
                          key={language}
                          className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-primary/10 text-primary"
                        >
                          {language}
                          <button
                            type="button"
                            onClick={() => handleLanguageToggle(language)}
                            className="ml-1 sm:ml-2 text-primary hover:text-primary-dark font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Files Section */}
              <div className="space-y-4 sm:space-y-6">
                <h5 className="text-lg font-semibold text-gray-800 border-b pb-2">Documents</h5>

                <div className='grid grid-cols-1 gap-4'>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Profile Photo</label>
                    <input
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'photoUrl')}
                      required
                    />
                    {photoPreview && (
                      <div className="mt-3">
                        <Image src={photoPreview} alt="Profile Preview" className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border-2 border-gray-200" width={200} height={200} />
                      </div>
                    )}
                    {photoUploadProgress !== null && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${photoUploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">Uploading: {Math.round(photoUploadProgress)}%</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Medical Certificate</label>
                    <input
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'certificate')}
                      required
                    />
                    {certificatePreview && (
                      <div className="mt-2">
                        <p className="text-xs sm:text-sm text-gray-600 bg-gray-100 p-2 rounded">Selected: {formData.certificate?.name}</p>
                      </div>
                    )}
                    {certificateUploadProgress !== null && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${certificateUploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">Uploading: {Math.round(certificateUploadProgress)}%</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="space-y-4">
                <h5 className="text-lg font-semibold text-gray-800 border-b pb-2">About You</h5>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Bio</label>
                  <textarea
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base resize-none"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself and your medical expertise"
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* OTP Section */}
              {otpSent && (
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-gray-800 border-b pb-2">Verification</h5>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">OTP Code</label>
                    <input
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm sm:text-base text-center tracking-wider"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 5-digit OTP"
                      maxLength={5}
                      required
                    />
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">Check your email for the verification code</p>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Submit Button - Fixed at bottom on mobile */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:p-6 lg:static lg:bg-transparent lg:border-t-0 lg:p-0 lg:mt-8 z-10">
            <button
              onClick={handleRegister}
              className="w-full bg-primary text-white py-3 sm:py-4 rounded-lg hover:bg-primary-dark font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2 text-sm sm:text-base"
              disabled={isLoading || sendingOtp}
              type="button"
            >
              {sendingOtp ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Sending OTP...
                </>
              ) : isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  {otpSent ? 'Registering...' : 'Processing...'}
                </>
              ) : otpSent ? (
                'Verify OTP & Register'
              ) : (
                'Send OTP'
              )}
            </button>
          </div>
        </div>

        {/* Right side - Hidden on mobile, visible on larger screens */}
        <div className="hidden lg:block relative w-1/2 bg-[url('/login_bg.png')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <h2 className="text-4xl font-bold mb-4">Doctor Account</h2>
              <p className="text-xl opacity-90">Your complete doctor solution</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register