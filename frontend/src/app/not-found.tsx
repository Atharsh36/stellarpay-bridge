export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">404 - Page Not Found</h2>
        <p className="text-gray-600 mb-4">The page you are looking for does not exist.</p>
        <a 
          href="/" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block"
        >
          Go Home
        </a>
      </div>
    </div>
  )
}