'use client'

import { FaCheckCircle } from "react-icons/fa";
import { useRouter } from 'next/navigation'

// Success Page Component
const RegistrationSuccess = () => {
    const router = useRouter();

    const handleGoToDashboard = () => {
        router.push('/dashboard');
    };

    const handleGoToHome = () => {
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-4 rounded-full">
                        <FaCheckCircle className="text-green-500 text-5xl" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Registration Successful!</h1>
                <p className="text-gray-600 mb-2">
                    Thank you <span className="font-semibold"></span>!
                </p>
                <p className="text-gray-600 mb-6">
                    Your account has been created successfully and is pending verification.
                </p>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
                    <ul className="text-sm text-blue-600 text-left list-disc pl-5 space-y-1">
                        <li>Your account will be reviewed by our team</li>
                        <li>You'll receive notification once approved</li>
                    </ul>
                </div>


            </div>
        </div>
    );
};
export default RegistrationSuccess;