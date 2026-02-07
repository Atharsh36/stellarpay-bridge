'use client'

import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <span className="text-white text-3xl font-bold tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>StellarBridge Pay</span>
        </div>
        <nav className="hidden md:flex space-x-8 text-gray-300">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">How It Works</a>
          <a href="#" className="hover:text-white transition-colors">Supported Payments</a>
          <a href="#" className="hover:text-white transition-colors">FAQs</a>
        </nav>
        <button
          onClick={() => router.push('/auth')}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
        >
          Launch App
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
            Your Ultimate Crypto → UPI Bridge
          </h1>
          <p className="text-gray-300 text-lg mb-12 leading-relaxed">
            Spend XLM anywhere using UPI with instant Stellar settlement.
          </p>
          <div className="flex justify-center space-x-4 mb-20">
            <button
              onClick={() => router.push('/auth')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg"
            >
              Get Started
            </button>
            <button className="border border-gray-600 hover:border-gray-500 text-gray-300 px-8 py-3 rounded-xl font-semibold transition-colors">
              Learn More
            </button>
          </div>
          {/* Simple Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-[#0a0a0f] backdrop-blur-lg rounded-3xl p-8 border border-gray-800/30 text-center">
              <div className="text-6xl mb-4 opacity-60">💳</div>
              <h3 className="text-xl font-bold text-white mb-3">UPI Payments</h3>
              <p className="text-orange-300 text-sm">Pay with UPI using your XLM balance instantly</p>
            </div>
            <div className="bg-[#0a0a0f] backdrop-blur-lg rounded-3xl p-8 border border-gray-800/30 text-center">
              <div className="text-6xl mb-4 opacity-60">⚡</div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Settlement</h3>
              <p className="text-orange-300 text-sm">Fast Stellar blockchain transactions</p>
            </div>
            <div className="bg-[#0a0a0f] backdrop-blur-lg rounded-3xl p-8 border border-gray-800/30 text-center">
              <div className="text-6xl mb-4 opacity-60">🔒</div>
              <h3 className="text-xl font-bold text-white mb-3">Secure Escrow</h3>
              <p className="text-orange-300 text-sm">Smart contract powered security</p>
            </div>
          </div>
          
          <p className="text-center text-gray-400 text-lg mb-20">
            Empowering real-world crypto payments through Stellar's fast, secure blockchain technology
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-orange-900/50 rounded-full flex items-center justify-center mr-3 border border-orange-700/50">
                  <span className="text-orange-400 text-sm">🚀</span>
                </div>
                <span className="text-gray-300 font-medium">Total XLM Bridged</span>
              </div>
              <div className="text-4xl font-bold text-orange-500 mb-2">$2,487,921</div>
              <p className="text-gray-400 text-sm">Total XLM bridged to the Stellar network for seamless UPI payments</p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-orange-900/50 rounded-full flex items-center justify-center mr-3 border border-orange-700/50">
                  <span className="text-orange-400 text-sm">👥</span>
                </div>
                <span className="text-gray-300 font-medium">Active Users</span>
              </div>
              <div className="text-4xl font-bold text-orange-500 mb-2">318,672</div>
              <p className="text-gray-400 text-sm">Number of active users utilizing StellarBridge Pay's crypto payment platform</p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-orange-900/50 rounded-full flex items-center justify-center mr-3 border border-orange-700/50">
                  <span className="text-orange-400 text-sm font-bold">UPI</span>
                </div>
                <span className="text-gray-300 font-medium">UPI Payments Processed</span>
              </div>
              <div className="text-4xl font-bold text-orange-500 mb-2">7,729,198</div>
              <p className="text-gray-400 text-sm">Total UPI Transactions processed using Stellar and XLM in real-time settlement</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}