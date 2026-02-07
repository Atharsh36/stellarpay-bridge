'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'

export default function PaymentConfirm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [processing, setProcessing] = useState(true)
  const [customAmount, setCustomAmount] = useState('')
  const [amountType, setAmountType] = useState<'INR' | 'XLM'>('INR')
  const [userDetails, setUserDetails] = useState({
    name: '',
    phone: '',
    address: ''
  })
  
  const upiId = searchParams.get('upiId') || ''
  const scannedAmount = searchParams.get('amount') || '0'
  const name = searchParams.get('name') || ''
  const scannedXlm = searchParams.get('xlmAmount') || '0'

  useEffect(() => {
    setTimeout(() => {
      setProcessing(false)
    }, 1500)
  }, [])

  const calculateXLM = (inr: number) => {
    return (inr / 10).toFixed(4) // 1 XLM = 10 INR
  }

  const calculateINR = (xlm: number) => {
    return (xlm * 10).toFixed(2) // 1 XLM = 10 INR
  }

  const getFinalAmount = () => {
    if (!customAmount) {
      return {
        inr: scannedAmount,
        xlm: scannedXlm
      }
    }
    
    if (amountType === 'INR') {
      return {
        inr: customAmount,
        xlm: calculateXLM(parseFloat(customAmount))
      }
    } else {
      return {
        inr: calculateINR(parseFloat(customAmount)),
        xlm: customAmount
      }
    }
  }

  const confirmCredit = async () => {
    const final = getFinalAmount()
    
    if (!userDetails.name || !userDetails.phone) {
      alert('Please fill in your name and phone number')
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please login again')
        router.push('/')
        return
      }
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
      const response = await axios.post(`${API_URL}/api/payments/create`, {
        merchantEmail: 'merchant@test.com',
        merchantUpiId: upiId,
        merchantName: name || 'Unknown Merchant',
        amountInInr: parseFloat(final.inr),
        amountInXlm: parseFloat(final.xlm),
        userDetails: userDetails
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      })
      
      const params = new URLSearchParams({
        upiId,
        amount: final.inr,
        name: name || 'Unknown Merchant',
        xlmAmount: final.xlm,
        paymentId: response.data.payment?.id || response.data.id
      })
      
      router.push(`/payment-success?${params.toString()}`)
    } catch (error: any) {
      console.error('Payment creation error:', error)
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        alert('Backend server is not running. Please start the backend server on port 3001.')
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Session expired. Please login again.')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/')
      } else {
        const errorMessage = error.response?.data?.error || error.message || 'Network Error'
        alert(`Failed to create payment request: ${errorMessage}`)
      }
    }
  }

  const finalAmount = getFinalAmount()

  return (
    <div className="min-h-screen bg-black relative overflow-hidden p-8">
      {/* Animated Stars Background */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-orange-400 rounded-full animate-pulse opacity-${[20, 40, 60][i % 3]}`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-md mx-auto relative z-10">
        <div className="bg-orange-900/20 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-orange-500/30">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white">Payment Confirmation</h1>
          </div>

          {processing ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-orange-300">Processing payment details...</p>
            </div>
          ) : (
            <div>
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-black/20 rounded-2xl border border-orange-500/30">
                  <h3 className="font-semibold text-orange-300 mb-3">💳 UPI Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">UPI ID:</span>
                      <span className="font-mono text-white">{upiId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Merchant:</span>
                      <span className="text-white">{name || 'N/A'}</span>
                    </div>
                    {scannedAmount !== '0' && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Scanned Amount:</span>
                        <span className="text-orange-300">₹{scannedAmount}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-black/20 rounded-2xl border border-orange-500/30">
                  <h3 className="font-semibold text-orange-300 mb-3">👤 Your Details</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={userDetails.name}
                      onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                      className="w-full p-3 bg-black/40 border border-orange-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={userDetails.phone}
                      onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})}
                      className="w-full p-3 bg-black/40 border border-orange-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Address (Optional)"
                      value={userDetails.address}
                      onChange={(e) => setUserDetails({...userDetails, address: e.target.value})}
                      className="w-full p-3 bg-black/40 border border-orange-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="p-4 bg-black/20 rounded-2xl border border-orange-500/30">
                  <h3 className="font-semibold text-orange-300 mb-3">💰 Enter Amount</h3>
                  
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setAmountType('INR')}
                      className={`flex-1 py-2 rounded-xl font-medium transition-colors ${
                        amountType === 'INR' 
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                          : 'bg-black/40 text-gray-300 border border-orange-500/30'
                      }`}
                    >
                      INR (₹)
                    </button>
                    <button
                      onClick={() => setAmountType('XLM')}
                      className={`flex-1 py-2 rounded-xl font-medium transition-colors ${
                        amountType === 'XLM' 
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                          : 'bg-black/40 text-gray-300 border border-orange-500/30'
                      }`}
                    >
                      XLM
                    </button>
                  </div>

                  <input
                    type="number"
                    placeholder={`Enter amount in ${amountType}`}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full p-3 bg-black/40 border border-orange-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  
                  <div className="mt-3 p-3 bg-black/40 rounded-xl border border-orange-500/30">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Amount (INR):</span>
                      <span className="font-bold text-green-400">₹{finalAmount.inr}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">XLM Equivalent:</span>
                      <span className="font-bold text-orange-400">{finalAmount.xlm} XLM</span>
                    </div>
                    <div className="text-xs text-gray-400 text-center mt-2">
                      Rate: 1 XLM = ₹10
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={confirmCredit}
                  disabled={!customAmount && scannedAmount === '0' || !userDetails.name || !userDetails.phone}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  ✅ Confirm & Send Details
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}