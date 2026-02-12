"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Search, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/redux/store"
import { updateTagSeo } from "@/redux/slices/tagSlice"
import { toast } from "sonner"
import type { Tag } from "@/redux/services/tagService"

interface TagSeoDrawerProps {
  tag: Tag | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TagSeoDrawer({ tag, open, onOpenChange }: TagSeoDrawerProps) {
  const dispatch = useAppDispatch()

  // Meta fields
  const [metaTitle, setMetaTitle] = useState("")
  const [metaKeywords, setMetaKeywords] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [metaRobots, setMetaRobots] = useState("")
  const [metaCanonical, setMetaCanonical] = useState("")

  // Open Graph fields
  const [ogTitle, setOgTitle] = useState("")
  const [ogSiteName, setOgSiteName] = useState("")
  const [ogDescription, setOgDescription] = useState("")
  const [ogUrl, setOgUrl] = useState("")
  const [ogImageUrl, setOgImageUrl] = useState("")

  // Twitter Card fields
  const [twitterCardTitle, setTwitterCardTitle] = useState("")
  const [twitterCardSiteName, setTwitterCardSiteName] = useState("")
  const [twitterCardDescription, setTwitterCardDescription] = useState("")
  const [twitterUrl, setTwitterUrl] = useState("")
  const [twitterMedia, setTwitterMedia] = useState("")

  // Loading state
  const [isLoading, setIsLoading] = useState(false)

  // Populate form when drawer opens
  useEffect(() => {
    if (tag && open) {
      const seo = tag.seo || {}
      setMetaTitle(seo.meta_title || "")
      setMetaKeywords(seo.meta_keywords || "")
      setMetaDescription(seo.meta_description || "")
      setMetaRobots(seo.meta_robots || "")
      setMetaCanonical(seo.meta_canonical || "")
      setOgTitle(seo.og_title || "")
      setOgSiteName(seo.og_site_name || "")
      setOgDescription(seo.og_description || "")
      setOgUrl(seo.og_url || "")
      setOgImageUrl(seo.og_image_url || "")
      setTwitterCardTitle(seo.twitter_card_title || "")
      setTwitterCardSiteName(seo.twitter_card_site_name || "")
      setTwitterCardDescription(seo.twitter_card_description || "")
      setTwitterUrl(seo.twitter_url || "")
      setTwitterMedia(seo.twitter_media || "")
    }
  }, [tag, open])

  // Handle drawer close
  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    onOpenChange(isOpen)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!tag) return

    setIsLoading(true)

    try {
      await dispatch(
        updateTagSeo({
          id: tag.id,
          data: {
            meta_title: metaTitle.trim() || null,
            meta_keywords: metaKeywords.trim() || null,
            meta_description: metaDescription.trim() || null,
            meta_robots: metaRobots.trim() || null,
            meta_canonical: metaCanonical.trim() || null,
            og_title: ogTitle.trim() || null,
            og_site_name: ogSiteName.trim() || null,
            og_description: ogDescription.trim() || null,
            og_url: ogUrl.trim() || null,
            og_image_url: ogImageUrl.trim() || null,
            twitter_card_title: twitterCardTitle.trim() || null,
            twitter_card_site_name: twitterCardSiteName.trim() || null,
            twitter_card_description: twitterCardDescription.trim() || null,
            twitter_url: twitterUrl.trim() || null,
            twitter_media: twitterMedia.trim() || null,
          },
        })
      ).unwrap()

      toast.success("Tag SEO updated successfully")
      onOpenChange(false)
    } catch (err) {
      toast.error(err as string)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="sm:max-w-xl flex flex-col p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <SheetHeader className="text-left px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit SEO Settings</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {tag?.name} - SEO configuration
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Meta Tags Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Meta Tags</h3>

            <div className="space-y-2">
              <Label htmlFor="seo-metaTitle">Meta Title</Label>
              <Input
                id="seo-metaTitle"
                placeholder="Page title for search engines"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {metaTitle.length}/200 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-metaKeywords">Meta Keywords</Label>
              <Input
                id="seo-metaKeywords"
                placeholder="Comma-separated keywords"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-metaDescription">Meta Description</Label>
              <Textarea
                id="seo-metaDescription"
                placeholder="Brief description for search results"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {metaDescription.length}/500 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-metaRobots">Meta Robots</Label>
              <Input
                id="seo-metaRobots"
                placeholder="e.g., index, follow"
                value={metaRobots}
                onChange={(e) => setMetaRobots(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-metaCanonical">Canonical URL</Label>
              <Input
                id="seo-metaCanonical"
                placeholder="https://example.com/canonical-url"
                value={metaCanonical}
                onChange={(e) => setMetaCanonical(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Open Graph Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Open Graph (Facebook, LinkedIn)</h3>

            <div className="space-y-2">
              <Label htmlFor="seo-ogTitle">OG Title</Label>
              <Input
                id="seo-ogTitle"
                placeholder="Title for social sharing"
                value={ogTitle}
                onChange={(e) => setOgTitle(e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-ogSiteName">OG Site Name</Label>
              <Input
                id="seo-ogSiteName"
                placeholder="Your website name"
                value={ogSiteName}
                onChange={(e) => setOgSiteName(e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-ogDescription">OG Description</Label>
              <Textarea
                id="seo-ogDescription"
                placeholder="Description for social sharing"
                value={ogDescription}
                onChange={(e) => setOgDescription(e.target.value)}
                rows={2}
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-ogUrl">OG URL</Label>
              <Input
                id="seo-ogUrl"
                placeholder="https://example.com/page"
                value={ogUrl}
                onChange={(e) => setOgUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-ogImageUrl">OG Image URL</Label>
              <Input
                id="seo-ogImageUrl"
                placeholder="https://example.com/image.jpg"
                value={ogImageUrl}
                onChange={(e) => setOgImageUrl(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Twitter Card Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Twitter Card</h3>

            <div className="space-y-2">
              <Label htmlFor="seo-twitterTitle">Twitter Title</Label>
              <Input
                id="seo-twitterTitle"
                placeholder="Title for Twitter"
                value={twitterCardTitle}
                onChange={(e) => setTwitterCardTitle(e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-twitterSiteName">Twitter Site Name</Label>
              <Input
                id="seo-twitterSiteName"
                placeholder="@yourtwitterhandle"
                value={twitterCardSiteName}
                onChange={(e) => setTwitterCardSiteName(e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-twitterDescription">Twitter Description</Label>
              <Textarea
                id="seo-twitterDescription"
                placeholder="Description for Twitter"
                value={twitterCardDescription}
                onChange={(e) => setTwitterCardDescription(e.target.value)}
                rows={2}
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-twitterUrl">Twitter URL</Label>
              <Input
                id="seo-twitterUrl"
                placeholder="https://example.com/page"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-twitterMedia">Twitter Media URL</Label>
              <Input
                id="seo-twitterMedia"
                placeholder="https://example.com/twitter-image.jpg"
                value={twitterMedia}
                onChange={(e) => setTwitterMedia(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="flex-row gap-3 px-6 py-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update SEO"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
