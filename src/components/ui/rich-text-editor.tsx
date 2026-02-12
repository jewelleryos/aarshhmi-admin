'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
} from 'lucide-react'
import { MediaPickerModal } from '@/components/media/media-picker-modal'
import { getCdnUrl } from '@/utils/cdn'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  className?: string
  mediaRootPath?: string // Root path for media picker (default: 'cms/content')
}

// Toolbar button component
function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  tooltip,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  tooltip: string
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={isActive ? 'secondary' : 'ghost'}
          size="icon-sm"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            'h-8 w-8',
            isActive && 'bg-muted'
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  disabled = false,
  error,
  className,
  mediaRootPath = 'cms/content',
}: RichTextEditorProps) {
  // Link dialog state
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  // Image picker state
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)

  // Initialize editor
  const editor = useEditor({
    immediatelyRender: false, // Prevent SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3,4,5,6],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-md my-4',
        },
      }),
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: cn(
          'min-h-[400px]',
          'prose prose-sm max-w-none focus:outline-none min-h-[500px] max-h-[500px] overflow-y-auto px-4 py-3',
          'prose-headings:font-semibold prose-headings:text-foreground',
          'prose-h1:text-3xl prose-h1:mt-6 prose-h1:mb-4',
          'prose-h2:text-2xl prose-h2:mt-5 prose-h2:mb-3',
          'prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2',
          'prose-p:text-foreground prose-p:leading-relaxed',
          'prose-a:text-primary prose-a:underline',
          'prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground prose-blockquote:pl-4 prose-blockquote:italic',
          'prose-ul:list-disc prose-ol:list-decimal',
          'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
          'prose-hr:border-border'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  // Update editable state when disabled prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  // Link handlers
  const openLinkDialog = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href || ''
    setLinkUrl(previousUrl)
    setIsLinkDialogOpen(true)
  }, [editor])

  const setLink = useCallback(() => {
    if (!editor) return

    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run()
    }

    setIsLinkDialogOpen(false)
    setLinkUrl('')
  }, [editor, linkUrl])

  const removeLink = useCallback(() => {
    if (!editor) return
    editor.chain().focus().unsetLink().run()
  }, [editor])

  // Image handler
  const handleImageSelect = useCallback(
    (path: string) => {
      if (!editor) return
      const imageUrl = getCdnUrl(path)
      if (imageUrl) {
        editor.chain().focus().setImage({ src: imageUrl }).run()
      }
      setIsImagePickerOpen(false)
    },
    [editor]
  )

  if (!editor) {
    return null
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'rounded-md border bg-white',
          error && 'border-destructive',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5 bg-muted/30">
          {/* Text formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            disabled={disabled}
            tooltip="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            disabled={disabled}
            tooltip="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            disabled={disabled}
            tooltip="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            disabled={disabled}
            tooltip="Inline Code"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            disabled={disabled}
            tooltip="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            disabled={disabled}
            tooltip="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            disabled={disabled}
            tooltip="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            disabled={disabled}
            tooltip="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            disabled={disabled}
            tooltip="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Blockquote & Horizontal Rule */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            disabled={disabled}
            tooltip="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            disabled={disabled}
            tooltip="Horizontal Rule"
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Link */}
          <ToolbarButton
            onClick={openLinkDialog}
            isActive={editor.isActive('link')}
            disabled={disabled}
            tooltip="Add Link"
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
          {editor.isActive('link') && (
            <ToolbarButton
              onClick={removeLink}
              disabled={disabled}
              tooltip="Remove Link"
            >
              <Unlink className="h-4 w-4" />
            </ToolbarButton>
          )}

          {/* Image */}
          <ToolbarButton
            onClick={() => setIsImagePickerOpen(true)}
            disabled={disabled}
            tooltip="Add Image"
          >
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>

          <div className="flex-1" />

          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={disabled || !editor.can().undo()}
            tooltip="Undo"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={disabled || !editor.can().redo()}
            tooltip="Redo"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Editor content */}
        <EditorContent
          editor={editor}
          className={cn(
            'focus-within:ring-ring/50 focus-within:ring-[3px] rounded-b-md transition-shadow',
            disabled && 'pointer-events-none'
          )}
        />

        {/* Link Dialog */}
        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      setLink()
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={setLink}>
                {linkUrl ? 'Save Link' : 'Remove Link'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Picker Modal */}
        <MediaPickerModal
          open={isImagePickerOpen}
          onOpenChange={setIsImagePickerOpen}
          rootPath={mediaRootPath}
          onSelect={handleImageSelect}
          accept={['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive mt-2 pl-1.25">{error}</p>
      )}
    </TooltipProvider>
  )
}
