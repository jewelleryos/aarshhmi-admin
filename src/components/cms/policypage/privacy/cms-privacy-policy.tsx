"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { cmsService, type PolicyPageContent } from "@/components/cms/services/cmsService"

export default function CMSPrivacyPolicy() {
    const [htmlContent, setHtmlContent] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchContent()
    }, [])

    const fetchContent = async () => {
        try {
            setIsLoading(true)
            const response = await cmsService.getPrivacyPolicy()
            const content = response.data?.content as PolicyPageContent | undefined
            if (content) {
                setHtmlContent(content.html_content || "")
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            toast.error(error.response?.data?.message || "Failed to fetch content")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const response = await cmsService.updatePrivacyPolicy({
                html_content: htmlContent,
            })
            toast.success(response.message)
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            toast.error(error.response?.data?.message || "Failed to save content")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Privacy Policy</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage privacy policy content
                    </p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <RichTextEditor
                        value={htmlContent}
                        onChange={setHtmlContent}
                        mediaRootPath="cms/policy/privacy"
                    />
                </CardContent>
            </Card>
        </div>
    )
}
