import { lazy, Suspense } from "react"
import { createBrowserRouter } from "react-router-dom"
import { LoadingSpinner } from "@water/ui"
import CitizenLayout from "./layouts/CitizenLayout"
import { ProtectedRoute } from "@/components/ProtectedRoute"

// Lazy loaded citizen feature pages
const SplashPage = lazy(() => import("@/features/auth/pages/SplashPage"))
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"))
const OtpPage = lazy(() => import("@/features/auth/pages/OtpPage"))
const HomePage = lazy(() => import("@/features/home/pages/HomePage"))
const ReportIssuePage = lazy(
  () => import("@/features/complaints/pages/ReportIssuePage"),
)
const ComplaintsListPage = lazy(
  () => import("@/features/complaints/pages/ComplaintsListPage"),
)
const ComplaintDetailPage = lazy(
  () => import("@/features/complaints/pages/ComplaintDetailPage"),
)
const BillingPage = lazy(() => import("@/features/billing/pages/BillingPage"))
const AlertsPage = lazy(() => import("@/features/alerts/pages/AlertsPage"))
const NoticeBoardPage = lazy(
  () => import("@/features/alerts/pages/NoticeBoardPage"),
)
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"))
const SupplyStatusPage = lazy(
  () => import("@/features/supply/pages/SupplyStatusPage"),
)
const ServicesPage = lazy(
  () => import("@/features/services/pages/ServicesPage"),
)
const TankerRequestPage = lazy(
  () => import("@/features/services/pages/TankerRequestPage"),
)
const ConservationPage = lazy(
  () => import("@/features/conservation/pages/ConservationPage"),
)
const FaqPage = lazy(() => import("@/features/help/pages/FaqPage"))
const NotFoundPage = lazy(() => import("@/features/shared/pages/NotFoundPage"))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading services..." />}>
      {children}
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: "/welcome",
    element: (
      <SuspenseWrapper>
        <SplashPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/login",
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/verify-otp",
    element: (
      <SuspenseWrapper>
        <OtpPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <CitizenLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <HomePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "report",
        element: (
          <SuspenseWrapper>
            <ReportIssuePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "complaints",
        element: (
          <SuspenseWrapper>
            <ComplaintsListPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "complaints/:id",
        element: (
          <SuspenseWrapper>
            <ComplaintDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "billing",
        element: (
          <SuspenseWrapper>
            <BillingPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "alerts",
        element: (
          <SuspenseWrapper>
            <AlertsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "noticeboard",
        element: (
          <SuspenseWrapper>
            <NoticeBoardPage />
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
        path: "supply-status",
        element: (
          <SuspenseWrapper>
            <SupplyStatusPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "services",
        element: (
          <SuspenseWrapper>
            <ServicesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "services/tanker-request",
        element: (
          <SuspenseWrapper>
            <TankerRequestPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "conservation",
        element: (
          <SuspenseWrapper>
            <ConservationPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "faq",
        element: (
          <SuspenseWrapper>
            <FaqPage />
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
