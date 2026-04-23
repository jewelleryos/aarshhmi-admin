'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    cmsService,
    type AboutUsContent,
    type AboutUsSection1,
    type AboutUsSection2Item,
    type AboutUsSection3,
    type AboutUsSection3SubSection,
    type AboutUsSection4,
    type AboutUsSection4SubSection,
    type AboutUsSection5Item,
    type AboutUsSection6,
} from '@/components/cms/services/cmsService'
import { MediaPickerInput } from '@/components/media'

const defaultSection1: AboutUsSection1 = {
    title1: '',
    title2: '',
    description: '',
    name: '',
    designation: '',
    image_url: '',
    mobile_view_image_url: '',
    image_alt_text: '',
}

const defaultSection2Item: AboutUsSection2Item = {
    title: '',
    description: '',
    images: [''],
    mobile_images: [],
    image_alt_text: '',
}

const defaultSection3SubSection: AboutUsSection3SubSection = {
    sub_title: '',
    description: '',
    image_url: '',
    mobile_view_image_url: '',
    image_alt_text: '',
}

const defaultSection4SubSection: AboutUsSection4SubSection = {
    sub_title: '',
    description: '',
    image_url: '',
    mobile_view_image_url: '',
    image_alt_text: '',
}

const defaultSection5Item: AboutUsSection5Item = {
    title: '',
    description1: '',
    description2: '',
    image_url: '',
    mobile_view_image_url: '',
    image_alt_text: '',
}

const defaultSection6: AboutUsSection6 = {
    title: '',
    description1: '',
    description2: '',
    image_url: '',
    mobile_view_image_url: '',
    image_alt_text: '',
}

const createDefaultSection2 = (): AboutUsSection2Item[] =>
    Array.from({ length: 1 }, () => ({ ...defaultSection2Item }))

const createDefaultSection3 = (): AboutUsSection3 => ({
    title: '',
    sub_sections: Array.from({ length: 2 }, () => ({ ...defaultSection3SubSection })),
})

const createDefaultSection4 = (): AboutUsSection4 => ({
    title: '',
    sub_sections: Array.from({ length: 4 }, () => ({ ...defaultSection4SubSection })),
})

const createDefaultSection5 = (): AboutUsSection5Item[] =>
    Array.from({ length: 2 }, () => ({ ...defaultSection5Item }))

