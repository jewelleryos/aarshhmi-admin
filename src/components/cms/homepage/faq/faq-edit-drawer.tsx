'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { HelpCircle, Loader2 } from 'lucide-react'
import type { FAQItem } from '@/redux/services/cmsService'

interface FAQEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: FAQItem | null
  onSave: (item: FAQItem) => Promise<void>
}

export function FAQEditDrawer({
  open,
  onOpenChange,
  item,
  onSave,
}: FAQEditDrawerProps) {
  // Form state
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [rank, setRank] = useState(0)
  const [status, setStatus] = useState(true)

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ question?: string; answer?: string }>({})

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setQuestion(item.question)
      setAnswer(item.answer)
      setRank(item.rank)
      setStatus(item.status)
    }
  }, [item])

  // Reset form
  const resetForm = () => {
    setQuestion('')
    setAnswer('')
    setRank(0)
    setStatus(true)
    setErrors({})
  }

  // Handle drawer close
  const handleOpenChange = (isOpen: boolean) => {
    if (isLoading) return
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!item) return

    // Validate
    const newErrors: { question?: string; answer?: string } = {}
    if (!question.trim()) {
      newErrors.question = 'Question is required'
    }
    if (!answer.trim()) {
      newErrors.answer = 'Answer is required'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      await onSave({
        id: item.id,
        question: question.trim(),
        answer: answer.trim(),
        rank,
        status,
      })
      resetForm()
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
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Edit FAQ</SheetTitle>
              <p className="text-sm text-muted-foreground">
                Update the FAQ item
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Question Field */}
          <div className="space-y-2">
            <Label htmlFor="question">
              Question <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="question"
              placeholder="Enter your question"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value)
                if (e.target.value.trim()) setErrors((prev) => ({ ...prev, question: undefined }))
              }}
              rows={3}
            />
            {errors.question && (
              <p className="text-sm text-destructive">{errors.question}</p>
            )}
          </div>

          {/* Answer Field */}
          <div className="space-y-2">
            <Label htmlFor="answer">
              Answer <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="answer"
              placeholder="Enter the answer"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value)
                if (e.target.value.trim()) setErrors((prev) => ({ ...prev, answer: undefined }))
              }}
              rows={5}
            />
            {errors.answer && (
              <p className="text-sm text-destructive">{errors.answer}</p>
            )}
          </div>

          {/* Rank Field */}
          <div className="space-y-2">
            <Label htmlFor="rank">Display Order</Label>
            <Input
              id="rank"
              type="number"
              min={0}
              placeholder="0"
              value={rank}
              onChange={(e) => setRank(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers display first
            </p>
          </div>

          {/* Status Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="status"
              checked={status}
              onCheckedChange={(checked) => setStatus(checked === true)}
            />
            <Label htmlFor="status" className="cursor-pointer">
              Active
            </Label>
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
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
