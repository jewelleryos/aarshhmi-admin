# Media Module for Add Product - Planning Document

## Overview

The media module allows users to add images and videos for each selected metal color. Each color will have its own media collection with position ordering, enabling different product images/videos per color variant.

## Requirements

### Core Functionality
1. Media is organized **by metal color** (Yellow Gold, White Gold, Rose Gold, etc.)
2. Only show media sections for colors that are selected in Metal Details
3. Each color section allows:
   - Adding multiple images and videos
   - Setting alt text for each media item
   - Setting position (1, 2, 3, etc.) for ordering
   - Removing media items
4. Use existing `MediaPickerModal` component for browsing and selecting media
5. Default root path: `/products`
6. Allowed file types: Images (jpg, jpeg, png, gif, webp) and Videos (mp4)

### UI Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ Media                                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Yellow Gold                                                 │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │                                                             │ │
│ │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│ │  │   [IMG]     │  │   [IMG]     │  │   [VID]     │         │ │
│ │  │             │  │             │  │   ▶         │         │ │
│ │  │     [x]     │  │     [x]     │  │     [x]     │         │ │
│ │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│ │  Pos: [1]         Pos: [2]         Pos: [3]                │ │
│ │  Alt: [Ring front] Alt: [Ring side] Alt: [Video demo]      │ │
│ │                                                             │ │
│ │  [+ Add Media]                                             │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ White Gold                                                  │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │                                                             │ │
│ │  [+ Add Media]                                             │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Media Item Structure

```typescript
interface MediaItem {
  id: string              // Unique identifier for this media entry
  path: string            // Path from media library (e.g., "/product/ring-1.jpg")
  type: 'image' | 'video'
  altText: string         // Alt text for SEO/accessibility
  position: number        // Position for ordering (1, 2, 3, etc.)
}

interface ColorMedia {
  colorId: string         // Metal color ID
  colorName: string       // Metal color name (for display)
  items: MediaItem[]      // List of media items for this color
}

// State structure in jewellery-default-content.tsx
interface MediaDetailsData {
  colorMedia: ColorMedia[]
}
```

## Existing Components to Use

