"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { fetchContactInquiries } from "@/redux/slices/contactUsSlice"
import { ContactUsTable } from "./contact-us-table"
import { ContactUsViewDrawer } from "./contact-us-view-drawer"
import type { ContactInquiryListItem } from "@/redux/services/contactUsService"

export function ContactUsContent() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((state) => state.contactUs)

  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiryListItem | null>(null)
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchContactInquiries())
  }, [dispatch])

  const handleView = (item: ContactInquiryListItem) => {
    setSelectedInquiry(item)
    setIsViewDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contact Us Inquiries</h1>
        <p className="text-muted-foreground">
          Manage customer contact form submissions
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No contact inquiries found
            </div>
          ) : (
            <ContactUsTable items={items} onView={handleView} />
          )}
        </CardContent>
      </Card>

      <ContactUsViewDrawer
        item={selectedInquiry}
        open={isViewDrawerOpen}
        onOpenChange={(open) => {
          setIsViewDrawerOpen(open)
          if (!open) {
            setSelectedInquiry(null)
          }
        }}
      />
    </div>
  )
}
