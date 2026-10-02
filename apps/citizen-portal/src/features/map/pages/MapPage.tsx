import { useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { Icon, ScreenHeader } from "@/components/CommonUI"
import { mapPins } from "@/mocks/citizenData"
import type { CitizenOutletContext } from "@/app/layouts/CitizenLayout"

export default function MapPage() {
  const navigate = useNavigate()
  const { onMenu } = useOutletContext<CitizenOutletContext>()
  const onNavigate = (s: string) => navigate("/" + (s === "home" ? "" : s))
  const pinColor = (status: string) =>
    status === "Open"
      ? "#ba1a1a"
      : status === "In Progress"
        ? "#f59d00"
        : "#1a6936"

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      <div className="bg-white">
        <ScreenHeader
          title="Nearby Issues"
          onMenu={onMenu}
          action={
            <button
              onClick={() => onNavigate("report")}
              className="btn-tonal text-xs py-2 px-3"
              style={{
                borderRadius: 100,
                background: "#e8f1ff",
                color: "#0061a5",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
              }}
            >
              <span className="flex items-center gap-1">
                <Icon name="add" size={14} />
                Report
              </span>
            </button>
          }
        />
      </div>

      {/* Map */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{ background: "#e8f0e0" }}
      >
        {/* Map background */}
        <div className="absolute inset-0">
          <svg width="100%" height="100%" className="opacity-20">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#4a6640"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          {/* Stylized roads */}
          <svg className="absolute inset-0" width="100%" height="100%">
            <line
              x1="0"
              y1="45%"
              x2="100%"
              y2="45%"
              stroke="#c8d4b8"
              strokeWidth="8"
            />
            <line
              x1="0"
              y1="65%"
              x2="100%"
              y2="68%"
              stroke="#c8d4b8"
              strokeWidth="5"
            />
            <line
              x1="30%"
              y1="0"
              x2="33%"
              y2="100%"
              stroke="#c8d4b8"
              strokeWidth="6"
            />
            <line
              x1="70%"
              y1="0"
              x2="68%"
              y2="100%"
              stroke="#c8d4b8"
              strokeWidth="5"
            />
            {/* Water body */}
            <ellipse
              cx="50%"
              cy="25%"
              rx="18%"
              ry="12%"
              fill="#aac8e8"
              opacity="0.6"
            />
            <text
              x="50%"
              y="25%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#5588aa"
              fontSize="10"
              fontFamily="Inter"
            >
              Rankala Lake
            </text>
          </svg>
        </div>

        {/* Issue Pins */}
        {mapPins.map((pin) => (
          <div
            key={pin.id}
            className="absolute flex flex-col items-center"
            style={{
              left: `${pin.x}%`,
              top: `${pin.y}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: pinColor(pin.status),
                border: "2px solid white",
              }}
            >
              <Icon name="plumbing" size={14} className="text-white" />
            </div>
            <div
              className="w-0 h-0"
              style={{
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: `6px solid ${pinColor(pin.status)}`,
              }}
            />
            <div className="mt-0.5 bg-white rounded-lg px-2 py-0.5 shadow text-[9px] font-semibold text-[#002045] whitespace-nowrap">
              {pin.label}
            </div>
          </div>
        ))}

        {/* Your Location */}
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "55%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="w-4 h-4 rounded-full bg-[#0061a5] border-2 border-white shadow-lg" />
          <div className="absolute inset-0 w-4 h-4 rounded-full bg-[#0061a5] animate-ping opacity-30" />
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 pb-24">
        <div className="text-xs font-bold text-[#002045] mb-2">Legend</div>
        <div className="flex gap-4 flex-wrap">
          {[
            { color: "#ba1a1a", label: "Open" },
            { color: "#f59d00", label: "In Progress" },
            { color: "#1a6936", label: "Resolved" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: l.color }}
              />
              <span className="text-xs text-[#4a5060]">{l.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#0061a5]" />
            <span className="text-xs text-[#4a5060]">Your Location</span>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-[#8a909c]">
          Showing {mapPins.length} anonymized reports within 2 km
        </div>
      </div>
    </div>
  )
}
