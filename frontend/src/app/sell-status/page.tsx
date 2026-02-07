'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SellStatusPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sellRequest, setSellRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const orderId = searchParams.get('id')
    if (!orderId) {
      router.push('/dashboard')
      return
    }

    fetchSellRequest(orderId)
    
    // Auto-refresh every 3 seconds
    const interval = setInterval(() => {
      fetchSellRequest(orderId)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [searchParams, router])

  const fetchSellRequest = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/sell-request/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setSellRequest(data)
    } catch (error) {
      console.error('Error fetching sell request:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!sellRequest) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-xl">Sell request not found</div>
      </div>
    )
  }

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
          ← Back to Dashboard
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Sell Order Status</h1>
          <p className="text-orange-500 text-lg">Order ID: #{sellRequest.id}</p>
        </div>

        {/* Order Details */}
        <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 16L10.91 9.74L2 9L10.91 8.26L12 2L13.09 8.26L22 9L13.09 9.74L12 16M8 21L9 18H15L16 21H8Z"/>
            </svg>
            <h2 className="text-2xl font-bold text-white">Order Details</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-orange-300 text-sm mb-1">XLM Amount</p>
              <p className="text-white text-xl font-bold">{sellRequest.xlmAmount} XLM</p>
            </div>
            <div>
              <p className="text-orange-300 text-sm mb-1">INR Amount</p>
              <p className="text-green-400 text-xl font-bold">₹{sellRequest.inrAmount}</p>
            </div>
            <div>
              <p className="text-orange-300 text-sm mb-1">Your UPI ID</p>
              <p className="text-white font-semibold">{sellRequest.upiId}</p>
            </div>
            <div>
              <p className="text-orange-300 text-sm mb-1">Created</p>
              <p className="text-white font-semibold">{new Date(sellRequest.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50 mb-8">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {sellRequest.status === 'PENDING' ? '⏳' : 
               sellRequest.status === 'APPROVED' ? '✅' : 
               sellRequest.status === 'COMPLETED' ? '🎉' : '❌'}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {sellRequest.status === 'PENDING' ? 'Waiting for Merchant Approval' :
               sellRequest.status === 'APPROVED' ? 'Approved - Merchant Processing Payment' :
               sellRequest.status === 'COMPLETED' ? 'Order Completed!' : 'Order Rejected'}
            </h3>
            <p className="text-orange-300">
              {sellRequest.status === 'PENDING' ? 'Your sell request is being reviewed by our merchant partners.' :
               sellRequest.status === 'APPROVED' ? 'Merchant will send INR to your UPI ID and confirm the payment.' :
               sellRequest.status === 'COMPLETED' ? 'XLM has been transferred and you should receive INR in your UPI account.' :
               'Your sell request was rejected. Please try again.'}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50">
          <h3 className="text-xl font-bold text-white mb-6">Progress</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <p className="text-white font-semibold">Sell Request Created</p>
                <p className="text-orange-300 text-sm">Order submitted successfully</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                sellRequest.status !== 'PENDING' ? 'bg-green-500' : 'bg-orange-500'
              }`}>
                <span className="text-white text-sm">
                  {sellRequest.status !== 'PENDING' ? '✓' : '2'}
                </span>
              </div>
              <div>
                <p className="text-white font-semibold">Merchant Approval</p>
                <p className="text-orange-300 text-sm">
                  {sellRequest.status === 'PENDING' ? 'Waiting for approval...' : 'Approved by merchant'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                sellRequest.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-500'
              }`}>
                <span className="text-white text-sm">
                  {sellRequest.status === 'COMPLETED' ? '✓' : '3'}
                </span>
              </div>
              <div>
                <p className="text-white font-semibold">Payment & Transfer</p>
                <p className="text-orange-300 text-sm">
                  {sellRequest.status === 'COMPLETED' ? 'XLM transferred, INR sent to UPI' : 'Pending completion'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {sellRequest.status === 'COMPLETED' && sellRequest.transactionHash && (
          <div className="mt-6 text-center">
            <button
              onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${sellRequest.transactionHash}`, '_blank')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium"
            >
              View Transaction on Explorer →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}