export default function CMSAboutUs() {
    const [section1, setSection1] = useState<AboutUsSection1>({ ...defaultSection1 })
    const [section2, setSection2] = useState<AboutUsSection2Item[]>(createDefaultSection2())
    const [section3, setSection3] = useState<AboutUsSection3>(createDefaultSection3())
    const [section4, setSection4] = useState<AboutUsSection4>(createDefaultSection4())
    const [section5, setSection5] = useState<AboutUsSection5Item[]>(createDefaultSection5())
    const [section6, setSection6] = useState<AboutUsSection6>({ ...defaultSection6 })

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        fetchContent()
    }, [])

    const fetchContent = async () => {
        try {
            setIsLoading(true)
            const response = await cmsService.getAboutUs()
            const content = response.data?.content as AboutUsContent | undefined
            if (content) {
                if (content.section1) setSection1({ ...defaultSection1, ...content.section1 })
                if (content.section2 && content.section2.length > 0) {
                    setSection2(
                        content.section2.map((item) => ({
                            ...defaultSection2Item,
                            ...item,
                            images: item.images?.length ? item.images : [''],
                            mobile_images: item.mobile_images ?? [],
                        }))
                    )
                }
                if (content.section3 && content.section3.sub_sections?.length === 2) {
                    setSection3({
                        title: content.section3.title || '',
                        sub_sections: content.section3.sub_sections.map((item) => ({ ...defaultSection3SubSection, ...item })),
                    })
                }
                if (content.section4 && content.section4.sub_sections?.length === 4) {
                    setSection4({
                        title: content.section4.title || '',
                        sub_sections: content.section4.sub_sections.map((item) => ({ ...defaultSection4SubSection, ...item })),
                    })
                }
                if (content.section5 && content.section5.length === 2) {
                    setSection5(content.section5.map((item) => ({ ...defaultSection5Item, ...item })))
                }
                if (content.section6) setSection6({ ...defaultSection6, ...content.section6 })
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            toast.error(error.response?.data?.message || 'Failed to fetch content')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        const newErrors: Record<string, string> = {}

        // Section 1 validation
        if (!section1.title1) newErrors['s1_title1'] = 'Title1 is required'
        if (!section1.title2) newErrors['s1_title2'] = 'Title2 is required'
        if (!section1.description) newErrors['s1_description'] = 'Description is required'
        if (!section1.name) newErrors['s1_name'] = 'Name is required'
        if (!section1.designation) newErrors['s1_designation'] = 'Designation is required'
        if (!section1.image_url) newErrors['s1_image_url'] = 'Image is required'

        // Section 2 validation
        section2.forEach((item, i) => {
            if (!item.title) newErrors[`s2_${i}_title`] = 'Title is required'
            if (!item.description) newErrors[`s2_${i}_description`] = 'Description is required'
            if (!item.images || item.images.length === 0 || item.images.every((url) => !url)) {
                newErrors[`s2_${i}_images`] = 'At least one image is required'
            }
        })

        // Section 3 validation
        if (!section3.title) newErrors['s3_title'] = 'Title is required'
        section3.sub_sections.forEach((item, i) => {
            if (!item.sub_title) newErrors[`s3_sub_${i}_sub_title`] = 'Sub title is required'
            if (!item.description) newErrors[`s3_sub_${i}_description`] = 'Description is required'
            if (!item.image_url) newErrors[`s3_sub_${i}_image_url`] = 'Image is required'
        })

        // Section 4 validation
        if (!section4.title) newErrors['s4_title'] = 'Title is required'
        section4.sub_sections.forEach((item, i) => {
            if (!item.sub_title) newErrors[`s4_sub_${i}_sub_title`] = 'Sub title is required'
            if (!item.description) newErrors[`s4_sub_${i}_description`] = 'Description is required'
            if (!item.image_url) newErrors[`s4_sub_${i}_image_url`] = 'Image is required'
        })

        // Section 5 validation
        section5.forEach((item, i) => {
            if (!item.title) newErrors[`s5_${i}_title`] = 'Title is required'
            if (!item.description1) newErrors[`s5_${i}_description1`] = 'Description 1 is required'
            if (!item.description2) newErrors[`s5_${i}_description2`] = 'Description 2 is required'
            if (!item.image_url) newErrors[`s5_${i}_image_url`] = 'Image is required'
        })

        // Section 6 validation
        if (!section6.title) newErrors['s6_title'] = 'Title is required'
        if (!section6.description1) newErrors['s6_description1'] = 'Description 1 is required'
        if (!section6.description2) newErrors['s6_description2'] = 'Description 2 is required'
        if (!section6.image_url) newErrors['s6_image_url'] = 'Image is required'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            setTimeout(() => {
                const firstError = document.querySelector('p.text-destructive')
                firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 0)
            return
        }

        setErrors({})
        setIsSaving(true)

        try {
            const response = await cmsService.updateAboutUs({
                section1,
                section2,
                section3,
                section4,
                section5,
                section6,
            })
            toast.success(response.message)
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            toast.error(error.response?.data?.message || 'Failed to save content')
        } finally {
            setIsSaving(false)
        }
    }

    // Helper to update section2 scalar fields (title, description, image_alt_text)
    const updateSection2 = (index: number, field: keyof AboutUsSection2Item, value: string) => {
        setSection2((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
    }

    const addSection2Item = () => {
        setSection2((prev) => [...prev, { ...defaultSection2Item, images: [''], mobile_images: [] }])
    }

    const removeSection2Item = (index: number) => {
        setSection2((prev) => prev.filter((_, i) => i !== index))
    }

    // Section 2 image array helpers
    const updateSection2Image = (itemIndex: number, imgIndex: number, value: string) => {
        setSection2((prev) =>
            prev.map((item, i) => {
                if (i !== itemIndex) return item
                const images = [...item.images]
                images[imgIndex] = value
                return { ...item, images }
            })
        )
    }

    const addSection2Image = (itemIndex: number) => {
        setSection2((prev) =>
            prev.map((item, i) => (i === itemIndex ? { ...item, images: [...item.images, ''] } : item))
        )
    }

    const removeSection2Image = (itemIndex: number, imgIndex: number) => {
        setSection2((prev) =>
            prev.map((item, i) => {
                if (i !== itemIndex) return item
                return { ...item, images: item.images.filter((_, j) => j !== imgIndex) }
            })
        )
    }

    // Section 2 mobile image array helpers
    const updateSection2MobileImage = (itemIndex: number, imgIndex: number, value: string) => {
        setSection2((prev) =>
            prev.map((item, i) => {
                if (i !== itemIndex) return item
                const mobile_images = [...(item.mobile_images ?? [])]
                mobile_images[imgIndex] = value
                return { ...item, mobile_images }
            })
        )
    }

    const addSection2MobileImage = (itemIndex: number) => {
        setSection2((prev) =>
            prev.map((item, i) =>
                i === itemIndex ? { ...item, mobile_images: [...(item.mobile_images ?? []), ''] } : item
            )
        )
    }

    const removeSection2MobileImage = (itemIndex: number, imgIndex: number) => {
        setSection2((prev) =>
            prev.map((item, i) => {
                if (i !== itemIndex) return item
                return { ...item, mobile_images: (item.mobile_images ?? []).filter((_, j) => j !== imgIndex) }
            })
        )
    }

    // Helper to update section3 sub_sections
    const updateSection3SubSection = (index: number, field: keyof AboutUsSection3SubSection, value: string) => {
        setSection3((prev) => ({
            ...prev,
            sub_sections: prev.sub_sections.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
        }))
    }

    // Helper to update section4 sub_sections
    const updateSection4SubSection = (index: number, field: keyof AboutUsSection4SubSection, value: string) => {
        setSection4((prev) => ({
            ...prev,
            sub_sections: prev.sub_sections.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
        }))
    }

    // Helper to update section5 array items
    const updateSection5 = (index: number, field: keyof AboutUsSection5Item, value: string) => {
        setSection5((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
    }

    // Clear error helper
    const clearError = (key: string) => {
        if (errors[key]) {
            setErrors((prev) => {
                const next = { ...prev }
                delete next[key]
                return next
            })
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">About Us</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage the about us page content
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

            {/* Section 1 - Our Legacy */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Section 1 - Our Legacy</h2>
                <Card>
                    {/* <CardHeader>
          <CardTitle>Section 1 - Our Legacy</CardTitle>
        </CardHeader> */}
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="s1_title1">
                                Title 1 <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="s1_title1"
                                placeholder="e.g., OUR"
                                value={section1.title1}
                                onChange={(e) => {
                                    setSection1((prev) => ({ ...prev, title1: e.target.value }))
                                    clearError('s1_title1')
                                }}
                            />
                            {errors.s1_title1 && <p className="text-sm text-destructive">{errors.s1_title1}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="s1_title2">
                                Title 2 <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="s1_title2"
                                placeholder="e.g., LEGACY"
                                value={section1.title2}
                                onChange={(e) => {
                                    setSection1((prev) => ({ ...prev, title2: e.target.value }))
                                    clearError('s1_title2')
                                }}
                            />
                            {errors.s1_title2 && <p className="text-sm text-destructive">{errors.s1_title2}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="s1_description">
                                Description <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="s1_description"
                                placeholder="Enter the legacy description or quote..."
                                value={section1.description}
                                onChange={(e) => {
                                    setSection1((prev) => ({ ...prev, description: e.target.value }))
                                    clearError('s1_description')
                                }}
                                rows={4}
                            />
                            {errors.s1_description && <p className="text-sm text-destructive">{errors.s1_description}</p>}
                        </div>

                        <MediaPickerInput
                            label="Founder Image"
                            value={section1.image_url || null}
                            onChange={(path) => {
                                setSection1((prev) => ({ ...prev, image_url: path || '' }))
                                clearError('s1_image_url')
                            }}
                            rootPath="cms/about-us/section1"
                            required
                            error={errors.s1_image_url}
                            accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                        />

                        <MediaPickerInput
                            label="Mobile View Image"
                            value={section1.mobile_view_image_url || null}
                            onChange={(path) => {
                                setSection1((prev) => ({ ...prev, mobile_view_image_url: path || '' }))
                            }}
                            rootPath="cms/about-us/section1/mobile"
                            accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                        />

                        <div className="space-y-2">
                            <Label htmlFor="s1_image_alt_text">Image Alt Text</Label>
                            <Input
                                id="s1_image_alt_text"
                                placeholder="Describe the founder image"
                                value={section1.image_alt_text}
                                onChange={(e) => setSection1((prev) => ({ ...prev, image_alt_text: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="s1_name">
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="s1_name"
                                placeholder="e.g., John Doe"
                                value={section1.name}
                                onChange={(e) => {
                                    setSection1((prev) => ({ ...prev, name: e.target.value }))
                                    clearError('s1_name')
                                }}
                            />
                            {errors.s1_name && <p className="text-sm text-destructive">{errors.s1_name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="s1_designation">
                                Designation <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="s1_designation"
                                placeholder="e.g., Founder & Managing Director"
                                value={section1.designation}
                                onChange={(e) => {
                                    setSection1((prev) => ({ ...prev, designation: e.target.value }))
                                    clearError('s1_designation')
                                }}
                            />
                            {errors.s1_designation && <p className="text-sm text-destructive">{errors.s1_designation}</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Section 2 - Timeline (Dynamic) */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Section 2 - Timeline</h2>
                    <Button type="button" variant="outline" size="sm" onClick={addSection2Item}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Timeline Item
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section2.map((item, index) => (
                        <Card key={index}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Timeline Item {index + 1}</CardTitle>
                                    {section2.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => removeSection2Item(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>
                                        Title <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        placeholder="e.g., 1968"
                                        value={item.title}
                                        onChange={(e) => {
                                            updateSection2(index, 'title', e.target.value)
                                            clearError(`s2_${index}_title`)
                                        }}
                                    />
                                    {errors[`s2_${index}_title`] && <p className="text-sm text-destructive">{errors[`s2_${index}_title`]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Description <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        placeholder="Enter timeline description..."
                                        value={item.description}
                                        onChange={(e) => {
                                            updateSection2(index, 'description', e.target.value)
                                            clearError(`s2_${index}_description`)
                                        }}
                                        rows={3}
                                    />
                                    {errors[`s2_${index}_description`] && <p className="text-sm text-destructive">{errors[`s2_${index}_description`]}</p>}
                                </div>

                                {/* Images (normal view) */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>
                                            Images <span className="text-destructive">*</span>
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addSection2Image(index)}
                                        >
                                            <Plus className="mr-1 h-3 w-3" />
                                            Add Image
                                        </Button>
                                    </div>
                                    {errors[`s2_${index}_images`] && <p className="text-sm text-destructive">{errors[`s2_${index}_images`]}</p>}
                                    <div className="space-y-2">
                                        {item.images.map((imgUrl, imgIndex) => (
                                            <div key={imgIndex} className="space-y-1">
                                                <Label className="text-sm">Image {imgIndex + 1}</Label>
                                                <MediaPickerInput
                                                    label=""
                                                    value={imgUrl || null}
                                                    onChange={(path) => {
                                                        updateSection2Image(index, imgIndex, path || '')
                                                        clearError(`s2_${index}_images`)
                                                    }}
                                                    rootPath="cms/about-us/section2"
                                                    accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Mobile Images */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Mobile View Images</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addSection2MobileImage(index)}
                                        >
                                            <Plus className="mr-1 h-3 w-3" />
                                            Add Mobile Image
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {(item.mobile_images ?? []).map((imgUrl, imgIndex) => (
                                            <div key={imgIndex} className="space-y-1">
                                                <Label className="text-sm">Mobile Image {imgIndex + 1}</Label>
                                                <MediaPickerInput
                                                    label=""
                                                    value={imgUrl || null}
                                                    onChange={(path) => updateSection2MobileImage(index, imgIndex, path || '')}
                                                    rootPath="cms/about-us/section2/mobile"
                                                    accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Image Alt Text</Label>
                                    <Input
                                        placeholder="Describe the image"
                                        value={item.image_alt_text}
                                        onChange={(e) => {
                                            updateSection2(index, 'image_alt_text', e.target.value)
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Section 3 (2 Fixed Sub Sections) */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Section 3 (2 Fixed Sub Sections)</h2>
                <Card className="mb-4">
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <Label htmlFor="s3_title">
                                Section Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="s3_title"
                                placeholder="Enter section title"
                                value={section3.title}
                                onChange={(e) => {
                                    setSection3((prev) => ({ ...prev, title: e.target.value }))
                                    clearError('s3_title')
                                }}
                            />
                            {errors.s3_title && <p className="text-sm text-destructive">{errors.s3_title}</p>}
                        </div>
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section3.sub_sections.map((item, index) => (
                        <Card key={index}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Sub Section {index + 1}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>
                                        Sub Title <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Enter sub title"
                                        value={item.sub_title}
                                        onChange={(e) => {
                                            updateSection3SubSection(index, 'sub_title', e.target.value)
                                            clearError(`s3_sub_${index}_sub_title`)
                                        }}
                                    />
                                    {errors[`s3_sub_${index}_sub_title`] && <p className="text-sm text-destructive">{errors[`s3_sub_${index}_sub_title`]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Description <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        placeholder="Enter description..."
                                        value={item.description}
                                        onChange={(e) => {
                                            updateSection3SubSection(index, 'description', e.target.value)
                                            clearError(`s3_sub_${index}_description`)
                                        }}
                                        rows={3}
                                    />
                                    {errors[`s3_sub_${index}_description`] && <p className="text-sm text-destructive">{errors[`s3_sub_${index}_description`]}</p>}
                                </div>

                                <MediaPickerInput
                                    label="Image"
                                    value={item.image_url || null}
                                    onChange={(path) => {
                                        updateSection3SubSection(index, 'image_url', path || '')
                                        clearError(`s3_sub_${index}_image_url`)
                                    }}
                                    rootPath="cms/about-us/section3"
                                    required
                                    error={errors[`s3_sub_${index}_image_url`]}
                                    accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                                />

                                <MediaPickerInput
                                    label="Mobile View Image"
                                    value={item.mobile_view_image_url || null}
                                    onChange={(path) => {
                                        updateSection3SubSection(index, 'mobile_view_image_url', path || '')
                                    }}
                                    rootPath="cms/about-us/section3/mobile"
                                    accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                                />

                                <div className="space-y-2">
                                    <Label>Image Alt Text</Label>
                                    <Input
                                        placeholder="Describe the image"
                                        value={item.image_alt_text}
                                        onChange={(e) => updateSection3SubSection(index, 'image_alt_text', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Section 4 (4 Fixed Sub Sections) */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Section 4 (4 Fixed Sub Sections)</h2>
                <Card className="mb-4">
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <Label htmlFor="s4_title">
                                Section Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="s4_title"
                                placeholder="Enter section title"
                                value={section4.title}
                                onChange={(e) => {
                                    setSection4((prev) => ({ ...prev, title: e.target.value }))
                                    clearError('s4_title')
                                }}
                            />
                            {errors.s4_title && <p className="text-sm text-destructive">{errors.s4_title}</p>}
                        </div>
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {section4.sub_sections.map((item, index) => (
                        <Card key={index}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Sub Section {index + 1}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>
                                        Sub Title <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Enter sub title"
                                        value={item.sub_title}
                                        onChange={(e) => {
                                            updateSection4SubSection(index, 'sub_title', e.target.value)
                                            clearError(`s4_sub_${index}_sub_title`)
                                        }}
                                    />
                                    {errors[`s4_sub_${index}_sub_title`] && <p className="text-sm text-destructive">{errors[`s4_sub_${index}_sub_title`]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Description <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        placeholder="Enter description..."
                                        value={item.description}
                                        onChange={(e) => {
                                            updateSection4SubSection(index, 'description', e.target.value)
                                            clearError(`s4_sub_${index}_description`)
                                        }}
                                        rows={3}
                                    />
                                    {errors[`s4_sub_${index}_description`] && <p className="text-sm text-destructive">{errors[`s4_sub_${index}_description`]}</p>}
                                </div>

                                <MediaPickerInput
                                    label="Image"
                                    value={item.image_url || null}
                                    onChange={(path) => {
                                        updateSection4SubSection(index, 'image_url', path || '')
                                        clearError(`s4_sub_${index}_image_url`)
                                    }}
                                    rootPath="cms/about-us/section4"
                                    required
                                    error={errors[`s4_sub_${index}_image_url`]}
                                    accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                                />

                                <MediaPickerInput
                                    label="Mobile View Image"
                                    value={item.mobile_view_image_url || null}
                                    onChange={(path) => {
                                        updateSection4SubSection(index, 'mobile_view_image_url', path || '')
                                    }}
                                    rootPath="cms/about-us/section4/mobile"
                                    accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                                />

                                <div className="space-y-2">
                                    <Label>Image Alt Text</Label>
                                    <Input
                                        placeholder="Describe the image"
                                        value={item.image_alt_text}
                                        onChange={(e) => updateSection4SubSection(index, 'image_alt_text', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Section 5 (2 Fixed) */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Section 5 (2 Fixed)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section5.map((item, index) => (
                        <Card key={index}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Item {index + 1}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>
                                        Title <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Enter title"
                                        value={item.title}
                                        onChange={(e) => {
                                            updateSection5(index, 'title', e.target.value)
                                            clearError(`s5_${index}_title`)
                                        }}
                                    />
                                    {errors[`s5_${index}_title`] && <p className="text-sm text-destructive">{errors[`s5_${index}_title`]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Description 1 <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        placeholder="Enter description..."
                                        value={item.description1}
                                        onChange={(e) => {
                                            updateSection5(index, 'description1', e.target.value)
                                            clearError(`s5_${index}_description1`)
                                        }}
                                        rows={3}
                                    />
                                    {errors[`s5_${index}_description1`] && <p className="text-sm text-destructive">{errors[`s5_${index}_description1`]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Description 2 <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        placeholder="Enter description..."
                                        value={item.description2}
                                        onChange={(e) => {
                                            updateSection5(index, 'description2', e.target.value)
                                            clearError(`s5_${index}_description2`)
                                        }}
                                        rows={3}
                                    />
                                    {errors[`s5_${index}_description2`] && <p className="text-sm text-destructive">{errors[`s5_${index}_description2`]}</p>}
                                </div>

                                <MediaPickerInput
                                    label="Image"
                                    value={item.image_url || null}
                                    onChange={(path) => {
                                        updateSection5(index, 'image_url', path || '')
                                        clearError(`s5_${index}_image_url`)
                                    }}
                                    rootPath="cms/about-us/section5"
                                    required
                                    error={errors[`s5_${index}_image_url`]}
                                    accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                                />

                                <MediaPickerInput
                                    label="Mobile View Image"
                                    value={item.mobile_view_image_url || null}
                                    onChange={(path) => {
                                        updateSection5(index, 'mobile_view_image_url', path || '')
                                    }}
                                    rootPath="cms/about-us/section5/mobile"
                                    accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                                />

                                <div className="space-y-2">
                                    <Label>Image Alt Text</Label>
                                    <Input
                                        placeholder="Describe the image"
                                        value={item.image_alt_text}
                                        onChange={(e) => updateSection5(index, 'image_alt_text', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Section 6 */}
            <Card>
                <CardHeader>
                    <CardTitle>Section 6</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="s6_title">
                            Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="s6_title"
                            placeholder="Enter title"
                            value={section6.title}
                            onChange={(e) => {
                                setSection6((prev) => ({ ...prev, title: e.target.value }))
                                clearError('s6_title')
                            }}
                        />
                        {errors.s6_title && <p className="text-sm text-destructive">{errors.s6_title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="s6_description1">
                            Description 1 <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="s6_description1"
                            placeholder="Enter description..."
                            value={section6.description1}
                            onChange={(e) => {
                                setSection6((prev) => ({ ...prev, description1: e.target.value }))
                                clearError('s6_description1')
                            }}
                            rows={3}
                        />
                        {errors.s6_description1 && <p className="text-sm text-destructive">{errors.s6_description1}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="s6_description2">
                            Description 2 <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="s6_description2"
                            placeholder="Enter description..."
                            value={section6.description2}
                            onChange={(e) => {
                                setSection6((prev) => ({ ...prev, description2: e.target.value }))
                                clearError('s6_description2')
                            }}
                            rows={3}
                        />
                        {errors.s6_description2 && <p className="text-sm text-destructive">{errors.s6_description2}</p>}
                    </div>

                    <MediaPickerInput
                        label="Image"
                        value={section6.image_url || null}
                        onChange={(path) => {
                            setSection6((prev) => ({ ...prev, image_url: path || '' }))
                            clearError('s6_image_url')
                        }}
                        rootPath="cms/about-us/section6"
                        required
                        error={errors.s6_image_url}
                        accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                    />

                    <MediaPickerInput
                        label="Mobile View Image"
                        value={section6.mobile_view_image_url || null}
                        onChange={(path) => {
                            setSection6((prev) => ({ ...prev, mobile_view_image_url: path || '' }))
                        }}
                        rootPath="cms/about-us/section6/mobile"
                        accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                    />

                    <div className="space-y-2">
                        <Label htmlFor="s6_image_alt_text">Image Alt Text</Label>
                        <Input
                            id="s6_image_alt_text"
                            placeholder="Describe the image"
                            value={section6.image_alt_text}
                            onChange={(e) => setSection6((prev) => ({ ...prev, image_alt_text: e.target.value }))}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
