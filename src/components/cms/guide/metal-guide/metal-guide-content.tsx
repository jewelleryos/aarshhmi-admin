'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, Plus, Pencil, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  cmsService,
  type MetalGuideContent as MetalGuideContentType,
  type MetalGuideSection1Item,
  type MetalGuideSection2Item,
  type MetalGuideSubSectionItem,
} from '@/components/cms/services/cmsService'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { getCdnUrl } from '@/utils/cdn'
import { Section1Drawer } from './section1-drawer'
import { Section2Drawer } from './section2-drawer'
import { SubSectionDrawer } from './subsection-drawer'

export function MetalGuideContent() {
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [section1, setSection1] = useState<MetalGuideSection1Item[]>([])
  const [section2, setSection2] = useState<MetalGuideSection2Item[]>([])

  const [section3Title, setSection3Title] = useState('')
  const [section3SubSections, setSection3SubSections] = useState<MetalGuideSubSectionItem[]>([])

  const [section4Title, setSection4Title] = useState('')
  const [section4SubSections, setSection4SubSections] = useState<MetalGuideSubSectionItem[]>([])

  const [section5Title, setSection5Title] = useState('')
  const [section5Description, setSection5Description] = useState<string[]>([''])
  const [section5Content, setSection5Content] = useState('')

  const [section6Title, setSection6Title] = useState('')
  const [section6Description, setSection6Description] = useState<string[]>([''])

  const [section7Title, setSection7Title] = useState('')
  const [section7Content, setSection7Content] = useState('')

  const [section8Title, setSection8Title] = useState('')
  const [section8Description, setSection8Description] = useState<string[]>([''])

  // Section 1 drawer states
  const [isSection1AddOpen, setIsSection1AddOpen] = useState(false)
  const [isSection1EditOpen, setIsSection1EditOpen] = useState(false)
  const [selectedSection1Item, setSelectedSection1Item] = useState<MetalGuideSection1Item | null>(null)

  // Section 2 drawer states
  const [isSection2AddOpen, setIsSection2AddOpen] = useState(false)
  const [isSection2EditOpen, setIsSection2EditOpen] = useState(false)
  const [selectedSection2Item, setSelectedSection2Item] = useState<MetalGuideSection2Item | null>(null)

  // Section 3 drawer states
  const [isSection3AddOpen, setIsSection3AddOpen] = useState(false)
  const [isSection3EditOpen, setIsSection3EditOpen] = useState(false)
  const [selectedSection3Item, setSelectedSection3Item] = useState<MetalGuideSubSectionItem | null>(null)

  // Section 4 drawer states
  const [isSection4AddOpen, setIsSection4AddOpen] = useState(false)
  const [isSection4EditOpen, setIsSection4EditOpen] = useState(false)
  const [selectedSection4Item, setSelectedSection4Item] = useState<MetalGuideSubSectionItem | null>(null)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getMetalGuide()
      const content = response.data?.content as MetalGuideContentType | undefined
      if (content) {
        setTitle(content.title || '')
        setSection1(content.section1 || [])
        setSection2(content.section2 || [])
        setSection3Title(content.section3?.title || '')
        setSection3SubSections(content.section3?.sub_sections || [])
        setSection4Title(content.section4?.title || '')
        setSection4SubSections(content.section4?.sub_sections || [])
        setSection5Title(content.section5?.title || '')
        setSection5Description(
          content.section5?.description && content.section5.description.length > 0
            ? content.section5.description
            : ['']
        )
        setSection5Content(content.section5?.content || '')
        setSection6Title(content.section6?.title || '')
        setSection6Description(
          content.section6?.description && content.section6.description.length > 0
            ? content.section6.description
            : ['']
        )
        setSection7Title(content.section7?.title || '')
        setSection7Content(content.section7?.content || '')
        setSection8Title(content.section8?.title || '')
        setSection8Description(
          content.section8?.description && content.section8.description.length > 0
            ? content.section8.description
            : ['']
        )
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch metal guide content')
    } finally {
      setIsLoading(false)
    }
  }

  const saveContent = async (
    s1: MetalGuideSection1Item[],
    s2: MetalGuideSection2Item[],
    s3title: string,
    s3subs: MetalGuideSubSectionItem[],
    s4title: string,
    s4subs: MetalGuideSubSectionItem[],
    s5title: string,
    s5desc: string[],
    s5content: string,
    s6title: string,
    s6desc: string[],
    s7title: string,
    s7content: string,
    s8title: string,
    s8desc: string[]
  ) => {
    const response = await cmsService.updateMetalGuide({
      title,
      section1: s1,
      section2: s2,
      section3: { title: s3title, sub_sections: s3subs },
      section4: { title: s4title, sub_sections: s4subs },
      section5: { title: s5title, description: s5desc, content: s5content },
      section6: { title: s6title, description: s6desc },
      section7: { title: s7title, content: s7content },
      section8: { title: s8title, description: s8desc },
    })
    return response
  }

  const handleSaveDetails = async () => {
    setIsSaving(true)
    try {
      const response = await saveContent(
        section1,
        section2,
        section3Title,
        section3SubSections,
        section4Title,
        section4SubSections,
        section5Title,
        section5Description.filter((l) => l.trim() !== ''),
        section5Content,
        section6Title,
        section6Description.filter((l) => l.trim() !== ''),
        section7Title,
        section7Content,
        section8Title,
        section8Description.filter((l) => l.trim() !== '')
      )
      toast.success(response.message)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to save content')
    } finally {
      setIsSaving(false)
    }
  }

  // Section 1 CRUD
  const handleAddSection1Item = async (item: Omit<MetalGuideSection1Item, 'id'>) => {
    const newItem: MetalGuideSection1Item = { ...item, id: `s1_${Date.now()}` }
    const updatedSection1 = [...section1, newItem]
    const response = await saveContent(
      updatedSection1, section2,
      section3Title, section3SubSections,
      section4Title, section4SubSections,
      section5Title, section5Description.filter((l) => l.trim() !== ''), section5Content,
      section6Title, section6Description.filter((l) => l.trim() !== ''),
      section7Title, section7Content,
      section8Title, section8Description.filter((l) => l.trim() !== '')
    )
    toast.success(response.message)
    setSection1(updatedSection1)
    setIsSection1AddOpen(false)
  }

  const handleEditSection1Item = async (item: MetalGuideSection1Item) => {
    const updatedSection1 = section1.map((s) => (s.id === item.id ? item : s))
    const response = await saveContent(
      updatedSection1, section2,
      section3Title, section3SubSections,
      section4Title, section4SubSections,
      section5Title, section5Description.filter((l) => l.trim() !== ''), section5Content,
      section6Title, section6Description.filter((l) => l.trim() !== ''),
      section7Title, section7Content,
      section8Title, section8Description.filter((l) => l.trim() !== '')
    )
    toast.success(response.message)
    setSection1(updatedSection1)
    setIsSection1EditOpen(false)
    setSelectedSection1Item(null)
  }

  const handleDeleteSection1Item = async (id: string) => {
    const updatedSection1 = section1.filter((s) => s.id !== id)
    try {
      const response = await saveContent(
        updatedSection1, section2,
        section3Title, section3SubSections,
        section4Title, section4SubSections,
        section5Title, section5Description.filter((l) => l.trim() !== ''), section5Content,
        section6Title, section6Description.filter((l) => l.trim() !== ''),
        section7Title, section7Content,
        section8Title, section8Description.filter((l) => l.trim() !== '')
      )
      toast.success(response.message)
      setSection1(updatedSection1)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete item')
    }
  }

  const openSection1Edit = (item: MetalGuideSection1Item) => {
    setSelectedSection1Item(item)
    setIsSection1EditOpen(true)
  }

  // Section 2 CRUD
  const handleAddSection2Item = async (item: Omit<MetalGuideSection2Item, 'id'>) => {
    const newItem: MetalGuideSection2Item = { ...item, id: `s2_${Date.now()}` }
    const updatedSection2 = [...section2, newItem]
    const response = await saveContent(
      section1, updatedSection2,
      section3Title, section3SubSections,
      section4Title, section4SubSections,
      section5Title, section5Description.filter((l) => l.trim() !== ''), section5Content,
      section6Title, section6Description.filter((l) => l.trim() !== ''),
      section7Title, section7Content,
      section8Title, section8Description.filter((l) => l.trim() !== '')
    )
    toast.success(response.message)
    setSection2(updatedSection2)
    setIsSection2AddOpen(false)
  }

  const handleEditSection2Item = async (item: MetalGuideSection2Item) => {
    const updatedSection2 = section2.map((s) => (s.id === item.id ? item : s))
    const response = await saveContent(
      section1, updatedSection2,
      section3Title, section3SubSections,
      section4Title, section4SubSections,
      section5Title, section5Description.filter((l) => l.trim() !== ''), section5Content,
      section6Title, section6Description.filter((l) => l.trim() !== ''),
      section7Title, section7Content,
      section8Title, section8Description.filter((l) => l.trim() !== '')
    )
    toast.success(response.message)
    setSection2(updatedSection2)
    setIsSection2EditOpen(false)
    setSelectedSection2Item(null)
  }

  const handleDeleteSection2Item = async (id: string) => {
    const updatedSection2 = section2.filter((s) => s.id !== id)
    try {
      const response = await saveContent(
        section1, updatedSection2,
        section3Title, section3SubSections,
        section4Title, section4SubSections,
        section5Title, section5Description.filter((l) => l.trim() !== ''), section5Content,
        section6Title, section6Description.filter((l) => l.trim() !== ''),
        section7Title, section7Content,
        section8Title, section8Description.filter((l) => l.trim() !== '')
      )
      toast.success(response.message)
      setSection2(updatedSection2)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete item')
    }
  }

  const openSection2Edit = (item: MetalGuideSection2Item) => {
    setSelectedSection2Item(item)
    setIsSection2EditOpen(true)
  }

  // Section 3 CRUD
  const handleAddSection3SubSection = async (item: Omit<MetalGuideSubSectionItem, 'id'>) => {
    const newItem: MetalGuideSubSectionItem = { ...item, id: `s3sub_${Date.now()}` }
    const updatedSubs = [...section3SubSections, newItem]
    const response = await saveContent(
      section1, section2,
      section3Title, updatedSubs,
      section4Title, section4SubSections,
      section5Title, section5Description.filter((l) => l.trim() !== ''), section5Content,
      section6Title, section6Description.filter((l) => l.trim() !== ''),
      section7Title, section7Content,
      section8Title, section8Description.filter((l) => l.trim() !== '')
    )
    toast.success(response.message)
    setSection3SubSections(updatedSubs)
    setIsSection3AddOpen(false)
  }

  const handleEditSection3SubSection = async (item: MetalGuideSubSectionItem) => {
    const updatedSubs = section3SubSections.map((s) => (s.id === item.id ? item : s))
    const response = await saveContent(
      section1, section2,
      section3Title, updatedSubs,
      section4Title, section4SubSections,
      section5Title, section5Description.filter((l) => l.trim() !== ''), section5Content,
      section6Title, section6Description.filter((l) => l.trim() !== ''),
      section7Title, section7Content,
      section8Title, section8Description.filter((l) => l.trim() !== '')
    )
    toast.success(response.message)
    setSection3SubSections(updatedSubs)
    setIsSection3EditOpen(false)
    setSelectedSection3Item(null)
  }

  const handleDeleteSection3SubSection = async (id: string) => {
    const updatedSubs = section3SubSections.filter((s) => s.id !== id)
    try {
      const response = await saveContent(
        section1, section2,
        section3Title, updatedSubs,
        section4Title, section4SubSections,
        section5Title, section5Description.filter((l) => l.trim() !== ''), section5Content,
        section6Title, section6Description.filter((l) => l.trim() !== ''),
        section7Title, section7Content,
        section8Title, section8Description.filter((l) => l.trim() !== '')
      )
      toast.success(response.message)
      setSection3SubSections(updatedSubs)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete sub-section')
    }
  }

  const openSection3Edit = (item: MetalGuideSubSectionItem) => {
    setSelectedSection3Item(item)
    setIsSection3EditOpen(true)
  }

  // Section 4 CRUD
  const handleAddSection4SubSection = async (item: Omit<MetalGuideSubSectionItem, 'id'>) => {
    const newItem: MetalGuideSubSectionItem = { ...item, id: `s4sub_${Date.now()}` }
    const updatedSubs = [...section4SubSections, newItem]
    const response = await saveContent(
      section1, section2,
      section3Title, section3SubSections,
      section4Title, updatedSubs,
      section5Title, section5Description.filter((l) => l.trim() !== ''), section5Content,
      section6Title, section6Description.filter((l) => l.trim() !== ''),
      section7Title, section7Content,
      section8Title, section8Description.filter((l) => l.trim() !== '')
    )
    toast.success(response.message)
    setSection4SubSections(updatedSubs)
    setIsSection4AddOpen(false)
  }

  const handleEditSection4SubSection = async (item: MetalGuideSubSectionItem) => {
    const updatedSubs = section4SubSections.map((s) => (s.id === item.id ? item : s))
    const response = await saveContent(
      section1, section2,
      section3Title, section3SubSections,
      section4Title, updatedSubs,
      section5Title, section5Description.filter((l) => l.trim() !== ''), section5Content,
      section6Title, section6Description.filter((l) => l.trim() !== ''),
      section7Title, section7Content,
      section8Title, section8Description.filter((l) => l.trim() !== '')
    )
    toast.success(response.message)
    setSection4SubSections(updatedSubs)
    setIsSection4EditOpen(false)
    setSelectedSection4Item(null)
  }

  const handleDeleteSection4SubSection = async (id: string) => {
    const updatedSubs = section4SubSections.filter((s) => s.id !== id)
    try {
      const response = await saveContent(
        section1, section2,
        section3Title, section3SubSections,
        section4Title, updatedSubs,
        section5Title, section5Description.filter((l) => l.trim() !== ''), section5Content,
        section6Title, section6Description.filter((l) => l.trim() !== ''),
        section7Title, section7Content,
        section8Title, section8Description.filter((l) => l.trim() !== '')
      )
      toast.success(response.message)
      setSection4SubSections(updatedSubs)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete sub-section')
    }
  }

  const openSection4Edit = (item: MetalGuideSubSectionItem) => {
    setSelectedSection4Item(item)
    setIsSection4EditOpen(true)
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
          <h1 className="text-2xl font-semibold">Metal Guide</h1>
          <p className="text-sm text-muted-foreground">
            Manage the metal guide content
          </p>
        </div>
        <Button onClick={handleSaveDetails} disabled={isSaving}>
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

      {/* Card 1 - Title */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Page Title</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mg_title">Title</Label>
            <Input
              id="mg_title"
              placeholder="Enter page title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 2 - Section 1: Image Gallery */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Section 1 — Image Gallery</CardTitle>
            <Button size="sm" onClick={() => setIsSection1AddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {section1.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No items yet. Click &quot;Add Item&quot; to create one.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {section1.map((item) => (
                <div
                  key={item.id}
                  className="relative group rounded-lg border overflow-hidden"
                >
                  <img
                    src={getCdnUrl(item.image_url)}
                    alt={item.image_alt_text || 'Section 1 image'}
                    className="h-24 w-full object-cover"
                  />
                  <div className="p-2 text-xs">
                    <span>Rank: {item.rank}</span>
                  </div>
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-6 w-6"
                      onClick={() => openSection1Edit(item)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-6 w-6"
                      onClick={() => handleDeleteSection1Item(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 3 - Section 2: Text Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Section 2 — Text Items</CardTitle>
            <Button size="sm" onClick={() => setIsSection2AddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {section2.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No items yet. Click &quot;Add Item&quot; to create one.
            </p>
          ) : (
            <div className="space-y-2">
              {section2.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description.slice(0, 2).join(', ')}
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-2 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => openSection2Edit(item)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteSection2Item(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 4 - Section 3: Sub-sections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Section 3</CardTitle>
            <Button size="sm" onClick={() => setIsSection3AddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Sub-section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="s3_title">Section 3 Title</Label>
            <Input
              id="s3_title"
              placeholder="Enter section 3 title"
              value={section3Title}
              onChange={(e) => setSection3Title(e.target.value)}
            />
            <p className="text-xs text-muted-foreground italic">
              Section 3 title is saved by the global &quot;Save Changes&quot; button above.
            </p>
          </div>
          {section3SubSections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sub-sections yet. Click &quot;Add Sub-section&quot; to create one.
            </p>
          ) : (
            <div className="space-y-2">
              {section3SubSections.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between rounded-md border px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{sub.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {sub.description.slice(0, 2).join(', ')}
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-2 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => openSection3Edit(sub)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteSection3SubSection(sub.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 5 - Section 4: Sub-sections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Section 4</CardTitle>
            <Button size="sm" onClick={() => setIsSection4AddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Sub-section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="s4_title">Section 4 Title</Label>
            <Input
              id="s4_title"
              placeholder="Enter section 4 title"
              value={section4Title}
              onChange={(e) => setSection4Title(e.target.value)}
            />
            <p className="text-xs text-muted-foreground italic">
              Section 4 title is saved by the global &quot;Save Changes&quot; button above.
            </p>
          </div>
          {section4SubSections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sub-sections yet. Click &quot;Add Sub-section&quot; to create one.
            </p>
          ) : (
            <div className="space-y-2">
              {section4SubSections.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between rounded-md border px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{sub.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {sub.description.slice(0, 2).join(', ')}
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-2 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => openSection4Edit(sub)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteSection4SubSection(sub.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 6 - Section 5: Title + Description + TipTap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Section 5</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="s5_title">Section 5 Title</Label>
            <Input
              id="s5_title"
              placeholder="Enter section 5 title"
              value={section5Title}
              onChange={(e) => setSection5Title(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Description Lines</Label>
            <div className="space-y-2">
              {section5Description.map((line, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Line ${index + 1}`}
                    value={line}
                    onChange={(e) =>
                      setSection5Description((prev) =>
                        prev.map((l, i) => (i === index ? e.target.value : l))
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                    onClick={() =>
                      setSection5Description((prev) => prev.filter((_, i) => i !== index))
                    }
                    disabled={section5Description.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSection5Description((prev) => [...prev, ''])}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Line
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor
              value={section5Content}
              onChange={setSection5Content}
              placeholder="Write the section 5 content here..."
              mediaRootPath="cms/guide/metal-guide/section5"
            />
          </div>

          <p className="text-xs text-muted-foreground italic">
            Section 5 is saved by the global &quot;Save Changes&quot; button above.
          </p>
        </CardContent>
      </Card>

      {/* Card 7 - Section 6: Title + Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Section 6</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="s6_title">Section 6 Title</Label>
            <Input
              id="s6_title"
              placeholder="Enter section 6 title"
              value={section6Title}
              onChange={(e) => setSection6Title(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Description Lines</Label>
            <div className="space-y-2">
              {section6Description.map((line, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Line ${index + 1}`}
                    value={line}
                    onChange={(e) =>
                      setSection6Description((prev) =>
                        prev.map((l, i) => (i === index ? e.target.value : l))
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                    onClick={() =>
                      setSection6Description((prev) => prev.filter((_, i) => i !== index))
                    }
                    disabled={section6Description.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSection6Description((prev) => [...prev, ''])}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Line
            </Button>
          </div>

          <p className="text-xs text-muted-foreground italic">
            Section 6 is saved by the global &quot;Save Changes&quot; button above.
          </p>
        </CardContent>
      </Card>

      {/* Card 8 - Section 7: Title + TipTap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Section 7</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="s7_title">Section 7 Title</Label>
            <Input
              id="s7_title"
              placeholder="Enter section 7 title"
              value={section7Title}
              onChange={(e) => setSection7Title(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor
              value={section7Content}
              onChange={setSection7Content}
              placeholder="Write the section 7 content here..."
              mediaRootPath="cms/guide/metal-guide/section7"
            />
          </div>

          <p className="text-xs text-muted-foreground italic">
            Section 7 is saved by the global &quot;Save Changes&quot; button above.
          </p>
        </CardContent>
      </Card>

      {/* Card 9 - Section 8: Title + Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Section 8</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="s8_title">Section 8 Title</Label>
            <Input
              id="s8_title"
              placeholder="Enter section 8 title"
              value={section8Title}
              onChange={(e) => setSection8Title(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Description Lines</Label>
            <div className="space-y-2">
              {section8Description.map((line, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Line ${index + 1}`}
                    value={line}
                    onChange={(e) =>
                      setSection8Description((prev) =>
                        prev.map((l, i) => (i === index ? e.target.value : l))
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                    onClick={() =>
                      setSection8Description((prev) => prev.filter((_, i) => i !== index))
                    }
                    disabled={section8Description.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSection8Description((prev) => [...prev, ''])}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Line
            </Button>
          </div>

          <p className="text-xs text-muted-foreground italic">
            Section 8 is saved by the global &quot;Save Changes&quot; button above.
          </p>
        </CardContent>
      </Card>

      {/* Section 1 Drawers */}
      <Section1Drawer
        open={isSection1AddOpen}
        onOpenChange={setIsSection1AddOpen}
        item={null}
        onSave={async (item) => {
          await handleAddSection1Item(item as Omit<MetalGuideSection1Item, 'id'>)
        }}
      />
      <Section1Drawer
        open={isSection1EditOpen}
        onOpenChange={(open) => {
          setIsSection1EditOpen(open)
          if (!open) setSelectedSection1Item(null)
        }}
        item={selectedSection1Item}
        onSave={async (item) => {
          await handleEditSection1Item(item as MetalGuideSection1Item)
        }}
      />

      {/* Section 2 Drawers */}
      <Section2Drawer
        open={isSection2AddOpen}
        onOpenChange={setIsSection2AddOpen}
        item={null}
        onSave={async (item) => {
          await handleAddSection2Item(item as Omit<MetalGuideSection2Item, 'id'>)
        }}
      />
      <Section2Drawer
        open={isSection2EditOpen}
        onOpenChange={(open) => {
          setIsSection2EditOpen(open)
          if (!open) setSelectedSection2Item(null)
        }}
        item={selectedSection2Item}
        onSave={async (item) => {
          await handleEditSection2Item(item as MetalGuideSection2Item)
        }}
      />

      {/* Section 3 Drawers */}
      <SubSectionDrawer
        open={isSection3AddOpen}
        onOpenChange={setIsSection3AddOpen}
        item={null}
        sectionLabel="section 3"
        onSave={async (item) => {
          await handleAddSection3SubSection(item as Omit<MetalGuideSubSectionItem, 'id'>)
        }}
      />
      <SubSectionDrawer
        open={isSection3EditOpen}
        onOpenChange={(open) => {
          setIsSection3EditOpen(open)
          if (!open) setSelectedSection3Item(null)
        }}
        item={selectedSection3Item}
        sectionLabel="section 3"
        onSave={async (item) => {
          await handleEditSection3SubSection(item as MetalGuideSubSectionItem)
        }}
      />

      {/* Section 4 Drawers */}
      <SubSectionDrawer
        open={isSection4AddOpen}
        onOpenChange={setIsSection4AddOpen}
        item={null}
        sectionLabel="section 4"
        onSave={async (item) => {
          await handleAddSection4SubSection(item as Omit<MetalGuideSubSectionItem, 'id'>)
        }}
      />
      <SubSectionDrawer
        open={isSection4EditOpen}
        onOpenChange={(open) => {
          setIsSection4EditOpen(open)
          if (!open) setSelectedSection4Item(null)
        }}
        item={selectedSection4Item}
        sectionLabel="section 4"
        onSave={async (item) => {
          await handleEditSection4SubSection(item as MetalGuideSubSectionItem)
        }}
      />
    </div>
  )
}
