'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import QRCode from 'qrcode'

export default function BuyStatusPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestId = searchParams.get('id')
  const [buyRequest, setBuyRequest] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  useEffect(() => {
    if (requestId) {
      fetchBuyRequest()
      const interval = setInterval(fetchBuyRequest, 2000)
      return () => clearInterval(interval)
    }
  }, [requestId])

  useEffect(() => {
    if (buyRequest?.merchantUpiId) {
      generateUpiQR()
    }
  }, [buyRequest])

  const fetchBuyRequest = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/buy-request/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setBuyRequest(data)
    } catch (error) {
      console.error('Error fetching buy request:', error)
    }
  }

  const generateUpiQR = async () => {
    const upiString = `upi://pay?pa=${buyRequest.merchantUpiId}&pn=StellarBridge&am=${buyRequest.inrAmount}&cu=INR`
    try {
      const url = await QRCode.toDataURL(upiString)
      setQrCodeUrl(url)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const handleMarkAsPaid = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/buy-paid/${requestId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.status === 'PAID') {
        alert('✅ Payment marked as paid! Waiting for merchant confirmation...')
        fetchBuyRequest()
      }
    } catch (error) {
      alert('❌ Error marking as paid')
    } finally {
      setLoading(false)
    }
  }

  if (!buyRequest) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <span className="text-white text-3xl font-bold tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>StellarBridge Pay</span>
        </div>
        <button onClick={() => router.push('/dashboard')} className="bg-orange-900/50 hover:bg-orange-900/70 text-orange-300 px-6 py-2 rounded-full font-medium border border-orange-700/50">
          ← Back to Dashboard
        </button>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-white mb-2">Buy XLM Request</h1>
        <p className="text-orange-500 text-lg mb-8">Complete your payment to receive XLM</p>

        <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50 mb-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-orange-300 mb-2">Amount to Pay</p>
              <p className="text-3xl font-bold text-white">₹{buyRequest.inrAmount}</p>
            </div>
            <div>
              <p className="text-sm text-orange-300 mb-2">You'll Receive</p>
              <p className="text-3xl font-bold text-green-400">{buyRequest.xlmAmount} XLM</p>
            </div>
          </div>

          <div className="bg-orange-900/30 rounded-xl p-6 border border-orange-700/50 mb-6">
            <p className="text-sm text-orange-300 mb-2">Merchant UPI ID</p>
            <div className="flex items-center space-x-3">
              <p className="flex-1 text-white font-mono text-lg bg-orange-950/50 rounded-lg p-3">{buyRequest.merchantUpiId}</p>
              <button onClick={() => { navigator.clipboard.writeText(buyRequest.merchantUpiId); alert('UPI ID copied!') }} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                📋 Copy
              </button>
            </div>
          </div>

          {qrCodeUrl && (
            <div className="text-center mb-6">
              <p className="text-orange-300 text-sm mb-4">Scan QR Code to Pay</p>
              <div className="inline-block bg-white p-4 rounded-xl">
                <img src={qrCodeUrl} alt="UPI QR Code" className="w-64 h-64 mx-auto" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-orange-700/30">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              buyRequest.status === 'PENDING' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' :
              buyRequest.status === 'PAID' ? 'bg-blue-900/50 text-blue-300 border border-blue-700' :
              buyRequest.status === 'COMPLETED' ? 'bg-green-900/50 text-green-300 border border-green-700' :
              'bg-gray-900/50 text-gray-300 border border-gray-700'
            }`}>
              {buyRequest.status === 'COMPLETED' ? 'DONE' : buyRequest.status}
            </span>

            {buyRequest.status === 'PENDING' && (
              <button onClick={handleMarkAsPaid} disabled={loading} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50">
                {loading ? 'Processing...' : 'I Paid via UPI'}
              </button>
            )}

            {buyRequest.status === 'PAID' && (
              <p className="text-blue-300 text-sm">⏳ Waiting for merchant confirmation...</p>
            )}

            {buyRequest.status === 'COMPLETED' && (
              <div className="text-right">
                <p className="text-green-400 font-bold text-xl mb-2">✅ Transaction Complete!</p>
                <p className="text-green-300 text-sm mb-2">XLM successfully transferred to your wallet</p>
                {buyRequest.transactionHash && (
                  <button onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${buyRequest.transactionHash}`, '_blank')} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    View on Stellar Explorer →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4">
          <p className="text-blue-300 text-sm font-medium mb-2">💡 How it works:</p>
          <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
            <li>Pay ₹{buyRequest.inrAmount} to merchant UPI ID using any UPI app</li>
            <li>Click "I Paid via UPI" button after payment</li>
            <li>Merchant will verify and confirm the payment</li>
            <li>{buyRequest.xlmAmount} XLM will be transferred to your wallet</li>
          </ol>
        </div>
      </main>
    </div>
  )
}
