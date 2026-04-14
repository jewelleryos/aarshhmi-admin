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
  type MetalGuideSection3Item,
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

  // Section 3 — Types of Metal We Offer
  const [section3, setSection3] = useState<MetalGuideSection3Item[]>([])

  // Section 4 — Purity of Gold
  const [section4Title, setSection4Title] = useState('')
  const [section4Description, setSection4Description] = useState<string[]>([''])
  const [section4Content, setSection4Content] = useState('')

  // Section 5 — Text Items
  const [section5Title, setSection5Title] = useState('')
  const [section5Description, setSection5Description] = useState<string[]>([''])

  // Section 6 — Metal Table
  const [section6Title, setSection6Title] = useState('')
  const [section6Content, setSection6Content] = useState('')

  // Section 7 — Text Items
  const [section7Title, setSection7Title] = useState('')
  const [section7Description, setSection7Description] = useState<string[]>([''])

  // Section 1 drawer states
  const [isSection1AddOpen, setIsSection1AddOpen] = useState(false)
  const [isSection1EditOpen, setIsSection1EditOpen] = useState(false)
  const [selectedSection1Item, setSelectedSection1Item] = useState<MetalGuideSection1Item | null>(null)

  // Section 2 drawer states
  const [isSection2AddOpen, setIsSection2AddOpen] = useState(false)
  const [isSection2EditOpen, setIsSection2EditOpen] = useState(false)
  const [selectedSection2Item, setSelectedSection2Item] = useState<MetalGuideSection2Item | null>(null)

  // Section 3 sub-section drawer states
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
  const [isSubSectionAddOpen, setIsSubSectionAddOpen] = useState(false)
  const [isSubSectionEditOpen, setIsSubSectionEditOpen] = useState(false)
  const [selectedSubSectionItem, setSelectedSubSectionItem] = useState<MetalGuideSubSectionItem | null>(null)

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
        setSection3(content.section3 || [])
        setSection4Title(content.section4?.title || '')
        setSection4Description(
          content.section4?.description?.length ? content.section4.description : ['']
        )
        setSection4Content(content.section4?.content || '')
        setSection5Title(content.section5?.title || '')
        setSection5Description(
          content.section5?.description?.length ? content.section5.description : ['']
        )
        setSection6Title(content.section6?.title || '')
        setSection6Content(content.section6?.content || '')
        setSection7Title(content.section7?.title || '')
        setSection7Description(
          content.section7?.description?.length ? content.section7.description : ['']
        )
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to fetch metal guide content')
    } finally {
      setIsLoading(false)
    }
  }

  const saveAll = async (
    s1 = section1,
    s2 = section2,
    s3 = section3
  ) => {
    return cmsService.updateMetalGuide({
      title,
      section1: s1,
      section2: s2,
      section3: s3,
      section4: {
        title: section4Title,
        description: section4Description.filter((l) => l.trim() !== ''),
        content: section4Content,
      },
      section5: {
        title: section5Title,
        description: section5Description.filter((l) => l.trim() !== ''),
      },
      section6: { title: section6Title, content: section6Content },
      section7: {
        title: section7Title,
        description: section7Description.filter((l) => l.trim() !== ''),
      },
    })
  }

  const handleSaveDetails = async () => {
    setIsSaving(true)
    try {
      const response = await saveAll()
      toast.success(response.message)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to save content')
    } finally {
      setIsSaving(false)
    }
  }

  // ── Section 1 CRUD ────────────────────────────────────────────────────────
  const handleAddSection1Item = async (item: Omit<MetalGuideSection1Item, 'id'>) => {
    const newItem: MetalGuideSection1Item = { ...item, id: `s1_${Date.now()}` }
    const updated = [...section1, newItem]
    const response = await saveAll(updated)
    toast.success(response.message)
    setSection1(updated)
    setIsSection1AddOpen(false)
  }

  const handleEditSection1Item = async (item: MetalGuideSection1Item) => {
    const updated = section1.map((s) => (s.id === item.id ? item : s))
    const response = await saveAll(updated)
    toast.success(response.message)
    setSection1(updated)
    setIsSection1EditOpen(false)
    setSelectedSection1Item(null)
  }

  const handleDeleteSection1Item = async (id: string) => {
    const updated = section1.filter((s) => s.id !== id)
    try {
      const response = await saveAll(updated)
      toast.success(response.message)
      setSection1(updated)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete item')
    }
  }

  // ── Section 2 CRUD ────────────────────────────────────────────────────────
  const handleAddSection2Item = async (item: Omit<MetalGuideSection2Item, 'id'>) => {
    const newItem: MetalGuideSection2Item = { ...item, id: `s2_${Date.now()}` }
    const updated = [...section2, newItem]
    const response = await saveAll(section1, updated)
    toast.success(response.message)
    setSection2(updated)
    setIsSection2AddOpen(false)
  }

  const handleEditSection2Item = async (item: MetalGuideSection2Item) => {
    const updated = section2.map((s) => (s.id === item.id ? item : s))
    const response = await saveAll(section1, updated)
    toast.success(response.message)
    setSection2(updated)
    setIsSection2EditOpen(false)
    setSelectedSection2Item(null)
  }

  const handleDeleteSection2Item = async (id: string) => {
    const updated = section2.filter((s) => s.id !== id)
    try {
      const response = await saveAll(section1, updated)
      toast.success(response.message)
      setSection2(updated)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete item')
    }
  }

  // ── Section 3 group CRUD ──────────────────────────────────────────────────
  const handleAddGroup = () => {
    const newGroup: MetalGuideSection3Item = {
      id: `s3g_${Date.now()}`,
      title: '',
      sub_sections: [],
    }
    setSection3((prev) => [...prev, newGroup])
  }

  const handleRemoveGroup = async (groupId: string) => {
    const updated = section3.filter((g) => g.id !== groupId)
    try {
      const response = await saveAll(section1, section2, updated)
      toast.success(response.message)
      setSection3(updated)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to delete group')
    }
  }

  const handleGroupTitleChange = (groupId: string, value: string) => {
    setSection3((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, title: value } : g))
    )
  }

  // ── Section 3 sub-section CRUD ────────────────────────────────────────────
  const openSubSectionAdd = (groupId: string) => {
    setActiveGroupId(groupId)
    setIsSubSectionAddOpen(true)
  }

  const openSubSectionEdit = (groupId: string, sub: MetalGuideSubSectionItem) => {
    setActiveGroupId(groupId)
    setSelectedSubSectionItem(sub)
    setIsSubSectionEditOpen(true)
  }

  const handleAddSubSection = async (item: Omit<MetalGuideSubSectionItem, 'id'>) => {
    if (!activeGroupId) return
    const newSub: MetalGuideSubSectionItem = { ...item, id: `s3sub_${Date.now()}` }
    const updated = section3.map((g) =>
      g.id === activeGroupId
        ? { ...g, sub_sections: [...g.sub_sections, newSub] }
        : g
    )
    const response = await saveAll(section1, section2, updated)
    toast.success(response.message)
    setSection3(updated)
    setIsSubSectionAddOpen(false)
    setActiveGroupId(null)
  }

  const handleEditSubSection = async (item: MetalGuideSubSectionItem) => {
    if (!activeGroupId) return
    const updated = section3.map((g) =>
      g.id === activeGroupId
        ? { ...g, sub_sections: g.sub_sections.map((s) => (s.id === item.id ? item : s)) }
        : g
    )
    const response = await saveAll(section1, section2, updated)
    toast.success(response.message)
    setSection3(updated)
    setIsSubSectionEditOpen(false)
    setSelectedSubSectionItem(null)
    setActiveGroupId(null)
  }

  const handleDeleteSubSection = async (groupId: string, subId: string) => {
    const updated = section3.map((g) =>
      g.id === groupId
        ? { ...g, sub_sections: g.sub_sections.filter((s) => s.id !== subId) }
        : g
    )
    try {
      const response = await saveAll(section1, section2, updated)
      toast.success(response.message)
      setSection3(updated)
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
          <h1 className="text-2xl font-semibold">Metal Guide</h1>
          <p className="text-sm text-muted-foreground">Manage the metal guide content</p>
        </div>
        <Button onClick={handleSaveDetails} disabled={isSaving}>
          {isSaving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" />Save Changes</>
          )}
        </Button>
      </div>

      {/* Page Title */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Page Title</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-6 w-6"
                      onClick={() => { setSelectedSection1Item(item); setIsSection1EditOpen(true) }}
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
                      {item.description.replace(/<[^>]+>/g, ' ').trim().slice(0, 80)}
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-2 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => { setSelectedSection2Item(item); setIsSection2EditOpen(true) }}
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

      {/* Section 3 — Types of Metal We Offer */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Section 3 — Types of Metal We Offer</CardTitle>
            <Button size="sm" onClick={handleAddGroup}>
              <Plus className="mr-2 h-4 w-4" />
              Add Group
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {section3.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No groups yet. Click &quot;Add Group&quot; to create one.
            </p>
          ) : (
            section3.map((group, groupIndex) => (
              <div key={group.id} className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={`s3g_title_${group.id}`}>
                      Group {groupIndex + 1} Title
                    </Label>
                    <Input
                      id={`s3g_title_${group.id}`}
                      placeholder="Enter group title"
                      value={group.title}
                      onChange={(e) => handleGroupTitleChange(group.id, e.target.value)}
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-destructive hover:text-destructive mt-6 shrink-0"
                    onClick={() => handleRemoveGroup(group.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {group.sub_sections.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sub-sections yet.</p>
                ) : (
                  <div className="space-y-2">
                    {group.sub_sections.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between rounded-md border px-4 py-3 bg-muted/30"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{sub.title}</p>
                          {sub.description && (
                            <p
                              className="text-xs text-muted-foreground truncate max-w-sm"
                              dangerouslySetInnerHTML={{
                                __html: sub.description.replace(/<[^>]+>/g, ' ').trim().slice(0, 80),
                              }}
                            />
                          )}
                        </div>
                        <div className="ml-3 flex items-center gap-2 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => openSubSectionEdit(group.id, sub)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteSubSection(group.id, sub.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button size="sm" variant="outline" onClick={() => openSubSectionAdd(group.id)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Sub-section
                </Button>
              </div>
            ))
          )}
          {section3.length > 0 && (
            <p className="text-xs text-muted-foreground italic">
              Group titles are saved by the global &quot;Save Changes&quot; button above.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section 4 — Purity of Gold */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Section 4 — Purity of Gold</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="s4_title">Title</Label>
            <Input
              id="s4_title"
              placeholder="Enter section 4 title"
              value={section4Title}
              onChange={(e) => setSection4Title(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Description Lines</Label>
            <div className="space-y-2">
              {section4Description.map((line, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Line ${index + 1}`}
                    value={line}
                    onChange={(e) =>
                      setSection4Description((prev) =>
                        prev.map((l, i) => (i === index ? e.target.value : l))
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                    onClick={() =>
                      setSection4Description((prev) => prev.filter((_, i) => i !== index))
                    }
                    disabled={section4Description.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSection4Description((prev) => [...prev, ''])}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Line
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor
              value={section4Content}
              onChange={setSection4Content}
              placeholder="Write the section 4 content here..."
              mediaRootPath="cms/guide/metal-guide/section4"
            />
          </div>

          <p className="text-xs text-muted-foreground italic">
            Section 4 is saved by the global &quot;Save Changes&quot; button above.
          </p>
        </CardContent>
      </Card>

      {/* Section 5 — Text Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Section 5 — Text Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="s5_title">Title</Label>
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

          <p className="text-xs text-muted-foreground italic">
            Section 5 is saved by the global &quot;Save Changes&quot; button above.
          </p>
        </CardContent>
      </Card>

      {/* Section 6 — Metal Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Section 6 — Metal Table</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="s6_title">Title</Label>
            <Input
              id="s6_title"
              placeholder="Enter section 6 title"
              value={section6Title}
              onChange={(e) => setSection6Title(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor
              value={section6Content}
              onChange={setSection6Content}
              placeholder="Write the section 6 content here..."
              mediaRootPath="cms/guide/metal-guide/section6"
            />
          </div>

          <p className="text-xs text-muted-foreground italic">
            Section 6 is saved by the global &quot;Save Changes&quot; button above.
          </p>
        </CardContent>
      </Card>

      {/* Section 7 — Text Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Section 7 — Text Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="s7_title">Title</Label>
            <Input
              id="s7_title"
              placeholder="Enter section 7 title"
              value={section7Title}
              onChange={(e) => setSection7Title(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Description Lines</Label>
            <div className="space-y-2">
              {section7Description.map((line, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Line ${index + 1}`}
                    value={line}
                    onChange={(e) =>
                      setSection7Description((prev) =>
                        prev.map((l, i) => (i === index ? e.target.value : l))
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                    onClick={() =>
                      setSection7Description((prev) => prev.filter((_, i) => i !== index))
                    }
                    disabled={section7Description.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSection7Description((prev) => [...prev, ''])}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Line
            </Button>
          </div>

          <p className="text-xs text-muted-foreground italic">
            Section 7 is saved by the global &quot;Save Changes&quot; button above.
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

      {/* Section 3 Sub-section Add Drawer */}
      <SubSectionDrawer
        open={isSubSectionAddOpen}
        onOpenChange={(open) => {
          setIsSubSectionAddOpen(open)
          if (!open) setActiveGroupId(null)
        }}
        item={null}
        sectionLabel="section 3"
        onSave={async (item) => {
          await handleAddSubSection(item as Omit<MetalGuideSubSectionItem, 'id'>)
        }}
      />

      {/* Section 3 Sub-section Edit Drawer */}
      <SubSectionDrawer
        open={isSubSectionEditOpen}
        onOpenChange={(open) => {
          setIsSubSectionEditOpen(open)
          if (!open) {
            setSelectedSubSectionItem(null)
            setActiveGroupId(null)
          }
        }}
        item={selectedSubSectionItem}
        sectionLabel="section 3"
        onSave={async (item) => {
          await handleEditSubSection(item as MetalGuideSubSectionItem)
        }}
      />
    </div>
  )
}
