'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    cmsService,
    type JewelleryCareGuideContent,
    type JewelleryCareGuideSection2To5Item,
    type JewelleryCareGuideSection6Item,
    type JewelleryCareGuideSection7Item,
    type JewelleryCareGuideSection9Item,
} from '@/components/cms/services/cmsService'
import { MediaPickerInput } from '@/components/media'

const defaultSection2To5Item: JewelleryCareGuideSection2To5Item = {
    image_url: '',
    image_alt_text: '',
    title: '',
    description: [''],
}

const defaultSection6Item: JewelleryCareGuideSection6Item = {
    image_url: '',
    image_alt_text: '',
    title: '',
    description: [''],
    sub_title: '',
}

const defaultSection7Item: JewelleryCareGuideSection7Item = {
    image_url: '',
    image_alt_text: '',
    redirect_url: '',
}

const defaultSection9Item: JewelleryCareGuideSection9Item = {
    image_url: '',
    image_alt_text: '',
    title: '',
    description: [''],
    sub_title: '',
}

const defaultSection8 = {
    title: '',
    description: '',
}

// Fixed number of items per section - 1 item each
const FIXED_ITEMS_COUNT = 1

// Create default items for sections
const createDefaultSection2To5Items = (): JewelleryCareGuideSection2To5Item[] =>
    Array.from({ length: FIXED_ITEMS_COUNT }, () => ({ ...defaultSection2To5Item }))

const createDefaultSection6Items = (): JewelleryCareGuideSection6Item[] =>
    Array.from({ length: FIXED_ITEMS_COUNT }, () => ({ ...defaultSection6Item }))

const createDefaultSection7Items = (): JewelleryCareGuideSection7Item[] =>
    Array.from({ length: FIXED_ITEMS_COUNT }, () => ({ ...defaultSection7Item }))

const createDefaultSection9Items = (): JewelleryCareGuideSection9Item[] =>
    Array.from({ length: FIXED_ITEMS_COUNT }, () => ({ ...defaultSection9Item }))

