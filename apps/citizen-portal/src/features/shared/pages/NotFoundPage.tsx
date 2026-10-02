import { Link } from "react-router-dom"
import { Icon } from "@/components/CommonUI"

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#e8f1ff] text-[#0061a5] mb-4">
        <Icon name="search_off" size={32} />
      </div>
      <h1 className="text-xl font-bold text-[#002045] mb-1">Page Not Found</h1>
      <p className="text-xs text-gray-500 max-w-xs mb-6">
        The water service screen you are looking for does not exist or has been
        relocated.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold bg-[#0061a5] hover:bg-[#004f87] transition-colors shadow-sm"
      >
        <Icon name="home" size={18} />
        <span>Return to Home</span>
      </Link>
    </div>
  )
}
