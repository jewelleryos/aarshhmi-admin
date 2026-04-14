'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  cmsService,
  type DiamondEducationContent as DiamondEducationContentType,
  type DiamondEducationSection1Item,
  type DiamondEducationSection2Item,
  type DiamondEducationSection3Item,
  type DiamondEducationSection4,
  type DiamondEducationSection6SubSection,
} from '@/components/cms/services/cmsService'
import { MediaPickerInput } from '@/components/media'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { getCdnUrl } from '@/utils/cdn'
import { Section1Drawer } from './section1-drawer'
import { Section2Drawer } from './section2-drawer'
import { Section5SubSectionDrawer } from './section5-subsection-drawer'

export function DiamondEducationContent() {
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [section1, setSection1] = useState<DiamondEducationSection1Item[]>([])
  const [section2, setSection2] = useState<DiamondEducationSection2Item[]>([])
  const [section3, setSection3] = useState<DiamondEducationSection3Item[]>([])
  const [section4, setSection4] = useState<DiamondEducationSection4>({
    image_url: '',
    mobile_image_url: '',
    image_alt_text: '',
  })
  const [section5Title, setSection5Title] = useState('')
  const [section5Content, setSection5Content] = useState('')
  const [section6Title, setSection6Title] = useState('')
  const [section6SubSections, setSection6SubSections] = useState<DiamondEducationSection6SubSection[]>([])

  // Section 1 drawer states
  const [isSection1AddOpen, setIsSection1AddOpen] = useState(false)
  const [isSection1EditOpen, setIsSection1EditOpen] = useState(false)
  const [selectedSection1Item, setSelectedSection1Item] = useState<DiamondEducationSection1Item | null>(null)

  // Section 2 drawer states
  const [isSection2AddOpen, setIsSection2AddOpen] = useState(false)
  const [isSection2EditOpen, setIsSection2EditOpen] = useState(false)
  const [selectedSection2Item, setSelectedSection2Item] = useState<DiamondEducationSection2Item | null>(null)

  // Section 3 drawer states
  const [isSection3AddOpen, setIsSection3AddOpen] = useState(false)
  const [isSection3EditOpen, setIsSection3EditOpen] = useState(false)
  const [selectedSection3Item, setSelectedSection3Item] = useState<DiamondEducationSection3Item | null>(null)

  // Section 6 drawer states
  const [isSection6AddOpen, setIsSection6AddOpen] = useState(false)
  const [isSection6EditOpen, setIsSection6EditOpen] = useState(false)
  const [selectedSection6Item, setSelectedSection6Item] = useState<DiamondEducationSection6SubSection | null>(null)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      const response = await cmsService.getDiamondEducation()
      const content = response.data?.content as DiamondEducationContentType | undefined
      if (content) {
        setTitle(content.title || '')
        setSection1(content.section1 || [])
        setSection2(content.section2 || [])
        setSection3(content.section3 || [])
        setSection4(
          content.section4 || {
            image_url: '',
            mobile_image_url: '',
            image_alt_text: '',
          }
        )
        setSection5Title(content.section5?.title || '')
        setSection5Content(content.section5?.content || '')
        setSection6Title(content.section6?.title || '')
        setSection6SubSections(content.section6?.sub_sections || [])
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch diamond education content')
    } finally {
      setIsLoading(false)
    }
  }

  const saveContent = async (
    s1: DiamondEducationSection1Item[],
    s2: DiamondEducationSection2Item[],
    s3: DiamondEducationSection3Item[],
    s4: DiamondEducationSection4,
    s5title: string,
    s5content: string,
    s6title: string,
    s6subs: DiamondEducationSection6SubSection[]
  ) => {
    const response = await cmsService.updateDiamondEducation({
      title,
      section1: s1,
      section2: s2,
      section3: s3,
      section4: s4,
      section5: { title: s5title, content: s5content },
      section6: { title: s6title, sub_sections: s6subs },
    })
    return response
  }

  const handleSaveDetails = async () => {
    setIsSaving(true)
    try {
      const response = await saveContent(
        section1,
        section2,
        section3,
        section4,
        section5Title,
        section5Content,
        section6Title,
        section6SubSections
      )
      toast.success(response.message)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to save content')
    } finally {
      setIsSaving(false)
    }
  }

  // ── Section 1 CRUD ──────────────────────────────────────────────────────────
  const handleAddSection1Item = async (item: Omit<DiamondEducationSection1Item, 'id'>) => {
    const newItem: DiamondEducationSection1Item = { ...item, id: `s1_${Date.now()}` }
    const updated = [...section1, newItem]
    const response = await saveContent(updated, section2, section3, section4, section5Title, section5Content, section6Title, section6SubSections)
    toast.success(response.message)
    setSection1(updated)
    setIsSection1AddOpen(false)
  }

  const handleEditSection1Item = async (item: DiamondEducationSection1Item) => {
    const updated = section1.map((s) => (s.id === item.id ? item : s))
    const response = await saveContent(updated, section2, section3, section4, section5Title, section5Content, section6Title, section6SubSections)
    toast.success(response.message)
    setSection1(updated)
    setIsSection1EditOpen(false)
    setSelectedSection1Item(null)
  }

  const handleDeleteSection1Item = async (id: string) => {
    const updated = section1.filter((s) => s.id !== id)
    try {
      const response = await saveContent(updated, section2, section3, section4, section5Title, section5Content, section6Title, section6SubSections)
      toast.success(response.message)
      setSection1(updated)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete item')
    }
  }

  // ── Section 2 CRUD ──────────────────────────────────────────────────────────
  const handleAddSection2Item = async (item: Omit<DiamondEducationSection2Item, 'id'>) => {
    const newItem: DiamondEducationSection2Item = { ...item, id: `s2_${Date.now()}` }
    const updated = [...section2, newItem]
    const response = await saveContent(section1, updated, section3, section4, section5Title, section5Content, section6Title, section6SubSections)
    toast.success(response.message)
    setSection2(updated)
    setIsSection2AddOpen(false)
  }

  const handleEditSection2Item = async (item: DiamondEducationSection2Item) => {
    const updated = section2.map((s) => (s.id === item.id ? item : s))
    const response = await saveContent(section1, updated, section3, section4, section5Title, section5Content, section6Title, section6SubSections)
    toast.success(response.message)
    setSection2(updated)
    setIsSection2EditOpen(false)
    setSelectedSection2Item(null)
  }

  const handleDeleteSection2Item = async (id: string) => {
    const updated = section2.filter((s) => s.id !== id)
    try {
      const response = await saveContent(section1, updated, section3, section4, section5Title, section5Content, section6Title, section6SubSections)
      toast.success(response.message)
      setSection2(updated)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete item')
    }
  }

  // ── Section 3 CRUD ──────────────────────────────────────────────────────────
  const handleAddSection3Item = async (item: Omit<DiamondEducationSection3Item, 'id'>) => {
    const newItem: DiamondEducationSection3Item = { ...item, id: `s3_${Date.now()}` }
    const updated = [...section3, newItem]
    const response = await saveContent(section1, section2, updated, section4, section5Title, section5Content, section6Title, section6SubSections)
    toast.success(response.message)
    setSection3(updated)
    setIsSection3AddOpen(false)
  }

  const handleEditSection3Item = async (item: DiamondEducationSection3Item) => {
    const updated = section3.map((s) => (s.id === item.id ? item : s))
    const response = await saveContent(section1, section2, updated, section4, section5Title, section5Content, section6Title, section6SubSections)
    toast.success(response.message)
    setSection3(updated)
    setIsSection3EditOpen(false)
    setSelectedSection3Item(null)
  }

  const handleDeleteSection3Item = async (id: string) => {
    const updated = section3.filter((s) => s.id !== id)
    try {
      const response = await saveContent(section1, section2, updated, section4, section5Title, section5Content, section6Title, section6SubSections)
      toast.success(response.message)
      setSection3(updated)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete item')
    }
  }

  // ── Section 6 CRUD ──────────────────────────────────────────────────────────
  const handleAddSection6SubSection = async (item: Omit<DiamondEducationSection6SubSection, 'id'>) => {
    const newItem: DiamondEducationSection6SubSection = { ...item, id: `s6sub_${Date.now()}` }
    const updated = [...section6SubSections, newItem]
    const response = await saveContent(section1, section2, section3, section4, section5Title, section5Content, section6Title, updated)
    toast.success(response.message)
    setSection6SubSections(updated)
    setIsSection6AddOpen(false)
  }

  const handleEditSection6SubSection = async (item: DiamondEducationSection6SubSection) => {
    const updated = section6SubSections.map((s) => (s.id === item.id ? item : s))
    const response = await saveContent(section1, section2, section3, section4, section5Title, section5Content, section6Title, updated)
    toast.success(response.message)
    setSection6SubSections(updated)
    setIsSection6EditOpen(false)
    setSelectedSection6Item(null)
  }

  const handleDeleteSection6SubSection = async (id: string) => {
    const updated = section6SubSections.filter((s) => s.id !== id)
    try {
      const response = await saveContent(section1, section2, section3, section4, section5Title, section5Content, section6Title, updated)
      toast.success(response.message)
      setSection6SubSections(updated)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete sub-section')
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
          <h1 className="text-2xl font-semibold">Diamond Education</h1>
          <p className="text-sm text-muted-foreground">
            Manage the diamond education guide content
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

      {/* Page Title */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Page Title</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="de_title">Title</Label>
            <Input
              id="de_title"
              placeholder="Enter page title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 1 — Image Gallery */}
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
                <div key={item.id} className="relative group rounded-lg border overflow-hidden">
                  <img
                    src={getCdnUrl(item.image_url)}
                    alt={item.image_alt_text || 'Section 1 image'}
                    className="h-24 w-full object-cover"
                  />
                  <div className="p-2 text-xs">
                    <span>Rank: {item.rank}</span>
                  </div>
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-6 w-6" onClick={() => { setSelectedSection1Item(item); setIsSection1EditOpen(true) }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-6 w-6" onClick={() => handleDeleteSection1Item(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2 — Text Items */}
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
                <div key={item.id} className="flex items-center justify-between rounded-md border px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description.slice(0, 2).join(', ')}
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-2 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setSelectedSection2Item(item); setIsSection2EditOpen(true) }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteSection2Item(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3 — Text Items (new) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Section 3 — Text Items</CardTitle>
            <Button size="sm" onClick={() => setIsSection3AddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {section3.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No items yet. Click &quot;Add Item&quot; to create one.
            </p>
          ) : (
            <div className="space-y-2">
              {section3.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description.slice(0, 2).join(', ')}
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-2 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setSelectedSection3Item(item); setIsSection3EditOpen(true) }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteSection3Item(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 4 — Feature Image (was section 3) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Section 4 — Feature Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MediaPickerInput
            label="Image"
            value={section4.image_url || null}
            onChange={(path) => setSection4((prev) => ({ ...prev, image_url: path || '' }))}
            rootPath="cms/guide/diamond-education/section4"
          />
          <MediaPickerInput
            label="Mobile Image"
            value={section4.mobile_image_url || null}
            onChange={(path) => setSection4((prev) => ({ ...prev, mobile_image_url: path || '' }))}
            rootPath="cms/guide/diamond-education/section4/mobile"
          />
          <div className="space-y-2">
            <Label htmlFor="s4_image_alt_text">Image Alt Text</Label>
            <Input
              id="s4_image_alt_text"
              placeholder="Describe the image"
              value={section4.image_alt_text}
              onChange={(e) => setSection4((prev) => ({ ...prev, image_alt_text: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s4_redirect_url">Redirect URL</Label>
            <Input
              id="s4_redirect_url"
              placeholder="https://example.com/page"
              value={section4.redirect_url || ''}
              onChange={(e) => setSection4((prev) => ({ ...prev, redirect_url: e.target.value || undefined }))}
            />
            <p className="text-xs text-muted-foreground">
              Full URL with https (e.g., https://example.com/page)
            </p>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Section 4 is saved by the global &quot;Save Changes&quot; button above.
          </p>
        </CardContent>
      </Card>

      {/* Section 5 — Rich Content (was section 4) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Section 5 — Rich Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="s5_title">Section Title</Label>
            <Input
              id="s5_title"
              placeholder="Enter section 5 title"
              value={section5Title}
              onChange={(e) => setSection5Title(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor
              value={section5Content}
              onChange={setSection5Content}
              placeholder="Write the section 5 content here..."
              mediaRootPath="cms/guide/diamond-education/section5"
            />
          </div>
          <p className="text-xs text-muted-foreground italic">
            Section 5 is saved by the global &quot;Save Changes&quot; button above.
          </p>
        </CardContent>
      </Card>

      {/* Section 6 — Detailed Sub-sections (was section 5) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Section 6 — Detailed Sub-sections</CardTitle>
            <Button size="sm" onClick={() => setIsSection6AddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Sub-section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="s6_title">Section Title</Label>
            <Input
              id="s6_title"
              placeholder="Enter section 6 title"
              value={section6Title}
              onChange={(e) => setSection6Title(e.target.value)}
            />
            <p className="text-xs text-muted-foreground italic">
              Section 6 title is saved by the global &quot;Save Changes&quot; button above.
            </p>
          </div>

          {section6SubSections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sub-sections yet. Click &quot;Add Sub-section&quot; to create one.
            </p>
          ) : (
            <div className="space-y-2">
              {section6SubSections.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between rounded-md border px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{sub.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {sub.description.slice(0, 2).join(', ')}
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-2 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setSelectedSection6Item(sub); setIsSection6EditOpen(true) }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteSection6SubSection(sub.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 1 Drawers */}
      <Section1Drawer
        open={isSection1AddOpen}
        onOpenChange={setIsSection1AddOpen}
        item={null}
        onSave={async (item) => { await handleAddSection1Item(item as Omit<DiamondEducationSection1Item, 'id'>) }}
      />
      <Section1Drawer
        open={isSection1EditOpen}
        onOpenChange={(open) => { setIsSection1EditOpen(open); if (!open) setSelectedSection1Item(null) }}
        item={selectedSection1Item}
        onSave={async (item) => { await handleEditSection1Item(item as DiamondEducationSection1Item) }}
      />

      {/* Section 2 Drawers */}
      <Section2Drawer
        open={isSection2AddOpen}
        onOpenChange={setIsSection2AddOpen}
        item={null}
        onSave={async (item) => { await handleAddSection2Item(item as Omit<DiamondEducationSection2Item, 'id'>) }}
      />
      <Section2Drawer
        open={isSection2EditOpen}
        onOpenChange={(open) => { setIsSection2EditOpen(open); if (!open) setSelectedSection2Item(null) }}
        item={selectedSection2Item}
        onSave={async (item) => { await handleEditSection2Item(item as DiamondEducationSection2Item) }}
      />

      {/* Section 3 Drawers — reuses Section2Drawer (same structure) */}
      <Section2Drawer
        open={isSection3AddOpen}
        onOpenChange={setIsSection3AddOpen}
        item={null}
        onSave={async (item) => { await handleAddSection3Item(item as Omit<DiamondEducationSection3Item, 'id'>) }}
      />
      <Section2Drawer
        open={isSection3EditOpen}
        onOpenChange={(open) => { setIsSection3EditOpen(open); if (!open) setSelectedSection3Item(null) }}
        item={selectedSection3Item}
        onSave={async (item) => { await handleEditSection3Item(item as DiamondEducationSection3Item) }}
      />

      {/* Section 6 Drawers */}
      <Section5SubSectionDrawer
        open={isSection6AddOpen}
        onOpenChange={setIsSection6AddOpen}
        item={null}
        onSave={async (item) => { await handleAddSection6SubSection(item as Omit<DiamondEducationSection6SubSection, 'id'>) }}
      />
      <Section5SubSectionDrawer
        open={isSection6EditOpen}
        onOpenChange={(open) => { setIsSection6EditOpen(open); if (!open) setSelectedSection6Item(null) }}
        item={selectedSection6Item}
        onSave={async (item) => { await handleEditSection6SubSection(item as DiamondEducationSection6SubSection) }}
      />
    </div>
  )
}
