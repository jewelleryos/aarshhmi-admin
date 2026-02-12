"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface SeoData {
  metaTitle: string
  metaKeywords: string
  metaDescription: string
  metaRobots: string
  metaCanonical: string
  ogTitle: string
  ogSiteName: string
  ogDescription: string
  ogUrl: string
  ogImageUrl: string
  twitterCardTitle: string
  twitterCardSiteName: string
  twitterCardDescription: string
  twitterUrl: string
  twitterMedia: string
}

interface SeoSectionProps {
  data: SeoData
  onChange: (data: SeoData) => void
}

export function SeoSection({ data, onChange }: SeoSectionProps) {
  const handleChange = (field: keyof SeoData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      {/* Meta Tags Section */}
      <Card>
        <CardHeader>
          <CardTitle>Meta Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seo-metaTitle">Meta Title</Label>
            <Input
              id="seo-metaTitle"
              placeholder="Page title for search engines"
              value={data.metaTitle}
              onChange={(e) => handleChange("metaTitle", e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {data.metaTitle.length}/200 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-metaKeywords">Meta Keywords</Label>
            <Input
              id="seo-metaKeywords"
              placeholder="Comma-separated keywords"
              value={data.metaKeywords}
              onChange={(e) => handleChange("metaKeywords", e.target.value)}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-metaDescription">Meta Description</Label>
            <Textarea
              id="seo-metaDescription"
              placeholder="Brief description for search results"
              value={data.metaDescription}
              onChange={(e) => handleChange("metaDescription", e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {data.metaDescription.length}/500 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-metaRobots">Meta Robots</Label>
            <Input
              id="seo-metaRobots"
              placeholder="e.g., index, follow"
              value={data.metaRobots}
              onChange={(e) => handleChange("metaRobots", e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-metaCanonical">Canonical URL</Label>
            <Input
              id="seo-metaCanonical"
              placeholder="https://example.com/canonical-url"
              value={data.metaCanonical}
              onChange={(e) => handleChange("metaCanonical", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Open Graph Section */}
      <Card>
        <CardHeader>
          <CardTitle>Open Graph (Facebook, LinkedIn)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seo-ogTitle">OG Title</Label>
            <Input
              id="seo-ogTitle"
              placeholder="Title for social sharing"
              value={data.ogTitle}
              onChange={(e) => handleChange("ogTitle", e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-ogSiteName">OG Site Name</Label>
            <Input
              id="seo-ogSiteName"
              placeholder="Your website name"
              value={data.ogSiteName}
              onChange={(e) => handleChange("ogSiteName", e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-ogDescription">OG Description</Label>
            <Textarea
              id="seo-ogDescription"
              placeholder="Description for social sharing"
              value={data.ogDescription}
              onChange={(e) => handleChange("ogDescription", e.target.value)}
              rows={2}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-ogUrl">OG URL</Label>
            <Input
              id="seo-ogUrl"
              placeholder="https://example.com/page"
              value={data.ogUrl}
              onChange={(e) => handleChange("ogUrl", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-ogImageUrl">OG Image URL</Label>
            <Input
              id="seo-ogImageUrl"
              placeholder="https://example.com/image.jpg"
              value={data.ogImageUrl}
              onChange={(e) => handleChange("ogImageUrl", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Twitter Card Section */}
      <Card>
        <CardHeader>
          <CardTitle>Twitter Card</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seo-twitterTitle">Twitter Title</Label>
            <Input
              id="seo-twitterTitle"
              placeholder="Title for Twitter"
              value={data.twitterCardTitle}
              onChange={(e) => handleChange("twitterCardTitle", e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-twitterSiteName">Twitter Site Name</Label>
            <Input
              id="seo-twitterSiteName"
              placeholder="@yourtwitterhandle"
              value={data.twitterCardSiteName}
              onChange={(e) => handleChange("twitterCardSiteName", e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-twitterDescription">Twitter Description</Label>
            <Textarea
              id="seo-twitterDescription"
              placeholder="Description for Twitter"
              value={data.twitterCardDescription}
              onChange={(e) => handleChange("twitterCardDescription", e.target.value)}
              rows={2}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-twitterUrl">Twitter URL</Label>
            <Input
              id="seo-twitterUrl"
              placeholder="https://example.com/page"
              value={data.twitterUrl}
              onChange={(e) => handleChange("twitterUrl", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-twitterMedia">Twitter Media URL</Label>
            <Input
              id="seo-twitterMedia"
              placeholder="https://example.com/twitter-image.jpg"
              value={data.twitterMedia}
              onChange={(e) => handleChange("twitterMedia", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
