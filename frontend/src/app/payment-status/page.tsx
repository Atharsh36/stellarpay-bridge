'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PaymentStatusPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentId, setPaymentId] = useState('')
  const [status, setStatus] = useState({
    merchantConnected: true,
    requestSent: true,
    merchantApproval: false,
    merchantPayment: false,
    xlmCredit: false
  })

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      setPaymentId(id)
      // Simulate status updates
      setTimeout(() => {
        setStatus(prev => ({ ...prev, merchantApproval: true }))
      }, 2000)
    }
  }, [searchParams])

  const steps = [
    { 
      number: 1, 
      label: 'Merchant Connected', 
      completed: status.merchantConnected,
      icon: '✅'
    },
    { 
      number: 2, 
      label: 'Payment Request Sent', 
      completed: status.requestSent,
      icon: '✅'
    },
    { 
      number: 3, 
      label: 'Waiting for Merchant Approval', 
      completed: status.merchantApproval,
      icon: status.merchantApproval ? '✅' : '⏳'
    },
    { 
      number: 4, 
      label: 'Merchant Payment Pending', 
      completed: status.merchantPayment,
      icon: status.merchantPayment ? '✅' : ''
    },
    { 
      number: 5, 
      label: 'XLM Credit to Merchant', 
      completed: status.xlmCredit,
      icon: status.xlmCredit ? '✅' : ''
    }
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-orange-400 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">🚀</span>
          </div>
          <span className="text-white text-xl font-semibold">StellarBridge Pay</span>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-orange-900/50 hover:bg-orange-900/70 text-orange-300 px-6 py-2 rounded-full font-medium border border-orange-700/50"
        >
          ← Dashboard
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 rounded-full p-4 mb-4">
            <span className="text-6xl">🎉</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Payment Initiated!</h1>
          <p className="text-orange-500 text-lg">Track your payment progress below</p>
          {paymentId && (
            <p className="text-orange-300 text-sm mt-2">Payment ID: {paymentId}</p>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50 mb-6">
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-2xl">🔗</span>
            <h2 className="text-2xl font-bold text-orange-400">Next Steps</h2>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
                  step.completed
                    ? 'bg-green-900/30 border border-green-700/50'
                    : index === 2 && !step.completed
                    ? 'bg-yellow-900/30 border border-yellow-700/50 animate-pulse'
                    : 'bg-gray-800/30 border border-gray-700/50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step.completed
                      ? 'bg-green-600 text-white'
                      : index === 2 && !step.completed
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {step.number}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-semibold ${
                      step.completed
                        ? 'text-green-300'
                        : index === 2 && !step.completed
                        ? 'text-yellow-300'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                <span className="text-2xl">{step.icon}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-6 mb-6">
          <p className="text-blue-300 text-sm">
            💡 <strong>What happens next?</strong>
            <br />
            The merchant will receive your payment request and process the UPI payment. Once confirmed, XLM will be automatically transferred to the merchant's wallet via smart contract.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-900/50 hover:bg-orange-900/70 text-orange-300 px-6 py-3 rounded-xl font-medium border border-orange-700/50"
          >
            🔄 Refresh Status
          </button>
        </div>
      </main>
    </div>
  )
}
