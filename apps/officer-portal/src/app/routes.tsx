import { lazy, Suspense } from "react"
import { createBrowserRouter, Navigate } from "react-router-dom"
import { LoadingSpinner } from "@water/ui"
import OfficerLayout from "./layouts/OfficerLayout"
import { ProtectedRoute } from "@/components/ProtectedRoute"

// Lazy load feature pages
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"))
const DashboardPage = lazy(
  () => import("@/features/dashboard/pages/DashboardPage"),
)
const SupplySchedulePage = lazy(
  () => import("@/features/supply/pages/SupplySchedulePage"),
)
const OutageManagementPage = lazy(
  () => import("@/features/supply/pages/OutageManagementPage"),
)
const MaintenanceSchedulePage = lazy(
  () => import("@/features/supply/pages/MaintenanceSchedulePage"),
)
const ComplaintManagementPage = lazy(
  () => import("@/features/complaints/pages/ComplaintManagementPage"),
)
const GISNetworkPage = lazy(() => import("@/features/gis/pages/GISNetworkPage"))
const NRWMonitoringPage = lazy(
  () => import("@/features/nrw/pages/NRWMonitoringPage"),
)
const ZoneWaterAccountingPage = lazy(
  () => import("@/features/nrw/pages/ZoneWaterAccountingPage"),
)
const LeakageAnalysisPage = lazy(
  () => import("@/features/nrw/pages/LeakageAnalysisPage"),
)
const MultiWardComparisonPage = lazy(
  () => import("@/features/nrw/pages/MultiWardComparisonPage"),
)
const CitizenManagementPage = lazy(
  () => import("@/features/citizens/pages/CitizenManagementPage"),
)
const WardZoneManagementPage = lazy(
  () => import("@/features/citizens/pages/WardZoneManagementPage"),
)
const WaterConnectionsPage = lazy(
  () => import("@/features/citizens/pages/WaterConnectionsPage"),
)
const ServiceRequestsPage = lazy(
  () => import("@/features/citizens/pages/ServiceRequestsPage"),
)
const NotificationComposerPage = lazy(
  () => import("@/features/notifications/pages/NotificationComposerPage"),
)
const NotificationHistoryPage = lazy(
  () => import("@/features/notifications/pages/NotificationHistoryPage"),
)
const AnalyticsOverviewPage = lazy(
  () => import("@/features/analytics/pages/AnalyticsOverviewPage"),
)
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"))
const FloodMonitoringPage = lazy(
  () => import("@/features/emergency/pages/FloodMonitoringPage"),
)
const OfficerUserManagementPage = lazy(
  () => import("@/features/admin/pages/OfficerUserManagementPage"),
)
const RolePermissionsPage = lazy(
  () => import("@/features/admin/pages/RolePermissionsPage"),
)
const SystemSettingsPage = lazy(
  () => import("@/features/admin/pages/SystemSettingsPage"),
)
const AuditLogsPage = lazy(() => import("@/features/admin/pages/AuditLogsPage"))
const NotFoundPage = lazy(() => import("@/features/shared/pages/NotFoundPage"))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading screen..." />}>
      {children}
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <OfficerLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "supply/schedule",
        element: (
          <SuspenseWrapper>
            <SupplySchedulePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "supply/outages",
        element: (
          <SuspenseWrapper>
            <OutageManagementPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "supply/maintenance",
        element: (
          <SuspenseWrapper>
            <MaintenanceSchedulePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "complaints",
        element: (
          <SuspenseWrapper>
            <ComplaintManagementPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "gis",
        element: (
          <SuspenseWrapper>
            <GISNetworkPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "nrw/monitoring",
        element: (
          <SuspenseWrapper>
            <NRWMonitoringPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "nrw/zone-accounting",
        element: (
          <SuspenseWrapper>
            <ZoneWaterAccountingPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "nrw/leakage",
        element: (
          <SuspenseWrapper>
            <LeakageAnalysisPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "nrw/ward-comparison",
        element: (
          <SuspenseWrapper>
            <MultiWardComparisonPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "citizens/directory",
        element: (
          <SuspenseWrapper>
            <CitizenManagementPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "citizens/wards",
        element: (
          <SuspenseWrapper>
            <WardZoneManagementPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "citizens/connections",
        element: (
          <SuspenseWrapper>
            <WaterConnectionsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "citizens/service-requests",
        element: (
          <SuspenseWrapper>
            <ServiceRequestsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "notifications/composer",
        element: (
          <SuspenseWrapper>
            <NotificationComposerPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "notifications/history",
        element: (
          <SuspenseWrapper>
            <NotificationHistoryPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "analytics",
        element: (
          <SuspenseWrapper>
            <AnalyticsOverviewPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "profile",
        element: (
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "emergency/flood",
        element: (
          <SuspenseWrapper>
            <FloodMonitoringPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "admin/users",
        element: (
          <SuspenseWrapper>
            <OfficerUserManagementPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "admin/roles",
        element: (
          <SuspenseWrapper>
            <RolePermissionsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "admin/settings",
        element: (
          <SuspenseWrapper>
            <SystemSettingsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "admin/audit-logs",
        element: (
          <SuspenseWrapper>
            <AuditLogsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "*",
        element: (
          <SuspenseWrapper>
            <NotFoundPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
])
