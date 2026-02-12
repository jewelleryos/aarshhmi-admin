"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home } from "lucide-react"
import { Fragment } from "react"

interface MediaBreadcrumbProps {
  path: string
  onNavigate: (path: string) => void
}

export function MediaBreadcrumb({ path, onNavigate }: MediaBreadcrumbProps) {
  // Parse path into segments
  const segments = path
    .split("/")
    .filter((s) => s.length > 0)

  // Build path for each segment
  const buildPath = (index: number): string => {
    return "/" + segments.slice(0, index + 1).join("/") + "/"
  }

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        {/* Root / Home */}
        <BreadcrumbItem className="shrink-0">
          {segments.length === 0 ? (
            <BreadcrumbPage className="flex items-center gap-1.5">
              <Home className="h-4 w-4" />
              Root
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink
              href="#"
              onClick={(e) => {
                e.preventDefault()
                onNavigate("")
              }}
              className="flex items-center gap-1.5"
            >
              <Home className="h-4 w-4" />
              Root
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {/* Path segments */}
        {segments.map((segment, index) => (
          <Fragment key={segment + index}>
            <BreadcrumbSeparator className="shrink-0" />
            <BreadcrumbItem className="min-w-0">
              {index === segments.length - 1 ? (
                <BreadcrumbPage className="truncate max-w-32">{segment}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    onNavigate(buildPath(index))
                  }}
                  className="truncate max-w-32"
                >
                  {segment}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
