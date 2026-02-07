'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('USER')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
      const data = isLogin ? { email, password } : { email, password, role }
      
      const response = await axios.post(`${API_URL}${endpoint}`, data, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Auth error:', error)
      const message = error.response?.data?.error || error.message || 'Authentication failed'
      alert(`Error: ${message}\\n\\nMake sure backend is running on port 3001`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
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

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <div className="relative w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl border-2 border-yellow-400/50 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full animate-spin" style={{animationDuration: '8s'}}></div>
            <svg className="w-10 h-10 text-white relative z-10 drop-shadow-lg animate-bounce" fill="currentColor" viewBox="0 0 24 24" style={{animationDuration: '3s'}}>
              {/* Rocket body */}
              <path d="M12 2C12 2 16 6 16 12C16 14 14 16 12 16C10 16 8 14 8 12C8 6 12 2 12 2Z" fill="currentColor"/>
              {/* Rocket tip */}
              <path d="M12 2L10 6H14L12 2Z" fill="currentColor" opacity="0.8"/>
              {/* Windows */}
              <circle cx="12" cy="8" r="1.5" fill="#1e293b" opacity="0.7"/>
              <circle cx="12" cy="11" r="1" fill="#1e293b" opacity="0.7"/>
              {/* Fins */}
              <path d="M8 12L6 16L8 14Z" fill="currentColor" opacity="0.9"/>
              <path d="M16 12L18 16L16 14Z" fill="currentColor" opacity="0.9"/>
              {/* Animated Flames */}
              <path d="M10 16L9 20L12 18L15 20L14 16" fill="#f97316" opacity="0.8" className="animate-pulse"/>
              <path d="M11 16L10.5 19L12 17.5L13.5 19L13 16" fill="#fbbf24" opacity="0.9" className="animate-pulse" style={{animationDelay: '0.5s'}}/>
            </svg>
          </div>
          <span className="text-white text-xl font-semibold">StellarBridge Pay</span>
        </div>
        <button
          onClick={() => router.push('/')}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
        >
          Launch App
        </button>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-6">
        <div className="grid lg:grid-cols-2 gap-16 max-w-7xl w-full items-center">
          
          {/* Left Side - Orbital Animation */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-[500px] h-[500px]">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/20 via-orange-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="relative w-32 h-32 bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-yellow-400/50 animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full"></div>
                  <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-2xl">
                    <defs>
                      <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#A78BFA', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#EC4899', stopOpacity: 1}} />
                      </linearGradient>
                      <linearGradient id="flameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#FB923C', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#F59E0B', stopOpacity: 1}} />
                      </linearGradient>
                    </defs>
                    <path d="M50 15 L58 50 L56 68 L50 72 L44 68 L42 50 Z" fill="url(#bodyGrad)" stroke="#C084FC" strokeWidth="2"/>
                    <path d="M50 15 L58 28 L50 24 L42 28 Z" fill="#F472B6" stroke="#EC4899" strokeWidth="2"/>
                    <circle cx="50" cy="42" r="7" fill="#06B6D4" stroke="#0891B2" strokeWidth="2"/>
                    <circle cx="50" cy="42" r="4" fill="#67E8F9" opacity="0.8"/>
                    <circle cx="48" cy="40" r="2" fill="white" opacity="0.9"/>
                    <line x1="45" y1="55" x2="55" y2="55" stroke="#FCD34D" strokeWidth="1.5" opacity="0.8"/>
                    <line x1="46" y1="60" x2="54" y2="60" stroke="#FCD34D" strokeWidth="1.5" opacity="0.8"/>
                    <path d="M42 52 L32 68 L42 64 Z" fill="#FB923C" stroke="#F97316" strokeWidth="2"/>
                    <path d="M38 56 L34 64 L38 62 Z" fill="#FBBF24" opacity="0.6"/>
                    <path d="M58 52 L68 68 L58 64 Z" fill="#FB923C" stroke="#F97316" strokeWidth="2"/>
                    <path d="M62 56 L66 64 L62 62 Z" fill="#FBBF24" opacity="0.6"/>
                    <path d="M44 72 L42 82 L44 88 L50 86 L56 88 L58 82 L56 72 Z" fill="url(#flameGrad)" opacity="0.9">
                      <animate attributeName="opacity" values="0.7;1;0.7" dur="0.4s" repeatCount="indefinite"/>
                      <animate attributeName="d" values="M44 72 L42 82 L44 88 L50 86 L56 88 L58 82 L56 72 Z;M44 72 L41 84 L44 90 L50 87 L56 90 L59 84 L56 72 Z;M44 72 L42 82 L44 88 L50 86 L56 88 L58 82 L56 72 Z" dur="0.6s" repeatCount="indefinite"/>
                    </path>
                    <path d="M46 72 L45 80 L47 85 L50 83 L53 85 L55 80 L54 72 Z" fill="#FDE047" opacity="0.95">
                      <animate attributeName="opacity" values="0.8;1;0.8" dur="0.3s" repeatCount="indefinite"/>
                    </path>
                    <circle cx="50" cy="85" r="1.5" fill="#FCD34D" opacity="0.8">
                      <animate attributeName="cy" values="85;92;85" dur="0.8s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.8;0;0.8" dur="0.8s" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                </div>
              </div>
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-2 border-orange-500/30 rounded-full animate-spin" style={{animationDuration: '15s'}}>
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl border-2 border-yellow-300/50">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                      <line x1="4" y1="12" x2="20" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="7" y1="8" x2="17" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="7" y1="16" x2="17" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-purple-500/20 rounded-full animate-spin" style={{animationDuration: '25s', animationDirection: 'reverse'}}>
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl border-3 border-orange-400/50">
                    <div className="w-20 h-20 bg-white rounded-lg p-2">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <rect x="5" y="5" width="25" height="25" fill="#1a1a1a" rx="3"/>
                        <rect x="10" y="10" width="15" height="15" fill="white"/>
                        <rect x="70" y="5" width="25" height="25" fill="#1a1a1a" rx="3"/>
                        <rect x="75" y="10" width="15" height="15" fill="white"/>
                        <rect x="5" y="70" width="25" height="25" fill="#1a1a1a" rx="3"/>
                        <rect x="10" y="75" width="15" height="15" fill="white"/>
                        <rect x="40" y="10" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="52" y="10" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="40" y="22" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="52" y="22" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="10" y="40" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="22" y="40" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="40" y="40" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="52" y="40" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="70" y="40" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="82" y="40" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="40" y="52" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="52" y="52" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="70" y="52" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="40" y="70" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="52" y="70" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="70" y="70" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="82" y="70" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="40" y="82" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="52" y="82" width="8" height="8" fill="#1a1a1a" rx="1"/>
                        <rect x="70" y="82" width="8" height="8" fill="#1a1a1a" rx="1"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-1/2 right-0 transform -translate-y-1/2" style={{right: 'calc(50% - 225px)'}}>
                <div className="text-5xl font-black">
                  <span className="block text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600" style={{fontFamily: 'Arial Black, sans-serif', letterSpacing: '-0.05em'}}>UPI</span>
                  <span className="block text-xs font-normal text-orange-300/80 mt-1 text-center" style={{letterSpacing: '0.05em'}}>PAYMENTS</span>
                </div>
              </div>
              
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2" style={{left: 'calc(50% - 225px)'}}>
                <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center shadow-2xl border-3 border-orange-500/50">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 8V6C21 4.89543 20.1046 4 19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12H11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="17" cy="12" r="1.5" fill="white"/>
                  </svg>
                </div>
              </div>
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
                <div className="absolute top-1/2 left-1/2 w-64 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent transform -translate-y-1/2 rotate-0 animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent transform -translate-y-1/2 rotate-90 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-px bg-gradient-to-r from-transparent via-pink-500/60 to-transparent transform -translate-y-1/2 rotate-45 animate-pulse" style={{animationDelay: '0.25s'}}></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent transform -translate-y-1/2 rotate-135 animate-pulse" style={{animationDelay: '0.75s'}}></div>
              </div>

              <div className="absolute top-16 right-20 w-3 h-3 bg-orange-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-24 left-16 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute top-32 left-12 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-32 right-24 w-3 h-3 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-gray-900/80 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-700/50">
              <div className="text-center mb-8">
                <h2 className="text-white text-3xl font-bold mb-3">
                  Hello,<br />Welcome Back
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Log in to your account to access<br />
                  your Stellar wallet.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="Username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-orange-600 bg-gray-800 border-gray-600 rounded focus:ring-orange-500" />
                    <span className="ml-2 text-sm text-gray-400">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-gray-400 hover:text-orange-400 transition-colors">Forgot Password?</a>
                </div>
                
                {!isLogin && (
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  >
                    <option value="USER">User</option>
                    <option value="MERCHANT">Merchant</option>
                  </select>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                    loading 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <span>{loading ? 'Please wait...' : 'Log In'}</span>
                </button>
              </form>
              
              <div className="text-center mt-6">
                <p className="text-gray-400 text-sm mb-4">
                  New to StellarBridge Pay?
                </p>
                <p className="text-gray-500 text-sm">
                  New to StellarBridge Pay? 
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-orange-400 font-semibold hover:text-orange-300 transition-colors ml-1"
                  >
                    Sign Up
                  </button>
                </p>
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={() => router.push('/')}
                  className="text-gray-500 hover:text-gray-300 text-sm flex items-center justify-center space-x-1 transition-colors"
                >
                  <span>←</span>
                  <span>Back to Home</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}