import { Link } from "react-router-dom"

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-[#e8f0fe] text-[#0061a5] mb-4">
        <span className="material-symbols-outlined text-4xl">search_off</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        404 - Page Not Found
      </h1>
      <p className="text-sm text-gray-500 max-w-md mb-6">
        The requested screen does not exist or has been moved within the KMC
        Smart Water Portal navigation.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold bg-[#0061a5] hover:bg-[#004f87] transition-colors"
      >
        <span className="material-symbols-outlined text-base">dashboard</span>
        <span>Return to Dashboard</span>
      </Link>
    </div>
  )
}
