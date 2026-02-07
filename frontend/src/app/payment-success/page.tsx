'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PaymentSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderId] = useState(`ORD${Date.now()}`)
  const [paymentStatus, setPaymentStatus] = useState('PENDING')
  const [loading, setLoading] = useState(true)
  
  const upiId = searchParams.get('upiId') || ''
  const amount = searchParams.get('amount') || ''
  const name = searchParams.get('name') || ''
  const xlmAmount = searchParams.get('xlmAmount') || ''
  const paymentId = searchParams.get('paymentId') || ''

  useEffect(() => {
    if (!paymentId) {
      setLoading(false)
      return
    }

    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        const payment = data.find((p: any) => p.id === paymentId)
        if (payment) {
          setPaymentStatus(payment.status)
        }
      } catch (error) {
        console.error('Error fetching payment status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [paymentId])

  const getStepStatus = (step: number) => {
    if (paymentStatus === 'COMPLETED') return step <= 5
    if (paymentStatus === 'CONFIRMED') return step <= 4
    if (paymentStatus === 'APPROVED') return step <= 3
    return step <= 2
  }

  const getStepStyle = (step: number) => {
    const isActive = getStepStatus(step)
    const isCurrent = (paymentStatus === 'PENDING' && step === 3) || 
                      (paymentStatus === 'APPROVED' && step === 3) ||
                      (paymentStatus === 'CONFIRMED' && step === 4) ||
                      (paymentStatus === 'COMPLETED' && step === 5)
    
    if (isActive && !isCurrent) {
      return {
        container: 'bg-orange-500/10 rounded-xl border border-orange-500/20',
        badge: 'bg-orange-500 text-white shadow-lg',
        text: 'text-white font-medium'
      }
    }
    if (isCurrent) {
      return {
        container: 'bg-yellow-500/10 rounded-xl border border-yellow-500/30',
        badge: 'bg-yellow-500 text-white shadow-lg',
        text: 'text-white font-medium'
      }
    }
    return {
      container: 'bg-gray-800/30 rounded-xl border border-gray-700/30',
      badge: 'bg-gray-600 text-gray-400',
      text: 'text-gray-500 font-medium'
    }
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-md mx-auto">
        <div className="bg-orange-900/20 backdrop-blur-lg rounded-3xl border border-orange-500/30 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-orange-500 mb-2">Payment Successful!</h1>
            <p className="text-gray-400">Your payment request has been created</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-6 bg-orange-900/10 rounded-2xl border border-orange-500/20">
              <h3 className="font-semibold text-orange-400 mb-4 flex items-center gap-2">
                📋 Order Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Order ID:</span>
                  <span className="font-mono font-bold text-white">{orderId}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Amount:</span>
                  <span className="font-bold text-white">₹{amount}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>XLM Equivalent:</span>
                  <span className="font-bold text-orange-400">{xlmAmount} XLM</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Merchant UPI:</span>
                  <span className="font-mono text-white">{upiId}</span>
                </div>
                {name && (
                  <div className="flex justify-between text-gray-300">
                    <span>Merchant Name:</span>
                    <span className="text-white">{name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-orange-900/20 to-orange-800/10 rounded-2xl border border-orange-500/30">
              <h3 className="font-bold text-orange-400 mb-5 flex items-center gap-2 text-lg">
                🔗 Next Steps
              </h3>
              <div className="space-y-4">
                <div className={`flex items-center gap-4 p-3 ${getStepStyle(1).container}`}>
                  <span className={`w-8 h-8 ${getStepStyle(1).badge} rounded-full flex items-center justify-center text-sm font-bold`}>1</span>
                  <span className={getStepStyle(1).text}>Merchant Connected {getStepStatus(1) && '✅'}</span>
                </div>
                <div className={`flex items-center gap-4 p-3 ${getStepStyle(2).container}`}>
                  <span className={`w-8 h-8 ${getStepStyle(2).badge} rounded-full flex items-center justify-center text-sm font-bold`}>2</span>
                  <span className={getStepStyle(2).text}>Payment Request Sent {getStepStatus(2) && '✅'}</span>
                </div>
                <div className={`flex items-center gap-4 p-3 ${getStepStyle(3).container}`}>
                  <span className={`w-8 h-8 ${getStepStyle(3).badge} rounded-full flex items-center justify-center text-sm font-bold`}>3</span>
                  <span className={getStepStyle(3).text}>
                    {paymentStatus === 'APPROVED' || paymentStatus === 'CONFIRMED' || paymentStatus === 'COMPLETED' 
                      ? 'Merchant Approved ✅' 
                      : 'Waiting for Merchant Approval ⏳'}
                  </span>
                </div>
                <div className={`flex items-center gap-4 p-3 ${getStepStyle(4).container}`}>
                  <span className={`w-8 h-8 ${getStepStyle(4).badge} rounded-full flex items-center justify-center text-sm font-bold`}>4</span>
                  <span className={getStepStyle(4).text}>
                    {paymentStatus === 'CONFIRMED' || paymentStatus === 'COMPLETED'
                      ? 'Merchant Payment Confirmed ✅'
                      : 'Merchant Payment Pending'}
                  </span>
                </div>
                <div className={`flex items-center gap-4 p-3 ${getStepStyle(5).container}`}>
                  <span className={`w-8 h-8 ${getStepStyle(5).badge} rounded-full flex items-center justify-center text-sm font-bold`}>5</span>
                  <span className={getStepStyle(5).text}>
                    {paymentStatus === 'COMPLETED'
                      ? 'Payment Sent ✅'
                      : 'Payment Sent'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-900/20 rounded-2xl border border-yellow-500/30">
              <p className="text-sm text-yellow-400">
                <strong>📱 Track Status:</strong> Check your transaction history in the dashboard to monitor payment progress.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold transition-all"
            >
              📊 View Dashboard
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-all"
            >
              🏠 Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}