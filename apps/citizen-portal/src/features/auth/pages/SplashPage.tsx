import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Icon } from "@/components/CommonUI"

export default function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => {
      navigate("/login")
    }, 2800)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div
      className="flex flex-col items-center justify-between min-h-screen"
      style={{
        background: "linear-gradient(160deg, #002045 0%, #0061a5 100%)",
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
        {/* Logo */}
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(255,255,255,0.2)",
          }}
        >
          <Icon name="water_drop" size={52} filled className="text-[#66affe]" />
        </div>
        <div className="text-center">
          <div className="text-4xl font-extrabold text-white tracking-tight mb-1">
            KMC
          </div>
          <div className="text-xl font-bold text-[#66affe] tracking-wide">
            Smart Water
          </div>
        </div>
        <p className="text-center text-white/75 text-[15px] leading-relaxed max-w-xs">
          Smart Water Services
          <br />
          for Kolhapur
        </p>
      </div>

      {/* Bottom strip */}
      <div className="w-full px-8 pb-14 flex flex-col items-center gap-6">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all"
              style={{
                width: i === 0 ? 24 : 8,
                background: i === 0 ? "#66affe" : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
        <div className="text-center">
          <div className="text-white/50 text-xs">
            Kolhapur Municipal Corporation
          </div>
          <div className="text-white/35 text-[10px] mt-0.5">महाराष्ट्र, भारत</div>
        </div>
      </div>
    </div>
  )
}
