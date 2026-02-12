"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchCurrentUser } from "@/redux/slices/authSlice"
import { AppInitLoader } from "@/components/loaders/AppInitLoader"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, isInitialized, isLoading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!isInitialized) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch, isInitialized])

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isInitialized, isLoading, isAuthenticated, router])

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return <AppInitLoader />
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
