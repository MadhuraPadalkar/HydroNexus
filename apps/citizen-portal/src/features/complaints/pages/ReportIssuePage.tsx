import { useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera"
import { Geolocation } from "@capacitor/geolocation"
import { Capacitor } from "@capacitor/core"
import { Icon, ScreenHeader } from "@/components/CommonUI"
import { explainDenial, explainWhy } from "@/services/permissions"
import { useLanguage } from "@/i18n/LanguageContext"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function ReportIssuePage() {
  const navigate = useNavigate()
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  const { t } = useLanguage()
  const onNavigate = (s: string) => navigate("/" + (s === "home" ? "" : s))
  const [issueType, setIssueType] = useState("")
  const [desc, setDesc] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [locBusy, setLocBusy] = useState(false)
  const [notice, setNotice] = useState("")

  async function handlePhoto(source: CameraSource) {
    setNotice("")
    if (!explainWhy("camera")) {
      explainDenial("camera")
      setNotice(t.report.photoSkipped)
      return
    }
    setPhotoBusy(true)
    try {
      if (Capacitor.isNativePlatform()) {
        const status = await Camera.checkPermissions()
        if (status.camera !== "granted" || status.photos !== "granted") {
          const req = await Camera.requestPermissions()
          if (req.camera !== "granted" && req.photos !== "granted") {
            explainDenial("camera")
            setNotice(t.report.photoDenied)
            return
          }
        }
      }
      const result = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source,
      })
      if (result.dataUrl) setPhoto(result.dataUrl)
    } catch {
      setNotice(t.report.photoFailed)
    } finally {
      setPhotoBusy(false)
    }
  }

  async function handleUseLocation() {
    setNotice("")
    if (!explainWhy("location")) {
      explainDenial("location")
      setNotice(t.report.locSkipped)
      return
    }
    setLocBusy(true)
    try {
      if (Capacitor.isNativePlatform()) {
        const status = await Geolocation.checkPermissions()
        if (status.location !== "granted") {
          const req = await Geolocation.requestPermissions()
          if (req.location !== "granted") {
            explainDenial("location")
            setNotice(t.report.locDenied)
            return
          }
        }
      }
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      })
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    } catch {
      setNotice(t.report.locFailed)
    } finally {
      setLocBusy(false)
    }
  }

  const issueTypes = [
    { id: "leak", label: t.report.types.leak, icon: "plumbing" },
    { id: "pressure", label: t.report.types.pressure, icon: "compress" },
    { id: "no-supply", label: t.report.types.noSupply, icon: "do_not_disturb" },
    { id: "quality", label: t.report.types.quality, icon: "science" },
    { id: "billing", label: t.report.types.billing, icon: "receipt_long" },
    { id: "other", label: t.report.types.other, icon: "more_horiz" },
  ]

  if (submitted) {
    return (
      <div className="flex flex-col h-full bg-white">
        <ScreenHeader title={t.report.submittedTitle} onMenu={onMenu} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5 fade-in">
          <div className="w-24 h-24 rounded-full bg-[#b7f0cd] flex items-center justify-center">
            <Icon
              name="check_circle"
              size={52}
              filled
              className="text-[#1a6936]"
            />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#002045] mb-2">
              {t.report.successTitle}
            </div>
            <div className="text-[#8a909c] text-sm leading-relaxed">
              {t.report.successBody}
            </div>
          </div>
          <div className="card-filled w-full p-4 text-left">
            <div className="text-xs text-[#8a909c] mb-1">
              {t.report.complaintId}
            </div>
            <div className="text-lg font-bold text-[#002045]">
              KMC-2026-3901
            </div>
            <div className="text-xs text-[#8a909c] mt-2">
              {t.report.expectedResolution}
            </div>
          </div>
          <button className="btn-primary" onClick={() => setSubmitted(false)}>
            {t.report.backHome}
          </button>
          <button
            className="btn-secondary w-full"
            onClick={() => onNavigate("complaints")}
          >
            {t.report.trackComplaints}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader title={t.report.title} onMenu={onMenu} />
      </div>
      <div className="flex-1 overflow-y-auto pb-32 px-4 pt-4 space-y-4">
        {/* Issue Type */}
        <div className="card-elevated p-4">
          <div className="text-sm font-bold text-[#002045] mb-3">
            {t.report.issueType}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {issueTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => setIssueType(t.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all"
                style={{
                  background: issueType === t.id ? "#e8f1ff" : "#f8f9fb",
                  borderColor: issueType === t.id ? "#0061a5" : "transparent",
                  cursor: "pointer",
                }}
              >
                <Icon
                  name={t.icon}
                  size={24}
                  className={
                    issueType === t.id ? "text-[#002045]" : "text-[#8a909c]"
                  }
                />
                <span
                  className={`text-[11px] font-semibold text-center leading-tight ${
                    issueType === t.id ? "text-[#002045]" : "text-[#8a909c]"
                  }`}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Photo Upload */}
        <div className="card-elevated p-4">
          <div className="text-sm font-bold text-[#002045] mb-3">
            {t.report.addPhoto}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handlePhoto(CameraSource.Camera)}
              disabled={photoBusy}
              className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <Icon name="camera_alt" size={28} className="text-[#8a909c]" />
              <span className="text-[10px] text-[#8a909c]">
                {photoBusy ? t.report.opening : t.report.takePhoto}
              </span>
            </button>
            <button
              onClick={() => handlePhoto(CameraSource.Photos)}
              disabled={photoBusy}
              className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <Icon name="photo_library" size={28} className="text-[#8a909c]" />
              <span className="text-[10px] text-[#8a909c]">
                {t.report.chooseGallery}
              </span>
            </button>
            {photo && (
              <img
                src={photo}
                alt={t.report.photoPreviewAlt}
                className="w-24 h-24 rounded-2xl object-cover"
              />
            )}
          </div>
          <div className="text-xs text-[#8a909c] mt-2">
            {t.report.photoHint}
          </div>
        </div>

        {/* GPS Location */}
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-[#002045]">
              {t.report.location}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#1a6936]">
              <Icon name="my_location" size={14} className="text-[#1a6936]" />
              {t.report.gpsDetected}
            </div>
          </div>
          {/* Map Preview */}
          <div
            className="w-full h-36 rounded-xl overflow-hidden relative bg-[#e8f0e0]"
            style={{ background: "linear-gradient(135deg, #e8f0e0, #d4e8d0)" }}
          >
            {/* Stylized map placeholder */}
            <div className="absolute inset-0 opacity-30">
              {/* Grid lines */}
              {[20, 40, 60, 80].map((v) => (
                <div
                  key={`h${v}`}
                  className="absolute left-0 right-0"
                  style={{ top: `${v}%`, height: 1, background: "#8aaa88" }}
                />
              ))}
              {[20, 40, 60, 80].map((v) => (
                <div
                  key={`v${v}`}
                  className="absolute top-0 bottom-0"
                  style={{ left: `${v}%`, width: 1, background: "#8aaa88" }}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#ba1a1a] flex items-center justify-center shadow-lg">
                  <Icon
                    name="location_on"
                    size={18}
                    filled
                    className="text-white"
                  />
                </div>
                <div
                  className="w-0 h-0"
                  style={{
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop: "8px solid #ba1a1a",
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 p-2.5 bg-[#f0f2f5] rounded-xl">
            <Icon name="place" size={16} className="text-[#0061a5]" />
            <span className="text-xs text-[#4a5060] flex-1">
              {coords
                ? `Lat ${coords.lat.toFixed(6)}, Lng ${coords.lng.toFixed(6)}`
                : t.report.defaultAddress}
            </span>
            <button
              className="text-xs font-semibold text-[#0061a5]"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              {t.report.edit}
            </button>
          </div>
          <button
            onClick={handleUseLocation}
            disabled={locBusy}
            className="btn-secondary w-full mt-3 disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-2">
              <Icon name="my_location" size={18} />
              {locBusy
                ? t.report.gettingLocation
                : coords
                  ? t.report.updateLocation
                  : t.report.useLocation}
            </span>
          </button>
          {notice && (
            <div className="text-xs text-[#4a5060] mt-2">{notice}</div>
          )}
        </div>

        {/* Description */}
        <div className="card-elevated p-4">
          <div className="text-sm font-bold text-[#002045] mb-3">
            {t.report.description}
          </div>
          <textarea
            className="input-field resize-none"
            rows={4}
            placeholder={t.report.descPlaceholder}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <div className="text-xs text-[#8a909c] mt-2 text-right">
            {desc.length}/500
          </div>
        </div>
      </div>

      {/* Submit */}
      <div
        className="fixed bottom-16 left-0 right-0 px-4 pb-3 pt-2 bg-white border-t border-gray-100 safe-area-bottom"
        style={{
          maxWidth: 430,
          margin: "0 auto",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <button
          className="btn-primary"
          onClick={() => setSubmitted(true)}
          disabled={!issueType || !desc}
        >
          <span className="flex items-center justify-center gap-2">
            <Icon name="send" size={18} className="text-white" />
            {t.report.submit}
          </span>
        </button>
      </div>
    </div>
  )
}