export default function CMSJewelleryCareGuide() {
    const [section1, setSection1] = useState({ title: '', description: '' })
    const [section2, setSection2] = useState<JewelleryCareGuideSection2To5Item[]>(createDefaultSection2To5Items())
    const [section3, setSection3] = useState<JewelleryCareGuideSection2To5Item[]>(createDefaultSection2To5Items())
    const [section4, setSection4] = useState<JewelleryCareGuideSection2To5Item[]>(createDefaultSection2To5Items())
    const [section5, setSection5] = useState<JewelleryCareGuideSection2To5Item[]>(createDefaultSection2To5Items())
    const [section6, setSection6] = useState<JewelleryCareGuideSection6Item[]>(createDefaultSection6Items())
    const [section7, setSection7] = useState<JewelleryCareGuideSection7Item[]>(createDefaultSection7Items())
    const [section8, setSection8] = useState(defaultSection8)
    const [section9, setSection9] = useState<JewelleryCareGuideSection9Item[]>(createDefaultSection9Items())

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        fetchContent()
    }, [])

    const fetchContent = async () => {
        try {
            setIsLoading(true)
            const response = await cmsService.getJewelleryCareGuide()
            const content = response.data?.content as JewelleryCareGuideContent | undefined
            if (content) {
                if (content.section1) setSection1(content.section1)
                if (content.section2 && content.section2.length > 0) {
                    setSection2(content.section2.map((item) => ({ 
                        ...defaultSection2To5Item, 
                        ...item,
                        description: item.description.length > 0 ? item.description : ['']
                    })))
                }
                if (content.section3 && content.section3.length > 0) {
                    setSection3(content.section3.map((item) => ({ 
                        ...defaultSection2To5Item, 
                        ...item,
                        description: item.description.length > 0 ? item.description : ['']
                    })))
                }
                if (content.section4 && content.section4.length > 0) {
                    setSection4(content.section4.map((item) => ({ 
                        ...defaultSection2To5Item, 
                        ...item,
                        description: item.description.length > 0 ? item.description : ['']
                    })))
                }
                if (content.section5 && content.section5.length > 0) {
                    setSection5(content.section5.map((item) => ({ 
                        ...defaultSection2To5Item, 
                        ...item,
                        description: item.description.length > 0 ? item.description : ['']
                    })))
                }
                if (content.section6 && content.section6.length > 0) {
                    setSection6(content.section6.map((item) => ({ 
                        ...defaultSection6Item, 
                        ...item,
                        description: item.description.length > 0 ? item.description : ['']
                    })))
                }
                if (content.section7 && content.section7.length > 0) {
                    setSection7(content.section7.map((item) => ({ ...defaultSection7Item, ...item })))
                }
                if (content.section8) setSection8(content.section8)
                if (content.section9 && content.section9.length > 0) {
                    setSection9(content.section9.map((item) => ({ 
                        ...defaultSection9Item, 
                        ...item,
                        description: item.description.length > 0 ? item.description : ['']
                    })))
                }
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
        if (!section1.title) newErrors['s1_title'] = 'Title is required'
        if (!section1.description) newErrors['s1_description'] = 'Description is required' as string;

        // Section 2-5 validation
        ([section2, section3, section4, section5] as JewelleryCareGuideSection2To5Item[][]).forEach((section:any, sIdx:number) => {
            if (!section) return
            section.forEach((item:any, i:number) => {
                if (!item.image_url) newErrors[`s${sIdx + 2}_${i}_image_url`] = 'Image is required'
                if (!item.image_alt_text) newErrors[`s${sIdx + 2}_${i}_image_alt_text`] = 'Image alt text is required'
                if (!item.title) newErrors[`s${sIdx + 2}_${i}_title`] = 'Title is required'
                if (!item.description || item.description.length === 0 || !item.description[0]) {
                    newErrors[`s${sIdx + 2}_${i}_description`] = 'At least one description item is required'
                }
            })
        })

        // Section 6 validation
        section6.forEach((item, i) => {
            if (!item.image_url) newErrors[`s6_${i}_image_url`] = 'Image is required'
            if (!item.image_alt_text) newErrors[`s6_${i}_image_alt_text`] = 'Image alt text is required'
            if (!item.title) newErrors[`s6_${i}_title`] = 'Title is required'
            if (!item.sub_title) newErrors[`s6_${i}_sub_title`] = 'Sub title is required'
            if (!item.description || item.description.length === 0 || !item.description[0]) {
                newErrors[`s6_${i}_description`] = 'At least one description item is required'
            }
        })

        // Section 7 validation
        section7.forEach((item, i) => {
            if (!item.image_url) newErrors[`s7_${i}_image_url`] = 'Image is required'
            if (!item.image_alt_text) newErrors[`s7_${i}_image_alt_text`] = 'Image alt text is required'
            if (!item.redirect_url) newErrors[`s7_${i}_redirect_url`] = 'Redirect URL is required'
        })

        // Section 8 validation
        if (!section8.title) newErrors['s8_title'] = 'Title is required'
        if (!section8.description) newErrors['s8_description'] = 'Description is required'

        // Section 9 validation
        section9.forEach((item, i) => {
            if (!item.image_url) newErrors[`s9_${i}_image_url`] = 'Image is required'
            if (!item.image_alt_text) newErrors[`s9_${i}_image_alt_text`] = 'Image alt text is required'
            if (!item.title) newErrors[`s9_${i}_title`] = 'Title is required'
            if (!item.sub_title) newErrors[`s9_${i}_sub_title`] = 'Sub title is required'
            if (!item.description || item.description.length === 0 || !item.description[0]) {
                newErrors[`s9_${i}_description`] = 'At least one description item is required'
            }
        })

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setErrors({})
        setIsSaving(true)

        try {
            console.log("handle save");
            const response = await cmsService.updateJewelleryCareGuide({
                section1,
                section2,
                section3,
                section4,
                section5,
                section6,
                section7,
                section8,
                section9,
            })
            toast.success(response.message)
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            toast.error(error.response?.data?.message || 'Failed to save content')
        } finally {
            setIsSaving(false)
        }
    }

    // Helper functions for sections 2-5
    const updateSection2To5Item = (sectionNum: number, index: number, field: keyof JewelleryCareGuideSection2To5Item, value: string | string[]) => {
        const setters = [setSection2, setSection3, setSection4, setSection5]
        const setter = setters[sectionNum - 2]
        setter((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
        clearError(`s${sectionNum}_${index}_${field}`)
    }

    // Helper functions for section 6
    const updateSection6Item = (index: number, field: keyof JewelleryCareGuideSection6Item, value: string | string[]) => {
        setSection6(section6.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
        clearError(`s6_${index}_${field}`)
    }

    // Helper functions for section 7
    const updateSection7Item = (index: number, field: keyof JewelleryCareGuideSection7Item, value: string) => {
        setSection7(section7.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
        clearError(`s7_${index}_${field}`)
    }

    // Helper functions for section 9
    const updateSection9Item = (index: number, field: keyof JewelleryCareGuideSection9Item, value: string | string[]) => {
        setSection9(section9.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
        clearError(`s9_${index}_${field}`)
    }

    // Add description item for sections 2-6, 9
    const addDescriptionItem = (section: number, index: number) => {
        const addFunctions: Record<number, () => void> = {
            2: () => updateSection2To5Item(2, index, 'description', [...section2[index].description, '']),
            3: () => updateSection2To5Item(3, index, 'description', [...section3[index].description, '']),
            4: () => updateSection2To5Item(4, index, 'description', [...section4[index].description, '']),
            5: () => updateSection2To5Item(5, index, 'description', [...section5[index].description, '']),
            6: () => updateSection6Item(index, 'description', [...section6[index].description, '']),
            9: () => updateSection9Item(index, 'description', [...section9[index].description, '']),
        }
        addFunctions[section]?.()
    }

    const updateDescriptionItem = (section: number, itemIndex: number, descIndex: number, value: string) => {
        const updateFunctions: Record<number, () => void> = {
            2: () => {
                const newDesc = [...section2[itemIndex].description]
                newDesc[descIndex] = value
                updateSection2To5Item(2, itemIndex, 'description', newDesc)
            },
            3: () => {
                const newDesc = [...section3[itemIndex].description]
                newDesc[descIndex] = value
                updateSection2To5Item(3, itemIndex, 'description', newDesc)
            },
            4: () => {
                const newDesc = [...section4[itemIndex].description]
                newDesc[descIndex] = value
                updateSection2To5Item(4, itemIndex, 'description', newDesc)
            },
            5: () => {
                const newDesc = [...section5[itemIndex].description]
                newDesc[descIndex] = value
                updateSection2To5Item(5, itemIndex, 'description', newDesc)
            },
            6: () => {
                const newDesc = [...section6[itemIndex].description]
                newDesc[descIndex] = value
                updateSection6Item(itemIndex, 'description', newDesc)
            },
            9: () => {
                const newDesc = [...section9[itemIndex].description]
                newDesc[descIndex] = value
                updateSection9Item(itemIndex, 'description', newDesc)
            },
        }
        updateFunctions[section]?.()
    }

    const removeDescriptionItem = (section: number, itemIndex: number, descIndex: number) => {
        const removeFunctions: Record<number, () => void> = {
            2: () => {
                const newDesc = section2[itemIndex].description.filter((_, i) => i !== descIndex)
                updateSection2To5Item(2, itemIndex, 'description', newDesc.length > 0 ? newDesc : [''])
            },
            3: () => {
                const newDesc = section3[itemIndex].description.filter((_, i) => i !== descIndex)
                updateSection2To5Item(3, itemIndex, 'description', newDesc.length > 0 ? newDesc : [''])
            },
            4: () => {
                const newDesc = section4[itemIndex].description.filter((_, i) => i !== descIndex)
                updateSection2To5Item(4, itemIndex, 'description', newDesc.length > 0 ? newDesc : [''])
            },
            5: () => {
                const newDesc = section5[itemIndex].description.filter((_, i) => i !== descIndex)
                updateSection2To5Item(5, itemIndex, 'description', newDesc.length > 0 ? newDesc : [''])
            },
            6: () => {
                const newDesc = section6[itemIndex].description.filter((_, i) => i !== descIndex)
                updateSection6Item(itemIndex, 'description', newDesc.length > 0 ? newDesc : [''])
            },
            9: () => {
                const newDesc = section9[itemIndex].description.filter((_, i) => i !== descIndex)
                updateSection9Item(itemIndex, 'description', newDesc.length > 0 ? newDesc : [''])
            },
        }
        removeFunctions[section]?.()
    }

    const clearError = (key: string) => {
        if (errors[key]) {
            setErrors((prev) => {
                const next = { ...prev }
                delete next[key]
                return next
            })
        }
    }

    // Render section 2-5 items (fixed count)
    const renderSection2To5 = (sectionNum: number, items: JewelleryCareGuideSection2To5Item[]) => {
        return (
            <div>
                <h2 className="text-lg font-semibold mb-4">Section {sectionNum}</h2>
                <div className="space-y-4">
                    {items.map((item, index) => (
                        <Card key={index}>
                          
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={item.title}
                                        onChange={(e) => updateSection2To5Item(sectionNum, index, 'title', e.target.value)}
                                        onBlur={() => clearError(`s${sectionNum}_${index}_title`)}
                                    />
                                    {errors[`s${sectionNum}_${index}_title`] && <p className="text-sm text-destructive">{errors[`s${sectionNum}_${index}_title`]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    {item.description.map((desc, descIndex) => (
                                        <div key={descIndex} className="flex gap-2">
                                            <Input
                                                value={desc}
                                                onChange={(e) => updateDescriptionItem(sectionNum, index, descIndex, e.target.value)}
                                                placeholder={`Description point ${descIndex + 1}`}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeDescriptionItem(sectionNum, index, descIndex)}
                                                className="text-destructive"
                                                disabled={item.description.length === 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addDescriptionItem(sectionNum, index)}
                                    >
                                        Add Description Point
                                    </Button>
                                    {errors[`s${sectionNum}_${index}_description`] && <p className="text-sm text-destructive">{errors[`s${sectionNum}_${index}_description`]}</p>}
                                </div>

                                <MediaPickerInput
                                    label="Image"
                                    value={item.image_url || null}
                                    onChange={(path) => updateSection2To5Item(sectionNum, index, 'image_url', path || '')}
                                    rootPath={`cms/jewellery-care-guide/section${sectionNum}`}
                                    required
                                    error={errors[`s${sectionNum}_${index}_image_url`]}
                                    accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                                />

                                <div className="space-y-2">
                                    <Label>Image Alt Text</Label>
                                    <Input
                                        value={item.image_alt_text}
                                        onChange={(e) => updateSection2To5Item(sectionNum, index, 'image_alt_text', e.target.value)}
                                        onBlur={() => clearError(`s${sectionNum}_${index}_image_alt_text`)}
                                    />
                                    {errors[`s${sectionNum}_${index}_image_alt_text`] && <p className="text-sm text-destructive">{errors[`s${sectionNum}_${index}_image_alt_text`]}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
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
                    <h1 className="text-2xl font-semibold">Jewellery Care Guide</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage the jewellery care guide content
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

            {/* Section 1 */}
            <Card>
                <CardHeader>
                    <CardTitle>Section 1 - Title and Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="s1_title">
                            Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="s1_title"
                            value={section1.title}
                            onChange={(e) => {
                                setSection1({ ...section1, title: e.target.value })
                                clearError('s1_title')
                            }}
                        />
                        {errors.s1_title && <p className="text-sm text-destructive">{errors.s1_title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="s1_description">
                            Description <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="s1_description"
                            value={section1.description}
                            onChange={(e) => {
                                setSection1({ ...section1, description: e.target.value })
                                clearError('s1_description')
                            }}
                            rows={4}
                        />
                        {errors.s1_description && <p className="text-sm text-destructive">{errors.s1_description}</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Section 2 */}
            <Card>
               
                <CardContent>
                    {renderSection2To5(2, section2)}
                </CardContent>
            </Card>

            {/* Section 3 */}
            <Card>
               
                <CardContent>
                    {renderSection2To5(3, section3)}
                </CardContent>
            </Card>

            {/* Section 4 */}
            <Card>
              
                <CardContent>
                    {renderSection2To5(4, section4)}
                </CardContent>
            </Card>

            {/* Section 5 */}
            <Card>
               
                <CardContent>
                    {renderSection2To5(5, section5)}
                </CardContent>
            </Card>

            {/* Section 6 */}
            <Card>
                <CardHeader>
                    <CardTitle>Section 6 (with Sub-title)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {section6.map((item, index) => (
                            <Card key={index}>
                               
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input
                                            value={item.title}
                                            onChange={(e) => updateSection6Item(index, 'title', e.target.value)}
                                            onBlur={() => clearError(`s6_${index}_title`)}
                                        />
                                        {errors[`s6_${index}_title`] && <p className="text-sm text-destructive">{errors[`s6_${index}_title`]}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Sub-title</Label>
                                        <Input
                                            value={item.sub_title}
                                            onChange={(e) => updateSection6Item(index, 'sub_title', e.target.value)}
                                            onBlur={() => clearError(`s6_${index}_sub_title`)}
                                        />
                                        {errors[`s6_${index}_sub_title`] && <p className="text-sm text-destructive">{errors[`s6_${index}_sub_title`]}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        {item.description.map((desc, descIndex) => (
                                            <div key={descIndex} className="flex gap-2">
                                                <Input
                                                    value={desc}
                                                    onChange={(e) => updateDescriptionItem(6, index, descIndex, e.target.value)}
                                                    placeholder={`Description point ${descIndex + 1}`}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeDescriptionItem(6, index, descIndex)}
                                                    className="text-destructive"
                                                    disabled={item.description.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addDescriptionItem(6, index)}
                                        >
                                            Add Description Point
                                        </Button>
                                        {errors[`s6_${index}_description`] && <p className="text-sm text-destructive">{errors[`s6_${index}_description`]}</p>}
                                    </div>

                                    <MediaPickerInput
                                        label="Image"
                                        value={item.image_url || null}
                                        onChange={(path) => updateSection6Item(index, 'image_url', path || '')}
                                        rootPath="cms/jewellery-care-guide/section6"
                                        required
                                        error={errors[`s6_${index}_image_url`]}
                                        accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                                    />

                                    <div className="space-y-2">
                                        <Label>Image Alt Text</Label>
                                        <Input
                                            value={item.image_alt_text}
                                            onChange={(e) => updateSection6Item(index, 'image_alt_text', e.target.value)}
                                            onBlur={() => clearError(`s6_${index}_image_alt_text`)}
                                        />
                                        {errors[`s6_${index}_image_alt_text`] && <p className="text-sm text-destructive">{errors[`s6_${index}_image_alt_text`]}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Section 7 */}
            <Card>
                <CardHeader>
                    <CardTitle>Section 7 (with Redirect URL)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {section7.map((item, index) => (
                            <Card key={index}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Item {index + 1}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <MediaPickerInput
                                        label="Image"
                                        value={item.image_url || null}
                                        onChange={(path) => updateSection7Item(index, 'image_url', path || '')}
                                        rootPath="cms/jewellery-care-guide/section7"
                                        required
                                        error={errors[`s7_${index}_image_url`]}
                                        accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                                    />

                                    <div className="space-y-2">
                                        <Label>Image Alt Text</Label>
                                        <Input
                                            value={item.image_alt_text}
                                            onChange={(e) => updateSection7Item(index, 'image_alt_text', e.target.value)}
                                            onBlur={() => clearError(`s7_${index}_image_alt_text`)}
                                        />
                                        {errors[`s7_${index}_image_alt_text`] && <p className="text-sm text-destructive">{errors[`s7_${index}_image_alt_text`]}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Redirect URL</Label>
                                        <Input
                                            value={item.redirect_url}
                                            onChange={(e) => updateSection7Item(index, 'redirect_url', e.target.value)}
                                            onBlur={() => clearError(`s7_${index}_redirect_url`)}
                                        />
                                        {errors[`s7_${index}_redirect_url`] && <p className="text-sm text-destructive">{errors[`s7_${index}_redirect_url`]}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Section 8 */}
            <Card>
                <CardHeader>
                    <CardTitle>Section 8 - Title and Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="s8_title">
                            Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="s8_title"
                            value={section8.title}
                            onChange={(e) => {
                                setSection8({ ...section8, title: e.target.value })
                                clearError('s8_title')
                            }}
                        />
                        {errors.s8_title && <p className="text-sm text-destructive">{errors.s8_title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="s8_description">
                            Description <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="s8_description"
                            value={section8.description}
                            onChange={(e) => {
                                setSection8({ ...section8, description: e.target.value })
                                clearError('s8_description')
                            }}
                            rows={4}
                        />
                        {errors.s8_description && <p className="text-sm text-destructive">{errors.s8_description}</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Section 9 */}
            <Card>
                <CardHeader>
                    <CardTitle>Section 9 (with Sub-title)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {section9.map((item, index) => (
                            <Card key={index}>
                               
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input
                                            value={item.title}
                                            onChange={(e) => updateSection9Item(index, 'title', e.target.value)}
                                            onBlur={() => clearError(`s9_${index}_title`)}
                                        />
                                        {errors[`s9_${index}_title`] && <p className="text-sm text-destructive">{errors[`s9_${index}_title`]}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Sub-title</Label>
                                        <Input
                                            value={item.sub_title}
                                            onChange={(e) => updateSection9Item(index, 'sub_title', e.target.value)}
                                            onBlur={() => clearError(`s9_${index}_sub_title`)}
                                        />
                                        {errors[`s9_${index}_sub_title`] && <p className="text-sm text-destructive">{errors[`s9_${index}_sub_title`]}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        {item.description.map((desc, descIndex) => (
                                            <div key={descIndex} className="flex gap-2">
                                                <Input
                                                    value={desc}
                                                    onChange={(e) => updateDescriptionItem(9, index, descIndex, e.target.value)}
                                                    placeholder={`Description point ${descIndex + 1}`}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeDescriptionItem(9, index, descIndex)}
                                                    className="text-destructive"
                                                    disabled={item.description.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addDescriptionItem(9, index)}
                                        >
                                            Add Description Point
                                        </Button>
                                        {errors[`s9_${index}_description`] && <p className="text-sm text-destructive">{errors[`s9_${index}_description`]}</p>}
                                    </div>

                                    <MediaPickerInput
                                        label="Image"
                                        value={item.image_url || null}
                                        onChange={(path) => updateSection9Item(index, 'image_url', path || '')}
                                        rootPath="cms/jewellery-care-guide/section9"
                                        required
                                        error={errors[`s9_${index}_image_url`]}
                                        accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
                                    />

                                    <div className="space-y-2">
                                        <Label>Image Alt Text</Label>
                                        <Input
                                            value={item.image_alt_text}
                                            onChange={(e) => updateSection9Item(index, 'image_alt_text', e.target.value)}
                                            onBlur={() => clearError(`s9_${index}_image_alt_text`)}
                                        />
                                        {errors[`s9_${index}_image_alt_text`] && <p className="text-sm text-destructive">{errors[`s9_${index}_image_alt_text`]}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
