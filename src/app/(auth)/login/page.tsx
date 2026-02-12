"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchCurrentUser } from "@/redux/slices/authSlice"
import { LoginForm } from "@/components/login-form"
import { AppInitLoader } from "@/components/loaders/AppInitLoader"
import { Gem } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth)

  // Check auth status on mount
  useEffect(() => {
    if (!isInitialized) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch, isInitialized])

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  // Show loader while checking auth status (only if coming from a page refresh)
  if (!isInitialized) {
    return <AppInitLoader />
  }

  // If authenticated, don't show login page (will redirect)
  if (isAuthenticated) {
    return <AppInitLoader />
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-card overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Gem className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Luminique</span>
          </div>

          {/* Center Content */}
          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl font-bold leading-tight text-balance">
              Manage Your <span className="text-primary">Jewelry Empire</span> with Elegance
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              A sophisticated admin panel designed for premium jewelry brands. Manage products, track performance, and
              grow your business.
            </p>
            <div className="flex items-center gap-6 pt-4">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Products</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">$10M</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">99%</p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-muted-foreground">© 2025 Luminique. Premium jewelry platform.</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
        <LoginForm />
      </div>
    </div>
  )
}
