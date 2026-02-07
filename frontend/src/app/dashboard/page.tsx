'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import Image from 'next/image'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [balance, setBalance] = useState('0.00')
  const [activeTab, setActiveTab] = useState('wallet')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentRequests, setPaymentRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [merchantTab, setMerchantTab] = useState('dashboard')
  const [transactions, setTransactions] = useState<any[]>([])
  const [earnings, setEarnings] = useState({ total: 0, today: 0, week: 0 })
  const [notifications, setNotifications] = useState<any[]>([])
  const mockNotifications = [
    { id: '1', type: 'payment', title: 'New Payment Request', message: 'user@test.com requested ₹443 payment', time: '2 min ago', read: false },
    { id: '2', type: 'success', title: 'Payment Completed', message: 'Successfully received 2.50 XLM from Coffee Shop payment', time: '1 hour ago', read: false },
    { id: '3', type: 'info', title: 'Account Funded', message: 'Your wallet was funded with 10,000 XLM', time: '3 hours ago', read: true },
    { id: '4', type: 'warning', title: 'Pending Action', message: 'Payment request from user@test.com awaiting confirmation', time: '5 hours ago', read: true }
  ]
  const [scannerMode, setScannerMode] = useState<'camera' | 'upload' | null>(null)
  const [scannedData, setScannedData] = useState<string>('')
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const mockHistory = [
    { id: '1', type: 'PAYMENT', merchant: 'Coffee Shop', amount: '5.50', xlm: '0.5500', status: 'COMPLETED', date: '2024-02-07 10:30 AM', txHash: 'abc123xyz789' },
    { id: '2', type: 'DEPOSIT', merchant: 'Stellar Wallet', amount: '100.00', xlm: '10.0000', status: 'COMPLETED', date: '2024-02-06 03:15 PM', txHash: 'def456uvw012' },
    { id: '3', type: 'PAYMENT', merchant: 'Restaurant', amount: '25.00', xlm: '2.5000', status: 'COMPLETED', date: '2024-02-05 07:45 PM', txHash: 'ghi789rst345' },
    { id: '4', type: 'WITHDRAW', merchant: 'External Wallet', amount: '50.00', xlm: '5.0000', status: 'COMPLETED', date: '2024-02-04 11:20 AM', txHash: 'jkl012opq678' }
  ]

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/auth')
      return
    }
    
    try {
      const parsedUser = JSON.parse(userData)
      console.log('User loaded:', parsedUser)
      setUser(parsedUser)
      if (parsedUser.stellarPublicKey) {
        fetchBalance(parsedUser.stellarPublicKey)
        generateQRCode(parsedUser.stellarPublicKey)
      }
      if (parsedUser.publicKey) {
        fetchBalance(parsedUser.publicKey)
        generateQRCode(parsedUser.publicKey)
      }
      
      if (parsedUser.role === 'MERCHANT') {
        console.log('Fetching payment requests for merchant...')
        fetchPaymentRequests()
        fetchTransactions()
        // Auto-refresh every 5 seconds
        const interval = setInterval(() => {
          fetchPaymentRequests()
          fetchTransactions()
        }, 5000)
        return () => clearInterval(interval)
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/auth')
    }
  }, [router])

  const fetchBalance = async (publicKey: string) => {
    if (!publicKey) {
      console.log('No public key provided')
      return
    }
    try {
      console.log('Fetching balance for:', publicKey)
      const token = localStorage.getItem('token')
      console.log('Using token:', token ? 'Token exists' : 'No token')
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/balance/${publicKey}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Response status:', res.status)
      const data = await res.json()
      console.log('Balance data received:', data)
      
      const balanceValue = typeof data.balance === 'number' ? data.balance.toFixed(2) : data.balance
      console.log('Setting balance to:', balanceValue)
      setBalance(balanceValue || '0.00')
    } catch (error) {
      console.error('Error fetching balance:', error)
      setBalance('0.00')
    }
  }

  const fetchPaymentRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      console.log('Payment requests:', data)
      setPaymentRequests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching payment requests:', error)
      setPaymentRequests([])
    }
  }

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setTransactions(Array.isArray(data) ? data : [])
      
      // Calculate earnings
      const total = data.reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0)
      const today = data.filter((tx: any) => {
        const txDate = new Date(tx.date)
        const todayDate = new Date()
        return txDate.toDateString() === todayDate.toDateString()
      }).reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0)
      
      setEarnings({ total, today, week: total })
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
    }
  }

  const generateQRCode = async (publicKey?: string) => {
    const key = publicKey || user?.publicKey || user?.stellarPublicKey
    if (key) {
      try {
        const url = await QRCode.toDataURL(key)
        setQrCodeUrl(url)
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAddress || !withdrawAmount) {
      alert('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          destinationAddress: withdrawAddress,
          amount: withdrawAmount
        })
      })

      const data = await res.json()
      if (data.success) {
        alert('✅ Withdrawal successful!')
        setWithdrawAddress('')
        setWithdrawAmount('')
        // Refresh balance
        const publicKey = user?.stellarPublicKey || user?.publicKey
        if (publicKey) {
          await fetchBalance(publicKey)
        }
      } else {
        alert('❌ ' + (data.error || 'Withdrawal failed'))
      }
    } catch (error) {
      alert('❌ Error processing withdrawal')
    } finally {
      setLoading(false)
    }
  }

  const handleFundAccount = async () => {
    const publicKey = user?.stellarPublicKey || user?.publicKey
    if (!publicKey) {
      alert('No public key found')
      return
    }
    
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/fund/${publicKey}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const data = await res.json()
      if (data.success) {
        alert('✅ Account funded with 10,000 XLM!')
        // Refresh balance
        fetchBalance(publicKey)
      } else {
        alert('❌ Funding failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Funding error:', error)
      alert('❌ Error funding account: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop())
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/auth')
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      setVideoStream(stream)
      setScannerMode('camera')
    } catch (error) {
      alert('Camera access denied. Please allow camera access or use file upload.')
    }
  }

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop())
      setVideoStream(null)
    }
    setScannerMode(null)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          
          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          
          if (code) {
            setScannedData(code.data)
            router.push(`/payment?data=${encodeURIComponent(code.data)}`)
          } else {
            alert('No QR code found in image')
          }
        }
        img.src = event.target?.result as string
      }
      
      reader.readAsDataURL(file)
    } catch (error) {
      alert('Error scanning QR code from file')
    }
  }

  if (!user) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token')
      console.log('Accepting request:', requestId)
      console.log('Token:', token ? 'exists' : 'missing')
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/approve/${requestId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Response status:', res.status)
      const data = await res.json()
      console.log('Response data:', data)
      
      if (data.status === 'APPROVED') {
        alert('✅ Request accepted! Now pay via UPI and click "I Paid via UPI - Transfer XLM"')
        fetchPaymentRequests()
      } else {
        alert('Failed to accept: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Accept error:', error)
      alert('Error accepting request: ' + error)
    }
  }

  const handleConfirmPayment = async (requestId: string) => {
    if (!confirm('Have you completed the UPI payment? This will transfer XLM from user to your wallet.')) {
      return
    }
    
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/confirm/${requestId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.status === 'COMPLETED') {
        const txHash = data.transactionHash
        const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${txHash}`
        
        // Show success message with explorer link
        const viewExplorer = confirm(
          `✅ Payment completed! XLM transferred from user to your wallet.\n\n` +
          `Transaction Hash: ${txHash}\n\n` +
          `Click OK to view transaction on Stellar Explorer`
        )
        
        if (viewExplorer) {
          window.open(explorerUrl, '_blank')
        }
        
        fetchPaymentRequests()
        if (user.stellarPublicKey || user.publicKey) {
          fetchBalance(user.stellarPublicKey || user.publicKey)
        }
        fetchTransactions()
      } else {
        alert('Payment confirmation failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Error confirming payment')
    } finally {
      setLoading(false)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/reject/${requestId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.status === 'REJECTED') {
        alert('Request rejected')
        fetchPaymentRequests()
      }
    } catch (error) {
      alert('Error rejecting request')
    }
  }

  // USER DASHBOARD
  if (user.role === 'USER') {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">

        {/* Header */}
        <header className="relative z-10 flex justify-between items-center p-6">
          <div className="flex items-center space-x-3">
            <span className="text-white text-3xl font-bold tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>StellarBridge Pay</span>
          </div>
          <nav className="flex space-x-6 text-gray-300">
            <button onClick={() => setActiveTab('wallet')} className={activeTab === 'wallet' ? 'text-white' : ''}>Wallet</button>
            <button onClick={() => setActiveTab('scanner')} className={activeTab === 'scanner' ? 'text-white' : ''}>Scanner</button>
            <button onClick={() => setActiveTab('deposit')} className={activeTab === 'deposit' ? 'text-orange-500 border-b-2 border-orange-500' : ''}>Deposit</button>
            <button onClick={() => setActiveTab('withdraw')} className={activeTab === 'withdraw' ? 'text-white' : ''}>Withdraw</button>
            <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'text-white' : ''}>History</button>
          </nav>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-full font-medium"
          >
            Logout
          </button>
        </header>

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user.email.split('@')[0]}!</h1>
          <p className="text-orange-500 text-lg mb-8">USER Dashboard</p>

          {/* Wallet Card */}
          <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50 mb-8">
            <div className="mb-6">
              <p className="text-orange-300 text-sm mb-2">Stellar Public Key:</p>
              <p className="text-white font-mono text-sm break-all">{user.stellarPublicKey || user.publicKey}</p>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-orange-300 text-sm mb-1">Balance:</p>
                <p className="text-white text-4xl font-bold">${balance} XLM</p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setActiveTab('deposit')}
                  className="bg-orange-900/50 hover:bg-orange-900/70 text-orange-300 px-6 py-3 rounded-xl border border-orange-700/50 flex items-center space-x-2"
                >
                  <Image src="/icons/deposit.svg" alt="Deposit" width={28} height={28} />
                  <span>Deposit</span>
                </button>
                <button 
                  onClick={() => setActiveTab('withdraw')}
                  className="bg-orange-900/50 hover:bg-orange-900/70 text-orange-300 px-6 py-3 rounded-xl border border-orange-700/50 flex items-center space-x-2"
                >
                  <Image src="/icons/withdraw.svg" alt="Withdraw" width={28} height={28} />
                  <span>Withdraw</span>
                </button>
                <button
                  onClick={() => fetchBalance(user.stellarPublicKey || user.publicKey)}
                  className="bg-orange-900/50 hover:bg-orange-900/70 text-orange-300 px-6 py-3 rounded-xl border border-orange-700/50 flex items-center space-x-2"
                >
                  <span>🔄</span>
                  <span>Refresh</span>
                </button>
                <button
                  onClick={handleFundAccount}
                  disabled={loading}
                  className="bg-orange-900/50 hover:bg-orange-900/70 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 disabled:opacity-50 border border-orange-700/50"
                >
                  <span>{loading ? 'Funding...' : 'Fund Account'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-2 border border-orange-800/50 mb-8 inline-flex space-x-2">
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-6 py-3 rounded-2xl font-medium flex flex-col items-center space-y-1 ${activeTab === 'wallet' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'text-orange-300'}`}
            >
              <Image src="/icons/wallet.svg" alt="Wallet" width={32} height={32} />
              <span className="text-sm">Wallet</span>
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-6 py-3 rounded-2xl font-medium flex flex-col items-center space-y-1 ${activeTab === 'scanner' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'text-orange-300'}`}
            >
              <Image src="/icons/scanner.svg" alt="Scanner" width={32} height={32} />
              <span className="text-sm">Scanner</span>
            </button>
            <button
              onClick={() => setActiveTab('deposit')}
              className={`px-6 py-3 rounded-2xl font-medium flex flex-col items-center space-y-1 ${activeTab === 'deposit' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'text-orange-300'}`}
            >
              <Image src="/icons/deposit.svg" alt="Deposit" width={32} height={32} />
              <span className="text-sm">Deposit</span>
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`px-6 py-3 rounded-2xl font-medium flex flex-col items-center space-y-1 ${activeTab === 'withdraw' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'text-orange-300'}`}
            >
              <Image src="/icons/withdraw.svg" alt="Withdraw" width={32} height={32} />
              <span className="text-sm">Withdraw</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 rounded-2xl font-medium flex flex-col items-center space-y-1 ${activeTab === 'history' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'text-orange-300'}`}
            >
              <Image src="/icons/history.svg" alt="History" width={32} height={32} />
              <span className="text-sm">History</span>
            </button>
            <button
              onClick={() => setActiveTab('buy')}
              className={`px-6 py-3 rounded-2xl font-medium flex flex-col items-center space-y-1 ${activeTab === 'buy' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'text-orange-300'}`}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
              </svg>
              <span className="text-sm">Buy XLM</span>
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`px-6 py-3 rounded-2xl font-medium flex flex-col items-center space-y-1 ${activeTab === 'sell' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'text-orange-300'}`}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M16 12l-4 4-4-4" fill="currentColor"/>
              </svg>
              <span className="text-sm">Sell XLM</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'wallet' && (
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50">
              <h2 className="text-2xl font-bold text-white mb-6">Wallet Overview</h2>
              <div className="space-y-6">
                <div className="bg-orange-900/30 rounded-xl p-6 border border-orange-700/50">
                  <p className="text-sm text-orange-300 mb-2">Stellar Public Key</p>
                  <div className="flex items-center space-x-3">
                    <p className="flex-1 text-white font-mono text-sm break-all bg-orange-950/50 rounded-lg p-3">
                      {user?.stellarPublicKey || user?.publicKey}
                    </p>
                    <button
                      onClick={() => copyToClipboard(user?.stellarPublicKey || user?.publicKey)}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
                <div className="bg-orange-900/30 rounded-xl p-6 border border-orange-700/50">
                  <p className="text-sm text-orange-300 mb-2">Current Balance</p>
                  <p className="text-4xl font-bold text-white mb-2">{balance} XLM</p>
                  <p className="text-green-400 text-sm">≈ ₹{(parseFloat(balance) * 10).toFixed(2)} INR</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-orange-900/30 rounded-xl p-6 border border-orange-700/50">
                    <p className="text-sm text-orange-300 mb-2">Account Type</p>
                    <p className="text-lg font-semibold text-white">USER</p>
                  </div>
                  <div className="bg-orange-900/30 rounded-xl p-6 border border-orange-700/50">
                    <p className="text-sm text-orange-300 mb-2">Network</p>
                    <p className="text-lg font-semibold text-white">Stellar Testnet</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => fetchBalance(user?.stellarPublicKey || user?.publicKey)}
                    className="flex-1 bg-orange-900/50 hover:bg-orange-900/70 text-white px-6 py-3 rounded-xl font-medium border border-orange-700/50"
                  >
                    🔄 Refresh Balance
                  </button>
                  <button
                    onClick={handleFundAccount}
                    disabled={loading}
                    className="flex-1 bg-orange-900/50 hover:bg-orange-900/70 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 border border-orange-700/50"
                  >
                    {loading ? 'Funding...' : 'Fund Wallet (Testnet)'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scanner' && (
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50">
              <h2 className="text-2xl font-bold text-white mb-6">UPI QR Code Scanner</h2>
              
              <div className="text-center space-y-6">
                <p className="text-orange-300 text-lg mb-8">
                  Scan UPI QR codes to make instant payments with XLM
                </p>
                
                <button
                  onClick={() => router.push('/qr-scanner')}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Open QR Scanner
                </button>
                
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-orange-900/30 rounded-xl p-6 border border-orange-700/50">
                    <h3 className="text-white font-semibold mb-2">Scan or upload UPI QR code</h3>
                    <p className="text-orange-300 text-sm">Use camera or upload image</p>
                  </div>
                  <div className="bg-orange-900/30 rounded-xl p-6 border border-orange-700/50">
                    <h3 className="text-white font-semibold mb-2">Enter payment amount</h3>
                    <p className="text-orange-300 text-sm">Specify the amount to pay</p>
                  </div>
                  <div className="bg-orange-900/30 rounded-xl p-6 border border-orange-700/50">
                    <h3 className="text-white font-semibold mb-2">Complete with XLM</h3>
                    <p className="text-orange-300 text-sm">Payment processed instantly</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deposit' && (
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50">
              <h2 className="text-2xl font-bold text-white mb-6">Deposit XLM</h2>
              
              <div className="space-y-6">
                {/* Wallet Address */}
                <div className="bg-orange-900/30 rounded-xl p-6 border border-orange-700/50">
                  <p className="text-orange-300 text-sm mb-3">Your Stellar Wallet Address:</p>
                  <div className="flex items-center space-x-3">
                    <p className="flex-1 text-white font-mono text-sm break-all bg-orange-950/50 rounded-lg p-3">
                      {user?.stellarPublicKey || user?.publicKey}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(user?.stellarPublicKey || user?.publicKey)
                        alert('Address copied to clipboard!')
                      }}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>

                {/* QR Code */}
                <div className="text-center">
                  {qrCodeUrl ? (
                    <div className="inline-block bg-white p-4 rounded-xl">
                      <img src={qrCodeUrl} alt="Wallet QR Code" className="w-64 h-64 mx-auto" />
                    </div>
                  ) : (
                    <button
                      onClick={() => generateQRCode()}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-medium"
                    >
                      Generate QR Code
                    </button>
                  )}
                  <p className="text-orange-300 text-sm mt-4">Scan this QR code to deposit XLM to your wallet</p>
                </div>

                {/* Instructions */}
                <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4">
                  <p className="text-blue-300 text-sm font-medium mb-2">💡 How to deposit:</p>
                  <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
                    <li>Copy your wallet address or scan the QR code</li>
                    <li>Send XLM from any Stellar wallet or exchange</li>
                    <li>Your balance will update automatically</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50">
              <h2 className="text-2xl font-bold text-white mb-6">Withdraw XLM</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-orange-300 text-sm mb-2 block">Destination Address</label>
                  <input
                    type="text"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="w-full bg-orange-900/30 border border-orange-700/50 rounded-xl px-4 py-3 text-white"
                    placeholder="GXXX..."
                  />
                </div>
                <div>
                  <label className="text-orange-300 text-sm mb-2 block">Amount (XLM)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-orange-900/30 border border-orange-700/50 rounded-xl px-4 py-3 text-white"
                    placeholder="0.00"
                  />
                </div>
                <button
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-medium disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50">
              <h2 className="text-2xl font-bold text-white mb-6">Transaction History</h2>
              <div className="space-y-4">
                {mockHistory.map((tx) => (
                  <div key={tx.id} className="bg-orange-900/30 rounded-xl p-6 border border-orange-700/50 hover:bg-orange-900/40 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="text-white font-semibold text-lg">{tx.merchant}</p>
                          <p className="text-orange-300 text-sm">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">
                          {tx.type === 'WITHDRAW' ? '-' : '+'}{tx.xlm} XLM
                        </p>
                        <p className="text-green-400 text-sm">₹{tx.amount}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-orange-700/30">
                      <span className="inline-block bg-green-900/50 text-green-300 px-3 py-1 rounded-full text-xs font-medium border border-green-700">
                        {tx.status}
                      </span>
                      <button
                        onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`, '_blank')}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        View on Explorer →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'buy' && (
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50">
              <h2 className="text-2xl font-bold text-white mb-6">Buy XLM</h2>
              <div className="space-y-6">
                <div className="bg-orange-900/30 rounded-xl p-6 border border-orange-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                    </svg>
                    <h3 className="text-xl font-bold text-white">Purchase XLM</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-orange-300 text-sm mb-2 block">Amount (INR)</label>
                      <input 
                        type="number" 
                        placeholder="1000" 
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full bg-orange-900/30 border border-orange-700/50 rounded-xl px-4 py-3 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-orange-300 text-sm mb-2 block">You'll receive (XLM)</label>
                      <input 
                        type="text" 
                        value={withdrawAmount ? `${(parseFloat(withdrawAmount) / 10).toFixed(2)} XLM` : '0.00 XLM'} 
                        readOnly 
                        className="w-full bg-orange-950/50 border border-orange-700/50 rounded-xl px-4 py-3 text-green-400" 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
                        alert('Please enter a valid amount')
                        return
                      }
                      
                      setLoading(true)
                      try {
                        const token = localStorage.getItem('token')
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-buy`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                          },
                          body: JSON.stringify({
                            xlmAmount: parseFloat(withdrawAmount) / 10,
                            inrAmount: parseFloat(withdrawAmount)
                          })
                        })
                        
                        const data = await res.json()
                        if (data.id) {
                          router.push(`/buy-status?id=${data.id}`)
                        } else {
                          alert('❌ Failed to create buy request: ' + (data.error || 'Unknown error'))
                        }
                      } catch (error) {
                        alert('❌ Error: ' + error.message)
                      } finally {
                        setLoading(false)
                      }
                    }}
                    disabled={loading}
                    className="w-full bg-orange-900/50 hover:bg-orange-900/70 text-white px-6 py-3 rounded-xl font-medium border border-orange-700/50 disabled:opacity-50"
                  >
                    {loading ? 'Creating Request...' : 'Proceed to Payment'}
                  </button>
                </div>
                <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4">
                  <p className="text-blue-300 text-sm">💡 Current rate: 1 XLM = ₹10 (Demo rate)</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sell' && (
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50">
              <h2 className="text-2xl font-bold text-white mb-6">Sell XLM</h2>
              <div className="space-y-6">
                <div className="bg-orange-900/30 rounded-xl p-6 border border-orange-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 16L10.91 9.74L2 9L10.91 8.26L12 2L13.09 8.26L22 9L13.09 9.74L12 16M8 21L9 18H15L16 21H8Z"/>
                    </svg>
                    <h3 className="text-xl font-bold text-white">Sell XLM for INR</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-orange-300 text-sm mb-2 block">Amount (XLM)</label>
                        <input 
                          type="number" 
                          placeholder="100" 
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="w-full bg-orange-900/30 border border-orange-700/50 rounded-xl px-4 py-3 text-white" 
                        />
                      </div>
                      <div>
                        <label className="text-orange-300 text-sm mb-2 block">You'll receive (INR)</label>
                        <input 
                          type="text" 
                          value={withdrawAmount ? `₹${(parseFloat(withdrawAmount) * 10).toFixed(2)}` : '₹0.00'} 
                          readOnly 
                          className="w-full bg-orange-950/50 border border-orange-700/50 rounded-xl px-4 py-3 text-green-400" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-orange-300 text-sm mb-2 block">Your UPI ID</label>
                      <input 
                        type="text" 
                        placeholder="yourname@paytm" 
                        value={withdrawAddress}
                        onChange={(e) => setWithdrawAddress(e.target.value)}
                        className="w-full bg-orange-900/30 border border-orange-700/50 rounded-xl px-4 py-3 text-white" 
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-orange-300 text-sm mb-2 block">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="Your full name" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-orange-900/30 border border-orange-700/50 rounded-xl px-4 py-3 text-white" 
                        />
                      </div>
                      <div>
                        <label className="text-orange-300 text-sm mb-2 block">Phone Number</label>
                        <input 
                          type="tel" 
                          placeholder="9876543210" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-orange-900/30 border border-orange-700/50 rounded-xl px-4 py-3 text-white" 
                        />
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        if (!withdrawAmount || !withdrawAddress || !fullName || !phone) {
                          alert('Please fill all fields')
                          return
                        }
                        
                        if (parseFloat(withdrawAmount) > parseFloat(balance)) {
                          alert('Insufficient XLM balance')
                          return
                        }
                        
                        setLoading(true)
                        try {
                          const token = localStorage.getItem('token')
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-sell`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({
                              xlmAmount: parseFloat(withdrawAmount),
                              inrAmount: parseFloat(withdrawAmount) * 10,
                              upiId: withdrawAddress,
                              userDetails: { fullName, phone }
                            })
                          })
                          
                          const data = await res.json()
                          if (data.id) {
                            router.push(`/sell-status?id=${data.id}`)
                          } else {
                            alert('❌ Failed to create sell request: ' + (data.error || 'Unknown error'))
                          }
                        } catch (error) {
                          alert('❌ Error: ' + error.message)
                        } finally {
                          setLoading(false)
                        }
                      }}
                      disabled={loading}
                      className="w-full bg-orange-900/50 hover:bg-orange-900/70 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 border border-orange-700/50"
                    >
                      {loading ? 'Creating Request...' : 'Create Sell Request'}
                    </button>
                  </div>
                </div>
                <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4">
                  <p className="text-yellow-300 text-sm">⚠️ Available balance: {balance} XLM</p>
                  <p className="text-yellow-300 text-sm mt-1">💡 Rate: 1 XLM = ₹10 (Demo rate)</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    )
  }

  // MERCHANT DASHBOARD
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <div>
            <span className="text-white text-3xl font-bold tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>StellarBridge Pay</span>
            <p className="text-orange-400 text-sm font-semibold tracking-wide" style={{ letterSpacing: '0.05em' }}>Merchant Portal</p>
          </div>
        </div>
        <button onClick={handleLogout} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-full font-medium">
          Logout
        </button>
      </header>

      {/* Navigation Tabs */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-8">
        <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-2 border border-orange-800/50 flex flex-wrap gap-2">
          {['dashboard', 'requests', 'wallet', 'transactions', 'earnings', 'notifications', 'profile', 'security'].map(tab => (
            <button
              key={tab}
              onClick={() => setMerchantTab(tab)}
              className={`px-4 py-2 rounded-2xl font-medium capitalize ${merchantTab === tab ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'text-orange-300 hover:bg-orange-900/30'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-8">

      {/* 1. DASHBOARD */}
      {merchantTab === 'dashboard' && (
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user.email.split('@')[0]}!</h1>
          <p className="text-orange-500 text-lg mb-8">MERCHANT Dashboard</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-6 border border-orange-800/50">
              <div className="mb-4">
                <span className="text-orange-300">XLM Balance</span>
              </div>
              <p className="text-3xl font-bold text-white">{balance} XLM</p>
              <p className="text-green-400 text-sm mt-1">≈ ₹{(parseFloat(balance) * 100).toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-6 border border-orange-800/50">
              <div className="mb-4">
                <span className="text-orange-300">Pending Requests</span>
              </div>
              <p className="text-3xl font-bold text-orange-400">{paymentRequests.filter(r => r.status === 'PENDING').length}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-6 border border-orange-800/50">
              <div className="mb-4">
                <span className="text-orange-300">Completed Today</span>
              </div>
              <p className="text-3xl font-bold text-green-400">0</p>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Notifications</h2>
              <button onClick={() => setMerchantTab('notifications')} className="text-orange-400 hover:text-orange-300 text-sm font-medium">
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {mockNotifications.slice(0, 3).map((notif) => (
                <div key={notif.id} className={`bg-gradient-to-r from-orange-900/60 to-orange-950/60 rounded-2xl p-6 border-l-4 ${!notif.read ? 'border-orange-500' : 'border-orange-700/50'} shadow-lg`}>
                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-500/20 px-3 py-1 rounded-lg">
                      <span className="text-orange-400 text-xs font-bold uppercase">
                        {notif.type === 'payment' ? 'PAYMENT' : 
                         notif.type === 'success' ? 'SUCCESS' : 
                         notif.type === 'info' ? 'INFO' : 
                         notif.type === 'warning' ? 'WARNING' : 'NOTIFICATION'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-bold text-lg">{notif.title}</p>
                        {!notif.read && <span className="w-2 h-2 bg-orange-500 rounded-full"></span>}
                      </div>
                      <p className="text-orange-200 text-base mb-2">{notif.message}</p>
                      <p className="text-orange-400 text-sm">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-1 gap-4">
              <button onClick={() => setMerchantTab('requests')} className="bg-orange-900/50 hover:bg-orange-900/70 text-white px-8 py-6 rounded-2xl font-bold text-lg border border-orange-700/50 shadow-lg flex items-center justify-center space-x-3">
                <span>View Payment Requests</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PAYMENT REQUESTS */}
      {merchantTab === 'requests' && (
        <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Payment Requests</h2>
            <button
              onClick={fetchPaymentRequests}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
          </div>
          {paymentRequests.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl">📭</span>
              <p className="text-orange-300 mt-4">No payment requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentRequests.map((request, idx) => (
                <div key={idx} className="bg-orange-900/30 rounded-xl p-6 border border-orange-700/50">
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.type === 'BUY' ? 'bg-green-900/50 text-green-300 border border-green-700' :
                      request.type === 'SELL' ? 'bg-purple-900/50 text-purple-300 border border-purple-700' :
                      'bg-blue-900/50 text-blue-300 border border-blue-700'
                    }`}>
                      {request.type || 'PAYMENT'}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-orange-300">User Email</p>
                      <p className="font-semibold text-white">{request.userEmail || 'user@test.com'}</p>
                    </div>
                    {request.type !== 'BUY' && (
                      <div>
                        <p className="text-sm text-orange-300">UPI ID</p>
                        <p className="font-semibold text-white">{request.upiId || request.merchantUpiId}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-orange-300">INR Amount</p>
                      <p className="font-semibold text-white">₹{request.inrAmount || request.amountInInr}</p>
                    </div>
                    <div>
                      <p className="text-sm text-orange-300">XLM Equivalent</p>
                      <p className="font-semibold text-white">{request.xlmAmount || request.amountInXlm} XLM</p>
                    </div>
                    {request.userDetails && (
                      <>
                        <div>
                          <p className="text-sm text-orange-300">User Name</p>
                          <p className="font-semibold text-white">{request.userDetails.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-orange-300">Phone</p>
                          <p className="font-semibold text-white">{request.userDetails.phone}</p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      request.status === 'PENDING' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' :
                      request.status === 'PAID' ? 'bg-blue-900/50 text-blue-300 border border-blue-700' :
                      request.status === 'APPROVED' ? 'bg-blue-900/50 text-blue-300 border border-blue-700' :
                      request.status === 'COMPLETED' ? 'bg-green-900/50 text-green-300 border border-green-700' :
                      request.status === 'REJECTED' ? 'bg-red-900/50 text-red-300 border border-red-700' :
                      'bg-gray-900/50 text-gray-300 border border-gray-700'
                    }`}>
                      {request.status}
                    </span>
                    <div className="flex space-x-2">
                      {request.type === 'BUY' && request.status === 'PAID' && (
                        <button 
                          onClick={async () => {
                            if (!confirm('Have you received the UPI payment? This will transfer XLM to user.')) return
                            setLoading(true)
                            try {
                              const token = localStorage.getItem('token')
                              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/confirm-buy/${request.id}`, {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${token}` }
                              })
                              const data = await res.json()
                              if (data.status === 'COMPLETED') {
                                alert('✅ XLM transferred to user!')
                                fetchPaymentRequests()
                              } else {
                                alert('❌ Failed: ' + (data.error || 'Unknown error'))
                              }
                            } catch (error) {
                              alert('❌ Error confirming buy')
                            } finally {
                              setLoading(false)
                            }
                          }}
                          disabled={loading}
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          💸 Confirm & Transfer XLM
                        </button>
                      )}
                      {request.status === 'PENDING' && request.type !== 'BUY' && (
                        <>
                          <button onClick={() => handleAcceptRequest(request.id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
                            ✅ Accept
                          </button>
                          <button onClick={() => handleRejectRequest(request.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">
                            ❌ Reject
                          </button>
                        </>
                      )}
                      {request.status === 'APPROVED' && (
                        <button 
                          onClick={() => {
                            console.log('Confirming payment for request:', request.id)
                            handleConfirmPayment(request.id)
                          }} 
                          disabled={loading} 
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          💸 I Paid via UPI - Transfer XLM
                        </button>
                      )}
                      {request.status === 'COMPLETED' && (
                        <span className="text-green-400 text-sm">✅ Completed</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. WALLET MANAGEMENT */}
      {merchantTab === 'wallet' && (
        <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50">
          <h2 className="text-2xl font-bold text-white mb-6">Wallet Management</h2>
          <div className="space-y-6">
            <div className="bg-orange-900/30 rounded-xl p-6 border border-orange-700/50">
              <p className="text-sm text-orange-300 mb-2">Stellar Public Key</p>
              <div className="flex items-center justify-between bg-orange-950/50 rounded-lg p-4">
                <p className="font-mono text-sm text-white break-all">{user.stellarPublicKey || user.publicKey}</p>
                <button onClick={() => copyToClipboard(user.stellarPublicKey || user.publicKey)} className="ml-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-sm">
                  📋 Copy
                </button>
              </div>
            </div>
            <div className="bg-orange-900/30 rounded-xl p-6 border border-orange-700/50">
              <p className="text-sm text-orange-300 mb-2">Current Balance</p>
              <p className="text-4xl font-bold text-white">{balance} XLM</p>
              <p className="text-green-400 mt-1">≈ ₹{(parseFloat(balance) * 100).toFixed(2)} INR</p>
            </div>
            <div className="flex space-x-4">
              <button onClick={() => fetchBalance(user.stellarPublicKey || user.publicKey)} className="flex-1 bg-blue-900/50 hover:bg-blue-900/70 text-white px-6 py-3 rounded-xl font-medium border border-blue-700/50">
                🔄 Refresh Balance
              </button>
              <button onClick={handleFundAccount} disabled={loading} className="flex-1 bg-orange-900/50 hover:bg-orange-900/70 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 border border-orange-700/50">
                {loading ? 'Funding...' : 'Fund Wallet (Testnet)'}
              </button>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4">
              <p className="text-sm text-yellow-300">🔒 Your secret key is encrypted and never displayed for security.</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. TRANSACTIONS */}
      {merchantTab === 'transactions' && (
        <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50">
          <h2 className="text-2xl font-bold text-white mb-6">Transaction History</h2>
          <div className="flex space-x-4 mb-6">
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium">Today</button>
            <button className="px-4 py-2 bg-orange-900/30 text-orange-300 rounded-lg font-medium hover:bg-orange-900/50">Week</button>
            <button className="px-4 py-2 bg-orange-900/30 text-orange-300 rounded-lg font-medium hover:bg-orange-900/50">Month</button>
            <button className="px-4 py-2 bg-orange-900/30 text-orange-300 rounded-lg font-medium hover:bg-orange-900/50">All</button>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl">📊</span>
              <p className="text-orange-300 mt-4">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-orange-900/30 rounded-xl p-5 border border-orange-700/50 flex items-center justify-between hover:bg-orange-900/40 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-white font-semibold">{tx.customer}</p>
                      <p className="text-orange-300 text-sm">{new Date(tx.date).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-lg">+{tx.amount} XLM</p>
                    <p className="text-orange-200 text-sm">₹{tx.inr}</p>
                  </div>
                  {tx.txHash && (
                    <button
                      onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`, '_blank')}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium ml-4"
                    >
                      View →
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. EARNINGS */}
      {merchantTab === 'earnings' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-6 border border-orange-800/50">
              <p className="text-orange-300 mb-2">Total Earned</p>
              <p className="text-3xl font-bold text-green-400">{earnings.total.toFixed(2)} XLM</p>
              <p className="text-sm text-orange-200 mt-1">≈ ₹{(earnings.total * 10).toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-6 border border-orange-800/50">
              <p className="text-orange-300 mb-2">Today's Earnings</p>
              <p className="text-3xl font-bold text-blue-400">{earnings.today.toFixed(2)} XLM</p>
              <p className="text-sm text-orange-200 mt-1">≈ ₹{(earnings.today * 10).toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-6 border border-orange-800/50">
              <p className="text-orange-300 mb-2">Weekly Earnings</p>
              <p className="text-3xl font-bold text-purple-400">{earnings.week.toFixed(2)} XLM</p>
              <p className="text-sm text-orange-200 mt-1">≈ ₹{(earnings.week * 10).toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50">
            <h3 className="text-xl font-bold text-white mb-4">Earnings Breakdown</h3>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl">💰</span>
                  <p className="text-orange-300 mt-2">No earnings yet</p>
                </div>
              ) : (
                transactions.map((earning) => (
                  <div key={earning.id} className="bg-orange-900/30 rounded-xl p-5 border border-orange-700/50 flex items-center justify-between hover:bg-orange-900/40 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-white font-semibold">{earning.customer}</p>
                        <p className="text-orange-300 text-sm">{new Date(earning.date).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold text-lg">+{earning.amount} XLM</p>
                      <p className="text-orange-200 text-sm">₹{earning.inr}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. NOTIFICATIONS */}
      {merchantTab === 'notifications' && (
        <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50">
          <h2 className="text-2xl font-bold text-white mb-6">Notifications</h2>
          <div className="space-y-3">
            {mockNotifications.map((notif) => (
              <div key={notif.id} className={`bg-orange-900/30 rounded-xl p-5 border border-orange-700/50 flex items-start space-x-4 hover:bg-orange-900/40 transition-colors ${!notif.read ? 'border-orange-500/50 bg-orange-900/40' : ''}`}>
                <div className="text-orange-400 text-sm font-medium min-w-fit">
                  {notif.type === 'payment' ? 'PAYMENT' : 
                   notif.type === 'success' ? 'SUCCESS' : 
                   notif.type === 'info' ? 'INFO' : 
                   notif.type === 'warning' ? 'WARNING' : 'NOTIFICATION'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-bold text-lg">{notif.title}</p>
                    {!notif.read && <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">New</span>}
                  </div>
                  <p className="text-orange-200 text-sm mb-2">{notif.message}</p>
                  <p className="text-orange-400 text-xs">{notif.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. PROFILE */}
      {merchantTab === 'profile' && (
        <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50">
          <h2 className="text-2xl font-bold text-white mb-6">Merchant Profile</h2>
          <div className="space-y-6">
            <div>
              <label className="text-sm text-orange-300">Merchant Name</label>
              <p className="text-lg font-semibold text-white">{user.email.split('@')[0]}</p>
            </div>
            <div>
              <label className="text-sm text-orange-300">Email</label>
              <p className="text-lg font-semibold text-white">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-orange-300">Registered UPI ID</label>
              <p className="text-lg font-semibold text-white">merchant@okicici</p>
            </div>
            <div>
              <label className="text-sm text-orange-300">ID Verification Status</label>
              <div className="flex items-center space-x-3 mt-2">
                {user.isVerified ? (
                  <span className="inline-block bg-green-900/50 text-green-300 px-4 py-2 rounded-full font-medium border border-green-700">✅ Verified</span>
                ) : (
                  <span className="inline-block bg-yellow-900/50 text-yellow-300 px-4 py-2 rounded-full font-medium border border-yellow-700">⚠️ Not Verified</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-orange-300">Account Status</label>
              <div className="flex items-center space-x-3 mt-2">
                {user.isBanned ? (
                  <span className="inline-block bg-red-900/50 text-red-300 px-4 py-2 rounded-full font-medium border border-red-700">🚫 Banned</span>
                ) : (
                  <span className="inline-block bg-green-900/50 text-green-300 px-4 py-2 rounded-full font-medium border border-green-700">✅ Active</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-orange-300">Suspicious Activity Count</label>
              <div className="flex items-center space-x-3 mt-2">
                <p className="text-lg font-semibold text-white">{user.suspiciousActivityCount || 0}</p>
                {user.suspiciousActivityCount >= 3 && (
                  <span className="inline-block bg-red-900/50 text-red-300 px-3 py-1 rounded-full text-xs font-medium border border-red-700">⚠️ High Risk</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-orange-300">Role</label>
              <p className="text-lg font-semibold text-orange-400">MERCHANT</p>
            </div>
            {user.isBanned && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4">
                <p className="text-red-300 text-sm font-medium">⚠️ Your account has been banned due to suspicious activity. Contact support for assistance.</p>
              </div>
            )}
            {!user.isVerified && (
              <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4">
                <p className="text-yellow-300 text-sm font-medium">⚠️ Please complete ID verification to unlock full merchant features.</p>
                <button className="mt-3 bg-orange-900/50 hover:bg-orange-900/70 text-white px-6 py-2 rounded-xl font-medium border border-orange-700/50">
                  Start Verification
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. SECURITY */}
      {merchantTab === 'security' && (
        <div className="bg-gradient-to-br from-orange-900/40 to-orange-950/40 backdrop-blur-lg rounded-3xl p-8 border border-orange-800/50">
          <h2 className="text-2xl font-bold text-white mb-6">Security & Settings</h2>
          <div className="space-y-4">
            <button className="w-full bg-orange-900/50 hover:bg-orange-900/70 text-white px-6 py-3 rounded-xl font-medium text-left border border-orange-700/50">
              Change Password
            </button>
            <button onClick={handleLogout} className="w-full bg-orange-900/50 hover:bg-orange-900/70 text-white px-6 py-3 rounded-xl font-medium text-left border border-orange-700/50">
              Logout All Sessions
            </button>
            <button className="w-full bg-orange-900/50 hover:bg-orange-900/70 text-white px-6 py-3 rounded-xl font-medium text-left border border-orange-700/50">
              View Login Activity
            </button>
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4">
              <p className="text-sm text-yellow-300">2FA (Two-Factor Authentication) - Coming Soon</p>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  )
}