### 1. `MediaPickerModal` (admin/src/components/media/media-picker-modal.tsx)
- Modal for browsing and selecting media from media library
- Props:
  - `open: boolean` - Controls modal visibility
  - `onOpenChange: (open: boolean) => void` - Toggle callback
  - `rootPath: string` - Root folder path (we'll use `/products`)
  - `onSelect: (path: string) => void` - Callback when file is selected
  - `accept?: string[]` - Allowed file extensions

### 2. `getCdnUrl` (admin/src/utils/cdn.ts)
- Converts media path to full CDN URL for display

## Files to Create

### 1. `admin/src/components/add-product/jewellery-default/media-section.tsx`

Main media section component that:
- Receives selected colors from metal details
- Shows a card/box for each selected color
- Manages media state for each color
- Shows message when no colors are selected

**Props:**
```typescript
interface MediaSectionProps {
  data: MediaDetailsData
  selectedColors: { colorId: string; colorName: string }[]
  onChange: (data: MediaDetailsData) => void
}
```

### 2. `admin/src/components/add-product/jewellery-default/media-color-card.tsx`

Individual color media card component that:
- Displays media items for a specific color in a grid
- Shows "Add Media" button to open media picker
- Handles position and alt text inputs for each item
- Shows remove button for each item

**Props:**
```typescript
interface MediaColorCardProps {
  colorId: string
  colorName: string
  items: MediaItem[]
  onAddMedia: () => void
  onRemoveMedia: (mediaItemId: string) => void
  onUpdatePosition: (mediaItemId: string, position: number) => void
  onUpdateAltText: (mediaItemId: string, altText: string) => void
}
```

### 3. `admin/src/components/add-product/jewellery-default/media-item-card.tsx`

Individual media item display component that:
- Shows image thumbnail or video preview (with play icon overlay)
- Shows position input field (number)
- Shows alt text input field
- Shows remove button (X icon)

**Props:**
```typescript
interface MediaItemCardProps {
  item: MediaItem
  onRemove: () => void
  onUpdatePosition: (position: number) => void
  onUpdateAltText: (altText: string) => void
}
```

## Files to Modify

### 1. `admin/src/components/add-product/jewellery-default/jewellery-default-content.tsx`

**Changes:**
- Add `mediaDetails` state with initial value
- Add `initialMediaDetails` constant
- Extract unique colors from `metalDetails.selectedMetals`
- Update `renderTabContent()` to render `MediaSection` for "media" tab
- Pass selected colors and media state to `MediaSection`
- Add media validation in `isSectionValid()` (optional - media might not be required)

**New State:**
```typescript
const initialMediaDetails = {
  colorMedia: [] as ColorMedia[],
}

// In component:
const [mediaDetails, setMediaDetails] = useState(initialMediaDetails)

// Extract selected colors from metal details (unique colors across all metals)
const selectedColors = useMemo(() => {
  const colorIds = new Set<string>()
  const colors: { colorId: string; colorName: string }[] = []

  metalDetails.selectedMetals.forEach((metal) => {
    metal.colorIds.forEach((colorId) => {
      if (!colorIds.has(colorId)) {
        colorIds.add(colorId)
        const color = metalColors.find((c) => c.id === colorId)
        if (color) {
          colors.push({ colorId: color.id, colorName: color.name })
        }
      }
    })
  })

  return colors
}, [metalDetails, metalColors])
```

**Updated Tab Rendering:**
```typescript
case "media":
  return (
    <MediaSection
      data={mediaDetails}
      selectedColors={selectedColors}
      onChange={setMediaDetails}
    />
  )
```

## Implementation Steps

### Phase 1: Basic Structure
1. [ ] Create `media-section.tsx` with basic layout
2. [ ] Create `media-color-card.tsx` component
3. [ ] Create `media-item-card.tsx` component
4. [ ] Add media state to `jewellery-default-content.tsx`
5. [ ] Update "media" tab to render `MediaSection`

### Phase 2: Media Selection Integration
6. [ ] Integrate `MediaPickerModal` in media-color-card
7. [ ] Configure rootPath as `/products`
8. [ ] Configure accept as `["jpg", "jpeg", "png", "gif", "webp", "mp4"]`
9. [ ] Handle media selection callback

### Phase 3: Media Item Features
10. [ ] Implement image thumbnail display using `getCdnUrl`
11. [ ] Implement video preview with play icon overlay
12. [ ] Add position input field (number input)
13. [ ] Add alt text input field
14. [ ] Add remove functionality

### Phase 4: Polish
15. [ ] Add empty state when no colors selected
16. [ ] Ensure positions are unique per color
17. [ ] Auto-assign next position when adding new media
18. [ ] Test with various scenarios

## Configuration Constants

```typescript
// Media root path for product images
const PRODUCT_MEDIA_ROOT_PATH = "/products"

// Allowed file extensions
const ALLOWED_MEDIA_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "mp4"]

// Image extensions (for thumbnail detection)
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"]

// Video extensions (for play icon overlay)
const VIDEO_EXTENSIONS = ["mp4"]
```

## Helper Functions

```typescript
// Determine if file is image or video based on extension
function getMediaType(path: string): 'image' | 'video' {
  const ext = path.split('.').pop()?.toLowerCase() || ''
  if (VIDEO_EXTENSIONS.includes(ext)) return 'video'
  return 'image'
}

// Generate next position for new media item
function getNextPosition(items: MediaItem[]): number {
  if (items.length === 0) return 1
  return Math.max(...items.map(item => item.position)) + 1
}

// Generate unique ID for media item
function generateMediaItemId(): string {
  return Math.random().toString(36).substring(2, 9)
}
```

## Edge Cases to Handle

1. **No colors selected**: Show message "Please select metal colors in Metal Details tab first"
2. **Color deselected in Metal Details**: Keep media entries (don't delete) - user can re-add color
3. **Duplicate position**: Allow but show warning, or auto-reorder
4. **Empty alt text**: Allow (optional field) but maybe show subtle indicator
5. **Large images**: Use CDN URL which should handle optimization

## Notes

- Each color can have unlimited media items
- Alt text is optional but recommended for SEO
- Position determines display order (1 = first, 2 = second, etc.)
- First position (1) is considered the "primary" image for that color
- Videos show a play icon overlay on thumbnail
- Media picker opens to `/products` folder by default
