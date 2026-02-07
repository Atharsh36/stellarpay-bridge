'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [upiData, setUpiData] = useState<any>(null)
  const [currency, setCurrency] = useState<'INR' | 'XLM'>('INR')
  const [amount, setAmount] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [xlmEquivalent, setXlmEquivalent] = useState('0.0000')
  const [loading, setLoading] = useState(false)
  const [userBalance, setUserBalance] = useState('0.00')
  const [balanceLoading, setBalanceLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      alert('Please login first')
      router.push('/auth')
      return
    }
    
    // Fetch user balance
    const user = JSON.parse(userData)
    const publicKey = user.stellarPublicKey || user.publicKey
    if (publicKey) {
      fetchUserBalance(publicKey)
    }
    
    const scannedData = searchParams.get('data')
    if (scannedData) {
      // Parse UPI data (format: upi://pay?pa=upiid@bank&pn=Name)
      const upiParams = new URLSearchParams(scannedData.split('?')[1])
      setUpiData({
        upiId: upiParams.get('pa') || '',
        merchantName: upiParams.get('pn') || 'Unknown Merchant'
      })
    }
  }, [searchParams, router])

  useEffect(() => {
    if (amount && currency === 'INR') {
      const xlm = (parseFloat(amount) / 10).toFixed(4)
      setXlmEquivalent(xlm)
    } else if (amount && currency === 'XLM') {
      setXlmEquivalent(amount)
    } else {
      setXlmEquivalent('0.0000')
    }
  }, [amount, currency])

  const fetchUserBalance = async (publicKey: string) => {
    setBalanceLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/balance/${publicKey}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setUserBalance(data.balance || '0.00')
    } catch (error) {
      console.error('Error fetching balance:', error)
      setUserBalance('0.00')
    } finally {
      setBalanceLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!amount || !fullName || !phone) {
      alert('Please fill in all required fields')
      return
    }

    // Check if user has sufficient XLM balance
    const requiredXlm = parseFloat(xlmEquivalent)
    const currentBalance = parseFloat(userBalance)
    
    if (currentBalance < requiredXlm) {
      alert(`Insufficient XLM balance!\n\nRequired: ${requiredXlm} XLM\nYour Balance: ${currentBalance} XLM\n\nPlease fund your account first.`)
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      alert('Session expired. Please login again.')
      router.push('/auth')
      return
    }

    setLoading(true)
    try {
      console.log('Creating payment with:', {
        merchantEmail: 'merchant@test.com',
        merchantUpiId: upiData.upiId,
        merchantName: upiData.merchantName,
        amountInInr: currency === 'INR' ? parseFloat(amount) : parseFloat(amount) * 10,
        amountInXlm: parseFloat(xlmEquivalent),
        userDetails: { fullName, phone, address }
      })
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          merchantEmail: 'merchant@test.com',
          merchantUpiId: upiData.upiId,
          merchantName: upiData.merchantName,
          amountInInr: currency === 'INR' ? parseFloat(amount) : parseFloat(amount) * 10,
          amountInXlm: parseFloat(xlmEquivalent),
          userDetails: { fullName, phone, address }
        })
      })

      console.log('Response status:', res.status)
      const data = await res.json()
      console.log('Response data:', data)
      
      if (data.id) {
        router.push(`/payment-status?id=${data.id}`)
      } else if (data.error && data.error.includes('token')) {
        alert('Session expired. Please login again.')
        router.push('/auth')
      } else {
        alert('Failed to create payment request: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Error creating payment request: ' + error)
    } finally {
      setLoading(false)
    }
  }

  if (!upiData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
          ← Back
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">Payment Confirmation</h1>
        <p className="text-orange-500 text-lg mb-8 text-center">Complete your payment details</p>

        <div className="space-y-6">
          {/* UPI Details */}
          <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-6 border border-orange-800/50">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">💳</span>
              <h2 className="text-xl font-bold text-white">UPI Details</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-orange-300">UPI ID:</span>
                <span className="text-white font-semibold">{upiData.upiId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-300">Merchant:</span>
                <span className="text-white font-semibold">{upiData.merchantName}</span>
              </div>
            </div>
          </div>

          {/* Your Details */}
          <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-6 border border-orange-800/50">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">👤</span>
              <h2 className="text-xl font-bold text-white">Your Details</h2>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name *"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-orange-900/30 border border-orange-700/50 rounded-xl px-4 py-3 text-white placeholder-orange-300/50"
              />
              <input
                type="tel"
                placeholder="Phone Number *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-orange-900/30 border border-orange-700/50 rounded-xl px-4 py-3 text-white placeholder-orange-300/50"
              />
              <input
                type="text"
                placeholder="Address (Optional)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-orange-900/30 border border-orange-700/50 rounded-xl px-4 py-3 text-white placeholder-orange-300/50"
              />
            </div>
          </div>

          {/* User Balance */}
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-950/40 backdrop-blur-lg rounded-3xl p-6 border border-blue-800/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm mb-1">Your XLM Balance:</p>
                <p className="text-white text-2xl font-bold">
                  {balanceLoading ? 'Loading...' : `${userBalance} XLM`}
                </p>
              </div>
              <button
                onClick={() => {
                  const userData = localStorage.getItem('user')
                  if (userData) {
                    const user = JSON.parse(userData)
                    const publicKey = user.stellarPublicKey || user.publicKey
                    if (publicKey) fetchUserBalance(publicKey)
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                🔄 Refresh
              </button>
            </div>
            {userBalance === '0.00' && !balanceLoading && (
              <button
                onClick={async () => {
                  const userData = localStorage.getItem('user')
                  if (userData) {
                    const user = JSON.parse(userData)
                    const publicKey = user.stellarPublicKey || user.publicKey
                    if (publicKey) {
                      try {
                        const token = localStorage.getItem('token')
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/fund/${publicKey}`, {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${token}` }
                        })
                        const data = await res.json()
                        if (data.success) {
                          alert('✅ Account funded with 10,000 XLM!')
                          fetchUserBalance(publicKey)
                        } else {
                          alert('❌ Funding failed: ' + (data.error || 'Unknown error'))
                        }
                      } catch (error) {
                        alert('❌ Error funding account: ' + error.message)
                      }
                    }
                  }
                }}
                className="mt-3 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                🔥 Fund Account (10,000 XLM)
              </button>
            )}
          </div>

          {/* Enter Amount */}
          <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-6 border border-orange-800/50">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">💰</span>
              <h2 className="text-xl font-bold text-white">Enter Amount</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={() => setCurrency('INR')}
                className={`py-3 rounded-xl font-medium ${
                  currency === 'INR'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                    : 'bg-orange-900/30 text-orange-300 border border-orange-700/50'
                }`}
              >
                INR (₹)
              </button>
              <button
                onClick={() => setCurrency('XLM')}
                className={`py-3 rounded-xl font-medium ${
                  currency === 'XLM'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                    : 'bg-orange-900/30 text-orange-300 border border-orange-700/50'
                }`}
              >
                XLM
              </button>
            </div>

            <input
              type="number"
              placeholder={`Enter amount in ${currency}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-orange-900/30 border border-orange-700/50 rounded-xl px-4 py-3 text-white placeholder-orange-300/50 mb-4"
            />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-orange-300">Amount (INR):</span>
                <span className="text-green-400 font-bold">
                  ₹{currency === 'INR' ? amount || '0' : (parseFloat(xlmEquivalent) * 10).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-300">XLM Required:</span>
                <span className="text-purple-400 font-bold">{xlmEquivalent} XLM</span>
              </div>
              {amount && parseFloat(xlmEquivalent || '0') > parseFloat(userBalance || '0') && !balanceLoading && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 mt-2">
                  <p className="text-red-300 text-sm font-medium">⚠️ Insufficient Balance!</p>
                  <p className="text-red-400 text-xs mt-1">
                    You need {(parseFloat(xlmEquivalent || '0') - parseFloat(userBalance || '0')).toFixed(4)} more XLM
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={loading || balanceLoading || !amount || parseFloat(xlmEquivalent || '0') > parseFloat(userBalance || '0')}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 
             balanceLoading ? 'Checking Balance...' :
             !amount ? '💸 Enter Amount' :
             parseFloat(xlmEquivalent || '0') > parseFloat(userBalance || '0') ? '❌ Insufficient Balance' :
             '💸 Proceed to Pay'}
          </button>
          
          {amount && parseFloat(xlmEquivalent || '0') > parseFloat(userBalance || '0') && !balanceLoading && (
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4">
              <p className="text-gray-300 text-sm">💡 Need more XLM? Fund your account using the testnet faucet.</p>
              <button
                onClick={() => window.open('https://laboratory.stellar.org/#account-creator?network=test', '_blank')}
                className="mt-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-gray-600/50 shadow-lg"
              >
                🔥 Fund Account
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
