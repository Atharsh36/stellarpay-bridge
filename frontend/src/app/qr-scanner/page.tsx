'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import QRScanner from '../../components/QRScanner'
import jsQR from 'jsqr'

export default function QRScannerPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleScanSuccess = (data: string) => {
    console.log('QR Code scanned:', data)
    
    // Check if it's a UPI QR code
    if (data.startsWith('upi://pay')) {
      router.push(`/payment?data=${encodeURIComponent(data)}`)
    } else {
      alert('This is not a valid UPI QR code')
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
        if (imageData) {
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          if (code) {
            handleScanSuccess(code.data)
          } else {
            alert('No QR code found in the image')
          }
        }
        setIsProcessing(false)
      }
      
      img.onerror = () => {
        alert('Error loading image')
        setIsProcessing(false)
      }
      
      img.src = URL.createObjectURL(file)
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Error processing image')
      setIsProcessing(false)
    }
  }

  if (showCamera) {
    return (
      <QRScanner
        onScanSuccess={handleScanSuccess}
        onClose={() => setShowCamera(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
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
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            UPI QR Code Scanner
          </h1>
          <p className="text-orange-400 text-lg">
            Scan or upload a UPI QR code to make payment
          </p>
        </div>

        {/* Scanner Options */}
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
          {/* Scan with Camera */}
          <button
            onClick={() => setShowCamera(true)}
            className="group relative bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-3xl p-8 transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-24 h-24 bg-orange-400/30 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Scan with Camera</h2>
              <p className="text-orange-100 text-center text-sm">
                Use your device camera to scan QR codes in real-time
              </p>
            </div>
            
            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-6 h-6">
              <div className="absolute top-0 left-0 w-full h-1 bg-white/40 rounded-full"></div>
              <div className="absolute top-0 left-0 w-1 h-full bg-white/40 rounded-full"></div>
            </div>
            <div className="absolute top-4 right-4 w-6 h-6">
              <div className="absolute top-0 right-0 w-full h-1 bg-white/40 rounded-full"></div>
              <div className="absolute top-0 right-0 w-1 h-full bg-white/40 rounded-full"></div>
            </div>
            <div className="absolute bottom-4 left-4 w-6 h-6">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white/40 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-1 h-full bg-white/40 rounded-full"></div>
            </div>
            <div className="absolute bottom-4 right-4 w-6 h-6">
              <div className="absolute bottom-0 right-0 w-full h-1 bg-white/40 rounded-full"></div>
              <div className="absolute bottom-0 right-0 w-1 h-full bg-white/40 rounded-full"></div>
            </div>
          </button>

          {/* Upload QR Image */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="group relative bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-3xl p-8 transition-all duration-300 transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-24 h-24 bg-blue-400/30 rounded-full flex items-center justify-center">
                {isProcessing ? (
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    <path d="M12,19L8,15H10.5V12H13.5V15H16L12,19Z"/>
                  </svg>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">
                {isProcessing ? 'Processing...' : 'Upload QR Image'}
              </h2>
              <p className="text-blue-100 text-center text-sm">
                {isProcessing ? 'Analyzing QR code...' : 'Select a QR code image from your device'}
              </p>
            </div>
            
            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-6 h-6">
              <div className="absolute top-0 left-0 w-full h-1 bg-white/40 rounded-full"></div>
              <div className="absolute top-0 left-0 w-1 h-full bg-white/40 rounded-full"></div>
            </div>
            <div className="absolute top-4 right-4 w-6 h-6">
              <div className="absolute top-0 right-0 w-full h-1 bg-white/40 rounded-full"></div>
              <div className="absolute top-0 right-0 w-1 h-full bg-white/40 rounded-full"></div>
            </div>
            <div className="absolute bottom-4 left-4 w-6 h-6">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white/40 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-1 h-full bg-white/40 rounded-full"></div>
            </div>
            <div className="absolute bottom-4 right-4 w-6 h-6">
              <div className="absolute bottom-0 right-0 w-full h-1 bg-white/40 rounded-full"></div>
              <div className="absolute bottom-0 right-0 w-1 h-full bg-white/40 rounded-full"></div>
            </div>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-12 max-w-2xl text-center">
          <h3 className="text-xl font-semibold text-white mb-4">How it works</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl mb-2">📱</div>
              <p className="text-orange-300">Scan or upload UPI QR code</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl mb-2">💰</div>
              <p className="text-orange-300">Enter payment amount</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl mb-2">🚀</div>
              <p className="text-orange-300">Complete with XLM</p>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </main>
    </div>
  )
}