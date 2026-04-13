"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  Phone,
  User,
  FileText,
  Clock,
  Calendar,
  MessageSquare,
  ShieldCheck,
} from "lucide-react"
import type { ContactInquiryListItem } from "@/redux/services/contactUsService"

interface ContactUsViewDrawerProps {
  item: ContactInquiryListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDateTime(dateString: string): string {
  return (
    new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) +
    " at " +
    new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  )
}

export function ContactUsViewDrawer({ item, open, onOpenChange }: ContactUsViewDrawerProps) {
  if (!item) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto p-6 sm:max-w-2xl">
        <SheetHeader className="mb-6 text-left">
          <SheetTitle className="text-xl">Contact Inquiry Details</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Submitted on {formatDateTime(item.created_at)}
          </p>
        </SheetHeader>

        {/* Customer Information */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Contact Information
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-muted/50 rounded-md p-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{item.name}</span>
            </div>
            {item.email ? (
              <div className="flex items-center gap-3 bg-muted/50 rounded-md p-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{item.email}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-muted/50 rounded-md p-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No email provided</span>
              </div>
            )}
            {item.phone ? (
              <div className="flex items-center gap-3 bg-muted/50 rounded-md p-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{item.phone}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-muted/50 rounded-md p-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No phone provided</span>
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Message
            </span>
          </div>
          <div className="bg-muted/50 rounded-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Customer Message</span>
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{item.message}</p>
          </div>
        </div>

        {/* Consent */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Consent
            </span>
          </div>
          <div className="flex items-center gap-3 bg-muted/50 rounded-md p-3">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <Badge
              variant="outline"
              className={
                item.is_consent_given
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }
            >
              {item.is_consent_given ? "Consent given" : "Consent not given"}
            </Badge>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Timeline
            </span>
          </div>
          <div className="bg-muted/50 rounded-md p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Submitted</span>
            </div>
            <p className="text-sm font-medium">{formatDateTime(item.created_at)}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
