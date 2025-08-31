'use client'

import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { FaEye, FaEyeSlash, FaCheckCircle, FaSpinner } from 'react-icons/fa'
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
    currency: '',
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
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
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

    // If OTP hasn't been sent yet, send it
    if (!otpSent) {
      await handleSendOTP()
      return
    }

    // If OTP has been sent but not verified, verify it
    if (!handleVerifyOTP()) {
      return
    }

    // Validate form data
    if (!validateEmail(formData.email)) {
      toast.error('Invalid email')
      return
    }

    if (!validatePassword(formData.password)) {
      toast.error('Password must be at least 6 characters')
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

      // Set success state to show success page
      setUserName(`${formData.firstname} ${formData.lastname}`)
      setUserEmail(formData.email)
      setRegistrationSuccess(true)

    } catch (error: any) {
      console.error('Registration error:', error)

      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already registered. Please use a different email.')
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak. Please use a stronger password.')
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
    <div className='flex min-h-screen bg-gray-50'>
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

      {/* Left side */}
      <div className='w-full md:w-1/2 p-6 md:p-10 lg:p-16 flex flex-col'>
        <div className="sticky top-0 z-10 bg-gray-50 pt-4">
          <Image alt='logo' src={'/logo.png'} width={200} height={50} className='mx-auto md:mx-0' priority />
          <div className='mt-8 mb-4 text-center md:text-left'>
            <h4 className='font-bold text-3xl text-gray-800'>Create Account</h4>
            <p className='text-gray-600'>Please enter your details</p>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className='mt-4 flex-1 flex flex-col'>
          <div className='grid md:grid-cols-2 gap-4 flex-1 overflow-y-auto pb-24'>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
              <input
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleInputChange}
                placeholder="First Name"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
              <input
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                placeholder="Last Name"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                required
              />
            </div>
            <div className="mb-4 relative">
              <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent pr-10"
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
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
              <input
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Phone Number"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Gender</label>
              <select
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
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
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Institution</label>
              <input
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleInputChange}
                placeholder="Institution"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Graduation Year</label>
              <input
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                type="text"
                name="graduation"
                value={formData.graduation}
                onChange={handleInputChange}
                placeholder="Graduation Year"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Housemanship</label>
              <input
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                type="text"
                name="housemanship"
                value={formData.housemanship}
                onChange={handleInputChange}
                placeholder="Housemanship"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Year of Housemanship</label>
              <input
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                type="text"
                name="yearHousemanship"
                value={formData.yearHousemanship}
                onChange={handleInputChange}
                placeholder="Year of Housemanship"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Registration Date</label>
              <input
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                type="date"
                name="registrationDate"
                value={formData.registrationDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Specialization</label>
              <select
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
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
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Work Address</label>
              <input
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                type="text"
                name="workAddress"
                value={formData.workAddress}
                onChange={handleInputChange}
                placeholder="Work Address"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Home Address</label>
              <input
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                type="text"
                name="homeAddress"
                value={formData.homeAddress}
                onChange={handleInputChange}
                placeholder="Home Address"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Marital Status</label>
              <select
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
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
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">State of Origin</label>
              <input
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                type="text"
                name="stateOfOrigin"
                value={formData.stateOfOrigin}
                onChange={handleInputChange}
                placeholder="State of Origin"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Experience (Years)</label>
              <input
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="Years of Experience"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Currency</label>
              <input
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                placeholder="Preferred Currency"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Other Languages</label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent text-left bg-white flex justify-between items-center"
                  onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                >
                  <span className="text-gray-500">
                    {selectedLanguages.length > 0
                      ? `${selectedLanguages.length} language(s) selected`
                      : 'Select Languages'
                    }
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {languageDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {nigerianLanguages.map((language) => (
                      <label
                        key={language}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLanguages.includes(language)}
                          onChange={() => handleLanguageToggle(language)}
                          className="mr-3 text-primary focus:ring-primary"
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
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                    >
                      {language}
                      <button
                        type="button"
                        onClick={() => handleLanguageToggle(language)}
                        className="ml-2 text-primary hover:text-primary-dark"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Profile Photo</label>
              <input
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'photoUrl')}
                required
              />
              {photoPreview && (
                <div className="mt-2">
                  <img src={photoPreview} alt="Profile Preview" className="w-32 h-32 object-cover rounded-lg" />
                </div>
              )}
              {photoUploadProgress !== null && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${photoUploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Uploading: {Math.round(photoUploadProgress)}%</p>
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Certificate</label>
              <input
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e, 'certificate')}
                required
              />
              {certificatePreview && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Selected: {formData.certificate?.name}</p>
                </div>
              )}
              {certificateUploadProgress !== null && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${certificateUploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Uploading: {Math.round(certificateUploadProgress)}%</p>
                </div>
              )}
            </div>
            <div className="mb-4 col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">Bio</label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself"
                rows={4}
                required
              />
            </div>
            {otpSent && (
              <div className="mb-4 col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2">OTP</label>
                <input
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  required
                />
              </div>
            )}
          </div>
          <div className="sticky bottom-0 bg-gray-50 pt-4 pb-6 z-10 border-t border-gray-200">
            <button
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark font-medium transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              disabled={isLoading || sendingOtp}
              type="submit"
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
        </form>
      </div>

      {/* Right side */}
      <div className="hidden md:block relative w-1/2 bg-[url('/login_bg.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <h2 className="text-4xl font-bold mb-4">Doctor Account</h2>
            <p className="text-xl opacity-90">Your complete doctor solution</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register