import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { SEOListItem } from "@/redux/services/seoService";
import { initializeFormData, resetFormData, setFormData, updateSeoPage } from "@/redux/slices/seoSlice";

interface SeoPageDrawerProps {
    data: SEOListItem | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function SeoPageEditDrawer({ data, open, onOpenChange, onSuccess }: SeoPageDrawerProps) {
    const dispatch = useAppDispatch()
    const { formData, isUpdating } = useAppSelector((state) => state.seo)

    // Destructure formData for easier access
    const {
        pageName,
        metaTitle,
        metaKeywords,
        metaDescription,
        metaRobots,
        metaCanonical,
        ogTitle,
        ogSiteName,
        ogDescription,
        ogUrl,
        ogImageUrl,
        twitterTitle,
        twitterSiteName,
        twitterDescription,
        twitterUrl,
        twitterMedia
    } = formData

    useEffect(() => {
        if (data && open) {
            dispatch(initializeFormData(data))
        } else if (!open) {
            dispatch(resetFormData())
        }
    }, [data, open, dispatch])

    const handleFormChange = (field: keyof typeof formData, value: string) => {
        dispatch(setFormData({ [field]: value }))
    }

    const handleSubmit = async () => {
        if (!data) return

        let keywordsArray: string[] = []
        if (metaKeywords.trim()) {
            keywordsArray = metaKeywords.split(",").map(k => k.trim()).filter(k => k)
        }

        const payload = {
            name: pageName,
            seo_data: {
                title: metaTitle || "",
                description: metaDescription || "",
                keywords: keywordsArray.length > 0 ? keywordsArray : [],
                canonical_url: metaCanonical || "",
                robots: metaRobots || "",
                og_title: ogTitle || "",
                og_site_name: ogSiteName || "",
                og_description: ogDescription || "",
                og_url: ogUrl || "",
                og_image: ogImageUrl || "",
                twitter_title: twitterTitle || "",
                twitter_site: twitterSiteName || "",
                twitter_description: twitterDescription || "",
                twitter_url: twitterUrl || "",
                twitter_image: twitterMedia || "",
            }
        }

        try {
            const res = await dispatch(updateSeoPage({ id: data.id, data: payload })).unwrap()
            toast.success(res.message)
            onOpenChange(false)
            if (onSuccess) {
                onSuccess()
            }
        } catch (error: any) {
            toast.error(error || "Something went wrong updating SEO settings")
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
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
                                {data?.name ? `${data.name} - SEO configuration` : "SEO configuration"}
                            </p>
                        </div>
                    </div>
                </SheetHeader>

                {/* Form */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="seo-pageName">Page Name</Label>
                            <Input
                                id="seo-pageName"
                                placeholder="Page name inside admin panel"
                                value={pageName}
                                onChange={(e) => handleFormChange("pageName", e.target.value)}
                                maxLength={200}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Meta Tags Section */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-sm">Meta Tags</h3>

                        <div className="space-y-2">
                            <Label htmlFor="seo-metaTitle">Meta Title</Label>
                            <Input
                                id="seo-metaTitle"
                                placeholder="Page title for search engines"
                                value={metaTitle}
                                onChange={(e) => handleFormChange("metaTitle", e.target.value)}
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
                                onChange={(e) => handleFormChange("metaKeywords", e.target.value)}
                                maxLength={500}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="seo-metaDescription">Meta Description</Label>
                            <Textarea
                                id="seo-metaDescription"
                                placeholder="Brief description for search results"
                                value={metaDescription}
                                onChange={(e) => handleFormChange("metaDescription", e.target.value)}
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
                                onChange={(e) => handleFormChange("metaRobots", e.target.value)}
                                maxLength={100}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="seo-metaCanonical">Canonical URL</Label>
                            <Input
                                id="seo-metaCanonical"
                                placeholder="https://example.com/canonical-url"
                                value={metaCanonical}
                                onChange={(e) => handleFormChange("metaCanonical", e.target.value)}
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
                                onChange={(e) => handleFormChange("ogTitle", e.target.value)}
                                maxLength={200}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="seo-ogSiteName">OG Site Name</Label>
                            <Input
                                id="seo-ogSiteName"
                                placeholder="Your website name"
                                value={ogSiteName}
                                onChange={(e) => handleFormChange("ogSiteName", e.target.value)}
                                maxLength={200}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="seo-ogDescription">OG Description</Label>
                            <Textarea
                                id="seo-ogDescription"
                                placeholder="Description for social sharing"
                                value={ogDescription}
                                onChange={(e) => handleFormChange("ogDescription", e.target.value)}
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
                                onChange={(e) => handleFormChange("ogUrl", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="seo-ogImageUrl">OG Image URL</Label>
                            <Input
                                id="seo-ogImageUrl"
                                placeholder="https://example.com/image.jpg"
                                value={ogImageUrl}
                                onChange={(e) => handleFormChange("ogImageUrl", e.target.value)}
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
                                value={twitterTitle}
                                onChange={(e) => handleFormChange("twitterTitle", e.target.value)}
                                maxLength={200}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="seo-twitterSiteName">Twitter Site Name</Label>
                            <Input
                                id="seo-twitterSiteName"
                                placeholder="@yourtwitterhandle"
                                value={twitterSiteName}
                                onChange={(e) => handleFormChange("twitterSiteName", e.target.value)}
                                maxLength={200}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="seo-twitterDescription">Twitter Description</Label>
                            <Textarea
                                id="seo-twitterDescription"
                                placeholder="Description for Twitter"
                                value={twitterDescription}
                                onChange={(e) => handleFormChange("twitterDescription", e.target.value)}
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
                                onChange={(e) => handleFormChange("twitterUrl", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="seo-twitterMedia">Twitter Media URL</Label>
                            <Input
                                id="seo-twitterMedia"
                                placeholder="https://example.com/twitter-image.jpg"
                                value={twitterMedia}
                                onChange={(e) => handleFormChange("twitterMedia", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <SheetFooter className="flex-row gap-3 px-6 py-4 border-t">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => onOpenChange(false)}
                        disabled={isUpdating}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={handleSubmit}
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
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